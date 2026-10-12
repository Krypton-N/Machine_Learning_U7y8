// AdaBoost discreto para dos clases, con stumps (árboles de una pregunta) como modelo débil.
// Las etiquetas 0/1 se tratan como −1/+1. Es la versión binaria: α = ½·ln((1 − ε)/ε).
// sklearn (SAMME) usa el doble de α y clasifica igual.

export type Stump = {
  /** −1 si no encontró ningún corte (responde siempre lo mismo). */
  feature: number;
  threshold: number;
  /** Respuesta (−1 o +1) a cada lado del corte. */
  left: 1 | -1;
  right: 1 | -1;
};

export type Ronda = {
  stump: Stump;
  /** Error ponderado del stump con los pesos de esta ronda. */
  eps: number;
  /** Peso del voto del stump. */
  alpha: number;
  /** Pesos de cada ejemplo antes y después de la actualización (suman 1). */
  pesosAntes: number[];
  pesos: number[];
};

const gini = (w: number, wPos: number) => {
  if (w <= 0) return 0;
  const p = wPos / w;
  return 2 * p * (1 - p);
};

/** El stump que minimiza la impureza de Gini ponderada, como DecisionTreeClassifier(max_depth=1) con sample_weight. */
export function fitStump(X: number[][], y: number[], w: number[]): Stump {
  let total = 0;
  let totalPos = 0;
  for (let i = 0; i < y.length; i++) {
    total += w[i];
    totalPos += w[i] * y[i];
  }
  const signo = (wSide: number, pos: number): 1 | -1 => (pos > wSide - pos ? 1 : -1);
  let best = { score: total * gini(total, totalPos) - 1e-12, feature: -1, threshold: 0, left: signo(total, totalPos), right: signo(total, totalPos) };
  for (let f = 0; f < X[0].length; f++) {
    const grupos = new Map<number, [number, number]>();
    for (let i = 0; i < y.length; i++) {
      const g = grupos.get(X[i][f]);
      if (g) {
        g[0] += w[i];
        g[1] += w[i] * y[i];
      } else grupos.set(X[i][f], [w[i], w[i] * y[i]]);
    }
    if (grupos.size < 2) continue;
    const valores = [...grupos.keys()].sort((a, b) => a - b);
    let wL = 0;
    let posL = 0;
    for (let k = 0; k < valores.length - 1; k++) {
      const [c, p] = grupos.get(valores[k])!;
      wL += c;
      posL += p;
      const wR = total - wL;
      const posR = totalPos - posL;
      const score = wL * gini(wL, posL) + wR * gini(wR, posR);
      if (score < best.score - 1e-12) {
        best = { score, feature: f, threshold: (valores[k] + valores[k + 1]) / 2, left: signo(wL, posL), right: signo(wR, posR) };
      }
    }
  }
  return { feature: best.feature, threshold: best.threshold, left: best.left, right: best.right };
}

export const votoStump = (s: Stump, x: number[]): 1 | -1 => (s.feature < 0 || x[s.feature] <= s.threshold ? s.left : s.right);

/** Entrena hasta `rondas` stumps. Se detiene antes si un stump no supera al azar (ε ≥ 0.5) o no se equivoca (ε = 0). */
export function adaboost(X: number[][], y: number[], rondas: number): Ronda[] {
  const n = y.length;
  let w = new Array<number>(n).fill(1 / n);
  const out: Ronda[] = [];
  for (let m = 0; m < rondas; m++) {
    const stump = fitStump(X, y, w);
    const aciertos = X.map((x, i) => votoStump(stump, x) === (y[i] ? 1 : -1));
    const eps = aciertos.reduce((s, ok, i) => (ok ? s : s + w[i]), 0);
    if (eps <= 0 || eps >= 0.5) break;
    const alpha = 0.5 * Math.log((1 - eps) / eps);
    // Los mal clasificados se multiplican por e^{α} y los bien clasificados por e^{−α}; luego se normaliza.
    const crudo = w.map((wi, i) => wi * Math.exp(aciertos[i] ? -alpha : alpha));
    const suma = crudo.reduce((s, v) => s + v, 0);
    const nuevo = crudo.map((v) => v / suma);
    out.push({ stump, eps, alpha, pesosAntes: w, pesos: nuevo });
    w = nuevo;
  }
  return out;
}

/** F_M(x) = Σ α_m · h_m(x) con las primeras M rondas. El comité responde "sí" cuando F > 0. */
export function puntaje(rondas: Ronda[], x: number[], M = rondas.length): number {
  let f = 0;
  for (let m = 0; m < M; m++) f += rondas[m].alpha * votoStump(rondas[m].stump, x);
  return f;
}

/** Error del comité con 1, 2, …, M rondas sobre un conjunto. */
export function errorPorRonda(rondas: Ronda[], X: number[][], y: number[]): number[] {
  const F = new Float64Array(X.length);
  return rondas.map((r) => {
    let mal = 0;
    for (let i = 0; i < X.length; i++) {
      F[i] += r.alpha * votoStump(r.stump, X[i]);
      if ((F[i] > 0 ? 1 : 0) !== y[i]) mal++;
    }
    return mal / X.length;
  });
}
