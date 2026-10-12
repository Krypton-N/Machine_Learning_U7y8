import { AnimatePresence, motion } from "motion/react";
import { Fragment } from "react";
import { Recap } from "../components/Recap";
import { Reveal } from "../components/Reveal";
import { TeX } from "../components/TeX";
import { TreeDiagram, type NodoDiagrama } from "../components/TreeDiagram";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { xgbRegularizacion } from "../lib/adult";

// ---------- Concepto: un árbol de 3 hojas y lo que "paga" por su complejidad ----------
const W = [0.8, -0.5, 0.2]; // valores de hoja del esquema
const GAMMA = 1;
const LAMBDA = 1;
const signo = (v: number) => String(v).replace("-", "−");
const esquema: NodoDiagrama = {
  texto: "¿pregunta 1?",
  hijos: [
    {
      texto: "¿pregunta 2?",
      hijos: [
        { texto: `w = ${signo(W[0])}`, detalle: "hoja 1" },
        { texto: `w = ${signo(W[1])}`, detalle: "hoja 2" },
      ],
    },
    { texto: `w = ${signo(W[2])}`, detalle: "hoja 3" },
  ],
};
const pagoHojas = GAMMA * W.length;
const pagoValores = 0.5 * LAMBDA * W.reduce((s, w) => s + w * w, 0);

// ---------- Caso: XGBoost en Adult con distintos λ y γ ----------
const LAMBDAS = [...new Set(xgbRegularizacion.map((d) => d.lambda))];
const GAMMAS = [...new Set(xgbRegularizacion.map((d) => d.gamma))];
const celda = (l: number, g: number) => xgbRegularizacion.find((d) => d.lambda === l && d.gamma === g)!;
const mejor = xgbRegularizacion.reduce((a, b) => (b.logloss_validacion < a.logloss_validacion ? b : a));
const libre = celda(0, 0);
const maxHojas = Math.max(...xgbRegularizacion.map((d) => d.hojas));

export default function XgboostRegularizacion({ step }: SlideProps) {
  const caso = step >= 2;
  return (
    <SlideFrame
      section={["U7 · Ensambles", "D. Boosting"]}
      num={23}
      caso={caso ? "Adult" : null}
      title="XGBoost: un objetivo que cobra por la complejidad"
      lede={
        caso
          ? "XGBoost con 300 árboles, variando los dos cobros. En cada celda: cuántas hojas tiene el modelo y qué tan lejos queda la validación del entrenamiento."
          : "XGBoost es Gradient Boosting con una diferencia en la fórmula: además de equivocarse poco, el modelo tiene que ser simple."
      }
    >
      <AnimatePresence mode="wait">
        {!caso ? (
          <motion.div key="concepto" style={{ display: "grid", gridTemplateColumns: "1fr 760px", gap: 80 }} exit={{ opacity: 0, transition: { duration: 0.2 } }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              <Recap title="regularizar">
                <p>
                  Cobrarle un "impuesto" al modelo por ser complejo, para que no memorice. Dos impuestos comunes: L1 suma{" "}
                  <TeX>{"|w|"}</TeX> y L2 suma <TeX>{"w^2"}</TeX>.
                </p>
              </Recap>
              <div>
                <div className="label" style={{ marginBottom: 14 }}>
                  Lo que XGBoost minimiza
                </div>
                <div style={{ fontSize: 30 }}>
                  <TeX>{"\\text{Obj} = \\sum_i L(y_i, \\hat y_i) + \\sum_{\\text{árboles}} \\Big[ {\\color{#e5383b}\\gamma\\,T} + {\\color{#e5383b}\\tfrac12 \\lambda \\textstyle\\sum_j w_j^2} \\Big]"}</TeX>
                </div>
              </div>
              <div style={{ fontSize: 23, color: "var(--text-2)", lineHeight: 1.5 }}>
                <p style={{ margin: "0 0 10px" }}>
                  <TeX>T</TeX> = cuántas hojas tiene el árbol. <TeX>{"\\gamma"}</TeX> cobra <b style={{ color: "var(--text)" }}>por cada hoja</b>.
                </p>
                <p style={{ margin: 0 }}>
                  <TeX>{"w_j"}</TeX> = el valor que suma cada hoja. <TeX>{"\\lambda"}</TeX> cobra <b style={{ color: "var(--text)" }}>por valores grandes</b>.
                </p>
              </div>
            </div>
            <Reveal step={step} at={1}>
              <span className="label">Esquema · un árbol de 3 hojas</span>
              <div style={{ marginTop: 16 }}>
                <TreeDiagram raiz={esquema} ancho={760} />
              </div>
              <div className="mono" style={{ fontSize: 21, lineHeight: 1.7, marginTop: 20, color: "var(--text-2)" }}>
                <div>
                  γ·T = {GAMMA} · {W.length} = <span style={{ color: "var(--text)" }}>{pagoHojas.toFixed(3)}</span>
                </div>
                <div>
                  ½·λ·Σw² = ½ · {LAMBDA} · ({W.map((w) => (w < 0 ? `(−${-w})²` : `${w}²`)).join(" + ")}) ={" "}
                  <span style={{ color: "var(--text)" }}>{pagoValores.toFixed(3)}</span>
                </div>
                <div style={{ color: "var(--red-2)" }}>este árbol paga {(pagoHojas + pagoValores).toFixed(3)}</div>
              </div>
            </Reveal>
          </motion.div>
        ) : (
          <motion.div
            key="caso"
            style={{ display: "grid", gridTemplateColumns: "1060px 1fr", gap: 60 }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div>
              <div style={{ display: "grid", gridTemplateColumns: `150px repeat(${GAMMAS.length}, 1fr)`, gap: 8 }}>
                <span />
                {GAMMAS.map((g) => (
                  <span key={g} className="label natural" style={{ textAlign: "center", fontSize: 19 }}>
                    γ = {g} {g === 0 ? "· hojas gratis" : ""}
                  </span>
                ))}
                {LAMBDAS.map((l) => (
                  <Fragment key={l}>
                    <span className="label natural" style={{ alignSelf: "center", fontSize: 19 }}>
                      λ = {l}
                    </span>
                    {GAMMAS.map((g) => {
                      const d = celda(l, g);
                      const brecha = d.logloss_validacion - d.logloss_entrenamiento;
                      const es = d === mejor;
                      return (
                        <div key={`${l}-${g}`} style={{ border: `1px solid ${es ? "var(--red)" : "var(--line-2)"}`, background: es ? "var(--red-dim)" : "var(--panel)", padding: "12px 16px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                            <span className="mono" style={{ fontSize: 24 }}>
                              {d.hojas.toLocaleString("es-MX")}
                            </span>
                            <span style={{ fontSize: 16, color: "var(--text-3)" }}>hojas</span>
                          </div>
                          <div style={{ height: 6, background: "var(--line)", margin: "6px 0 10px" }}>
                            <div style={{ height: 6, width: `${(d.hojas / maxHojas) * 100}%`, background: "var(--data-dim)" }} />
                          </div>
                          <div className="mono" style={{ fontSize: 17, color: "var(--text-2)" }}>
                            brecha {brecha.toFixed(3)} · validación <span style={{ color: es ? "var(--red-2)" : "var(--text)" }}>{d.logloss_validacion.toFixed(4)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </Fragment>
                ))}
              </div>
              <div className="label" style={{ marginTop: 14, fontSize: 14 }}>
                brecha = log-loss de validación − log-loss de entrenamiento · marco rojo = mejor validación
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 22, fontSize: 23, color: "var(--text-2)", lineHeight: 1.45 }}>
              <p style={{ margin: 0 }}>
                Sin cobros: <b style={{ color: "var(--text)" }}>{libre.hojas.toLocaleString("es-MX")} hojas</b> y una brecha de{" "}
                {(libre.logloss_validacion - libre.logloss_entrenamiento).toFixed(3)}: el modelo memoriza.
              </p>
              <p style={{ margin: 0 }}>Al subir γ desaparecen hojas. Al subir λ los valores se encogen. En los dos casos la brecha se cierra.</p>
              <p style={{ margin: 0 }}>
                Pero cobrar de más también cuesta: con λ = 100 y γ = 5 la validación empeora.
              </p>
              <Reveal step={step} at={3} style={{ marginTop: "auto" }}>
                <p className="takeaway" style={{ margin: 0, fontSize: 25 }}>
                  El freno viene <em>dentro de la fórmula</em>. Un poco ayuda a generalizar; demasiado deja un modelo que ya no aprende.
                </p>
              </Reveal>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SlideFrame>
  );
}
