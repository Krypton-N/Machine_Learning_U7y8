import { motion } from "motion/react";

// Diagramas de cómo se construye un ensamble: en paralelo (bagging, Random Forest) o en secuencia (boosting).

/** Un árbol dibujado con líneas: `niveles` = cuántas preguntas en cadena. */
export function ArbolGlifo({ x, y, niveles, ancho = 70, color = "var(--text-2)" }: { x: number; y: number; niveles: number; ancho?: number; color?: string }) {
  const lineas: [number, number, number, number][] = [];
  const dy = 22;
  const rec = (cx: number, cy: number, w: number, n: number) => {
    if (n === 0) return;
    lineas.push([cx, cy, cx - w / 2, cy + dy], [cx, cy, cx + w / 2, cy + dy]);
    rec(cx - w / 2, cy + dy, w / 2, n - 1);
    rec(cx + w / 2, cy + dy, w / 2, n - 1);
  };
  rec(x, y, ancho / 2, niveles);
  return (
    <g>
      {lineas.map(([a, b, c, d], i) => (
        <line key={i} x1={a} y1={b} x2={c} y2={d} stroke={color} strokeWidth={1.6} />
      ))}
      <circle cx={x} cy={y} r={3.5} fill={color} />
    </g>
  );
}

const caja = { fill: "var(--panel)", stroke: "var(--line-2)" };
const texto = { fontSize: 19, fill: "var(--text)", textAnchor: "middle" as const };
const nota = { fontSize: 15, fill: "var(--text-3)", textAnchor: "middle" as const, className: "mono" };

const aparecer = (i: number) => ({ initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.15 * i, duration: 0.4 } });

/** Datos → B muestras → B árboles profundos, cada uno por su cuenta → promedio o voto. */
export function FlujoParalelo({ ancho = 760 }: { ancho?: number }) {
  const filas = [42, 128, 214];
  return (
    <svg width={ancho} height={(ancho / 760) * 256} viewBox="0 0 760 256">
      <motion.g {...aparecer(0)}>
        <rect x={10} y={100} width={120} height={56} {...caja} />
        <text x={70} y={135} {...texto}>
          datos
        </text>
      </motion.g>
      {filas.map((fy, i) => (
        <motion.g key={i} {...aparecer(1 + i)}>
          <line x1={130} y1={128} x2={210} y2={fy} stroke="var(--line-2)" />
          <rect x={210} y={fy - 22} width={130} height={44} {...caja} />
          <text x={275} y={fy + 7} {...texto}>
            muestra {i === 2 ? "B" : i + 1}
          </text>
          <line x1={340} y1={fy} x2={400} y2={fy} stroke="var(--line-2)" />
          <ArbolGlifo x={450} y={fy - 34} niveles={3} ancho={84} />
          <line x1={505} y1={fy} x2={600} y2={128} stroke="var(--line-2)" />
        </motion.g>
      ))}
      <motion.g {...aparecer(4)}>
        <text x={275} y={176} {...nota}>
          ⋮
        </text>
        <rect x={600} y={96} width={150} height={64} fill="var(--red-dim)" stroke="var(--red)" />
        <text x={675} y={124} {...texto}>
          promedio
        </text>
        <text x={675} y={147} {...texto} fontSize={17} fill="var(--text-2)">
          o voto
        </text>
      </motion.g>
    </svg>
  );
}

/** Datos → árbol pequeño → sus errores → otro árbol que los corrige → … → suma. */
export function FlujoSecuencial({ ancho = 760 }: { ancho?: number }) {
  const xs = [220, 420, 620];
  return (
    <svg width={ancho} height={(ancho / 760) * 256} viewBox="0 0 760 256">
      <motion.g {...aparecer(0)}>
        <rect x={10} y={42} width={110} height={56} {...caja} />
        <text x={65} y={77} {...texto}>
          datos
        </text>
      </motion.g>
      {xs.map((x, i) => (
        <motion.g key={i} {...aparecer(1 + i)}>
          <line x1={i === 0 ? 120 : xs[i - 1] + 50} y1={70} x2={x - 50} y2={70} stroke="var(--line-2)" markerEnd="url(#flecha)" />
          <ArbolGlifo x={x} y={50} niveles={1} ancho={70} />
          <text x={x} y={108} {...nota}>
            árbol {i === 2 ? "M" : i + 1}
          </text>
          {i < 2 && (
            <text x={x + 100} y={56} {...nota} fill="var(--red-2)">
              lo que falló
            </text>
          )}
          <line x1={x} y1={118} x2={x} y2={176} stroke="var(--line-2)" />
        </motion.g>
      ))}
      <motion.g {...aparecer(4)}>
        <rect x={170} y={176} width={500} height={58} fill="var(--red-dim)" stroke="var(--red)" />
        <text x={420} y={212} {...texto}>
          suma de todos, cada uno con su peso
        </text>
      </motion.g>
      <defs>
        <marker id="flecha" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--line-2)" />
        </marker>
      </defs>
    </svg>
  );
}
