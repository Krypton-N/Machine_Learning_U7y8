"""Datos del hito 3 (diapositivas 25–28) → src/data/.

- comparacion_adult.json    Los 7 modelos con el valor de cada pliegue y los segundos de un solo ajuste (9, 11, 25–28).
- matrices_adult.json       Matriz de confusión de cada modelo en cada pliegue, más el árbol podado como referencia (26, 27).
- curvas_n_estimators.json  Error de entrenamiento y de validación según el número de árboles (27).
- ruido_etiquetas.json      Qué pasa si una parte de las etiquetas de entrenamiento está equivocada (25, 28).

Protocolo: el mismo de comparar_ensambles.py (5 pliegues estratificados, semilla 42, el preprocesador se ajusta solo
con las filas de entrenamiento de cada pliegue). Los promedios deben salir idénticos a los que ya estaban.

Uso:  .venv/Scripts/python scripts/exportar_hito3.py
"""

import json
import time

import numpy as np
from sklearn.base import clone
from sklearn.ensemble import AdaBoostClassifier, GradientBoostingClassifier, RandomForestClassifier
from sklearn.metrics import accuracy_score, confusion_matrix, f1_score, roc_auc_score
from sklearn.model_selection import StratifiedKFold
from sklearn.tree import DecisionTreeClassifier
from xgboost import XGBClassifier

from adult_comun import DATOS_WEB, SEED, cargar_adult, preprocesador
from comparar_ensambles import modelos
from exportar_hito1 import guardar

PROFUNDO = 20  # niveles del boosting "profundo" del experimento de ruido
ARBOLES_COMPARACION = 300  # los que usan los cinco ensambles en la comparación


def pliegues_transformados(X, y):
    """Los 5 pliegues ya codificados: (X entrenamiento, y entrenamiento, X prueba, y prueba)."""
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=SEED)
    pliegues = []
    for tr, te in cv.split(X, y):
        pre = preprocesador(X)
        pliegues.append((pre.fit_transform(X.iloc[tr]), y[tr], pre.transform(X.iloc[te]), y[te]))
    return pliegues


def evaluar(modelo, pliegues):
    """Ajusta el modelo en cada pliegue y devuelve sus métricas y su matriz de confusión, pliegue por pliegue."""
    r = {k: [] for k in ["matriz", "accuracy", "f1_macro", "auc", "accuracy_entrenamiento", "f1_macro_entrenamiento", "auc_entrenamiento"]}
    t0 = time.perf_counter()
    for Xtr, ytr, Xte, yte in pliegues:
        m = clone(modelo).fit(Xtr, ytr)
        p = m.predict(Xte)
        tn, fp, fn, tp = confusion_matrix(yte, p, labels=[0, 1]).ravel()
        r["matriz"].append([int(tn), int(fp), int(fn), int(tp)])
        r["accuracy"].append(float(accuracy_score(yte, p)))
        r["f1_macro"].append(float(f1_score(yte, p, average="macro", zero_division=0)))
        r["auc"].append(float(roc_auc_score(yte, m.predict_proba(Xte)[:, 1])))
        p_tr = m.predict(Xtr)
        r["accuracy_entrenamiento"].append(float(accuracy_score(ytr, p_tr)))
        r["f1_macro_entrenamiento"].append(float(f1_score(ytr, p_tr, average="macro", zero_division=0)))
        r["auc_entrenamiento"].append(float(roc_auc_score(ytr, m.predict_proba(Xtr)[:, 1])))
    r["segundos"] = round(time.perf_counter() - t0, 1)
    return r


def cronometrar(modelo, Xe, y, repeticiones=3):
    """Segundos de un solo ajuste con todas las personas (mediana de varias repeticiones)."""
    tiempos = []
    for _ in range(repeticiones):
        m = clone(modelo)
        t0 = time.perf_counter()
        m.fit(Xe, y)
        tiempos.append(time.perf_counter() - t0)
    return float(np.median(tiempos))


def tiempos_de_ajuste(modelo, Xe, y):
    """Como está configurado (todos los núcleos, si el modelo los usa) y obligándolo a usar uno solo."""
    como_esta = cronometrar(modelo, Xe, y)
    if "n_jobs" not in modelo.get_params():
        return como_esta, como_esta  # no reparte trabajo: siempre usa un núcleo
    return como_esta, cronometrar(clone(modelo).set_params(n_jobs=1), Xe, y)


def comparacion_y_matrices(X, y, pliegues):
    Xe = preprocesador(X).fit_transform(X)
    anterior = {f["modelo"]: f for f in json.loads((DATOS_WEB / "comparacion_adult.json").read_text(encoding="utf-8"))}
    resumen = lambda v: {"media": float(np.mean(v)), "desv": float(np.std(v)), "pliegues": v}
    filas, matrices, por_pliegue = [], [], {}
    for nombre, modelo in modelos().items():
        r = evaluar(modelo, pliegues)
        ajuste, ajuste_1 = tiempos_de_ajuste(modelo, Xe, y)
        fila = {"modelo": nombre, "segundos": r["segundos"], "segundos_ajuste": ajuste, "segundos_ajuste_1_nucleo": ajuste_1}
        for m in ["accuracy", "f1_macro", "auc"]:
            fila[m] = resumen(r[m])
            fila[f"{m}_entrenamiento"] = float(np.mean(r[f"{m}_entrenamiento"]))
        filas.append(fila)
        matrices.append({"modelo": nombre, "pliegues": r["matriz"], "accuracy": r["accuracy"], "f1_macro": r["f1_macro"]})
        por_pliegue[nombre] = r["accuracy"]
        # Los promedios no deben moverse respecto a lo que ya usan las diapositivas 9 y 11.
        dif = max(abs(fila[m]["media"] - anterior[nombre][m]["media"]) for m in ["accuracy", "f1_macro", "auc"]) if nombre in anterior else float("nan")
        print(
            f"  {nombre:<18} acc {fila['accuracy']['media']:.4f} ± {fila['accuracy']['desv']:.4f} | F1-macro {fila['f1_macro']['media']:.4f} ± {fila['f1_macro']['desv']:.4f} | "
            f"ajuste {ajuste:.2f} s ({ajuste_1:.2f} s con 1 núcleo) | cambio vs. anterior {dif:.1e}"
        )

    # Árbol podado: la profundidad con mejor accuracy de CV en la curva de la diapositiva 5.
    curva = json.loads((DATOS_WEB / "curva_profundidad.json").read_text(encoding="utf-8"))
    mejor = max((f for f in curva if f["profundidad"] is not None), key=lambda f: f["acc_cv"])
    podado = DecisionTreeClassifier(max_depth=mejor["profundidad"], random_state=SEED)
    r = evaluar(podado, pliegues)
    print(f"  árbol podado (profundidad {mejor['profundidad']}): acc {np.mean(r['accuracy']):.4f} (curva: {mejor['acc_cv']:.4f}) | F1-macro {np.mean(r['f1_macro']):.4f}")
    arbol_podado = {
        "profundidad": mejor["profundidad"],
        "pliegues": r["matriz"],
        "accuracy": r["accuracy"],
        "f1_macro": r["f1_macro"],
        "accuracy_entrenamiento": float(np.mean(r["accuracy_entrenamiento"])),
        "segundos_ajuste": cronometrar(podado, Xe, y),
    }

    guardar("comparacion_adult.json", filas)
    guardar("matrices_adult.json", {"modelos": matrices, "arbol_podado": arbol_podado})
    return por_pliegue


def curvas_n_estimators(pliegues, acc_comparacion):
    """Error (1 − accuracy) con los primeros n árboles, promediado sobre los 5 pliegues."""
    N = 1000
    etapas = sorted(set(range(1, 51)) | set(range(55, 301, 5)) | set(range(320, N + 1, 20)))
    error = lambda y, p: float(np.mean(p != y))

    def random_forest(Xtr, ytr, Xte, yte):
        m = RandomForestClassifier(n_estimators=N, random_state=SEED, n_jobs=-1).fit(Xtr, ytr)
        A, B = Xtr.astype(np.float32), Xte.astype(np.float32)
        s_tr, s_te, e_tr, e_te = np.zeros(len(ytr)), np.zeros(len(yte)), [], []
        for n, arbol in enumerate(m.estimators_, start=1):
            s_tr += arbol.predict_proba(A, check_input=False)[:, 1]
            s_te += arbol.predict_proba(B, check_input=False)[:, 1]
            e_tr.append(error(ytr, (s_tr / n > 0.5).astype(int)))
            e_te.append(error(yte, (s_te / n > 0.5).astype(int)))
        return e_tr, e_te

    def por_etapas(modelo):
        def f(Xtr, ytr, Xte, yte):
            m = modelo.fit(Xtr, ytr)
            return [error(ytr, p) for p in m.staged_predict(Xtr)], [error(yte, p) for p in m.staged_predict(Xte)]

        return f

    def xgboost(Xtr, ytr, Xte, yte):
        m = XGBClassifier(n_estimators=N, learning_rate=0.1, max_depth=6, random_state=SEED, n_jobs=-1, eval_metric="error")
        m.fit(Xtr, ytr, eval_set=[(Xtr, ytr), (Xte, yte)], verbose=False)
        r = m.evals_result()
        return r["validation_0"]["error"], r["validation_1"]["error"]

    metodos = {
        "Random Forest": random_forest,
        "AdaBoost": por_etapas(AdaBoostClassifier(n_estimators=N, random_state=SEED)),
        "Gradient Boosting": por_etapas(GradientBoostingClassifier(n_estimators=N, random_state=SEED)),
        "XGBoost": xgboost,
    }
    salida = {"arboles": etapas, "usados_en_la_comparacion": ARBOLES_COMPARACION, "modelos": {}}
    for nombre, f in metodos.items():
        t0 = time.perf_counter()
        r = [f(*p) for p in pliegues]
        tr = np.array([a for a, _ in r])  # pliegue × n
        va = np.array([b for _, b in r])
        assert tr.shape == (len(pliegues), N), f"{nombre} se detuvo antes de {N} árboles"
        # Con 300 árboles tiene que dar exactamente lo de la comparación, pliegue por pliegue.
        dif = float(np.max(np.abs(va[:, ARBOLES_COMPARACION - 1] - (1 - np.array(acc_comparacion[nombre])))))
        media = va.mean(axis=0)
        mejor = int(np.argmin(media)) + 1
        idx = [n - 1 for n in etapas]
        salida["modelos"][nombre] = {
            "entrenamiento": tr.mean(axis=0)[idx].tolist(),
            "validacion": media[idx].tolist(),
            "validacion_desv": va.std(axis=0)[idx].tolist(),
            "mejor_n": mejor,
            "mejor_validacion": float(media[mejor - 1]),
        }
        print(
            f"  {nombre:<18} validación con {ARBOLES_COMPARACION}: {media[ARBOLES_COMPARACION - 1]:.4f} · con {N}: {media[-1]:.4f} · mínimo {media[mejor - 1]:.4f} en n = {mejor} · "
            f"entrenamiento con {N}: {tr.mean(axis=0)[-1]:.4f} · diferencia con la comparación {dif:.1e} · {time.perf_counter() - t0:.0f} s"
        )
    guardar("curvas_n_estimators.json", salida)


def ruido_etiquetas(pliegues, profundidad_podado):
    """Se voltea una fracción de las etiquetas de ENTRENAMIENTO (sí ↔ no) y se examina con las de prueba intactas.

    Quienes se voltean con 10 % están también entre los del 20 %: así las fracciones son comparables.

    Además de los modelos de la comparación van dos controles, para separar el tamaño del árbol de la forma de
    combinar: un bosque de árboles podados y un boosting de árboles profundos.
    """
    fracciones = [0.0, 0.1, 0.2]
    candidatos = {k: v for k, v in modelos().items() if k != "Clase mayoritaria"}
    candidatos["Árbol podado"] = DecisionTreeClassifier(max_depth=profundidad_podado, random_state=SEED)
    candidatos["Random Forest podado"] = RandomForestClassifier(n_estimators=ARBOLES_COMPARACION, max_depth=profundidad_podado, random_state=SEED, n_jobs=-1)
    candidatos["XGBoost profundo"] = XGBClassifier(n_estimators=ARBOLES_COMPARACION, learning_rate=0.1, max_depth=PROFUNDO, random_state=SEED, n_jobs=-1)
    ordenes = [np.random.default_rng(SEED + k).permutation(len(p[1])) for k, p in enumerate(pliegues)]
    salida = {"fracciones": fracciones, "profundidad_podado": profundidad_podado, "profundidad_profundo": PROFUNDO, "modelos": []}
    for nombre, modelo in candidatos.items():
        fila = {"modelo": nombre, "accuracy": [], "f1_macro": []}
        for q in fracciones:
            acc, f1 = [], []
            for (Xtr, ytr, Xte, yte), orden in zip(pliegues, ordenes):
                y_ruido = ytr.copy()
                volteadas = orden[: round(q * len(ytr))]
                y_ruido[volteadas] = 1 - y_ruido[volteadas]
                p = clone(modelo).fit(Xtr, y_ruido).predict(Xte)
                acc.append(float(accuracy_score(yte, p)))
                f1.append(float(f1_score(yte, p, average="macro", zero_division=0)))
            fila["accuracy"].append(acc)
            fila["f1_macro"].append(f1)
        salida["modelos"].append(fila)
        print(f"  {nombre:<20} F1-macro con 0 / 10 / 20 % de etiquetas volteadas: " + " / ".join(f"{np.mean(v):.4f}" for v in fila["f1_macro"]))
    guardar("ruido_etiquetas.json", salida)


def main():
    X, y = cargar_adult()
    print(f"Adult: {len(y)} filas")
    pliegues = pliegues_transformados(X, y)
    acc = comparacion_y_matrices(X, y, pliegues)
    podado = json.loads((DATOS_WEB / "matrices_adult.json").read_text(encoding="utf-8"))["arbol_podado"]["profundidad"]
    ruido_etiquetas(pliegues, podado)
    curvas_n_estimators(pliegues, acc)


if __name__ == "__main__":
    main()
