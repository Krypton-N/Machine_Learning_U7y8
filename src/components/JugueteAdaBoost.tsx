import { motion } from "motion/react";
import { adaboost, votoStump } from "../lib/adaboost";
import { linear } from "../lib/scale";

// Ejemplo de 8 puntos para explicar AdaBoost a mano (diapositivas 18 y 19).
// Se eligió por búsqueda para que cada ronda use un corte distinto y a la tercera el comité acierte todo.
// Todo lo que se muestra (cortes, errores, pesos, α) sale de lib/adaboost.ts.

export const JUGUETE = {
  X: [
    [4, 1],
    [1, 2],
    [2, 7],
    [5, 8],
    [8, 6],
    [6, 5],
    [3, 3],
    [7, 4],
  ],
  y: [1, 0, 1, 1, 0, 1, 0, 0],
};
export const RONDAS_JUGUETE = adaboost(JUGUETE.X, JUGUETE.y, 3);

/** Los 8 puntos con el corte de la ronda `m` (0, 1, 2). El tamaño de cada punto es su peso al empezar esa ronda. */
export function JugueteAdaBoost({ m, lado = 440, mostrarNuevos = false }: { m: number; lado?: number; mostrarNuevos?: boolean }) {
  const r = RONDAS_JUGUETE[m];
  const pesos = mostrarNuevos ? r.pesos : r.pesosAntes;
  const fx = linear([0, 9], [34, lado - 14]);
  const fy = linear([0, 9], [lado - 34, 14]);
  const s = r.stump;
  // El lado del corte que responde "sí" se sombrea.
  const si = s.left === 1 ? "izq" : "der";
  const corte = s.feature === 0 ? fx(s.threshold) : fy(s.threshold);
  const sombra =
    s.feature === 0
      ? si === "izq"
        ? { x: 34, y: 14, width: corte - 34, height: lado - 48 }
        : { x: corte, y: 14, width: lado - 14 - corte, height: lado - 48 }
      : si === "izq"
        ? { x: 34, y: corte, width: lado - 48, height: lado - 34 - corte }
        : { x: 34, y: 14, width: lado - 48, height: corte - 14 };
  return (
    <svg width={lado} height={lado} style={{ display: "block" }}>
      <rect x={34} y={14} width={lado - 48} height={lado - 48} fill="none" stroke="var(--line-2)" />
      <motion.rect initial={false} animate={sombra} transition={{ duration: 0.5 }} fill="var(--red-dim)" />
      <motion.line
        initial={false}
        animate={s.feature === 0 ? { x1: corte, x2: corte, y1: 14, y2: lado - 34 } : { x1: 34, x2: lado - 14, y1: corte, y2: corte }}
        transition={{ duration: 0.5 }}
        stroke="var(--red)"
        strokeWidth={3}
      />
      {JUGUETE.X.map((x, i) => {
        const bien = votoStump(s, x) === (JUGUETE.y[i] ? 1 : -1);
        return (
          <g key={i}>
            <motion.circle
              cx={fx(x[0])}
              cy={fy(x[1])}
              initial={false}
              animate={{ r: 8 + 70 * pesos[i] }}
              transition={{ duration: 0.5 }}
              fill={JUGUETE.y[i] ? "var(--red)" : "var(--data)"}
              stroke={bien ? "none" : "#fff"}
              strokeWidth={3}
              strokeDasharray="5 4"
            />
            <text x={fx(x[0])} y={fy(x[1]) + 5} textAnchor="middle" className="mono" fontSize={14} fill="#0c0c0d">
              {i + 1}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
