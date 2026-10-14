"""Datos del hito 4 (diapositivas 29–40, pasajeros aéreos) → src/data/.

- pasajeros.json            El dataset crudo (sus primeras 5 filas tal como llegan) y los 144 valores (29–40 y hito 5).
- validacion_temporal.json  El mismo modelo evaluado con K-Fold barajado y pronosticando (30).
- adf_pasajeros.json        Prueba ADF de cada transformación, su sensibilidad, el esquema y la distribución bajo H0 (37).
- referencias_hito4.json    Lo que calculan numpy, pandas, statsmodels y sklearn, para comparar src/lib/series.ts
                            (solo lo lee scripts/verificar.ts; no entra a la página).

Protocolo: semilla 42. Las diapositivas 29–40 describen la serie completa (144 meses).

Uso:  .venv/Scripts/python scripts/exportar_hito4.py      (1 o 2 minutos; deja registro en scripts/cache/hito4.log)
"""

import warnings

import numpy as np
import pandas as pd
import statsmodels.api as sm
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import KFold, TimeSeriesSplit
from statsmodels.tsa.seasonal import seasonal_decompose
from statsmodels.tsa.stattools import acf, adfuller, pacf

from adult_comun import CACHE, SEED
from exportar_hito1 import guardar
from series_comun import N_ENTRENAMIENTO, cargar_pasajeros, cargar_pasajeros_crudo, etiqueta

CORTE_DEMO = 120  # la demostración de la 30 pronostica dos años: entrena con 1949–1958 y prueba 1959–1960
BARAJADOS = 20  # semillas 0…19, para ver cuánto depende el resultado del barajado
REZAGOS = 36

REGISTRO = CACHE / "hito4.log"


def registrar(texto=""):
    print(texto)
    with REGISTRO.open("a", encoding="utf-8") as f:
        f.write(texto + "\n")


def lista(v, decimales=None):
    """Arreglo de numpy → lista para JSON; NaN pasa a null."""
    return [None if np.isnan(x) else (float(x) if decimales is None else round(float(x), decimales)) for x in np.asarray(v, dtype=float)]


def transformaciones(y):
    ly = np.log(y)
    d12 = ly[12:] - ly[:-12]
    return {"original": y, "log": ly, "dlog": np.diff(ly), "d12log": d12, "dd12log": np.diff(d12)}


# ---------- pasajeros.json ----------
def pasajeros(y):
    crudo = cargar_pasajeros_crudo()
    assert list(crudo.columns) == ["time", "value"], f"columnas inesperadas: {list(crudo.columns)}"
    guardar(
        "pasajeros.json",
        {
            "fuente": "Box y Jenkins, serie G (AirPassengers de R, vía Rdatasets)",
            "unidades": "miles de pasajeros",
            "inicio": [1949, 1],
            "n_entrenamiento": N_ENTRENAMIENTO,
            # `time` va como texto con los 6 decimales que imprime pandas, para enseñarlo tal como llega.
            "crudo": {
                "columnas": [{"nombre": "time", "tipo": "num"}, {"nombre": "value", "tipo": "num"}],
                "filas": [[f"{t:.6f}", int(v)] for t, v in crudo.head().itertuples(index=False)],
            },
            "valores": [int(v) for v in y],
        },
    )


# ---------- validacion_temporal.json ----------
def modelos_validacion(y):
    """Cada modelo: su matriz de variables, cómo se ajusta y cómo regresa a miles de pasajeros."""
    n = len(y)
    t = np.arange(n)
    mes = t % 12
    return [
        {
            "id": "bosque",
            "nombre": "Random Forest",
            "descripcion": "300 árboles; variables: número de mes y mes del año",
            "X": np.column_stack([t, mes + 1]),
            "objetivo": y,
            "hacer": lambda: RandomForestRegressor(n_estimators=300, random_state=SEED),
            "deshacer": lambda v: v,
        },
        {
            "id": "lineal",
            "nombre": "Regresión lineal",
            "descripcion": "sobre el logaritmo: una recta para la tendencia y un ajuste fijo por mes",
            "X": np.column_stack([t, np.eye(12)[mes][:, 1:]]),
            "objetivo": np.log(y),
            "hacer": LinearRegression,
            "deshacer": np.exp,
        },
    ]


def fuera_de_pliegue(m, idx, semilla):
    """Predicción de cada mes de `idx` cuando le tocó ser prueba en un K-Fold barajado."""
    out = np.empty(len(idx))
    for tr, te in KFold(n_splits=5, shuffle=True, random_state=semilla).split(idx):
        out[te] = m["deshacer"](m["hacer"]().fit(m["X"][idx[tr]], m["objetivo"][idx[tr]]).predict(m["X"][idx[te]]))
    return out


def pronosticar(m, corte, hasta):
    return m["deshacer"](m["hacer"]().fit(m["X"][:corte], m["objetivo"][:corte]).predict(m["X"][corte:hasta]))


def validacion_temporal(y):
    n = len(y)
    todos = np.arange(n)
    pliegue = np.empty(n, dtype=int)
    for k, (_, te) in enumerate(KFold(n_splits=5, shuffle=True, random_state=SEED).split(todos)):
        pliegue[te] = k
    registrar(f"K-Fold barajado (semilla {SEED}): tamaños {np.bincount(pliegue).tolist()} · meses con el siguiente en entrenamiento: {int((pliegue[:-1] != pliegue[1:]).sum())} de {n - 1}")

    salida = {"corte": CORTE_DEMO, "semilla": SEED, "pliegue": pliegue.tolist(), "modelos": []}
    prueba = slice(CORTE_DEMO, n)
    mape = lambda real, pred: float((np.abs(real - pred) / real).mean() * 100)
    for m in modelos_validacion(y):
        barajado = fuera_de_pliegue(m, todos, SEED)
        pron = pronosticar(m, CORTE_DEMO, n)
        otros = [fuera_de_pliegue(m, todos, s) for s in range(BARAJADOS)]
        mae_otros = [float(mean_absolute_error(y[prueba], o[prueba])) for o in otros]
        fila = {
            "id": m["id"],
            "nombre": m["nombre"],
            "descripcion": m["descripcion"],
            "pred_barajado": lista(barajado, 3),
            "pronostico": lista(pron, 3),
            # Referencias de sklearn sobre 1959–1960; la diapositiva recalcula el MAE y verificar.ts los compara.
            "mae_barajado": float(mean_absolute_error(y[prueba], np.round(barajado[prueba], 3))),
            "mae_pronostico": float(mean_absolute_error(y[prueba], np.round(pron, 3))),
            "mae_barajados": mae_otros,
        }
        salida["modelos"].append(fila)
        registrar(
            f"{m['nombre']} · 1959–1960: MAE barajado {fila['mae_barajado']:.1f} (20 barajados: {min(mae_otros):.1f} a {max(mae_otros):.1f}) · "
            f"pronóstico {fila['mae_pronostico']:.1f} · máximo de entrenamiento {y[:CORTE_DEMO].max():.0f}, pronosticado {pron.max():.1f}, real {y[prueba].max():.0f}"
        )

        # Lo que no va a pantalla y se deja en el registro: los otros dos diseños que se midieron al planear.
        p60 = pronosticar(m, N_ENTRENAMIENTO, n)
        m60 = [float(mean_absolute_error(y[N_ENTRENAMIENTO:], o[N_ENTRENAMIENTO:])) for o in otros]
        real60 = float(mean_absolute_error(y[N_ENTRENAMIENTO:], p60))
        registrar(f"   solo 1960: barajado {min(m60):.1f} a {max(m60):.1f} (media {np.mean(m60):.1f}) · pronóstico {real60:.1f} · barajado peor en {sum(v > real60 for v in m60)} de {BARAJADOS}")
        ent = np.arange(N_ENTRENAMIENTO)
        promesa = [mape(y[:N_ENTRENAMIENTO], fuera_de_pliegue(m, ent, s)) for s in range(BARAJADOS)]
        origen = []
        for fin in range(1954, 1959):  # entrena hasta diciembre de `fin` y pronostica el año siguiente
            c = (fin - 1948) * 12
            origen.append(mape(y[c : c + 12], pronosticar(m, c, c + 12)))
        registrar(f"   con 1949–1959: K-Fold barajado promete {np.mean(promesa):.1f} % · origen móvil {np.mean(origen):.1f} % · real en 1960 {mape(y[N_ENTRENAMIENTO:], p60):.1f} %")

    # En el bosque, todo corte en t queda antes del mes 120: desde ahí la predicción solo depende del mes.
    bosque = np.array(salida["modelos"][0]["pronostico"])
    assert np.array_equal(bosque[:12], bosque[12:]), "el pronóstico de 1960 debería repetir al de 1959"
    assert bosque.max() <= y[:CORTE_DEMO].max(), "un bosque no puede predecir más que su máximo de entrenamiento"
    guardar("validacion_temporal.json", salida)


# ---------- adf_pasajeros.json ----------
def fila_adf(nombre, s, **opciones):
    r = adfuller(s, **opciones)
    return {"id": nombre, "estadistico": float(r[0]), "p": float(r[1]), "rezagos": int(r[2]), "nobs": int(r[3]), "criticos": {k: float(v) for k, v in r[4].items()}}


def nulo_dickey_fuller(R=20000, T=131):
    """τ de Dickey-Fuller (con constante, sin rezagos) en R caminatas aleatorias de T valores: lo que sale si H0 es cierta."""
    W = np.cumsum(np.random.default_rng(SEED).standard_normal((R, T)), axis=1)
    x, dy = W[:, :-1], np.diff(W, axis=1)
    xc = x - x.mean(1, keepdims=True)
    dyc = dy - dy.mean(1, keepdims=True)
    g = (xc * dyc).sum(1) / (xc**2).sum(1)
    res = dyc - g[:, None] * xc
    ee = np.sqrt((res**2).sum(1) / (T - 1 - 2) / (xc**2).sum(1))
    return g / ee


def adf(y):
    tr = transformaciones(y)
    tau = nulo_dickey_fuller()
    filas = []
    for nombre, s in tr.items():
        f = fila_adf(nombre, s)
        f["fraccion_simulada"] = float((tau <= f["estadistico"]).mean())
        filas.append(f)
        registrar(f"ADF {nombre:8s} τ = {f['estadistico']:8.4f} · p = {f['p']:.6f} · rezagos {f['rezagos']:2d} · nobs {f['nobs']} · fracción simulada {f['fraccion_simulada']:.4f}")
        # El histograma se usa para enseñar el p-valor como área: tiene que parecerse al p de MacKinnon.
        assert abs(f["fraccion_simulada"] - f["p"]) < 0.01, f"la simulación no coincide con MacKinnon en {nombre}"

    sensibilidad = {
        "bic": [fila_adf(k, s, autolag="BIC") for k, s in tr.items()],
        "sin_1960": [fila_adf(k, s) for k, s in transformaciones(y[:N_ENTRENAMIENTO]).items()],
        "con_tendencia": [fila_adf(k, s, regression="ct") for k, s in tr.items()],
    }
    for clave, fs in sensibilidad.items():
        registrar(f"   {clave}: " + " · ".join(f"{f['id']} p = {f['p']:.4f} ({f['rezagos']})" for f in fs))

    # Esquema: los mismos 150 choques con dos reglas. Se simula aquí porque su τ y su p los calcula statsmodels.
    eps = np.random.default_rng(SEED).standard_normal(150)
    ar1 = np.zeros(150)
    ar1[0] = eps[0]
    for t in range(1, 150):
        ar1[t] = 0.5 * ar1[t - 1] + eps[t]
    caminata = np.cumsum(eps)
    df = {}
    for nombre, s in [("ar1", ar1), ("caminata", caminata)]:
        f = fila_adf(nombre, s, maxlag=0, autolag=None, regression="c")
        f["gamma"] = float(np.polyfit(s[:-1], np.diff(s), 1)[0])
        df[nombre] = f
        registrar(f"esquema {nombre}: γ = {f['gamma']:.4f} · τ = {f['estadistico']:.3f} · p = {f['p']:.2e}")
    # La narración del esquema: una se rechaza con claridad y la otra no. Si cambia, se anota en la bitácora.
    assert df["caminata"]["p"] > 0.10 and df["ar1"]["p"] < 0.01

    bordes = np.round(np.arange(-7, 3.0001, 0.1), 1)
    conteos, _ = np.histogram(tau, bins=bordes)
    registrar(f"H0 simulada: percentil 5 % = {np.quantile(tau, 0.05):.3f} · mediana {np.median(tau):.3f} · fuera del histograma: {int(len(tau) - conteos.sum())}")
    guardar(
        "adf_pasajeros.json",
        {
            "config": {"regression": "c", "autolag": "AIC"},
            "filas": filas,
            "sensibilidad": sensibilidad,
            "esquema": {"semilla": SEED, "phi": 0.5, "choques": lista(eps, 6), "ar1": lista(ar1, 6), "caminata": lista(caminata, 6), "df": df},
            "nulo": {
                "R": len(tau),
                "n": 131,
                "semilla": SEED,
                "bordes": bordes.tolist(),
                "conteos": conteos.tolist(),
                "percentil5": float(np.quantile(tau, 0.05)),
                "mediana": float(np.median(tau)),
            },
        },
    )


# ---------- referencias_hito4.json ----------
def referencias(y):
    tr = transformaciones(y)
    s = pd.Series(y)
    M = y.reshape(12, 12)
    L = np.log(M)

    descomposicion = {}
    for clave, modelo in [("aditiva", "additive"), ("multiplicativa", "multiplicative")]:
        d = seasonal_decompose(y, period=12, model=modelo)
        descomposicion[clave] = {"tendencia": lista(d.trend), "indices": lista(d.seasonal[:12]), "residuo": lista(d.resid)}

    # Mínimos cuadrados: log de este mes contra el de los dos anteriores (dos variables y constante).
    ly = tr["log"]
    X = np.column_stack([ly[1:-1], ly[:-2]])
    ols = sm.OLS(ly[2:], sm.add_constant(X)).fit()

    def particiones(n):
        return [{"entrenamiento": int(len(a)), "prueba_desde": int(b[0]), "prueba_hasta": int(b[-1])} for a, b in TimeSeriesSplit(5).split(np.arange(n))]

    guardar(
        "referencias_hito4.json",
        {
            "pearson_r1": float(np.corrcoef(y[:-1], y[1:])[0, 1]),
            "por_anio": {
                "media": lista(M.mean(1)),
                "desv": lista(M.std(1, ddof=1)),
                "log_media": lista(L.mean(1)),
                "log_desv": lista(L.std(1, ddof=1)),
            },
            "dlog": lista(tr["dlog"]),
            "d12log": lista(tr["d12log"]),
            "dd12log": lista(tr["dd12log"]),
            "promedio_movil": {
                "centrado": {str(k): lista(s.rolling(k, center=True).mean()) for k in [3, 5, 7]},
                "atrasado_12": lista(s.rolling(12).mean()),
                # El 2×12 de pandas, por otra vía que la tendencia de seasonal_decompose (deben coincidir).
                "dos_por_12": lista(s.rolling(12).mean().rolling(2).mean().shift(-6)),
            },
            "descomposicion": descomposicion,
            "acf": {k: lista(acf(tr[k], nlags=REZAGOS, adjusted=False, fft=False)) for k in ["original", "dd12log"]},
            "pacf": {k: lista(pacf(tr[k], nlags=REZAGOS, method="ywm")) for k in ["log", "dd12log"]},
            "ols_log": {"beta": lista(ols.params), "ee": lista(ols.bse), "t": lista(ols.tvalues)},
            "particion_temporal": {str(n): particiones(n) for n in [20, 144]},
        },
    )
    extremos = np.flatnonzero(~np.isnan(np.array(descomposicion["aditiva"]["tendencia"], dtype=float)))
    registrar(f"tendencia 2×12: de {etiqueta(int(extremos[0]))} a {etiqueta(int(extremos[-1]))} ({len(extremos)} meses)")
    registrar(f"ACF pasajeros r1 = {acf(y, nlags=1, adjusted=False, fft=False)[1]:.4f} · Pearson de los pares = {np.corrcoef(y[:-1], y[1:])[0, 1]:.4f}")


def main():
    warnings.filterwarnings("ignore")
    REGISTRO.write_text("", encoding="utf-8")
    y = cargar_pasajeros()
    registrar(f"Pasajeros: {len(y)} meses, de {etiqueta(0)} a {etiqueta(len(y) - 1)} · suma {y.sum():.0f}")
    pasajeros(y)
    referencias(y)
    adf(y)
    validacion_temporal(y)


if __name__ == "__main__":
    main()
