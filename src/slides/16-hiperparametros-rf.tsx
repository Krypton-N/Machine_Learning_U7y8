import { AnimatePresence, motion } from "motion/react";
import { Lineas } from "../components/Lineas";
import { pct } from "../components/Piezas";
import { Reveal } from "../components/Reveal";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { oobVsCv, raices, rfHiper } from "../lib/adult";
import { ejeQueCubre } from "../lib/scale";

const PERILLAS = [
  ["n_estimators", "Cuántos árboles", "Agregar árboles no sobreajusta: solo cuesta más tiempo. Se agregan hasta que deja de mejorar."],
  ["max_features", "Cuántas variables se sortean", "Pocas: árboles muy distintos pero débiles. Muchas: árboles fuertes pero parecidos."],
  ["min_samples_leaf", "Tamaño mínimo de una hoja", "Hojas de una sola persona memorizan. Hojas más grandes suavizan la respuesta."],
  ["max_samples", "Tamaño de cada muestra", "Muestras más chicas dan árboles más distintos y más rápidos."],
] as const;

const fmt = (v: number) => `${(v * 100).toFixed(1)}%`;
const margen = { l: 66, r: 20, t: 14, b: 44 };

const arboles = oobVsCv.B.map((b, i): [number, number] => [b, oobVsCv.random_forest.cv_media[i]]);
const variables = rfHiper.max_features.map((d): [number, number] => [d.valor, d.acc]);
// El tamaño de hoja crece de 1 a 100: se dibuja en posiciones parejas (1, 2, 5, 10, …) para que se lea.
const hojas = rfHiper.min_samples_leaf.map((d, i): [number, number] => [i, d.acc]);
const mejorHoja = rfHiper.min_samples_leaf.reduce((a, b) => (b.acc > a.acc ? b : a));
const hoja1 = rfHiper.min_samples_leaf[0];
// Una sola escala para las tres gráficas, la que cubre todos sus puntos: así se ve cuál perilla mueve más.
const EJE = ejeQueCubre([...arboles, ...variables, ...hojas].map((p) => p[1]), 0.005);
const Y: [number, number] = [EJE.dominio[0] - 0.001, EJE.dominio[1] + 0.001];
const TICKS_Y = EJE.ticks;
const anchoCurva = (pts: [number, number][]) => ((Math.max(...pts.map((p) => p[1])) - Math.min(...pts.map((p) => p[1]))) * 100).toFixed(2);

export default function HiperparametrosRF({ step }: SlideProps) {
  const caso = step >= 1;
  return (
    <SlideFrame
      section={["U7 · Ensambles", "C. Random Forest"]}
      num={16}
      caso={caso ? "Adult" : null}
      title="Las perillas de Random Forest"
      lede={
        caso
          ? "Aciertos en validación cruzada de 5 pliegues al mover una perilla a la vez. Las tres gráficas usan la misma escala."
          : "Un hiperparámetro es una decisión que tomamos antes de entrenar. Random Forest tiene pocas que de verdad importen."
      }
    >
      <AnimatePresence mode="wait">
        {!caso ? (
          <motion.div key="concepto" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "38px 80px", paddingTop: 16 }} exit={{ opacity: 0, transition: { duration: 0.2 } }}>
            {PERILLAS.map(([codigo, nombre, texto], i) => (
              <motion.div
                key={codigo}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12 }}
                style={{ borderTop: "1px solid var(--line-2)", paddingTop: 20 }}
              >
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.01em" }}>{nombre}</span>
                  <span className="mono" style={{ fontSize: 17, color: "var(--red-2)" }}>
                    {codigo}
                  </span>
                </div>
                <div style={{ fontSize: 24, color: "var(--text-2)", lineHeight: 1.45, marginTop: 10 }}>{texto}</div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div key="caso" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 540px)", justifyContent: "space-between" }}>
              <div>
                <span className="label">Cuántos árboles</span>
                <Lineas ancho={540} alto={360} x={[0, 300]} y={Y} ticksX={[10, 100, 200, 300]} ticksY={TICKS_Y} fmtY={fmt} margen={margen} series={[{ id: "n", pts: arboles, color: "var(--red)", grosor: 3, puntos: true }]} />
                <div style={{ fontSize: 21, color: "var(--text-2)", lineHeight: 1.4 }}>Sube rápido y se aplana. No baja.</div>
              </div>
              <div>
                <span className="label">Cuántas variables se sortean</span>
                <Lineas
                  ancho={540}
                  alto={360}
                  x={[1, raices.variables]}
                  y={Y}
                  ticksX={[1, raices.max_features_rf, 6, 8, 10, raices.variables]}
                  ticksY={TICKS_Y}
                  fmtY={fmt}
                  margen={margen}
                  series={[{ id: "m", pts: variables, color: "var(--red)", grosor: 3, puntos: true }]}
                />
                <div style={{ fontSize: 21, color: "var(--text-2)", lineHeight: 1.4 }}>Casi plana: toda la curva cabe en {anchoCurva(variables)} puntos.</div>
              </div>
              <div>
                <span className="label">Tamaño mínimo de hoja</span>
                <Lineas
                  ancho={540}
                  alto={360}
                  x={[0, hojas.length - 1]}
                  y={Y}
                  ticksX={rfHiper.min_samples_leaf.map((d, i) => ({ v: i, texto: String(d.valor) }))}
                  ticksY={TICKS_Y}
                  fmtY={fmt}
                  margen={margen}
                  series={[{ id: "h", pts: hojas, color: "var(--red)", grosor: 3, puntos: true }]}
                  marcas={[{ x: rfHiper.min_samples_leaf.indexOf(mejorHoja), y: mejorHoja.acc, texto: pct(mejorHoja.acc, 2) }]}
                />
                <div style={{ fontSize: 21, color: "var(--text-2)", lineHeight: 1.4 }}>
                  La que más mueve: de {pct(hoja1.acc, 2)} con hojas de 1 a {pct(mejorHoja.acc, 2)} con hojas de {mejorHoja.valor}.
                </div>
              </div>
            </div>
            <Reveal step={step} at={2} style={{ marginTop: 30 }}>
              <p className="takeaway" style={{ margin: 0 }}>
                Si se ajusta una sola cosa, que sea esta: <em>no dejar hojas de una sola persona</em>. Con hojas de 1, el bosque que viene por
                omisión memoriza.
              </p>
            </Reveal>
          </motion.div>
        )}
      </AnimatePresence>
    </SlideFrame>
  );
}
