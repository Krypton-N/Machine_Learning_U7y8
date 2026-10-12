// Métricas de clasificación binaria a partir de la matriz de confusión.
// "Positiva" es la clase que se busca (en Adult: gana > 50K).

export type Matriz = {
  /** Verdaderos positivos: dijo sí y sí era. */
  vp: number;
  /** Falsos positivos: dijo sí y no era (falsa alarma). */
  fp: number;
  /** Falsos negativos: dijo no y sí era (se le escapó). */
  fn: number;
  /** Verdaderos negativos: dijo no y no era. */
  vn: number;
};

// Si el denominador es 0 la métrica no está definida; se toma 0, la misma convención de scikit-learn.
const div = (a: number, b: number) => (b === 0 ? 0 : a / b);

/** Cuenta las cuatro casillas a partir de la respuesta real y la del modelo (1 = sí, 0 = no). */
export function contar(real: ArrayLike<number>, dicho: ArrayLike<number>): Matriz {
  const m = { vp: 0, fp: 0, fn: 0, vn: 0 };
  for (let i = 0; i < real.length; i++) {
    if (dicho[i]) real[i] ? m.vp++ : m.fp++;
    else real[i] ? m.fn++ : m.vn++;
  }
  return m;
}

/** De la forma en que la guarda scikit-learn: [vn, fp, fn, vp]. */
export const desdeSklearn = ([vn, fp, fn, vp]: number[]): Matriz => ({ vp, fp, fn, vn });

export const sumar = (ms: Matriz[]): Matriz =>
  ms.reduce((a, b) => ({ vp: a.vp + b.vp, fp: a.fp + b.fp, fn: a.fn + b.fn, vn: a.vn + b.vn }), { vp: 0, fp: 0, fn: 0, vn: 0 });

export const total = (m: Matriz) => m.vp + m.fp + m.fn + m.vn;

/** Accuracy: de todas las respuestas, cuántas fueron correctas. */
export const exactitud = (m: Matriz) => div(m.vp + m.vn, total(m));

/** Precision: de las veces que dijo sí, cuántas era cierto. */
export const precision = (m: Matriz) => div(m.vp, m.vp + m.fp);

/** Recall: de quienes sí eran, a cuántos encontró. */
export const recall = (m: Matriz) => div(m.vp, m.vp + m.fn);

/** F1: media armónica de precision y recall, 2PR/(P + R) = 2·VP / (2·VP + FP + FN). */
export const f1 = (m: Matriz) => div(2 * m.vp, 2 * m.vp + m.fp + m.fn);

/** La misma matriz vista desde la otra clase: ahora "no" es la que se busca. */
export const invertir = (m: Matriz): Matriz => ({ vp: m.vn, fp: m.fn, fn: m.fp, vn: m.vp });

/** F1-macro: el F1 de cada clase, promediados con el mismo peso. */
export const f1Macro = (m: Matriz) => (f1(m) + f1(invertir(m))) / 2;

export const media = (v: number[]) => v.reduce((s, x) => s + x, 0) / v.length;

/** Desviación estándar poblacional (divide entre n), igual que np.std. */
export function desviacion(v: number[]) {
  const m = media(v);
  return Math.sqrt(v.reduce((s, x) => s + (x - m) ** 2, 0) / v.length);
}
