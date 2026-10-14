import { ejeQueCubre } from "../lib/scale";
import { Lineas, type Banda, type Marca, type Segmento } from "./Lineas";

// Una serie de tiempo dibujada con `Lineas`: aquí solo se arma el eje del tiempo y la escala vertical.
// La posición 0 es el primer dato; con el eje de años, la posición 0 es enero de `anioInicial`.

export type SerieTiempo = {
  id: string;
  /** Un valor por posición; `null` o NaN donde no hay dato (la línea se corta). */
  valores: (number | null)[];
  /** Posición del primer valor, para las series que empiezan tarde (una diferencia, un pronóstico). */
  desde?: number;
  color?: string;
  grosor?: number;
  guion?: string;
  puntos?: boolean;
  sinLinea?: boolean;
  etiqueta?: string;
  opacidad?: number;
};

/** Separación "redonda" entre marcas (1, 2 o 5 por una potencia de 10) para que un rango tenga unas cuantas. */
export function pasoRedondo(rango: number, marcas = 5) {
  const crudo = rango / marcas;
  const base = 10 ** Math.floor(Math.log10(crudo));
  const f = crudo / base;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * base;
}

export function SeriesChart({
  ancho,
  alto,
  series,
  eje = "años",
  anioInicial = 1949,
  cadaAnios = 1,
  sinMarcasX = false,
  ventana,
  y,
  ticksY,
  pasoY,
  fmtY,
  rotuloX,
  rotuloY,
  bandas,
  segmentos,
  marcas,
  cursor,
  lineasH,
  escalaY,
  transicion,
  margen,
  recortar,
}: {
  ancho: number;
  alto: number;
  series: SerieTiempo[];
  /** "años": una marca en cada enero. "indice": marcas en t = 1, 2, 3… (la posición más 1). */
  eje?: "años" | "indice";
  anioInicial?: number;
  cadaAnios?: number;
  /** Oculta las marcas del eje del tiempo (cuando el orden ya no es el del calendario). */
  sinMarcasX?: boolean;
  /** Posiciones que abarca el eje del tiempo; si falta, todas las de las series. */
  ventana?: [number, number];
  /** Dominio vertical; si falta, se calcula de los datos visibles. */
  y?: [number, number];
  ticksY?: number[];
  pasoY?: number;
  fmtY?: (v: number) => string;
  rotuloX?: string;
  rotuloY?: string;
  bandas?: Banda[];
  segmentos?: Segmento[];
  marcas?: Marca[];
  /** Posición del cursor vertical. */
  cursor?: number;
  lineasH?: { y: number; texto?: string; color?: string; abajo?: boolean }[];
  escalaY?: (v: number) => number;
  transicion?: number;
  margen?: { l: number; r: number; t: number; b: number };
  recortar?: boolean;
}) {
  const fin = Math.max(...series.map((s) => (s.desde ?? 0) + s.valores.length - 1));
  const x: [number, number] = ventana ?? [0, fin];
  const lineas = series.map(({ valores, desde = 0, ...resto }) => ({ ...resto, pts: valores.map((v, j): [number, number] => [desde + j, v ?? NaN]) }));

  // El eje vertical sale de lo que se ve, no de una constante: si cambian los datos, la gráfica los sigue cubriendo.
  const visibles = lineas.flatMap((s) => s.pts.filter(([px, py]) => px >= x[0] && px <= x[1] && !Number.isNaN(py)).map((p) => p[1]));
  const referencia = [...visibles, ...(lineasH ?? []).map((l) => l.y), ...(segmentos ?? []).map((s) => s.y)];
  const auto = ejeQueCubre(referencia, pasoY ?? pasoRedondo(Math.max(...referencia) - Math.min(...referencia) || 1));
  const dominio = y ?? auto.dominio;
  const marcasY = ticksY ?? (y ? ejeQueCubre(y, pasoY ?? pasoRedondo(y[1] - y[0])).ticks : auto.ticks);

  const ticksX = sinMarcasX
    ? []
    : eje === "años"
      ? Array.from({ length: Math.floor(x[1] / 12) + 1 }, (_, a) => a)
          .filter((a) => a * 12 >= x[0] && a % cadaAnios === 0)
          .map((a) => ({ v: a * 12, texto: String(anioInicial + a) }))
      : Array.from({ length: Math.floor(x[1]) - Math.ceil(x[0]) + 1 }, (_, j) => Math.ceil(x[0]) + j).map((i) => ({ v: i, texto: String(i + 1) }));

  return (
    <Lineas
      ancho={ancho}
      alto={alto}
      series={lineas}
      x={x}
      y={dominio}
      ticksX={ticksX}
      ticksY={marcasY}
      fmtY={fmtY}
      rotuloX={rotuloX}
      rotuloY={rotuloY}
      bandas={bandas}
      segmentos={segmentos}
      marcas={marcas}
      lineaV={cursor}
      lineasH={lineasH}
      escalaY={escalaY}
      transicion={transicion}
      margen={margen}
      recortar={recortar}
    />
  );
}
