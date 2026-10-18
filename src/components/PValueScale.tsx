import { anchoMono, R } from "../deck/tipografia";
import { motion } from "motion/react";

// Escala de p-valores en escala logarítmica (de 0.0001 a 1) con la raya en α = 0.05. La zona sombreada es la que se
// quiere: en ADF, p chico (se rechaza la raíz unitaria); en Ljung-Box, p grande (no hay evidencia de que sobre algo).

const MARCAS = [0.0001, 0.001, 0.01, 0.05, 0.1, 1];
const SUAVE = [0.2, 0.7, 0.2, 1] as const;

export const formatoP = (p: number) => (p < 0.001 ? p.toExponential(1) : p.toFixed(3));

export function PValueScale({
  p,
  quiere,
  rotulo,
  ancho,
  alto = 120,
  alfa = 0.05,
}: {
  /** Sin p se dibuja solo la escala (para explicar cuál zona se quiere). */
  p?: number;
  quiere: "chico" | "grande";
  rotulo: string;
  ancho: number;
  alto?: number;
  alfa?: number;
}) {
  // Margen de medio número a cada lado, para que "0.0001" y "1" no se salgan de la gráfica.
  const m = { l: anchoMono("0.0001") / 2 + 4, r: 14 };
  const eje = alto - 34;
  const x = (v: number) => m.l + ((Math.log10(Math.min(1, Math.max(1e-4, v))) + 4) / 4) * (ancho - m.l - m.r);
  const zona = quiere === "chico" ? [x(1e-4), x(alfa)] : [x(alfa), x(1)];
  const rechaza = p !== undefined && p < alfa;
  return (
    <svg width={ancho} height={alto} style={{ display: "block", overflow: "visible" }}>
      <text x={m.l} y={R} className="mono" fontSize={R} fill="var(--text-2)">
        {rotulo}
        {/* El veredicto va junto al título: a la derecha chocaría con el p cuando p se acerca a 1. */}
        {p !== undefined && <tspan fill={rechaza === (quiere === "chico") ? "var(--red-2)" : "var(--text-3)"}>{` · ${rechaza ? "se rechaza H₀" : "no se rechaza H₀"}`}</tspan>}
      </text>
      <rect x={zona[0]} y={eje - 28} width={zona[1] - zona[0]} height={28} fill="var(--red-dim)" />
      <text x={(zona[0] + zona[1]) / 2} y={eje - 8} textAnchor="middle" className="mono" fontSize={R} fill="var(--red-2)">
        {quiere === "chico" ? "quieres p < 0.05" : "quieres p > 0.05"}
      </text>
      <line x1={m.l} x2={ancho - m.r} y1={eje} y2={eje} stroke="var(--line-2)" />
      {MARCAS.map((v) => (
        <g key={v}>
          <line x1={x(v)} x2={x(v)} y1={eje} y2={eje + 5} stroke={v === alfa ? "var(--red)" : "var(--line-2)"} />
          {/* En una escala angosta, 0.1 queda pegado a 0.05 y sus números se enciman: se deja solo la raya. */}
          {!(v === 0.1 && x(0.1) - x(alfa) < anchoMono("0.05") + 10) && (
            <text x={x(v)} y={eje + R + 4} textAnchor="middle" className="mono" fontSize={R} fill={v === alfa ? "var(--red-2)" : "var(--text-3)"}>
              {v}
            </text>
          )}
        </g>
      ))}
      <line x1={x(alfa)} x2={x(alfa)} y1={eje - 32} y2={eje} stroke="var(--red)" strokeDasharray="3 3" />
      {p !== undefined && (
        <motion.g initial={{ x: x(quiere === "chico" ? 1 : 1e-4), opacity: 0 }} animate={{ x: x(p), opacity: 1 }} transition={{ duration: 0.7, ease: SUAVE }}>
          <path d={`M0,${eje - 1}L-7,${eje - 13}L7,${eje - 13}Z`} fill="var(--text)" />
          <text y={eje - 36} textAnchor={x(p) > ancho - 90 ? "end" : x(p) < 90 ? "start" : "middle"} className="mono" fontSize={R} fill="var(--text)">
            p = {formatoP(p)}
          </text>
        </motion.g>
      )}
    </svg>
  );
}
