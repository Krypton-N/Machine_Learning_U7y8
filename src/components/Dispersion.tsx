import { motion } from "motion/react";
import { ejeQueCubre, linear } from "../lib/scale";
import { pasoRedondo } from "./SeriesChart";

// Dispersión de dos listas. Los puntos conservan su identidad: si cambian los datos, cada uno viaja a su nuevo
// lugar. Sirve para "un valor contra el siguiente" (rezagos) y para cualquier regresión de una variable.

const SUAVE = [0.2, 0.7, 0.2, 1] as const;

export function Dispersion({
  x,
  y,
  ancho,
  alto,
  rotuloX,
  rotuloY,
  dominioX,
  dominioY,
  recta,
  color = "var(--data)",
  radio = 4,
  opacidad = 0.85,
  transicion = 0.8,
  fmt = (v) => String(v),
}: {
  x: number[];
  y: number[];
  ancho: number;
  alto: number;
  rotuloX?: string;
  rotuloY?: string;
  /** Si faltan, se calculan de los datos. Para "valor contra el siguiente" conviene pasar el mismo en los dos. */
  dominioX?: [number, number];
  dominioY?: [number, number];
  /** "diagonal": la recta y = x. O una recta cualquiera, y = a + b·x. */
  recta?: "diagonal" | { a: number; b: number; color?: string };
  color?: string;
  radio?: number;
  opacidad?: number;
  transicion?: number;
  fmt?: (v: number) => string;
}) {
  const m = { l: 62, r: 16, t: 14, b: 50 };
  const ex = dominioX ? ejeQueCubre(dominioX, pasoRedondo(dominioX[1] - dominioX[0], 4)) : ejeQueCubre(x, pasoRedondo(Math.max(...x) - Math.min(...x) || 1, 4));
  const ey = dominioY ? ejeQueCubre(dominioY, pasoRedondo(dominioY[1] - dominioY[0], 4)) : ejeQueCubre(y, pasoRedondo(Math.max(...y) - Math.min(...y) || 1, 4));
  const fx = linear(ex.dominio, [m.l, ancho - m.r]);
  const fy = linear(ey.dominio, [alto - m.b, m.t]);
  const linea = recta === "diagonal" ? { a: 0, b: 1, color: undefined } : recta;
  const [x0, x1] = ex.dominio;
  return (
    <svg width={ancho} height={alto} style={{ display: "block", overflow: "visible" }}>
      <clipPath id={`disp-${Math.round(ancho)}-${Math.round(alto)}`}>
        <rect x={m.l} y={m.t} width={ancho - m.l - m.r} height={alto - m.t - m.b} />
      </clipPath>
      {ey.ticks.map((t) => (
        <g key={`y${t}`}>
          <line x1={m.l} x2={ancho - m.r} y1={fy(t)} y2={fy(t)} stroke="var(--line)" />
          <text x={m.l - 10} y={fy(t) + 5} textAnchor="end" className="mono" fontSize={15} fill="var(--text-3)">
            {fmt(t)}
          </text>
        </g>
      ))}
      {ex.ticks.map((t) => (
        <g key={`x${t}`}>
          <line x1={fx(t)} x2={fx(t)} y1={m.t} y2={alto - m.b} stroke="var(--line)" />
          <text x={fx(t)} y={alto - m.b + 24} textAnchor="middle" className="mono" fontSize={15} fill="var(--text-3)">
            {fmt(t)}
          </text>
        </g>
      ))}
      {rotuloX && (
        <text x={ancho - m.r} y={alto - 4} textAnchor="end" className="mono" fontSize={15} fill="var(--text-2)">
          {rotuloX}
        </text>
      )}
      {rotuloY && (
        <text x={m.l} y={m.t - 2} className="mono" fontSize={15} fill="var(--text-2)">
          {rotuloY}
        </text>
      )}
      <g clipPath={`url(#disp-${Math.round(ancho)}-${Math.round(alto)})`}>
        {linea && (
          <motion.line
            initial={false}
            animate={{ x1: fx(x0), y1: fy(linea.a + linea.b * x0), x2: fx(x1), y2: fy(linea.a + linea.b * x1) }}
            transition={{ duration: transicion, ease: SUAVE }}
            stroke={linea.color ?? "var(--text-3)"}
            strokeWidth={recta === "diagonal" ? 1.5 : 2.5}
            strokeDasharray={recta === "diagonal" ? "4 6" : undefined}
          />
        )}
        {x.map((v, i) => (
          <motion.circle key={i} r={radio} fill={color} opacity={opacidad} initial={false} animate={{ cx: fx(v), cy: fy(y[i]) }} transition={{ duration: transicion, ease: SUAVE }} />
        ))}
      </g>
    </svg>
  );
}
