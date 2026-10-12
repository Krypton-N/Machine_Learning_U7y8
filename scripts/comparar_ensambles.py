"""Prueba: ¿se distinguen los ensambles en Adult (Census Income)?

Mismo protocolo que la diapositiva 26: validación cruzada estratificada de 5 pliegues, misma semilla para
todos los modelos y las mismas particiones. Imprime accuracy, F1-macro y AUC (media ± desviación).

Solo imprime. El JSON que leen las diapositivas (comparacion_adult.json, con el valor de cada pliegue) lo escribe
exportar_hito3.py, que toma de aquí la lista de modelos.

Uso:  .venv/Scripts/python scripts/comparar_ensambles.py
"""

import time

import numpy as np
from sklearn.dummy import DummyClassifier
from sklearn.ensemble import (
    AdaBoostClassifier,
    BaggingClassifier,
    GradientBoostingClassifier,
    RandomForestClassifier,
)
from sklearn.model_selection import StratifiedKFold, cross_validate
from sklearn.pipeline import make_pipeline
from sklearn.tree import DecisionTreeClassifier
from xgboost import XGBClassifier

from adult_comun import SEED, cargar_adult, preprocesador


def modelos():
    return {
        "Clase mayoritaria": DummyClassifier(strategy="most_frequent"),
        "Árbol de decisión": DecisionTreeClassifier(random_state=SEED),
        "Bagging": BaggingClassifier(DecisionTreeClassifier(), n_estimators=300, random_state=SEED, n_jobs=-1),
        "Random Forest": RandomForestClassifier(n_estimators=300, random_state=SEED, n_jobs=-1),
        "AdaBoost": AdaBoostClassifier(n_estimators=300, random_state=SEED),
        "Gradient Boosting": GradientBoostingClassifier(n_estimators=300, random_state=SEED),
        "XGBoost": XGBClassifier(n_estimators=300, learning_rate=0.1, max_depth=6, random_state=SEED, n_jobs=-1),
    }


def main():
    X, y = cargar_adult()
    print(f"Adult: {X.shape[0]} filas, {X.shape[1]} variables, clase positiva (>50K) = {y.mean():.1%}")
    print(f"Faltantes por columna: {X.isna().sum()[X.isna().sum() > 0].to_dict()}\n")

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=SEED)
    metricas = {"accuracy": "accuracy", "f1_macro": "f1_macro", "auc": "roc_auc"}

    for nombre, modelo in modelos().items():
        t0 = time.perf_counter()
        r = cross_validate(make_pipeline(preprocesador(X), modelo), X, y, cv=cv, scoring=metricas, return_train_score=True)
        fila = {"modelo": nombre, "segundos": round(time.perf_counter() - t0, 1)}
        for m in metricas:
            fila[m] = {"media": float(np.mean(r[f"test_{m}"])), "desv": float(np.std(r[f"test_{m}"]))}
            fila[f"{m}_entrenamiento"] = float(np.mean(r[f"train_{m}"]))
        print(
            f"{nombre:<20} acc {fila['accuracy']['media']:.4f} ± {fila['accuracy']['desv']:.4f} | "
            f"F1-macro {fila['f1_macro']['media']:.4f} ± {fila['f1_macro']['desv']:.4f} | "
            f"AUC {fila['auc']['media']:.4f} ± {fila['auc']['desv']:.4f} | "
            f"acc entren. {fila['accuracy_entrenamiento']:.4f} | {fila['segundos']} s"
        )


if __name__ == "__main__":
    main()
