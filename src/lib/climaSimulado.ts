// El diario simulado del clima y Baum-Welch de hmmlearn (diapositiva 61), exportados por scripts/exportar_hito6.py
// (no se editan a mano). Lo demás de la 61 (Forward escalado, Viterbi, aciertos) se calcula en vivo con lib/hmm.ts.
import climaJson from "../data/hmm_clima.json";
import { CLIMA, CLIMA_PERSISTENTE } from "./clima.ts";
import type { HMM } from "./hmm.ts";

const digitos = (s: string) => [...s].map(Number);

function escenario(nombre: "base" | "persistente", real: HMM) {
  const e = climaJson.escenarios[nombre];
  const bw = e.baum_welch;
  return {
    real,
    /** Los 1 000 días de prueba, aparte del entrenamiento y sin barajar. */
    prueba: { estados: digitos(e.prueba.estados), obs: digitos(e.prueba.obs) },
    /** Frecuencia de cada actividad y clima más común en los 10 000 días de entrenamiento. */
    entrenamiento: e.entrenamiento,
    baumWelch: bw,
    /** ln P y Viterbi de hmmlearn con el λ real en la prueba (para comparar con lo que calcula el navegador). */
    hmmlearn: e.hmmlearn,
    /** El λ del mejor arranque, con los estados ya emparejados con los reales. */
    aprendido: { ...real, pi: bw.pi, A: bw.A, B: bw.B } as HMM,
  };
}

export const climaSimulado = {
  semilla: climaJson.semilla,
  nEntrenamiento: climaJson.n_entrenamiento,
  nPrueba: climaJson.n_prueba,
  versiones: climaJson.versiones,
  /** score y decode de hmmlearn con los tres días del ejemplo. */
  hmmlearnEjemplo: climaJson.hmmlearn_ejemplo,
  /** Las primeras 5 filas del diario, tal como llegan. */
  crudo: climaJson.crudo as { columnas: { nombre: string; tipo: "num" | "cat" }[]; filas: (string | number | null)[][] },
  base: escenario("base", CLIMA),
  persistente: escenario("persistente", CLIMA_PERSISTENTE),
};
