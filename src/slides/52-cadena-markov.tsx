import { useMemo, useState } from "react";
import { DiagramaClima } from "../components/DiagramaClima";
import { Boton } from "../components/Piezas";
import { Recap } from "../components/Recap";
import { Entra } from "../components/Reveal";
import { RedTemporal } from "../components/RedTemporal";
import { TablasLambda } from "../components/TablasLambda";
import { TeX } from "../components/TeX";
import { TiraDias } from "../components/TiraDias";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { CLIMA, fmtP } from "../lib/clima";
import { probCadena, simular } from "../lib/hmm";
import { mulberry32 } from "../lib/rng";

const TXT = { fontSize: 26, lineHeight: 1.45, margin: 0 } as const;
const DIAS = 60;
// Semilla elegida para que en 60 días haya rachas largas de los dos climas (es una simulación, rotulada así).
const SEMILLA = 7;
const LLS = [0, 0, 1];
const pLLS = probCadena(CLIMA, LLS);
const rachaMedia = CLIMA.A.map((fila, i) => 1 / (1 - fila[i]));

// Un clic, una idea: 0 recordatorio · 1 propiedad de Markov · 2–4 el caso (diagrama, matriz, una historia) · 5–6 rachas.
export default function CadenaMarkov({ step }: SlideProps) {
  const [semilla, setSemilla] = useState(SEMILLA);
  const tira = useMemo(() => simular(CLIMA, DIAS, mulberry32(semilla)).estados, [semilla]);
  const caso = step >= 2;
  return (
    <SlideFrame section={["U8 · Datos secuenciales", "H. HMM"]} num={52} caso={caso ? "Clima" : null} title="Cadena de Markov: el mañana solo mira el hoy">
      {step === 0 && (
        <Entra style={{ width: 640 }}>
          <Recap title="probabilidad condicional">
            <p>P(B | A): la probabilidad de B sabiendo que ya pasó A.</p>
            <div style={{ fontSize: 30, margin: "22px 0 10px" }}>
              <TeX>{"P(B \\mid A) = \\dfrac{P(A \\cap B)}{P(A)}"}</TeX>
            </div>
            <div style={{ fontSize: 30 }}>
              <TeX>{"P(A \\cap B) = P(A)\\,P(B \\mid A)"}</TeX>
            </div>
          </Recap>
        </Entra>
      )}

      {step === 1 && (
        <Entra style={{ display: "grid", gridTemplateColumns: "1000px 1fr", gap: 80 }}>
          <div>
            <span className="label">Esquema · estados uno tras otro</span>
            <RedTemporal T={5} variante="cadena" ancho={1000} alto={420} tacharLarga />
          </div>
          <div style={{ display: "grid", gap: 30, alignContent: "start", paddingTop: 40 }}>
            <div style={{ fontSize: 30 }}>
              <TeX>{"P(q_{t+1} \\mid q_t, \\dots, q_1) = P(q_{t+1} \\mid q_t)"}</TeX>
            </div>
            <p style={TXT}>
              <b>Propiedad de Markov:</b> para saber mañana basta con saber hoy. Como un juego de mesa: la siguiente casilla depende de dónde estás y
              del dado, no de cómo llegaste.
            </p>
          </div>
        </Entra>
      )}

      {step >= 2 && step <= 4 && (
        <div style={{ display: "grid", gridTemplateColumns: "1000px 1fr", gap: 70 }}>
          <DiagramaClima modelo={CLIMA} mostrar={{ A: true }} ancho={1000} alto={560} camino={step === 4 ? LLS : undefined} resaltarFila={step === 2 ? 0 : null} />
          <div style={{ paddingTop: 40 }}>
            {step === 2 && (
              <Entra>
                <p style={TXT}>
                  Si hoy llueve, mañana llueve con {fmtP(CLIMA.A[0][0])} y sale el sol con {fmtP(CLIMA.A[0][1])}. El grosor de cada flecha es su
                  probabilidad.
                </p>
              </Entra>
            )}
            {step === 3 && (
              <Entra style={{ display: "grid", gap: 30 }}>
                <TablasLambda modelo={CLIMA} cuales={["A"]} sumas tam={26} />
                <p style={TXT}>La matriz A guarda esas flechas. Cada renglón suma 1: mañana algo tiene que pasar.</p>
              </Entra>
            )}
            {step === 4 && (
              <Entra style={{ display: "grid", gap: 30 }}>
                <p style={TXT}>
                  π = ({CLIMA.pi.map((v) => fmtP(v)).join(", ")}) dice cómo empieza el primer día. Una historia completa es un producto:
                </p>
                <div style={{ fontSize: 30 }}>
                  <TeX>{`P(\\text{L},\\text{L},\\text{S}) = \\pi_{\\text{L}}\\,a_{\\text{LL}}\\,a_{\\text{LS}}`}</TeX>
                </div>
                <div style={{ fontSize: 30 }}>
                  <TeX>{`= ${fmtP(CLIMA.pi[0])} \\cdot ${fmtP(CLIMA.A[0][0])} \\cdot ${fmtP(CLIMA.A[0][1])} = ${fmtP(pLLS)}`}</TeX>
                </div>
              </Entra>
            )}
          </div>
        </div>
      )}

      {step >= 5 && (
        <Entra>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 26 }}>
            <span className="label natural">ESQUEMA · {DIAS} DÍAS SIMULADOS CON π Y A</span>
            <Boton onClick={() => setSemilla((v) => v + 1)}>otra simulación</Boton>
          </div>
          <TiraDias key={semilla} estados={tira} celda={25} altoEstado={90} marcasCada={10} />
          <div style={{ display: "flex", gap: 40, marginTop: 34, alignItems: "baseline" }}>
            {[0, 1].map((j) => (
              <span key={j} style={{ fontSize: 26, color: "var(--text-2)" }}>
                <span
                  style={{
                    display: "inline-block",
                    width: 22,
                    height: 22,
                    marginRight: 10,
                    verticalAlign: -3,
                    background: j === 0 ? "var(--data)" : "var(--panel)",
                    border: "2px solid var(--data)",
                  }}
                />
                {CLIMA.states[j]}
              </span>
            ))}
          </div>
          <div style={{ marginTop: 34, display: "grid", gridTemplateColumns: "1fr 520px", gap: 60, alignItems: "center" }}>
            {step === 5 ? (
              <p style={TXT}>Sesenta días generados con A: el clima forma rachas.</p>
            ) : (
              <Entra>
                <p className="takeaway" style={{ margin: 0 }}>
                  La diagonal dice cuánto dura cada clima: en promedio <em>{rachaMedia[0].toFixed(1)} días</em> lluviosos seguidos y{" "}
                  <em>{rachaMedia[1].toFixed(1)}</em> soleados.
                </p>
              </Entra>
            )}
            {step >= 6 && (
              <Entra style={{ fontSize: 30 }}>
                <TeX>{`\\text{días seguidos en } i = \\dfrac{1}{1 - a_{ii}}`}</TeX>
              </Entra>
            )}
          </div>
        </Entra>
      )}
    </SlideFrame>
  );
}

