"""Datos del hito 5 (diapositivas 41–50, modelos de series sobre pasajeros aéreos) → src/data/.

- series_modelos.json      Lo que ajusta statsmodels y no se puede calcular en el navegador: el MA(1) de la 43, los
                           cuatro modelos del crecimiento anual (44), el ARIMA sin estación (45), la rejilla de 16 SARIMA
                           y el elegido (47–49), el bosque de la 30 como línea base (49) y el origen móvil (50).
- referencias_hito5.json   Lo que calculan statsmodels, scipy y sklearn, para comparar src/lib/series.ts
                           (solo lo lee scripts/verificar.ts; no entra a la página).

Protocolo: todo se ajusta con 1949–1959 (132 meses); 1960 solo se usa para medir. En el origen móvil cada ajuste ve
únicamente los meses anteriores a su origen. Semilla 42.

Convergencia: SARIMAX se ajusta con L-BFGS y 500 iteraciones; si avisa o no converge, se repite con Nelder-Mead y se
exige el mismo AIC (±0.01). Los modelos de la clase ARIMA, con 1 000 iteraciones; si avisan, se repiten con el método
de innovaciones y se exigen los mismos parámetros (±0.001). Cada caso queda anotado en el registro.

Uso:  .venv/Scripts/python scripts/exportar_hito5.py      (1 o 2 minutos; deja registro en scripts/cache/hito5.log)
"""

import warnings
from itertools import product

import numpy as np
import scipy
import sklearn
import statsmodels
from scipy.stats import chi2
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_absolute_percentage_error, root_mean_squared_error
from statsmodels.stats.diagnostic import acorr_ljungbox
from statsmodels.tsa.ar_model import AutoReg
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.arima_process import ArmaProcess
from statsmodels.tsa.seasonal import seasonal_decompose
from statsmodels.tsa.statespace.sarimax import SARIMAX
from statsmodels.tsa.stattools import acf, pacf

from adult_comun import CACHE, SEED
from exportar_hito1 import guardar
from exportar_hito4 import lista, transformaciones
from series_comun import N_ENTRENAMIENTO, cargar_pasajeros, etiqueta

N = N_ENTRENAMIENTO
REZAGOS = 36
AEROLINEA = ((0, 1, 1), (0, 1, 1, 12))
ORIGENES = range(1955, 1961)  # año que se pronostica; con menos de 72 meses de entrenamiento los ajustes ya no convergen
DECIMALES = 6  # de los pronósticos en logaritmo y de los residuos que van a la página

REGISTRO = CACHE / "hito5.log"


def registrar(texto=""):
    print(texto)
    with REGISTRO.open("a", encoding="utf-8") as f:
        f.write(texto + "\n")


def avisos_de(w):
    return [x.category.__name__ for x in w if not issubclass(x.category, FutureWarning)]


def ajustar_sarimax(serie, orden, estacional):
    """SARIMAX sin constante. Devuelve el ajuste y con qué método quedó."""
    hacer = lambda: SARIMAX(serie, order=orden, seasonal_order=estacional, trend="n")
    with warnings.catch_warnings(record=True) as w:
        warnings.simplefilter("always")
        res = hacer().fit(disp=False, maxiter=500)
    if not avisos_de(w) and res.mle_retvals.get("converged"):
        return res, "lbfgs"
    with warnings.catch_warnings(record=True) as w2:
        warnings.simplefilter("always")
        otro = hacer().fit(disp=False, maxiter=5000, method="nm")
    assert otro.mle_retvals.get("converged") and not avisos_de(w2), f"{orden}{estacional} no converge con ningún método"
    assert abs(otro.aic - res.aic) < 0.01, f"{orden}{estacional}: los dos métodos dan AIC distintos ({res.aic:.3f} y {otro.aic:.3f})"
    registrar(f"   aviso: {orden}{estacional[:3]} con {len(serie)} meses no converge con L-BFGS; Nelder-Mead da el mismo AIC ({otro.aic:.2f})")
    return otro, "nm"


def ajustar_arima(serie, orden, tendencia):
    """Un modelo de la clase ARIMA (regresión con errores ARMA). Devuelve el ajuste y con qué método quedó."""
    hacer = lambda: ARIMA(serie, order=orden, trend=tendencia)
    with warnings.catch_warnings(record=True) as w:
        warnings.simplefilter("always")
        res = hacer().fit(method_kwargs={"maxiter": 1000})
    if not avisos_de(w):
        return res, "statespace"
    with warnings.catch_warnings(record=True) as w2:
        warnings.simplefilter("always")
        otro = hacer().fit(method="innovations_mle")
    assert not avisos_de(w2) and np.abs(otro.params - res.params).max() < 1e-3, f"ARIMA{orden}: el aviso de convergencia no es inocuo"
    registrar(f"   aviso: ARIMA{orden} avisa con el método por omisión; el de innovaciones da los mismos parámetros")
    return res, "statespace (confirmado con innovaciones)"


def redondear(v):
    return np.round(np.asarray(v, dtype=float), DECIMALES)


def metricas(real, pred):
    return {
        "mae": float(mean_absolute_error(real, pred)),
        "rmse": float(root_mean_squared_error(real, pred)),
        "mape": float(mean_absolute_percentage_error(real, pred) * 100),
    }


def pronostico_de(res):
    """Los 12 meses siguientes, en logaritmo y ya redondeados como van a la página, con su banda del 95 %."""
    f = res.get_forecast(12)
    return redondear(f.predicted_mean), redondear(f.conf_int(alpha=0.05))


def ljung_box(residuos, coeficientes):
    r = acorr_ljungbox(residuos, lags=[12, 24], model_df=coeficientes)
    return {"rezagos": [12, 24], "gl": [12 - coeficientes, 24 - coeficientes], "Q": lista(r["lb_stat"]), "p": lista(r["lb_pvalue"])}


# ---------- 43: MA(1) sobre ∇∇₁₂ log ----------
def ma1(w):
    res, metodo = ajustar_arima(w, (0, 0, 1), "n")
    theta = float(res.params[0])
    assert abs(theta) < 1, "el MA(1) no es invertible"
    registrar(f"43 · MA(1) sobre ∇∇₁₂ log ({len(w)} valores): θ = {theta:.4f} (ee {res.bse[0]:.4f}) · ρ1 teórico {theta / (1 + theta**2):.4f} · r1 {acf(w, nlags=1, fft=False)[1]:.4f}")
    # El pronóstico de 1960: el primer mes corrige con el último error; después, la media (0). La memoria se corta.
    return {"theta": theta, "ee": float(res.bse[0]), "sigma2": float(res.params[1]), "metodo": metodo, "ajustados": lista(res.fittedvalues, 8), "pronostico": lista(res.get_forecast(12).predicted_mean, 8)}


# ---------- 44: cuatro modelos para el crecimiento anual ----------
def arma_crecimiento(z):
    salida = []
    for nombre, (p, q) in {"AR(1)": (1, 0), "MA(1)": (0, 1), "ARMA(1,1)": (1, 1), "AR(2)": (2, 0)}.items():
        res, metodo = ajustar_arima(z, (p, 0, q), "c")
        ar, ma = list(map(float, res.arparams)), list(map(float, res.maparams))
        # Estacionario e invertible: si no, su ACF teórica no existe.
        assert all(abs(r) > 1 for r in res.arroots) and all(abs(r) > 1 for r in res.maroots), nombre
        salida.append({"id": nombre, "ar": ar, "ma": ma, "media": float(res.params[0]), "sigma2": float(res.params[-1]), "aic": float(res.aic), "metodo": metodo})
        registrar(f"44 · {nombre:10s} ar {np.round(ar, 4)} ma {np.round(ma, 4)} · AIC {res.aic:.2f}")
    return salida


# ---------- 45: ARIMA sin estación, con deriva ----------
def arima(ly, real):
    rejilla = []
    for p, q in product(range(3), range(3)):
        res, _ = ajustar_arima(ly[:N], (p, 1, q), "t")
        log, _ = pronostico_de(res)
        raiz = float(np.abs(res.maroots).min()) if q else None
        rejilla.append({"orden": [p, 1, q], "aic": float(res.aic), "raiz_ma": raiz, "mae_1960": metricas(real, np.exp(log))["mae"]})
    mejor = min(rejilla, key=lambda f: f["aic"])
    registrar(f"45 · rejilla de 9: el de menor AIC es ARIMA{tuple(mejor['orden'])} (raíz MA {mejor['raiz_ma']:.3f}, MAE {mejor['mae_1960']:.1f})")

    res, metodo = ajustar_arima(ly[:N], (0, 1, 1), "t")
    log, banda = pronostico_de(res)
    # Lo que la diapositiva enseña: el pronóstico del nivel es el último valor más los cambios pronosticados.
    cambios = np.diff(np.r_[ly[N - 1], res.get_forecast(12).predicted_mean])
    assert np.allclose(cambios[1:], res.params[0]), "después del primer mes, el cambio pronosticado debería ser la deriva"
    m = metricas(real, np.exp(log))
    registrar(f"45 · ARIMA(0,1,1) con deriva: deriva {res.params[0]:.5f} · θ = {res.params[1]:.4f} · 1960: MAE {m['mae']:.1f} RMSE {m['rmse']:.1f} MAPE {m['mape']:.2f} %")
    return {
        "orden": [0, 1, 1],
        "deriva": float(res.params[0]),
        "theta": float(res.params[1]),
        "sigma2": float(res.params[2]),
        "metodo": metodo,
        "pronostico_log": log.tolist(),
        "ic95_log": banda.tolist(),
        "rejilla": rejilla,
    }, m


# ---------- 47–49: la rejilla de 16 SARIMA y el elegido ----------
def sarima(ly, real):
    rejilla, ajustes = [], {}
    for p, q, P, Q in product(range(2), repeat=4):
        res, metodo = ajustar_sarimax(ly[:N], (p, 1, q), (P, 1, Q, 12))
        k = len(res.params)  # cuenta también la varianza
        assert abs(res.aic - (-2 * res.llf + 2 * k)) < 1e-8
        assert abs(res.bic - (-2 * res.llf + k * np.log(res.nobs_effective))) < 1e-8, "BIC ya no usa las observaciones efectivas"
        log, _ = pronostico_de(res)
        ajustes[(p, q, P, Q)] = res
        rejilla.append({"orden": [p, 1, q], "estacional": [P, 1, Q, 12], "aic": float(res.aic), "bic": float(res.bic), "llf": float(res.llf), "k": k, "metodo": metodo, "pronostico_log": log.tolist()})
    orden = sorted(rejilla, key=lambda f: f["aic"])
    for f in orden:
        registrar(f"48 · {tuple(f['orden'])}{tuple(f['estacional'][:3])} k = {f['k']} · AIC {f['aic']:8.2f} (Δ {f['aic'] - orden[0]['aic']:5.2f}) · BIC Δ {f['bic'] - min(g['bic'] for g in rejilla):5.2f} · MAE 1960 {metricas(real, np.exp(f['pronostico_log']))['mae']:5.1f} · {f['metodo']}")
    # La regla de la 48: se elige el de menor AIC. Las diapositivas dicen que es la aerolínea y que también gana en BIC.
    assert (tuple(orden[0]["orden"]), tuple(orden[0]["estacional"])) == AEROLINEA, "la aerolínea ya no es el mínimo de AIC"
    assert min(rejilla, key=lambda f: f["bic"]) is orden[0], "la aerolínea ya no es el mínimo de BIC"

    res = ajustes[(0, 1, 0, 1)]
    theta, Theta, sigma2 = map(float, res.params)
    assert abs(theta) < 1 and abs(Theta) < 1
    log, banda = pronostico_de(res)
    # Los primeros d + D·s = 13 residuos son el arranque del filtro, no errores del modelo.
    residuos = redondear(res.resid[13:])
    # El pronóstico es la recursión del modelo: lo que la 47 escribe como fórmula desarrollada.
    e = np.r_[res.resid, np.zeros(12)]
    z = np.r_[ly[:N], np.zeros(12)]
    for t in range(N, N + 12):
        z[t] = theta * e[t - 1] + Theta * e[t - 12] + theta * Theta * e[t - 13] + z[t - 1] + z[t - 12] - z[t - 13]
    assert np.abs(z[N:] - res.get_forecast(12).predicted_mean).max() < 1e-4, "el pronóstico no es la recursión del modelo"
    m = metricas(real, np.exp(log))
    registrar(f"47 · aerolínea: θ = {theta:.4f} (ee {res.bse[0]:.4f}) · Θ = {Theta:.4f} (ee {res.bse[1]:.4f}) · σ² = {sigma2:.6f} · {res.mle_retvals.get('iterations')} iteraciones")
    registrar(f"47 · 1960: MAE {m['mae']:.2f} RMSE {m['rmse']:.2f} MAPE {m['mape']:.2f} % · se pasa en {int((np.exp(log) > real).sum())} de 12 · dentro de la banda {int(((real >= np.exp(banda[:, 0])) & (real <= np.exp(banda[:, 1]))).sum())} de 12")
    elegido = {
        "orden": [0, 1, 1],
        "estacional": [0, 1, 1, 12],
        "regla": "el de menor AIC entre los 16",
        "theta": theta,
        "Theta": Theta,
        "sigma2": sigma2,
        "ee": {"theta": float(res.bse[0]), "Theta": float(res.bse[1])},
        "nobs_efectivas": int(res.nobs_effective),
        "pronostico_log": log.tolist(),
        "ic95_log": banda.tolist(),
        "residuos": residuos.tolist(),
    }
    return rejilla, elegido, m, ljung_box(residuos, 2)


# ---------- 49: el bosque de la 30, ahora entrenado con 1949–1959 ----------
def bosque(y):
    t = np.arange(len(y))
    X = np.column_stack([t, t % 12 + 1])
    pred = np.round(RandomForestRegressor(n_estimators=300, random_state=SEED).fit(X[:N], y[:N]).predict(X[N:]), 3)
    m = metricas(y[N:], pred)
    registrar(f"49 · Random Forest (número de mes y mes del año) entrenado con 1949–1959: MAE {m['mae']:.1f} RMSE {m['rmse']:.1f} MAPE {m['mape']:.2f} %")
    return {"descripcion": "300 árboles; variables: número de mes y mes del año", "pronostico": pred.tolist()}, m


# ---------- 50: origen móvil ----------
def origen_movil(y):
    ly = np.log(y)
    salida, refs = [], []
    for anio in ORIGENES:
        T = (anio - 1949) * 12
        le, real = ly[:T], y[T : T + 12]
        assert len(le) == T and T + 12 <= len(y)  # ningún ajuste ve su año de prueba
        cand = []
        for p, q, P, Q in product(range(2), repeat=4):
            res, _ = ajustar_sarimax(le, (p, 1, q), (P, 1, Q, 12))
            cand.append(((p, q, P, Q), res))
        cand.sort(key=lambda c: c[1].aic)
        assert cand[0][0] == (0, 1, 0, 1), f"en {anio} el mínimo de AIC no es la aerolínea"
        aero = cand[0][1]
        sin_estacion, _ = ajustar_arima(le, (0, 1, 1), "t")
        log_s, _ = pronostico_de(aero)
        log_a, _ = pronostico_de(sin_estacion)
        residuos = redondear(aero.resid[13:])
        ms, ma, mi = metricas(real, np.exp(log_s)), metricas(real, np.exp(log_a)), metricas(real, y[T - 12 : T])
        salida.append({
            "anio": anio,
            "n_entrenamiento": T,
            "segundo": {"orden": [cand[1][0][0], 1, cand[1][0][1]], "estacional": [cand[1][0][2], 1, cand[1][0][3], 12], "delta_aic": float(cand[1][1].aic - aero.aic)},
            "sarima": {"theta": float(aero.params[0]), "Theta": float(aero.params[1]), "pronostico_log": log_s.tolist(), "residuos": residuos.tolist()},
            "arima": {"deriva": float(sin_estacion.params[0]), "theta": float(sin_estacion.params[1]), "pronostico_log": log_a.tolist()},
        })
        refs.append({"anio": anio, "ingenuo": mi, "arima": ma, "sarima": ms, "ljungbox": ljung_box(residuos, 2)})
        registrar(f"50 · {anio} (entrena {T} meses): MAPE ingenuo {mi['mape']:5.2f} · ARIMA {ma['mape']:5.2f} · SARIMA {ms['mape']:5.2f} · θ {aero.params[0]:.3f} Θ {aero.params[1]:.3f} · segundo a {cand[1][1].aic - aero.aic:.2f} de AIC · Ljung-Box(24) p {refs[-1]['ljungbox']['p'][1]:.3f}")
    for clave in ("ingenuo", "arima", "sarima"):
        v = np.array([r[clave]["mape"] for r in refs])
        registrar(f"50 · {clave:8s} MAPE medio {v.mean():.2f} ± {v.std():.2f}")
    gana = sum(r["sarima"]["mape"] < r["ingenuo"]["mape"] for r in refs)
    registrar(f"50 · SARIMA le gana al ingenuo en {gana} de {len(refs)} años")
    return salida, refs


# ---------- referencias_hito5.json ----------
ESQUEMAS = [
    *[([phi], []) for phi in (0.5, 0.9, -0.6, 0.6, 0.7)],
    *[([], [th]) for th in (0.8, -0.6, 0.6, 0.5)],
    ([0.7], [0.5]),
    ([0.7], [0.4]),
    ([0.5, 0.3], []),
]


def referencias(y, tr, modelos):
    w, z = tr["dd12log"], tr["d12log"]
    _, intervalo = acf(w, nlags=REZAGOS, adjusted=False, fft=False, alpha=0.05, bartlett_confint=True)

    teoricas = []
    for ar, ma in ESQUEMAS:
        pr = ArmaProcess(np.r_[1, -np.array(ar)], np.r_[1, ma])
        # arma2ar da los coeficientes de φ(B)/θ(B); con el signo cambiado son los pesos del AR infinito equivalente.
        teoricas.append({"ar": ar, "ma": ma, "psi": lista(pr.arma2ma(21)), "pi": lista(-pr.arma2ar(21)[1:]), "acf": lista(pr.acf(21)), "pacf": lista(pr.pacf(21))})

    autoreg = {}
    for p in (1, 2):
        m = AutoReg(z, lags=p, trend="c").fit()
        autoreg[str(p)] = {"params": lista(m.params), "pronostico": lista(m.predict(start=len(z), end=len(z) + 11))}
        registrar(f"42 · AutoReg({p}) sobre el crecimiento anual: {np.round(m.params, 4)} · pronóstico de {autoreg[str(p)]['pronostico'][0]:.4f} a {autoreg[str(p)]['pronostico'][-1]:.4f}")

    d = seasonal_decompose(y[:N], period=12, model="multiplicative")
    pares = [(x, k) for k in (1, 2, 5, 10, 22) for x in (0.5, 3.0, 6.84, 18.59)]
    return {
        "versiones": {"statsmodels": statsmodels.__version__, "scipy": scipy.__version__, "numpy": np.__version__, "sklearn": sklearn.__version__},
        "acf": {k: lista(acf(v, nlags=REZAGOS, adjusted=False, fft=False)) for k, v in tr.items()},
        "pacf": {k: lista(pacf(v, nlags=REZAGOS, method="ywm")) for k, v in tr.items()},
        "bartlett_dd12log": lista((intervalo[:, 1] - intervalo[:, 0]) / 2),
        "teoricas": teoricas,
        "autoreg": autoreg,
        "descomposicion_multiplicativa": {"tendencia": lista(d.trend), "indices": lista(d.seasonal[:12]), "residuo": lista(d.resid)},
        "chi2": [[x, k, float(chi2.sf(x, k))] for x, k in pares],
        **modelos,
    }


def main():
    warnings.filterwarnings("ignore", category=FutureWarning)
    REGISTRO.write_text("", encoding="utf-8")
    y = cargar_pasajeros()
    ly = np.log(y)
    real = y[N:]
    tr = transformaciones(y[:N])
    registrar(f"Entrenamiento: {N} meses, de {etiqueta(0)} a {etiqueta(N - 1)} · prueba: {len(real)} meses de 1960 · statsmodels {statsmodels.__version__}")

    m_ma1 = ma1(tr["dd12log"])
    m_arma = arma_crecimiento(tr["d12log"])
    m_arima, met_arima = arima(ly, real)
    rejilla, elegido, met_sarima, lb = sarima(ly, real)
    m_bosque, met_bosque = bosque(y)
    movil, refs_movil = origen_movil(y)
    # El último origen es el mismo ajuste que el elegido.
    assert movil[-1]["sarima"]["pronostico_log"] == elegido["pronostico_log"]

    aero144, _ = ajustar_sarimax(ly, *AEROLINEA)
    registrar(f"registro · aerolínea con los 144 meses: θ = {aero144.params[0]:.4f}, Θ = {aero144.params[1]:.4f} (el libro, con otro estimador: −0.40 y −0.61)")
    ingenuo = metricas(real, y[N - 12 : N])
    # El ingenuo con crecimiento (49): 1959 copiado y multiplicado por lo que creció el total de 1958 a 1959.
    crecimiento = y[N - 12 : N].sum() / y[N - 24 : N - 12].sum()
    con_crecimiento = metricas(real, y[N - 12 : N] * crecimiento)
    registrar(f"49 · ingenuo con crecimiento (×{crecimiento:.4f}): MAE {con_crecimiento['mae']:.2f} RMSE {con_crecimiento['rmse']:.2f} MAPE {con_crecimiento['mape']:.2f} %")
    registrar(f"49 · ingenuo estacional: MAE {ingenuo['mae']:.2f} RMSE {ingenuo['rmse']:.2f} MAPE {ingenuo['mape']:.2f} % · 1960 supera a 1959 en {int((real > y[N - 12 : N]).sum())} de 12 meses")
    registrar(f"48 · Ljung-Box de los {len(elegido['residuos'])} residuos: Q = {np.round(lb['Q'], 2)} · p = {np.round(lb['p'], 3)}")

    guardar(
        "series_modelos.json",
        {
            "versiones": {"statsmodels": statsmodels.__version__},
            "ma1": m_ma1,
            "arma_crecimiento": m_arma,
            "arima": m_arima,
            "sarima_rejilla": rejilla,
            "elegido": elegido,
            "linea_base": {"bosque": m_bosque},
            "origen_movil": movil,
            "registro": {"aerolinea_144": {"theta": float(aero144.params[0]), "Theta": float(aero144.params[1])}},
        },
    )
    guardar(
        "referencias_hito5.json",
        referencias(y, tr, {"metricas_1960": {"ingenuo": ingenuo, "crec": con_crecimiento, "bosque": met_bosque, "arima": met_arima, "sarima": met_sarima}, "ljungbox": lb, "origen_movil": refs_movil}),
    )


if __name__ == "__main__":
    main()
