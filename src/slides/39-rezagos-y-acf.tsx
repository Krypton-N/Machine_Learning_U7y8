import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Barras } from "../components/Barras";
import { Correlogram, fueraDeBanda } from "../components/Correlogram";
import { Boton, Chips } from "../components/Piezas";
import { Recap } from "../components/Recap";
import { Reveal } from "../components/Reveal";
import { SeriesChart } from "../components/SeriesChart";
import { TeX } from "../components/TeX";
import { useFlechas } from "../deck/hooks";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { media } from "../lib/metricas";
import { TRANSFORMACIONES, pasajeros } from "../lib/pasajeros";
import { acf, banda95, pearson, productosRezago } from "../lib/series";

// ---------- Concepto: una ola de 8 valores (esquema) ----------
const OLA = [2, 3, 5, 7, 8, 7, 5, 3];
const MEDIA_OLA = media(OLA);
const CUADRADOS = OLA.reduce((s, v) => s + (v - MEDIA_OLA) ** 2, 0);
const ACF_OLA = acf(OLA, 4);
const REZAGOS_OLA = [1, 2, 3, 4].map((k) => ({ valor: k, texto: `k = ${k}` }));

function TablaRezagos({ k, productos }: { k: number; productos: boolean }) {
  const celda = { padding: "7px 26px", fontSize: 26, borderBottom: "1px solid var(--line)", textAlign: "right" } as const;
  const columnas = productos ? [k] : [1, 2];
  const prod = productosRezago(OLA, k);
  return (
    <table className="mono" style={{ borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ color: "var(--text-3)" }}>
          <th style={{ ...celda, fontSize: 26 }}>t</th>
          <th style={{ ...celda, fontSize: 26 }}>
            <TeX>{"x_t"}</TeX>
          </th>
          {columnas.map((c) => (
            <th key={c} style={{ ...celda, fontSize: 26, color: "var(--red-2)" }}>
              <TeX>{`x_{t-${c}}`}</TeX>
            </th>
          ))}
          {productos && (
            <th style={{ ...celda, fontSize: 26 }}>
              <TeX>{`(x_t - \\bar x)(x_{t-${k}} - \\bar x)`}</TeX>
            </th>
          )}
        </tr>
      </thead>
      <tbody>
        {OLA.map((v, t) => (
          <tr key={t}>
            <td style={{ ...celda, color: "var(--text-3)" }}>{t + 1}</td>
            <td style={celda}>{v}</td>
            {columnas.map((c) => (
              <motion.td key={c} style={{ ...celda, color: "var(--red-2)" }} initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                {t >= c ? OLA[t - c] : "—"}
              </motion.td>
            ))}
            {productos && <td style={{ ...celda, color: t >= k && prod[t - k] < 0 ? "var(--text-2)" : "var(--text)" }}>{t >= k ? prod[t - k] : "—"}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ---------- Caso ----------
const Y = pasajeros.valores;
const DD = TRANSFORMACIONES.dd12log;
const K_MAX = 36;
const ACF_Y = acf(Y, K_MAX);
const ACF_DD = acf(DD.valores, K_MAX);
const FUERA_DD = fueraDeBanda(ACF_DD, DD.valores.length);
// Los dos rezagos con la barra más grande después de diferenciar.
const MAYORES_DD = ACF_DD.map((v, k) => ({ k, v: Math.abs(v) }))
  .slice(1)
  .sort((a, b) => b.v - a.v)
  .slice(0, 2)
  .map((o) => o.k)
  .sort((a, b) => a - b);
const APENAS = FUERA_DD.filter((k) => !MAYORES_DD.includes(k));
const PEARSON_1 = pearson(Y.slice(0, -1), Y.slice(1));
const PERIODO = 12;

export default function RezagosYACF({ step, active }: SlideProps) {
  const [kOla, setKOla] = useState(1);
  const [k, setK] = useState(PERIODO);
  const [corriendo, setCorriendo] = useState(false);
  useEffect(() => {
    setCorriendo(false);
    setK(PERIODO);
  }, [step]);
  // "Recorrer": llena el correlograma barra por barra; cualquier flecha lo detiene.
  useEffect(() => {
    if (!corriendo) return;
    const id = setInterval(() => setK((v) => (v >= K_MAX ? v : v + 1)), 180);
    return () => clearInterval(id);
  }, [corriendo]);
  useEffect(() => {
    if (corriendo && k >= K_MAX) setCorriendo(false);
  }, [corriendo, k]);
  const paso = (d: number) => {
    setCorriendo(false);
    setK((v) => Math.max(1, Math.min(K_MAX, v + d)));
  };
  useFlechas(
    active && step >= 2,
    () => paso(1),
    () => paso(-1),
  );

  const diferenciada = step >= 4;
  const serie = diferenciada ? DD.valores : Y;
  const desde = diferenciada ? DD.desde : 0;
  const r = diferenciada ? ACF_DD : ACF_Y;
  const prod = productosRezago(serie, k);
  const positivos = prod.filter((v) => v > 0).length;
  const mu = media(serie);

  return (
    <SlideFrame
      section={["U8 · Datos secuenciales", "F. Fundamentos de series"]}
      num={39}
      caso={step >= 2 ? "Pasajeros aéreos" : null}
      title="Rezagos y autocorrelación (ACF)"
      lede="¿El valor de hoy se parece al de hace k pasos? Se compara la serie con una copia de sí misma recorrida k lugares."
    >
      {step <= 1 && (
        <motion.div key="concepto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "grid", gridTemplateColumns: "820px 1fr", gap: 70 }}>
          <div>
            <span className="label">Esquema · no son datos</span>
            <div style={{ marginTop: 10 }}>
              <TablaRezagos k={kOla} productos={step === 1} />
            </div>
            {step === 0 ? (
              <p style={{ fontSize: 26, lineHeight: 1.4, marginTop: 18 }}>
                <b>Rezago k:</b> el valor de hace k pasos. Cada renglón junta el valor de hoy con el de ayer y el de antier.
              </p>
            ) : (
              <p className="mono" style={{ fontSize: 24, marginTop: 16 }}>
                Σ productos = {productosRezago(OLA, kOla).reduce((s, v) => s + v, 0)} · Σ cuadrados = {CUADRADOS} ·{" "}
                <span style={{ color: "var(--red-2)" }}>
                  r{"₀₁₂₃₄"[kOla]} = {ACF_OLA[kOla].toFixed(2)}
                </span>
              </p>
            )}
          </div>
          <div>
            <Recap title="correlación">
              <p>Mide si dos listas suben y bajan juntas: +1 si van juntas, −1 si van al revés, 0 si no tienen relación.</p>
            </Recap>
            {step === 0 ? (
              <p style={{ fontSize: 26, lineHeight: 1.42, marginTop: 26 }}>
                <b>Autocorrelación:</b> la correlación de la serie con su propia copia recorrida.
              </p>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 20 }}>
                <div style={{ fontSize: 30 }}>
                  <TeX>{"r_k = \\dfrac{\\sum_{t=k+1}^{n}(x_t - \\bar x)(x_{t-k} - \\bar x)}{\\sum_{t=1}^{n}(x_t - \\bar x)^2}"}</TeX>
                </div>
                <p style={{ fontSize: 26, lineHeight: 1.4, color: "var(--text-2)", margin: "14px 0 10px" }}>
                  Un producto positivo quiere decir que los dos valores están del mismo lado de la media (aquí, x̄ = {MEDIA_OLA}). r suma esos acuerdos y los
                  divide entre la variación total.
                </p>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 24 }}>
                  <Correlogram valores={ACF_OLA} ancho={380} alto={190} resaltar={kOla} rotular={[kOla]} cada={1} />
                  <Chips opciones={REZAGOS_OLA} valor={kOla} onChange={setKOla} />
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {step >= 2 && (
        <motion.div key="caso" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1040px 1fr", gap: 46 }}>
            <div>
              <span className="label natural">
                {diferenciada ? "∇∇₁₂ LOG" : "PASAJEROS"} (GRIS) · SU COPIA RECORRIDA {k} {k === 1 ? "MES" : "MESES"} (ROJO) · SU MEDIA (PUNTEADA)
              </span>
              <SeriesChart
                ancho={1040}
                alto={210}
                ventana={[0, Y.length - 1]}
                series={[
                  { id: "serie", valores: serie, desde, color: "var(--data)", grosor: 2 },
                  { id: "copia", valores: serie, desde: desde + k, color: "var(--red)", grosor: 2 },
                ]}
                lineasH={[{ y: mu }]}
                recortar
                cadaAnios={2}
                margen={{ l: 64, r: 10, t: 12, b: 34 }}
                transicion={0.15}
              />
              <Barras
                valores={Array.from({ length: Y.length }, (_, i) => (i >= desde + k ? prod[i - desde - k] : null))}
                ancho={1040}
                alto={170}
                rotulo="productos: (valor − media) × (valor recorrido − media) · rojo si es positivo"
                rojo={(i) => i >= desde + k && prod[i - desde - k] > 0}
                fmtY={(v) => (Math.abs(v) >= 1000 ? `${Math.round(v / 1000)} mil` : String(v))}
                grosor={0.8}
                margen={{ l: 64, r: 10, t: 26, b: 8 }}
                transicion={0.15}
              />
              <p style={{ fontSize: 26, lineHeight: 1.4, margin: "8px 0 0" }}>
                Con k = {k}: <span style={{ color: "var(--red-2)" }}>{positivos} de {prod.length}</span> productos son positivos.{" "}
                {step === 3 && "Con tendencia, los primeros años quedan bajo la media y los últimos arriba: casi todo coincide, para cualquier k."}
              </p>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: 46 }}>
                <span className="mono" style={{ fontSize: 24, color: "var(--red-2)" }}>
                  r({k}) = {r[k].toFixed(3)}
                </span>
                {step <= 3 && (
                  <Boton
                    onClick={() => {
                      setK(1);
                      setCorriendo(true);
                    }}
                  >
                    recorrer
                  </Boton>
                )}
              </div>
              <Correlogram
                valores={r}
                n={step >= 3 ? serie.length : undefined}
                ancho={600}
                alto={330}
                hasta={step === 2 ? k : undefined}
                resaltar={k}
                rotular={diferenciada ? MAYORES_DD : [PERIODO, 2 * PERIODO].filter((q) => step >= 3 || q <= k)}
                y={diferenciada ? [-0.5, 0.5] : [-0.5, 1]}
                titulo="ACF · una barra por rezago · ↑ ↓ cambian k"
              />
              <div style={{ fontSize: 26, lineHeight: 1.4, marginTop: 6 }}>
                {step === 2 && (
                  <span style={{ color: "var(--text-2)" }}>
                    Cada barra es la suma de esos productos entre la suma de cuadrados. Con k = 1 da {ACF_Y[1].toFixed(3)}; en la 29 salió {PEARSON_1.toFixed(3)} porque
                    allá cada lista tenía su propia media y aquí se usa una sola.
                  </span>
                )}
                {step === 3 && (
                  <>
                    <b>Baja muy lento:</b> tendencia. <b>Picos en {PERIODO} y {2 * PERIODO}:</b> estacionalidad.
                    <div style={{ fontSize: 26, color: "var(--text-3)", marginTop: 6 }}>
                      Banda ±{banda95(Y.length).toFixed(3)}: si no hubiera relación alguna entre los meses (ruido blanco, diapositiva 41), 95 de cada 100 barras caerían ahí.
                    </div>
                  </>
                )}
                {step >= 4 && (
                  <>
                    Casi todo queda dentro de la banda. Las dos mayores: <span style={{ color: "var(--red-2)" }}>{MAYORES_DD.join(" y ")}</span>. Salen apenas{" "}
                    {APENAS.join(", ")}.
                    <div style={{ fontSize: 26, color: "var(--text-3)", marginTop: 6 }}>
                      Con {K_MAX} barras, unas {Math.round(K_MAX * 0.05)} saldrían por puro azar.
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <Reveal step={step} at={4} style={{ marginTop: 10 }}>
            <p className="takeaway" style={{ margin: 0, fontSize: 26 }}>
              Una ACF que baja lento indica tendencia; picos cada {PERIODO}, estacionalidad. Después de diferenciar quedan <em>dos huellas, en {MAYORES_DD.join(" y en ")}</em>
              : es lo que un modelo puede aprender (46 y 47).
            </p>
          </Reveal>
        </motion.div>
      )}
    </SlideFrame>
  );
}
