import { DiagramaClima } from "../components/DiagramaClima";
import { Entra } from "../components/Reveal";
import { RedTemporal, sub } from "../components/RedTemporal";
import { TablasLambda } from "../components/TablasLambda";
import { TeX } from "../components/TeX";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { CLIMA, CORTO, fmtP, OBS_EJEMPLO } from "../lib/clima";
import { probConjunta } from "../lib/hmm";

const TXT = { fontSize: 26, lineHeight: 1.45, margin: 0 } as const;
const N = CLIMA.states.length;
const M = CLIMA.symbols.length;
const LIBRES = N - 1 + N * (N - 1) + N * (M - 1);
// La historia que se evalúa: Soleado, Lluvioso, Lluvioso (en la 56 resulta la más alta; en la 59, la de Viterbi).
const Q = [1, 0, 0];
const conj = probConjunta(CLIMA, Q, OBS_EJEMPLO);

// Un clic, una idea: 0 las tres tablas · 1 con números · 2 el diagrama · 3–4 un supuesto por clic · 5–6 la conjunta.
export default function Lambda({ step }: SlideProps) {
  const caso = step >= 1;
  const redSupuesto = (resaltar: "markov" | "emision") => (
    <RedTemporal
      T={4}
      variante="hmm"
      ancho={1000}
      alto={420}
      rotuloOculto={(t) => `q${sub(t)}`}
      rotuloVisto={(t) => `o${sub(t)}`}
      rotulosFila={["clima", "actividad"]}
      resaltar={resaltar}
      prohibidas
    />
  );
  return (
    <SlideFrame
      section={["U8 · Datos secuenciales", "H. HMM"]}
      num={54}
      caso={caso ? "Clima" : null}
      title={
        <>
          Un HMM completo: <span className="accent">λ = (π, A, B)</span>
        </>
      }
    >
      {step <= 1 && (
        <div style={{ display: "grid", gap: 50 }}>
          <TablasLambda modelo={CLIMA} cuales={["pi", "A", "B"]} simbolica={step === 0} sumas={step === 1} tam={24} separacion={56} />
          {step === 0 ? (
            <Entra style={{ display: "flex", gap: 60, alignItems: "baseline" }}>
              <div style={{ fontSize: 34 }}>
                <TeX>{"\\lambda = (\\pi, A, B)"}</TeX>
              </div>
              <p style={TXT}>Tres tablas definen todo el modelo.</p>
            </Entra>
          ) : (
            <Entra>
              <p style={TXT}>
                En el ejemplo, todo el modelo son <b>{LIBRES} números libres</b>: los demás salen de que cada renglón sume 1.
              </p>
            </Entra>
          )}
        </div>
      )}

      {step === 2 && (
        <Entra style={{ display: "grid", gridTemplateColumns: "1240px 1fr", gap: 50 }}>
          <DiagramaClima modelo={CLIMA} mostrar={{ pi: true, A: true, B: true }} ancho={1240} alto={700} />
          <p style={{ ...TXT, paddingTop: 260 }}>El mismo λ como diagrama: cómo empieza, cómo cambia y qué produce.</p>
        </Entra>
      )}

      {(step === 3 || step === 4) && (
        <div style={{ display: "grid", gridTemplateColumns: "1000px 1fr", gap: 70 }}>
          <div key={step}>{redSupuesto(step === 3 ? "markov" : "emision")}</div>
          <Entra key={`t${step}`} style={{ display: "grid", gap: 30, alignContent: "start", paddingTop: 20 }}>
            <span className="label">Supuesto {step === 3 ? 1 : 2}</span>
            <p style={TXT}>
              {step === 3 ? (
                <>El clima de mañana depende <b>solo</b> del de hoy.</>
              ) : (
                <>Lo que hace hoy depende <b>solo</b> del clima de hoy.</>
              )}
            </p>
            <div style={{ fontSize: 30 }}>
              <TeX>{step === 3 ? "P(q_t \\mid \\text{todo lo anterior}) = P(q_t \\mid q_{t-1})" : "P(o_t \\mid \\text{todo lo demás}) = P(o_t \\mid q_t)"}</TeX>
            </div>
            <p style={{ ...TXT, color: "var(--text-2)" }}>La flecha tachada no existe en el modelo.</p>
          </Entra>
        </div>
      )}

      {step >= 5 && (
        <Entra style={{ display: "grid", gap: 44 }}>
          <p style={TXT}>Con λ y los dos supuestos, la probabilidad de una historia es una multiplicación:</p>
          <div style={{ fontSize: 38 }}>
            <TeX>{"P(O, Q \\mid \\lambda) = \\pi_{q_1}\\, b_{q_1}(o_1) \\prod_{t=2}^{T} a_{q_{t-1} q_t}\\, b_{q_t}(o_t)"}</TeX>
          </div>
          {step >= 6 && (
            <Entra>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr) 360px", gap: 0, marginTop: 6 }}>
                {Q.map((j, t) => (
                  <div key={t} style={{ borderTop: "1px solid var(--line-2)", padding: "16px 20px 0 0" }}>
                    <div className="mono" style={{ fontSize: 22, color: "var(--text-3)" }}>
                      día {t + 1} · {CLIMA.states[j]} · {CLIMA.symbols[OBS_EJEMPLO[t]]}
                    </div>
                    <div className="mono" style={{ fontSize: 26, marginTop: 10 }}>
                      {t === 0 ? "π" : "a"}
                      <sub style={{ fontSize: "0.8em" }}>{t === 0 ? CORTO[j] : CORTO[Q[t - 1]] + CORTO[j]}</sub>·b<sub style={{ fontSize: "0.8em" }}>{CORTO[j]}</sub> = {fmtP(t === 0 ? CLIMA.pi[j] : CLIMA.A[Q[t - 1]][j])}·{fmtP(CLIMA.B[j][OBS_EJEMPLO[t]])} ={" "}
                      <b>{fmtP(conj.factores[t])}</b>
                    </div>
                  </div>
                ))}
                <div style={{ borderTop: "1px solid var(--red)", padding: "16px 0 0" }}>
                  <div className="mono" style={{ fontSize: 22, color: "var(--text-3)" }}>
                    producto
                  </div>
                  <div className="mono" style={{ fontSize: 34, marginTop: 6, color: "var(--red-2)" }}>
                    {fmtP(conj.conjunta)}
                  </div>
                </div>
              </div>
              <p className="takeaway" style={{ margin: "40px 0 0" }}>
                La historia Soleado → Lluvioso → Lluvioso vale <em>{fmtP(conj.conjunta)}</em>. Todavía no sabemos si es la mejor.
              </p>
            </Entra>
          )}
        </Entra>
      )}
    </SlideFrame>
  );
}
