import { motion } from "motion/react";
import { useId, type ReactNode } from "react";
import { CORTO, fmtP } from "../lib/clima";
import { forward, viterbi, type HMM } from "../lib/hmm";
import { sub } from "./RedTemporal";

// La tabla del pizarrón: estados × días, cada casilla con su operación. Forward suma lo que llega; Viterbi escribe
// los dos candidatos, tacha el perdedor y apunta de dónde vino el ganador (flecha ψ). Las flechas se calculan con las
// mismas medidas de la tabla, no midiendo el DOM.

export function TablaAMano({
  modelo,
  obs,
  tipo,
  columnas,
  plantilla = false,
  regreso = false,
  masAlta = false,
  anchoCol,
  altoFila,
}: {
  modelo: HMM;
  obs: number[];
  tipo: "forward" | "viterbi";
  /** Cuántas columnas (días) ya tienen números. */
  columnas: number;
  /** Casillas con su nombre (α₁(L), …) en vez de vacías. */
  plantilla?: boolean;
  /** Viterbi: el camino que se lee hacia atrás por las flechas, en rojo. */
  regreso?: boolean;
  /** Viterbi: la casilla más alta de cada columna, punteada, unida sin seguir las flechas. */
  masAlta?: boolean;
  anchoCol?: number;
  altoFila?: number;
}) {
  const id = useId().replace(/:/g, "");
  const N = modelo.states.length;
  const T = obs.length;
  const alpha = forward(modelo, obs);
  const vit = viterbi(modelo, obs);
  const tabla = tipo === "forward" ? alpha : vit.delta;
  const letra = tipo === "forward" ? "α" : "δ";
  const anchoRot = 150;
  // En Viterbi el hueco entre columnas es ancho para que se vean las flechas ψ.
  const sep = tipo === "viterbi" ? 96 : 22;
  const ac = anchoCol ?? (tipo === "viterbi" ? 440 : 480);
  const altoCab = 56;
  const hf = altoFila ?? (tipo === "viterbi" ? 176 : 132);
  const anchoTotal = anchoRot + T * ac + (T - 1) * sep;
  const altoTotal = altoCab + N * hf + (N - 1) * 14;
  const xCol = (t: number) => anchoRot + t * (ac + sep);
  const yFila = (j: number) => altoCab + j * (hf + 14);
  const enCamino = (t: number, j: number) => regreso && vit.path[t] === j;
  const columnaMax = (t: number) => tabla[t].indexOf(Math.max(...tabla[t]));

  const contenido = (t: number, j: number): ReactNode => {
    if (t >= columnas)
      return plantilla ? (
        <span style={{ fontSize: 30, fontStyle: "italic", color: "var(--text-3)" }}>
          {letra}
          {sub(t)}({CORTO[j]})
        </span>
      ) : (
        <span style={{ color: "var(--text-3)" }}>·</span>
      );
    const b = modelo.B[j][obs[t]];
    if (t === 0)
      return (
        <>
          <div style={{ color: "var(--text-2)" }}>
            {fmtP(modelo.pi[j])}·{fmtP(b)}
          </div>
          <div style={{ fontSize: 30 }}>= {fmtP(tabla[0][j])}</div>
        </>
      );
    const prev = tabla[t - 1];
    if (tipo === "forward") {
      const pred = prev.reduce((s, v, i) => s + v * modelo.A[i][j], 0);
      return (
        <>
          <div style={{ color: "var(--text-2)" }}>
            ({prev.map((v, i) => `${fmtP(v)}·${fmtP(modelo.A[i][j])}`).join(" + ")})·{fmtP(b)}
          </div>
          <div style={{ color: "var(--text-2)" }}>
            = {fmtP(pred)}·{fmtP(b)} <span style={{ fontSize: 30, color: "var(--text)" }}>= {fmtP(tabla[t][j])}</span>
          </div>
        </>
      );
    }
    const gana = vit.psi[t][j];
    return (
      <>
        {prev.map((v, i) => (
          <div key={i} style={{ color: i === gana ? "var(--red-2)" : "var(--text-3)", textDecoration: i === gana ? undefined : "line-through", opacity: i === gana ? 1 : 0.55 }}>
            {CORTO[i]}: {fmtP(v)}·{fmtP(modelo.A[i][j])} = {fmtP(v * modelo.A[i][j])}
          </div>
        ))}
        <div>
          ×{fmtP(b)} <span style={{ fontSize: 30 }}>= {fmtP(tabla[t][j])}</span> <span style={{ color: "var(--text-3)" }}>← {CORTO[gana]}</span>
        </div>
      </>
    );
  };

  // Flechas ψ: del borde derecho de la casilla ganadora de ayer al borde izquierdo de la de hoy.
  const flechas: ReactNode[] = [];
  if (tipo === "viterbi")
    for (let t = 1; t < Math.min(columnas, T); t++)
      for (let j = 0; j < N; j++) {
        const i = vit.psi[t][j];
        const camino = regreso && vit.path[t] === j && vit.path[t - 1] === i;
        flechas.push(
          <motion.path
            key={`${t}${j}`}
            d={`M${xCol(t - 1) + ac - 4},${yFila(i) + hf / 2} L${xCol(t) + 6},${yFila(j) + hf / 2}`}
            stroke={camino ? "var(--red)" : regreso ? "var(--line-2)" : "var(--text-2)"}
            strokeWidth={camino ? 5 : 2.5}
            markerEnd={`url(#${id}-${camino ? "r" : "g"})`}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: camino ? 0.5 * (T - 1 - t) : 0.3 }}
          />,
        );
      }

  return (
    <div style={{ position: "relative", width: anchoTotal, height: altoTotal }}>
      {Array.from({ length: T }, (_, t) => (
        <div key={`c${t}`} style={{ position: "absolute", left: xCol(t), top: 0, width: ac, textAlign: "center", fontSize: 26 }}>
          <span className="mono" style={{ color: "var(--text-3)", fontSize: 22 }}>
            día {t + 1} ·{" "}
          </span>
          <span style={{ color: t < columnas ? "var(--red-2)" : "var(--text-2)" }}>{modelo.symbols[obs[t]]}</span>
        </div>
      ))}
      {Array.from({ length: N }, (_, j) => (
        <div key={`r${j}`} style={{ position: "absolute", left: 0, top: yFila(j), height: hf, display: "flex", alignItems: "center", fontSize: 28, fontWeight: 600 }}>
          {modelo.states[j]}
        </div>
      ))}
      {Array.from({ length: T }, (_, t) =>
        Array.from({ length: N }, (_, j) => {
          const nueva = t === columnas - 1 && !regreso && !masAlta;
          const camino = enCamino(t, j);
          const punteada = masAlta && t < columnas && columnaMax(t) === j;
          return (
            <motion.div
              key={`${t}${j}`}
              className="mono"
              style={{
                position: "absolute",
                left: xCol(t),
                top: yFila(j),
                width: ac,
                height: hf,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 4,
                padding: "0 22px",
                fontSize: 24,
                lineHeight: 1.3,
                whiteSpace: "nowrap",
                background: camino ? "var(--red-dim)" : "var(--panel)",
                border: `${camino || punteada ? 3 : 1}px ${punteada && !camino ? "dashed" : "solid"} ${camino ? "var(--red)" : punteada ? "var(--text)" : nueva ? "var(--text-2)" : "var(--line-2)"}`,
              }}
              initial={false}
              animate={{ opacity: 1 }}
            >
              <motion.div key={`${t < columnas}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                {contenido(t, j)}
              </motion.div>
            </motion.div>
          );
        }),
      )}
      <svg width={anchoTotal} height={altoTotal} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", overflow: "visible" }}>
        <defs>
          {(["g", "r"] as const).map((k) => (
            <marker key={k} id={`${id}-${k}`} viewBox="0 0 10 10" refX={9} refY={5} markerWidth={5} markerHeight={5} orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill={k === "r" ? "var(--red)" : "var(--text-2)"} />
            </marker>
          ))}
        </defs>
        {flechas}
      </svg>
    </div>
  );
}
