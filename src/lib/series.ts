// Cálculos de series de tiempo que corren en el navegador. Cada función se compara contra numpy, pandas,
// statsmodels o sklearn en scripts/verificar.ts. Donde una ventana no alcanza, el resultado es NaN.
import { media } from "./metricas.ts";
import { gaussian } from "./rng.ts";

// ---------- Estadística básica ----------

/** Desviación muestral (divide entre n − 1), como `numpy.std(ddof=1)`. La de `metricas.ts` divide entre n. */
export function desviacionMuestral(x: number[]) {
  const m = media(x);
  return Math.sqrt(x.reduce((s, v) => s + (v - m) ** 2, 0) / (x.length - 1));
}

/** Correlación de Pearson entre dos listas: cada una con su propia media. */
export function pearson(a: number[], b: number[]) {
  const ma = media(a);
  const mb = media(b);
  let sab = 0;
  let saa = 0;
  let sbb = 0;
  for (let i = 0; i < a.length; i++) {
    sab += (a[i] - ma) * (b[i] - mb);
    saa += (a[i] - ma) ** 2;
    sbb += (b[i] - mb) ** 2;
  }
  return sab / Math.sqrt(saa * sbb);
}

/** Error absoluto medio. */
export const mae = (real: number[], pred: number[]) => real.reduce((s, v, i) => s + Math.abs(v - pred[i]), 0) / real.length;

/** Densidad de la normal estándar. */
export const densidadNormal = (z: number) => Math.exp(-(z * z) / 2) / Math.sqrt(2 * Math.PI);

// ---------- Transformaciones ----------

/** x_t − x_{t−k}. El resultado tiene k valores menos; su posición 0 corresponde a la posición k de x. */
export const diferencia = (x: number[], k = 1) => x.slice(k).map((v, i) => v - x[i]);

/** La serie en renglones de m valores (año × mes si m = 12). */
export const porPeriodo = <T>(x: T[], m = 12): T[][] => Array.from({ length: Math.ceil(x.length / m) }, (_, a) => x.slice(a * m, (a + 1) * m));

/**
 * Pesos de la ventana centrada de k valores. Con k par no hay centro: se promedian dos ventanas seguidas
 * (el "2×k"), que son k + 1 valores con medio peso en los extremos.
 */
export function pesosCentrados(k: number): number[] {
  if (k % 2 === 1) return new Array(k).fill(1 / k);
  return Array.from({ length: k + 1 }, (_, j) => (j === 0 || j === k ? 0.5 : 1) / k);
}

/** Promedio móvil: centrado (usa valores de antes y de después) o atrasado (solo los últimos k). */
export function promedioMovil(x: number[], k: number, modo: "centrado" | "atrasado" = "centrado"): number[] {
  const w = modo === "centrado" ? pesosCentrados(k) : new Array<number>(k).fill(1 / k);
  // En la centrada la ventana empieza `atras` lugares antes del punto; en la atrasada, k − 1.
  const atras = modo === "centrado" ? (w.length - 1) / 2 : k - 1;
  return x.map((_, t) => {
    const ini = t - atras;
    if (ini < 0 || ini + w.length > x.length) return NaN;
    let s = 0;
    for (let j = 0; j < w.length; j++) s += w[j] * x[ini + j];
    return s;
  });
}

export type Descomposicion = {
  /** Promedio móvil centrado de un periodo completo; NaN en los extremos. */
  tendencia: number[];
  /** Un valor por posición dentro del periodo (12 si es mensual). */
  indices: number[];
  /** Los índices repetidos a lo largo de la serie. */
  estacional: number[];
  /** Lo que sobra: observada − tendencia − estacional, o observada / (tendencia × estacional). */
  residuo: number[];
};

/** Descomposición clásica, con el mismo algoritmo que `seasonal_decompose` de statsmodels. */
export function descomponer(x: number[], m: number, modo: "aditiva" | "multiplicativa"): Descomposicion {
  const mult = modo === "multiplicativa";
  const tendencia = promedioMovil(x, m);
  const sin = x.map((v, t) => (mult ? v / tendencia[t] : v - tendencia[t]));
  const crudos = Array.from({ length: m }, (_, j) => media(sin.filter((v, t) => t % m === j && !Number.isNaN(v))));
  // Los índices se normalizan: suman 0 en la aditiva y promedian 1 en la multiplicativa.
  const centro = media(crudos);
  const indices = crudos.map((v) => (mult ? v / centro : v - centro));
  const estacional = x.map((_, t) => indices[t % m]);
  const residuo = x.map((v, t) => (mult ? v / (tendencia[t] * estacional[t]) : v - tendencia[t] - estacional[t]));
  return { tendencia, indices, estacional, residuo };
}

// ---------- Autocorrelación ----------

/** (x_t − x̄)(x_{t−k} − x̄) para cada t que tiene un valor k pasos atrás. Su suma, entre Σ(x − x̄)², es r_k. */
export function productosRezago(x: number[], k: number): number[] {
  const m = media(x);
  return x.slice(k).map((v, i) => (v - m) * (x[i] - m));
}

/** ACF de 0 a K: una sola media (la de toda la serie) y un solo denominador, como `acf(adjusted=False)`. */
export function acf(x: number[], K: number): number[] {
  const m = media(x);
  const total = x.reduce((s, v) => s + (v - m) ** 2, 0);
  return Array.from({ length: K + 1 }, (_, k) => productosRezago(x, k).reduce((s, v) => s + v, 0) / total);
}

/** PACF a partir de la ACF por Durbin-Levinson (lo que statsmodels llama "ywm"). Devuelve [1, φ₁₁, φ₂₂, …]. */
export function pacf(r: number[]): number[] {
  const out = [1];
  let phi: number[] = [];
  for (let k = 1; k < r.length; k++) {
    let num = r[k];
    let den = 1;
    for (let j = 1; j < k; j++) {
      num -= phi[j - 1] * r[k - j];
      den -= phi[j - 1] * r[j];
    }
    const pkk = num / den;
    phi = [...phi.map((v, j) => v - pkk * phi[k - 2 - j]), pkk];
    out.push(pkk);
  }
  return out;
}

/** Banda del 95 % para una autocorrelación cuando no hay ninguna relación entre los valores. */
export const banda95 = (n: number) => 1.96 / Math.sqrt(n);

// ---------- Mínimos cuadrados ----------

/**
 * Regresión lineal con constante: y ≈ β₀ + β₁x₁ + … Devuelve los coeficientes (β₀ primero), su error estándar
 * y su t. Se resuelve con las columnas centradas, que es más estable cuando las variables se parecen entre sí.
 */
export function minimosCuadrados(X: number[][], y: number[]) {
  const n = y.length;
  const p = X[0].length;
  const mx = Array.from({ length: p }, (_, j) => media(X.map((f) => f[j])));
  const my = media(y);
  // [A | I] con A = XᶜᵀXᶜ; al terminar Gauss-Jordan queda [I | A⁻¹].
  const M = Array.from({ length: p }, (_, i) => [
    ...Array.from({ length: p }, (_, j) => X.reduce((s, f) => s + (f[i] - mx[i]) * (f[j] - mx[j]), 0)),
    ...Array.from({ length: p }, (_, j) => (i === j ? 1 : 0)),
  ]);
  for (let c = 0; c < p; c++) {
    let piv = c;
    for (let f = c + 1; f < p; f++) if (Math.abs(M[f][c]) > Math.abs(M[piv][c])) piv = f;
    [M[c], M[piv]] = [M[piv], M[c]];
    const d = M[c][c];
    for (let j = 0; j < 2 * p; j++) M[c][j] /= d;
    for (let f = 0; f < p; f++) {
      if (f === c) continue;
      const k = M[f][c];
      for (let j = 0; j < 2 * p; j++) M[f][j] -= k * M[c][j];
    }
  }
  const inv = M.map((f) => f.slice(p));
  const xy = Array.from({ length: p }, (_, j) => X.reduce((s, f, i) => s + (f[j] - mx[j]) * (y[i] - my), 0));
  const pend = inv.map((f) => f.reduce((s, v, j) => s + v * xy[j], 0));
  const b0 = my - pend.reduce((s, b, j) => s + b * mx[j], 0);
  const residuos = y.map((v, i) => v - b0 - pend.reduce((s, b, j) => s + b * X[i][j], 0));
  const s2 = residuos.reduce((s, e) => s + e * e, 0) / (n - p - 1);
  const var0 = s2 * (1 / n + mx.reduce((s, a, i) => s + a * inv[i].reduce((q, v, j) => q + v * mx[j], 0), 0));
  const beta = [b0, ...pend];
  const ee = [Math.sqrt(var0), ...pend.map((_, j) => Math.sqrt(s2 * inv[j][j]))];
  return { beta, ee, t: beta.map((b, j) => b / ee[j]), residuos };
}

// ---------- Particiones para validar ----------

/** Una permutación al azar de 0…n−1 (Fisher-Yates). */
export function barajar(n: number, rand: () => number): number[] {
  const p = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  return p;
}

/** K-Fold barajado: a qué pliegue (0…k−1) le toca cada posición. Los primeros n mod k pliegues llevan uno más. */
export function kfoldBarajado(n: number, k: number, rand: () => number): number[] {
  const orden = barajar(n, rand);
  const pliegue = new Array<number>(n);
  let i = 0;
  for (let f = 0; f < k; f++) {
    const tam = Math.floor(n / k) + (f < n % k ? 1 : 0);
    for (let j = 0; j < tam; j++) pliegue[orden[i++]] = f;
  }
  return pliegue;
}

export type CorteTemporal = { entrenamiento: number; pruebaDesde: number; pruebaHasta: number };

/**
 * Ventana creciente, con la misma regla que `TimeSeriesSplit` de sklearn: cada prueba mide ⌊n / (k + 1)⌋ y el
 * entrenamiento es todo lo anterior (las posiciones 0…entrenamiento − 1).
 */
export function particionTemporal(n: number, k: number): CorteTemporal[] {
  const tam = Math.floor(n / (k + 1));
  return Array.from({ length: k }, (_, i) => {
    const desde = n - (k - i) * tam;
    return { entrenamiento: desde, pruebaDesde: desde, pruebaHasta: desde + tam - 1 };
  });
}

// ---------- Simulaciones (esquemas) ----------

/**
 * Serie con memoria de un paso: x_t = φ·x_{t−1} + choque. Arranca de su distribución de equilibrio (varianza
 * σ² / (1 − φ²)), para que sea estacionaria desde el primer valor; con |φ| ≥ 1 no existe y arranca en el choque.
 * `choques[t]` es el choque que entró en t (en t = 0, el valor inicial).
 */
export function simularAR(phi: number, n: number, rand: () => number, sigma = 1) {
  const x = new Array<number>(n);
  const choques = new Array<number>(n);
  const escala = Math.abs(phi) < 1 ? 1 / Math.sqrt(1 - phi * phi) : 1;
  choques[0] = sigma * escala * gaussian(rand);
  x[0] = choques[0];
  for (let t = 1; t < n; t++) {
    choques[t] = sigma * gaussian(rand);
    x[t] = phi * x[t - 1] + choques[t];
  }
  return { x, choques };
}

/** Paseo aleatorio que sale de 0: la posición i guarda la suma de los primeros i + 1 choques. */
export function caminata(n: number, rand: () => number, sigma = 1): number[] {
  const x = new Array<number>(n);
  let s = 0;
  for (let t = 0; t < n; t++) {
    s += sigma * gaussian(rand);
    x[t] = s;
  }
  return x;
}
