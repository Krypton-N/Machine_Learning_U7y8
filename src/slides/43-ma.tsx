import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Barras } from "../components/Barras";
import { Correlogram } from "../components/Correlogram";
import { Boton, Chips } from "../components/Piezas";
import { Entra } from "../components/Reveal";
import { SeriesChart } from "../components/SeriesChart";
import { TeX } from "../components/TeX";
import { useFlechas } from "../deck/hooks";
import { SlideFrame } from "../deck/SlideFrame";
import { R } from "../deck/tipografia";
import type { SlideProps } from "../deck/types";
import { media } from "../lib/metricas";
import { etiqueta, modelos, pasajeros, TRANSFORMACIONES_ENT } from "../lib/pasajeros";
import { linear } from "../lib/scale";
import { acf, acfTeorica, filtroMA1, pesosPsi } from "../lib/series";
import { CHOQUES } from "./choquesG";

// ---------- Concepto: la cinta de choques ----------
const N_CINTA = 24;
const EPS = CHOQUES.slice(0, N_CINTA);
const THETAS = [0.8, -0.6] as const;
const ECO = 0.6;
const K_ECO = 10;

function CintaChoques({ theta, t }: { theta: number; t: number }) {
  const ancho = 1040;
  const m = { l: 56, r: 12 };
  const paso = (ancho - m.l - m.r) / N_CINTA;
  const x = (i: number) => m.l + i * paso;
  const valores = EPS.map((e, i) => e + theta * (i ? EPS[i - 1] : 0));
  const tope = Math.ceil(Math.max(...valores.map(Math.abs), ...EPS.map(Math.abs)));
  const arriba = linear([-tope, tope], [250, 30]);
  const abajo = linear([-tope, tope], [450, 310]);
  const w = paso * 0.6;
  return (
    <svg width={ancho} height={470} style={{ display: "block", overflow: "visible" }}>
      <text x={m.l} y={R} className="mono" fontSize={R} fill="var(--text-2)">
        lo que se observa: <tspan fill="var(--data)">choque de hoy</tspan> + <tspan fill="var(--red-2)">θ × choque de ayer</tspan> = raya blanca
      </text>
      <text x={m.l} y={296} className="mono" fontSize={R} fill="var(--text-2)">
        los choques (en la realidad no se ven)
      </text>
      <line x1={m.l} x2={ancho - m.r} y1={arriba(0)} y2={arriba(0)} stroke="var(--line-2)" />
      <line x1={m.l} x2={ancho - m.r} y1={abajo(0)} y2={abajo(0)} stroke="var(--line-2)" />
      {EPS.map((e, i) => {
        if (i > t) return null;
        const cx = x(i) + (paso - w) / 2;
        const sube = i ? theta * EPS[i - 1] : 0;
        return (
          <g key={i}>
            <motion.rect x={cx} width={w} fill="var(--data)" initial={false} animate={{ y: Math.min(arriba(e), arriba(0)), height: Math.abs(arriba(e) - arriba(0)) }} transition={{ duration: 0.35 }} />
            <motion.rect
              x={cx + w * 0.2}
              width={w * 0.6}
              fill="var(--red)"
              opacity={0.9}
              initial={false}
              animate={{ y: Math.min(arriba(e), arriba(e + sube)), height: Math.abs(arriba(e + sube) - arriba(e)) }}
              transition={{ duration: 0.35 }}
            />
            <motion.line x1={cx - 3} x2={cx + w + 3} stroke="var(--text)" strokeWidth={3} initial={false} animate={{ y1: arriba(valores[i]), y2: arriba(valores[i]) }} transition={{ duration: 0.35 }} />
          </g>
        );
      })}
      {EPS.map((e, i) => {
        const cx = x(i) + paso / 2;
        const color = i === t ? "var(--text)" : i === t - 1 ? "var(--red)" : "var(--text-3)";
        return (
          <g key={`c${i}`}>
            <line x1={cx} x2={cx} y1={abajo(0)} y2={abajo(e)} stroke={color} strokeWidth={i === t || i === t - 1 ? 3 : 2} />
            <circle cx={cx} cy={abajo(e)} r={4} fill={color} />
          </g>
        );
      })}
      <motion.rect y={30} height={438} width={2 * paso} fill="none" stroke="var(--red)" strokeWidth={2} initial={false} animate={{ x: x(Math.max(0, t - 1)) }} transition={{ duration: 0.3 }} />
    </svg>
  );
}

// ---------- Caso: MA(1) sobre ∇∇₁₂ log ----------
const N = pasajeros.nEntrenamiento;
const W = TRANSFORMACIONES_ENT.dd12log;
const w = W.valores;
const THETA = modelos.ma1.theta;
const FILTRO = filtroMA1(w, THETA);
/** Qué parte de la variación de w explica la predicción a un paso. */
const EXPLICA = 1 - FILTRO.choques.reduce((s, e) => s + e * e, 0) / w.reduce((s, v) => s + (v - media(w)) ** 2, 0);
/** Pronóstico de 1960: el primer mes, θ̂ por el último error; después ya no queda memoria y se pronostica la media, 0. */
const PRONOSTICO = [THETA * FILTRO.choques[w.length - 1], ...new Array(11).fill(0)];
const K_CASO = 11;
const ACF_W = acf(w, K_CASO);
const ACF_TEO = acfTeorica([], [THETA], K_CASO);
const PRUEBA = { desde: N - 0.5, hasta: N + 11, texto: "PRUEBA · 1960", color: "var(--line)" };
const f2 = (v: number) => v.toFixed(2).replace("-", "−");
const f3 = (v: number) => v.toFixed(3).replace("-", "−");
const TXT = { fontSize: 26, lineHeight: 1.42, margin: 0 } as const;
const ROJO = { color: "var(--red-2)" };
const NO_CONFUNDIR = [
  ["¿Qué promedia?", "lo que se observa", "choques que no se ven"],
  ["¿Usa el futuro?", "sí, si es centrado", "no"],
  ["¿Para qué sirve?", "describir la tendencia", "pronosticar"],
  ["¿Sus pesos?", "fijos (1/12, …)", "se estiman (θ)"],
];

// Un clic, una idea: 0 la cinta; 1 los dos ecos; 2 "no confundir"; 3–5 el caso; 6 el cierre.
export default function MA({ step, active }: SlideProps) {
  const [theta, setTheta] = useState<(typeof THETAS)[number]>(0.8);
  const [t, setT] = useState(4);
  const [j, setJ] = useState(60);
  useEffect(() => {
    if (step === 0) setT(4);
    if (step === 3) setJ(60);
  }, [step]);
  useFlechas(
    active && (step === 0 || step === 3 || step === 4),
    () => (step === 0 ? setT((v) => Math.max(1, v - 1)) : setJ((v) => Math.max(1, v - 1))),
    () => (step === 0 ? setT((v) => Math.min(N_CINTA - 1, v + 1)) : setJ((v) => Math.min(w.length - 1, v + 1))),
  );
  const caso = step >= 3;
  const xt = EPS[t] + theta * EPS[t - 1];

  return (
    <SlideFrame
      section={["U8 · Datos secuenciales", "G. Modelos de series"]}
      num={43}
      caso={caso ? "Pasajeros aéreos" : null}
      title="MA(q): el eco de los errores recientes"
      lede="Un modelo de promedio móvil explica el valor de hoy con los choques de los últimos q periodos. Su memoria se corta de golpe."
    >
      {step === 0 && (
        <Entra style={{ display: "grid", gridTemplateColumns: "1040px 1fr", gap: 64 }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span className="label">Esquema · 24 de los mismos choques · ↑ ↓</span>
              <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                <Chips opciones={THETAS.map((v) => ({ valor: v, texto: `θ = ${v}` }))} valor={theta} onChange={setTheta} />
                <Boton onClick={() => setT(N_CINTA - 1)}>ver todo</Boton>
              </div>
            </div>
            <CintaChoques theta={theta} t={t} />
          </div>
          <div>
            <p style={TXT}>
              Hoy = el choque de hoy <span style={ROJO}>+ θ veces el choque de ayer</span>.
            </p>
            <div style={{ fontSize: 30, margin: "18px 0" }}>
              <TeX>{"x_t = \\mu + \\varepsilon_t + \\theta\\, \\varepsilon_{t-1}"}</TeX>
            </div>
            <p style={TXT}>Con los q choques anteriores, MA(q):</p>
            <div style={{ fontSize: 28, margin: "14px 0 26px" }}>
              <TeX>{"x_t = \\mu + \\varepsilon_t + \\theta_1 \\varepsilon_{t-1} + \\dots + \\theta_q \\varepsilon_{t-q}"}</TeX>
            </div>
            <p className="mono" style={{ fontSize: 22, color: "var(--text-2)", margin: 0, lineHeight: 1.5 }}>
              t = {t + 1}: {f2(EPS[t])} + ({theta}) × {f2(EPS[t - 1])}
              <br />= <span style={{ color: "var(--text)" }}>{f2(xt)}</span>
            </p>
          </div>
        </Entra>
      )}

      {step === 1 && (
        <Entra>
          <span className="label natural">ESQUEMA · TEÓRICO: CUÁNTO QUEDA DE UN CHOQUE k PASOS DESPUÉS</span>
          <div style={{ display: "grid", gridTemplateColumns: "820px 820px", gap: 56, marginTop: 10 }}>
            <Barras
              valores={pesosPsi([ECO], [], K_ECO)}
              etiquetas={Array.from({ length: K_ECO + 1 }, (_, k) => String(k))}
              ancho={820}
              alto={340}
              y={[0, 1]}
              pasoY={0.5}
              fmtY={(v) => v.toFixed(1)}
              rotulo={`AR(1), φ = ${ECO}: se apaga poco a poco`}
            />
            <Barras
              valores={pesosPsi([], [ECO], K_ECO)}
              etiquetas={Array.from({ length: K_ECO + 1 }, (_, k) => String(k))}
              ancho={820}
              alto={340}
              y={[0, 1]}
              pasoY={0.5}
              fmtY={(v) => v.toFixed(1)}
              rotulo={`MA(1), θ = ${ECO}: dos barras y después, cero`}
              rojo={(k) => k <= 1}
            />
          </div>
          <p style={{ ...TXT, marginTop: 26 }}>
            En un MA(q), un choque dura <span style={ROJO}>q + 1 periodos</span> y desaparece. En un AR nunca desaparece del todo.
          </p>
        </Entra>
      )}

      {step === 2 && (
        <Entra style={{ maxWidth: 1300 }}>
          <span className="label">No confundir</span>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 28, marginTop: 14 }}>
            <thead>
              <tr style={{ color: "var(--text-3)", textAlign: "left" }}>
                <th style={{ padding: "12px 14px", fontWeight: 400 }} />
                <th style={{ padding: "12px 14px", fontWeight: 400 }}>Promedio móvil (38)</th>
                <th style={{ padding: "12px 14px", fontWeight: 400, color: "var(--red-2)" }}>MA(q), este modelo</th>
              </tr>
            </thead>
            <tbody>
              {NO_CONFUNDIR.map((f) => (
                <tr key={f[0]} style={{ borderTop: "1px solid var(--line)" }}>
                  <td style={{ padding: "14px", color: "var(--text-2)" }}>{f[0]}</td>
                  <td style={{ padding: "14px" }}>{f[1]}</td>
                  <td style={{ padding: "14px" }}>{f[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ ...TXT, marginTop: 24, color: "var(--text-2)" }}>Mismo nombre, otra cosa.</p>
        </Entra>
      )}

      {(step === 3 || step === 4) && (
        <div>
          <span className="label">∇∇₁₂ log (logaritmo sin tendencia ni estación) y la predicción a un paso del MA(1) · ↑ ↓ mueven el cursor</span>
          <SeriesChart
            ancho={1696}
            alto={330}
            series={[
              { id: "w", valores: w, desde: W.desde, grosor: 1.8 },
              { id: "pred", valores: FILTRO.prediccion, desde: W.desde, color: "var(--red)", grosor: 2.2 },
              ...(step === 4 ? [{ id: "pron", valores: PRONOSTICO, desde: N, color: "var(--red)", grosor: 3, puntos: true }] : []),
            ]}
            ventana={[W.desde, N + 11]}
            bandas={[PRUEBA]}
            cursor={W.desde + j}
            fmtY={(v) => v.toFixed(2)}
            pasoY={0.1}
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 640px", gap: 64, marginTop: 14 }}>
            {step === 3 ? (
              <Entra>
                <p style={TXT}>
                  θ̂ = <span className="mono" style={ROJO}>{f2(THETA)}</span>, estimado con statsmodels. Si el mes pasado quedó arriba de lo esperado, este mes se espera una
                  corrección hacia abajo.
                </p>
              </Entra>
            ) : (
              <Entra>
                <p style={TXT}>
                  Esa predicción explica el <span style={ROJO}>{Math.round(EXPLICA * 100)} %</span> de la variación; el resto es choque nuevo. Para 1960 corrige un mes (
                  {f3(PRONOSTICO[0])}) y después se queda en 0: ya no le queda memoria.
                </p>
              </Entra>
            )}
            <p className="mono" style={{ fontSize: 22, margin: 0, color: "var(--text-2)", lineHeight: 1.5 }}>
              {etiqueta(W.desde + j)}: error del mes anterior {f3(FILTRO.choques[j - 1])}
              <br />→ predicción θ̂ × error = <span style={{ color: "var(--red-2)" }}>{f3(FILTRO.prediccion[j])}</span>
              <br />real {f3(w[j])}
            </p>
          </div>
        </div>
      )}

      {step >= 5 && (
        <div style={{ display: "grid", gridTemplateColumns: "1040px 1fr", gap: 64 }}>
          <Correlogram
            valores={ACF_W}
            n={w.length}
            ancho={1040}
            alto={440}
            cada={1}
            titulo="ACF de ∇∇₁₂ log · guiones: la del MA(1) ajustado"
            rotular={[1, 3]}
            y={[-0.5, 0.5]}
            teorica={[{ id: "ma1", valores: ACF_TEO, color: "var(--text)" }]}
          />
          {step === 5 ? (
            <Entra style={{ paddingTop: 40 }}>
              <p style={TXT}>
                La teoría del MA(1) dice <span className="mono">ρ₁ = {f2(ACF_TEO[1])}</span>; los datos, <span className="mono">r₁ = {f2(ACF_W[1])}</span>.
              </p>
              <p style={{ ...TXT, marginTop: 18 }}>
                Del 2 en adelante la teoría dice 0. En los datos sale además el 3 ({f2(ACF_W[3])}).
              </p>
            </Entra>
          ) : (
            <Entra style={{ paddingTop: 40 }}>
              <p className="takeaway" style={{ margin: 0 }}>
                Un MA recuerda choques, no valores, y solo los últimos q. <em>Su huella: una ACF que se corta.</em>
              </p>
            </Entra>
          )}
        </div>
      )}
    </SlideFrame>
  );
}
