import { AnimatePresence, motion } from "motion/react";
import { Fragment, useState } from "react";
import { Chips, Dato, Def, pct } from "../components/Piezas";
import { Receta } from "../components/Receta";
import { Reveal } from "../components/Reveal";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { adultMuestra, matrices } from "../lib/adult";
import { contar, desviacion, exactitud, f1, f1Macro, invertir, media, precision, recall, total, type Matriz } from "../lib/metricas";
import { linear } from "../lib/scale";

// ---------- Concepto: 10 personas de esquema ----------
// Lo que cada una es en realidad (1 = gana > 50K) y lo que respondió de ella un modelo inventado.
const REAL = [0, 1, 0, 0, 1, 0, 0, 1, 0, 0];
const DICE = [0, 1, 1, 0, 0, 0, 1, 1, 0, 0];
const SIEMPRE_NO = REAL.map(() => 0);
const MA = contar(REAL, DICE);
const MNO = contar(REAL, SIEMPRE_NO);

// Renglón = lo que era (arriba, sí); columna = lo que el modelo dijo (izquierda, sí).
const CASILLAS = [
  { clave: "vp", f: 0, c: 0, sigla: "VP", texto: "acierto" },
  { clave: "fn", f: 0, c: 1, sigla: "FN", texto: "se le escapó" },
  { clave: "fp", f: 1, c: 0, sigla: "FP", texto: "falsa alarma" },
  { clave: "vn", f: 1, c: 1, sigla: "VN", texto: "acierto" },
] as const;
type Clave = (typeof CASILLAS)[number]["clave"];

const W = 900;
const H = 590;
const MX = 170;
const MY = 150;
const CW = 360;
const CH = 215;

/** Dónde va cada persona: formada arriba (sin `dice`) o dentro de su casilla. */
function lugares(dice: number[] | null) {
  if (!dice) return REAL.map((_, i) => ({ x: 62 + i * 86, y: 46 }));
  const cuenta = [0, 0, 0, 0];
  return REAL.map((r, i) => {
    const f = r ? 0 : 1;
    const c = dice[i] ? 0 : 1;
    const k = cuenta[f * 2 + c]++;
    return { x: MX + c * CW + 56 + (k % 4) * 64, y: MY + f * CH + 60 + Math.floor(k / 4) * 60 };
  });
}

function MatrizEsquema({ dice, m, resaltar }: { dice: number[] | null; m: Matriz; resaltar: readonly Clave[] }) {
  const pos = lugares(dice);
  return (
    <svg width={W} height={H} style={{ display: "block" }}>
      {["el modelo dijo sí", "el modelo dijo no"].map((t, c) => (
        <text key={t} x={MX + c * CW + CW / 2} y={MY - 14} textAnchor="middle" fontSize={20} fill="var(--text-2)">
          {t}
        </text>
      ))}
      {["sí gana > 50K", "no"].map((t, f) => (
        <g key={t}>
          <text x={0} y={MY + f * CH + CH / 2 - 8} className="mono" fontSize={20} fill="var(--text-3)">
            en realidad
          </text>
          <text x={0} y={MY + f * CH + CH / 2 + 20} fontSize={21} fill={f ? "var(--text-2)" : "var(--red-2)"}>
            {t}
          </text>
        </g>
      ))}
      {CASILLAS.map((k) => {
        const x = MX + k.c * CW;
        const y = MY + k.f * CH;
        const on = resaltar.includes(k.clave);
        return (
          <g key={k.clave}>
            <motion.rect
              x={x + 4}
              y={y + 4}
              width={CW - 8}
              height={CH - 8}
              initial={false}
              animate={{ fill: on ? "rgba(229, 56, 59, 0.14)" : "rgba(23, 23, 26, 1)", stroke: on ? "#e5383b" : "#3a3a41" }}
              strokeWidth={on ? 2 : 1}
            />
            <text x={x + 20} y={y + CH - 22} className="mono" fontSize={20} fill="var(--text-3)">
              {k.sigla} · {k.texto}
            </text>
            <motion.text x={x + CW - 24} y={y + CH - 20} textAnchor="end" className="mono" fontSize={34} fill="var(--text)" initial={false} animate={{ opacity: dice ? 1 : 0 }}>
              {m[k.clave]}
            </motion.text>
          </g>
        );
      })}
      {REAL.map((r, i) => (
        <motion.g key={i} initial={false} animate={{ x: pos[i].x, y: pos[i].y }} transition={{ duration: 0.8, delay: i * 0.06, ease: [0.2, 0.7, 0.2, 1] }}>
          <circle r={21} fill={r ? "var(--red)" : "var(--data-dim)"} />
          <text y={6} textAnchor="middle" className="mono" fontSize={20} fill="var(--text)">
            {i + 1}
          </text>
          <motion.text y={48} textAnchor="middle" className="mono" fontSize={20} fill={DICE[i] ? "var(--text)" : "var(--text-3)"} initial={false} animate={{ opacity: dice ? 0 : 1 }}>
            dice {DICE[i] ? "sí" : "no"}
          </motion.text>
        </motion.g>
      ))}
    </svg>
  );
}

function FilaMetrica({ nombre, pregunta, cuenta, valor }: { nombre: string; pregunta: string; cuenta: string; valor: number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 24, borderTop: "1px solid var(--line)", padding: "13px 0" }}>
      <div>
        <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.01em" }}>{nombre}</div>
        <div style={{ fontSize: 26, color: "var(--text-2)", marginTop: 2 }}>{pregunta}</div>
      </div>
      <div className="mono" style={{ fontSize: 26, textAlign: "right", whiteSpace: "nowrap" }}>
        <span style={{ color: "var(--text-3)" }}>{cuenta} = </span>
        {valor.toFixed(2)}
      </div>
    </div>
  );
}

// Los dos modelos de esquema, métrica por métrica.
const COMPARA: [string, (m: Matriz) => string][] = [
  ["Accuracy", (m) => exactitud(m).toFixed(2)],
  ["Precision", (m) => (m.vp + m.fp ? precision(m).toFixed(2) : "nunca dijo sí")],
  ["Recall", (m) => recall(m).toFixed(2)],
  ["F1 de la clase «sí gana > 50K»", (m) => f1(m).toFixed(2)],
  ["F1 de la clase «no»", (m) => f1(invertir(m)).toFixed(2)],
  ["F1-macro: su promedio", (m) => f1Macro(m).toFixed(2)],
];

function TablaDosModelos() {
  const td = { padding: "10px 0", borderTop: "1px solid var(--line)" } as const;
  return (
    <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 26 }}>
      <thead>
        <tr className="mono" style={{ color: "var(--text-3)", fontSize: 20, textAlign: "right" }}>
          <th />
          <th style={{ fontWeight: 400, paddingBottom: 10, width: 170 }}>EL DE ANTES</th>
          <th style={{ fontWeight: 400, paddingBottom: 10, width: 200, color: "var(--red-2)" }}>SIEMPRE DICE NO</th>
        </tr>
      </thead>
      <tbody>
        {COMPARA.map(([nombre, f], i) => {
          const ultimo = i === COMPARA.length - 1;
          return (
            <tr key={nombre} style={{ color: ultimo ? "var(--text)" : "var(--text-2)", fontWeight: ultimo ? 600 : 400 }}>
              <td style={{ ...td, borderTopColor: ultimo ? "var(--line-2)" : "var(--line)" }}>{nombre}</td>
              <td className="mono" style={{ ...td, textAlign: "right", borderTopColor: ultimo ? "var(--line-2)" : "var(--line)", color: "var(--text)" }}>
                {f(MA)}
              </td>
              <td className="mono" style={{ ...td, textAlign: "right", borderTopColor: ultimo ? "var(--line-2)" : "var(--line)", color: "var(--red-2)" }}>
                {f(MNO)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ---------- Caso: las matrices reales de Adult ----------
const N = adultMuestra.n.toLocaleString("es-MX");
const MODELOS = matrices.modelos.map((m) => ({ valor: m.modelo, texto: m.modelo === "Árbol de decisión" ? "Árbol sin límite" : m.modelo }));
const RECETA_ADULT = [`${N} personas de Adult`, `${matrices.modelos.length} modelos, sin ajustar`, "5 pliegues estratificados", "accuracy y F1-macro"];

function MatrizReal({ m }: { m: Matriz }) {
  const n = total(m);
  return (
    <div data-rotulo style={{ display: "grid", gridTemplateColumns: "150px 1fr 1fr", gap: 8, alignItems: "stretch" }}>
      <span />
      {["el modelo dijo sí", "el modelo dijo no"].map((t) => (
        <div key={t} style={{ textAlign: "center", fontSize: 20, color: "var(--text-2)", paddingBottom: 4 }}>
          {t}
        </div>
      ))}
      {[0, 1].map((f) => (
        <Fragment key={f}>
          <div style={{ alignSelf: "center" }}>
            <div className="mono" style={{ fontSize: 20, color: "var(--text-3)" }}>
              en realidad
            </div>
            <div style={{ fontSize: 26, color: f ? "var(--text-2)" : "var(--red-2)" }}>{f ? "no" : "sí gana > 50K"}</div>
          </div>
          {CASILLAS.filter((k) => k.f === f).map((k) => (
            <div key={k.clave} style={{ background: "var(--panel)", border: "1px solid var(--line-2)", padding: "14px 20px 12px", height: 138, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span className="mono" style={{ fontSize: 40, lineHeight: 1 }}>
                  {m[k.clave].toLocaleString("es-MX")}
                </span>
                <span className="mono" style={{ fontSize: 20, color: "var(--text-3)" }}>
                  {pct(m[k.clave] / n)}
                </span>
              </div>
              {/* Barra proporcional a la casilla: rojo si en realidad ganan > 50K. */}
              <div style={{ height: 8, background: "var(--line)", marginTop: 14 }}>
                <motion.div initial={false} animate={{ width: `${(m[k.clave] / n) * 100}%` }} transition={{ duration: 0.5 }} style={{ height: 8, background: f ? "var(--data-dim)" : "var(--red)" }} />
              </div>
              <span className="mono" style={{ fontSize: 20, color: "var(--text-3)", marginTop: "auto" }}>
                {k.sigla} · {k.texto}
              </span>
            </div>
          ))}
        </Fragment>
      ))}
    </div>
  );
}

// Los 5 pliegues de una métrica sobre una escala muy cercana: ±0.012 alrededor de su media.
const MEDIA_ANCHO = 0.012;
function TiraPliegues({ titulo, valores }: { titulo: string; valores: number[] }) {
  const ancho = 780;
  const m = media(valores);
  const d = desviacion(valores);
  const fx = linear([m - MEDIA_ANCHO, m + MEDIA_ANCHO], [16, ancho - 16]);
  const ticks: number[] = [];
  for (let t = Math.ceil((m - MEDIA_ANCHO) / 0.005) * 0.005; t <= m + MEDIA_ANCHO; t += 0.005) ticks.push(t);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", width: ancho }}>
        <span style={{ fontSize: 26, color: "var(--text-2)" }}>{titulo} en cada pliegue</span>
        <span className="mono" style={{ fontSize: 24 }}>
          {m.toFixed(3)} <span style={{ color: "var(--red-2)" }}>± {d.toFixed(3)}</span>
        </span>
      </div>
      <svg width={ancho} height={74} style={{ display: "block", marginTop: 4 }}>
        <line x1={0} x2={ancho} y1={30} y2={30} stroke="var(--line-2)" />
        {ticks.map((t) => (
          <g key={t.toFixed(3)}>
            <line x1={fx(t)} x2={fx(t)} y1={24} y2={36} stroke="var(--line-2)" />
            <text x={fx(t)} y={64} textAnchor="middle" className="mono" fontSize={20} fill="var(--text-3)">
              {t.toFixed(3)}
            </text>
          </g>
        ))}
        <motion.rect y={12} height={36} fill="var(--red-dim)" initial={false} animate={{ x: fx(m - d), width: Math.max(1, fx(m + d) - fx(m - d)) }} />
        <line x1={fx(m)} x2={fx(m)} y1={6} y2={54} stroke="var(--red)" strokeWidth={2} />
        {valores.map((v, k) => (
          <motion.circle key={k} cy={30} r={7} fill="var(--data)" stroke="var(--bg)" strokeWidth={2} initial={false} animate={{ cx: fx(v) }} transition={{ duration: 0.5 }} />
        ))}
      </svg>
    </div>
  );
}

const RESALTAR: Record<number, readonly Clave[]> = { 2: ["vp", "vn"], 3: ["vp", "fp"], 4: ["vp", "fn"] };

export default function ComoSeComparan({ step }: SlideProps) {
  const [modelo, setModelo] = useState(MODELOS[0].valor);
  // 0–5: la matriz y las métricas · 6–7: el modelo que siempre dice "no" (definición y tabla; luego la lectura) ·
  // 8: la matriz real · 9: los pliegues · 10: la conclusión.
  const caso = step >= 8;
  const siempreNo = step === 6 || step === 7;
  const real = matrices.modelos.find((m) => m.modelo === modelo)!;
  const M = real.todas;

  return (
    <SlideFrame
      section={["U7 · Ensambles", "E. Cierre de la parte 1"]}
      num={26}
      caso={caso ? "Adult" : null}
      title="Cómo se comparan los modelos"
      lede={
        caso
          ? `Las ${N} personas de Adult, cada una calificada por un modelo que no la vio al entrenar.`
          : siempreNo
            ? "Las mismas 10 personas, ahora con un modelo que no aprendió nada: responde siempre que no."
            : "Contar aciertos no alcanza: importa en qué se equivoca el modelo. Todo sale de una tabla de 2 × 2."
      }
    >
      <AnimatePresence mode="wait">
        {!caso ? (
          <motion.div key="concepto" style={{ display: "grid", gridTemplateColumns: `${W}px 1fr`, gap: 70 }} exit={{ opacity: 0, transition: { duration: 0.2 } }}>
            <div>
              <span className="label">Esquema · 10 personas · rojo = en realidad gana &gt; 50K</span>
              <div style={{ marginTop: 10 }}>
                <MatrizEsquema dice={step === 0 ? null : siempreNo ? SIEMPRE_NO : DICE} m={siempreNo ? MNO : MA} resaltar={RESALTAR[step] ?? []} />
              </div>
            </div>
            <AnimatePresence mode="wait">
              {!siempreNo ? (
                <motion.div key="metricas" exit={{ opacity: 0, transition: { duration: 0.2 } }} style={{ paddingTop: 34 }}>
                  <Def termino="Matriz de confusión">
                    Cada persona tiene dos datos: lo que es y lo que el modelo dijo de ella. La matriz cuenta las cuatro combinaciones.
                  </Def>
                  <div style={{ marginTop: 26, borderBottom: step >= 2 ? "1px solid var(--line)" : "none" }}>
                    <Reveal step={step} at={2}>
                      <FilaMetrica nombre="Accuracy" pregunta="De todas, ¿en cuántas acertó?" cuenta={`(${MA.vp} + ${MA.vn}) / ${total(MA)}`} valor={exactitud(MA)} />
                    </Reveal>
                    <Reveal step={step} at={3}>
                      <FilaMetrica nombre="Precision" pregunta="De las que dijo sí, ¿cuántas eran?" cuenta={`${MA.vp} / (${MA.vp} + ${MA.fp})`} valor={precision(MA)} />
                    </Reveal>
                    <Reveal step={step} at={4}>
                      <FilaMetrica nombre="Recall" pregunta="De las que eran, ¿a cuántas encontró?" cuenta={`${MA.vp} / (${MA.vp} + ${MA.fn})`} valor={recall(MA)} />
                    </Reveal>
                    <Reveal step={step} at={5}>
                      <FilaMetrica nombre="F1" pregunta="Las dos anteriores en un número: si una es baja, el F1 es bajo." cuenta="2·P·R / (P + R)" valor={f1(MA)} />
                    </Reveal>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="dos" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.2 } }} style={{ paddingTop: 34 }}>
                  {step === 6 && (
                  <Def termino="F1-macro">
                    Se calcula el F1 dos veces: buscando a quienes sí ganan más de 50K y buscando a quienes no. Luego se promedian, y las
                    dos clases pesan igual aunque una sea minoría.
                  </Def>
                  )}
                  <div style={{ marginTop: 26 }}>
                    <TablaDosModelos />
                  </div>
                  {step === 7 && (
                  <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: 26, color: "var(--text-2)", lineHeight: 1.45, margin: "18px 0 0" }}>
                    Los dos aciertan en {MA.vp + MA.vn} de {total(MA)}. El segundo no encontró a nadie:{" "}
                    <b style={{ color: "var(--text)" }}>accuracy no los distingue, F1-macro sí.</b>
                  </motion.p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div key="caso" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <Receta franja resaltar={3} textos={RECETA_ADULT} />
            <div style={{ margin: "18px 0 14px" }}>
              <Chips opciones={MODELOS} valor={modelo} onChange={setModelo} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "790px 1fr", gap: 70 }}>
              <MatrizReal m={M} />
              <div style={{ paddingTop: 30 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, auto)", justifyContent: "space-between" }}>
                  <Dato valor={exactitud(M).toFixed(3)} rotulo="accuracy" />
                  <Dato valor={M.vp + M.fp ? precision(M).toFixed(3) : "—"} rotulo={M.vp + M.fp ? "precision" : "precision: nunca dijo sí"} />
                  <Dato valor={recall(M).toFixed(3)} rotulo="recall" />
                  <Dato rojo valor={f1Macro(M).toFixed(3)} rotulo="F1-macro" />
                </div>
                {step === 9 && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 24, display: "grid", gap: 8 }}>
                  <TiraPliegues titulo="Accuracy" valores={real.pliegues.map(exactitud)} />
                  <TiraPliegues titulo="F1-macro" valores={real.pliegues.map(f1Macro)} />
                  <p style={{ fontSize: 26, color: "var(--text-2)", lineHeight: 1.4, margin: 0 }}>
                    Cada punto es un pliegue: el mismo modelo, examinado con otra quinta parte de las personas. El{" "}
                    <b style={{ color: "var(--red-2)" }}>±</b> dice cuánto cambia el resultado al cambiar a quiénes les toca ser el examen.
                  </p>
                </motion.div>
                )}
                {step >= 10 && (
                  <motion.p className="takeaway" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ margin: "30px 0 0", fontSize: 28 }}>
                    Con clases desbalanceadas, <em>accuracy sola engaña</em>. Por eso lo que sigue se compara con F1-macro, y cada número lleva su ±.
                  </motion.p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SlideFrame>
  );
}
