import type { ComponentType } from "react";
import type { SlideProps } from "../deck/types";

// Recorte de la clase 3 (docs/hitos/HITO-8.md): cada diapositiva nueva es una lista de clics escogidos de las viejas.
// El clic k muestra el paso s de la vieja tal como se construyó y verificó. Si dos clics seguidos son de la misma
// vieja, React conserva la instancia y su animación; al cambiar de vieja, la nueva se monta desde cero.
export type Clic = readonly [ComponentType<SlideProps>, number];

export function recorte(clics: readonly Clic[]): ComponentType<SlideProps> {
  return function Recorte({ step, active }: SlideProps) {
    const [Vieja, paso] = clics[Math.min(step, clics.length - 1)];
    return <Vieja step={paso} active={active} />;
  };
}
