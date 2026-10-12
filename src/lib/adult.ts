// Datos de Adult exportados por scripts/exportar_datos.py (no se editan a mano).
import adult3dJson from "../data/adult3d.json";
import curvaJson from "../data/curva_profundidad.json";
import educacionJson from "../data/educacion_logloss.json";
import type { Grupo } from "./logistic.ts";

export type Conjunto = { X: number[][]; y: number[] };

/** Adult con 3 variables: edad, años de educación, horas por semana. */
export const adult3d = adult3dJson as {
  variables: string[];
  entrenamiento: Conjunto;
  prueba: Conjunto;
  vista: number[]; // índices (dentro de entrenamiento) de las 400 personas que se dibujan
  referencia_sklearn: { profundidad: number; acc_entrenamiento: number; acc_prueba: number }[];
};

/** Rango de cada variable en Adult-3D (entrenamiento y prueba), para los ejes de las escenas. */
export const bounds3d = (() => {
  const filas = [...adult3d.entrenamiento.X, ...adult3d.prueba.X];
  return {
    min: [0, 1, 2].map((f) => Math.min(...filas.map((x) => x[f]))),
    max: [0, 1, 2].map((f) => Math.max(...filas.map((x) => x[f]))),
  };
})();

/** Adult completo: accuracy de entrenamiento y de CV (5 pliegues) por profundidad; `null` = sin límite. */
export const curvaProfundidad = curvaJson as {
  profundidad: number | null;
  acc_entrenamiento: number;
  acc_cv: number;
  acc_cv_desv: number;
  f1_entrenamiento: number;
  f1_cv: number;
}[];

/** P(>50K) según años de educación (estandarizados), agregado sobre las 48 842 personas. */
export const educacion = {
  ...educacionJson,
  grupos: educacionJson.conteos.map(
    (c): Grupo => ({ z: (c.educacion - educacionJson.media) / educacionJson.desv, positivos: c.positivos, negativos: c.negativos }),
  ),
};

// ---------- Hito 1 (scripts/exportar_hito1.py) ----------
import comparacionJson from "../data/comparacion_adult.json";
import muestraJson from "../data/adult_muestra.json";
import oobJson from "../data/oob_vs_cv.json";
import varianzaJson from "../data/varianza_ensamble.json";

/**
 * `crudo`: las primeras 5 filas del archivo tal como llega (14 columnas y la clase), antes de cualquier cambio.
 * Lo demás describe lo que usan los modelos: sin las columnas excluidas y con y = 1 si gana más de 50K.
 */
export const adultMuestra = muestraJson as {
  crudo: {
    columnas: { nombre: string; tipo: "num" | "cat" }[];
    filas: (string | number | null)[][];
    excluidas: string[];
    objetivo: string;
    clases: Record<string, number>;
  };
  n: number;
  positivos: number;
  columnas: { nombre: string; nombre_es: string; tipo: "num" | "cat"; faltantes: number }[];
  filas_con_faltantes: number;
  ejemplos: { fila: number; y: number; valores: Record<string, string | number | null> }[];
  pliegues: { n: number; positivos: number }[];
};

type VarianzaMetodo = {
  sigma2: number;
  cov: number;
  rho: number;
  var_promedio: number[];
  var_formula: number[];
  accuracy: number[];
  brier: number[];
};
/** Varianza de un árbol, covarianza entre árboles y varianza del promedio de B árboles (30 repeticiones). */
export const varianzaEnsamble = varianzaJson as {
  R: number;
  B: number;
  n_entrenamiento: number;
  n_prueba: number;
  bagging: VarianzaMetodo;
  random_forest: VarianzaMetodo;
};

type OobMetodo = { oob: number[]; cobertura_oob: number[]; cv_media: number[]; cv_desv: number[]; segundos_un_ajuste: number; segundos_cv: number };
/** Accuracy OOB contra validación cruzada de 5 pliegues, según el número de árboles. */
export const oobVsCv = oobJson as { B: number[]; bagging: OobMetodo; random_forest: OobMetodo };

type Metrica = { media: number; desv: number; pliegues: number[] };
/** Los 7 modelos en Adult completo (5 pliegues estratificados, sin ajustar hiperparámetros). */
export const comparacion = comparacionJson as {
  modelo: string;
  /** Segundos de la validación cruzada completa (5 ajustes y sus predicciones). */
  segundos: number;
  /** Segundos de un solo ajuste con todas las personas: como está configurado (todos los núcleos) y con uno solo. */
  segundos_ajuste: number;
  segundos_ajuste_1_nucleo: number;
  accuracy: Metrica;
  f1_macro: Metrica;
  auc: Metrica;
  accuracy_entrenamiento: number;
}[];

// ---------- Hito 2 (scripts/exportar_hito2.py) ----------
import gbJson from "../data/gb_shrinkage.json";
import importanciasJson from "../data/importancias.json";
import raicesJson from "../data/raices.json";
import rfHiperJson from "../data/rf_hiperparametros.json";
import stumpJson from "../data/stump_adult.json";
import xgbFaltJson from "../data/xgb_faltantes_tiempos.json";
import xgbRegJson from "../data/xgb_regularizacion.json";

/** Nombre en español de cada variable de Adult. */
export const NOMBRE_ES: Record<string, string> = Object.fromEntries(muestraJson.columnas.map((c) => [c.nombre, c.nombre_es]));

type Raices = { raiz: Record<string, number>; segundo_nivel: Record<string, number>; por_arbol: string[] };
/** Variable de la primera pregunta de 100 árboles de bagging y 100 de Random Forest. */
export const raices = raicesJson as unknown as { bagging: Raices; random_forest: Raices; max_features_rf: number; variables: number };

type Barrido = { valor: number; acc: number; acc_desv: number; f1: number }[];
/** Accuracy de CV de Random Forest (100 árboles) según dos hiperparámetros. */
export const rfHiper = rfHiperJson as { max_features: Barrido; min_samples_leaf: Barrido };

/** Importancia de cada variable según MDI y según permutación, con una columna de ruido como control. */
export const importancias = importanciasJson as {
  accuracy_prueba: number;
  filas: { variable: string; nombre_es: string; mdi: number; permutacion: number; permutacion_desv: number; valores_distintos: number }[];
};

type Lado = { n: number; positivos: number };
/** El mejor árbol de una sola pregunta sobre Adult completo. */
export const stumpAdult = stumpJson as {
  variable: string;
  nombre_es: string;
  umbral: number;
  categorias: { izquierda: string[]; derecha: string[] } | null;
  izquierda: Lado;
  derecha: Lado;
  accuracy_cv: number;
  accuracy_mayoritaria: number;
};

type Prueba = { logloss: number; error: number };
/** Gradient Boosting (profundidad 3) con varias tasas de aprendizaje; partición 60/20/20. */
export const gbShrinkage = gbJson as {
  n_entrenamiento: number;
  n_validacion: number;
  n_prueba: number;
  arboles: number[];
  tasas: {
    tasa: number;
    logloss_entrenamiento: number[];
    logloss_validacion: number[];
    error_validacion: number[];
    mejor_n: number;
    mejor_logloss_validacion: number;
    paro_n: number;
    prueba_en_paro: Prueba;
    prueba_al_final: Prueba;
  }[];
};

/** XGBoost (300 árboles) con distintos λ y γ. */
export const xgbRegularizacion = xgbRegJson as {
  lambda: number;
  gamma: number;
  hojas: number;
  valor_hoja_abs_medio: number;
  logloss_entrenamiento: number;
  logloss_validacion: number;
}[];

type MedidaXgb = { acc: number; acc_desv: number; f1: number; logloss: number };
/** XGBoost con faltantes nativos contra imputados, a qué rama manda los faltantes, y tiempos de entrenamiento. */
export const xgbFaltantes = xgbFaltJson as {
  comparacion: { nativo: MedidaXgb; como_categoria: MedidaXgb };
  direccion: { variable: string; nombre_es: string; faltantes: number; cortes: number; faltante_a_la_izquierda: number }[];
  tiempos: { nucleos: number; gradient_boosting_sklearn: number; xgboost_un_nucleo: number; xgboost_todos: number };
};

// ---------- Hito 3 (scripts/exportar_hito3.py) ----------
import curvasJson from "../data/curvas_n_estimators.json";
import matricesJson from "../data/matrices_adult.json";
import ruidoJson from "../data/ruido_etiquetas.json";
import { desdeSklearn, sumar } from "./metricas.ts";

// `todas` junta los 5 pliegues: cada persona cuenta una vez, calificada por el modelo que no la vio.
const conMatrices = <T extends { pliegues: number[][] }>(m: T) => {
  const pliegues = m.pliegues.map(desdeSklearn);
  return { ...m, pliegues, todas: sumar(pliegues) };
};
/** Matriz de confusión de cada modelo en cada pliegue, y la del árbol podado a la mejor profundidad de la diapositiva 5. */
export const matrices = {
  modelos: matricesJson.modelos.map(conMatrices),
  arbolPodado: conMatrices(matricesJson.arbol_podado),
};

type Curva = { entrenamiento: number[]; validacion: number[]; validacion_desv: number[]; mejor_n: number; mejor_validacion: number };
/** Error (1 − accuracy) de entrenamiento y de validación con los primeros n árboles; promedio de los 5 pliegues. */
export const curvasArboles = curvasJson as { arboles: number[]; usados_en_la_comparacion: number; modelos: Record<string, Curva> };

/**
 * Accuracy y F1-macro por pliegue cuando una fracción de las etiquetas de entrenamiento está volteada.
 * Además de los modelos de la comparación trae dos controles: "Random Forest podado" y "XGBoost profundo".
 */
export const ruidoEtiquetas = ruidoJson as {
  fracciones: number[];
  profundidad_podado: number;
  profundidad_profundo: number;
  modelos: { modelo: string; accuracy: number[][]; f1_macro: number[][] }[];
};
