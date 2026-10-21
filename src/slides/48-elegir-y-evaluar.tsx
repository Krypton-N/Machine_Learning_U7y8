import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { AicGrid } from "../components/AicGrid";
import { Correlogram, fueraDeBanda } from "../components/Correlogram";
import { Chips } from "../components/Piezas";
import { PValueScale, formatoP } from "../components/PValueScale";
import { Recap } from "../components/Recap";
import { Entra } from "../components/Reveal";
import { TeX } from "../components/TeX";
import { SlideFrame } from "../deck/SlideFrame";
import { R } from "../deck/tipografia";
import type { SlideProps } from "../deck/types";
import { enMiles, MESES, modelos, prueba } from "../lib/pasajeros";
import { linear } from "../lib/scale";
import { acf, ljungBox, mae, mape, rmse } from "../lib/series";

// ---------- Una tira de errores: real − pronóstico, mes por mes ----------
function TiraErrores({ real, pron, etiquetas, ancho, alto }: { real: number[]; pron: number[]; etiquetas: string[]; ancho: number; alto: number }) {
  const e = real.map((v, i) => v - pron[i]);
  const tope = Math.max(...e.map(Math.abs)) * 1.25;
  const m = { l: 8, r: 8, t: R + 10, b: R + 14 };
  const y = linear([-tope, tope], [alto - m.b, m.t]);
  const paso = (ancho - m.l - m.r) / e.length;
  const mayor = e.map(Math.abs).indexOf(Math.max(...e.map(Math.abs)));
  return (
    <svg width={ancho} height={alto} style={{ display: "block", overflow: "visible" }}>
      <line x1={m.l} x2={ancho - m.r} y1={y(0)} y2={y(0)} stroke="var(--line-2)" />
      {e.map((v, i) => {
        const cx = m.l + i * paso + paso / 2;
        const w = paso * 0.56;
        return (
          <g key={i}>
            <motion.rect x={cx - w / 2} width={w} fill={i === mayor ? "var(--red)" : "var(--data)"} initial={{ height: 0, y: y(0) }} animate={{ y: Math.min(y(v), y(0)), height: Math.abs(y(v) - y(0)) }} transition={{ duration: 0.5, delay: i * 0.03 }} />
            <text x={cx} y={v >= 0 ? y(v) - 7 : y(v) + R + 2} textAnchor="middle" className="mono" fontSize={R} fill={i === mayor ? "var(--red-2)" : "var(--text-2)"}>
              {Math.round(v)}
            </text>
            <text x={cx} y={alto - 4} textAnchor="middle" className="mono" fontSize={R} fill="var(--text-3)">
              {etiquetas[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ---------- Las tres preguntas: una línea arriba que dice en cuál vamos ----------
const PREGUNTAS = ["¿Qué órdenes?", "¿Pronostica bien?", "¿Dejó algo sin explicar?"];

function Preguntas({ activa }: { activa: number | null }) {
  return (
    <div style={{ display: "flex", gap: 48, borderBottom: "1px solid var(--line-2)", paddingBottom: 12, marginBottom: 26 }}>
      {PREGUNTAS.map((p, i) => (
        <span key={p} style={{ fontSize: 26, fontWeight: 600, color: activa === null || activa === i ? "var(--text)" : "var(--text-3)", transition: "color 0.3s" }}>
          <span className="mono" style={{ color: "var(--red)", marginRight: 12 }}>
            {i + 1}
          </span>
          {p}
        </span>
      ))}
    </div>
  );
}

// ---------- Datos ----------
// Esquema de 4 meses (valores fijos, no son datos).
const ESQ_REAL = [100, 120, 110, 130];
const ESQ_PRON = [104, 114, 112, 110];
const E = modelos.elegido;
const PRON = enMiles(E.pronostico_log);
const REJILLA = modelos.sarima_rejilla;
const esAerolinea = (m: { orden: number[]; estacional: number[] }) => m.orden.join() === "0,1,1" && m.estacional.join() === "0,1,1,12";
const POR_AIC = [...REJILLA].sort((a, b) => a.aic - b.aic);
const EMPATADOS = REJILLA.filter((m) => m.aic - POR_AIC[0].aic < 2).length;
const SEGUNDO = POR_AIC[1];
const MAE_ELEGIDO = mae(prueba, PRON);
const MEJORES_EN_1960 = REJILLA.filter((m) => !esAerolinea(m)).map((m) => mae(prueba, enMiles(m.pronostico_log))).filter((v) => v < MAE_ELEGIDO);
const RES = E.residuos;
const ACF_RES = acf(RES, 24);
const FUERA_RES = fueraDeBanda(ACF_RES, RES.length);
const LB12 = ljungBox(RES, 12, 2);
const LB24 = ljungBox(RES, 24, 2);
const f1 = (v: number) => v.toFixed(1);
const orden = (m: { orden: number[]; estacional: number[] }) => `(${m.orden.join(",")})(${m.estacional.slice(0, 3).join(",")})₁₂`;
const TXT = { fontSize: 26, lineHeight: 1.42, margin: 0 } as const;
const ROJO = { color: "var(--red-2)" };
/** En qué pregunta va cada clic (null: el resumen, las tres a la vez) y cuáles son del caso. */
const PREGUNTA_DEL_CLIC = [0, 0, 1, 1, 1, 2, 2, 2, 0, null];
const CLICS_DEL_CASO = [1, 4, 7, 8, 9];

// Un clic, una idea, una pregunta a la vez: 0–1 ¿qué órdenes? (AIC y BIC; la rejilla); 2–4 ¿pronostica bien? (MAE y
// RMSE; MAPE; los errores de 1960); 5–7 ¿dejó algo? (Ljung-Box; las dos escalas de p; los residuos); 8 la advertencia
// de elegir mirando la prueba; 9 el resumen.
export default function ElegirYEvaluar({ step }: SlideProps) {
  const [criterio, setCriterio] = useState<"aic" | "bic">("aic");
  useEffect(() => setCriterio("aic"), [step]);
  const caso = CLICS_DEL_CASO.includes(step);

  return (
    <SlideFrame
      section={["U8 · Datos secuenciales", "G. Modelos de series"]}
      num={48}
      caso={caso ? "Pasajeros aéreos" : null}
      title="Elegir y evaluar: tres preguntas, tres herramientas"
      lede="Antes de confiar en un modelo hay que contestar tres cosas: qué órdenes usar, qué tan bien pronostica y si dejó algo sin explicar."
    >
      <Preguntas activa={PREGUNTA_DEL_CLIC[Math.min(step, 9)]} />

      {step === 0 && (
        <Entra style={{ display: "grid", gridTemplateColumns: "1000px 1fr", gap: 64 }}>
          <div>
            <div style={{ fontSize: 32, display: "grid", gap: 14 }}>
              <TeX>{"\\text{AIC} = 2k - 2\\ln \\hat L"}</TeX>
              <TeX>{"\\text{BIC} = k\\ln n - 2\\ln \\hat L"}</TeX>
            </div>
            <p style={{ ...TXT, marginTop: 26 }}>
              Premian que los datos resulten creíbles (L̂) y cobran por cada coeficiente (k); BIC cobra más. <span style={ROJO}>Menor es mejor.</span>
            </p>
          </div>
          <Recap title="verosimilitud">
            <p>Qué tan creíbles resultan los datos con unos coeficientes. Estimar es buscar los que la hacen máxima: así salieron los coeficientes de la 42 a la 45.</p>
          </Recap>
        </Entra>
      )}

      {step === 1 && (
        <Entra style={{ display: "grid", gridTemplateColumns: "1000px 1fr", gap: 64 }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span className="label natural">16 SARIMA · renglones (p,1,q) · columnas (P,1,Q)₁₂</span>
              <Chips
                opciones={[
                  { valor: "aic", texto: "AIC" },
                  { valor: "bic", texto: "BIC" },
                ]}
                valor={criterio}
                onChange={setCriterio}
              />
            </div>
            <AicGrid celdas={REJILLA} criterio={criterio} />
          </div>
          <div style={{ paddingTop: 10 }}>
            <p style={TXT}>
              Todos con d = D = 1 y la misma serie: así sí se comparan. El mínimo con AIC y con BIC: <span style={ROJO}>la aerolínea</span>.
            </p>
            <p style={{ ...TXT, marginTop: 18 }}>
              El otro candidato de la 44, <span className="mono">{orden(SEGUNDO)}</span>, queda a +{f1(SEGUNDO.aic - POR_AIC[0].aic)}. Hay {EMPATADOS} a menos de 2: no se distinguen.
            </p>
          </div>
        </Entra>
      )}

      {(step === 2 || step === 3) && (
        <div style={{ display: "grid", gridTemplateColumns: "900px 1fr", gap: 72 }}>
          <div>
            <span className="label">Esquema · 4 meses: real menos pronóstico</span>
            <TiraErrores real={ESQ_REAL} pron={ESQ_PRON} etiquetas={["mes 1", "mes 2", "mes 3", "mes 4"]} ancho={900} alto={380} />
          </div>
          {step === 2 ? (
            <Entra>
              <div style={{ fontSize: 30, display: "grid", gap: 14 }}>
                <TeX>{"\\text{MAE} = \\tfrac1n\\sum |y_t - \\hat y_t|"}</TeX>
                <TeX>{"\\text{RMSE} = \\sqrt{\\tfrac1n\\sum (y_t - \\hat y_t)^2}"}</TeX>
              </div>
              <p className="mono" style={{ fontSize: 26, margin: "22px 0 0" }}>
                MAE {f1(mae(ESQ_REAL, ESQ_PRON))} · RMSE {f1(rmse(ESQ_REAL, ESQ_PRON))}
              </p>
              <p style={{ ...TXT, marginTop: 18 }}>
                El error grande del mes 4 es lo que separa al RMSE del MAE: <span style={ROJO}>al cuadrado pesa más</span>.
              </p>
            </Entra>
          ) : (
            <Entra>
              <div style={{ fontSize: 30 }}>
                <TeX>{"\\text{MAPE} = \\dfrac{100\\%}{n}\\sum \\left|\\dfrac{y_t - \\hat y_t}{y_t}\\right|"}</TeX>
              </div>
              <p className="mono" style={{ fontSize: 26, margin: "22px 0 0" }}>
                MAPE {f1(mape(ESQ_REAL, ESQ_PRON))} %
              </p>
              <p style={{ ...TXT, marginTop: 18 }}>Cada error se divide entre el valor real: el error queda en por ciento y se puede comparar entre series de distinto tamaño.</p>
            </Entra>
          )}
        </div>
      )}

      {step === 4 && (
        <Entra style={{ display: "grid", gridTemplateColumns: "1040px 1fr", gap: 64 }}>
          <div>
            <span className="label">Los 12 errores de la aerolínea en 1960, en miles</span>
            <TiraErrores real={prueba} pron={PRON} etiquetas={MESES} ancho={1040} alto={420} />
          </div>
          <div style={{ paddingTop: 30 }}>
            <p className="mono" style={{ fontSize: 30, margin: 0, lineHeight: 1.6 }}>
              MAE <span style={ROJO}>{f1(MAE_ELEGIDO)}</span> mil
              <br />
              RMSE {f1(rmse(prueba, PRON))} mil
              <br />
              MAPE {mape(prueba, PRON).toFixed(1)} %
            </p>
            <p style={{ ...TXT, marginTop: 22 }}>En promedio, se equivoca por {f1(MAE_ELEGIDO)} mil pasajeros al mes.</p>
          </div>
        </Entra>
      )}

      {step === 5 && (
        <Entra style={{ maxWidth: 1200 }}>
          <p style={TXT}>Si el modelo aprovechó todo, lo que sobra (los residuos) debe parecer ruido blanco (41).</p>
          <div style={{ fontSize: 34, margin: "28px 0" }}>
            <TeX>{"Q = n(n+2)\\sum_{k=1}^{h}\\frac{r_k^2}{n-k}"}</TeX>
          </div>
          <p style={TXT}>
            Ljung-Box junta las primeras h barras de la ACF de los residuos en un número. <span style={ROJO}>Si fueran ruido blanco, Q sería chico.</span>
          </p>
        </Entra>
      )}

      {step === 6 && (
        <Entra style={{ display: "grid", gridTemplateColumns: "1100px 1fr", gap: 64 }}>
          <div style={{ display: "grid", gap: 30 }}>
            <PValueScale quiere="chico" rotulo="ADF (37) · H₀: hay raíz unitaria" ancho={1100} alto={130} />
            <PValueScale quiere="grande" rotulo="Ljung-Box · H₀: no queda parecido" ancho={1100} alto={130} />
          </div>
          <div style={{ paddingTop: 20 }}>
            <p style={TXT}>
              Mismo 0.05, <span style={ROJO}>preguntas opuestas</span>.
            </p>
            <p style={{ ...TXT, marginTop: 18 }}>En ADF se quiere rechazar. En Ljung-Box se quiere no rechazar: que no haya evidencia de que sobre algo.</p>
          </div>
        </Entra>
      )}

      {step === 7 && (
        <Entra style={{ display: "grid", gridTemplateColumns: "1040px 1fr", gap: 64 }}>
          <div>
            <Correlogram valores={ACF_RES} n={RES.length} ancho={1040} alto={300} titulo={`ACF de los ${RES.length} residuos`} cada={6} y={[-0.5, 0.5]} />
            <div style={{ marginTop: 22 }}>
              <PValueScale p={LB24.p} quiere="grande" rotulo={`Ljung-Box, 24 rezagos: Q = ${f1(LB24.Q)}`} ancho={1040} alto={130} />
            </div>
          </div>
          <div style={{ paddingTop: 30 }}>
            <p style={TXT}>
              Solo sale el {FUERA_RES.join(", ")}: con 24 barras, lo esperable por azar. Con 12 rezagos, p = {formatoP(LB12.p)}.
            </p>
            <p style={{ ...TXT, marginTop: 18 }}>
              <span style={ROJO}>No hay evidencia</span> de que quede parecido entre los residuos (que no es lo mismo que probar que son ruido blanco).
            </p>
          </div>
        </Entra>
      )}

      {step === 8 && (
        <Entra style={{ maxWidth: 1300 }}>
          <p className="takeaway" style={{ margin: 0 }}>
            Ojo: {MEJORES_EN_1960.length} de los otros 15 tuvieron menor error en 1960 (MAE de {f1(Math.min(...MEJORES_EN_1960))} a {f1(Math.max(...MEJORES_EN_1960))}, contra{" "}
            {f1(MAE_ELEGIDO)}).
          </p>
          <p style={{ ...TXT, marginTop: 28 }}>
            Escoger entre ellos mirando 1960 sería usar la prueba para elegir: <span style={ROJO}>la fuga de la 30</span>.
          </p>
        </Entra>
      )}

      {step >= 9 && (
        <Entra>
          <div style={{ display: "grid", gridTemplateColumns: "auto auto 1fr", columnGap: 48, rowGap: 18, fontSize: 26, alignItems: "baseline" }}>
            {[
              ["¿Qué órdenes?", "AIC, sin tocar la prueba", "la aerolínea"],
              ["¿Pronostica bien?", "la prueba mide", `MAE ${f1(MAE_ELEGIDO)} mil`],
              ["¿Dejó algo?", "Ljung-Box revisa lo que sobró", `p = ${formatoP(LB24.p)}`],
            ].map((f, i) => (
              <div key={f[0]} style={{ display: "contents" }}>
                <span style={{ fontWeight: 600 }}>
                  <span className="mono" style={{ color: "var(--red)", marginRight: 12 }}>
                    {i + 1}
                  </span>
                  {f[0]}
                </span>
                <span style={{ color: "var(--text-2)" }}>{f[1]}</span>
                <span className="mono" style={ROJO}>
                  {f[2]}
                </span>
              </div>
            ))}
          </div>
          <p className="takeaway" style={{ margin: "40px 0 0" }}>
            <em>¿{f1(MAE_ELEGIDO)} mil es poco o mucho?</em> Depende de contra qué se compare: 47.
          </p>
        </Entra>
      )}
    </SlideFrame>
  );
}
