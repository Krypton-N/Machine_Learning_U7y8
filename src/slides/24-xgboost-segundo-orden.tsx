import { AnimatePresence, motion } from "motion/react";
import { pct } from "../components/Piezas";
import { Recap } from "../components/Recap";
import { Reveal } from "../components/Reveal";
import { TeX } from "../components/TeX";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { adultMuestra, xgbFaltantes } from "../lib/adult";

// ---------- Concepto: el valor de una hoja con pendiente (g) y curvatura (h) ----------
// Cuatro personas que cayeron en la misma hoja: su respuesta real y la probabilidad que el modelo les da hoy.
const HOJA = [
  { y: 1, p: 0.3 },
  { y: 1, p: 0.6 },
  { y: 0, p: 0.2 },
  { y: 1, p: 0.5 },
].map((d) => ({ ...d, g: d.p - d.y, h: d.p * (1 - d.p) }));
const G = HOJA.reduce((s, d) => s + d.g, 0);
const H = HOJA.reduce((s, d) => s + d.h, 0);
const w = (lambda: number) => -G / (H + lambda);

function TablaHoja() {
  const th = { padding: "8px 20px", fontWeight: 400, borderBottom: "1px solid var(--line-2)" } as const;
  const td = { padding: "8px 20px", borderBottom: "1px solid var(--line)" } as const;
  return (
    <table className="mono" style={{ borderCollapse: "collapse", fontSize: 22, textAlign: "right" }}>
      <thead>
        <tr style={{ color: "var(--text-3)", fontSize: 20 }}>
          <th style={th}>persona</th>
          <th style={th}>y</th>
          <th style={th}>p</th>
          <th style={{ ...th, color: "var(--red-2)" }}>g = p − y</th>
          <th style={{ ...th, color: "var(--red-2)" }}>h = p(1 − p)</th>
        </tr>
      </thead>
      <tbody>
        {HOJA.map((d, i) => (
          <tr key={i}>
            <td style={td}>{i + 1}</td>
            <td style={td}>{d.y}</td>
            <td style={td}>{d.p.toFixed(1)}</td>
            <td style={td}>{d.g.toFixed(2).replace("-", "−")}</td>
            <td style={td}>{d.h.toFixed(2)}</td>
          </tr>
        ))}
        <tr style={{ color: "var(--text)" }}>
          <td data-rotulo style={{ ...td, textAlign: "left", fontFamily: "var(--sans)", color: "var(--text-2)" }} colSpan={3}>
            suma en la hoja
          </td>
          <td style={td}>G = {G.toFixed(2).replace("-", "−")}</td>
          <td style={td}>H = {H.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
  );
}

// ---------- Faltantes: una pregunta con tres salidas ----------
function PreguntaConFaltante() {
  return (
    <svg width={620} height={250}>
      <rect x={190} y={8} width={240} height={58} fill="var(--panel)" stroke="var(--line-2)" />
      <text x={310} y={44} textAnchor="middle" fontSize={22} fill="var(--text)">
        ¿ocupación ≤ 5?
      </text>
      <line x1={250} y1={66} x2={110} y2={170} stroke="var(--line-2)" strokeWidth={1.5} />
      <line x1={370} y1={66} x2={510} y2={170} stroke="var(--line-2)" strokeWidth={1.5} />
      <motion.path d="M310,66 C310,130 200,120 130,170" fill="none" stroke="var(--red)" strokeWidth={2.5} strokeDasharray="6 5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, delay: 0.3 }} />
      <text x={150} y={110} textAnchor="end" className="mono" fontSize={20} fill="var(--text-3)">
        sí
      </text>
      <text x={470} y={110} className="mono" fontSize={20} fill="var(--text-3)">
        no
      </text>
      <text x={310} y={150} textAnchor="middle" className="mono" fontSize={20} fill="var(--red-2)">
        falta el dato
      </text>
      <rect x={30} y={172} width={180} height={54} fill="var(--panel)" stroke="var(--line-2)" />
      <rect x={410} y={172} width={180} height={54} fill="var(--panel)" stroke="var(--line-2)" />
      <text x={120} y={206} textAnchor="middle" fontSize={20} fill="var(--text-2)">
        rama izquierda
      </text>
      <text x={500} y={206} textAnchor="middle" fontSize={20} fill="var(--text-2)">
        rama derecha
      </text>
    </svg>
  );
}

const F = xgbFaltantes;
const T = F.tiempos;
const faltan = (v: string) => F.direccion.find((d) => d.variable === v)!.faltantes.toLocaleString("es-MX");
const BARRAS = [
  { nombre: "Gradient Boosting de sklearn", s: T.gradient_boosting_sklearn, rojo: false },
  { nombre: "XGBoost con 1 núcleo", s: T.xgboost_un_nucleo, rojo: true },
  { nombre: `XGBoost con ${T.nucleos} núcleos`, s: T.xgboost_todos, rojo: true },
];

export default function XgboostSegundoOrden({ step }: SlideProps) {
  // 0–1: curvatura · 2–4: faltantes (el esquema; la tabla de Adult; a dónde manda a quien le falta) · 5–6: velocidad.
  const faltantes = step >= 2 && step <= 4;
  return (
    <SlideFrame
      section={["U7 · Ensambles", "D. Boosting"]}
      num={24}
      caso={step >= 2 ? "Adult" : null}
      title="XGBoost: curvatura, faltantes y velocidad"
      lede={
        step <= 1
          ? "Gradient Boosting solo mira la pendiente de la pérdida. XGBoost mira también la curvatura, y con eso calcula directo cuánto debe valer cada hoja."
          : faltantes
            ? `En Adult, a ${faltan("workclass")} personas les falta el tipo de empleo y a ${faltan("occupation")} la ocupación. XGBoost no necesita que se rellenen.`
            : `Los mismos 300 árboles de 6 niveles sobre las ${adultMuestra.n.toLocaleString("es-MX")} personas, cronometrados en una misma computadora.`
      }
    >
      <AnimatePresence mode="wait">
        {step <= 1 && (
          <motion.div key="segundo" style={{ display: "grid", gridTemplateColumns: "1fr 800px", gap: 70 }} exit={{ opacity: 0, transition: { duration: 0.2 } }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <Recap title="curvatura">
                <p>
                  La segunda derivada dice qué tan rápido cambia la pendiente. En la diapositiva 20 era lo que limitaba el tamaño del
                  paso: donde la curva es muy cerrada hay que dar pasos cortos.
                </p>
              </Recap>
              <div style={{ fontSize: 26, color: "var(--text-2)", lineHeight: 1.5 }}>
                Con log-loss, para cada persona:
                <div style={{ fontSize: 28, color: "var(--text)", margin: "10px 0" }}>
                  <TeX>{"g = p - y \\quad\\text{(pendiente)} \\qquad h = p\\,(1-p) \\quad\\text{(curvatura)}"}</TeX>
                </div>
                El mejor valor para una hoja sale de sumar las de todas las personas que cayeron en ella:
                <div style={{ fontSize: 34, color: "var(--text)", margin: "14px 0 0" }}>
                  <TeX>{"w^* = -\\frac{G}{H + {\\color{#e5383b}\\lambda}}"}</TeX>
                </div>
              </div>
            </div>
            <Reveal step={step} at={1}>
              <span className="label">Esquema · cuatro personas en la misma hoja</span>
              <div style={{ marginTop: 14 }}>
                <TablaHoja />
              </div>
              <div className="mono" style={{ fontSize: 23, lineHeight: 1.7, marginTop: 20 }}>
                <div>
                  sin cobro (λ = 0): w* = {(-G).toFixed(2)} / {H.toFixed(2)} = <span style={{ color: "var(--text)" }}>{w(0).toFixed(3)}</span>
                </div>
                <div>
                  con λ = 1: w* = {(-G).toFixed(2)} / {(H + 1).toFixed(2)} = <span style={{ color: "var(--red-2)" }}>{w(1).toFixed(3)}</span>
                </div>
              </div>
              <p style={{ fontSize: 26, color: "var(--text-2)", lineHeight: 1.45, margin: "14px 0 0" }}>
                Tres de las cuatro ganan más de 50K y el modelo les da menos probabilidad de la debida: la hoja suma un valor positivo. λ lo encoge.
              </p>
            </Reveal>
          </motion.div>
        )}
        {faltantes && (
          <motion.div
            key="faltantes"
            style={{ display: "grid", gridTemplateColumns: "640px 1fr", gap: 80 }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <div>
              <span className="label">Esquema · cada pregunta aprende a dónde mandar a quien no tiene el dato</span>
              <div style={{ marginTop: 20 }}>
                <PreguntaConFaltante />
              </div>
              <p style={{ fontSize: 26, color: "var(--text-2)", lineHeight: 1.45, margin: "10px 0 0" }}>
                Al buscar el corte se prueban las dos opciones (faltantes a la izquierda o a la derecha) y se queda la que más reduce la
                pérdida.
              </p>
            </div>
            <div>
              {step === 3 && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <span className="label">XGBoost en Adult · validación cruzada de 5 pliegues</span>
              <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 26, marginTop: 14 }}>
                <thead>
                  <tr className="mono" style={{ color: "var(--text-3)", fontSize: 20, textAlign: "right" }}>
                    <th style={{ textAlign: "left", fontWeight: 400, paddingBottom: 10 }} />
                    <th style={{ fontWeight: 400, paddingBottom: 10 }}>ACIERTOS</th>
                    <th style={{ fontWeight: 400, paddingBottom: 10 }}>F1-MACRO</th>
                    <th style={{ fontWeight: 400, paddingBottom: 10 }}>LOG-LOSS</th>
                  </tr>
                </thead>
                <tbody>
                  {(
                    [
                      ["Faltantes tal cual", F.comparacion.nativo],
                      ['Faltantes como una categoría más', F.comparacion.como_categoria],
                    ] as const
                  ).map(([nombre, d]) => (
                    <tr key={nombre} style={{ borderTop: "1px solid var(--line)" }}>
                      <td style={{ padding: "12px 0", color: "var(--text-2)" }}>{nombre}</td>
                      <td className="mono" style={{ textAlign: "right" }}>
                        {pct(d.acc, 2)}
                      </td>
                      <td className="mono" style={{ textAlign: "right" }}>
                        {d.f1.toFixed(4)}
                      </td>
                      <td className="mono" style={{ textAlign: "right" }}>
                        {d.logloss.toFixed(4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ fontSize: 26, color: "var(--text-3)", lineHeight: 1.45, margin: "12px 0 24px" }}>
                La diferencia ({((F.comparacion.nativo.acc - F.comparacion.como_categoria.acc) * 100).toFixed(2)} puntos) es menor que la
                variación entre pliegues (±{(F.comparacion.nativo.acc_desv * 100).toFixed(2)}): aquí da igual. La ventaja es no tener que
                decidir cómo rellenar.
              </p>
              </motion.div>
              )}
              {step === 4 && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <span className="label">A dónde manda a quien le falta el dato</span>
              <div style={{ display: "grid", gap: 8, marginTop: 12, fontSize: 26 }}>
                {F.direccion.map((d) => (
                  <div key={d.variable} style={{ display: "grid", gridTemplateColumns: "190px 1fr 250px", alignItems: "center", gap: 16 }}>
                    <span style={{ color: "var(--text-2)" }}>{d.nombre_es}</span>
                    <div style={{ display: "flex", height: 14, background: "var(--data-dim)" }}>
                      <div style={{ width: `${(d.faltante_a_la_izquierda / d.cortes) * 100}%`, background: "var(--red)" }} />
                    </div>
                    <span className="mono" style={{ fontSize: 20, color: "var(--text-3)" }}>
                      izquierda en {d.faltante_a_la_izquierda} de {d.cortes} preguntas
                    </span>
                  </div>
                ))}
              </div>
              </motion.div>
              )}
            </div>
          </motion.div>
        )}
        {step >= 5 && (
          <motion.div
            key="tiempos"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 90 }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div>
              <span className="label">Segundos para entrenar</span>
              <div style={{ display: "grid", gap: 24, marginTop: 22 }}>
                {BARRAS.map((b) => (
                  <div key={b.nombre}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, marginBottom: 8 }}>
                      <span>{b.nombre}</span>
                      <span className="mono" style={{ color: b.rojo ? "var(--red-2)" : "var(--text)" }}>
                        {b.s.toFixed(2)} s
                      </span>
                    </div>
                    <div style={{ height: 26, background: "var(--line)" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(0.4, (b.s / T.gradient_boosting_sklearn) * 100)}%` }}
                        transition={{ duration: 0.8 }}
                        style={{ height: 26, background: b.rojo ? "var(--red)" : "var(--data-dim)" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 22, fontSize: 26, color: "var(--text-2)", lineHeight: 1.45, paddingTop: 30 }}>
              <p style={{ margin: 0 }}>
                <b style={{ color: "var(--text)" }}>Con un solo núcleo ya es {Math.round(T.gradient_boosting_sklearn / T.xgboost_un_nucleo)} veces más rápido.</b>{" "}
                Antes de buscar cortes, agrupa los valores de cada variable en unos cuantos intervalos y prueba solo esos.
              </p>
              <p style={{ margin: 0 }}>
                Con {T.nucleos} núcleos gana otras {(T.xgboost_un_nucleo / T.xgboost_todos).toFixed(1)} veces: la búsqueda del mejor corte se
                reparte entre núcleos. Los árboles siguen construyéndose <b style={{ color: "var(--text)" }}>uno después de otro</b>.
              </p>
              <Reveal step={step} at={6} style={{ marginTop: "auto" }}>
                <p className="takeaway" style={{ margin: 0, fontSize: 26 }}>
                  XGBoost es Gradient Boosting <em>con freno, con curvatura y hecho para ir rápido</em>.
                </p>
              </Reveal>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SlideFrame>
  );
}
