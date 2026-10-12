// HMM discreto: algoritmos Forward y Viterbi exactos (sin logaritmos; T es chico).

export type HMM = {
  states: string[];
  symbols: string[];
  pi: number[]; // π_i = P(q₁ = i)
  A: number[][]; // A[i][j] = P(q_{t+1} = j | q_t = i)
  B: number[][]; // B[i][k] = P(o_t = k | q_t = i)
};

/** alpha[t][j] = P(o₁…o_t, q_t = j | λ) */
export function forward(m: HMM, obs: number[]): number[][] {
  const N = m.states.length;
  const alpha = [m.pi.map((p, j) => p * m.B[j][obs[0]])];
  for (let t = 1; t < obs.length; t++) {
    alpha.push(
      Array.from({ length: N }, (_, j) => {
        let s = 0;
        for (let i = 0; i < N; i++) s += alpha[t - 1][i] * m.A[i][j];
        return s * m.B[j][obs[t]];
      }),
    );
  }
  return alpha;
}

/** delta[t][j] = probabilidad del mejor camino que termina en j en t; psi = de qué estado viene. */
export function viterbi(m: HMM, obs: number[]) {
  const N = m.states.length;
  const delta = [m.pi.map((p, j) => p * m.B[j][obs[0]])];
  const psi: number[][] = [m.pi.map(() => -1)];
  for (let t = 1; t < obs.length; t++) {
    const d: number[] = [];
    const b: number[] = [];
    for (let j = 0; j < N; j++) {
      let best = -1;
      let arg = 0;
      for (let i = 0; i < N; i++) {
        const v = delta[t - 1][i] * m.A[i][j];
        if (v > best) [best, arg] = [v, i];
      }
      d.push(best * m.B[j][obs[t]]);
      b.push(arg);
    }
    delta.push(d);
    psi.push(b);
  }
  const T = obs.length;
  let last = 0;
  for (let j = 1; j < N; j++) if (delta[T - 1][j] > delta[T - 1][last]) last = j;
  const path = [last];
  for (let t = T - 1; t > 0; t--) path.unshift(psi[t][path[0]]);
  return { delta, psi, path, best: delta[T - 1][last] };
}
