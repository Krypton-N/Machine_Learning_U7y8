import { AnimatePresence, motion } from "motion/react";
import { ArbolGlifo } from "../components/FlujoEnsamble";
import { BarraClases, Def } from "../components/Piezas";
import { RejillaRaices } from "../components/RejillaRaices";
import { Reveal } from "../components/Reveal";
import { TeX } from "../components/TeX";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { NOMBRE_ES, raices, stumpAdult, varianzaEnsamble } from "../lib/adult";

// Concepto: tres árboles que empiezan con la misma pregunta.
function TresIguales() {
  return (
    <svg width={760} height={250}>
      {[0, 1, 2].map((i) => {
        const x = 130 + i * 250;
        return (
          <motion.g key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.2 }}>
            <rect x={x - 100} y={10} width={200} height={54} fill="var(--red-dim)" stroke="var(--red)" />
            <text x={x} y={44} textAnchor="middle" fontSize={21} fill="var(--text)">
              ¿la variable fuerte?
            </text>
            <ArbolGlifo x={x} y={90} niveles={3} ancho={150} />
            <text x={x} y={200} textAnchor="middle" className="mono" fontSize={16} fill="var(--text-3)">
              árbol {i + 1}
            </text>
          </motion.g>
        );
      })}
    </svg>
  );
}

const B = raices.bagging;
const dominante = Object.entries(B.raiz).sort((a, b) => b[1] - a[1])[0];
const S = stumpAdult;

export default function BaggingNoBasta({ step }: SlideProps) {
  const caso = step >= 1;
  return (
    <SlideFrame
      section={["U7 · Ensambles", "C. Random Forest"]}
      num={13}
      caso={caso ? "Adult" : null}
      title="Por qué el bagging no basta"
      lede={
        caso
          ? "100 árboles de bagging sobre Adult completo, cada uno con su propia muestra. Cada cuadro es un árbol, pintado según la variable de su primera pregunta."
          : "Promediar funciona mientras los árboles no se parezcan demasiado. Y los árboles de bagging se parecen más de lo que uno quisiera."
      }
    >
      <AnimatePresence mode="wait">
        {!caso ? (
          <motion.div key="concepto" style={{ display: "grid", gridTemplateColumns: "780px 1fr", gap: 90 }} exit={{ opacity: 0, transition: { duration: 0.2 } }}>
            <div>
              <span className="label">Esquema · tres árboles con muestras distintas</span>
              <div style={{ marginTop: 26 }}>
                <TresIguales />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 30, paddingTop: 30 }}>
              <Def termino="Una variable muy fuerte">
                Si una variable separa mucho mejor que las demás, casi todos los árboles la eligen para su primera pregunta, sin importar qué
                muestra les tocó.
              </Def>
              <Def termino="Consejeros que leen el mismo periódico">
                Opinan parecido y se equivocan en lo mismo. Es el piso <TeX>{"\\rho\\,\\sigma^2"}</TeX> de la diapositiva 8: lo que no baja
                aunque se agreguen árboles.
              </Def>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="caso"
            style={{ display: "grid", gridTemplateColumns: "900px 1fr", gap: 70 }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div>
              <span className="label">La primera pregunta de cada uno de los 100 árboles</span>
              <div style={{ marginTop: 16 }}>
                <RejillaRaices porArbol={B.por_arbol} nombres={NOMBRE_ES} />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <p className="takeaway" style={{ margin: 0 }}>
                <em>{dominante[1]} de 100</em> empiezan con la misma variable: {NOMBRE_ES[dominante[0]]}.
              </p>
              <Reveal step={step} at={2}>
                <div className="label" style={{ marginBottom: 12 }}>
                  Y la pregunta es la misma: ¿es {S.categorias?.izquierda.join(", ")}? (esposo)
                </div>
                <div style={{ display: "grid", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 21, color: "var(--text-2)", marginBottom: 6 }}>sí · {S.izquierda.n.toLocaleString("es-MX")} personas</div>
                    <BarraClases positivos={S.izquierda.positivos} total={S.izquierda.n} ancho={520} />
                  </div>
                  <div>
                    <div style={{ fontSize: 21, color: "var(--text-2)", marginBottom: 6 }}>no · {S.derecha.n.toLocaleString("es-MX")} personas</div>
                    <BarraClases positivos={S.derecha.positivos} total={S.derecha.n} ancho={520} />
                  </div>
                </div>
              </Reveal>
              <Reveal step={step} at={3} style={{ marginTop: "auto" }}>
                <p style={{ fontSize: 24, color: "var(--text-2)", lineHeight: 1.45, margin: 0 }}>
                  Con la misma raíz, los árboles se parecen: su correlación es <b style={{ color: "var(--text)" }}>ρ = {varianzaEnsamble.bagging.rho.toFixed(3)}</b>.
                  Para bajarla hay que obligarlos a empezar distinto.
                </p>
              </Reveal>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SlideFrame>
  );
}
