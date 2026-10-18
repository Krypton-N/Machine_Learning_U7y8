import { useEffect, useState } from "react";
import { Barras } from "../components/Barras";
import { LagCloud3D } from "../components/LagCloud3D";
import { Chips } from "../components/Piezas";
import { Recap } from "../components/Recap";
import { Entra } from "../components/Reveal";
import { SeriesChart } from "../components/SeriesChart";
import { TeX } from "../components/TeX";
import { useFlechas } from "../deck/hooks";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { media } from "../lib/metricas";
import { pasajeros, TRANSFORMACIONES_ENT } from "../lib/pasajeros";
import { ajustarAR, pesosPsi, pronosticarAR, simularARMA } from "../lib/series";
import { CHOQUES } from "./choquesG";

// ---------- Concepto: un AR(1) con los mismos choques de la 41 ----------
const PHIS = [0, 0.5, 0.9, -0.6, 1] as const;
const K_ECO = 20;
const LEE_PHI = new Map<number, string>([
  [0, "φ = 0: no recuerda nada; es el ruido de la 41"],
  [0.5, "φ = 0.5: recuerda la mitad de ayer"],
  [0.9, "φ = 0.9: recuerda casi todo; sube y baja en rachas largas"],
  [-0.6, "φ = −0.6: lo que subió ayer tiende a bajar hoy; zigzaguea"],
  [1, "φ = 1: caminata aleatoria (35 y 37); ya no es estacionaria"],
]);

// ---------- Caso: crecimiento anual, ∇₁₂ log, con 1950–1959 ----------
const N = pasajeros.nEntrenamiento;
const Z = TRANSFORMACIONES_ENT.d12log;
const z = Z.valores;
/** Del logaritmo de un cociente al porcentaje exacto: e^z − 1. */
const pct = (v: number) => (Math.exp(v) - 1) * 100;
const AR1 = ajustarAR(z, 1);
const AR2 = ajustarAR(z, 2);
const MU2 = AR2.c / (1 - AR2.phis[0] - AR2.phis[1]);
const PRONOSTICO = pronosticarAR(AR2, z, 12);
const CENTRO = media(z);
const PUNTOS = z.slice(2).map((hoy, i): [number, number, number] => [z[i], z[i + 1], hoy]);
const RADIO = 1.08 * Math.max(...z.map((v) => Math.abs(v - CENTRO)));
const PRUEBA = { desde: N - 0.5, hasta: N + 11, texto: "PRUEBA · 1960", color: "var(--line)" };
const f1 = (v: number) => `${v.toFixed(1)} %`;
const TXT = { fontSize: 26, lineHeight: 1.42, margin: 0 } as const;
const ROJO = { color: "var(--red-2)" };

// Un clic, una idea: 0–1 el concepto; 2–5 el caso (la serie, la recta, el plano, el pronóstico); 6 el cierre.
export default function AR({ step, active }: SlideProps) {
  const [phi, setPhi] = useState<(typeof PHIS)[number]>(0.9);
  useEffect(() => {
    if (step === 0) setPhi(0.9);
  }, [step]);
  const mover = (d: number) => setPhi((p) => PHIS[(PHIS.indexOf(p) + d + PHIS.length) % PHIS.length]);
  useFlechas(active && step <= 1, () => mover(-1), () => mover(1));

  const sim = simularARMA([phi], [], CHOQUES);
  const eco = pesosPsi([phi], [], K_ECO);
  const caso = step >= 2;
  const nube = step === 3 || step === 4;

  const crecimiento = (
    <div>
      <span className="label">Crecimiento anual · ∇₁₂ log, en %</span>
      <SeriesChart
        ancho={1040}
        alto={440}
        series={[
          { id: "z", valores: z.map(pct), desde: Z.desde, grosor: 2 },
          ...(step >= 5 ? [{ id: "pron", valores: PRONOSTICO.map(pct), desde: N, color: "var(--red)", grosor: 3, puntos: true }] : []),
        ]}
        ventana={[Z.desde, N + 11]}
        bandas={[PRUEBA]}
        lineasH={
          // Con el pronóstico a la vista, las dos medias quedan casi juntas y sus rótulos se enciman: se dicen en el texto.
          step >= 5
            ? [
                { y: pct(CENTRO), color: "var(--text-3)" },
                { y: pct(MU2), color: "var(--red-2)" },
              ]
            : [{ y: pct(CENTRO), texto: `media ${f1(pct(CENTRO))}`, color: "var(--text-3)", abajo: true }]
        }
        fmtY={(v) => `${v} %`}
        pasoY={10}
      />
    </div>
  );

  return (
    <SlideFrame
      section={["U8 · Datos secuenciales", "G. Modelos de series"]}
      num={42}
      caso={caso ? "Pasajeros aéreos" : null}
      title="AR(p): la serie se explica con su propio pasado"
      lede="Un modelo autorregresivo es una regresión del valor de hoy sobre los valores anteriores de la misma serie."
    >
      {!caso && (
        <Entra style={{ display: "grid", gridTemplateColumns: "1040px 1fr", gap: 64 }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
              <span className="label">{step === 0 ? "Esquema · los mismos choques de la 41" : "Esquema · eco de un choque"}</span>
              <Chips opciones={PHIS.map((v) => ({ valor: v, texto: `φ = ${v}` }))} valor={phi} onChange={setPhi} />
            </div>
            {step === 0 ? (
              <SeriesChart ancho={1040} alto={400} series={[{ id: "ar", valores: sim, grosor: 1.6 }]} eje="indice" sinMarcasX rotuloX="tiempo →" transicion={0.5} />
            ) : (
              <Barras
                valores={eco}
                etiquetas={eco.map((_, k) => (k % 5 === 0 ? String(k) : ""))}
                ancho={1040}
                alto={400}
                y={[-1, 1]}
                pasoY={0.5}
                fmtY={(v) => v.toFixed(1)}
                rotulo={`cuánto queda del choque k pasos después: φᵏ, con φ = ${phi}`}
                rojo={(k) => k === 0}
              />
            )}
            <p className="mono" style={{ fontSize: 22, color: phi === 1 ? "var(--red-2)" : "var(--text-2)", margin: "8px 0 0" }}>
              {LEE_PHI.get(phi)}
            </p>
          </div>
          {step === 0 ? (
            <div>
              <p style={TXT}>
                Hoy = una fracción φ de ayer <span style={ROJO}>+ un choque nuevo</span>.
              </p>
              <div style={{ fontSize: 30, margin: "18px 0 28px" }}>
                <TeX>{"x_t = \\phi\\, x_{t-1} + \\varepsilon_t"}</TeX>
              </div>
              <Recap title="regresión">
                <p>Una recta que predice una cosa a partir de otras (40). Aquí las otras son la misma serie, uno o más pasos atrás.</p>
              </Recap>
            </div>
          ) : (
            <Entra>
              <p style={TXT}>
                Si <TeX>{"|\\phi| < 1"}</TeX>, el eco se apaga y la serie <span style={ROJO}>siempre vuelve a su media</span>:
              </p>
              <div style={{ fontSize: 30, margin: "18px 0" }}>
                <TeX>{"\\mu = \\dfrac{c}{1-\\phi}"}</TeX>
              </div>
              <p style={{ ...TXT, color: "var(--text-2)" }}>Con φ = 1 el choque se queda para siempre: la serie no tiene a dónde regresar.</p>
            </Entra>
          )}
        </Entra>
      )}

      {caso && (
        <div style={{ display: "grid", gridTemplateColumns: "1040px 1fr", gap: 64 }}>
          {nube ? (
            <div style={{ height: 600 }}>
              <LagCloud3D
                puntos={PUNTOS}
                radio={RADIO}
                centro={CENTRO}
                recta={step === 3 ? { a: AR1.c, b: AR1.phis[0] } : undefined}
                plano={step === 4 ? { c: AR2.c, b1: AR2.phis[0], b2: AR2.phis[1] } : undefined}
                residuos={step === 4}
                vista={step === 3 ? "canto" : "libre"}
                nombres={["antier", "ayer", "hoy"]}
              />
            </div>
          ) : (
            crecimiento
          )}

          {step === 2 && (
            <Entra style={{ paddingTop: 40 }}>
              <p style={TXT}>
                Cada mes contra el mismo mes del año anterior. En promedio se creció <span style={ROJO}>{f1(pct(CENTRO))}</span> al año.
              </p>
              <p style={{ ...TXT, marginTop: 18 }}>¿Ayuda saber cuánto se creció el mes anterior?</p>
            </Entra>
          )}
          {step === 3 && (
            <Entra style={{ paddingTop: 40 }}>
              <p style={TXT}>
                Cada punto es un mes. A lo ancho, cuánto se creció el mes anterior («ayer»); hacia arriba, este («hoy»).
              </p>
              <p style={{ ...TXT, marginTop: 18 }}>
                Pendiente de la recta: <span className="mono" style={ROJO}>φ̂ = {AR1.phis[0].toFixed(2)}</span>. Si un mes creció mucho, el siguiente también.
              </p>
            </Entra>
          )}
          {step === 4 && (
            <Entra style={{ paddingTop: 20 }}>
              <p style={TXT}>Con dos meses atrás ya no es una recta, es un plano. AR(p) en general:</p>
              <div style={{ fontSize: 28, margin: "16px 0" }}>
                <TeX>{"x_t = c + \\phi_1 x_{t-1} + \\dots + \\phi_p x_{t-p} + \\varepsilon_t"}</TeX>
              </div>
              <p style={TXT}>
                Aquí <span className="mono" style={ROJO}>φ̂₁ = {AR2.phis[0].toFixed(2)}</span> y <span className="mono" style={ROJO}>φ̂₂ = {AR2.phis[1].toFixed(2)}</span>: antier
                aporta un poco. En rojo, lo que el plano no explica.
              </p>
            </Entra>
          )}
          {step === 5 && (
            <Entra style={{ paddingTop: 40 }}>
              <p style={TXT}>
                El pronóstico del AR(2) para 1960 empieza en <span style={ROJO}>{f1(pct(PRONOSTICO[0]))}</span> y baja hacia la media del modelo, {f1(pct(MU2))} (la línea roja).
              </p>
              <p style={{ ...TXT, marginTop: 18, color: "var(--text-2)" }}>1960 sigue guardado.</p>
            </Entra>
          )}
          {step >= 6 && (
            <Entra style={{ paddingTop: 40 }}>
              <p className="takeaway" style={{ margin: 0 }}>
                Un AR es una regresión de la serie sobre su propio pasado. <em>Su pronóstico regresa a la media:</em> el pasado reciente pesa, pero cada vez menos.
              </p>
            </Entra>
          )}
        </div>
      )}
    </SlideFrame>
  );
}
