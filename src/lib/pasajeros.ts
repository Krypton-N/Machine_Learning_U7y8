// Pasajeros aéreos 1949–1960 (serie G de Box y Jenkins), exportados por scripts/exportar_hito4.py; los modelos
// ajustados, por scripts/exportar_hito5.py (no se editan a mano).
// En todo el código de series la posición i cuenta desde 0 (i = 0 es enero de 1949); en pantalla se usa t = i + 1.
import adfJson from "../data/adf_pasajeros.json";
import pasajerosJson from "../data/pasajeros.json";
import modelosJson from "../data/series_modelos.json";
import validacionJson from "../data/validacion_temporal.json";
import { diferencia, porPeriodo } from "./series.ts";

export const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
/** Los nombres completos, para las frases ("mar" a secas se lee como otra palabra). */
export const MESES_COMPLETOS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
export const ANIO_INICIAL = pasajerosJson.inicio[0];

const valores: number[] = pasajerosJson.valores;

/**
 * `crudo`: las primeras 5 filas tal como llegan (`time` es el año en decimal). `valores`: los 144 totales
 * mensuales, en miles. `matriz[año][mes]`: los mismos valores en renglones de 12.
 */
export const pasajeros = {
  fuente: pasajerosJson.fuente,
  unidades: pasajerosJson.unidades,
  crudo: pasajerosJson.crudo as { columnas: { nombre: string; tipo: "num" | "cat" }[]; filas: (string | number | null)[][] },
  valores,
  matriz: porPeriodo(valores, 12),
  /** Meses con los que se ajusta desde la diapositiva 41 (1949–1959); el resto es la prueba. */
  nEntrenamiento: pasajerosJson.n_entrenamiento,
};

export const ANIOS = pasajeros.matriz.map((_, a) => ANIO_INICIAL + a);

/** Posición (0 = enero de 1949) → año y mes (0 = enero). */
export const fecha = (i: number) => ({ anio: ANIO_INICIAL + Math.floor(i / 12), mes: i % 12 });

/** Posición → "jul 1955". */
export const etiqueta = (i: number) => `${MESES[i % 12]} ${ANIO_INICIAL + Math.floor(i / 12)}`;

export type Transformacion = "original" | "log" | "dlog" | "d12log" | "dd12log";

/**
 * Cada transformación con su fórmula y con la posición de la serie original donde empieza (`desde`): cada
 * diferencia se come los primeros meses.
 */
function transformar(x: number[]): Record<Transformacion, { valores: number[]; desde: number; tex: string; nombre: string }> {
  const log = x.map(Math.log);
  const d12log = diferencia(log, 12);
  return {
    original: { valores: x, desde: 0, tex: "x_t", nombre: "pasajeros" },
    log: { valores: log, desde: 0, tex: "\\log x_t", nombre: "log" },
    dlog: { valores: diferencia(log, 1), desde: 1, tex: "\\nabla \\log x_t", nombre: "∇ log" },
    d12log: { valores: d12log, desde: 12, tex: "\\nabla_{12} \\log x_t", nombre: "∇₁₂ log" },
    dd12log: { valores: diferencia(d12log, 1), desde: 13, tex: "\\nabla\\nabla_{12} \\log x_t", nombre: "∇∇₁₂ log" },
  };
}

/** Con los 144 meses: lo que describen las diapositivas 29 a 40. */
export const TRANSFORMACIONES = transformar(valores);

// ---------- Desde la diapositiva 41: se ajusta con 1949–1959 y 1960 se guarda como prueba ----------

/** Los 132 meses con los que se ajusta todo modelo. */
export const entrenamiento = valores.slice(0, pasajeros.nEntrenamiento);
/** Los 12 meses de 1960: no se usan para ajustar ni para elegir, solo para medir. */
export const prueba = valores.slice(pasajeros.nEntrenamiento);
/** Las mismas transformaciones, calculadas solo con el entrenamiento. */
export const TRANSFORMACIONES_ENT = transformar(entrenamiento);

/** Un pronóstico en logaritmo, de regreso a miles de pasajeros. */
export const enMiles = (logaritmos: number[]) => logaritmos.map(Math.exp);

type OrdenSarima = { orden: number[]; estacional: number[] };
/**
 * Lo que ajusta statsmodels con 1949–1959 (scripts/exportar_hito5.py). Los pronósticos y sus bandas del 95 % vienen
 * en logaritmo; los residuos ya no traen los 13 primeros, que son el arranque del filtro.
 */
export const modelos = modelosJson as {
  versiones: { statsmodels: string };
  /** MA(1) sobre ∇∇₁₂ log (43). */
  ma1: { theta: number; ee: number; sigma2: number; ajustados: number[]; pronostico: number[] };
  /** Cuatro modelos para el crecimiento anual, ∇₁₂ log (44). */
  arma_crecimiento: { id: string; ar: number[]; ma: number[]; media: number; sigma2: number; aic: number }[];
  /** ARIMA(0,1,1) con deriva sobre el logaritmo, y la rejilla de los 9 sin estación (45). */
  arima: { orden: number[]; deriva: number; theta: number; sigma2: number; pronostico_log: number[]; ic95_log: number[][]; rejilla: { orden: number[]; aic: number; raiz_ma: number | null; mae_1960: number }[] };
  /** Los 16 SARIMA(p,1,q)(P,1,Q)₁₂ (48). `k` cuenta también la varianza. */
  sarima_rejilla: (OrdenSarima & { aic: number; bic: number; llf: number; k: number; metodo: string; pronostico_log: number[] })[];
  /** El de menor AIC: el modelo de aerolínea (47–50). */
  elegido: OrdenSarima & { regla: string; theta: number; Theta: number; sigma2: number; ee: { theta: number; Theta: number }; nobs_efectivas: number; pronostico_log: number[]; ic95_log: number[][]; residuos: number[] };
  /** El bosque de la 30, entrenado aquí con 1949–1959 (49). */
  linea_base: { bosque: { descripcion: string; pronostico: number[] } };
  /** Un ajuste por año pronosticado, cada uno solo con los meses anteriores (50). */
  origen_movil: {
    anio: number;
    n_entrenamiento: number;
    segundo: OrdenSarima & { delta_aic: number };
    sarima: { theta: number; Theta: number; pronostico_log: number[]; residuos: number[] };
    arima: { deriva: number; theta: number; pronostico_log: number[] };
  }[];
};

type ModeloValidado = {
  id: string;
  nombre: string;
  descripcion: string;
  /** Predicción de cada uno de los 144 meses cuando le tocó ser prueba en el K-Fold barajado. */
  pred_barajado: number[];
  /** Pronóstico de los meses posteriores al corte, entrenando solo con los anteriores. */
  pronostico: number[];
  mae_barajado: number;
  mae_pronostico: number;
  /** El MAE barajado sobre los mismos meses con otros 20 barajados (semillas 0…19). */
  mae_barajados: number[];
};
/** El mismo modelo evaluado con K-Fold barajado y pronosticando (diapositiva 30). */
export const validacionTemporal = validacionJson as { corte: number; semilla: number; pliegue: number[]; modelos: ModeloValidado[] };

export type FilaADF = { id: string; estadistico: number; p: number; rezagos: number; nobs: number; criticos: Record<string, number>; fraccion_simulada?: number };
/**
 * Prueba ADF de cada transformación con los valores por omisión de statsmodels; `sensibilidad` repite la prueba
 * eligiendo los rezagos por BIC, sin 1960 y con tendencia. `esquema` y `nulo` son las simulaciones de la diapositiva 37.
 */
export const adf = adfJson as {
  config: { regression: string; autolag: string };
  filas: FilaADF[];
  sensibilidad: { bic: FilaADF[]; sin_1960: FilaADF[]; con_tendencia: FilaADF[] };
  esquema: { semilla: number; phi: number; choques: number[]; ar1: number[]; caminata: number[]; df: Record<"ar1" | "caminata", FilaADF & { gamma: number }> };
  nulo: { R: number; n: number; semilla: number; bordes: number[]; conteos: number[]; percentil5: number; mediana: number };
};
