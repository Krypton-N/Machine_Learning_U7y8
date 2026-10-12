// Regresión logística con una sola variable: P(y=1) = σ(w·z + b).
// La pérdida se evalúa sobre datos agregados (cuántos positivos y negativos hay por cada valor de z),
// que da exactamente lo mismo que sumar persona por persona.

export type Grupo = { z: number; positivos: number; negativos: number };

export const sigmoid = (t: number) => 1 / (1 + Math.exp(-t));

/** Log-loss promedio (entropía cruzada binaria). */
export function logLoss(grupos: Grupo[], w: number, b: number): number {
  let total = 0;
  let n = 0;
  for (const g of grupos) {
    const t = w * g.z + b;
    // -log σ(t) = log(1 + e^{-t}) y -log(1 - σ(t)) = log(1 + e^{t}), escritos de forma estable.
    total += g.positivos * softplus(-t) + g.negativos * softplus(t);
    n += g.positivos + g.negativos;
  }
  return total / n;
}

/** Gradiente de la log-loss promedio: (1/N) Σ (p − y)·(z, 1). */
export function logLossGrad(grupos: Grupo[], w: number, b: number): [number, number] {
  let gw = 0;
  let gb = 0;
  let n = 0;
  for (const g of grupos) {
    const m = g.positivos + g.negativos;
    const r = m * sigmoid(w * g.z + b) - g.positivos; // Σ (p − y) dentro del grupo
    gw += r * g.z;
    gb += r;
    n += m;
  }
  return [gw / n, gb / n];
}

const softplus = (t: number) => (t > 0 ? t + Math.log1p(Math.exp(-t)) : Math.log1p(Math.exp(t)));

/** Hessiana de la log-loss promedio: (1/N) Σ p(1−p)·[[z², z], [z, 1]]. Mide la curvatura. */
export function logLossHessian(grupos: Grupo[], w: number, b: number): [[number, number], [number, number]] {
  let hww = 0;
  let hwb = 0;
  let hbb = 0;
  let n = 0;
  for (const g of grupos) {
    const m = g.positivos + g.negativos;
    const p = sigmoid(w * g.z + b);
    const k = m * p * (1 - p);
    hww += k * g.z * g.z;
    hwb += k * g.z;
    hbb += k;
    n += m;
  }
  return [
    [hww / n, hwb / n],
    [hwb / n, hbb / n],
  ];
}

/** Valor propio mayor de una matriz simétrica 2×2: la curvatura en la dirección más empinada. */
export function maxEigen([[a, b], [, d]]: [[number, number], [number, number]]): number {
  return (a + d) / 2 + Math.sqrt(((a - d) / 2) ** 2 + b * b);
}
