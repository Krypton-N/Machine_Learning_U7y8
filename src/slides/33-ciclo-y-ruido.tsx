import { motion } from "motion/react";
import { CalendarGrid } from "../components/CalendarGrid";
import { Def } from "../components/Piezas";
import { Reveal } from "../components/Reveal";
import { SeriesChart } from "../components/SeriesChart";
import { TeX } from "../components/TeX";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { media } from "../lib/metricas";
import { ANIOS, MESES, pasajeros } from "../lib/pasajeros";
import { gaussian, mulberry32 } from "../lib/rng";
import { porPeriodo } from "../lib/series";

// ---------- Concepto: una serie estacional y una cíclica, de esquema ----------
const PERIODO = 12;
const VUELTAS = 6;
const ESTACIONAL = Array.from({ length: PERIODO * VUELTAS }, (_, t) => Math.sin((2 * Math.PI * (t - 1)) / PERIODO));
// La cíclica también sube y baja, pero cada vuelta dura distinto (las duraciones suman lo mismo que la otra serie).
const DURACIONES = [14, 21, 10, 17, 10];
const CICLICA = DURACIONES.flatMap((d) => Array.from({ length: d }, (_, j) => Math.sin((2 * Math.PI * (j - 1)) / d)));

/** Posición del valor más alto de cada vuelta; las vueltas se separan donde la serie cruza hacia arriba. */
function picos(x: number[]): number[] {
  const out: number[] = [];
  let mejor = -1;
  x.forEach((v, t) => {
    if (v > 0 && (mejor < 0 || v > x[mejor])) mejor = t;
    if (v <= 0 && mejor >= 0) {
      out.push(mejor);
      mejor = -1;
    }
  });
  if (mejor >= 0) out.push(mejor);
  return out;
}
const distancias = (p: number[]) => p.slice(1).map((v, i) => v - p[i]);
const aCelda = (p: number[]): [number, number][] => p.map((t) => [Math.floor(t / PERIODO), t % PERIODO]);
const P_EST = picos(ESTACIONAL);
const P_CIC = picos(CICLICA);
const COLUMNAS = Array.from({ length: PERIODO }, (_, i) => String(i + 1));

function Plegable({ titulo, serie, pico, doblada }: { titulo: string; serie: number[]; pico: number[]; doblada: boolean }) {
  const columnas = new Set(pico.map((t) => t % PERIODO)).size;
  return (
    <div>
      <div style={{ fontSize: 26 }}>{titulo}</div>
      <CalendarGrid matriz={porPeriodo(serie, PERIODO)} ancho={810} alto={320} modo="puntos" fase={doblada ? "tabla" : "serie"} resaltar={aCelda(pico)} etiquetasCols={COLUMNAS} formato={(v) => v.toFixed(0)} />
      <div className="mono" style={{ fontSize: 20, color: "var(--text-2)", marginTop: 6 }}>
        {doblada ? (
          <>
            los picos caen en <span style={{ color: "var(--red-2)" }}>{columnas === 1 ? "una sola columna" : `${columnas} columnas distintas`}</span>
          </>
        ) : (
          <>
            pasos entre un pico y el siguiente: <span style={{ color: "var(--red-2)" }}>{distancias(pico).join(", ")}</span>
          </>
        )}
      </div>
    </div>
  );
}

// ---------- Caso: cuánto queda cada mes por arriba o por abajo de la media de su año ----------
const M = pasajeros.matriz;
const DESVIO = M.map((fila) => fila.map((v) => (v / media(fila) - 1) * 100));
const MAX_DESVIO = Math.max(...DESVIO.flat().map(Math.abs));
const PICOS_REALES: [number, number][] = M.flatMap((fila, a) => fila.flatMap((v, mes): [number, number][] => (v === Math.max(...fila) ? [[a, mes]] : [])));
const MESES_PICO = [...new Set(PICOS_REALES.map((p) => p[1]))].sort((a, b) => a - b);
// Meses que quedan por arriba de la media de su año en todos los años.
const SIEMPRE_ARRIBA = MESES.filter((_, mes) => DESVIO.every((fila) => fila[mes] > 0));

const RUIDO = (() => {
  const r = mulberry32(33);
  return Array.from({ length: 80 }, () => gaussian(r));
})();

export default function CicloYRuido({ step }: SlideProps) {
  return (
    <SlideFrame
      section={["U8 · Datos secuenciales", "F. Fundamentos de series"]}
      num={33}
      caso={step === 2 ? "Pasajeros aéreos" : null}
      title="Ciclo, estacionalidad y ruido"
      lede="No todo lo que sube y baja es estacionalidad: lo que la distingue es que se repite con el calendario."
    >
      {step <= 1 && (
        <motion.div key="concepto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 44 }}>
            <Def termino="Estacionalidad">Se repite cada periodo fijo y conocido: cada 12 meses, cada 7 días.</Def>
            <Def termino="Ciclo">Sube y baja, pero cada vuelta dura distinto (por lo común, más de dos años).</Def>
            <Def termino="Ruido">Lo que queda cuando se quitó todo lo que tiene patrón.</Def>
          </div>
          <div className="label" style={{ marginTop: 26 }}>
            Esquema · no son datos {step === 1 && "· cada serie, doblada en renglones de 12"}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 76, marginTop: 10 }}>
            <Plegable titulo="A · estacional" serie={ESTACIONAL} pico={P_EST} doblada={step === 1} />
            <Plegable titulo="B · cíclica" serie={CICLICA} pico={P_CIC} doblada={step === 1} />
          </div>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div key="caso" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "grid", gridTemplateColumns: "1080px 1fr", gap: 60 }}>
          <div>
            <span className="label">porcentaje por arriba (rojo) o por abajo (gris) de la media de su año</span>
            <div style={{ marginTop: 8 }}>
              <CalendarGrid
                matriz={DESVIO}
                ancho={1080}
                alto={520}
                modo="calor"
                intensidad={(f, c) => DESVIO[f][c] / MAX_DESVIO}
                resaltar={PICOS_REALES}
                etiquetasFilas={ANIOS.map(String)}
                etiquetasCols={MESES}
                formato={(v) => `${v > 0 ? "+" : ""}${v.toFixed(0)}`}
                tamano={20}
              />
            </div>
          </div>
          <div style={{ paddingTop: 34 }}>
            <p style={{ fontSize: 26, lineHeight: 1.42, margin: 0 }}>
              Los picos (con contorno) forman una franja vertical en {MESES_PICO.map((i) => MESES[i]).join(" y ")}. Y {SIEMPRE_ARRIBA.join(", ")} quedan por arriba de
              la media de su año los {ANIOS.length} años: <span style={{ color: "var(--red-2)" }}>eso es estacionalidad.</span>
            </p>
            <p style={{ fontSize: 26, lineHeight: 1.42, color: "var(--text-2)", marginTop: 26 }}>
              ¿Y un ciclo? Con {ANIOS.length} años no se puede distinguir de la tendencia. Por eso los métodos clásicos los estiman juntos, como una sola
              «tendencia-ciclo».
            </p>
            <p style={{ fontSize: 26, color: "var(--text-3)", marginTop: 26 }}>Esta tabla solo describe: todavía no separa nada.</p>
          </div>
        </motion.div>
      )}

      {step >= 3 && (
        <motion.div key="cierre" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "700px 1fr", gap: 70, alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 44 }}>
                <TeX>{"y_t = T_t + S_t + R_t"}</TeX>
              </div>
              <div style={{ fontSize: 26, color: "var(--text-2)", lineHeight: 1.5, marginTop: 20 }}>
                T: tendencia (incluye al ciclo) · S: estacionalidad · R: ruido.
                <br />O un producto en lugar de una suma: se decide en la 34.
              </div>
            </div>
            <div>
              <span className="label">Esquema · ruido simulado</span>
              <SeriesChart ancho={900} alto={210} series={[{ id: "ruido", valores: RUIDO, color: "var(--data)", grosor: 2 }]} y={[-3, 3]} ticksY={[-3, 0, 3]} sinMarcasX lineasH={[{ y: 0 }]} />
              <p style={{ fontSize: 26, color: "var(--text-2)", lineHeight: 1.4, margin: "8px 0 0" }}>
                Si el ruido de verdad no tiene patrón, lo mejor que se puede pronosticar de él es su promedio. La 41 lo define con cuidado.
              </p>
            </div>
          </div>
          <Reveal step={step} at={3} style={{ marginTop: 44 }}>
            <p className="takeaway" style={{ margin: 0 }}>
              Estacionalidad: el pico cae siempre en la misma columna del calendario. Ciclo: ninguna columna funciona. <em>Ruido: lo que sobra.</em>
            </p>
          </Reveal>
        </motion.div>
      )}
    </SlideFrame>
  );
}
