import { motion } from "motion/react";
import { useState } from "react";
import { Barras } from "../components/Barras";
import { OperacionAnimada } from "../components/OperacionAnimada";
import { Chips } from "../components/Piezas";
import { Reveal } from "../components/Reveal";
import { SeriesChart } from "../components/SeriesChart";
import { TeX } from "../components/TeX";
import { useFlechas } from "../deck/hooks";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { etiqueta, pasajeros } from "../lib/pasajeros";
import { ejeQueCubre } from "../lib/scale";
import { pesosCentrados, promedioMovil } from "../lib/series";

// ---------- Concepto: 9 valores de juguete = una subida de 1 por paso + un patrón (+3, −2, −1) que se repite cada 3 ----------
const PATRON = [3, -2, -1];
const JUGUETE = Array.from({ length: 9 }, (_, t) => 4 + t + PATRON[t % 3]);
const K_JUGUETE = PATRON.length;

// ---------- Caso ----------
const Y = pasajeros.valores;
const N = Y.length;
const EJE = ejeQueCubre(Y, 100);
const PERIODO = 12;
const VENTANAS = [3, 5, 7, PERIODO];
const nombreDe = (k: number) => (k % 2 ? String(k) : `2×${k}`);
const OPCIONES = VENTANAS.map((k) => ({ valor: k, texto: nombreDe(k) }));
const CENTRADO = Object.fromEntries(VENTANAS.map((k) => [k, promedioMovil(Y, k)])) as Record<number, number[]>;
const ATRASADO = promedioMovil(Y, PERIODO, "atrasado");
const MAX_PESOS = pesosCentrados(PERIODO).length;
const validos = (v: number[]) => v.flatMap((x, i) => (Number.isNaN(x) ? [] : [i]));
const V12 = validos(CENTRADO[PERIODO]);
const ZOOM: [number, number] = [N - 3 * PERIODO, N - 1];

/** Los pesos de la ventana, centrados en una tira del tamaño de la ventana más ancha. */
function tiraDePesos(k: number): (number | null)[] {
  const w = pesosCentrados(k);
  const hueco = (MAX_PESOS - w.length) / 2;
  return Array.from({ length: MAX_PESOS }, (_, j) => (j >= hueco && j < hueco + w.length ? w[j - hueco] : null));
}
const DESFASES = Array.from({ length: MAX_PESOS }, (_, j) => {
  const d = j - (MAX_PESOS - 1) / 2;
  return d === 0 ? "t" : d > 0 ? `+${d}` : String(d);
});

function Caja({ x, y, tex, punteada, rojo }: { x: number; y: number; tex: string; punteada?: boolean; rojo?: boolean }) {
  return (
    <div
      style={{
        position: "absolute",
        left: x - 46,
        top: y - 30,
        width: 92,
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 24,
        border: `1.5px ${punteada ? "dashed" : "solid"} ${rojo ? "var(--red)" : "var(--text-3)"}`,
        borderRadius: punteada ? 30 : 0,
        background: "var(--bg)",
      }}
    >
      <TeX>{tex}</TeX>
    </div>
  );
}

function Diagrama({ entradas, pesos, salida, punteada }: { entradas: string[]; pesos: string[]; salida: string; punteada?: boolean }) {
  const W = 760;
  const xs = [150, 380, 610];
  return (
    <div style={{ position: "relative", width: W, height: 230 }}>
      <svg width={W} height={230} style={{ position: "absolute", inset: 0 }}>
        {xs.map((x, i) => (
          <line key={i} x1={x} y1={62} x2={380 + (x - 380) * 0.18} y2={168} stroke="var(--text-3)" strokeWidth={1.5} />
        ))}
      </svg>
      {xs.map((x, i) => (
        <Caja key={i} x={x} y={36} tex={entradas[i]} punteada={punteada} />
      ))}
      {xs.map((x, i) => (
        <div key={i} style={{ position: "absolute", left: 380 + (x - 380) * 0.6 - 40, top: 98, width: 80, textAlign: "center", fontSize: 22, color: "var(--red-2)", background: "var(--bg)" }}>
          <TeX>{pesos[i]}</TeX>
        </div>
      ))}
      <Caja x={380} y={196} tex={salida} rojo />
    </div>
  );
}

export default function PromedioMovil({ step, active }: SlideProps) {
  const [k, setK] = useState(PERIODO);
  const mover = (d: number) => setK((v) => VENTANAS[Math.max(0, Math.min(VENTANAS.length - 1, VENTANAS.indexOf(v) + d))]);
  useFlechas(
    active && step === 1,
    () => mover(1),
    () => mover(-1),
  );
  const zoom = step === 2;
  const ventana = zoom ? PERIODO : k;
  const sinDato = (CENTRADO[ventana].length - validos(CENTRADO[ventana]).length) / 2;

  return (
    <SlideFrame
      section={["U8 · Datos secuenciales", "F. Fundamentos de series"]}
      num={38}
      caso={step === 1 || step === 2 ? "Pasajeros aéreos" : null}
      title="Promedio móvil como suavizado"
      lede="Cada punto se cambia por el promedio de sus vecinos: lo que sube y baja rápido se cancela; lo lento se queda."
    >
      {step === 0 && (
        <motion.div key="concepto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "grid", gridTemplateColumns: "600px 1fr", gap: 60 }}>
          <div>
            <div style={{ fontSize: 34 }}>
              <TeX>{"m_t = \\frac{1}{k}\\sum_{j=-h}^{h} x_{t+j}, \\qquad k = 2h + 1"}</TeX>
            </div>
            <p style={{ fontSize: 24, lineHeight: 1.42, color: "var(--text-2)", marginTop: 20 }}>Centrado: h vecinos antes, el punto, y h vecinos después.</p>
            <p style={{ fontSize: 24, lineHeight: 1.42, marginTop: 30 }}>
              Esta serie sube 1 en cada paso y además repite un patrón ({PATRON.map((v) => (v > 0 ? `+${v}` : v)).join(", ")}) cada {K_JUGUETE}. Con una ventana de{" "}
              {K_JUGUETE}, el patrón completo cabe dentro: <span style={{ color: "var(--red-2)" }}>se cancela y queda la recta.</span>
            </p>
          </div>
          <div>
            <span className="label">Esquema · no son datos</span>
            <div style={{ marginTop: 10 }}>
              <OperacionAnimada x={JUGUETE} op={{ tipo: "ventana", k: K_JUGUETE }} ancho={1030} alto={460} msPorPaso={600} />
            </div>
          </div>
        </motion.div>
      )}

      {(step === 1 || step === 2) && (
        <motion.div key="caso" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "grid", gridTemplateColumns: "1100px 1fr", gap: 50 }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: 46 }}>
              <span className="label">miles de pasajeros · en rojo, el promedio centrado{zoom ? " · gris punteado, el atrasado" : ""}</span>
              {!zoom && <Chips opciones={OPCIONES} valor={k} onChange={setK} />}
            </div>
            <SeriesChart
              ancho={1100}
              alto={zoom ? 430 : 370}
              ventana={zoom ? ZOOM : undefined}
              recortar
              y={zoom ? undefined : EJE.dominio}
              ticksY={zoom ? undefined : EJE.ticks}
              pasoY={100}
              series={[
                { id: "pasajeros", valores: Y, color: "var(--data-dim)", grosor: 2 },
                ...(zoom ? [{ id: "atrasado", valores: ATRASADO, color: "var(--data)", guion: "7 6", grosor: 2.5 }] : []),
                { id: "centrado", valores: CENTRADO[ventana], color: "var(--red)", grosor: 3 },
              ]}
              transicion={0.7}
            />
            {!zoom && (
              <Barras
                valores={tiraDePesos(k)}
                etiquetas={DESFASES}
                ancho={1100}
                alto={112}
                y={[0, 0.4]}
                pasoY={0.2}
                rotulo="peso de cada vecino en el promedio"
                fmtY={(v) => v.toFixed(1)}
                rojo={() => true}
                margen={{ l: 64, r: 22, t: 24, b: 30 }}
              />
            )}
          </div>
          <div style={{ fontSize: 23, lineHeight: 1.42, paddingTop: 50 }}>
            {!zoom && k % 2 === 1 && (
              <p style={{ margin: 0 }}>
                Promedia {k} meses: {(k - 1) / 2} antes, el mes y {(k - 1) / 2} después. La curva se alisa, pero la onda del año sigue ahí: la ventana no cubre el año
                entero.
              </p>
            )}
            {!zoom && k % 2 === 0 && (
              <>
                <p style={{ margin: 0 }}>
                  La ventana cubre un año completo: <span style={{ color: "var(--red-2)" }}>la estacionalidad se cancela y queda la tendencia.</span>
                </p>
                <p style={{ color: "var(--text-2)", marginTop: 16 }}>
                  {k} es par y no tiene centro. Se promedian dos ventanas de {k} seguidas: son {k + 1} meses, con medio peso en los extremos.
                </p>
                <div style={{ fontSize: 21, marginTop: 10 }}>
                  <TeX>{`m_t = \\tfrac{1}{${2 * k}}x_{t-${k / 2}} + \\tfrac{1}{${k}}\\textstyle\\sum_{j=-${k / 2 - 1}}^{${k / 2 - 1}} x_{t+j} + \\tfrac{1}{${2 * k}}x_{t+${k / 2}}`}</TeX>
                </div>
              </>
            )}
            {!zoom && (
              <p className="mono" style={{ fontSize: 19, color: "var(--text-3)", marginTop: 18 }}>
                sin promedio: {sinDato} {sinDato === 1 ? "mes" : "meses"} al inicio y {sinDato} al final · ↑ ↓ cambian la ventana
              </p>
            )}
            {zoom && (
              <>
                <p style={{ margin: 0 }}>
                  <b style={{ color: "var(--red-2)" }}>Centrado:</b> termina en {etiqueta(V12[V12.length - 1])}. Para seguir necesita {N - 1 - V12[V12.length - 1]} meses que
                  todavía no existen.
                </p>
                <p style={{ marginTop: 18 }}>
                  <b>Atrasado:</b> usa solo los últimos {PERIODO} meses y llega a {etiqueta(N - 1)}, pero va {(PERIODO - 1) / 2} meses detrás.
                </p>
                <div style={{ fontSize: 24, margin: "14px 0" }}>
                  <TeX>{`a_t = \\tfrac{1}{${PERIODO}}\\textstyle\\sum_{j=0}^{${PERIODO - 1}} x_{t-j}`}</TeX>
                </div>
                <p style={{ color: "var(--text-2)" }}>
                  El centrado sirve para describir. Para pronosticar no: usa el futuro, la misma trampa que la fuga de la diapositiva 30.
                </p>
              </>
            )}
          </div>
        </motion.div>
      )}

      {step >= 3 && (
        <motion.div key="cierre" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 600, marginBottom: 14 }}>Promedio móvil · suavizado</div>
              <Diagrama entradas={["x_{t-1}", "x_t", "x_{t+1}"]} pesos={["\\tfrac13", "\\tfrac13", "\\tfrac13"]} salida="m_t" />
              <ul style={{ fontSize: 23, lineHeight: 1.6, color: "var(--text-2)", margin: "14px 0 0", paddingLeft: 24 }}>
                <li>Promedia observaciones, que sí se ven.</li>
                <li>Se aplica: no hay nada que estimar.</li>
                <li>No pronostica.</li>
              </ul>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 600, marginBottom: 14 }}>
                MA(q) · modelo <span style={{ fontSize: 20, fontWeight: 400, color: "var(--text-3)" }}>(diapositiva 43)</span>
              </div>
              <Diagrama entradas={["\\varepsilon_{t-2}", "\\varepsilon_{t-1}", "\\varepsilon_t"]} pesos={["\\theta_2", "\\theta_1", "1"]} salida="x_t" punteada />
              <ul style={{ fontSize: 23, lineHeight: 1.6, color: "var(--text-2)", margin: "14px 0 0", paddingLeft: 24 }}>
                <li>Combina choques, que no se ven.</li>
                <li>Los pesos θ se estiman de los datos.</li>
                <li>Es un modelo: sirve para pronosticar.</li>
              </ul>
            </div>
          </div>
          <Reveal step={step} at={3} style={{ marginTop: 24 }}>
            <p className="takeaway" style={{ margin: 0 }}>
              Mismo nombre, otra cosa: el suavizado promedia lo que vemos; <em>MA(q) combina choques que no vemos.</em>
            </p>
          </Reveal>
        </motion.div>
      )}
    </SlideFrame>
  );
}
