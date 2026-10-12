import type { ComponentType } from "react";

export type SlideProps = {
  /** Paso actual dentro de la diapositiva (0 … steps-1). */
  step: number;
  /** true solo en la diapositiva visible: úsalo para activar teclas o animaciones. */
  active: boolean;
};

export type SlideDef = {
  id: string;
  /** Número en la estructura completa (nota del handoff), no la posición en el arreglo. */
  num: number;
  /** Cuántos pasos (clics) tiene la diapositiva antes de pasar a la siguiente. */
  steps: number;
  Component: ComponentType<SlideProps>;
};

export const TOTAL_PLANNED = 64;
