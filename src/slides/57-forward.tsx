import { motion } from "motion/react";
import { BarrasForward } from "../components/BarrasForward";
import { Recap } from "../components/Recap";
import { Entra } from "../components/Reveal";
import { TeX } from "../components/TeX";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { CLIMA, CORTO, fmtP, OBS_EJEMPLO } from "../lib/clima";
import { pasosForward } from "../lib/hmm";

const TXT = { fontSize: 26, lineHeight: 1.45, margin: 0 } as const;
const { alpha, predicho } = pasosForward(CLIMA, OBS_EJEMPLO);
const sumas = alpha.map((a) => a.reduce((s, v) => s + v, 0));
const T = OBS_EJEMPLO.length;
const P = sumas[T - 1];

// Esquema del nodo (t, j) del trellis: lo que llega de cada estado de ayer se junta en una suma y se multiplica por b.
function Nodo() {
  const ys = [70, 200, 330];
  const verde = "var(--text-2)";
  return (
    <svg width={760} height={400} style={{ display: "block", overflow: "visible", marginTop: 24 }}>
      <defs>
        <marker id="nodo57" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={14} markerHeight={14} markerUnits="userSpaceOnUse" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill={verde} />
        </marker>
      </defs>
      <text x={60} y={30} textAnchor="middle" className="mono" fontSize={20} fill="var(--text-3)">
        ayer
      </text>
      <text x={660} y={30} textAnchor="middle" className="mono" fontSize={20} fill="var(--text-3)">
        hoy
      </text>
      {ys.map((y, i) => (
        <g key={i}>
          <motion.path
            d={`M${100},${y} L${330},${200}`}
            stroke={verde}
            strokeWidth={2.5}
            markerEnd="url(#nodo57)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: 0.25 * i }}
          />
          <circle cx={60} cy={y} r={38} fill="var(--panel)" stroke="var(--text-2)" strokeWidth={2} />
          <text x={60} y={y + 8} textAnchor="middle" fontSize={22} fill="var(--text)">
            {`α(${i + 1})`}
          </text>
          <text x={200} y={(y + 200) / 2 - 12} textAnchor="middle" className="mono" fontSize={20} fill="var(--text-2)">
            ×a
          </text>
        </g>
      ))}
      <circle cx={370} cy={200} r={36} fill="var(--bg)" stroke="var(--red)" strokeWidth={2.5} />
      <text x={370} y={212} textAnchor="middle" fontSize={34} fill="var(--red-2)">
        Σ
      </text>
      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
        <path d="M410,200 L612,200" stroke={verde} strokeWidth={2.5} markerEnd="url(#nodo57)" />
        <text x={510} y={186} textAnchor="middle" className="mono" fontSize={22} fill="var(--text)">
          × b(hoy)
        </text>
        <circle cx={660} cy={200} r={44} fill="var(--panel)" stroke="var(--text)" strokeWidth={2.5} />
        <text x={660} y={208} textAnchor="middle" fontSize={24} fill="var(--text)">
          α(j)
        </text>
      </motion.g>
    </svg>
  );
}

// Un clic, una idea: 0 qué es α · 1 programación dinámica · 2 inicio y recursión · 3–7 el caso, un movimiento por clic.
export default function Forward({ step }: SlideProps) {
  const caso = step >= 3;
  const calc = (t: number) =>
    [0, 1].map((j) => `${fmtP(t === 0 ? CLIMA.pi[j] : predicho[t][j])}·${fmtP(CLIMA.B[j][OBS_EJEMPLO[t]])} = ${fmtP(alpha[t][j])}`);
  return (
    <SlideFrame section={["U8 · Datos secuenciales", "H. HMM"]} num={57} caso={caso ? "Clima" : null} title="Forward: predecir y corregir, día por día">
      {step === 0 && (
        <Entra style={{ display: "grid", gap: 40, maxWidth: 1200 }}>
          <p style={TXT}>
            <span className="label natural" style={{ display: "block", marginBottom: 12 }}>
              α (alfa)
            </span>
            <TeX>{"\\alpha_t(j)"}</TeX>: la probabilidad de haber visto lo que vimos hasta hoy, y además que hoy el estado sea j.
          </p>
          <div style={{ fontSize: 34 }}>
            <TeX>{"\\alpha_t(j) = P(o_1, \\dots, o_t,\\ q_t = j \\mid \\lambda)"}</TeX>
          </div>
        </Entra>
      )}

      {(step === 1 || step === 2) && (
        <div style={{ display: "grid", gridTemplateColumns: "760px 1fr", gap: 110 }}>
          <div>
            <span className="label">Esquema · una casilla de hoy</span>
            <Nodo />
          </div>
          <div style={{ paddingTop: 40 }}>
            {step === 1 ? (
              <Entra>
                <Recap title="programación dinámica">
                  <p>Guardar resultados parciales para no recalcularlos. Todas las historias que llegan al mismo estado el mismo día se suman una sola vez.</p>
                </Recap>
              </Entra>
            ) : (
              <Entra style={{ display: "grid", gap: 34 }}>
                <span className="label">Inicio</span>
                <div style={{ fontSize: 32 }}>
                  <TeX>{"\\alpha_1(j) = \\pi_j\\, b_j(o_1)"}</TeX>
                </div>
                <span className="label">Cada día siguiente</span>
                <div style={{ fontSize: 32 }}>
                  <TeX>{"\\alpha_t(j) = \\Big[\\textstyle\\sum_i \\alpha_{t-1}(i)\\, a_{ij}\\Big]\\, b_j(o_t)"}</TeX>
                </div>
              </Entra>
            )}
          </div>
        </div>
      )}

      {caso && (
        <div style={{ display: "grid", gridTemplateColumns: "1120px 1fr", gap: 60 }}>
          <BarrasForward modelo={CLIMA} obs={OBS_EJEMPLO} etapa={step - 2} ancho={1120} alto={600} />
          <div style={{ paddingTop: 70 }}>
            {step === 3 && (
              <Entra style={{ display: "grid", gap: 20 }}>
                <p style={TXT}>Primer día: cómo empieza (π) por qué tan probable es lo que hizo.</p>
                {calc(0).map((c, j) => (
                  <div key={j} className="mono" style={{ fontSize: 24 }}>
                    {CORTO[j]}: {c}
                  </div>
                ))}
              </Entra>
            )}
            {step === 4 && (
              <Entra>
                <p style={TXT}>
                  <b>Predecir:</b> repartir lo de ayer según cómo cambia el clima. El total no cambia: {fmtP(sumas[0])}.
                </p>
              </Entra>
            )}
            {step === 5 && (
              <Entra style={{ display: "grid", gap: 20 }}>
                <p style={TXT}>
                  <b>Corregir:</b> multiplicar por qué tan probable era lo que hizo en cada clima.
                </p>
                {calc(1).map((c, j) => (
                  <div key={j} className="mono" style={{ fontSize: 24 }}>
                    {CORTO[j]}: {c}
                  </div>
                ))}
              </Entra>
            )}
            {step === 6 && (
              <Entra style={{ display: "grid", gap: 20 }}>
                <p style={TXT}>Tercer día: lo mismo, predecir y corregir.</p>
                {calc(2).map((c, j) => (
                  <div key={j} className="mono" style={{ fontSize: 24 }}>
                    {CORTO[j]}: {c}
                  </div>
                ))}
              </Entra>
            )}
            {step >= 7 && (
              <Entra style={{ display: "grid", gap: 30 }}>
                <div style={{ fontSize: 30, display: "grid", gap: 8 }}>
                  <TeX>{`P(O \\mid \\lambda) = ${alpha[T - 1].map((v) => fmtP(v)).join(" + ")}`}</TeX>
                  <span style={{ color: "var(--red-2)" }}>
                    <TeX>{`= ${fmtP(P)}`}</TeX>
                  </span>
                </div>
                <p className="takeaway" style={{ margin: 0, fontSize: 28 }}>
                  Igual que las 8 barras de la 56, pero sin recorrer historias: <em>un número por estado y día</em>.
                </p>
              </Entra>
            )}
          </div>
        </div>
      )}
    </SlideFrame>
  );
}
