import { motion } from "motion/react";

// Diagrama de particiones para validar: cada fila es una ronda y cada celda, un momento en orden.
// Gris = entrenamiento, rojo = prueba, vacío = todavía no existe. Con `fuga`, se rayan las celdas de
// entrenamiento que son posteriores a alguna de prueba: futuro que el modelo ya vio.

export type FilaParticion = { etiqueta: string; entrenamiento: number[]; prueba: number[] };

/** Celdas de entrenamiento posteriores a la primera de prueba de su fila. */
export const futuroUsado = (f: FilaParticion) => {
  const primera = Math.min(...f.prueba);
  return f.entrenamiento.filter((i) => i > primera);
};

export function SplitDiagram({
  n,
  filas,
  ancho,
  altoCelda = 40,
  separacion = 14,
  anchoEtiqueta = 150,
  fuga = false,
  flecha,
  marcas = [],
  hueco = 3,
}: {
  n: number;
  filas: FilaParticion[];
  ancho: number;
  altoCelda?: number;
  separacion?: number;
  anchoEtiqueta?: number;
  fuga?: boolean;
  /** Arco de una celda de entrenamiento hacia una de prueba anterior, en la fila indicada. */
  flecha?: { fila: number; desde: number; hacia: number };
  /** Rótulos bajo el eje del tiempo (por ejemplo, los años). */
  marcas?: { i: number; texto: string }[];
  /** Espacio entre celdas; con muchas celdas conviene 1. */
  hueco?: number;
}) {
  const w = (ancho - anchoEtiqueta) / n;
  const yDe = (f: number) => 30 + f * (altoCelda + separacion);
  const alto = yDe(filas.length) + (marcas.length ? 30 : 6);
  const xDe = (i: number) => anchoEtiqueta + i * w;
  return (
    <svg width={ancho} height={alto} style={{ display: "block", overflow: "visible" }}>
      <defs>
        <pattern id="rayado-fuga" width={11} height={11} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width={11} height={11} fill="var(--data-dim)" />
          <rect width={2.5} height={11} fill="var(--red)" />
        </pattern>
        <marker id="punta-fuga" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={9} markerHeight={9} orient="auto-start-reverse">
          <path d="M0,0L10,5L0,10z" fill="var(--red-2)" />
        </marker>
      </defs>
      <text x={ancho} y={14} textAnchor="end" className="mono" fontSize={15} fill="var(--text-3)">
        tiempo →
      </text>
      {filas.map((f, r) => {
        const usado = new Set(fuga ? futuroUsado(f) : []);
        const ent = new Set(f.entrenamiento);
        const pru = new Set(f.prueba);
        return (
          <g key={r}>
            <text x={0} y={yDe(r) + altoCelda / 2 + 6} className="mono" fontSize={16} fill="var(--text-3)">
              {f.etiqueta}
            </text>
            {Array.from({ length: n }, (_, i) => {
              const relleno = pru.has(i) ? "#e5383b" : ent.has(i) ? "#55555d" : "rgba(0,0,0,0)";
              const caja = { x: xDe(i) + hueco / 2, y: yDe(r), width: Math.max(1, w - hueco), height: altoCelda };
              return (
                <g key={i}>
                  <motion.rect
                    {...caja}
                    initial={false}
                    animate={{ fill: relleno, stroke: pru.has(i) || ent.has(i) ? "rgba(0,0,0,0)" : "#3a3a41" }}
                    transition={{ duration: 0.4 }}
                    strokeDasharray="3 4"
                  />
                  {/* El rayado va encima y solo cambia de opacidad: un patrón no se puede interpolar como un color. */}
                  {fuga && <motion.rect {...caja} fill="url(#rayado-fuga)" initial={{ opacity: 0 }} animate={{ opacity: usado.has(i) ? 1 : 0 }} transition={{ duration: 0.4 }} />}
                </g>
              );
            })}
          </g>
        );
      })}
      {flecha && (
        <motion.path
          key={`${flecha.fila}-${flecha.desde}-${flecha.hacia}`}
          d={`M${xDe(flecha.desde) + w / 2},${yDe(flecha.fila) - 4} Q${(xDe(flecha.desde) + xDe(flecha.hacia)) / 2 + w / 2},${yDe(flecha.fila) - 34} ${xDe(flecha.hacia) + w / 2},${yDe(flecha.fila) - 5}`}
          fill="none"
          stroke="var(--red-2)"
          strokeWidth={3}
          markerEnd="url(#punta-fuga)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6 }}
        />
      )}
      {marcas.map((k) => (
        <text key={k.i} x={xDe(k.i)} y={alto - 6} className="mono" fontSize={15} fill="var(--text-3)">
          {k.texto}
        </text>
      ))}
    </svg>
  );
}
