import { R } from "../deck/tipografia";
import { motion } from "motion/react";
import { desviacion, media } from "../lib/metricas";
import { linear } from "../lib/scale";

// Un renglón por modelo: arriba, un punto por pliegue; abajo, la media con su ± desviación.
// Si cambia `dominio`, todo se desliza a su nuevo lugar (sirve para acercar la escala a la vista del público).

export type FilaPuntos = {
  nombre: string;
  /** Un valor por pliegue. */
  valores: number[];
  /** Gris: es la referencia, no lo que se resalta. */
  tenue?: boolean;
  /** Si es false, el renglón conserva su lugar pero no se ve. */
  visible?: boolean;
};

const mover = { duration: 0.9, ease: [0.2, 0.7, 0.2, 1] } as const;

export function PuntosIntervalo({
  filas,
  dominio,
  ticks,
  ancho,
  altoFila = 44,
  anchoNombre = 250,
  anchoValor = 200,
  fmt = (v) => v.toFixed(3),
}: {
  filas: FilaPuntos[];
  dominio: [number, number];
  ticks: number[];
  ancho: number;
  altoFila?: number;
  anchoNombre?: number;
  anchoValor?: number;
  fmt?: (v: number) => string;
}) {
  const x0 = anchoNombre;
  const x1 = ancho - anchoValor;
  const fx = linear(dominio, [x0, x1]);
  const alto = filas.length * altoFila;
  return (
    <svg width={ancho} height={alto + R + 14} style={{ display: "block" }}>
      {ticks.map((t) => (
        <motion.g key={t} initial={{ opacity: 0, x: fx(t) }} animate={{ opacity: 1, x: fx(t) }} transition={mover}>
          <line y1={0} y2={alto} stroke="var(--line)" />
          <text y={alto + R + 4} textAnchor="middle" className="mono" fontSize={R} fill="var(--text-3)">
            {t.toFixed(2)}
          </text>
        </motion.g>
      ))}
      {filas.map((f, i) => {
        const m = media(f.valores);
        const d = desviacion(f.valores);
        const y = i * altoFila + altoFila / 2;
        const color = f.tenue ? "var(--data-dim)" : "var(--red)";
        // Queda fuera de la escala (a la izquierda): se dice con una flecha en lugar de dibujarlo donde no va.
        const fuera = m < dominio[0];
        return (
          <motion.g key={f.nombre} initial={false} animate={{ opacity: f.visible === false ? 0 : 1 }} transition={{ duration: 0.45 }}>
            <text x={0} y={y + 7} fontSize={21} fill={f.tenue ? "var(--text-2)" : "var(--text)"}>
              {f.nombre}
            </text>
            <motion.g initial={false} animate={{ opacity: fuera ? 0 : 1 }} transition={mover}>
              {f.valores.map((v, k) => (
                <motion.circle key={k} cy={y - 8} r={4} fill="none" stroke={f.tenue ? "var(--text-3)" : "var(--red-2)"} strokeWidth={1.5} initial={false} animate={{ cx: fx(v) }} transition={mover} />
              ))}
              <motion.line y1={y + 8} y2={y + 8} stroke={color} strokeWidth={3} initial={false} animate={{ x1: fx(m - d), x2: fx(m + d) }} transition={mover} />
              <motion.circle cy={y + 8} r={6.5} fill={color} initial={false} animate={{ cx: fx(m) }} transition={mover} />
            </motion.g>
            <motion.text x={x0 + 6} y={y + 6} className="mono" fontSize={R} fill="var(--text-3)" initial={false} animate={{ opacity: fuera ? 1 : 0 }} transition={mover}>
              ← {fmt(m)}, fuera de esta escala
            </motion.text>
            <text x={ancho} y={y + 7} textAnchor="end" className="mono" fontSize={R} fill={f.tenue ? "var(--text-2)" : "var(--text)"}>
              {fmt(m)} <tspan fill="var(--text-3)">± {fmt(d)}</tspan>
            </text>
          </motion.g>
        );
      })}
    </svg>
  );
}
