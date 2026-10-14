import { motion } from "motion/react";
import { linear } from "../lib/scale";

// Gráfica de líneas en SVG, común a toda la exposición. Rojo = lo que importa; gris claro = contra qué se compara.

export type Serie = {
  id: string;
  /** Un punto con y = NaN corta la línea (un tramo sin dato). */
  pts: [number, number][];
  color?: string;
  grosor?: number;
  guion?: string;
  /** Dibuja un punto en cada dato. */
  puntos?: boolean;
  /** Solo puntos, sin unirlos. */
  sinLinea?: boolean;
  /** Texto junto al último punto. */
  etiqueta?: string;
  opacidad?: number;
};

export type Marca = { x: number; y: number; texto?: string; color?: string; abajo?: boolean; r?: number };

/** Tramo del eje x que se sombrea (por ejemplo, los meses de prueba). */
export type Banda = { desde: number; hasta: number; color?: string; texto?: string };

/** Tramo horizontal a la altura y (por ejemplo, la media de un año). */
export type Segmento = { x0: number; x1: number; y: number; color?: string; texto?: string; grosor?: number; abajo?: boolean };

type Tick = number | { v: number; texto: string };
const tv = (t: Tick) => (typeof t === "number" ? t : t.v);

const SUAVE = [0.2, 0.7, 0.2, 1] as const;

export function Lineas({
  ancho,
  alto,
  series,
  x,
  y,
  ticksX,
  ticksY,
  fmtY = (v) => String(v),
  fmtX = (v) => String(v),
  rotuloX,
  rotuloY,
  marcas = [],
  lineaV,
  lineasH = [],
  bandas = [],
  segmentos = [],
  margen = { l: 64, r: 22, t: 16, b: 48 },
  recortar = false,
  escalaY,
  transicion,
}: {
  ancho: number;
  alto: number;
  series: Serie[];
  x: [number, number];
  y: [number, number];
  ticksX: Tick[];
  ticksY: Tick[];
  fmtY?: (v: number) => string;
  fmtX?: (v: number) => string;
  rotuloX?: string;
  rotuloY?: string;
  marcas?: Marca[];
  /** Línea vertical en este x (p. ej. el valor elegido con el deslizador). */
  lineaV?: number;
  lineasH?: { y: number; texto?: string; color?: string; abajo?: boolean }[];
  bandas?: Banda[];
  segmentos?: Segmento[];
  margen?: { l: number; r: number; t: number; b: number };
  /** Corta las series que se salen del área de la gráfica (cuando una curva se dispara). */
  recortar?: boolean;
  /** Transformación creciente del eje vertical (p. ej. el logaritmo). Los valores y las marcas siguen en sus unidades. */
  escalaY?: (v: number) => number;
  /** Segundos que tardan las líneas y los puntos en moverse cuando cambian los datos. Sin esto, cambian de golpe. */
  transicion?: number;
}) {
  const m = margen;
  const fx = linear(x, [m.l, ancho - m.r]);
  const T = escalaY ?? ((v: number) => v);
  const fyT = linear([T(y[0]), T(y[1])], [alto - m.b, m.t]);
  const fy = (v: number) => fyT(T(v));
  const clip = `clip-${Math.round(ancho)}-${Math.round(alto)}-${m.l}-${m.t}`;
  const mover = transicion ? { duration: transicion, ease: SUAVE } : undefined;
  return (
    <svg width={ancho} height={alto} style={{ display: "block", overflow: "visible" }}>
      {bandas.map((b) => (
        <g key={`${b.desde}-${b.hasta}`}>
          <rect x={fx(b.desde)} y={m.t} width={fx(b.hasta) - fx(b.desde)} height={alto - m.b - m.t} fill={b.color ?? "var(--red-dim)"} />
          {b.texto && (
            <text x={(fx(b.desde) + fx(b.hasta)) / 2} y={m.t + 20} textAnchor="middle" className="mono" fontSize={14} fill="var(--red-2)">
              {b.texto}
            </text>
          )}
        </g>
      ))}
      {ticksY.map((t) => (
        <g key={tv(t)}>
          <line x1={m.l} x2={ancho - m.r} y1={fy(tv(t))} y2={fy(tv(t))} stroke="var(--line)" />
          <text x={m.l - 12} y={fy(tv(t)) + 5} textAnchor="end" className="mono" fontSize={15} fill="var(--text-3)">
            {typeof t === "number" ? fmtY(t) : t.texto}
          </text>
        </g>
      ))}
      {ticksX.map((t) => (
        <text key={tv(t)} x={fx(tv(t))} y={alto - m.b + 28} textAnchor="middle" className="mono" fontSize={15} fill="var(--text-3)">
          {typeof t === "number" ? fmtX(t) : t.texto}
        </text>
      ))}
      {rotuloX && (
        <text x={ancho - m.r} y={alto - 2} textAnchor="end" className="mono" fontSize={14} fill="var(--text-3)">
          {rotuloX}
        </text>
      )}
      {rotuloY && (
        <text x={m.l} y={m.t - 2} className="mono" fontSize={14} fill="var(--text-3)">
          {rotuloY}
        </text>
      )}
      {lineasH.map((l) => (
        <g key={l.y}>
          <line x1={m.l} x2={ancho - m.r} y1={fy(l.y)} y2={fy(l.y)} stroke={l.color ?? "var(--text-3)"} strokeDasharray="3 6" />
          {l.texto && (
            <text x={ancho - m.r} y={fy(l.y) + (l.abajo ? 22 : -8)} textAnchor="end" className="mono" fontSize={15} fill={l.color ?? "var(--text-3)"}>
              {l.texto}
            </text>
          )}
        </g>
      ))}
      {lineaV !== undefined && <line x1={fx(lineaV)} x2={fx(lineaV)} y1={m.t} y2={alto - m.b} stroke="var(--line-2)" />}
      <clipPath id={clip}>
        <rect x={m.l} y={m.t} width={ancho - m.l - m.r} height={alto - m.b - m.t} />
      </clipPath>
      <g clipPath={recortar ? `url(#${clip})` : undefined}>
      {series.map((s) => {
        const color = s.color ?? "var(--data)";
        // Cada tramo sin dato (NaN) levanta el lápiz: el siguiente punto empieza con "M".
        let pluma = false;
        let d = "";
        for (const [px, py] of s.pts) {
          if (Number.isNaN(py)) {
            pluma = false;
            continue;
          }
          d += `${pluma ? "L" : "M"}${fx(px)},${fy(py)}`;
          pluma = true;
        }
        const conDato = s.pts.filter((p) => !Number.isNaN(p[1]));
        const ultimo = conDato[conDato.length - 1];
        return (
          <g key={s.id} opacity={s.opacidad ?? 1}>
            {!s.sinLinea &&
              (mover ? (
                <motion.path
                  fill="none"
                  stroke={color}
                  strokeWidth={s.grosor ?? 2.5}
                  strokeDasharray={s.guion}
                  strokeLinejoin="round"
                  initial={{ opacity: 0, d }}
                  animate={{ opacity: 1, d }}
                  transition={mover}
                />
              ) : (
                <motion.path
                  d={d}
                  fill="none"
                  stroke={color}
                  strokeWidth={s.grosor ?? 2.5}
                  strokeDasharray={s.guion}
                  strokeLinejoin="round"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />
              ))}
            {(s.puntos || s.sinLinea) &&
              conDato.map(([px, py], i) =>
                mover ? (
                  <motion.circle key={i} r={s.sinLinea ? 4 : 3} fill={color} initial={false} animate={{ cx: fx(px), cy: fy(py) }} transition={mover} />
                ) : (
                  <circle key={i} cx={fx(px)} cy={fy(py)} r={s.sinLinea ? 4 : 3} fill={color} />
                ),
              )}
            {s.etiqueta && ultimo && (
              <text x={fx(ultimo[0]) + 8} y={fy(ultimo[1]) + 5} fontSize={16} fill={color}>
                {s.etiqueta}
              </text>
            )}
          </g>
        );
      })}
      </g>
      {segmentos.map((s, i) => (
        <g key={i}>
          <line x1={fx(s.x0)} x2={fx(s.x1)} y1={fy(s.y)} y2={fy(s.y)} stroke={s.color ?? "var(--red)"} strokeWidth={s.grosor ?? 3} />
          {s.texto && (
            <text x={(fx(s.x0) + fx(s.x1)) / 2} y={fy(s.y) + (s.abajo ? 24 : -10)} textAnchor="middle" className="mono" fontSize={15} fill={s.color ?? "var(--red-2)"}>
              {s.texto}
            </text>
          )}
        </g>
      ))}
      {marcas.map((k, i) => (
        <g key={i}>
          <circle cx={fx(k.x)} cy={fy(k.y)} r={k.r ?? 7} fill={k.color ?? "var(--red)"} />
          {k.texto && (
            <text x={fx(k.x)} y={fy(k.y) + (k.abajo ? 30 : -16)} textAnchor="middle" className="mono" fontSize={15} fill={k.color ?? "var(--red-2)"}>
              {k.texto}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
