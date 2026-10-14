import { banda95 } from "../lib/series";
import { Barras } from "./Barras";

// Correlograma: una barra por rezago (ACF o PACF), con la banda donde caería el 95 % de las barras si no hubiera
// ninguna relación entre los valores. Las barras que se salen de la banda van en rojo.

export function Correlogram({
  valores,
  n,
  ancho,
  alto,
  hasta,
  resaltar,
  rotular = [],
  titulo,
  y = [-1, 1],
  desde = 1,
  cada = 6,
}: {
  /** valores[k] = autocorrelación en el rezago k (la posición 0 vale 1 y no se dibuja si `desde` es 1). */
  valores: number[];
  /** Largo de la serie: con él se calcula la banda. Sin él no se dibuja banda ni se pinta nada de rojo. */
  n?: number;
  ancho: number;
  alto: number;
  /** Dibuja solo hasta este rezago (para irlo llenando). */
  hasta?: number;
  /** Rezago que se señala aunque esté dentro de la banda. */
  resaltar?: number;
  /** Rezagos cuyo valor se escribe sobre la barra. */
  rotular?: number[];
  titulo?: string;
  y?: [number, number];
  desde?: 0 | 1;
  /** Cada cuántos rezagos se rotula el eje. */
  cada?: number;
}) {
  const banda = n ? banda95(n) : undefined;
  const K = valores.length - 1;
  const visibles = Array.from({ length: K - desde + 1 }, (_, j) => {
    const k = j + desde;
    return hasta !== undefined && k > hasta ? null : valores[k];
  });
  const fuera = (k: number) => banda !== undefined && k > 0 && Math.abs(valores[k]) > banda;
  return (
    <Barras
      valores={visibles}
      etiquetas={visibles.map((_, j) => ((j + desde) % cada === 0 || j + desde === 1 ? String(j + desde) : ""))}
      ancho={ancho}
      alto={alto}
      y={y}
      pasoY={0.5}
      fmtY={(v) => v.toFixed(1)}
      banda={banda}
      rotuloBanda={banda !== undefined ? `±${banda.toFixed(3)}` : undefined}
      rotulo={titulo}
      rojo={(j) => fuera(j + desde) || j + desde === resaltar}
      encima={(j) => (rotular.includes(j + desde) ? valores[j + desde].toFixed(2) : undefined)}
      cada={1}
      grosor={0.5}
      transicion={0.5}
    />
  );
}

/** Rezagos (de 1 en adelante) cuya barra queda fuera de la banda. */
export const fueraDeBanda = (valores: number[], n: number) => valores.flatMap((v, k) => (k > 0 && Math.abs(v) > banda95(n) ? [k] : []));
