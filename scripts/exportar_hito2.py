"""Datos del hito 2 (diapositivas 13–19 y 21–24) → src/data/.

- raices.json                 Variable de la raíz (y del segundo nivel) de 100 árboles de bagging y 100 de Random Forest (13, 14).
- rf_hiperparametros.json     Accuracy de CV según max_features y min_samples_leaf (14, 16).
- importancias.json           Importancia MDI contra permutación, con una columna de ruido como control (15).
- stump_adult.json            El mejor stump de Adult completo (17).
- gb_shrinkage.json           Log-loss y error por número de árboles para varias tasas de aprendizaje (22).
- xgb_regularizacion.json     Efecto de λ y γ en XGBoost (23).
- xgb_faltantes_tiempos.json  Faltantes nativos contra imputados, dirección por omisión y tiempos (24).
- referencias_hito2.json      AdaBoost y Gradient Boosting de sklearn sobre Adult-3D, para verificar TypeScript.

Uso:  .venv/Scripts/python scripts/exportar_hito2.py
"""

import collections
import json
import os
import time

import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import (
    AdaBoostClassifier,
    BaggingClassifier,
    GradientBoostingClassifier,
    RandomForestClassifier,
)
from sklearn.inspection import permutation_importance
from sklearn.metrics import accuracy_score, f1_score, log_loss
from sklearn.model_selection import StratifiedKFold, cross_validate, train_test_split
from sklearn.preprocessing import OrdinalEncoder
from sklearn.tree import DecisionTreeClassifier
from xgboost import XGBClassifier

from adult_comun import DATOS_WEB, SEED, cargar_adult, preprocesador
from exportar_hito1 import NOMBRES_ES, guardar


def raices(Xe, y, nombres):
    def niveles(estimadores):
        raiz = collections.Counter()
        segundo = collections.Counter()
        for e in estimadores:
            t = e.tree_
            raiz[nombres[t.feature[0]]] += 1
            for hijo in (t.children_left[0], t.children_right[0]):
                if t.children_left[hijo] != -1:
                    segundo[nombres[t.feature[hijo]]] += 1
        return {"raiz": dict(raiz.most_common()), "segundo_nivel": dict(segundo.most_common())}

    bag = BaggingClassifier(DecisionTreeClassifier(), n_estimators=100, random_state=SEED, n_jobs=-1).fit(Xe, y)
    rf = RandomForestClassifier(n_estimators=100, random_state=SEED, n_jobs=-1).fit(Xe, y)
    # Lista árbol por árbol, para dibujar la rejilla de 100 celdas.
    por_arbol = lambda est: [nombres[e.tree_.feature[0]] for e in est]
    salida = {
        "bagging": {**niveles(bag.estimators_), "por_arbol": por_arbol(bag.estimators_)},
        "random_forest": {**niveles(rf.estimators_), "por_arbol": por_arbol(rf.estimators_)},
        "max_features_rf": int(rf.estimators_[0].max_features_),
        "variables": len(nombres),
    }
    print("  raíz bagging:", salida["bagging"]["raiz"], "· raíz RF:", salida["random_forest"]["raiz"])
    guardar("raices.json", salida)


def rf_hiperparametros(Xe, y):
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=SEED)

    def medir(**kw):
        r = cross_validate(RandomForestClassifier(n_estimators=100, random_state=SEED, n_jobs=-1, **kw), Xe, y, cv=cv, scoring=["accuracy", "f1_macro"])
        return {"acc": float(r["test_accuracy"].mean()), "acc_desv": float(r["test_accuracy"].std()), "f1": float(r["test_f1_macro"].mean())}

    salida = {
        "max_features": [{"valor": m, **medir(max_features=m)} for m in range(1, Xe.shape[1] + 1)],
        "min_samples_leaf": [{"valor": m, **medir(min_samples_leaf=m)} for m in [1, 2, 5, 10, 20, 50, 100]],
    }
    mejor = max(salida["max_features"], key=lambda d: d["acc"])
    hoja = max(salida["min_samples_leaf"], key=lambda d: d["acc"])
    print(f"  mejor max_features = {mejor['valor']} ({mejor['acc']:.4f}) · mejor min_samples_leaf = {hoja['valor']} ({hoja['acc']:.4f})")
    guardar("rf_hiperparametros.json", salida)


def importancias(Xe, y, nombres):
    rng = np.random.default_rng(SEED)
    X2 = np.column_stack([Xe, rng.normal(size=len(y))])  # columna de control: ruido sin relación con y
    nombres2 = nombres + ["ruido"]
    X_tr, X_te, y_tr, y_te = train_test_split(X2, y, test_size=0.25, stratify=y, random_state=SEED)
    rf = RandomForestClassifier(n_estimators=300, random_state=SEED, n_jobs=-1).fit(X_tr, y_tr)
    perm = permutation_importance(rf, X_te, y_te, n_repeats=10, random_state=SEED, n_jobs=-1, scoring="accuracy")
    filas = [
        {
            "variable": n,
            "nombre_es": NOMBRES_ES.get(n, "ruido (control)"),
            "mdi": float(rf.feature_importances_[i]),
            "permutacion": float(perm.importances_mean[i]),
            "permutacion_desv": float(perm.importances_std[i]),
            "valores_distintos": int(len(np.unique(X2[:, i]))),
        }
        for i, n in enumerate(nombres2)
    ]
    r = next(f for f in filas if f["variable"] == "ruido")
    print(f"  ruido: MDI {r['mdi']:.4f} (lugar {sorted(filas, key=lambda f: -f['mdi']).index(r) + 1}) · permutación {r['permutacion']:.5f}")
    guardar("importancias.json", {"accuracy_prueba": float(rf.score(X_te, y_te)), "filas": filas})


def stump_adult(X, Xe, y, nombres, pre):
    st = DecisionTreeClassifier(max_depth=1).fit(Xe, y)
    t = st.tree_
    f = int(t.feature[0])
    variable = nombres[f]
    lado = lambda nodo: {"n": int(t.n_node_samples[nodo]), "positivos": int(round(t.value[nodo][0][1] * t.n_node_samples[nodo]))}
    # Si la variable es categórica, se traduce el corte a categorías.
    categoricas = pre.transformers_[0][2]
    categorias = None
    if variable in categoricas:
        codificador = pre.named_transformers_["cat"].named_steps["ordinalencoder"]
        todas = list(codificador.categories_[categoricas.index(variable)])
        corte = int(np.floor(t.threshold[0]))
        categorias = {"izquierda": todas[: corte + 1], "derecha": todas[corte + 1 :]}
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=SEED)
    acc = cross_validate(DecisionTreeClassifier(max_depth=1), Xe, y, cv=cv)["test_score"].mean()
    salida = {
        "variable": variable,
        "nombre_es": NOMBRES_ES[variable],
        "umbral": float(t.threshold[0]),
        "categorias": categorias,
        "izquierda": lado(t.children_left[0]),
        "derecha": lado(t.children_right[0]),
        "accuracy_cv": float(acc),
        "accuracy_mayoritaria": float(max(y.mean(), 1 - y.mean())),
    }
    print(f"  stump: {variable} ≤ {t.threshold[0]} {categorias} · acc {acc:.4f}")
    guardar("stump_adult.json", salida)


def particion(Xe, y):
    """60 % entrenamiento, 20 % validación (para decidir cuándo parar) y 20 % prueba (para reportar)."""
    X_tr, X_resto, y_tr, y_resto = train_test_split(Xe, y, test_size=0.4, stratify=y, random_state=SEED)
    X_va, X_te, y_va, y_te = train_test_split(X_resto, y_resto, test_size=0.5, stratify=y_resto, random_state=SEED)
    return X_tr, y_tr, X_va, y_va, X_te, y_te


def gb_shrinkage(Xe, y):
    X_tr, y_tr, X_va, y_va, X_te, y_te = particion(Xe, y)
    N = 1500
    etapas = sorted(set(list(range(1, 51)) + list(range(55, 301, 5)) + list(range(320, N + 1, 20))))
    salida = {"n_entrenamiento": int(len(y_tr)), "n_validacion": int(len(y_va)), "n_prueba": int(len(y_te)), "arboles": etapas, "tasas": []}
    for lr in [1.0, 0.3, 0.1, 0.03]:
        gb = GradientBoostingClassifier(n_estimators=N, learning_rate=lr, max_depth=3, random_state=SEED).fit(X_tr, y_tr)
        curvas = {"logloss_entrenamiento": [], "logloss_validacion": [], "error_validacion": []}
        ll_va_todas, pruebas = [], []
        for p_tr, p_va, p_te in zip(gb.staged_predict_proba(X_tr), gb.staged_predict_proba(X_va), gb.staged_predict_proba(X_te)):
            ll_va_todas.append(log_loss(y_va, p_va[:, 1]))
            pruebas.append((log_loss(y_te, p_te[:, 1]), 1 - accuracy_score(y_te, p_te[:, 1] > 0.5)))
            n = len(ll_va_todas)
            if n in etapas:
                curvas["logloss_entrenamiento"].append(float(log_loss(y_tr, p_tr[:, 1])))
                curvas["logloss_validacion"].append(float(ll_va_todas[-1]))
                curvas["error_validacion"].append(float(1 - accuracy_score(y_va, p_va[:, 1] > 0.5)))
        mejor = int(np.argmin(ll_va_todas)) + 1
        # Paro temprano: se detiene cuando la validación lleva 20 árboles sin mejorar.
        paro, mejor_hasta = N, np.inf
        sin_mejorar = 0
        for n, v in enumerate(ll_va_todas, start=1):
            if v < mejor_hasta - 1e-5:
                mejor_hasta, sin_mejorar = v, 0
            else:
                sin_mejorar += 1
                if sin_mejorar == 20:
                    paro = n - 20
                    break
        salida["tasas"].append(
            {
                "tasa": lr,
                **curvas,
                "mejor_n": mejor,
                "mejor_logloss_validacion": float(ll_va_todas[mejor - 1]),
                "paro_n": paro,
                "prueba_en_paro": {"logloss": float(pruebas[paro - 1][0]), "error": float(pruebas[paro - 1][1])},
                "prueba_al_final": {"logloss": float(pruebas[-1][0]), "error": float(pruebas[-1][1])},
            }
        )
        print(f"  ν = {lr}: mejor n = {mejor} ({ll_va_todas[mejor - 1]:.4f}) · paro en {paro} · validación al final {ll_va_todas[-1]:.4f}")
    guardar("gb_shrinkage.json", salida)


def xgb_regularizacion(Xe, y):
    X_tr, y_tr, X_va, y_va, _, _ = particion(Xe, y)
    filas = []
    for lam in [0, 1, 10, 100]:
        for gamma in [0, 1, 5]:
            m = XGBClassifier(n_estimators=300, learning_rate=0.1, max_depth=6, reg_lambda=lam, gamma=gamma, random_state=SEED, n_jobs=-1).fit(X_tr, y_tr)
            arboles = m.get_booster().trees_to_dataframe()
            hojas = arboles[arboles["Feature"] == "Leaf"]
            filas.append(
                {
                    "lambda": lam,
                    "gamma": gamma,
                    "hojas": int(len(hojas)),
                    "valor_hoja_abs_medio": float(hojas["Gain"].abs().mean()),  # en las hojas, "Gain" guarda el valor w
                    "logloss_entrenamiento": float(log_loss(y_tr, m.predict_proba(X_tr)[:, 1])),
                    "logloss_validacion": float(log_loss(y_va, m.predict_proba(X_va)[:, 1])),
                }
            )
            f = filas[-1]
            print(f"  λ = {lam}, γ = {gamma}: {f['hojas']} hojas · entrenamiento {f['logloss_entrenamiento']:.4f} · validación {f['logloss_validacion']:.4f}")
    guardar("xgb_regularizacion.json", filas)


def xgb_faltantes_tiempos(X, Xe, y, nombres):
    # Versión con faltantes nativos: las categorías se codifican igual, pero el hueco se deja como NaN.
    categoricas = X.select_dtypes(include=["category", "object"]).columns.tolist()
    nativo = ColumnTransformer(
        [("cat", OrdinalEncoder(handle_unknown="use_encoded_value", unknown_value=-1, encoded_missing_value=np.nan), categoricas)],
        remainder="passthrough",
    )
    Xn = nativo.fit_transform(X).astype(float)
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=SEED)
    crear = lambda **kw: XGBClassifier(n_estimators=300, learning_rate=0.1, max_depth=6, random_state=SEED, n_jobs=-1, **kw)

    def medir(M):
        r = cross_validate(crear(), M, y, cv=cv, scoring=["accuracy", "f1_macro", "neg_log_loss"])
        return {
            "acc": float(r["test_accuracy"].mean()),
            "acc_desv": float(r["test_accuracy"].std()),
            "f1": float(r["test_f1_macro"].mean()),
            "logloss": float(-r["test_neg_log_loss"].mean()),
        }

    comparacion = {"nativo": medir(Xn), "como_categoria": medir(Xe)}

    # ¿A qué rama manda XGBoost a quienes les falta el dato, en las preguntas sobre esas variables?
    modelo = crear().fit(Xn, y)
    df = modelo.get_booster().trees_to_dataframe()
    direccion = []
    for i, n in enumerate(nombres):
        if n not in ("workclass", "occupation", "native-country"):
            continue
        cortes = df[df["Feature"] == f"f{i}"]
        direccion.append(
            {
                "variable": n,
                "nombre_es": NOMBRES_ES[n],
                "faltantes": int(np.isnan(Xn[:, i]).sum()),
                "cortes": int(len(cortes)),
                "faltante_a_la_izquierda": int((cortes["Missing"] == cortes["Yes"]).sum()),
            }
        )

    def cronometrar(m, M):
        t0 = time.perf_counter()
        m.fit(M, y)
        return round(time.perf_counter() - t0, 2)

    tiempos = {
        "nucleos": os.cpu_count(),
        "gradient_boosting_sklearn": cronometrar(GradientBoostingClassifier(n_estimators=300, max_depth=6, learning_rate=0.1, random_state=SEED), Xe),
        "xgboost_un_nucleo": cronometrar(XGBClassifier(n_estimators=300, learning_rate=0.1, max_depth=6, random_state=SEED, n_jobs=1), Xe),
        "xgboost_todos": cronometrar(XGBClassifier(n_estimators=300, learning_rate=0.1, max_depth=6, random_state=SEED, n_jobs=-1), Xe),
    }
    print("  faltantes:", comparacion, "\n  dirección:", direccion, "\n  tiempos:", tiempos)
    guardar("xgb_faltantes_tiempos.json", {"comparacion": comparacion, "direccion": direccion, "tiempos": tiempos})


def referencias():
    d = json.loads((DATOS_WEB / "adult3d.json").read_text(encoding="utf-8"))
    X = np.array(d["entrenamiento"]["X"])
    y = np.array(d["entrenamiento"]["y"])
    Xp = np.array(d["prueba"]["X"])
    yp = np.array(d["prueba"]["y"])
    Xv, yv = X[d["vista"]], y[d["vista"]]

    # AdaBoost con stumps sobre las 400 personas visibles (diapositivas 18 y 19).
    ada = AdaBoostClassifier(DecisionTreeClassifier(max_depth=1), n_estimators=50, random_state=SEED).fit(Xv, yv)
    adaboost = {
        "error_ponderado": [float(e) for e in ada.estimator_errors_],
        "peso_sklearn": [float(a) for a in ada.estimator_weights_],  # SAMME: ln((1−ε)/ε), el doble del α binario
        "variable": [int(e.tree_.feature[0]) for e in ada.estimators_],
        "umbral": [float(e.tree_.threshold[0]) for e in ada.estimators_],
        "error_entrenamiento": [float(1 - accuracy_score(yv, p)) for p in ada.staged_predict(Xv)],
        "error_prueba": [float(1 - accuracy_score(yp, p)) for p in ada.staged_predict(Xp)],
    }
    print(f"  AdaBoost 400: ε₁ = {adaboost['error_ponderado'][0]:.4f} · error de prueba 1 → 50: {adaboost['error_prueba'][0]:.4f} → {adaboost['error_prueba'][-1]:.4f}")

    # Gradient Boosting con log-loss sobre las 10 000 personas (diapositiva 21).
    gb = GradientBoostingClassifier(n_estimators=50, learning_rate=0.3, max_depth=2, criterion="squared_error", random_state=SEED).fit(X, y)
    gboost = {
        "tasa": 0.3,
        "profundidad": 2,
        "logloss_entrenamiento": [float(log_loss(y, p[:, 1])) for p in gb.staged_predict_proba(X)],
        "logloss_prueba": [float(log_loss(yp, p[:, 1])) for p in gb.staged_predict_proba(Xp)],
        "error_prueba": [float(1 - accuracy_score(yp, p[:, 1] > 0.5)) for p in gb.staged_predict_proba(Xp)],
    }
    print(f"  GB Adult-3D: log-loss de prueba 1 → 50: {gboost['logloss_prueba'][0]:.4f} → {gboost['logloss_prueba'][-1]:.4f}")
    guardar("referencias_hito2.json", {"adaboost_400": adaboost, "gboost_adult3d": gboost})


def main():
    X, y = cargar_adult()
    pre = preprocesador(X)
    Xe = pre.fit_transform(X)
    nombres = [n.split("__")[-1] for n in pre.get_feature_names_out()]
    print(f"Adult: {len(y)} filas")
    referencias()
    stump_adult(X, Xe, y, nombres, pre)
    raices(Xe, y, nombres)
    importancias(Xe, y, nombres)
    xgb_regularizacion(Xe, y)
    xgb_faltantes_tiempos(X, Xe, y, nombres)
    rf_hiperparametros(Xe, y)
    gb_shrinkage(Xe, y)


if __name__ == "__main__":
    main()
