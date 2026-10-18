import { motion } from "motion/react";
import { Entra } from "../components/Reveal";
import { TablaAMano } from "../components/TablaAMano";
import { TeX } from "../components/TeX";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { CLIMA, fmtP, OBS_EJEMPLO } from "../lib/clima";
import { casillaMasAlta, probConjunta, viterbi } from "../lib/hmm";

const TXT = { fontSize: 26, lineHeight: 1.45, margin: 0 } as const;
const T = OBS_EJEMPLO.length;
const vit = viterbi(CLIMA, OBS_EJEMPLO);
const nombres = (q: number[]) => q.map((j) => CLIMA.states[j]).join(" → ");
const codicioso = casillaMasAlta(vit.delta);
const pCodicioso = probConjunta(CLIMA, codicioso, OBS_EJEMPLO).conjunta;

// Esquema del principio de optimalidad: dos rutas de A a C; la mejor pasa por B₂.
function Rutas() {
  const nodos = { A: [70, 190], B1: [380, 80], B2: [380, 300], C: [690, 190] } as const;
  const linea = (de: keyof typeof nodos, a: keyof typeof nodos, mejor: boolean, retraso: number) => (
    <motion.path
      d={`M${nodos[de][0]},${nodos[de][1]} L${nodos[a][0]},${nodos[a][1]}`}
      stroke={mejor ? "var(--red)" : "var(--line-2)"}
      strokeWidth={mejor ? 5 : 2.5}
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.5, delay: retraso }}
    />
  );
  return (
    <svg width={760} height={390} style={{ display: "block" }}>
      {linea("A", "B1", false, 0)}
      {linea("B1", "C", false, 0)}
      {linea("A", "B2", true, 0.3)}
      {linea("B2", "C", true, 0.8)}
      {Object.entries(nodos).map(([k, [x, y]]) => (
        <g key={k}>
          <circle cx={x} cy={y} r={40} fill="var(--panel)" stroke={k === "B1" ? "var(--line-2)" : "var(--text)"} strokeWidth={2.5} />
          <text x={x} y={y + 9} textAnchor="middle" fontSize={26} fill="var(--text)">
            {k.replace("1", "₁").replace("2", "₂")}
          </text>
        </g>
      ))}
    </svg>
  );
}

// Un clic, una idea: 0 qué es δ · 1 principio de optimalidad · 2–4 la tabla por días · 5 el regreso · 6 la casilla
// más alta de cada columna no es el mejor camino.
export default function Viterbi({ step }: SlideProps) {
  const caso = step >= 2;
  return (
    <SlideFrame section={["U8 · Datos secuenciales", "H. HMM"]} num={59} caso={caso ? "Clima" : null} title="Viterbi: el mejor camino, guardando de dónde vino">
      {step === 0 && (
        <Entra style={{ display: "grid", gap: 36, maxWidth: 1300 }}>
          <p style={TXT}>
            <TeX>{"\\delta_t(j)"}</TeX>: la probabilidad del <b>mejor</b> camino que termina hoy en j. Igual que Forward, pero con máximo en lugar de suma, y
            anotando de dónde vino (ψ).
          </p>
          <div style={{ fontSize: 32 }}>
            <TeX>{"\\delta_t(j) = \\Big[{\\color{#e5383b}\\max_i}\\ \\delta_{t-1}(i)\\, a_{ij}\\Big]\\, b_j(o_t)"}</TeX>
          </div>
          <div style={{ fontSize: 32 }}>
            <TeX>{"\\psi_t(j) = \\arg\\max_i\\ \\delta_{t-1}(i)\\, a_{ij}"}</TeX>
          </div>
        </Entra>
      )}

      {step === 1 && (
        <Entra style={{ display: "grid", gridTemplateColumns: "760px 1fr", gap: 110 }}>
          <div>
            <span className="label">Esquema · dos rutas de A a C</span>
            <Rutas />
          </div>
          <p style={{ ...TXT, paddingTop: 80 }}>
            Si la mejor ruta a C pasa por B₂, su tramo hasta B₂ es la mejor ruta a B₂. Por eso basta guardar, en cada casilla, la mejor forma de
            llegar.
          </p>
        </Entra>
      )}

      {caso && (
        <>
          <TablaAMano modelo={CLIMA} obs={OBS_EJEMPLO} tipo="viterbi" columnas={Math.min(step - 1, T)} regreso={step === 5} masAlta={step >= 6} />
          <div style={{ marginTop: 40 }}>
            {step === 2 && (
              <Entra>
                <p style={TXT}>El primer día, igual que Forward.</p>
              </Entra>
            )}
            {step === 3 && (
              <Entra>
                <p style={TXT}>De dos formas de llegar, me quedo con la mejor (en rojo) y apunto de dónde vino (←).</p>
              </Entra>
            )}
            {step === 4 && (
              <Entra>
                <p style={TXT}>El tercer día, igual. La tabla cuesta lo mismo que la de Forward.</p>
              </Entra>
            )}
            {step === 5 && (
              <Entra>
                <p style={TXT}>
                  Se lee al revés, siguiendo las flechas: <b style={{ color: "var(--red-2)" }}>{nombres(vit.path)}</b>, con P = {fmtP(vit.best)}: la barra más
                  alta de la 56.
                </p>
              </Entra>
            )}
            {step >= 6 && (
              <Entra>
                <p className="takeaway" style={{ margin: 0, fontSize: 28 }}>
                  ¿Y si sigo la casilla más alta de cada columna? {nombres(codicioso)} vale {fmtP(pCodicioso)}: <em>peor</em>. Hay que guardar de dónde vino
                  cada máximo.
                </p>
              </Entra>
            )}
          </div>
        </>
      )}
    </SlideFrame>
  );
}
