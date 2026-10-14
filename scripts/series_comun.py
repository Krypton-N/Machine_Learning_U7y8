"""Carga de pasajeros aéreos (AirPassengers, la serie G de Box y Jenkins), compartida por los scripts de series."""

import numpy as np
from statsmodels.datasets import get_rdataset

from adult_comun import CACHE

# Desde la diapositiva 41 se ajusta con 1949–1959 (132 meses) y 1960 queda como prueba.
N_ENTRENAMIENTO = 132
MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]


def cargar_pasajeros_crudo():
    """El archivo tal como llega de Rdatasets: 144 filas con `time` (año en decimal) y `value` (miles de pasajeros).

    Solo necesita internet la primera vez; después lee de scripts/cache/rdatasets.
    """
    return get_rdataset("AirPassengers", "datasets", cache=str(CACHE / "rdatasets")).data


def cargar_pasajeros():
    """Los 144 totales mensuales, de enero de 1949 a diciembre de 1960, como arreglo de flotantes."""
    y = cargar_pasajeros_crudo()["value"].to_numpy(dtype=float)
    # Si la fuente cambiara, todo lo que sigue dejaría de ser la serie G: mejor fallar aquí.
    assert len(y) == 144 and y.sum() == 40363 and y[0] == 112 and y[-1] == 432, "AirPassengers no es el esperado"
    assert y.argmin() == 10 and y.min() == 104 and y.argmax() == 138 and y.max() == 622
    assert not np.isnan(y).any()
    return y


def etiqueta(i):
    """Índice (0 = enero de 1949) → 'jul 1955'."""
    return f"{MESES[i % 12]} {1949 + i // 12}"
