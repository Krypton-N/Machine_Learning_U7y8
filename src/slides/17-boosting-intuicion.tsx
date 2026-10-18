import { AnimatePresence, motion } from "motion/react";
import { ArbolGlifo, FlujoSecuencial } from "../components/FlujoEnsamble";
import { BarraClases, pct } from "../components/Piezas";
import { Recap } from "../components/Recap";
import { Reveal } from "../components/Reveal";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { adultMuestra, stumpAdult } from "../lib/adult";

const S = stumpAdult;
const pIzq = S.izquierda.positivos / S.izquierda.n;
const pDer = S.derecha.positivos / S.derecha.n;
// Si en los dos lados gana el "no", el stump responde "no" siempre.
const siempreNo = pIzq < 0.5 && pDer < 0.5;

export default function BoostingIntuicion({ step }: SlideProps) {
  const caso = step >= 2;
  return (
    <SlideFrame
      section={["U7 · Ensambles", "D. Boosting"]}
      num={17}
      caso={caso ? "Adult" : null}
      title="Boosting: repasar lo que salió mal"
      lede={
        caso
          ? `El mejor árbol de una sola pregunta que se puede hacer con las ${adultMuestra.columnas.length} variables de Adult.`
          : "Como estudiar para un examen: no se repasa todo otra vez, sino lo que se falló. Cada modelo nuevo se concentra en los errores del anterior."
      }
    >
      <AnimatePresence mode="wait">
        {!caso ? (
          <motion.div key="concepto" style={{ display: "grid", gridTemplateColumns: "760px 1fr", gap: 90 }} exit={{ opacity: 0, transition: { duration: 0.2 } }}>
            <div>
              <span className="label">Esquema · un modelo tras otro</span>
              <div style={{ marginTop: 20 }}>
                <FlujoSecuencial />
              </div>
              <p style={{ fontSize: 26, color: "var(--text-2)", lineHeight: 1.45, margin: "20px 0 0" }}>
                En bagging los árboles no saben nada unos de otros. Aquí cada uno <b style={{ color: "var(--text)" }}>depende de los anteriores</b>.
              </p>
            </div>
            <Reveal step={step} at={1} style={{ paddingTop: 30 }}>
              <Recap title="modelo débil y stump">
                <p>
                  Un <b>modelo débil</b> acierta apenas un poco más que adivinar. El más usado es el <b>stump</b>: un árbol de una sola
                  pregunta.
                </p>
                <svg width={260} height={100} style={{ marginTop: 14 }}>
                  <ArbolGlifo x={130} y={14} niveles={1} ancho={180} color="var(--text)" />
                  <text x={40} y={66} textAnchor="middle" fontSize={20} fill="var(--text-2)">
                    sí
                  </text>
                  <text x={220} y={66} textAnchor="middle" fontSize={20} fill="var(--text-2)">
                    no
                  </text>
                </svg>
              </Recap>
              <p style={{ fontSize: 26, color: "var(--text-2)", lineHeight: 1.45, margin: "26px 0 0" }}>
                Boosting no usa árboles profundos: usa muchos modelos débiles y los va sumando.
              </p>
            </Reveal>
          </motion.div>
        ) : (
          <motion.div
            key="caso"
            style={{ display: "grid", gridTemplateColumns: "820px 1fr", gap: 80 }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div>
              <span className="label">La pregunta que mejor separa</span>
              <div style={{ fontSize: 46, fontWeight: 600, letterSpacing: "-0.02em", margin: "14px 0 30px" }}>
                ¿{S.nombre_es}: {S.categorias?.izquierda.join(", ")}?
                <span style={{ fontSize: 26, fontWeight: 400, color: "var(--text-3)", marginLeft: 16 }}>(¿es esposo?)</span>
              </div>
              <div style={{ display: "grid", gap: 26 }}>
                <div>
                  <div style={{ fontSize: 26, marginBottom: 8 }}>
                    Sí <span style={{ color: "var(--text-3)" }}>· {S.izquierda.n.toLocaleString("es-MX")} personas</span>
                  </div>
                  <BarraClases positivos={S.izquierda.positivos} total={S.izquierda.n} ancho={760} alto={26} />
                </div>
                <div>
                  <div style={{ fontSize: 26, marginBottom: 8 }}>
                    No <span style={{ color: "var(--text-3)" }}>· {S.derecha.n.toLocaleString("es-MX")} personas</span>
                  </div>
                  <BarraClases positivos={S.derecha.positivos} total={S.derecha.n} ancho={760} alto={26} />
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 26, paddingTop: 30 }}>
              <p style={{ fontSize: 26, lineHeight: 1.45, margin: 0 }}>
                Separa bien: {pct(pIzq)} contra {pct(pDer)} gana más de 50K.
              </p>
              <Reveal step={step} at={3}>
                <p style={{ fontSize: 26, lineHeight: 1.45, margin: 0, color: "var(--text-2)" }}>
                  {siempreNo ? (
                    <>
                      Pero en los dos lados sigue ganando el "no", así que este stump <b style={{ color: "var(--text)" }}>responde "no" a todos</b>.
                    </>
                  ) : (
                    <>Cada lado responde con su mayoría.</>
                  )}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30, margin: "30px 0" }}>
                  <div>
                    <div className="mono" style={{ fontSize: 44, color: "var(--red-2)" }}>
                      {pct(S.accuracy_cv)}
                    </div>
                    <div data-rotulo style={{ fontSize: 20, color: "var(--text-3)" }}>aciertos del stump</div>
                  </div>
                  <div>
                    <div className="mono" style={{ fontSize: 44 }}>{pct(S.accuracy_mayoritaria)}</div>
                    <div data-rotulo style={{ fontSize: 20, color: "var(--text-3)" }}>aciertos de decir siempre "no"</div>
                  </div>
                </div>
              </Reveal>
              {/* La conclusión va en su propio clic: con los dos números ya son más de 40 palabras. */}
              <Reveal step={step} at={4}>
                <p className="takeaway" style={{ margin: 0, fontSize: 27 }}>
                  Un stump solo casi no sirve. La pregunta es <em>cómo sumar muchos</em> para que sí sirvan.
                </p>
              </Reveal>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SlideFrame>
  );
}
