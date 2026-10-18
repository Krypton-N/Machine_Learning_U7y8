import { AnimatePresence, motion } from "motion/react";
import { Fragment, useMemo } from "react";
import { vistaX, vistaY } from "../components/Adult3DScene";
import { JUGUETE, JugueteAdaBoost, RONDAS_JUGUETE } from "../components/JugueteAdaBoost";
import { Lineas } from "../components/Lineas";
import { TeX } from "../components/TeX";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { adaboost, votoStump } from "../lib/adaboost";

const alfa = (e: number) => 0.5 * Math.log((1 - e) / e);
const curvaAlfa = Array.from({ length: 97 }, (_, i): [number, number] => {
  const e = 0.02 + (i / 96) * 0.48;
  return [e, alfa(e)];
});

const R = RONDAS_JUGUETE;
const f3 = (v: number) => v.toFixed(3);

// La tabla de las dos primeras rondas, punto por punto.
// `rondas` = cuántas rondas se ven (1 o 2): se llena una ronda por clic.
function TablaRondas({ rondas }: { rondas: 1 | 2 }) {
  const ms = rondas === 1 ? [0] : [0, 1];
  const th = { padding: "8px 14px", fontWeight: 400, borderBottom: "1px solid var(--line-2)" } as const;
  const td = { padding: "7px 14px", borderBottom: "1px solid var(--line)" } as const;
  return (
    <table className="mono" style={{ borderCollapse: "collapse", fontSize: 22, textAlign: "right" }}>
      <thead>
        <tr style={{ color: "var(--text-3)", fontSize: 20 }}>
          <th style={th}>punto</th>
          <th style={th}>clase</th>
          {ms.map((m) => (
            <th key={m} colSpan={3} style={{ ...th, textAlign: "center", color: "var(--red-2)", borderLeft: "1px solid var(--line-2)" }}>
              RONDA {m + 1}
            </th>
          ))}
        </tr>
        <tr style={{ color: "var(--text-3)", fontSize: 20 }}>
          <th style={th} />
          <th style={th} />
          {ms.map((m) => (
            <Fragment key={m}>
              <th style={{ ...th, borderLeft: "1px solid var(--line-2)" }}>peso</th>
              <th style={th}>¿acierta?</th>
              <th style={th}>peso nuevo</th>
            </Fragment>
          ))}
        </tr>
      </thead>
      <tbody>
        {JUGUETE.X.map((x, i) => (
          <tr key={i}>
            <td style={td}>{i + 1}</td>
            <td style={{ ...td, color: JUGUETE.y[i] ? "var(--red-2)" : "var(--text-2)" }}>{JUGUETE.y[i] ? "sí" : "no"}</td>
            {ms.map((m) => {
              const bien = votoStump(R[m].stump, x) === (JUGUETE.y[i] ? 1 : -1);
              return (
                <Fragment key={m}>
                  <td style={{ ...td, borderLeft: "1px solid var(--line-2)" }}>{f3(R[m].pesosAntes[i])}</td>
                  <td style={{ ...td, color: bien ? "var(--text-3)" : "var(--red-2)" }}>{bien ? "sí" : "no"}</td>
                  <td style={{ ...td, color: bien ? "var(--text-2)" : "var(--text)", fontWeight: bien ? 400 : 500 }}>{f3(R[m].pesos[i])}</td>
                </Fragment>
              );
            })}
          </tr>
        ))}
        <tr style={{ fontSize: 26 }}>
          <td style={{ ...td, textAlign: "left", fontFamily: "var(--sans)", color: "var(--text-2)" }} colSpan={2}>
            error ponderado ε
          </td>
          {ms.map((m) => (
            <td key={m} colSpan={3} style={{ ...td, textAlign: "center", borderLeft: "1px solid var(--line-2)" }}>
              {f3(R[m].eps)}
            </td>
          ))}
        </tr>
        <tr style={{ fontSize: 26 }}>
          <td style={{ ...td, textAlign: "left", fontFamily: "var(--sans)", color: "var(--text-2)" }} colSpan={2}>
            peso del voto α
          </td>
          {ms.map((m) => (
            <td key={m} colSpan={3} style={{ ...td, textAlign: "center", color: "var(--red-2)", borderLeft: "1px solid var(--line-2)" }}>
              {f3(R[m].alpha)}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}

export default function AdaboostAlfa({ step }: SlideProps) {
  const rondas = useMemo(() => adaboost(vistaX, vistaY, 50), []);
  // Tras actualizar, los puntos mal clasificados suman la mitad del peso: se calcula para la ronda 1 del ejemplo.
  const mitad = R[0].pesos.reduce((s, w, i) => (w > R[0].pesosAntes[i] ? s + w : s), 0);
  // 0: fórmulas 1 y 2 · 1: fórmulas 3 y 4 · 2 y 3: la tabla, una ronda por clic · 4: el caso · 5: nota y conclusión.
  const caso = step >= 4;

  return (
    <SlideFrame
      section={["U7 · Ensambles", "D. Boosting"]}
      num={19}
      caso={caso ? "Adult · 3 variables" : null}
      title="AdaBoost: cuánto vale el voto de cada stump"
      lede={
        caso
          ? "Las 50 rondas sobre las 400 personas de la diapositiva anterior: el error ponderado de cada stump y el peso de su voto."
          : "No todos los stumps opinan igual de bien. El que se equivoca menos, con los pesos de su ronda, vota más fuerte."
      }
    >
      <AnimatePresence mode="wait">
        {step <= 1 && (
          <motion.div key="formulas" style={{ display: "grid", gridTemplateColumns: "1fr 760px", gap: 80 }} exit={{ opacity: 0, transition: { duration: 0.2 } }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 40, fontSize: 30, paddingTop: 10 }}>
              {step === 0 && (
              <>
              <div>
                <div className="label" style={{ marginBottom: 10 }}>
                  1 · Error ponderado del stump
                </div>
                <TeX>{"\\varepsilon_m = \\sum_{i:\\ \\text{mal clasificado}} w_i"}</TeX>
              </div>
              <div>
                <div className="label" style={{ marginBottom: 10 }}>
                  2 · Peso de su voto
                </div>
                <TeX>{"{\\color{#e5383b}\\alpha_m} = \\tfrac12 \\ln\\!\\left(\\dfrac{1-\\varepsilon_m}{\\varepsilon_m}\\right)"}</TeX>
              </div>
              </>
              )}
              {step === 1 && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ display: "grid", gap: 40 }}>
                  <div>
                    <div className="label" style={{ marginBottom: 10 }}>
                      3 · Nuevos pesos (y se normalizan para que sumen 1)
                    </div>
                    {/* Un renglón por caso: juntos no caben a tamaño de fórmula. */}
                    <div>
                      <TeX>{"w_i \\leftarrow w_i\\, \\exp(+\\alpha_m)\\quad \\text{si falló}"}</TeX>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <TeX>{"w_i \\leftarrow w_i\\, \\exp(-\\alpha_m)\\quad \\text{si acertó}"}</TeX>
                    </div>
                  </div>
                  <div>
                    <div className="label" style={{ marginBottom: 10 }}>
                      4 · Respuesta final (los votos valen +1 o −1)
                    </div>
                    <TeX>{"H(x) = \\operatorname{signo}\\Big(\\sum_m \\alpha_m\\, h_m(x)\\Big)"}</TeX>
                  </div>
                </motion.div>
              )}
            </div>
            <div>
              <span className="label">El peso del voto según el error del stump</span>
              <div style={{ marginTop: 12 }}>
                <Lineas
                  ancho={760}
                  alto={420}
                  x={[0, 0.5]}
                  y={[0, 2]}
                  ticksX={[0, 0.1, 0.2, 0.3, 0.4, 0.5]}
                  ticksY={[0, 0.5, 1, 1.5, 2]}
                  rotuloX="error ponderado ε"
                  rotuloY="α"
                  series={[{ id: "a", pts: curvaAlfa, color: "var(--red)", grosor: 3 }]}
                  marcas={[{ x: 0.5, y: 0, texto: "como adivinar: no vota", abajo: false, ancla: "end" }]}
                />
              </div>
              <p style={{ fontSize: 26, color: "var(--text-2)", lineHeight: 1.45, margin: "4px 0 0" }}>
                Con ε = 0.5 el stump no sabe más que una moneda y su voto vale 0. Mientras menos se equivoca, más vale.
              </p>
            </div>
          </motion.div>
        )}
        {(step === 2 || step === 3) && (
          <motion.div
            key="tabla"
            style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 60 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <div>
              <span className="label">Esquema · los 8 puntos de la diapositiva anterior, dos rondas a mano</span>
              <div style={{ marginTop: 12 }}>
                <TablaRondas rondas={step === 2 ? 1 : 2} />
              </div>
            </div>
            <div>
              <span className="label">Ronda {step === 2 ? 1 : 2}</span>
              <div style={{ marginTop: 12 }}>
                <JugueteAdaBoost m={step === 2 ? 0 : 1} lado={300} />
              </div>
              <p style={{ fontSize: 26, color: "var(--text-2)", lineHeight: 1.45, margin: "12px 0 0" }}>
                Después de actualizar, los puntos que falló el stump suman <b style={{ color: "var(--red-2)" }}>{mitad.toFixed(3)}</b> del
                peso: justo la mitad. Para el siguiente stump, repetir la misma respuesta ya no sirve.
              </p>
            </div>
          </motion.div>
        )}
        {step === 4 && (
          <motion.div
            key="caso"
            style={{ display: "grid", gridTemplateColumns: "800px 800px", justifyContent: "space-between" }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div>
              <span className="label natural">Error ponderado de cada stump (ε)</span>
              <Lineas
                ancho={800}
                alto={360}
                x={[1, 50]}
                y={[0.2, 0.5]}
                ticksX={[1, 10, 20, 30, 40, 50]}
                ticksY={[0.2, 0.3, 0.4, 0.5]}
                rotuloX="ronda"
                series={[{ id: "e", pts: rondas.map((r, i): [number, number] => [i + 1, r.eps]), puntos: true }]}
                lineasH={[{ y: 0.5, texto: "adivinar", abajo: true }]}
              />
              <p style={{ fontSize: 26, color: "var(--text-2)", lineHeight: 1.45, margin: 0 }}>
                Cada ronda es más difícil: con los pesos cargados hacia los casos duros, el stump se acerca a 0.5.
              </p>
            </div>
            <div>
              <span className="label natural" style={{ color: "var(--red-2)" }}>
                Peso de su voto (α)
              </span>
              <Lineas
                ancho={800}
                alto={360}
                x={[1, 50]}
                y={[0, 0.7]}
                ticksX={[1, 10, 20, 30, 40, 50]}
                ticksY={[0, 0.2, 0.4, 0.6]}
                rotuloX="ronda"
                series={[{ id: "a", pts: rondas.map((r, i): [number, number] => [i + 1, r.alpha]), color: "var(--red)", puntos: true }]}
              />
              <p style={{ fontSize: 26, color: "var(--text-2)", lineHeight: 1.45, margin: 0 }}>
                Por eso los últimos stumps votan cada vez más bajito: afinan, ya no deciden.
              </p>
            </div>
          </motion.div>
        )}
        {step === 5 && (
          <motion.div key="cierre" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} style={{ maxWidth: 1300, paddingTop: 40 }}>
            <div>
              <p style={{ fontSize: 26, color: "var(--text-3)", margin: 0, lineHeight: 1.4 }}>
                Nota: sklearn usa la variante SAMME, α = ln((1 − ε)/ε) + ln(K − 1). Con dos clases es el doble de esta α y clasifica
                exactamente igual.
              </p>
              <p className="takeaway" style={{ margin: "40px 0 0" }}>
                AdaBoost corrige cambiando pesos. Hay otra forma de corregir: <em>seguir el gradiente</em>.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SlideFrame>
  );
}
