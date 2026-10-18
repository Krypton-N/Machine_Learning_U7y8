import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Barras } from "../components/Barras";
import { Dispersion } from "../components/Dispersion";
import { Recap } from "../components/Recap";
import { Reveal } from "../components/Reveal";
import { SeriesChart } from "../components/SeriesChart";
import { TeX } from "../components/TeX";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { TRANSFORMACIONES, adf, type FilaADF, type Transformacion } from "../lib/pasajeros";
import { linear } from "../lib/scale";
import { densidadNormal, diferencia, minimosCuadrados } from "../lib/series";

// ---------- Concepto: los mismos choques con dos reglas (simulado en Python; su τ lo calcula statsmodels) ----------
const E = adf.esquema;
const N_ESQ = E.ar1.length;
const ESQUEMAS = [
  { id: "ar1" as const, titulo: `Regresa a su media: cada valor = ${E.phi} × el anterior + un choque`, factor: E.phi, x: E.ar1, color: "var(--data)" },
  { id: "caminata" as const, titulo: "Raíz unitaria: cada valor = 1 × el anterior + un choque", factor: 1, x: E.caminata, color: "var(--red)" },
].map((s) => {
  const ayer = s.x.slice(0, -1);
  const cambio = diferencia(s.x, 1);
  const recta = minimosCuadrados(
    ayer.map((v) => [v]),
    cambio,
  );
  return { ...s, ayer, cambio, a: recta.beta[0], pendiente: recta.beta[1], tau: recta.t[1], p: E.df[s.id].p };
});
const PASOS_ECO = 10;

/** Un p-valor escrito sin esconder los muy chicos. */
const fmtP = (p: number) => (p >= 0.001 ? p.toFixed(3) : p >= 0.00001 ? p.toFixed(5) : "< 0.00001");

// ---------- Distribución de τ cuando sí hay raíz unitaria ----------
const NULO = adf.nulo;
const DOMINIO: [number, number] = [-6, 3];
const CRITICO = NULO.percentil5;

type Marca = { id: string; nombre: string; tau: number; p: number };

function HistogramaNulo({ marcas, activa }: { marcas: Marca[]; activa?: string }) {
  const W = 1000;
  const H = 400;
  const m = { l: 20, r: 20, t: 92, b: 66 };
  const fx = linear(DOMINIO, [m.l, W - m.r]);
  const paso = NULO.bordes[1] - NULO.bordes[0];
  const densidad = NULO.conteos.map((c) => c / (NULO.R * paso));
  const fy = linear([0, Math.max(...densidad, densidadNormal(0)) * 1.05], [H - m.b, m.t]);
  const sel = marcas.find((k) => k.id === activa);
  const normal = Array.from({ length: 121 }, (_, i) => DOMINIO[0] + (i * (DOMINIO[1] - DOMINIO[0])) / 120)
    .map((z, i) => `${i ? "L" : "M"}${fx(z)},${fy(densidadNormal(z))}`)
    .join("");
  return (
    <svg width={W} height={H} style={{ display: "block", overflow: "visible" }}>
      {NULO.conteos.map((_, j) => {
        const a = NULO.bordes[j];
        const b = NULO.bordes[j + 1];
        if (b <= DOMINIO[0] || a >= DOMINIO[1]) return null;
        // La cola del τ elegido: todo lo que queda a su izquierda. Su área es el p-valor.
        const enCola = sel !== undefined && b <= sel.tau + 1e-9;
        return (
          <motion.rect key={j} x={fx(a) + 0.5} width={fx(b) - fx(a) - 1} y={fy(densidad[j])} height={fy(0) - fy(densidad[j])} initial={false} animate={{ fill: enCola ? "#e5383b" : "#55555d" }} transition={{ duration: 0.4 }} />
        );
      })}
      <path d={normal} fill="none" stroke="var(--text-3)" strokeWidth={2} strokeDasharray="5 6" />
      <text x={fx(1.15)} y={fy(densidadNormal(1.15)) - 10} className="mono" fontSize={20} fill="var(--text-3)">
        una normal, para comparar
      </text>
      <line x1={m.l} x2={W - m.r} y1={fy(0)} y2={fy(0)} stroke="var(--line-2)" />
      {Array.from({ length: DOMINIO[1] - DOMINIO[0] + 1 }, (_, i) => DOMINIO[0] + i).map((v) => (
        <text key={v} x={fx(v)} y={H - m.b + 26} textAnchor="middle" className="mono" fontSize={20} fill="var(--text-3)">
          {v}
        </text>
      ))}
      <text x={W - m.r} y={H - 2} textAnchor="end" className="mono" fontSize={20} fill="var(--text-2)">
        τ
      </text>
      <line x1={fx(CRITICO)} x2={fx(CRITICO)} y1={m.t - 6} y2={fy(0)} stroke="var(--text)" strokeDasharray="3 5" />
      <text x={fx(CRITICO) + 10} y={fy(0) - 150} textAnchor="start" className="mono" fontSize={20} fill="var(--text)">
        5 % queda a la izquierda de {CRITICO.toFixed(2)}
      </text>
      {marcas.map((k, i) => {
        const fuera = k.tau < DOMINIO[0];
        const x = fuera ? m.l : fx(Math.min(DOMINIO[1], k.tau));
        // Los rótulos se escalonan en tres renglones para que dos τ casi iguales no se encimen.
        const yTexto = 20 + (i % 3) * 24;
        const on = k.id === activa;
        return (
          <motion.g key={k.id} initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <line x1={x} x2={x} y1={yTexto + 6} y2={fy(0)} stroke={on ? "var(--red-2)" : "var(--text-2)"} strokeWidth={on ? 2.5 : 1.5} />
            <circle cx={x} cy={fy(0)} r={on ? 7 : 5} fill={on ? "var(--red)" : "var(--text-2)"} />
            <text x={x + (fuera ? 0 : 6)} y={yTexto} textAnchor={fuera || k.tau < 1.5 ? "start" : "end"} className="mono" fontSize={20} fill={on ? "var(--red-2)" : "var(--text-2)"}>
              {fuera ? "← " : ""}
              {k.nombre}: τ = {k.tau.toFixed(2)}
            </text>
          </motion.g>
        );
      })}
    </svg>
  );
}

// ---------- Caso: la tabla, fila por fila ----------
const FILAS = adf.filas as (FilaADF & { id: Transformacion })[];
const SENSIBLES = adf.sensibilidad.bic.filter((b) => {
  const base = FILAS.find((f) => f.id === b.id)!;
  // Filas cuyo veredicto al 5 % cambia si los rezagos se eligen con otro criterio.
  return base.p < 0.05 !== b.p < 0.05;
});
const VISIBLES: Record<number, number> = { 3: 2, 4: 4, 5: 5, 6: 5, 7: 5 };
const MAX_REZAGOS = Math.max(...FILAS.map((f) => f.rezagos));

function Mini({ id }: { id: Transformacion }) {
  const T = TRANSFORMACIONES[id];
  const lo = Math.min(...T.valores);
  const hi = Math.max(...T.valores);
  const fx = linear([0, T.valores.length - 1], [2, 92]);
  const fy = linear([lo, hi], [28, 3]);
  return (
    <svg width={94} height={31} style={{ display: "block" }}>
      <path d={T.valores.map((v, i) => `${i ? "L" : "M"}${fx(i).toFixed(1)},${fy(v).toFixed(1)}`).join("")} fill="none" stroke="var(--data)" strokeWidth={1.2} />
    </svg>
  );
}

export default function PruebaADF({ step }: SlideProps) {
  const n = VISIBLES[step] ?? 0;
  const [elegida, setElegida] = useState<string>(FILAS[0].id);
  // Al revelar filas, la marcada es la última que entró.
  useEffect(() => {
    if (n > 0) setElegida(FILAS[n - 1].id);
  }, [n]);
  const marcasCaso: Marca[] = FILAS.slice(0, n).map((f) => ({ id: f.id, nombre: TRANSFORMACIONES[f.id].nombre, tau: f.estadistico, p: f.p }));
  const marcasEsquema: Marca[] = ESQUEMAS.map((s) => ({ id: s.id, nombre: s.id === "ar1" ? "la que regresa" : "raíz unitaria", tau: s.tau, p: s.p }));
  const celda = { padding: "8px 8px", borderBottom: "1px solid var(--line)", fontSize: 20 } as const;

  return (
    <SlideFrame
      section={["U8 · Datos secuenciales", "F. Fundamentos de series"]}
      num={37}
      caso={step >= 3 ? "Pasajeros aéreos" : null}
      title="Prueba ADF: ¿la serie tiene raíz unitaria?"
      lede="Una serie puede regresar a su media o acumular cada choque para siempre. ADF mide cuál de las dos cosas hace."
    >
      {step === 0 && (
        <motion.div key="series" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "grid", gridTemplateColumns: "1000px 1fr", gap: 60 }}>
          <div>
            <span className="label">Esquema · simulado con los mismos {N_ESQ} choques</span>
            {ESQUEMAS.map((s) => (
              <div key={s.id} style={{ marginTop: 12 }}>
                <div style={{ fontSize: 26, color: "var(--text-2)" }}>{s.titulo}</div>
                <SeriesChart ancho={1000} alto={200} series={[{ id: s.id, valores: s.x, color: s.color, grosor: 2 }]} sinMarcasX lineasH={[{ y: 0 }]} margen={{ l: 50, r: 10, t: 10, b: 12 }} />
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 32 }}>
              <TeX>{"x_t = \\phi\\, x_{t-1} + \\varepsilon_t"}</TeX>
            </div>
            <p style={{ fontSize: 26, color: "var(--text-2)", lineHeight: 1.4, margin: "8px 0 22px" }}>
              ε es el choque de cada paso: al azar, de media 0. φ dice cuánto del valor anterior se conserva.
            </p>
            <span className="label">efecto de un choque de +1, después de k pasos</span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 6 }}>
              {ESQUEMAS.map((s) => (
                <Barras
                  key={s.id}
                  valores={Array.from({ length: PASOS_ECO + 1 }, (_, k) => s.factor ** k)}
                  etiquetas={Array.from({ length: PASOS_ECO + 1 }, (_, k) => String(k))}
                  ancho={310}
                  alto={190}
                  y={[0, 1]}
                  pasoY={0.5}
                  rotulo={`φ = ${s.factor}`}
                  color={s.color}
                  cada={2}
                  margen={{ l: 40, r: 6, t: 26, b: 34 }}
                />
              ))}
            </div>
            <p style={{ fontSize: 26, lineHeight: 1.4, margin: "12px 0 0" }}>
              Con φ menor que 1 el choque se desvanece. Con <span style={{ color: "var(--red-2)" }}>φ = 1 se queda para siempre:</span> nada jala a la serie de
              regreso.
            </p>
          </div>
        </motion.div>
      )}

      {step === 1 && (
        <motion.div key="regresion" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "grid", gridTemplateColumns: "1000px 1fr", gap: 60 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30 }}>
            {ESQUEMAS.map((s) => (
              <div key={s.id}>
                <div style={{ fontSize: 26, color: "var(--text-2)", minHeight: 58 }}>{s.id === "ar1" ? "La que regresa a su media" : "La de raíz unitaria"}</div>
                <Dispersion
                  x={s.ayer}
                  y={s.cambio}
                  ancho={485}
                  alto={400}
                  rotuloX="valor de ayer"
                  rotuloY="cambio de hoy"
                  recta={{ a: s.a, b: s.pendiente, color: "var(--red)" }}
                  color={s.color === "var(--red)" ? "var(--data)" : s.color}
                  radio={3.5}
                />
                <div className="mono" style={{ fontSize: 20, marginTop: 6 }}>
                  pendiente <span style={{ color: "var(--red-2)" }}>{s.pendiente.toFixed(2)}</span> · τ = {s.tau.toFixed(2)}
                </div>
                <div style={{ fontSize: 26, color: "var(--text-2)" }}>{s.id === "ar1" ? "Si ayer estuvo arriba, hoy baja." : "El nivel de ayer no dice a dónde va."}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 26, lineHeight: 1.42 }}>
            <p style={{ margin: 0 }}>ADF hace esta regresión y pregunta: ¿la pendiente es negativa?</p>
            <div style={{ fontSize: 28, margin: "16px 0" }}>
              <TeX>{"\\Delta x_t = \\alpha + \\gamma\\, x_{t-1} + \\varepsilon_t,\\quad \\gamma = \\phi - 1"}</TeX>
            </div>
            <div style={{ borderTop: "1px solid var(--line)", padding: "12px 0" }}>
              <b>H₀:</b> γ = 0. Hay raíz unitaria: no es estacionaria.
            </div>
            <div style={{ borderTop: "1px solid var(--line)", padding: "12px 0" }}>
              <b>H₁:</b> γ &lt; 0. Regresa a su media: es estacionaria.
            </div>
            <div style={{ borderTop: "1px solid var(--line)", padding: "12px 0", color: "var(--text-2)" }}>
              El estadístico <TeX>{"\\tau"}</TeX> es la pendiente dividida entre su incertidumbre: entre más negativo, más evidencia contra H₀.
            </div>
          </div>
        </motion.div>
      )}

      {step >= 2 && (
        <motion.div key="prueba" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1000px 1fr", gap: 50 }}>
            <div>
              <span className="label natural">
                lo que saldría si hubiera raíz unitaria · τ de {NULO.R.toLocaleString("es-MX")} caminatas simuladas
              </span>
              <HistogramaNulo marcas={step === 2 ? marcasEsquema : marcasCaso} activa={step === 2 ? "caminata" : elegida} />
            </div>
            {step === 2 ? (
              <div>
                <Recap title="p-valor">
                  <p style={{ fontSize: 26 }}>
                    Supón que H₀ es cierta. El p-valor es qué tan raro sería un resultado como el que salió: aquí, el área a la izquierda de τ. Si p &lt; 0.05,
                    sería muy raro y se rechaza H₀. Si no, no se rechaza, que no es lo mismo que probarla.
                  </p>
                </Recap>
                <div className="mono" style={{ fontSize: 21, lineHeight: 1.7, marginTop: 18 }}>
                  {ESQUEMAS.map((s) => (
                    <div key={s.id}>
                      {s.id === "ar1" ? "la que regresa" : "raíz unitaria"}: τ = {s.tau.toFixed(2)} · p = <span style={{ color: "var(--red-2)" }}>{fmtP(s.p)}</span>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 26, color: "var(--text-2)", lineHeight: 1.4, marginTop: 14 }}>
                  τ no sigue una normal: su 5 % está en {CRITICO.toFixed(2)}, no en −1.64.
                </p>
              </div>
            ) : step <= 6 ? (
              <div>
                <table data-rotulo style={{ borderCollapse: "collapse", width: "100%" }}>
                  <thead>
                    <tr className="mono" style={{ fontSize: 20, color: "var(--text-3)", textAlign: "right" }}>
                      <th style={{ ...celda, textAlign: "left" }}>serie</th>
                      <th style={celda} />
                      <th style={celda}>τ</th>
                      <th style={celda}>p</th>
                      <th style={celda}>¿se rechaza H₀?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FILAS.slice(0, n).map((f) => {
                      const on = f.id === elegida;
                      const rechaza = f.p < 0.05;
                      return (
                        <motion.tr key={f.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} onClick={() => setElegida(f.id)} style={{ cursor: "pointer", background: on ? "var(--red-dim)" : "transparent" }}>
                          <td style={{ ...celda, fontSize: 26 }}>{TRANSFORMACIONES[f.id].nombre}</td>
                          <td style={celda}>
                            <Mini id={f.id} />
                          </td>
                          <td className="mono" style={{ ...celda, textAlign: "right" }}>
                            {f.estadistico.toFixed(2)}
                          </td>
                          <td className="mono" style={{ ...celda, textAlign: "right", color: "var(--red-2)" }}>
                            {fmtP(f.p)}
                          </td>
                          <td style={{ ...celda, textAlign: "right", color: rechaza ? "var(--red-2)" : "var(--text-2)", fontWeight: rechaza ? 600 : 400 }}>{rechaza ? "sí" : "no"}</td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
                {step < 6 && (
                <p style={{ fontSize: 26, color: "var(--text-3)", lineHeight: 1.4, margin: "10px 0 0" }}>
                  statsmodels, con sus valores por omisión. La «A» es de aumentada: agrega a la regresión cambios pasados (aquí, hasta {MAX_REZAGOS}).
                </p>
                )}
                <Reveal step={step} at={6} style={{ marginTop: 12, fontSize: 26, lineHeight: 1.4 }}>
                  <span style={{ color: "var(--red-2)" }}>Ojo:</span> {SENSIBLES.map((b) => TRANSFORMACIONES[b.id as Transformacion].nombre).join(" y ")} están en la frontera.
                  Con otro criterio para elegir los cambios pasados dan p = {SENSIBLES.map((b) => fmtP(b.p)).join(" y ")}. Y no rechazar no prueba que haya raíz
                  unitaria.
                </Reveal>
              </div>
            ) : (
            <motion.p className="takeaway" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ margin: 0, paddingTop: 40, fontSize: 28 }}>
              Con logaritmo y las dos diferencias, <em>ADF descarta la raíz unitaria.</em> Que haga falta la diferencia estacional no lo dice ADF: lo dicen el patrón
              por mes de la 36 y los picos cada 12 de la 39. Para pasajeros: d = 1 y D = 1.
            </motion.p>
            )}
          </div>
        </motion.div>
      )}
    </SlideFrame>
  );
}
