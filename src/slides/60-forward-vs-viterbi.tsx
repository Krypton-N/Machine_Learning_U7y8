import { motion } from "motion/react";
import type { ReactNode } from "react";
import { Reveal } from "../components/Reveal";
import { TeX } from "../components/TeX";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { forward, viterbi, type HMM } from "../lib/hmm";

// Ejemplo clásico del clima (el mismo λ de la diapositiva 54).
const model: HMM = {
  states: ["Lluvioso", "Soleado"],
  symbols: ["caminar", "comprar", "limpiar"],
  pi: [0.6, 0.4],
  A: [
    [0.7, 0.3],
    [0.4, 0.6],
  ],
  B: [
    [0.1, 0.4, 0.5],
    [0.6, 0.3, 0.1],
  ],
};
const obs = [0, 1, 2];
const short = ["L", "S"];
const sub = ["₁", "₂", "₃"];

const alpha = forward(model, obs);
const vit = viterbi(model, obs);
const pObs = alpha[2].reduce((s, v) => s + v, 0);

const fmt = (v: number) => v.toPrecision(4);

// Geometría del trellis
const W = 790;
const H = 320;
const COLS = [205, 435, 665];
const ROWS = [70, 245];
const NW = 150;
const NH = 62;

type Kind = "forward" | "viterbi";

function Trellis({ kind, step }: { kind: Kind; step: number }) {
  const table = kind === "forward" ? alpha : vit.delta;
  const filled = Math.min(step, 3); // columnas visibles
  const done = step >= 4;
  const onPath = (t: number, j: number) => kind === "viterbi" && done && vit.path[t] === j;

  const edges: ReactNode[] = [];
  for (let t = 1; t < filled; t++) {
    const activeCol = t === filled - 1 && !done;
    for (let j = 0; j < 2; j++) {
      for (let i = 0; i < 2; i++) {
        const x1 = COLS[t - 1] + NW / 2;
        const x2 = COLS[t] - NW / 2;
        const y1 = ROWS[i];
        const y2 = ROWS[j];
        let stroke = activeCol ? "var(--text-3)" : "var(--line-2)";
        let width = 1.5;
        let dash: string | undefined;
        if (kind === "viterbi") {
          const winner = vit.psi[t][j] === i;
          if (winner) {
            stroke = activeCol ? "var(--red)" : "var(--red-line)";
            width = 2.5;
          } else dash = "4 6";
          if (done) {
            const pathEdge = vit.path[t - 1] === i && vit.path[t] === j;
            stroke = pathEdge ? "var(--red)" : "var(--line)";
            width = pathEdge ? 4 : 1.2;
          }
        }
        edges.push(
          <motion.line
            key={`${t}-${i}-${j}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={stroke}
            strokeWidth={width}
            strokeDasharray={dash}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          />,
        );
      }
    }
  }

  return (
    <svg width={W} height={H} style={{ display: "block" }}>
      {model.states.map((s, j) => (
        <text key={s} x={0} y={ROWS[j] + 7} fontSize={21} fill="var(--text-2)">
          {s}
        </text>
      ))}
      {edges}
      {COLS.map((cx, t) =>
        ROWS.map((cy, j) => {
          const shown = t < filled;
          const isNew = t === filled - 1 && !done;
          const hot = onPath(t, j);
          return (
            <g key={`${t}-${j}`}>
              <rect
                x={cx - NW / 2}
                y={cy - NH / 2}
                width={NW}
                height={NH}
                fill={hot ? "var(--red-dim)" : "var(--panel)"}
                stroke={hot ? "var(--red)" : isNew ? "var(--text-2)" : "var(--line-2)"}
                strokeWidth={hot ? 2 : 1}
              />
              <motion.text
                x={cx}
                y={cy + 8}
                textAnchor="middle"
                className="mono"
                fontSize={22}
                fill={hot ? "var(--text)" : shown ? "var(--text)" : "var(--text-3)"}
                initial={false}
                animate={{ opacity: shown ? 1 : 0.5 }}
              >
                {shown ? fmt(table[t][j]) : "·"}
              </motion.text>
            </g>
          );
        }),
      )}
    </svg>
  );
}

// Renglones de cálculo de la última columna llenada.
function Calc({ kind, step }: { kind: Kind; step: number }) {
  const sym = kind === "forward" ? "α" : "δ";
  if (step === 0) return <div style={{ color: "var(--text-3)" }}>Avanza para llenar la primera columna.</div>;

  if (step >= 4) {
    return kind === "forward" ? (
      <div>
        P(O | λ) = α₃(L) + α₃(S) = {fmt(alpha[2][0])} + {fmt(alpha[2][1])} ={" "}
        <span style={{ color: "var(--red-2)" }}>{fmt(pObs)}</span>
        <div style={{ color: "var(--text-3)", marginTop: 6 }}>probabilidad de ver la secuencia, sumando todos los caminos</div>
      </div>
    ) : (
      <div>
        mejor camino: <span style={{ color: "var(--red-2)" }}>{vit.path.map((j) => model.states[j]).join(" → ")}</span>
        <div style={{ color: "var(--text-3)", marginTop: 6 }}>
          P = {fmt(vit.best)} · se lee hacia atrás por las flechas rojas
        </div>
      </div>
    );
  }

  const t = step - 1;
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {[0, 1].map((j) => {
        const lhs = `${sym}${sub[t]}(${short[j]})`;
        const b = model.B[j][obs[t]];
        if (t === 0) {
          return (
            <div key={j}>
              {lhs} = π<sub>{short[j]}</sub>·b<sub>{short[j]}</sub> = {model.pi[j]}·{b} = {fmt(alpha[0][j])}
            </div>
          );
        }
        const prev = kind === "forward" ? alpha[t - 1] : vit.delta[t - 1];
        const terms = [0, 1].map((i) => {
          const win = kind === "viterbi" && vit.psi[t][j] === i;
          return (
            <span key={i} style={{ color: win ? "var(--red-2)" : undefined }}>
              {fmt(prev[i])}·{model.A[i][j]}
            </span>
          );
        });
        const value = kind === "forward" ? alpha[t][j] : vit.delta[t][j];
        return (
          <div key={j}>
            {lhs} = {kind === "forward" ? "(" : "max("}
            {terms[0]}
            {kind === "forward" ? " + " : ", "}
            {terms[1]})·{b} = {fmt(value)}
            {kind === "viterbi" && <span style={{ color: "var(--text-3)" }}> ← {short[vit.psi[t][j]]}</span>}
          </div>
        );
      })}
    </div>
  );
}

function Panel({ kind, step }: { kind: Kind; step: number }) {
  const isF = kind === "forward";
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "1px solid var(--line)", paddingBottom: 16 }}>
        <div>
          <span style={{ fontSize: 32, fontWeight: 600, letterSpacing: "-0.015em" }}>{isF ? "Forward" : "Viterbi"}</span>
          <span style={{ fontSize: 20, color: "var(--text-3)", marginLeft: 16 }}>
            {isF ? "¿qué tan probable es lo que vi?" : "¿qué secuencia de estados lo explica mejor?"}
          </span>
        </div>
      </div>
      <div style={{ fontSize: 27, margin: "20px 0 6px" }}>
        {isF ? (
          <TeX>{"\\alpha_t(j) = \\Big[{\\color{#e5383b}\\textstyle\\sum_i}\\ \\alpha_{t-1}(i)\\,a_{ij}\\Big]\\, b_j(o_t)"}</TeX>
        ) : (
          <TeX>{"\\delta_t(j) = \\Big[{\\color{#e5383b}\\max_i}\\ \\delta_{t-1}(i)\\,a_{ij}\\Big]\\, b_j(o_t)"}</TeX>
        )}
      </div>
      <Trellis kind={kind} step={step} />
      <div className="mono" style={{ fontSize: 20, lineHeight: 1.5, color: "var(--text-2)", minHeight: 84, paddingLeft: 4, marginTop: 8 }}>
        <Calc kind={kind} step={step} />
      </div>
    </div>
  );
}

export default function ForwardVsViterbi({ step }: SlideProps) {
  return (
    <SlideFrame
      section={["U8 · Datos secuenciales", "H. HMM"]}
      num={60}
      title={
        <>
          Forward y Viterbi: <span className="accent">suma</span> contra <span className="accent">máximo</span>
        </>
      }
    >
      {/* Observaciones alineadas con las columnas del trellis */}
      <div style={{ display: "grid", gridTemplateColumns: `${W}px ${W}px`, justifyContent: "space-between", marginTop: -12 }}>
        {[0, 1].map((p) => (
          <div key={p} style={{ position: "relative", height: 54 }}>
            <span className="label" style={{ position: "absolute", left: 0, top: 26 }}>
              Se ve
            </span>
            {COLS.map((cx, t) => (
              <div key={t} style={{ position: "absolute", left: cx - NW / 2, width: NW, textAlign: "center" }}>
                <div className="mono" style={{ fontSize: 15, color: "var(--text-3)" }}>
                  t = {t + 1}
                </div>
                <div style={{ fontSize: 22, color: step > t && step < 4 ? "var(--text)" : "var(--text-2)" }}>{model.symbols[obs[t]]}</div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: `${W}px ${W}px`, justifyContent: "space-between", marginTop: 26 }}>
        <Panel kind="forward" step={step} />
        <Panel kind="viterbi" step={step} />
      </div>

      <Reveal step={step} at={5} style={{ position: "absolute", left: 0, right: 0, bottom: 0, display: "flex", alignItems: "baseline", gap: 40 }}>
        <p className="takeaway" style={{ margin: 0, flex: 1 }}>
          La misma tabla y el mismo costo, <em>O(N²T)</em> en vez de <em>O(Nᵀ)</em>. Lo único que cambia es <em>Σ</em> por <em>max</em>, y
          Viterbi además guarda de dónde vino cada máximo.
        </p>
      </Reveal>
    </SlideFrame>
  );
}
