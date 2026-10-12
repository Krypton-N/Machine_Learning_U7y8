import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { BarraClases, Chips, pct } from "../components/Piezas";
import { Receta } from "../components/Receta";
import { Reveal } from "../components/Reveal";
import { TablaCruda } from "../components/TablaCruda";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { adultMuestra } from "../lib/adult";

// ---------- Concepto 1: el modelo memorión ----------
// Alumnos inventados: [horas de estudio, tareas entregadas, ¿aprobó?].
const ESTUDIADOS = [
  [2, 1, 0],
  [8, 5, 1],
  [5, 4, 1],
  [1, 0, 0],
  [9, 4, 1],
  [6, 3, 1],
];
const NUEVOS = [
  [7, 5, 1],
  [3, 1, 0],
  [2, 0, 0],
  [6, 4, 1],
];
// El memorión responde lo que vio; si no vio al alumno, repite la respuesta más común ("aprobó").
const comun = ESTUDIADOS.filter((a) => a[2]).length * 2 >= ESTUDIADOS.length ? 1 : 0;
const memorion = (h: number, t: number) => ESTUDIADOS.find((a) => a[0] === h && a[1] === t)?.[2] ?? comun;
const aciertos = (filas: number[][]) => filas.filter(([h, t, y]) => memorion(h, t) === y).length;

function TablaAlumnos({ titulo, filas, nuevos }: { titulo: string; filas: number[][]; nuevos?: boolean }) {
  const celda = { padding: "10px 24px", fontSize: 25, borderBottom: "1px solid var(--line)" } as const;
  return (
    <div>
      <div className="label" style={{ marginBottom: 12 }}>
        {titulo}
      </div>
      <table style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr className="mono" style={{ color: "var(--text-3)", fontSize: 15, textAlign: "left" }}>
            <th style={celda}>horas</th>
            <th style={celda}>tareas</th>
            <th style={celda}>¿aprobó?</th>
            <th style={celda}>el modelo dice</th>
          </tr>
        </thead>
        <tbody>
          {filas.map(([h, t, y], i) => {
            const dice = memorion(h, t);
            return (
              <motion.tr key={i} initial={nuevos ? { opacity: 0, x: 16 } : false} animate={{ opacity: 1, x: 0 }} transition={{ delay: nuevos ? 0.2 + i * 0.25 : 0 }}>
                <td className="mono" style={celda}>
                  {h}
                </td>
                <td className="mono" style={celda}>
                  {t}
                </td>
                <td style={celda}>{y ? "sí" : "no"}</td>
                <td style={{ ...celda, color: dice === y ? "var(--text)" : "var(--red-2)" }}>
                  {dice ? "sí" : "no"} {dice === y ? "✓" : "✗"}
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
      <div className="mono" style={{ fontSize: 24, marginTop: 14, color: nuevos ? "var(--red-2)" : "var(--text)" }}>
        acierta {aciertos(filas)} de {filas.length}
      </div>
    </div>
  );
}

// ---------- Concepto 2: validación cruzada con 20 cuadros ----------
// 5 pliegues de 4 filas; cada pliegue tiene 1 positivo (estratificado: misma proporción en todos).
function KFoldEsquema() {
  const k = 5;
  const lado = 40;
  return (
    <svg width={1100} height={k * 62 + 10} style={{ display: "block" }}>
      {Array.from({ length: k }, (_, ronda) => (
        <motion.g key={ronda} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 * ronda }}>
          <text x={0} y={ronda * 62 + 32} className="mono" fontSize={17} fill="var(--text-3)">
            ronda {ronda + 1}
          </text>
          {Array.from({ length: k }, (_, pliegue) => {
            const prueba = pliegue === ronda;
            return Array.from({ length: 4 }, (_, j) => {
              const x = 120 + pliegue * (4 * (lado + 4) + 22) + j * (lado + 4);
              return (
                <g key={`${pliegue}-${j}`}>
                  <rect
                    x={x}
                    y={ronda * 62 + 4}
                    width={lado}
                    height={lado}
                    fill={prueba ? "var(--red-dim)" : "var(--panel)"}
                    stroke={prueba ? "var(--red)" : "var(--line-2)"}
                  />
                  {j === 0 && <circle cx={x + lado / 2} cy={ronda * 62 + 4 + lado / 2} r={7} fill="var(--red)" />}
                </g>
              );
            });
          })}
        </motion.g>
      ))}
    </svg>
  );
}

// ---------- Caso: Adult ----------
const M = adultMuestra;

// El dataset tal como llega, antes de cualquier cambio. Son 15 columnas: se parte en dos bloques, como hace pandas.
const C = M.crudo;
const CORTE = 8;
const CON_FALTANTES = M.columnas.filter((c) => c.faltantes > 0).map((c) => c.nombre);

function Nota({ titulo, children }: { titulo: ReactNode; children: ReactNode }) {
  return (
    <div style={{ borderTop: "1px solid var(--line-2)", paddingTop: 10 }}>
      <div style={{ fontSize: 22, fontWeight: 600 }}>{titulo}</div>
      <div style={{ fontSize: 21, color: "var(--text-2)", lineHeight: 1.38, marginTop: 4 }}>{children}</div>
    </div>
  );
}
const cod = { fontFamily: "var(--mono)", color: "var(--red-2)" } as const;

function DatasetCrudo({ anotada }: { anotada: boolean }) {
  const tabla = { datos: C, anotada, quitadas: C.excluidas, objetivo: C.objetivo, tamano: 20 };
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 22, marginBottom: 6 }}>
        <span className="mono" style={{ fontSize: 22, color: "var(--red-2)" }}>
          adult.head()
        </span>
        <span className="label">las primeras 5 filas de {M.n.toLocaleString("es-MX")}, tal como llegan</span>
      </div>
      <TablaCruda {...tabla} desde={0} hasta={CORTE} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 12 }}>
        <TablaCruda {...tabla} desde={CORTE} />
        <div className="mono" style={{ textAlign: "right" }}>
          <div style={{ fontSize: 22, color: "var(--red-2)" }}>adult.shape</div>
          <div style={{ fontSize: 36, lineHeight: 1.2 }}>
            ({M.n}, {C.columnas.length})
          </div>
          <div className="label">filas, columnas</div>
        </div>
      </div>
      <AnimatePresence mode="wait">
        {!anotada ? (
          <motion.div key="que-es" exit={{ opacity: 0, transition: { duration: 0.2 } }} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 44, marginTop: 20 }}>
            <Nota titulo="De dónde sale">
              Del censo de Estados Unidos de 1994. Es un conjunto clásico para comparar clasificadores: está en UCI y en OpenML como «adult».
            </Nota>
            <Nota titulo="Qué es cada fila">
              Una persona adulta. Cada columna es un dato suyo: edad, tipo de empleo, escolaridad, estado civil, ocupación, horas de trabajo…
            </Nota>
            <Nota titulo="Qué se quiere predecir">
              La última columna, <span style={cod}>class</span>: si su ingreso pasa de 50 mil dólares al año (<span style={cod}>&gt;50K</span>) o no.
            </Nota>
          </motion.div>
        ) : (
          <motion.div key="cambios" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 36, marginTop: 20 }}>
            <Nota
              titulo={
                <>
                  <span style={cod}>class</span> pasa a ser y
                </>
              }
            >
              Vale 1 si dice &gt;50K y 0 si no. En {pct(M.positivos / M.n)} de las filas vale 1.
            </Nota>
            <Nota
              titulo={
                <>
                  <span style={cod}>{C.excluidas.join(", ")}</span> se quita
                </>
              }
            >
              Es el peso censal: a cuántas personas de la población representa esa fila. Habla del muestreo, no de la persona.
            </Nota>
            <Nota
              titulo={
                <>
                  <span style={cod}>NaN</span> es una categoría más
                </>
              }
            >
              Falta el dato en {CON_FALTANTES.join(", ")}. En vez de rellenarlo se marca como «faltante».
            </Nota>
            <Nota titulo="El texto pasa a códigos">
              Cada categoría recibe un número entero. A un árbol le basta: solo pregunta si un valor es menor o mayor que otro.
            </Nota>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
const PERSONAS = M.ejemplos.map((_, i) => ({ valor: i, texto: `Persona ${"ABC"[i]}` }));

function FichaPersona({ k }: { k: number }) {
  const p = M.ejemplos[k];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 40 }}>
      {M.columnas.map((c) => {
        const v = p.valores[c.nombre];
        return (
          <div key={c.nombre} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "7px 0", borderBottom: "1px solid var(--line)", fontSize: 20 }}>
            <span style={{ color: "var(--text-3)" }}>{c.nombre_es}</span>
            <span className="mono" style={{ color: v === null ? "var(--red-2)" : "var(--text)", textAlign: "right" }}>
              {v === null ? "falta el dato" : typeof v === "number" ? v.toLocaleString("es-MX") : v}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function PlieguesReales() {
  const W = 1696;
  let x = 0;
  return (
    <svg width={W} height={96} style={{ display: "block" }}>
      {M.pliegues.map((f, i) => {
        const w = (f.n / M.n) * W;
        const x0 = x;
        x += w;
        const wp = (f.positivos / f.n) * (w - 6);
        return (
          <g key={i}>
            <rect x={x0 + 3} y={30} width={w - 6} height={26} fill="var(--data-dim)" />
            <rect x={x0 + 3 + (w - 6 - wp)} y={30} width={wp} height={26} fill="var(--red)" />
            <text x={x0 + 3} y={20} className="mono" fontSize={16} fill="var(--text-2)">
              pliegue {i + 1} · {f.n.toLocaleString("es-MX")} personas
            </text>
            <text x={x0 + w - 3} y={80} textAnchor="end" className="mono" fontSize={16} fill="var(--red-2)">
              {pct(f.positivos / f.n)} gana &gt; 50K
            </text>
          </g>
        );
      })}
    </svg>
  );
}

const RECETA_ADULT = [
  `${M.n.toLocaleString("es-MX")} personas, ${M.columnas.length} variables. y = ¿gana más de 50K al año?`,
  "Árboles de decisión y ensambles de árboles (diapositivas 4 a 28).",
  "5 pliegues estratificados: cada persona sirve una vez de examen.",
  "Aciertos (accuracy) y F1-macro. Se explican en la 26.",
];

export default function ComoSabemosSiSirve({ step }: SlideProps) {
  const [persona, setPersona] = useState(0);
  const caso = step >= 3;
  const crudo = step === 3 || step === 4;
  const ejemplo = M.ejemplos[persona];

  return (
    <SlideFrame
      section={["Apertura", "Cómo se evalúa"]}
      num={3}
      caso={caso ? "Adult" : null}
      title="¿Cómo sabemos si un modelo sirve?"
      lede={
        crudo
          ? step === 3
            ? "El caso de toda la parte 1 es Adult (Census Income). Antes de usarlo, así se ve el archivo tal como llega."
            : "Lo único que se le cambia antes de entrenar. Todo lo demás se usa tal cual."
          : step === 5
            ? "Así queda una persona después de esos cambios, con los nombres de las columnas en español."
            : caso
              ? "La receta de todo experimento, ahora con los datos de Adult."
          : "Si el examen trae las mismas preguntas de la guía, sacar 10 no prueba que entendiste. Con un modelo pasa igual."
      }
    >
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="memorion" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 100 }} exit={{ opacity: 0, transition: { duration: 0.2 } }}>
            <TablaAlumnos titulo="Esquema · los 6 alumnos que el modelo se aprendió de memoria" filas={ESTUDIADOS} />
            <div>
              <TablaAlumnos titulo="4 alumnos que nunca vio" filas={NUEVOS} nuevos />
              <p style={{ fontSize: 24, color: "var(--text-2)", lineHeight: 1.45, margin: "22px 0 0", maxWidth: 640 }}>
                Memorizar no es aprender. Lo que importa es cómo responde con <b style={{ color: "var(--text)" }}>casos nuevos</b>.
              </p>
            </div>
          </motion.div>
        )}
        {step === 1 && (
          <motion.div key="receta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }} style={{ paddingTop: 40 }}>
            <div className="label" style={{ marginBottom: 30 }}>
              La receta de todo experimento
            </div>
            <Receta />
            <p className="takeaway" style={{ margin: "70px 0 0" }}>
              Un número sin su validación no dice nada: siempre hay que preguntar <em>con qué datos se examinó</em>.
            </p>
          </motion.div>
        )}
        {step === 2 && (
          <motion.div key="kfold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }}>
            <Receta franja resaltar={2} textos={["", "", "validación cruzada de 5 pliegues", ""]} />
            <div style={{ display: "grid", gridTemplateColumns: "1100px 1fr", gap: 60, marginTop: 40 }}>
              <div>
                <span className="label">Esquema · 20 filas en 5 pliegues · punto rojo = fila de la clase "sí" · marco rojo = examen</span>
                <div style={{ marginTop: 16 }}>
                  <KFoldEsquema />
                </div>
              </div>
              <div style={{ fontSize: 23, color: "var(--text-2)", lineHeight: 1.5, display: "flex", flexDirection: "column", gap: 18, paddingTop: 30 }}>
                <p style={{ margin: 0 }}>
                  Se parte la tabla en 5 pliegues. En cada ronda uno sirve de <b style={{ color: "var(--red-2)" }}>examen</b> y con los
                  otros 4 se entrena.
                </p>
                <p style={{ margin: 0 }}>Al final hay 5 calificaciones: se reporta su promedio y qué tanto varían.</p>
                <p style={{ margin: 0 }}>
                  <b style={{ color: "var(--text)" }}>Estratificado:</b> cada pliegue conserva la misma proporción de "sí".
                </p>
              </div>
            </div>
          </motion.div>
        )}
        {crudo && (
          <motion.div key="crudo" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.2 } }}>
            <DatasetCrudo anotada={step === 4} />
          </motion.div>
        )}
        {step === 5 && (
          <motion.div
            key="ficha"
            style={{ display: "grid", gridTemplateColumns: "980px 1fr", gap: 80 }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span className="label">Una fila = una persona · {M.columnas.length} variables</span>
                <Chips opciones={PERSONAS} valor={persona} onChange={setPersona} />
              </div>
              <FichaPersona k={persona} />
              <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginTop: 18 }}>
                <span className="label">y · lo que se quiere predecir</span>
                <span style={{ fontSize: 28, fontWeight: 600, color: ejemplo.y ? "var(--red-2)" : "var(--text)" }}>
                  {ejemplo.y ? "gana más de 50K" : "no gana más de 50K"}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 26, paddingTop: 44 }}>
              <div>
                <div style={{ fontSize: 44, fontWeight: 600, letterSpacing: "-0.02em" }}>{M.n.toLocaleString("es-MX")} personas</div>
                <div style={{ marginTop: 16 }}>
                  <BarraClases positivos={M.positivos} total={M.n} ancho={560} alto={22} />
                </div>
              </div>
              <p style={{ fontSize: 22, color: "var(--text-2)", lineHeight: 1.5, margin: 0 }}>
                Solo 1 de cada 4 gana más de 50K: las clases están <b style={{ color: "var(--text)" }}>desbalanceadas</b>.
              </p>
              <p style={{ fontSize: 22, color: "var(--text-2)", lineHeight: 1.5, margin: 0 }}>
                A {M.filas_con_faltantes.toLocaleString("es-MX")} personas les falta algún dato.
              </p>
              <p style={{ fontSize: 20, color: "var(--text-3)", lineHeight: 1.45, margin: 0 }}>
                Los datos incluyen sexo y raza. Aquí se usan tal cual para comparar modelos; en un sistema real habría que revisar que no
                discrimine.
              </p>
            </div>
          </motion.div>
        )}
        {step >= 6 && (
          <motion.div key="receta-adult" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} style={{ paddingTop: 10 }}>
            <Receta textos={RECETA_ADULT} resaltar={2} />
            <div style={{ marginTop: 60 }}>
              <div className="label" style={{ marginBottom: 14 }}>
                Los 5 pliegues reales · rojo = gana &gt; 50K
              </div>
              <PlieguesReales />
            </div>
            <Reveal step={step} at={7} style={{ marginTop: 40 }}>
              <p className="takeaway" style={{ margin: 0 }}>
                Un modelo se juzga con <em>datos que no vio</em>. Esta receta nos acompaña toda la exposición.
              </p>
            </Reveal>
          </motion.div>
        )}
      </AnimatePresence>
    </SlideFrame>
  );
}
