import { motion } from "motion/react";
import { ejeQueCubre, linear } from "../lib/scale";
import { pasoRedondo } from "./SeriesChart";

// Barras sobre una lista en orden (años, rezagos, pasos después de un choque, pesos de una ventana).
// Siempre nacen de la línea del 0 y, si cambian los datos, cada una viaja a su nueva altura.

const SUAVE = [0.2, 0.7, 0.2, 1] as const;

export function Barras({
  valores,
  etiquetas,
  ancho,
  alto,
  y,
  pasoY,
  fmtY = (v) => String(v),
  rojo,
  color = "var(--data)",
  banda,
  rotulo,
  encima,
  cada = 1,
  grosor = 0.62,
  margen = { l: 58, r: 12, t: 22, b: 36 },
  transicion = 0.5,
  rotuloBanda,
}: {
  /** Una barra por valor; `null` deja el hueco. */
  valores: (number | null)[];
  /** Texto bajo cada barra (se muestra una de cada `cada`). */
  etiquetas?: string[];
  ancho: number;
  alto: number;
  /** Dominio vertical; si falta, se calcula de los datos e incluye al 0. */
  y?: [number, number];
  pasoY?: number;
  fmtY?: (v: number) => string;
  /** Qué barras van en rojo. */
  rojo?: (i: number) => boolean;
  color?: string;
  /** Franja de ±banda alrededor del 0 (lo que cabría esperar por azar). */
  banda?: number;
  rotulo?: string;
  /** Texto sobre la barra i (por ejemplo su valor); `undefined` para no escribir nada. */
  encima?: (i: number) => string | undefined;
  cada?: number;
  /** Fracción del espacio de cada barra que ocupa su ancho. */
  grosor?: number;
  margen?: { l: number; r: number; t: number; b: number };
  transicion?: number;
  rotuloBanda?: string;
}) {
  const m = margen;
  const datos = valores.filter((v): v is number => v !== null && !Number.isNaN(v));
  const cubrir = [...datos, 0, ...(banda ? [banda, -banda] : [])];
  const eje = y ? ejeQueCubre(y, pasoY ?? pasoRedondo(y[1] - y[0], 4)) : ejeQueCubre(cubrir, pasoY ?? pasoRedondo(Math.max(...cubrir) - Math.min(...cubrir) || 1, 4));
  const fy = linear(eje.dominio, [alto - m.b, m.t]);
  const paso = (ancho - m.l - m.r) / valores.length;
  const cero = fy(0);
  return (
    <svg width={ancho} height={alto} style={{ display: "block", overflow: "visible" }}>
      {eje.ticks.map((t) => (
        <g key={t}>
          <line x1={m.l} x2={ancho - m.r} y1={fy(t)} y2={fy(t)} stroke="var(--line)" />
          <text x={m.l - 10} y={fy(t) + 5} textAnchor="end" className="mono" fontSize={15} fill="var(--text-3)">
            {fmtY(t)}
          </text>
        </g>
      ))}
      {banda !== undefined && (
        <g>
          <motion.rect x={m.l} width={ancho - m.l - m.r} fill="var(--red-dim)" initial={false} animate={{ y: fy(banda), height: fy(-banda) - fy(banda) }} transition={{ duration: transicion }} />
          {rotuloBanda && (
            <text x={ancho - m.r} y={fy(banda) - 8} textAnchor="end" className="mono" fontSize={14} fill="var(--red-2)">
              {rotuloBanda}
            </text>
          )}
        </g>
      )}
      {rotulo && (
        <text x={m.l} y={m.t - 8} className="mono" fontSize={15} fill="var(--text-2)">
          {rotulo}
        </text>
      )}
      {valores.map((v, i) => {
        if (v === null || Number.isNaN(v)) return null;
        const x = m.l + i * paso + (paso * (1 - grosor)) / 2;
        const arriba = Math.min(fy(v), cero);
        const h = Math.max(1, Math.abs(fy(v) - cero));
        const texto = encima?.(i);
        return (
          <g key={i}>
            <motion.rect x={x} width={paso * grosor} fill={rojo?.(i) ? "var(--red)" : color} initial={false} animate={{ y: arriba, height: h }} transition={{ duration: transicion, ease: SUAVE }} />
            {texto !== undefined && (
              <motion.text
                x={x + (paso * grosor) / 2}
                textAnchor="middle"
                className="mono"
                fontSize={15}
                fill={rojo?.(i) ? "var(--red-2)" : "var(--text-2)"}
                initial={false}
                animate={{ y: v >= 0 ? arriba - 7 : arriba + h + 18 }}
                transition={{ duration: transicion, ease: SUAVE }}
              >
                {texto}
              </motion.text>
            )}
          </g>
        );
      })}
      <line x1={m.l} x2={ancho - m.r} y1={cero} y2={cero} stroke="var(--line-2)" />
      {etiquetas?.map((t, i) =>
        i % cada === 0 ? (
          <text key={i} x={m.l + i * paso + paso / 2} y={alto - m.b + 24} textAnchor="middle" className="mono" fontSize={15} fill="var(--text-3)">
            {t}
          </text>
        ) : null,
      )}
    </svg>
  );
}
