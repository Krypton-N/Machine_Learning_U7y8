// Árbol de clasificación CART binario con criterio Gini, sin podas: solo max_depth.
// Sigue las mismas reglas que DecisionTreeClassifier de sklearn (cortes en el punto medio entre valores
// distintos, se divide mientras el nodo no sea puro), así que sus resultados se pueden verificar contra él.

export type ClassNode =
  | { leaf: true; n: number; pos: number }
  | { leaf: false; n: number; pos: number; feature: number; threshold: number; left: ClassNode; right: ClassNode };

const gini = (n: number, pos: number) => {
  if (n === 0) return 0;
  const p = pos / n;
  return 2 * p * (1 - p);
};

function build(X: number[][], y: number[], idx: number[], depth: number, maxDepth: number): ClassNode {
  const n = idx.length;
  let pos = 0;
  for (const i of idx) pos += y[i];
  if (depth >= maxDepth || pos === 0 || pos === n || n < 2) return { leaf: true, n, pos };

  // Mejor corte: el que minimiza la impureza ponderada de los dos hijos.
  // Se agrupa por valor distinto (conteo y positivos) y se recorren los valores en orden: da los mismos
  // candidatos que ordenar a las personas, pero cuesta O(n + V log V) en vez de O(n log n).
  let best = { score: Infinity, feature: -1, threshold: 0 };
  const nFeatures = X[0].length;
  for (let f = 0; f < nFeatures; f++) {
    const grupos = new Map<number, [number, number]>();
    for (const i of idx) {
      const g = grupos.get(X[i][f]);
      if (g) {
        g[0]++;
        g[1] += y[i];
      } else grupos.set(X[i][f], [1, y[i]]);
    }
    if (grupos.size < 2) continue;
    const valores = [...grupos.keys()].sort((a, b) => a - b);
    let nL = 0;
    let posL = 0;
    for (let k = 0; k < valores.length - 1; k++) {
      const [c, p] = grupos.get(valores[k])!;
      nL += c;
      posL += p;
      const nR = n - nL;
      const score = nL * gini(nL, posL) + nR * gini(nR, pos - posL);
      if (score < best.score - 1e-12) best = { score, feature: f, threshold: (valores[k] + valores[k + 1]) / 2 };
    }
  }
  if (best.feature < 0) return { leaf: true, n, pos };

  const left: number[] = [];
  const right: number[] = [];
  for (const i of idx) (X[i][best.feature] <= best.threshold ? left : right).push(i);
  return {
    leaf: false,
    n,
    pos,
    feature: best.feature,
    threshold: best.threshold,
    left: build(X, y, left, depth + 1, maxDepth),
    right: build(X, y, right, depth + 1, maxDepth),
  };
}

export function fitClassifier(X: number[][], y: number[], maxDepth: number, idx?: number[]): ClassNode {
  return build(X, y, idx ?? X.map((_, i) => i), 0, maxDepth);
}

/** Proporción de la clase positiva en la hoja donde cae x. */
export function predictProba(node: ClassNode, x: number[]): number {
  while (!node.leaf) node = x[node.feature] <= node.threshold ? node.left : node.right;
  return node.pos / node.n;
}

/** Clase predicha; con empate 50/50 gana la clase 0, igual que sklearn (argmax toma la primera). */
export const predictClass = (node: ClassNode, x: number[]) => (predictProba(node, x) > 0.5 ? 1 : 0);

export function accuracy(node: ClassNode, X: number[][], y: number[]): number {
  let ok = 0;
  for (let i = 0; i < X.length; i++) if (predictClass(node, X[i]) === y[i]) ok++;
  return ok / X.length;
}

export type Box = { min: number[]; max: number[]; n: number; pos: number };

/** Cajas (hiperrectángulos) de las hojas, recortadas a `bounds`: así se dibuja la partición del árbol. */
export function leafBoxes(node: ClassNode, bounds: { min: number[]; max: number[] }): Box[] {
  if (node.leaf) return [{ min: bounds.min, max: bounds.max, n: node.n, pos: node.pos }];
  const f = node.feature;
  const t = Math.min(Math.max(node.threshold, bounds.min[f]), bounds.max[f]);
  const leftMax = [...bounds.max];
  leftMax[f] = t;
  const rightMin = [...bounds.min];
  rightMin[f] = t;
  return [
    ...leafBoxes(node.left, { min: bounds.min, max: leftMax }),
    ...leafBoxes(node.right, { min: rightMin, max: bounds.max }),
  ];
}
