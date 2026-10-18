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

// ---------- Hito 6 (diapositivas 51–61): lo que piden las diapositivas, verificado contra numpy y hmmlearn ----------

/** P(q₁, …, q_T) de la cadena sola, sin observaciones: π por las transiciones. */
export function probCadena(m: HMM, q: number[]): number {
  let p = m.pi[q[0]];
  for (let t = 1; t < q.length; t++) p *= m.A[q[t - 1]][q[t]];
  return p;
}

/**
 * P(O, Q | λ) de un camino, con sus piezas: `factores[t]` es lo que aporta el día t (π·b el primero, a·b los demás),
 * `pQ` = P(Q | λ) y `pOdadoQ` = P(O | Q, λ).
 */
export function probConjunta(m: HMM, q: number[], obs: number[]) {
  const factores = q.map((j, t) => (t === 0 ? m.pi[j] : m.A[q[t - 1]][j]) * m.B[j][obs[t]]);
  const pQ = probCadena(m, q);
  const pOdadoQ = q.reduce((p, j, t) => p * m.B[j][obs[t]], 1);
  return { factores, pQ, pOdadoQ, conjunta: factores.reduce((a, b) => a * b, 1) };
}

/** Los Nᵀ caminos en orden lexicográfico (0…0, 0…1, …), cada uno con su probabilidad conjunta. */
export function enumerarCaminos(m: HMM, obs: number[]) {
  const N = m.states.length;
  const T = obs.length;
  const out: { q: number[]; pQ: number; pOdadoQ: number; conjunta: number }[] = [];
  for (let k = 0; k < N ** T; k++) {
    const q: number[] = [];
    for (let t = T - 1, r = k; t >= 0; t--, r = Math.floor(r / N)) q[t] = r % N;
    const { pQ, pOdadoQ, conjunta } = probConjunta(m, q, obs);
    out.push({ q, pQ, pOdadoQ, conjunta });
  }
  return out;
}

/**
 * Forward en sus dos movimientos. `predicho[t][j]` = Σᵢ α_{t−1}(i)·a_ij (antes de ver o_t; en t = 0 es π) y
 * `alpha[t][j]` = predicho·b_j(o_t). `c[t]` = P(o_t | o₁…o_{t−1}): su producto es P(O | λ).
 */
export function pasosForward(m: HMM, obs: number[]) {
  const alpha = forward(m, obs);
  const N = m.states.length;
  const predicho = obs.map((_, t) =>
    t === 0 ? [...m.pi] : Array.from({ length: N }, (_, j) => alpha[t - 1].reduce((s, a, i) => s + a * m.A[i][j], 0)),
  );
  const sumas = alpha.map((a) => a.reduce((s, v) => s + v, 0));
  const c = sumas.map((s, t) => (t === 0 ? s : s / sumas[t - 1]));
  return { alpha, predicho, c };
}

/** Forward con escalado: ln P(o₁…o_t) para cada t sin llegar a cero (log P = Σ ln c_t). */
export function forwardEscalado(m: HMM, obs: number[]) {
  const N = m.states.length;
  let a = m.pi.map((p, j) => p * m.B[j][obs[0]]);
  let logP = 0;
  const logPrefijo: number[] = [];
  for (let t = 0; t < obs.length; t++) {
    if (t > 0) {
      const prev = a;
      a = Array.from({ length: N }, (_, j) => {
        let s = 0;
        for (let i = 0; i < N; i++) s += prev[i] * m.A[i][j];
        return s * m.B[j][obs[t]];
      });
    }
    const c = a.reduce((s, v) => s + v, 0);
    logP += Math.log(c);
    logPrefijo.push(logP);
    a = a.map((v) => v / c);
  }
  return { logP, logPrefijo };
}

/** Forward sin escalar: P(o₁…o_t) para cada t, tal cual en punto flotante (llega a 0 si la secuencia es larga). */
export function prefijosSinEscalar(m: HMM, obs: number[]): number[] {
  return forward(m, obs).map((a) => a.reduce((s, v) => s + v, 0));
}

/** Primer día (contando desde 1) en que Forward sin escalar vale exactamente 0; null si no llega. */
export function diaUnderflow(m: HMM, obs: number[]): number | null {
  const p = prefijosSinEscalar(m, obs);
  const t = p.findIndex((v) => v === 0);
  return t < 0 ? null : t + 1;
}

/** Viterbi en logaritmos (mismo camino: el logaritmo es creciente), para secuencias largas. */
export function viterbiLog(m: HMM, obs: number[]) {
  const N = m.states.length;
  const lA = m.A.map((r) => r.map(Math.log));
  const lB = m.B.map((r) => r.map(Math.log));
  let d = m.pi.map((p, j) => Math.log(p) + lB[j][obs[0]]);
  const psi: number[][] = [];
  for (let t = 1; t < obs.length; t++) {
    const prev = d;
    const arg: number[] = [];
    d = Array.from({ length: N }, (_, j) => {
      let best = -Infinity;
      let k = 0;
      for (let i = 0; i < N; i++) {
        const v = prev[i] + lA[i][j];
        if (v > best) [best, k] = [v, i];
      }
      arg.push(k);
      return best + lB[j][obs[t]];
    });
    psi.push(arg);
  }
  let last = 0;
  for (let j = 1; j < N; j++) if (d[j] > d[last]) last = j;
  const camino = [last];
  for (let t = psi.length - 1; t >= 0; t--) camino.unshift(psi[t][camino[0]]);
  return { camino, logMejor: d[last] };
}

/** P(q_t = j | toda la secuencia) con Forward y Backward (con escalado). */
export function suavizado(m: HMM, obs: number[]): number[][] {
  const N = m.states.length;
  const T = obs.length;
  const al: number[][] = [];
  const c: number[] = [];
  for (let t = 0; t < T; t++) {
    const a =
      t === 0
        ? m.pi.map((p, j) => p * m.B[j][obs[0]])
        : Array.from({ length: N }, (_, j) => al[t - 1].reduce((s, v, i) => s + v * m.A[i][j], 0) * m.B[j][obs[t]]);
    const s = a.reduce((x, y) => x + y, 0);
    c.push(s);
    al.push(a.map((v) => v / s));
  }
  const be: number[][] = Array.from({ length: T }, () => Array(N).fill(1));
  for (let t = T - 2; t >= 0; t--)
    for (let i = 0; i < N; i++) be[t][i] = m.A[i].reduce((s, a, j) => s + a * m.B[j][obs[t + 1]] * be[t + 1][j], 0) / c[t + 1];
  return al.map((a, t) => {
    const g = a.map((v, j) => v * be[t][j]);
    const s = g.reduce((x, y) => x + y, 0);
    return g.map((v) => v / s);
  });
}

/** El estado de la casilla más alta de cada columna (de δ o de α), sin seguir las flechas. */
export function casillaMasAlta(tabla: number[][]): number[] {
  return tabla.map((col) => col.indexOf(Math.max(...col)));
}

/** Toma un índice según una distribución (inversión de la acumulada). */
function sortear(p: number[], u: number): number {
  let s = 0;
  for (let k = 0; k < p.length - 1; k++) {
    s += p[k];
    if (u < s) return k;
  }
  return p.length - 1;
}

/** Simula T días: q₁ ~ π, q_t ~ A[q_{t−1}], o_t ~ B[q_t]. */
export function simular(m: HMM, T: number, rand: () => number) {
  const estados: number[] = [];
  const obs: number[] = [];
  for (let t = 0; t < T; t++) {
    const q = sortear(t === 0 ? m.pi : m.A[estados[t - 1]], rand());
    estados.push(q);
    obs.push(sortear(m.B[q], rand()));
  }
  return { estados, obs };
}

/** Largo de cada racha (días seguidos en el mismo estado), separado por estado. */
export function rachas(estados: number[], N = 2): number[][] {
  const out: number[][] = Array.from({ length: N }, () => []);
  let largo = 1;
  for (let t = 1; t <= estados.length; t++) {
    if (t < estados.length && estados[t] === estados[t - 1]) largo++;
    else {
      out[estados[t - 1]].push(largo);
      largo = 1;
    }
  }
  return out;
}

/**
 * Multiplicaciones para obtener P(O | λ). Forward: N (inicio) + (T − 1)·N·(N + 1). Fuerza bruta: cada uno de los Nᵀ
 * caminos lleva 2T − 1 productos (π·b y T − 1 veces a·b).
 */
export function conteoMultiplicaciones(N: number, T: number) {
  return { forward: N + (T - 1) * N * (N + 1), bruta: BigInt(N) ** BigInt(T) * BigInt(2 * T - 1) };
}

/** Distribución estacionaria de A (proporción de días en cada estado a la larga), por potencias. */
export function estacionaria(A: number[][]): number[] {
  let p = A.map(() => 1 / A.length);
  for (let k = 0; k < 2000; k++) p = p.map((_, j) => p.reduce((s, v, i) => s + v * A[i][j], 0));
  return p;
}
