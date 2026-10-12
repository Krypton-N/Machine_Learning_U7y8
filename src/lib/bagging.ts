// Bagging: árboles sin límite de profundidad, cada uno entrenado con una muestra bootstrap.
import { fitClassifier, predictProba, type ClassNode } from "./tree.ts";

/** n sorteos con reemplazo entre los índices dados (una muestra bootstrap). */
export function bootstrap(indices: number[], rand: () => number): number[] {
  const n = indices.length;
  return Array.from({ length: n }, () => indices[Math.floor(rand() * n)]);
}

/** Cuántas veces salió cada índice en una muestra (0 = quedó fuera, "out-of-bag"). */
export function multiplicidad(muestra: number[], total: number): number[] {
  const veces = new Array<number>(total).fill(0);
  for (const i of muestra) veces[i]++;
  return veces;
}

/** Un árbol de bagging: bootstrap de `indices` y árbol sin límite de profundidad. */
export function arbolBootstrap(X: number[][], y: number[], indices: number[], rand: () => number, maxDepth = Infinity) {
  const muestra = bootstrap(indices, rand);
  return { tree: fitClassifier(X, y, maxDepth, muestra), muestra };
}

/** Promedio de las probabilidades de los árboles (así agrega sklearn; con hojas puras equivale al voto). */
export function probaPromedio(trees: ClassNode[], x: number[]): number {
  let s = 0;
  for (const t of trees) s += predictProba(t, x);
  return s / trees.length;
}

/** Accuracy del promedio de los primeros 1, 2, …, B árboles sobre un conjunto de prueba. */
export function accuracyPorTamano(trees: ClassNode[], X: number[][], y: number[]): number[] {
  const acum = new Float64Array(X.length);
  return trees.map((t, b) => {
    let ok = 0;
    for (let i = 0; i < X.length; i++) {
      acum[i] += predictProba(t, X[i]);
      if ((acum[i] / (b + 1) > 0.5 ? 1 : 0) === y[i]) ok++;
    }
    return ok / X.length;
  });
}
