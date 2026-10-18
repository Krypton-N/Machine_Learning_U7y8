import { motion } from "motion/react";
import { useId } from "react";
import { R } from "../deck/tipografia";

// Red desplegada en el tiempo (esquema): qué se ve, qué no, y de qué depende cada cosa.
// - "ar": solo lo que se mide (cuadros), cada valor depende del anterior.
// - "hmm": arriba los estados ocultos (círculos), abajo lo que producen (cuadros).
// - "cadena": solo estados en fila (cadena de Markov), con una flecha larga que no hace falta.
// Los cuadros quedan en el mismo lugar en "ar" y "hmm": al cambiar de variante aparecen los estados encima.

export function RedTemporal({
  T,
  variante,
  ancho,
  alto,
  rotuloOculto = (t) => `q${sub(t)}`,
  rotuloVisto = (t) => `o${sub(t)}`,
  rotulosFila,
  resaltar = null,
  prohibidas = false,
  cortina = false,
  tacharLarga = false,
  anchoCuadro,
}: {
  T: number;
  variante: "ar" | "hmm" | "cadena";
  ancho: number;
  alto: number;
  rotuloOculto?: (t: number) => string;
  rotuloVisto?: (t: number) => string;
  /** Rótulos a la izquierda de cada fila: [estados, observaciones]. */
  rotulosFila?: [string, string];
  /** Flechas que se pintan de rojo: las de la cadena (supuesto 1) o las de emisión (supuesto 2). */
  resaltar?: "markov" | "emision" | null;
  /** Dibuja, punteada y tachada, una flecha que el supuesto resaltado dice que no existe. */
  prohibidas?: boolean;
  /** Panel "NO SE VE" sobre la fila de estados. */
  cortina?: boolean;
  /** En "cadena": la flecha larga q₁ → q₄ se tacha. */
  tacharLarga?: boolean;
  anchoCuadro?: number;
}) {
  const id = useId().replace(/:/g, "");
  const izq = rotulosFila ? 200 : 40;
  const paso = (ancho - izq - 40) / T;
  const xs = Array.from({ length: T }, (_, t) => izq + paso * (t + 0.5));
  const r = Math.min(46, paso * 0.28);
  const wc = anchoCuadro ?? Math.min(170, paso * 0.72);
  const hc = 66;
  const yArriba = variante === "cadena" ? alto * 0.62 : alto * 0.27;
  const yAbajo = alto - hc / 2 - 8;
  const hayEstados = variante !== "ar";
  const hayVistos = variante !== "cadena";

  const gris = "var(--text-2)";
  const rojo = "var(--red)";
  const colorH = resaltar === "markov" ? rojo : gris;
  const colorV = resaltar === "emision" ? rojo : gris;
  const grosor = (activa: boolean) => (activa ? 3.5 : 2.2);

  const flecha = (key: string, d: string, color: string, ancho_: number, guion?: string, retraso = 0) => (
    <motion.path
      key={key}
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={ancho_}
      strokeDasharray={guion}
      markerEnd={`url(#${id}-${color === rojo ? "r" : "g"})`}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: retraso }}
    />
  );
  const tache = (x: number, y: number, key: string) => (
    <motion.g key={key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
      <line x1={x - 14} y1={y - 14} x2={x + 14} y2={y + 14} stroke={rojo} strokeWidth={4} />
      <line x1={x - 14} y1={y + 14} x2={x + 14} y2={y - 14} stroke={rojo} strokeWidth={4} />
    </motion.g>
  );

  return (
    <svg width={ancho} height={alto} style={{ display: "block", overflow: "visible" }}>
      <defs>
        {(["g", "r"] as const).map((k) => (
          <marker key={k} id={`${id}-${k}`} viewBox="0 0 10 10" refX={9} refY={5} markerWidth={7} markerHeight={7} orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill={k === "r" ? rojo : gris} />
          </marker>
        ))}
      </defs>

      {rotulosFila && (
        <>
          {hayEstados && (
            <text x={0} y={yArriba + 7} className="mono" fontSize={R} fill="var(--text-3)" letterSpacing="0.08em">
              {rotulosFila[0]}
            </text>
          )}
          {hayVistos && (
            <text x={0} y={yAbajo + 7} className="mono" fontSize={R} fill="var(--text-3)" letterSpacing="0.08em">
              {rotulosFila[1]}
            </text>
          )}
        </>
      )}

      {/* Flechas entre observaciones: solo en AR (en el HMM no existen) */}
      {variante === "ar" &&
        xs.slice(1).map((x, t) => flecha(`ar${t}`, `M${xs[t] + wc / 2 + 4},${yAbajo} L${x - wc / 2 - 6},${yAbajo}`, gris, 2.2, undefined, 0.1 * t))}

      {/* Cadena de estados */}
      {hayEstados &&
        xs.slice(1).map((x, t) =>
          flecha(`h${t}`, `M${xs[t] + r + 4},${yArriba} L${x - r - 6},${yArriba}`, colorH, grosor(resaltar === "markov"), undefined, 0.1 * t),
        )}
      {/* Emisiones */}
      {variante === "hmm" &&
        xs.map((x, t) => flecha(`v${t}`, `M${x},${yArriba + r + 4} L${x},${yAbajo - hc / 2 - 6}`, colorV, grosor(resaltar === "emision"), undefined, 0.3 + 0.12 * t))}

      {/* Flecha larga que la propiedad de Markov vuelve innecesaria */}
      {variante === "cadena" && T >= 4 && (
        <g>
          {flecha("larga", `M${xs[0]},${yArriba - r - 4} Q${(xs[0] + xs[3]) / 2},${yArriba - r - 190} ${xs[3] - 6},${yArriba - r - 8}`, gris, 2.2, "6 8", 0.6)}
          {tacharLarga && tache((xs[0] + xs[3]) / 2, yArriba - r - 99, "tl")}
        </g>
      )}

      {/* Lo que cada supuesto dice que no existe */}
      {prohibidas && resaltar === "markov" && T >= 2 && (
        <g>
          {flecha("p1", `M${xs[0] + wc / 2 + 4},${yAbajo} L${xs[1] - wc / 2 - 6},${yAbajo}`, gris, 2, "5 7", 0.4)}
          {tache((xs[0] + xs[1]) / 2, yAbajo, "tp1")}
        </g>
      )}
      {prohibidas && resaltar === "emision" && T >= 2 && (
        <g>
          {flecha("p2", `M${xs[0] + r * 0.8},${yArriba + r * 0.7} L${xs[1] - wc / 2 + 8},${yAbajo - hc / 2 - 6}`, gris, 2, "5 7", 0.4)}
          {tache((xs[0] + r * 0.8 + xs[1] - wc / 2 + 8) / 2, (yArriba + r * 0.7 + yAbajo - hc / 2) / 2, "tp2")}
        </g>
      )}

      {/* Nodos */}
      {hayEstados &&
        xs.map((x, t) => (
          <motion.g key={`q${t}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.08 * t }}>
            <circle cx={x} cy={yArriba} r={r} fill="var(--bg)" stroke="var(--text-2)" strokeWidth={2} strokeDasharray={variante === "hmm" ? "6 5" : undefined} />
            {/* Con la cortina abajo, el nombre del estado no se ve (ni se debe medir como texto encimado). */}
            {!cortina && (
              <text x={x} y={yArriba + 9} textAnchor="middle" fontSize={26} fill="var(--text)">
                {rotuloOculto(t)}
              </text>
            )}
          </motion.g>
        ))}
      {hayVistos &&
        xs.map((x, t) => (
          <g key={`o${t}`}>
            <rect x={x - wc / 2} y={yAbajo - hc / 2} width={wc} height={hc} fill="var(--panel)" stroke="var(--text-2)" strokeWidth={2} />
            <text x={x} y={yAbajo + 9} textAnchor="middle" fontSize={26} fill="var(--text)">
              {rotuloVisto(t)}
            </text>
          </g>
        ))}

      {cortina && hayEstados && (
        <motion.g initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }} style={{ originY: 0 }}>
          <rect x={xs[0] - r - 30} y={yArriba - r - 18} width={xs[T - 1] - xs[0] + 2 * r + 60} height={2 * r + 36} fill="var(--bg-2)" stroke="var(--line-2)" />
          <text x={(xs[0] + xs[T - 1]) / 2} y={yArriba + 8} textAnchor="middle" className="mono" fontSize={24} letterSpacing="0.2em" fill="var(--text-3)">
            NO SE VE
          </text>
        </motion.g>
      )}
    </svg>
  );
}

const SUBS = "₀₁₂₃₄₅₆₇₈₉";
/** Subíndice del día t (contando desde 1). */
export const sub = (t: number) => String(t + 1).replace(/\d/g, (d) => SUBS[Number(d)]);
