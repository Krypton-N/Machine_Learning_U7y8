// El ejemplo del clima oculto (diapositivas 51–61): un solo λ para toda la sección, para que todas usen los mismos
// números. Es un ejemplo de libro (Wikipedia, "Hidden Markov model"); no viene de datos. Archivo puro: no lee JSON.
import type { HMM } from "./hmm.ts";

export const CLIMA: HMM = {
  states: ["Lluvioso", "Soleado"],
  symbols: ["caminar", "comprar", "limpiar"],
  pi: [0.6, 0.4],
  A: [
    [0.7, 0.3],
    [0.4, 0.6],
  ],
  B: [
    [0.1, 0.4, 0.5],
    [0.6, 0.3, 0.1],
  ],
};

/** Otro clima, solo para contrastar en la 61: los mismos π y B, pero cada clima dura (a_ii = 0.95). */
export const CLIMA_PERSISTENTE: HMM = {
  ...CLIMA,
  A: [
    [0.95, 0.05],
    [0.05, 0.95],
  ],
};

/** Lo que cuenta el amigo: caminar, comprar, limpiar. */
export const OBS_EJEMPLO = [0, 1, 2];
export const CORTO = ["L", "S"];
export const SUB = ["₁", "₂", "₃", "₄", "₅"];

/** Probabilidades con 6 cifras y sin ruido de punto flotante: 0.13799999999999998 → "0.138", 0.0552 → "0.0552". */
export const fmtP = (v: number, cifras = 6) => String(Number(v.toPrecision(cifras)));

/** Entero grande con espacios finos cada tres cifras: 1 267 650 600 … */
export const fmtEntero = (n: bigint) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
