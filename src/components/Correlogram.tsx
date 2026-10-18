import { banda95, bandaBartlett } from "../lib/series";
import { Barras } from "./Barras";

// Correlograma: una barra por rezago (ACF o PACF), con la banda donde caería el 95 % de las barras si no hubiera
// ninguna relación entre los valores. Las barras que se salen de la banda van en rojo.
// La banda de Bartlett responde otra pregunta: qué tan incierta es la barra k si las anteriores sí son reales (se ensancha).

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
  banda = "blanco",
  teorica = [],
  marcar = [],
  atenuar,
  contador = false,
  pasoY = 0.5,
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
  /** "blanco": la misma para todas las barras. "bartlett": se ensancha con el rezago (solo tiene sentido en la ACF). */
  banda?: "blanco" | "bartlett";
  /** Lo que diría la teoría para un modelo: `valores[k]` en el rezago k. Un guion por barra y, con `linea`, unidos. */
  teorica?: { id: string; valores: number[]; etiqueta?: string; color?: string; opacidad?: number; linea?: boolean; guion?: string }[];
  /** Rezagos que se señalan con un triángulo bajo el eje (los estacionales). */
  marcar?: number[];
  /** Rezagos que pasan a segundo plano. */
  atenuar?: (k: number) => boolean;
  /** Agrega al título cuántas barras quedan fuera de la banda. */
  contador?: boolean;
  /** Cada cuánto se marca el eje vertical (en un correlograma bajito, 1 para que los números no se amontonen). */
  pasoY?: number;
}) {
  const K = valores.length - 1;
  const anchos = n ? (banda === "bartlett" ? bandaBartlett(valores, n) : valores.map(() => banda95(n))) : undefined;
  const visibles = Array.from({ length: K - desde + 1 }, (_, j) => {
    const k = j + desde;
    return hasta !== undefined && k > hasta ? null : valores[k];
  });
  const fuera = (k: number) => anchos !== undefined && k > 0 && Math.abs(valores[k]) > anchos[k];
  const dibujados = visibles.flatMap((v, j) => (v === null || j + desde === 0 ? [] : [j + desde]));
  const cuenta = contador && anchos ? `${dibujados.filter(fuera).length} de ${dibujados.length} fuera de la banda` : undefined;
  return (
    <Barras
      valores={visibles}
      etiquetas={visibles.map((_, j) => ((j + desde) % cada === 0 || j + desde === 1 ? String(j + desde) : ""))}
      ancho={ancho}
      alto={alto}
      y={y}
      pasoY={pasoY}
      fmtY={(v) => v.toFixed(1)}
      banda={anchos?.slice(desde)}
      rotuloBanda={anchos ? (banda === "bartlett" ? "Bartlett" : `±${anchos[1].toFixed(3)}`) : undefined}
      rotulo={[titulo, cuenta].filter(Boolean).join(" · ") || undefined}
      curvas={teorica.map((t) => ({ ...t, valores: visibles.map((_, j) => t.valores[j + desde] ?? null) }))}
      opacidad={atenuar ? (j) => (atenuar(j + desde) ? 0.3 : 1) : undefined}
      senalar={marcar.map((k) => k - desde)}
      rojo={(j) => fuera(j + desde) || j + desde === resaltar}
      encima={(j) => (rotular.includes(j + desde) ? valores[j + desde].toFixed(2) : undefined)}
      cada={1}
      grosor={0.5}
      transicion={0.5}
    />
  );
}

/** Rezagos (de 1 en adelante) cuya barra queda fuera de la banda. */
export const fueraDeBanda = (valores: number[], n: number, banda: "blanco" | "bartlett" = "blanco") => {
  const anchos = banda === "bartlett" ? bandaBartlett(valores, n) : valores.map(() => banda95(n));
  return valores.flatMap((v, k) => (k > 0 && Math.abs(v) > anchos[k] ? [k] : []));
};
