"""Datos del hito 1 (diapositivas 3, 4 y 6–12) → src/data/.

- adult_muestra.json       Las primeras 5 filas del archivo tal cual, los conteos de Adult, las columnas que se usan,
                           3 personas de ejemplo y los 5 pliegues estratificados (3).
- varianza_ensamble.json   Varianza y covarianza entre árboles, y varianza del promedio de B árboles (8 y 14).
- oob_vs_cv.json           Accuracy OOB contra validación cruzada según el número de árboles (12).
- referencias_hito1.json   Resultados de sklearn sobre Adult-3D para verificar los cálculos en TypeScript.

Uso:  .venv/Scripts/python scripts/exportar_hito1.py
"""

import json
import time

import numpy as np
from sklearn.ensemble import BaggingClassifier, RandomForestClassifier
from sklearn.model_selection import StratifiedKFold, train_test_split
from sklearn.tree import DecisionTreeClassifier

from adult_comun import DATOS_WEB, EXCLUIDAS, SEED, cargar_adult, cargar_adult_crudo, preprocesador

NOMBRES_ES = {
    "age": "edad",
    "workclass": "tipo de empleo",
    "fnlwgt": "peso censal",
    "education": "escolaridad",
    "education-num": "años de educación",
    "marital-status": "estado civil",
    "occupation": "ocupación",
    "relationship": "parentesco",
    "race": "raza",
    "sex": "sexo",
    "capital-gain": "ganancia de capital",
    "capital-loss": "pérdida de capital",
    "hours-per-week": "horas por semana",
    "native-country": "país de origen",
}


def guardar(nombre, datos):
    (DATOS_WEB / nombre).write_text(json.dumps(datos, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"  {nombre}: {(DATOS_WEB / nombre).stat().st_size / 1024:.0f} KB")


def crudo():
    """Las primeras 5 filas del archivo, sin tocar: lo mismo que mostraría `adult.head()` en pandas."""
    X, clase = cargar_adult_crudo()
    tabla = X.assign(**{"class": clase}).head(5)
    # NaN es distinto de sí mismo; los números se quedan como números y las categorías como texto.
    valor = lambda v: None if v != v else (v if isinstance(v, (int, float)) else v.item() if hasattr(v, "item") else str(v))
    return {
        "columnas": [{"nombre": c, "tipo": "num" if tabla[c].dtype.kind in "iuf" else "cat"} for c in tabla.columns],
        "filas": [[valor(v) for v in fila] for fila in tabla.itertuples(index=False)],
        "excluidas": EXCLUIDAS,
        "objetivo": "class",
        "clases": {str(k): int(v) for k, v in clase.value_counts().items()},
    }


def adult_muestra(X, y):
    falt = X.isna()
    # Tres personas elegidas por regla, no a mano: la primera que gana > 50K, la primera que no,
    # y la primera con algún dato faltante.
    indices = [int(np.argmax(y == 1)), int(np.argmax(y == 0)), int(np.argmax(falt.any(axis=1).to_numpy()))]
    ejemplos = []
    for i in indices:
        fila = X.iloc[i]
        ejemplos.append(
            {
                "fila": i,
                "y": int(y[i]),
                "valores": {c: (None if falt.iloc[i][c] else (fila[c].item() if hasattr(fila[c], "item") else str(fila[c]))) for c in X.columns},
            }
        )
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=SEED)
    pliegues = [{"n": int(len(te)), "positivos": int(y[te].sum())} for _, te in cv.split(X, y)]
    guardar(
        "adult_muestra.json",
        {
            "crudo": crudo(),
            "n": int(len(y)),
            "positivos": int(y.sum()),
            "columnas": [
                {
                    "nombre": c,
                    "nombre_es": NOMBRES_ES[c],
                    "tipo": "num" if X[c].dtype.kind in "iuf" else "cat",
                    "faltantes": int(falt[c].sum()),
                }
                for c in X.columns
            ],
            "filas_con_faltantes": int(falt.any(axis=1).sum()),
            "ejemplos": ejemplos,
            "pliegues": pliegues,
        },
    )


def varianza_ensamble(Xe, y):
    """Repite R veces: tomar 10 000 personas como conjunto de entrenamiento y hacer crecer B árboles con bootstrap.

    Sobre 2 000 personas de prueba fijas se mide, para la probabilidad que da cada árbol:
      sigma2 = varianza de un árbol (entre repeticiones y árboles),
      cov    = covarianza entre dos árboles distintos de la misma repetición,
      rho    = cov / sigma2,
    y la varianza del promedio de los primeros B árboles entre repeticiones, que se compara con
    rho·sigma2 + (1 − rho)·sigma2/B.
    """
    R, B, N = 30, 50, 10_000
    X_pool, X_te, y_pool, y_te = train_test_split(Xe, y, test_size=2_000, stratify=y, random_state=SEED)
    rng = np.random.default_rng(SEED)
    salida = {"R": R, "B": B, "n_entrenamiento": N, "n_prueba": int(len(y_te))}
    for metodo, max_features in [("bagging", None), ("random_forest", "sqrt")]:
        P = np.empty((R, B, len(y_te)))
        for r in range(R):
            z = rng.choice(len(y_pool), size=N, replace=False)
            for b in range(B):
                boot = rng.choice(z, size=N, replace=True)
                arbol = DecisionTreeClassifier(max_features=max_features, random_state=int(rng.integers(1 << 31)))
                P[r, b] = arbol.fit(X_pool[boot], y_pool[boot]).predict_proba(X_te)[:, 1]
        mu = P.mean(axis=(0, 1))  # por persona
        D = P - mu
        sigma2 = float((D**2).mean())
        # Covarianza media entre árboles distintos de la misma repetición.
        suma = D.sum(axis=1)
        cov = float(((suma**2 - (D**2).sum(axis=1)) / (B * (B - 1))).mean())
        acum = np.cumsum(P, axis=1) / np.arange(1, B + 1)[None, :, None]  # promedio de los primeros b árboles
        var_emp = ((acum - mu) ** 2).mean(axis=(0, 2))
        acc = ((acum > 0.5) == (y_te == 1)).mean(axis=(0, 2))
        brier = ((acum - y_te) ** 2).mean(axis=(0, 2))
        salida[metodo] = {
            "sigma2": sigma2,
            "cov": cov,
            "rho": cov / sigma2,
            "var_promedio": var_emp.tolist(),
            "var_formula": [cov + (sigma2 - cov) / b for b in range(1, B + 1)],
            "accuracy": acc.tolist(),
            "brier": brier.tolist(),
        }
        print(f"  {metodo}: sigma2 = {sigma2:.4f}, cov = {cov:.4f}, rho = {cov / sigma2:.3f}, acc 1 → {B} árboles: {acc[0]:.4f} → {acc[-1]:.4f}")
    guardar("varianza_ensamble.json", salida)


def oob_vs_cv(Xe, y):
    BS = [10, 25, 50, 100, 200, 300]
    B_MAX = max(BS)
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=SEED)

    def crear(metodo):
        if metodo == "bagging":
            return BaggingClassifier(DecisionTreeClassifier(), n_estimators=B_MAX, random_state=SEED, n_jobs=-1)
        return RandomForestClassifier(n_estimators=B_MAX, random_state=SEED, n_jobs=-1)

    def columnas(modelo, i):
        # Bagging puede submuestrear columnas; aquí usa todas, pero se respeta su orden.
        return modelo.estimators_features_[i] if hasattr(modelo, "estimators_features_") else slice(None)

    salida = {"B": BS}
    for metodo in ["bagging", "random_forest"]:
        t0 = time.perf_counter()
        modelo = crear(metodo).fit(Xe, y)
        t_un_ajuste = time.perf_counter() - t0
        # OOB con los primeros B árboles: cada persona la califican solo los árboles que no la vieron.
        suma = np.zeros(len(y))
        votos = np.zeros(len(y))
        oob, cobertura = [], []
        for i, arbol in enumerate(modelo.estimators_):
            fuera = np.ones(len(y), dtype=bool)
            fuera[modelo.estimators_samples_[i]] = False
            suma[fuera] += arbol.predict_proba(Xe[fuera][:, columnas(modelo, i)])[:, 1]
            votos[fuera] += 1
            if i + 1 in BS:
                con = votos > 0
                oob.append(float(((suma[con] / votos[con] > 0.5) == (y[con] == 1)).mean()))
                cobertura.append(float(con.mean()))

        t0 = time.perf_counter()
        por_pliegue = []
        for tr, te in cv.split(Xe, y):
            m = crear(metodo).fit(Xe[tr], y[tr])
            acum = np.zeros(len(te))
            accs = []
            for i, arbol in enumerate(m.estimators_):
                acum += arbol.predict_proba(Xe[te][:, columnas(m, i)])[:, 1]
                if i + 1 in BS:
                    accs.append(float(((acum / (i + 1) > 0.5) == (y[te] == 1)).mean()))
            por_pliegue.append(accs)
        t_cv = time.perf_counter() - t0
        por_pliegue = np.array(por_pliegue)
        salida[metodo] = {
            "oob": oob,
            "cobertura_oob": cobertura,
            "cv_media": por_pliegue.mean(axis=0).tolist(),
            "cv_desv": por_pliegue.std(axis=0).tolist(),
            "segundos_un_ajuste": round(t_un_ajuste, 1),
            "segundos_cv": round(t_cv, 1),
        }
        print(f"  {metodo}: OOB {oob[-1]:.4f} · CV {por_pliegue.mean(axis=0)[-1]:.4f} con {B_MAX} árboles ({t_un_ajuste:.0f} s vs {t_cv:.0f} s)")
    guardar("oob_vs_cv.json", salida)


def referencias():
    d = json.loads((DATOS_WEB / "adult3d.json").read_text(encoding="utf-8"))
    X = np.array(d["entrenamiento"]["X"])
    y = np.array(d["entrenamiento"]["y"])
    Xp = np.array(d["prueba"]["X"])
    yp = np.array(d["prueba"]["y"])

    # Árbol de profundidad 2 (diapositiva 4): estructura completa para compararla nodo por nodo.
    t = DecisionTreeClassifier(max_depth=2, random_state=SEED).fit(X, y).tree_
    nodos = [
        {
            "variable": int(t.feature[i]) if t.children_left[i] != -1 else None,
            "umbral": float(t.threshold[i]) if t.children_left[i] != -1 else None,
            "n": int(t.n_node_samples[i]),
            "positivos": int(round(t.value[i][0][1] * t.n_node_samples[i])),
            "izq": int(t.children_left[i]),
            "der": int(t.children_right[i]),
        }
        for i in range(t.node_count)
    ]

    # Bagging sobre Adult-3D (diapositiva 11): el azar es distinto en TypeScript, así que se guarda el rango.
    bagging = {}
    for B in [1, 10, 100]:
        accs = [
            BaggingClassifier(DecisionTreeClassifier(), n_estimators=B, random_state=s, n_jobs=-1).fit(X, y).score(Xp, yp)
            for s in range(10)
        ]
        bagging[str(B)] = {"media": float(np.mean(accs)), "min": float(np.min(accs)), "max": float(np.max(accs))}
        print(f"  bagging Adult-3D, {B} árboles: {np.mean(accs):.4f} [{np.min(accs):.4f}, {np.max(accs):.4f}]")
    guardar("referencias_hito1.json", {"arbol_profundidad_2": nodos, "bagging_adult3d": bagging})


def main():
    X, y = cargar_adult()
    Xe = preprocesador(X).fit_transform(X)
    print(f"Adult: {len(y)} filas")
    adult_muestra(X, y)
    referencias()
    varianza_ensamble(Xe, y)
    oob_vs_cv(Xe, y)


if __name__ == "__main__":
    main()
