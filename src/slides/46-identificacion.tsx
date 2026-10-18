import { useEffect, useMemo, useState } from "react";
import { Correlogram, fueraDeBanda } from "../components/Correlogram";
import { Boton, Chips } from "../components/Piezas";
import { Recap } from "../components/Recap";
import { Entra } from "../components/Reveal";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { TRANSFORMACIONES_ENT } from "../lib/pasajeros";
import { mulberry32 } from "../lib/rng";
import { acf, acfTeorica, choques, pacf, simularARMA } from "../lib/series";

// ---------- Concepto: las huellas teóricas y cómo se ven con una muestra ----------
const K_ESQ = 12;
const N_MUESTRA = 132;
const CALENTAMIENTO = 100;
// Con la semilla 3 las tres huellas se reconocen en la muestra (la PACF del AR(2) solo saca 1 y 2, la ACF del MA(1)
// solo saca el 1, el ARMA decae en las dos). No siempre pasa: entre las semillas 1 y 300 se cumple en 161 (AR(2)),
// 100 (MA(1)) y 122 (ARMA(1,1)). El botón "otra muestra" enseña justo eso.
const SEMILLA_INICIAL = 3;
const ESQUEMAS = [
  { id: "AR(2)", tex: "φ = 0.5, 0.3", ar: [0.5, 0.3], ma: [] as number[], acf: "decae", pacf: "se corta en 2" },
  { id: "MA(1)", tex: "θ = −0.6", ar: [] as number[], ma: [-0.6], acf: "se corta en 1", pacf: "decae" },
  { id: "ARMA(1,1)", tex: "φ = 0.7, θ = 0.4", ar: [0.7], ma: [0.4], acf: "decae", pacf: "decae" },
].map((e) => {
  const rho = acfTeorica(e.ar, e.ma, K_ESQ);
  // Lo que en teoría vale cero sale como 1e-17 por redondeo: se deja en cero.
  return { ...e, rho, phi: pacf(rho).map((v) => (Math.abs(v) < 1e-12 ? 0 : v)) };
});
const REGLA = [
  ["AR(p)", "decae", "se corta en p"],
  ["MA(q)", "se corta en q", "decae"],
  ["ARMA", "decae", "decae"],
];

function Huella({ texto }: { texto: string }) {
  return <span style={{ color: texto.startsWith("se corta") ? "var(--red-2)" : "var(--text-3)" }}>{texto}</span>;
}

// ---------- Caso: ∇∇₁₂ log con 1949–1959 ----------
const W = TRANSFORMACIONES_ENT.dd12log.valores;
const n = W.length;
const K = 36;
const R = acf(W, K);
const P = pacf(R);
const ESTACIONALES = [12, 24, 36];
const f2 = (v: number) => v.toFixed(2).replace("-", "−");
const TXT = { fontSize: 26, lineHeight: 1.42, margin: 0 } as const;
const ROJO = { color: "var(--red-2)" };

// Un clic, una idea: 0 la regla con la teoría; 1 lo mismo con una muestra; 2–5 el caso (corto plazo, el 3, los años,
// Bartlett); 6 el cierre.
export default function Identificacion({ step }: SlideProps) {
  const [semilla, setSemilla] = useState(SEMILLA_INICIAL);
  const [verMuestra, setVerMuestra] = useState(true);
  const [banda, setBanda] = useState<"blanco" | "bartlett">("blanco");
  useEffect(() => {
    setVerMuestra(true);
    setBanda(step >= 5 ? "bartlett" : "blanco");
  }, [step]);
  const muestras = useMemo(() => {
    const eps = choques(N_MUESTRA + CALENTAMIENTO, mulberry32(semilla));
    return ESQUEMAS.map((e) => {
      const a = acf(simularARMA(e.ar, e.ma, eps, CALENTAMIENTO), K_ESQ);
      return { rho: a, phi: pacf(a) };
    });
  }, [semilla]);
  const conMuestra = step === 1 && verMuestra;
  const caso = step >= 2;
  // Qué se atenúa y qué se rotula en los dos correlogramas del caso, según el clic.
  const atenuar = step === 2 ? (k: number) => k > 11 : step === 3 ? (k: number) => k !== 3 : step === 4 ? (k: number) => !ESTACIONALES.includes(k) : undefined;
  const rotular = step === 2 ? [1, 2] : step === 3 ? [3] : step === 4 ? ESTACIONALES : [];

  return (
    <SlideFrame
      section={["U8 · Datos secuenciales", "G. Modelos de series"]}
      num={46}
      caso={caso ? "Pasajeros aéreos" : null}
      title="Identificación: leer la ACF y la PACF"
      lede="Cada modelo deja una huella en la ACF y en la PACF. Leerla propone los órdenes p y q."
    >
      {!caso && (
        <Entra style={{ display: "grid", gridTemplateColumns: "1080px 1fr", gap: 56 }}>
          <div>
            <span className="label natural">{conMuestra ? `ESQUEMA · UNA MUESTRA DE ${N_MUESTRA} VALORES (GUIONES: LA TEORÍA)` : "ESQUEMA · TEÓRICO"}</span>
            <div style={{ display: "grid", gridTemplateColumns: "150px 1fr 1fr", columnGap: 16, rowGap: 2, alignItems: "center", marginTop: 6 }}>
              <span />
              <span className="label">ACF</span>
              <span className="label">PACF</span>
              {ESQUEMAS.map((e, i) => (
                <div key={e.id} style={{ display: "contents" }}>
                  <div>
                    <div style={{ fontSize: 26, fontWeight: 600 }}>{e.id}</div>
                    <div className="mono" style={{ fontSize: 20, color: "var(--text-3)" }}>
                      {e.tex}
                    </div>
                  </div>
                  {(["rho", "phi"] as const).map((cual) => (
                    <div key={cual}>
                      <Correlogram
                        valores={conMuestra ? muestras[i][cual] : e[cual]}
                        n={conMuestra ? N_MUESTRA : undefined}
                        ancho={450}
                        alto={150}
                        cada={2}
                        y={[-1, 1]}
                        pasoY={1}
                        teorica={conMuestra ? [{ id: "teo", valores: e[cual], color: "var(--text)" }] : []}
                      />
                      <div data-rotulo style={{ fontSize: 20, marginTop: -2 }}>
                        <Huella texto={cual === "rho" ? e.acf : e.pacf} />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          {step === 0 ? (
            <div>
              <span className="label">La regla</span>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 26, marginTop: 8 }}>
                <thead>
                  <tr style={{ color: "var(--text-3)", textAlign: "left" }}>
                    <th style={{ padding: "8px", fontWeight: 400 }} />
                    <th style={{ padding: "8px", fontWeight: 400 }}>ACF</th>
                    <th style={{ padding: "8px", fontWeight: 400 }}>PACF</th>
                  </tr>
                </thead>
                <tbody>
                  {REGLA.map((f) => (
                    <tr key={f[0]} style={{ borderTop: "1px solid var(--line)" }}>
                      <td style={{ padding: "10px 8px" }}>{f[0]}</td>
                      <td style={{ padding: "10px 8px" }}>
                        <Huella texto={f[1]} />
                      </td>
                      <td style={{ padding: "10px 8px" }}>
                        <Huella texto={f[2]} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: 26 }}>
                <Recap title="PACF">
                  <p>Lo que aporta el valor de hace k pasos cuando ya se cuentan los de en medio (40).</p>
                </Recap>
              </div>
            </div>
          ) : (
            <Entra>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Chips
                  opciones={[
                    { valor: "teorica", texto: "teórica" },
                    { valor: "muestra", texto: "muestra" },
                  ]}
                  valor={verMuestra ? "muestra" : "teorica"}
                  onChange={(v) => setVerMuestra(v === "muestra")}
                />
                <Boton onClick={() => (setSemilla((s) => s + 1), setVerMuestra(true))}>otra muestra</Boton>
              </div>
              <p style={{ ...TXT, marginTop: 28 }}>
                La que se corta dice el orden. Pero <span style={ROJO}>con datos, las barras tiemblan</span>: esta lectura propone candidatos, no decide.
              </p>
              <p style={{ ...TXT, marginTop: 18, color: "var(--text-2)" }}>Si ninguna se corta, es un ARMA y el orden se decide de otra forma (48).</p>
            </Entra>
          )}
        </Entra>
      )}

      {caso && (
        <div style={{ display: "grid", gridTemplateColumns: "1100px 1fr", gap: 56 }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: 44 }}>
              <span className="label">∇∇₁₂ log, 1949–1959 · {n} valores</span>
              {step >= 5 && (
                <Chips
                  opciones={[
                    { valor: "blanco", texto: "ruido blanco" },
                    { valor: "bartlett", texto: "Bartlett" },
                  ]}
                  valor={banda}
                  onChange={setBanda}
                />
              )}
            </div>
            <Correlogram valores={R} n={n} ancho={1100} alto={270} titulo="ACF" banda={banda} marcar={step >= 4 ? ESTACIONALES : []} atenuar={atenuar} rotular={rotular} y={[-0.5, 0.5]} />
            <div style={{ marginTop: 8 }}>
              <Correlogram valores={P} n={n} ancho={1100} alto={270} titulo="PACF" marcar={step >= 4 ? ESTACIONALES : []} atenuar={atenuar} rotular={step <= 4 ? rotular : []} y={[-0.5, 0.5]} />
            </div>
          </div>
          <div style={{ paddingTop: 50 }}>
            {step === 2 && (
              <Entra>
                <p style={TXT}>
                  <b>Corto plazo</b> (1 a 11). La ACF sale en 1 ({f2(R[1])}) y en 2 ya está dentro: <span style={ROJO}>q = 1</span>.
                </p>
                <p style={{ ...TXT, marginTop: 18 }}>
                  La PACF hace lo mismo ({f2(P[1])} y {f2(P[2])}): también podría ser <span style={ROJO}>p = 1</span>.
                </p>
              </Entra>
            )}
            {step === 3 && (
              <Entra>
                <p style={TXT}>
                  El 3 sale en las dos ({f2(R[3])} y {f2(P[3])}).
                </p>
                <p style={{ ...TXT, marginTop: 18 }}>Con 36 barras, unas 2 salen por puro azar: no basta para pedir un orden 3.</p>
              </Entra>
            )}
            {step === 4 && (
              <Entra>
                <p style={TXT}>
                  <b>Años</b> (12, 24 y 36): se lee igual, contando en años. La ACF se corta en 12 ({f2(R[12])}): <span style={ROJO}>un MA(1) de años, Q = 1</span>.
                </p>
                <p style={{ ...TXT, marginTop: 18 }}>La PACF va bajando ({f2(P[12])}, {f2(P[24])}, {f2(P[36])}), como espera la regla para un MA.</p>
              </Entra>
            )}
            {step === 5 && (
              <Entra>
                <p style={TXT}>
                  La banda de Bartlett se ensancha: supone que las barras anteriores son reales. Es la que dibuja <span className="mono">plot_acf</span>. Con ella quedan fuera{" "}
                  {fueraDeBanda(R, n, "bartlett").join(", ")}.
                </p>
                <p style={{ ...TXT, marginTop: 18 }}>Candidatos:</p>
                <p className="mono" style={{ margin: "6px 0 0", fontSize: 24, color: "var(--red-2)", lineHeight: 1.5 }}>
                  SARIMA(0,1,1)(0,1,1)₁₂
                  <br />
                  SARIMA(1,1,0)(0,1,1)₁₂
                </p>
              </Entra>
            )}
            {step >= 6 && (
              <Entra>
                <p className="takeaway" style={{ margin: 0 }}>
                  La que se corta dice el orden. En pasajeros: <em>un MA(1) de meses, o un AR(1), y un MA(1) de años.</em> Qué es lo de años: 47. Cuál de los dos: 48.
                </p>
              </Entra>
            )}
          </div>
        </div>
      )}
    </SlideFrame>
  );
}
