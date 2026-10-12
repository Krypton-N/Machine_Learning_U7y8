import { motion } from "motion/react";
import { useMemo } from "react";
import { mulberry32 } from "../lib/rng";

// Muestreo con reemplazo con n pelotas numeradas: se saca una, se anota y se regresa, n veces.
// Lo usan la diapositiva 10 y la R1.

export function sortear(n: number, semilla: number): number[] {
  const r = mulberry32(semilla);
  return Array.from({ length: n }, () => Math.floor(r() * n));
}

export function TableroSorteos({ n = 5, semilla }: { n?: number; semilla: number }) {
  const sorteos = useMemo(() => sortear(n, semilla), [n, semilla]);
  const veces = Array.from({ length: n }, (_, k) => sorteos.filter((s) => s === k).length);
  const R = 44;
  const paso = 124;
  const W = n * paso;
  return (
    <svg width={W} height={380} style={{ display: "block" }}>
      <text x={0} y={18} className="mono" fontSize={15} fill="var(--text-3)" letterSpacing="0.1em">
        LA BOLSA
      </text>
      {veces.map((v, k) => (
        <g key={k}>
          <circle cx={k * paso + R + 6} cy={82} r={R} fill={v ? "var(--panel)" : "transparent"} stroke={v ? "var(--text-2)" : "var(--line-2)"} strokeDasharray={v ? undefined : "5 5"} />
          <text x={k * paso + R + 6} y={93} textAnchor="middle" fontSize={32} fontWeight={600} fill={v ? "var(--text)" : "var(--text-3)"}>
            {k + 1}
          </text>
          <motion.text
            key={`${semilla}-${k}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: n * 0.45 + 0.2 }}
            x={k * paso + R + 6}
            y={158}
            textAnchor="middle"
            className="mono"
            fontSize={18}
            fill={v === 0 ? "var(--red-2)" : "var(--text-3)"}
          >
            {v === 0 ? "nunca" : v === 1 ? "1 vez" : `${v} veces`}
          </motion.text>
        </g>
      ))}
      <text x={0} y={222} className="mono" fontSize={15} fill="var(--text-3)" letterSpacing="0.1em">
        LO QUE SALIÓ EN {n} SORTEOS
      </text>
      {sorteos.map((s, i) => (
        <motion.g key={`${semilla}-${i}`} initial={{ opacity: 0, y: -90 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.45, duration: 0.4 }}>
          <circle cx={i * paso + R + 6} cy={286} r={R} fill="var(--red-dim)" stroke="var(--red)" />
          <text x={i * paso + R + 6} y={297} textAnchor="middle" fontSize={32} fontWeight={600} fill="var(--text)">
            {s + 1}
          </text>
        </motion.g>
      ))}
      <text x={0} y={368} className="mono" fontSize={20} fill="var(--text-2)">
        distintas: {veces.filter((v) => v > 0).length} de {n} · quedaron fuera: {veces.filter((v) => v === 0).length}
      </text>
    </svg>
  );
}
