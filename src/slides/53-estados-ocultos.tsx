import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { DiagramaClima, estiloEstado } from "../components/DiagramaClima";
import { Boton, Def } from "../components/Piezas";
import { Recap } from "../components/Recap";
import { Entra } from "../components/Reveal";
import { RedTemporal } from "../components/RedTemporal";
import { TablasLambda } from "../components/TablasLambda";
import { TeX } from "../components/TeX";
import { TiraDias } from "../components/TiraDias";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { CLIMA, fmtP, OBS_EJEMPLO } from "../lib/clima";
import { forward, simular } from "../lib/hmm";
import { mulberry32 } from "../lib/rng";

const TXT = { fontSize: 26, lineHeight: 1.45, margin: 0 } as const;
// Semilla de la semana elegida por búsqueda: 3 días de lluvia (limpiar, limpiar, comprar) y 4 de sol (caminar). Es una simulación.
const SEMILLA = 8;
// Bayes del primer día: π·b(caminar) para cada clima, y normalizado. Es α₁ (la 57 lo retoma).
const a1 = forward(CLIMA, [OBS_EJEMPLO[0]])[0];
const pCaminar = a1[0] + a1[1];
const posterior = a1.map((v) => v / pCaminar);
const cam = CLIMA.symbols[OBS_EJEMPLO[0]];

// Un clic, una idea: 0–1 qué es "oculto" · 2–3 la matriz B del caso · 4–5 una semana generada · 6–7 Bayes de un día.
export default function EstadosOcultos({ step }: SlideProps) {
  const [semilla, setSemilla] = useState(SEMILLA);
  const semana = useMemo(() => simular(CLIMA, 7, mulberry32(semilla)), [semilla]);
  const caso = step >= 2;
  return (
    <SlideFrame section={["U8 · Datos secuenciales", "H. HMM"]} num={53} caso={caso ? "Clima" : null} title="Estados ocultos: solo vemos lo que el estado produce">
      {step <= 1 && (
        <div style={{ display: "grid", gridTemplateColumns: "1000px 1fr", gap: 80 }}>
          <div>
            <span className="label">Esquema</span>
            <RedTemporal T={5} variante="hmm" ancho={1000} alto={420} rotulosFila={["estado", "se ve"]} cortina={step === 1} />
          </div>
          <div style={{ paddingTop: 50 }}>
            {step === 0 ? (
              <Entra>
                <Def termino="Modelo oculto de Markov">una cadena de Markov que no vemos, más una regla que en cada paso produce algo que sí vemos.</Def>
              </Entra>
            ) : (
              <Entra>
                <p style={TXT}>El estado sigue cambiando, pero detrás de una cortina: solo vemos lo que produce.</p>
              </Entra>
            )}
          </div>
        </div>
      )}

      {(step === 2 || step === 3) && (
        <div style={{ display: "grid", gridTemplateColumns: "900px 1fr", gap: 50 }}>
          <DiagramaClima modelo={CLIMA} mostrar={{ B: true }} ancho={900} alto={470} />
          <div style={{ paddingTop: 10 }}>
            {step === 2 ? (
              <Entra>
                <p style={TXT}>
                  Si llueve, casi no sale a caminar ({fmtP(CLIMA.B[0][0])}); si hace sol, camina en más de la mitad de los días ({fmtP(CLIMA.B[1][0])}).
                </p>
              </Entra>
            ) : (
              <Entra style={{ display: "grid", gap: 26 }}>
                <TablasLambda modelo={CLIMA} cuales={["B"]} sumas tam={22} />
                <p style={TXT}>La matriz B: renglón = clima, columna = actividad.</p>
                <div style={{ fontSize: 30 }}>
                  <TeX>{"b_j(k) = P(o_t = k \\mid q_t = j)"}</TeX>
                </div>
              </Entra>
            )}
          </div>
        </div>
      )}

      {(step === 4 || step === 5) && (
        <Entra>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 26 }}>
            <span className="label natural">ESQUEMA · UNA SEMANA SIMULADA CON π, A Y B</span>
            <Boton onClick={() => setSemilla((v) => v + 1)}>otra semana</Boton>
          </div>
          <TiraDias key={semilla} estados={semana.estados} obs={semana.obs} nombresEstado={CLIMA.states} simbolos={CLIMA.symbols} celda={200} altoEstado={84} ocultarEstados={step === 5} />
          <div style={{ marginTop: 44 }}>
            {step === 4 ? (
              <p style={TXT}>Así genera el modelo: primero el clima con A, luego la actividad con B.</p>
            ) : (
              <Entra>
                <p style={TXT}>
                  Tu vista: <b>solo la fila de abajo</b>.
                </p>
              </Entra>
            )}
          </div>
        </Entra>
      )}

      {step >= 6 && (
        <div style={{ display: "grid", gridTemplateColumns: "940px 1fr", gap: 90 }}>
          <div>
            <span className="label">Primer día: {cam}</span>
            <svg width={940} height={300} style={{ display: "block", marginTop: 30 }}>
              {[0, 1].map((j) => {
                const e = estiloEstado(j);
                const v = step >= 7 ? posterior[j] : a1[j];
                const w = (step >= 7 ? posterior[j] : a1[j] / pCaminar) * 600;
                return (
                  <g key={j} transform={`translate(0, ${40 + j * 130})`}>
                    <text x={0} y={44} fontSize={28} fontWeight={600} fill="var(--text)">
                      {CLIMA.states[j]}
                    </text>
                    <motion.rect x={180} y={10} height={56} fill={e.fill} stroke={e.stroke} strokeWidth={2} initial={false} animate={{ width: step >= 7 ? w : w * 0.3 }} transition={{ duration: 0.8 }} />
                    <motion.text key={step >= 7 ? "n" : "p"} y={48} className="mono" fontSize={26} fill="var(--text)" initial={{ opacity: 0 }} animate={{ opacity: 1, x: 180 + (step >= 7 ? w : w * 0.3) + 16 }} transition={{ duration: 0.8 }}>
                      {step >= 7
                        ? `${(100 * v).toFixed(0)} %`
                        : `π·b = ${fmtP(CLIMA.pi[j])}·${fmtP(CLIMA.B[j][OBS_EJEMPLO[0]])} = ${fmtP(v)}`}
                    </motion.text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div style={{ display: "grid", gap: 30, alignContent: "start" }}>
            {step === 6 ? (
              <Entra>
                <Recap title="regla de Bayes">
                  <p>Es la regla del producto despejada.</p>
                  <div style={{ fontSize: 30, marginTop: 18 }}>
                    <TeX>{"P(A \\mid B) = \\dfrac{P(B \\mid A)\\,P(A)}{P(B)}"}</TeX>
                  </div>
                </Recap>
              </Entra>
            ) : (
              <Entra style={{ display: "grid", gap: 30 }}>
                <div style={{ fontSize: 30 }}>
                  <TeX>{`P(\\text{S} \\mid \\text{${cam}}) = \\dfrac{${fmtP(a1[1])}}{${fmtP(pCaminar)}} = ${fmtP(posterior[1])}`}</TeX>
                </div>
                <p className="takeaway" style={{ margin: 0 }}>
                  Un solo día ya dice algo: si caminó, <em>{(100 * posterior[1]).toFixed(0)} % de sol</em>. Con varios días hay que combinar A y B.
                </p>
              </Entra>
            )}
          </div>
        </div>
      )}
    </SlideFrame>
  );
}
