"""Carga y preprocesamiento de Adult (Census Income), compartidos por todos los scripts."""

from pathlib import Path

from sklearn.compose import ColumnTransformer
from sklearn.datasets import fetch_openml
from sklearn.impute import SimpleImputer
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import OrdinalEncoder

SEED = 42
RAIZ = Path(__file__).parent
CACHE = RAIZ / "cache"
DATOS_WEB = RAIZ.parent / "src" / "data"  # JSON que leen las diapositivas


# Columnas del archivo que no se usan como variables.
# fnlwgt es el peso censal: a cuántas personas de la población representa la fila. Es un dato del muestreo,
# no una característica de la persona, y no debe servir para predecir su ingreso.
EXCLUIDAS = ["fnlwgt"]


def cargar_adult_crudo():
    """El archivo tal cual llega: sus 14 columnas y la clase como texto ('>50K' o '<=50K')."""
    datos = fetch_openml("adult", version=2, as_frame=True, data_home=CACHE)
    return datos.data, datos.target


def cargar_adult():
    """Lo que usan los modelos: las columnas sin las excluidas, e y = 1 si gana más de 50K."""
    X, clase = cargar_adult_crudo()
    y = (clase == ">50K").astype(int).to_numpy()
    return X.drop(columns=EXCLUIDAS), y


def preprocesador(X):
    # Árboles y ensambles no necesitan one-hot ni escalado: basta con codificar categorías como enteros.
    # Los faltantes de las categóricas se vuelven su propia categoría ("faltante").
    categoricas = X.select_dtypes(include=["category", "object"]).columns.tolist()
    return ColumnTransformer(
        [
            (
                "cat",
                make_pipeline(
                    SimpleImputer(strategy="constant", fill_value="faltante"),
                    OrdinalEncoder(handle_unknown="use_encoded_value", unknown_value=-1),
                ),
                categoricas,
            )
        ],
        remainder="passthrough",
    )
