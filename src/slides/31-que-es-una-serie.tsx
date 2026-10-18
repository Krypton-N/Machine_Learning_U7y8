import { motion } from "motion/react";
import { useState } from "react";
import { CalendarGrid } from "../components/CalendarGrid";
import { Def } from "../components/Piezas";
import { Reveal } from "../components/Reveal";
import { TeX } from "../components/TeX";
import { useFlechas } from "../deck/hooks";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { ANIOS, ANIO_INICIAL, MESES, etiqueta, pasajeros } from "../lib/pasajeros";
import { linear } from "../lib/scale";

// ---------- Concepto: una serie corta de esquema, "hoy" y lo que falta por llegar ----------
const ESQUEMA = [3, 4, 3.4, 5, 5.8, 5.2, 6.6, 7.1];
const HORIZONTE = 3;

function EsquemaSerie() {
  const W = 820;
  const H = 290;
  const T = ESQUEMA.length;
  const fx = linear([1, T + HORIZONTE], [50, W - 50]);
  const fy = linear([2, 9], [H - 56, 24]);
  const d = ESQUEMA.map((v, i) => `${i ? "L" : "M"}${fx(i + 1)},${fy(v)}`).join("");
  return (
    <svg width={W} height={H} style={{ display: "block", overflow: "visible" }}>
      <line x1={30} x2={W - 20} y1={H - 56} y2={H - 56} stroke="var(--line-2)" />
      <motion.path d={d} fill="none" stroke="var(--data)" strokeWidth={2.5} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }} />
      {ESQUEMA.map((v, i) => (
        <g key={i}>
          <motion.circle cx={fx(i + 1)} cy={fy(v)} r={7} fill="var(--data)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.12 }} />
          <text x={fx(i + 1)} y={H - 28} textAnchor="middle" className="mono" fontSize={20} fill="var(--text-3)">
            {i + 1}
          </text>
        </g>
      ))}
      <line x1={fx(T) + 26} x2={fx(T) + 26} y1={10} y2={H - 56} stroke="var(--red)" strokeDasharray="5 6" />
      <text x={fx(T) + 20} y={22} textAnchor="end" className="mono" fontSize={20} fill="var(--red-2)">
        hoy · T = {T}
      </text>
      {Array.from({ length: HORIZONTE }, (_, h) => (
        <motion.g key={h} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 + h * 0.2 }}>
          <rect x={fx(T + h + 1) - 22} y={fy(8.6)} width={44} height={fy(4.4) - fy(8.6)} fill="none" stroke="var(--red-line)" strokeDasharray="4 5" />
          <text x={fx(T + h + 1)} y={fy(6.3)} textAnchor="middle" fontSize={30} fill="var(--red-2)">
            ?
          </text>
          <text x={fx(T + h + 1)} y={H - 28} textAnchor="middle" className="mono" fontSize={20} fill="var(--red-2)">
            {T + h + 1}
          </text>
        </motion.g>
      ))}
      <text x={W - 20} y={H - 4} textAnchor="end" className="mono" fontSize={20} fill="var(--text-3)">
        t (el lugar de cada medición) · h = {HORIZONTE} pasos adelante
      </text>
    </svg>
  );
}

// ---------- Caso ----------
const Y = pasajeros.valores;
const I_MIN = Y.indexOf(Math.min(...Y));
const I_MAX = Y.indexOf(Math.max(...Y));
const CURSOR_INICIAL = 12 * (1955 - ANIO_INICIAL) + 6; // julio de 1955

export default function QueEsUnaSerie({ step, active }: SlideProps) {
  const [cursor, setCursor] = useState(CURSOR_INICIAL);
  useFlechas(
    active && step === 3,
    () => setCursor((c) => Math.min(Y.length - 1, c + 1)),
    () => setCursor((c) => Math.max(0, c - 1)),
  );
  return (
    <SlideFrame
      section={["U8 · Datos secuenciales", "F. Fundamentos de series"]}
      num={31}
      caso={step >= 1 ? "Pasajeros aéreos" : null}
      title="¿Qué es una serie de tiempo?"
      lede="Una sola variable, vista a lo largo del tiempo. El lugar de cada medición es parte del dato."
    >
      {step === 0 && (
        <motion.div key="concepto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "grid", gridTemplateColumns: "760px 1fr", gap: 70 }}>
          <div>
            <p style={{ fontSize: 27, lineHeight: 1.4, margin: 0 }}>
              Mediciones de <b>una misma variable</b>, ordenadas en el tiempo y, normalmente, tomadas a intervalos regulares:{" "}
              <TeX>{"y_1,\\, y_2,\\, \\dots,\\, y_T"}</TeX>
            </p>
            <div style={{ display: "grid", gap: 20, marginTop: 28 }}>
              <Def termino="Índice t">El lugar de la medición: la primera, la segunda… El dato es el par (t, y).</Def>
              <Def termino="Frecuencia">Cada cuánto se mide: cada hora, cada día, cada mes.</Def>
              <Def termino="Horizonte h">Cuántos pasos adelante se quiere pronosticar.</Def>
            </div>
          </div>
          <div>
            <span className="label">Esquema</span>
            <EsquemaSerie />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30, marginTop: 20, fontSize: 26, lineHeight: 1.4 }}>
              <div style={{ borderTop: "1px solid var(--line-2)", paddingTop: 10, color: "var(--text-2)" }}>
                <b style={{ color: "var(--text)" }}>Tabla (Adult):</b> cada fila es una persona. Se pueden barajar.
              </div>
              <div style={{ borderTop: "1px solid var(--red)", paddingTop: 10, color: "var(--text-2)" }}>
                <b style={{ color: "var(--text)" }}>Serie:</b> cada fila es un momento. El orden es dato.
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {step >= 1 && (
        <motion.div key="caso" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: "relative" }}>
          <CalendarGrid
            matriz={pasajeros.matriz}
            ancho={1696}
            anchoTabla={1040}
            alto={500}
            fase={step >= 2 ? "serie" : "tabla"}
            etiquetasFilas={ANIOS.map(String)}
            etiquetasCols={MESES}
            cursor={step >= 3 ? cursor : undefined}
            futuro={step >= 3 ? 12 : 0}
            rotuloFuturo={`${ANIOS[ANIOS.length - 1] + 1} ?`}
          />
          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} style={{ position: "absolute", left: 1110, top: 40, width: 560 }}>
              <p style={{ fontSize: 26, lineHeight: 1.42, margin: 0 }}>
                La columna <span className="mono" style={{ color: "var(--red-2)" }}>value</span> de la diapositiva 29, acomodada en renglones de 12: un renglón por año
                y una columna por mes. Así viene impresa en el libro.
              </p>
              <p className="label" style={{ marginTop: 22, lineHeight: 1.6 }}>
                {pasajeros.fuente.split(" (")[0]} · {pasajeros.unidades} por mes
              </p>
            </motion.div>
          )}
          {step === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} style={{ display: "flex", alignItems: "baseline", gap: 50, marginTop: 20, fontSize: 26 }}>
              <span>
                La serie es esa tabla leída renglón por renglón: {Y.length} meses en fila.
              </span>
              <TeX>{`t = 12\\,(\\text{año} - ${ANIO_INICIAL}) + \\text{mes}`}</TeX>
            </motion.div>
          )}
          {step >= 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span className="mono" style={{ fontSize: 30, color: "var(--red-2)" }}>
                  t = {cursor + 1} · {etiqueta(cursor)} · {Y[cursor]} mil
                </span>
                <span className="mono" style={{ fontSize: 20, color: "var(--text-3)" }}>
                  T = {Y.length} · 12 mediciones por año · mínimo {Y[I_MIN]} ({etiqueta(I_MIN)}) · máximo {Y[I_MAX]} ({etiqueta(I_MAX)}) · ↑ ↓ mueven el cursor
                </span>
              </div>
              <Reveal step={step} at={3} style={{ marginTop: 16 }}>
                <p className="takeaway" style={{ margin: 0, fontSize: 28 }}>
                  El dato es el par (t, y). <em>Pronosticar</em> es estimar lo que sigue usando solo lo que ya pasó.
                </p>
              </Reveal>
            </motion.div>
          )}
        </motion.div>
      )}
    </SlideFrame>
  );
}
