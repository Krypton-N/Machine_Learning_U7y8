import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { Lineas } from "../components/Lineas";
import { Boton, pct } from "../components/Piezas";
import { Recap } from "../components/Recap";
import { RejillaRaices } from "../components/RejillaRaices";
import { Reveal } from "../components/Reveal";
import { TeX } from "../components/TeX";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { ejeQueCubre } from "../lib/scale";
import { adultMuestra, NOMBRE_ES, raices, rfHiper, varianzaEnsamble } from "../lib/adult";
import { mulberry32 } from "../lib/rng";

const VARIABLES = adultMuestra.columnas.map((c) => c.nombre_es);
const M = raices.max_features_rf; // variables sorteadas por corte en RandomForestClassifier
const P = raices.variables;

// Concepto: en cada corte se sortean M de las P variables y el árbol solo puede elegir entre esas.
function Sorteo({ corte }: { corte: number }) {
  const elegidas = useMemo(() => {
    const r = mulberry32(50 + corte);
    const s = new Set<number>();
    while (s.size < M) s.add(Math.floor(r() * P));
    return s;
  }, [corte]);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, width: 700 }}>
      {VARIABLES.map((v, i) => {
        const on = elegidas.has(i);
        return (
          <motion.div
            key={v}
            initial={false}
            animate={{ opacity: on ? 1 : 0.32, borderColor: on ? "#e5383b" : "#3a3a41", backgroundColor: on ? "rgba(229,56,59,0.14)" : "rgba(0,0,0,0)" }}
            transition={{ duration: 0.35 }}
            style={{ border: "1px solid", padding: "10px 18px", fontSize: 22 }}
          >
            {v}
          </motion.div>
        );
      })}
    </div>
  );
}

const B = varianzaEnsamble.bagging;
const R = varianzaEnsamble.random_forest;
const ult = B.accuracy.length - 1;
const FILAS = [
  { rotulo: "parecido entre dos árboles (ρ)", bag: B.rho.toFixed(3), rf: R.rho.toFixed(3), mejor: R.rho < B.rho },
  { rotulo: "aciertos de un árbol solo", bag: pct(B.accuracy[0]), rf: pct(R.accuracy[0]), mejor: R.accuracy[0] > B.accuracy[0] },
  { rotulo: `aciertos del bosque (${varianzaEnsamble.B} árboles)`, bag: pct(B.accuracy[ult], 2), rf: pct(R.accuracy[ult], 2), mejor: R.accuracy[ult] > B.accuracy[ult] },
];

const curva = rfHiper.max_features.map((d): [number, number] => [d.valor, d.acc]);
const mejor = rfHiper.max_features.reduce((a, b) => (b.acc > a.acc ? b : a));
const desvTipica = rfHiper.max_features.reduce((s, d) => s + d.acc_desv, 0) / rfHiper.max_features.length;
const EJE = ejeQueCubre(curva.map((c) => c[1]), 0.002);

export default function RandomForest({ step }: SlideProps) {
  const [corte, setCorte] = useState(1);
  const caso = step >= 2;
  return (
    <SlideFrame
      section={["U7 · Ensambles", "C. Random Forest"]}
      num={14}
      caso={caso ? "Adult" : null}
      title="Random Forest: sortear las variables"
      lede={
        caso
          ? "Los mismos 100 cuadros de la diapositiva anterior, ahora con Random Forest: cada pregunta se elige entre 3 variables sorteadas."
          : "Random Forest es bagging con un cambio: en cada pregunta, el árbol solo puede elegir entre unas cuantas variables sorteadas al azar."
      }
    >
      <AnimatePresence mode="wait">
        {!caso ? (
          <motion.div key="concepto" style={{ display: "grid", gridTemplateColumns: "700px 1fr", gap: 90 }} exit={{ opacity: 0, transition: { duration: 0.2 } }}>
            <div>
              <span className="label">
                Esquema · las {P} variables de Adult; en este corte solo se pueden usar {M}
              </span>
              <div style={{ marginTop: 16 }}>
                <Sorteo corte={corte} />
              </div>
              <div style={{ marginTop: 18 }}>
                <Boton onClick={() => setCorte((c) => c + 1)}>siguiente pregunta: sortear otra vez</Boton>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 28, paddingTop: 30 }}>
              <p style={{ fontSize: 26, lineHeight: 1.45, margin: 0 }}>
                El árbol elige el mejor corte <b style={{ color: "var(--red-2)" }}>solo entre las sorteadas</b>. En la siguiente pregunta se
                sortea de nuevo.
              </p>
              <p style={{ fontSize: 24, color: "var(--text-2)", lineHeight: 1.45, margin: 0 }}>
                Así, la variable más fuerte queda fuera de muchas preguntas y otras variables tienen su oportunidad: los árboles salen
                distintos.
              </p>
              <Reveal step={step} at={1}>
                <Recap title="cuántas sortear">
                  <p>
                    Breiman sugiere <TeX>{"\\sqrt{p}"}</TeX> en clasificación y <TeX>{"p/3"}</TeX> en regresión. En sklearn el clasificador
                    usa <TeX>{"\\sqrt{p}"}</TeX> (aquí, {M} de {P}); el regresor usa todas por omisión.
                  </p>
                </Recap>
              </Reveal>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="caso"
            style={{ display: "grid", gridTemplateColumns: "820px 1fr", gap: 70 }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div>
              <span className="label">La primera pregunta de 100 árboles de Random Forest</span>
              <div style={{ marginTop: 16 }}>
                <RejillaRaices porArbol={raices.random_forest.por_arbol} nombres={NOMBRE_ES} lado={36} />
              </div>
              <Reveal step={step} at={4} style={{ marginTop: 22 }}>
                <p className="takeaway" style={{ margin: 0, fontSize: 26 }}>
                  Cada árbol es un poco peor, pero <em>se parecen menos</em> y juntos aciertan más. En Adult la ganancia es pequeña.
                </p>
              </Reveal>
            </div>
            <Reveal step={step} at={3}>
              <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 22 }}>
                <thead>
                  <tr className="mono" style={{ color: "var(--text-3)", fontSize: 15, textAlign: "right" }}>
                    <th style={{ textAlign: "left", padding: "0 0 10px", fontWeight: 400 }} />
                    <th style={{ padding: "0 0 10px", fontWeight: 400 }}>BAGGING</th>
                    <th style={{ padding: "0 0 10px 24px", fontWeight: 400 }}>RANDOM FOREST</th>
                  </tr>
                </thead>
                <tbody>
                  {FILAS.map((f) => (
                    <tr key={f.rotulo} style={{ borderTop: "1px solid var(--line)" }}>
                      <td style={{ padding: "12px 0", color: "var(--text-2)" }}>{f.rotulo}</td>
                      <td className="mono" style={{ textAlign: "right", fontSize: 26 }}>
                        {f.bag}
                      </td>
                      <td className="mono" style={{ textAlign: "right", fontSize: 26, color: f.mejor ? "var(--red-2)" : "var(--text)" }}>
                        {f.rf}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="label" style={{ margin: "26px 0 8px" }}>
                Aciertos según cuántas variables se sortean · CV de 5 pliegues
              </div>
              <Lineas
                ancho={720}
                alto={250}
                x={[1, P]}
                y={[EJE.dominio[0] - 0.001, EJE.dominio[1] + 0.001]}
                ticksX={[1, M, 6, 8, 10, P]}
                ticksY={EJE.ticks}
                fmtY={(v) => `${(v * 100).toFixed(1)}%`}
                margen={{ l: 66, r: 22, t: 12, b: 44 }}
                series={[{ id: "mf", pts: curva, color: "var(--red)", grosor: 3, puntos: true }]}
                marcas={[
                  { x: M, y: curva[M - 1][1], texto: "sklearn" },
                  { x: P, y: curva[P - 1][1], texto: "= bagging" },
                ]}
              />
              <p style={{ fontSize: 19, color: "var(--text-3)", margin: "6px 0 0", lineHeight: 1.4 }}>
                El máximo está en {mejor.valor} ({pct(mejor.acc, 2)}), pero las diferencias son del tamaño de la variación entre pliegues (±
                {(desvTipica * 100).toFixed(2)} puntos).
              </p>
            </Reveal>
          </motion.div>
        )}
      </AnimatePresence>
    </SlideFrame>
  );
}
