"""Exporta a src/data/ los datos de Adult que usan las diapositivas.

- adult3d.json            Adult con 3 variables (edad, educación, horas): 10 000 de entrenamiento, 5 000 de prueba
                          y 400 para dibujar. Incluye el accuracy de sklearn por profundidad para verificar el árbol en TS.
- curva_profundidad.json  Adult completo: error de entrenamiento y de CV (5 pliegues) para cada max_depth.
- educacion_logloss.json  Conteos por años de educación para calcular en el navegador la log-loss exacta de
                          P(>50K) = σ(w·educación + b), más la solución de sklearn como referencia.

Uso:  .venv/Scripts/python scripts/exportar_datos.py
"""

import json

import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import log_loss
from sklearn.model_selection import StratifiedKFold, cross_validate, train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.tree import DecisionTreeClassifier

from adult_comun import DATOS_WEB, SEED, cargar_adult, preprocesador

VARIABLES_3D = ["age", "education-num", "hours-per-week"]
NOMBRES_3D = ["edad", "años de educación", "horas por semana"]
PROFUNDIDADES_3D = list(range(1, 16))
PROFUNDIDADES = list(range(1, 31)) + [None]


def guardar(nombre, datos):
    DATOS_WEB.mkdir(parents=True, exist_ok=True)
    (DATOS_WEB / nombre).write_text(json.dumps(datos, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"  {nombre}: {(DATOS_WEB / nombre).stat().st_size / 1024:.0f} KB")


def adult3d(X, y):
    X3 = X[VARIABLES_3D].to_numpy(dtype=int)
    X_ent, X_resto, y_ent, y_resto = train_test_split(X3, y, train_size=10_000, stratify=y, random_state=SEED)
    X_pru, _, y_pru, _ = train_test_split(X_resto, y_resto, train_size=5_000, stratify=y_resto, random_state=SEED)
    vista, _ = train_test_split(np.arange(len(y_ent)), train_size=400, stratify=y_ent, random_state=SEED)

    referencia = []
    for d in PROFUNDIDADES_3D:
        arbol = DecisionTreeClassifier(max_depth=d, random_state=SEED).fit(X_ent, y_ent)
        referencia.append(
            {"profundidad": d, "acc_entrenamiento": arbol.score(X_ent, y_ent), "acc_prueba": arbol.score(X_pru, y_pru)}
        )

    guardar(
        "adult3d.json",
        {
            "variables": NOMBRES_3D,
            "entrenamiento": {"X": X_ent.tolist(), "y": y_ent.tolist()},
            "prueba": {"X": X_pru.tolist(), "y": y_pru.tolist()},
            "vista": sorted(vista.tolist()),
            "referencia_sklearn": referencia,
        },
    )


def curva_profundidad(X, y):
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=SEED)
    filas = []
    for d in PROFUNDIDADES:
        modelo = make_pipeline(preprocesador(X), DecisionTreeClassifier(max_depth=d, random_state=SEED))
        r = cross_validate(modelo, X, y, cv=cv, scoring=["accuracy", "f1_macro"], return_train_score=True)
        filas.append(
            {
                "profundidad": d,  # None = sin límite
                "acc_entrenamiento": float(np.mean(r["train_accuracy"])),
                "acc_cv": float(np.mean(r["test_accuracy"])),
                "acc_cv_desv": float(np.std(r["test_accuracy"])),
                "f1_entrenamiento": float(np.mean(r["train_f1_macro"])),
                "f1_cv": float(np.mean(r["test_f1_macro"])),
            }
        )
    mejor = max((f for f in filas if f["profundidad"] is not None), key=lambda f: f["acc_cv"])
    print(f"  mejor profundidad por accuracy de CV: {mejor['profundidad']} ({mejor['acc_cv']:.4f})")
    guardar("curva_profundidad.json", filas)


def educacion_logloss(X, y):
    edu = X["education-num"].to_numpy(dtype=float)
    media, desv = edu.mean(), edu.std()  # desviación poblacional, igual que StandardScaler
    z = ((edu - media) / desv).reshape(-1, 1)

    # Sin regularización: así el mínimo es exactamente el de la log-loss que dibuja la diapositiva.
    reg = LogisticRegression(C=np.inf, max_iter=1000).fit(z, y)
    w, b = float(reg.coef_[0, 0]), float(reg.intercept_[0])
    perdida = log_loss(y, reg.predict_proba(z)[:, 1])

    valores = sorted(set(edu.astype(int).tolist()))
    conteos = [
        {"educacion": v, "positivos": int(((edu == v) & (y == 1)).sum()), "negativos": int(((edu == v) & (y == 0)).sum())}
        for v in valores
    ]
    print(f"  sklearn: w* = {w:.5f}, b* = {b:.5f}, log-loss = {perdida:.6f}")
    guardar(
        "educacion_logloss.json",
        {"media": media, "desv": desv, "conteos": conteos, "sklearn": {"w": w, "b": b, "logloss": perdida}},
    )


def main():
    X, y = cargar_adult()
    print(f"Adult: {len(y)} filas")
    adult3d(X, y)
    curva_profundidad(X, y)
    educacion_logloss(X, y)


if __name__ == "__main__":
    main()
