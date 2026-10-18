"""Datos del hito 6 (diapositivas 51–61, modelos ocultos de Markov con el clima oculto) → src/data/.

- hmm_clima.json           Lo que la página no puede calcular: el diario simulado (sus primeras 5 filas, tal como
                           llegan, y los 1 000 días de prueba), Baum-Welch de hmmlearn con 10 arranques y el λ aprendido.
                           Va para el clima del libro (`base`) y para un clima persistente (a_ii = 0.95) de contraste.
- referencias_hito6.json   Lo que calculan numpy y hmmlearn, para comparar src/lib/hmm.ts (solo lo lee
                           scripts/verificar.ts; no entra a la página).

Protocolo: con la semilla 42 se simulan 10 000 días para aprender y, a continuación, 1 000 días aparte para probar
(sin barajar: el orden importa, diapositiva 30). q₁ ~ π, q_t ~ A[q_{t−1}], o_t ~ B[q_t]. Baum-Welch: 10 arranques
(random_state 0–9), tolerancia 1e-6 sobre ln P total, hasta 1 000 iteraciones; se guarda la historia completa con un
monitor propio. Se exige que ninguna historia baje y que una implementación propia en numpy, desde el mismo λ inicial,
llegue al mismo valor. El λ aprendido se empareja con el real (los estados salen sin nombre).

Uso:  .venv/Scripts/python scripts/exportar_hito6.py      (≈ 1–2 minutos; deja registro en scripts/cache/hito6.log)
"""

import itertools
import platform
import warnings

import hmmlearn
import numpy as np
from hmmlearn import hmm
from hmmlearn.base import ConvergenceMonitor

from adult_comun import CACHE, SEED
from exportar_hito1 import guardar

ESTADOS = ["Lluvioso", "Soleado"]
SIMBOLOS = ["caminar", "comprar", "limpiar"]
PI = np.array([0.6, 0.4])
A = np.array([[0.7, 0.3], [0.4, 0.6]])
B = np.array([[0.1, 0.4, 0.5], [0.6, 0.3, 0.1]])
A_PERSISTENTE = np.array([[0.95, 0.05], [0.05, 0.95]])
OBS_EJEMPLO = [0, 1, 2]
N_ENT, N_PRUEBA = 10_000, 1_000
ARRANQUES = range(10)
TOL, MAX_ITER = 1e-6, 1000
PUNTOS_HISTORIA = 150  # la historia se submuestrea para que el JSON no pese

REGISTRO = CACHE / "hito6.log"


def registrar(texto=""):
    print(texto)
    with REGISTRO.open("a", encoding="utf-8") as f:
        f.write(texto + "\n")


# ---------- Cálculos propios en numpy (independientes de hmmlearn) ----------


def forward(pi, A_, B_, obs):
    a = [pi * B_[:, obs[0]]]
    for o in obs[1:]:
        a.append((a[-1] @ A_) * B_[:, o])
    return np.array(a)


def backward(A_, B_, obs):
    b = [np.ones(len(A_))]
    for o in reversed(obs[1:]):
        b.insert(0, A_ @ (B_[:, o] * b[0]))
    return np.array(b)


def viterbi(pi, A_, B_, obs):
    d = [pi * B_[:, obs[0]]]
    psi = [[-1] * len(pi)]
    for o in obs[1:]:
        c = d[-1][:, None] * A_
        psi.append(c.argmax(0).tolist())
        d.append(c.max(0) * B_[:, o])
    q = [int(np.argmax(d[-1]))]
    for t in range(len(obs) - 1, 0, -1):
        q.insert(0, psi[t][q[0]])
    return np.array(d), psi, q


def conjunta(q, obs):
    pq = PI[q[0]]
    for t in range(1, len(q)):
        pq *= A[q[t - 1], q[t]]
    po = np.prod([B[q[t], obs[t]] for t in range(len(q))])
    return float(pq), float(po), float(pq * po)


def underflow_dia(pi, A_, B_, obs):
    """Primer día (contando desde 1) en que Forward sin escalar, en float64, da exactamente 0.
    Mismo orden de operaciones que lib/hmm.ts: [α(0)·a_0j + α(1)·a_1j]·b_j."""
    a = [pi[j] * B_[j, obs[0]] for j in range(2)]
    for t in range(1, len(obs)):
        a = [(a[0] * A_[0, j] + a[1] * A_[1, j]) * B_[j, obs[t]] for j in range(2)]
        if a[0] + a[1] == 0:
            return t + 1
    return None


def log_forward_escalado(pi, A_, B_, obs):
    a = pi * B_[:, obs[0]]
    s = a.sum()
    lp = np.log(s)
    a = a / s
    for o in obs[1:]:
        a = (a @ A_) * B_[:, o]
        s = a.sum()
        lp += np.log(s)
        a = a / s
    return float(lp)


def baum_welch_numpy(pi, A_, B_, obs, iteraciones):
    """Baum-Welch con escalado (Rabiner 1989), para comprobar a hmmlearn desde el mismo λ inicial."""
    obs = np.asarray(obs)
    T, N, M = len(obs), len(pi), B_.shape[1]
    historia = []
    for _ in range(iteraciones):
        al = np.empty((T, N))
        c = np.empty(T)
        al[0] = pi * B_[:, obs[0]]
        c[0] = al[0].sum()
        al[0] /= c[0]
        for t in range(1, T):
            al[t] = (al[t - 1] @ A_) * B_[:, obs[t]]
            c[t] = al[t].sum()
            al[t] /= c[t]
        historia.append(float(np.log(c).sum()))
        be = np.empty((T, N))
        be[-1] = 1
        for t in range(T - 2, -1, -1):
            be[t] = A_ @ (B_[:, obs[t + 1]] * be[t + 1]) / c[t + 1]
        gam = al * be
        xi = al[:-1, :, None] * A_[None] * (B_[:, obs[1:]].T * be[1:])[:, None, :] / c[1:, None, None]
        pi = gam[0] / gam[0].sum()
        A_ = xi.sum(0) / xi.sum(0).sum(1, keepdims=True)
        B_ = np.stack([gam[obs == k].sum(0) for k in range(M)], 1)
        B_ = B_ / B_.sum(1, keepdims=True)
    return historia, log_forward_escalado(pi, A_, B_, obs)


# ---------- hmmlearn ----------


class MonitorCompleto(ConvergenceMonitor):
    """El de hmmlearn solo guarda los dos últimos valores; este guarda todos."""

    def _reset(self):
        super()._reset()
        self.todo = []

    def report(self, logprob):
        self.todo.append(float(logprob))
        super().report(logprob)


def fijo(pi, A_, B_):
    m = hmm.CategoricalHMM(n_components=2, n_features=3, init_params="", params="")
    m.startprob_, m.transmat_, m.emissionprob_ = pi, A_, B_
    return m


def columna(obs):
    return np.asarray(obs).reshape(-1, 1)


def simular(A_, T, rng):
    q = np.empty(T, int)
    o = np.empty(T, int)
    q[0] = rng.choice(2, p=PI)
    o[0] = rng.choice(3, p=B[q[0]])
    for t in range(1, T):
        q[t] = rng.choice(2, p=A_[q[t - 1]])
        o[t] = rng.choice(3, p=B[q[t]])
    return q, o


def submuestrear(historia):
    """Todas las primeras 40 iteraciones y después puntos espaciados en escala logarítmica, más la última."""
    n = len(historia)
    idx = set(range(min(n, 40)))
    idx |= set(np.unique(np.geomspace(40, n, PUNTOS_HISTORIA - 40).astype(int) - 1).tolist())
    idx.add(n - 1)
    return [[i + 1, round(historia[i], 3)] for i in sorted(i for i in idx if 0 <= i < n)]


def cadena(v):
    return "".join(str(int(x)) for x in v)


def escenario(nombre, A_, rng):
    registrar(f"\n== Escenario {nombre}: A = {A_.tolist()}")
    qe, oe = simular(A_, N_ENT, rng)
    qp, op = simular(A_, N_PRUEBA, rng)
    Xe, Xp = columna(oe), columna(op)
    real = fijo(PI, A_, B)

    # Baum-Welch desde 10 arranques
    arranques = []
    for semilla in ARRANQUES:
        m = hmm.CategoricalHMM(n_components=2, n_features=3, n_iter=MAX_ITER, tol=TOL, random_state=semilla, init_params="ste")
        m._init(Xe, None)  # el mismo λ inicial que usaría fit(); se guarda para la comprobación con numpy
        inicial = (m.startprob_.copy(), m.transmat_.copy(), m.emissionprob_.copy())
        m.init_params = ""
        m.monitor_ = MonitorCompleto(m.tol, m.n_iter, False)
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            m.fit(Xe)
        h = m.monitor_.todo
        assert all(d >= -1e-8 for d in np.diff(h)), f"la verosimilitud bajó (semilla {semilla})"
        final = float(m.score(Xe))
        arranques.append({"semilla": semilla, "modelo": m, "inicial": inicial, "historia": h, "final": final})
        registrar(f"  arranque {semilla}: {len(h)} iteraciones, ln P final {final:.3f}")
    mejor = max(arranques, key=lambda r: r["final"])
    llegan = sum(r["final"] > mejor["final"] - 1 for r in arranques)

    # Comprobación con una implementación propia, desde el mismo λ inicial del mejor arranque
    h_np, final_np = baum_welch_numpy(*mejor["inicial"], oe, len(mejor["historia"]))
    dif_hist = float(np.max(np.abs(np.array(h_np) - np.array(mejor["historia"]))))
    dif_final = abs(final_np - mejor["final"])
    registrar(f"  numpy contra hmmlearn (arranque {mejor['semilla']}): historia {dif_hist:.2e}, final {dif_final:.2e}")
    if dif_final > 1e-6:
        registrar("  AVISO: la implementación propia no llega al mismo valor (anotar en la bitácora)")

    # Emparejar estados: la permutación que más se parece a B (los estados aprendidos no tienen nombre)
    m = mejor["modelo"]
    perm = min(itertools.permutations(range(2)), key=lambda p: np.abs(m.emissionprob_[list(p)] - B).sum())
    perm = list(perm)
    pi_h, A_h, B_h = m.startprob_[perm], m.transmat_[np.ix_(perm, perm)], m.emissionprob_[perm]
    aprendido = fijo(pi_h, A_h, B_h)

    # Evaluación en los 1 000 días de prueba
    lp_real, v_real = real.decode(Xp)
    lp_apr, v_apr = aprendido.decode(Xp)
    frec = np.bincount(oe, minlength=3) / N_ENT
    mas_comun = int(np.bincount(qe, minlength=2).argmax())
    regla = B_h.argmax(0)  # solo la actividad del día, con la B aprendida
    prueba_ref = {
        "logP_dia_real": float(real.score(Xp)) / N_PRUEBA,
        "logP_dia_aprendido": float(aprendido.score(Xp)) / N_PRUEBA,
        "logP_dia_sin_memoria": float(np.log(frec[op]).mean()),
        "acierto_viterbi_real": float((v_real == qp).mean()),
        "acierto_viterbi_aprendido": float((v_apr == qp).mean()),
        "acierto_actividad": float((regla[op] == qp).mean()),
        "acierto_mas_comun": float((qp == mas_comun).mean()),
    }
    for k, v in prueba_ref.items():
        registrar(f"  {k}: {v:.4f}")
    dia0 = underflow_dia(PI, A_, B, op)
    registrar(f"  Forward sin escalar da 0 en el día {dia0}; error máximo de λ: A {np.abs(A_h - A_).max():.3f}, B {np.abs(B_h - B).max():.3f}")

    pagina = {
        "A": A_.tolist(),
        "prueba": {"estados": cadena(qp), "obs": cadena(op)},
        # Lo que da hmmlearn con el λ real en la prueba: la 61 lo pone junto a lo que calcula el navegador.
        "hmmlearn": {"score_prueba": float(real.score(Xp)), "decode_prueba": {"logprob": float(lp_real), "camino": cadena(v_real)}},
        "entrenamiento": {"frecuencias": frec.tolist(), "mas_comun": mas_comun, "logP_real": float(real.score(Xe))},
        "baum_welch": {
            "arranques": [
                {"semilla": r["semilla"], "iteraciones": len(r["historia"]), "final": round(r["final"], 3), "historia": submuestrear(r["historia"])}
                for r in arranques
            ],
            "mejor": mejor["semilla"],
            "llegan_al_mejor": llegan,
            "tolerancia": TOL,
            "max_iter": MAX_ITER,
            "permutacion": perm,
            "pi": pi_h.tolist(),
            "A": A_h.tolist(),
            "B": B_h.tolist(),
            "logP_entrenamiento": mejor["final"],
        },
    }
    if nombre == "base":
        pagina["crudo"] = {
            "columnas": [{"nombre": "dia", "tipo": "num"}, {"nombre": "actividad", "tipo": "cat"}, {"nombre": "clima", "tipo": "cat"}],
            "filas": [[t + 1, SIMBOLOS[oe[t]], ESTADOS[qe[t]]] for t in range(5)],
        }
    ref = {
        "entrenamiento_obs": cadena(oe),
        "entrenamiento_estados": cadena(qe),
        "prueba_ref": prueba_ref,
        "score_prueba_real": float(real.score(Xp)),
        "decode_prueba_real": {"logprob": float(lp_real), "camino": cadena(v_real)},
        "decode_prueba_aprendido": {"logprob": float(lp_apr), "camino": cadena(v_apr)},
        "score_entrenamiento_aprendido": float(aprendido.score(Xe)),
        "underflow_dia": dia0,
        "numpy_contra_hmmlearn": {"historia": dif_hist, "final": dif_final},
    }
    return pagina, ref


def main():
    REGISTRO.write_text("", encoding="utf-8")
    versiones = {"python": platform.python_version(), "numpy": np.__version__, "hmmlearn": hmmlearn.__version__}
    registrar(f"Hito 6 · {versiones}")

    # Ejemplo de tres días: numpy y hmmlearn
    al = forward(PI, A, B, OBS_EJEMPLO)
    be = backward(A, B, OBS_EJEMPLO)
    PO = float(al[-1].sum())
    d, psi, q = viterbi(PI, A, B, OBS_EJEMPLO)
    caminos = []
    for c in itertools.product(range(2), repeat=3):
        pq, po, pj = conjunta(c, OBS_EJEMPLO)
        caminos.append({"q": list(c), "pQ": pq, "pOdadoQ": po, "conjunta": pj})
    real = fijo(PI, A, B)
    X = columna(OBS_EJEMPLO)
    lp, camino = real.decode(X)
    ejemplo = {
        "alpha": al.tolist(),
        "predicho": [(al[t - 1] @ A).tolist() for t in range(1, 3)],
        "P": PO,
        "delta": d.tolist(),
        "psi": psi[1:],
        "camino": q,
        "caminos": caminos,
        "suavizado": (al * be / PO).tolist(),
        "score_hmmlearn": float(real.score(X)),
        "decode_hmmlearn": {"logprob": float(lp), "camino": [int(x) for x in camino]},
        "suavizado_hmmlearn": real.predict_proba(X).tolist(),
    }
    assert abs(sum(c["conjunta"] for c in caminos) - PO) < 1e-15
    assert abs(np.log(PO) - ejemplo["score_hmmlearn"]) < 1e-12 and q == ejemplo["decode_hmmlearn"]["camino"]
    registrar(f"Ejemplo: P(O) = {PO:.6f}, Viterbi {q} con {d[-1].max():.5f}; hmmlearn {ejemplo['score_hmmlearn']:.6f}")

    escenarios, refs = {}, {}
    for nombre, A_ in [("base", A), ("persistente", A_PERSISTENTE)]:
        # Cada escenario con su propio generador de semilla 42: el persistente no depende de cuántos números usó el otro.
        escenarios[nombre], refs[nombre] = escenario(nombre, A_, np.random.default_rng(SEED))

    guardar(
        "hmm_clima.json",
        {
            "versiones": versiones,
            "semilla": SEED,
            "n_entrenamiento": N_ENT,
            "n_prueba": N_PRUEBA,
            "lambda": {"estados": ESTADOS, "simbolos": SIMBOLOS, "pi": PI.tolist(), "A": A.tolist(), "B": B.tolist()},
            "crudo": escenarios["base"].pop("crudo"),
            "hmmlearn_ejemplo": {"score": ejemplo["score_hmmlearn"], "decode": ejemplo["decode_hmmlearn"]},
            "escenarios": escenarios,
        },
    )
    guardar("referencias_hito6.json", {"versiones": versiones, "ejemplo": ejemplo, "escenarios": refs})


if __name__ == "__main__":
    main()
