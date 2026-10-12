// Gradient Boosting: cada árbol de regresión aprende lo que le falta al modelo anterior
// (el gradiente negativo de la pérdida) y se suma multiplicado por la tasa de aprendizaje.

export type RegNode =
  | { leaf: true; idx: number[]; value: number }
  | { leaf: false; feature: number; threshold: number; left: RegNode; right: RegNode };

// Árbol de regresión CART (criterio: error cuadrático) sobre el objetivo r. El valor de cada hoja lo pone quien lo llama.
function crecer(X: number[][], r: ArrayLike<number>, idx: number[], depth: number, maxDepth: number): RegNode {
  const n = idx.length;
  let suma = 0;
  let sumaCuad = 0;
  for (const i of idx) {
    suma += r[i];
    sumaCuad += r[i] * r[i];
  }
  const sse = sumaCuad - (suma * suma) / n;
  if (depth >= maxDepth || n < 2 || sse / n <= 1e-12) return { leaf: true, idx, value: suma / n };

  // Mejor corte: el que más reduce la suma de errores al cuadrado. Equivale a maximizar Σ_L²/n_L + Σ_R²/n_R.
  let best = { ganancia: (suma * suma) / n + 1e-12, feature: -1, threshold: 0 };
  for (let f = 0; f < X[0].length; f++) {
    const grupos = new Map<number, [number, number]>();
    for (const i of idx) {
      const g = grupos.get(X[i][f]);
      if (g) {
        g[0]++;
        g[1] += r[i];
      } else grupos.set(X[i][f], [1, r[i]]);
    }
    if (grupos.size < 2) continue;
    const valores = [...grupos.keys()].sort((a, b) => a - b);
    let nL = 0;
    let sL = 0;
    for (let k = 0; k < valores.length - 1; k++) {
      const [c, s] = grupos.get(valores[k])!;
      nL += c;
      sL += s;
      const g = (sL * sL) / nL + ((suma - sL) * (suma - sL)) / (n - nL);
      if (g > best.ganancia + 1e-12) best = { ganancia: g, feature: f, threshold: (valores[k] + valores[k + 1]) / 2 };
    }
  }
  if (best.feature < 0) return { leaf: true, idx, value: suma / n };

  const izq: number[] = [];
  const der: number[] = [];
  for (const i of idx) (X[i][best.feature] <= best.threshold ? izq : der).push(i);
  return {
    leaf: false,
    feature: best.feature,
    threshold: best.threshold,
    left: crecer(X, r, izq, depth + 1, maxDepth),
    right: crecer(X, r, der, depth + 1, maxDepth),
  };
}

export function valorArbol(node: RegNode, x: number[]): number {
  while (!node.leaf) node = x[node.feature] <= node.threshold ? node.left : node.right;
  return node.value;
}

function hojas(node: RegNode, out: Extract<RegNode, { leaf: true }>[] = []) {
  if (node.leaf) out.push(node);
  else {
    hojas(node.left, out);
    hojas(node.right, out);
  }
  return out;
}

export const sigmoide = (t: number) => 1 / (1 + Math.exp(-t));

// ---------- Regresión con error cuadrático: lo que falta son los residuos y − F ----------

/** Una ronda: ajusta un árbol a los residuos y actualiza F (en sitio) con una fracción `tasa` del árbol. */
export function rondaRegresion(X: number[][], y: number[], F: Float64Array, tasa: number, profundidad: number): RegNode {
  const r = Float64Array.from(y, (v, i) => v - F[i]);
  const arbol = crecer(X, r, X.map((_, i) => i), 0, profundidad);
  for (let i = 0; i < y.length; i++) F[i] += tasa * valorArbol(arbol, X[i]);
  return arbol;
}

// ---------- Clasificación con log-loss: lo que falta es y − p ----------

/** Puntaje inicial: el logaritmo del momio de la proporción de positivos. */
export const puntajeInicial = (y: number[]) => {
  const p = y.reduce((s, v) => s + v, 0) / y.length;
  return Math.log(p / (1 - p));
};

/**
 * Una ronda de Gradient Boosting con log-loss, como GradientBoostingClassifier:
 * el árbol se ajusta a los pseudo-residuos y − p, y cada hoja toma el valor Σ(y − p) / Σ p(1 − p) (un paso de Newton).
 * Actualiza F (en sitio) y devuelve el árbol con sus valores de hoja ya multiplicados por la tasa.
 */
export function rondaLogLoss(X: number[][], y: number[], F: Float64Array, tasa: number, profundidad: number): RegNode {
  const p = Float64Array.from(F, sigmoide);
  const r = Float64Array.from(y, (v, i) => v - p[i]);
  const arbol = crecer(X, r, X.map((_, i) => i), 0, profundidad);
  for (const h of hojas(arbol)) {
    let num = 0;
    let den = 0;
    for (const i of h.idx) {
      num += r[i];
      den += p[i] * (1 - p[i]);
    }
    h.value = Math.abs(den) < 1e-150 ? 0 : (tasa * num) / den;
    for (const i of h.idx) F[i] += h.value;
  }
  return arbol;
}

/** Log-loss promedio de las probabilidades σ(F) contra y. */
export function logLossDe(F: ArrayLike<number>, y: number[]): number {
  let s = 0;
  for (let i = 0; i < y.length; i++) {
    // −log σ(t) = log(1 + e^{−t}), escrito de forma estable.
    const t = y[i] ? -F[i] : F[i];
    s += t > 0 ? t + Math.log1p(Math.exp(-t)) : Math.log1p(Math.exp(t));
  }
  return s / y.length;
}
