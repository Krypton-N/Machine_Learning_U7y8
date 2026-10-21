import { motion } from "motion/react";
import { Recap } from "../components/Recap";
import { Entra } from "../components/Reveal";
import { TeX } from "../components/TeX";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";

const PREGUNTAS = [
  {
    n: "01",
    nombre: "Evaluación",
    pregunta: "Dado λ y lo que vimos, ¿qué tan probable es lo que vimos?",
    formula: "P(O \\mid \\lambda)",
    algoritmo: "Forward",
    caso: "¿Qué tan probable es caminar, comprar, limpiar?",
    donde: "51–52",
  },
  {
    n: "02",
    nombre: "Decodificación",
    pregunta: "Dado λ y lo que vimos, ¿qué estados hubo?",
    formula: "Q^* = \\arg\\max_Q P(Q \\mid O, \\lambda)",
    algoritmo: "Viterbi",
    caso: "¿Qué clima hubo esos tres días?",
    donde: "53",
  },
  {
    n: "03",
    nombre: "Aprendizaje",
    pregunta: "Con solo lo que vimos, ¿cuál es λ?",
    formula: "\\lambda^* = \\arg\\max_\\lambda P(O \\mid \\lambda)",
    algoritmo: "Baum-Welch",
    caso: "¿Cómo sacamos π, A y B de meses de relatos?",
    donde: "54",
  },
];

// Una lista de tres renglones, no tres columnas: el renglón nuevo entra completo y los anteriores se reducen a una
// línea. 0–2 un problema por clic · 3 las tres preguntas en el caso · 4 dónde se resuelve cada una.
export default function TresPreguntas({ step }: SlideProps) {
  const caso = step >= 3;
  return (
    <SlideFrame section={["U8 · Datos secuenciales", "H. HMM"]} num={55} caso={caso ? "Clima" : null} title="Tres preguntas que se le hacen a un HMM">
      <div style={{ display: "grid", gridTemplateColumns: step === 0 ? "1fr 560px" : "1fr", gap: 70 }}>
        <div style={{ display: "grid", gap: 0 }}>
          {PREGUNTAS.map((p, i) => {
            if (!caso && i > step) return null;
            const abierto = !caso && i === step;
            return (
              <motion.div
                key={p.n}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "70px 300px 1fr 220px",
                  alignItems: "baseline",
                  gap: 24,
                  borderTop: `1px solid ${abierto ? "var(--red)" : "var(--line-2)"}`,
                  padding: abierto ? "26px 0 34px" : "20px 0",
                }}
              >
                <span className="mono" style={{ fontSize: 26, color: "var(--red-2)" }}>
                  {p.n}
                </span>
                <span style={{ fontSize: abierto ? 40 : 32, fontWeight: 600, letterSpacing: "-0.01em" }}>{p.nombre}</span>
                <div>
                  {abierto && (
                    <Entra style={{ display: "grid", gap: 18 }}>
                      <p style={{ fontSize: 26, lineHeight: 1.4, margin: 0 }}>{p.pregunta}</p>
                      <div style={{ fontSize: 32 }}>
                        <TeX>{p.formula}</TeX>
                      </div>
                    </Entra>
                  )}
                  {caso && (
                    <Entra>
                      <p style={{ fontSize: 26, lineHeight: 1.4, margin: 0, color: "var(--text-2)" }}>{p.caso}</p>
                    </Entra>
                  )}
                </div>
                <span className="mono" style={{ fontSize: 26, color: abierto ? "var(--text)" : "var(--text-2)", textAlign: "right" }}>
                  → {p.algoritmo}
                  {step >= 4 && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "block", fontSize: 22, color: "var(--text-3)", marginTop: 6 }}>
                      diap. {p.donde}
                    </motion.span>
                  )}
                </span>
              </motion.div>
            );
          })}
        </div>
        {step === 0 && (
          <Entra>
            <Recap title="verosimilitud">
              <p>P(O | λ) leída como función de λ: qué tan bien explica λ lo que vimos. Se llama verosimilitud.</p>
            </Recap>
          </Entra>
        )}
      </div>
      {step >= 4 && (
        <Entra style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>
          <p className="takeaway" style={{ margin: 0 }}>
            Las dos primeras, <em>a mano</em>; la tercera, con datos reales.
          </p>
        </Entra>
      )}
    </SlideFrame>
  );
}
