import { motion } from "motion/react";
import { linear } from "../lib/scale";

// Gráfica de líneas en SVG, común a toda la exposición. Rojo = lo que importa; gris claro = contra qué se compara.

export type Serie = {
  id: string;
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

export type Marca = { x: number; y: number; texto?: string; color?: string; abajo?: boolean };

type Tick = number | { v: number; texto: string };
const tv = (t: Tick) => (typeof t === "number" ? t : t.v);

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
  margen = { l: 64, r: 22, t: 16, b: 48 },
  recortar = false,
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
  margen?: { l: number; r: number; t: number; b: number };
  /** Corta las series que se salen del área de la gráfica (cuando una curva se dispara). */
  recortar?: boolean;
}) {
  const m = margen;
  const fx = linear(x, [m.l, ancho - m.r]);
  const fy = linear(y, [alto - m.b, m.t]);
  const clip = `clip-${Math.round(ancho)}-${Math.round(alto)}-${m.l}-${m.t}`;
  return (
    <svg width={ancho} height={alto} style={{ display: "block", overflow: "visible" }}>
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
        const d = s.pts.map(([px, py], i) => `${i ? "L" : "M"}${fx(px)},${fy(py)}`).join("");
        const ultimo = s.pts[s.pts.length - 1];
        return (
          <g key={s.id} opacity={s.opacidad ?? 1}>
            {!s.sinLinea && (
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
            )}
            {(s.puntos || s.sinLinea) && s.pts.map(([px, py], i) => <circle key={i} cx={fx(px)} cy={fy(py)} r={s.sinLinea ? 4 : 3} fill={color} />)}
            {s.etiqueta && ultimo && (
              <text x={fx(ultimo[0]) + 8} y={fy(ultimo[1]) + 5} fontSize={16} fill={color}>
                {s.etiqueta}
              </text>
            )}
          </g>
        );
      })}
      </g>
      {marcas.map((k, i) => (
        <g key={i}>
          <circle cx={fx(k.x)} cy={fy(k.y)} r={7} fill={k.color ?? "var(--red)"} />
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
