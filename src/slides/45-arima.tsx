import { useEffect, useState } from "react";
import { Barras } from "../components/Barras";
import { Correlogram } from "../components/Correlogram";
import { Boton } from "../components/Piezas";
import { Entra } from "../components/Reveal";
import { SeriesChart } from "../components/SeriesChart";
import { TeX } from "../components/TeX";
import { useFlechas } from "../deck/hooks";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { enMiles, entrenamiento, MESES, MESES_COMPLETOS, modelos, pasajeros, prueba, TRANSFORMACIONES_ENT } from "../lib/pasajeros";
import { ejeQueCubre } from "../lib/scale";
import { acf, acumular, diferencia, mae } from "../lib/series";
import { CHOQUES, N_CHOQUES } from "./choquesG";

// ---------- Concepto: la caminata es la suma acumulada de los mismos choques ----------
const CAMINATA = acumular(CHOQUES);
const H_CAMINATA = 24;
const ULTIMO = CAMINATA[N_CHOQUES - 1];
// Los choques simulados son normales con σ = 1: el abanico exacto de la caminata es ±1.96·√h.
const ABANICO = Array.from({ length: H_CAMINATA }, (_, j) => 1.96 * Math.sqrt(j + 1));
const Y_CAMINATA = ejeQueCubre([...CAMINATA, ULTIMO + ABANICO[H_CAMINATA - 1], ULTIMO - ABANICO[H_CAMINATA - 1]], 5).dominio;
const SALTO = 5; // ↑ ↓ avanzan de 5 en 5 meses

// ---------- Caso: ARIMA(0,1,1) con deriva sobre el logaritmo ----------
const N = pasajeros.nEntrenamiento;
const DL = TRANSFORMACIONES_ENT.dlog;
const ACF_DL = acf(DL.valores, 24);
const A = modelos.arima;
const LN_DIC = Math.log(entrenamiento[N - 1]);
/** Los 12 cambios mensuales que pronostica el modelo: el primero trae la corrección del MA; los demás son la deriva. */
const CAMBIOS = diferencia([LN_DIC, ...A.pronostico_log], 1);
const NIVEL = enMiles(A.pronostico_log);
const BANDA = { abajo: A.ic95_log.map((f) => Math.exp(f[0])), arriba: A.ic95_log.map((f) => Math.exp(f[1])) };
const ERROR = prueba.map((v, i) => v - NIVEL[i]);
const CORTO = ERROR.flatMap((e, i) => (e > 0 ? [i] : []));
const PEOR = ERROR.indexOf(Math.max(...ERROR));
const PRUEBA = { desde: N - 0.5, hasta: N + 11, texto: "PRUEBA · 1960", color: "var(--line)" };
const VENTANA_NIVEL: [number, number] = [96, N + 11]; // de 1957 a 1960
const Y_NIVEL: [number, number] = [200, 700];
const pct = (v: number) => `${((Math.exp(v) - 1) * 100).toFixed(2)} %`;
const f3 = (v: number) => v.toFixed(3).replace("-", "−");
const f2 = (v: number) => v.toFixed(2).replace("-", "−");
const lista = (ix: number[]) => `${MESES_COMPLETOS[ix[0]]} a ${MESES_COMPLETOS[ix[ix.length - 1]]}`;
const miles = (v: number) => Math.round(v).toLocaleString("es-MX");
const TXT = { fontSize: 26, lineHeight: 1.42, margin: 0 } as const;
const ROJO = { color: "var(--red-2)" };

// Un clic, una idea: 0–2 el concepto (sumar, ARIMA, pronóstico de la caminata); 3–6 el caso; 7 el cierre.
export default function ARIMA({ step, active }: SlideProps) {
  const [t, setT] = useState(20);
  useEffect(() => {
    if (step === 0) setT(20);
  }, [step]);
  useFlechas(
    active && step === 0,
    () => setT((v) => Math.max(1, v - SALTO)),
    () => setT((v) => Math.min(N_CHOQUES - 1, v + SALTO)),
  );
  const hasta = step === 0 ? t : N_CHOQUES - 1;
  const caso = step >= 3;
  const nivel = step >= 5;

  return (
    <SlideFrame
      section={["U8 · Datos secuenciales", "G. Modelos de series"]}
      num={45}
      caso={caso ? "Pasajeros aéreos" : null}
      title="ARIMA(p,d,q): diferenciar, modelar y volver a sumar"
      lede="La I de ARIMA es de integrar: se modela la serie diferenciada y, para pronosticar, se vuelve a sumar."
    >
      {step <= 1 && (
        <Entra style={{ display: "grid", gridTemplateColumns: "1040px 1fr", gap: 64 }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="label">Esquema · los mismos choques, sumados uno tras otro{step === 0 ? " · ↑ ↓" : ""}</span>
              {step === 0 && <Boton onClick={() => setT(N_CHOQUES - 1)}>sumar todos</Boton>}
            </div>
            <SeriesChart
              ancho={1040}
              alto={300}
              series={[{ id: "caminata", valores: CAMINATA.map((v, i) => (i <= hasta ? v : null)), grosor: 2 }]}
              ventana={[0, N_CHOQUES - 1]}
              y={Y_CAMINATA}
              eje="indice"
              sinMarcasX
              rotuloY="la suma"
              cursor={step === 0 ? hasta : undefined}
            />
            <Barras
              valores={CHOQUES}
              ancho={1040}
              alto={170}
              rotulo="los choques: lo que cambia de un paso al siguiente"
              rojo={(i) => step === 0 && i === hasta}
              opacidad={(i) => (i <= hasta ? 1 : 0.25)}
              fmtY={(v) => String(v)}
              grosor={0.7}
              margen={{ l: 64, r: 22, t: 26, b: 10 }}
            />
          </div>
          {step === 0 ? (
            <div style={{ paddingTop: 40 }}>
              <p style={TXT}>
                Sumar los cambios uno tras otro devuelve la serie. Diferenciar quita la tendencia (36); <span style={ROJO}>integrar la devuelve</span>.
              </p>
              <div style={{ fontSize: 30, margin: "22px 0" }}>
                <TeX>{"y_t = y_{t-1} + \\varepsilon_t"}</TeX>
              </div>
              <p className="mono" style={{ fontSize: 22, color: "var(--text-2)", margin: 0, lineHeight: 1.5 }}>
                paso {hasta + 1}: {f2(hasta ? CAMINATA[hasta - 1] : 0)} + {f2(CHOQUES[hasta])}
                <br />= <span style={{ color: "var(--text)" }}>{f2(CAMINATA[hasta])}</span>
              </p>
            </div>
          ) : (
            <Entra style={{ paddingTop: 40 }}>
              <p style={TXT}>
                <b>ARIMA(p,d,q)</b>: se diferencia <b style={ROJO}>d</b> veces, lo que queda se modela con un ARMA(p,q) y, al pronosticar, se vuelve a sumar.
              </p>
              <p style={{ ...TXT, marginTop: 18 }}>La caminata es el ARIMA(0,1,0): diferenciada una vez, es puro ruido.</p>
            </Entra>
          )}
        </Entra>
      )}

      {step === 2 && (
        <Entra style={{ display: "grid", gridTemplateColumns: "1040px 1fr", gap: 64 }}>
          <div>
            <span className="label">Esquema · la caminata y su pronóstico a {H_CAMINATA} pasos</span>
            <SeriesChart
              ancho={1040}
              alto={480}
              series={[
                { id: "caminata", valores: CAMINATA, grosor: 2 },
                { id: "plano", valores: new Array(H_CAMINATA).fill(ULTIMO), desde: N_CHOQUES, color: "var(--red)", grosor: 3 },
              ]}
              ventana={[0, N_CHOQUES + H_CAMINATA - 1]}
              y={Y_CAMINATA}
              eje="indice"
              sinMarcasX
              rotuloX="tiempo →"
              franjas={[{ id: "abanico", desde: N_CHOQUES, abajo: ABANICO.map((a) => ULTIMO - a), arriba: ABANICO.map((a) => ULTIMO + a) }]}
            />
          </div>
          <div style={{ paddingTop: 40 }}>
            <p style={TXT}>
              Si los cambios son ruido, el mejor pronóstico del próximo es 0: <span style={ROJO}>la línea se queda plana</span>. Pero cada paso suma un error más:
            </p>
            <div style={{ fontSize: 30, margin: "22px 0 0" }}>
              <TeX>{"\\hat y_{T+h} = y_T \\;\\pm\\; 1.96\\,\\sigma\\sqrt{h}"}</TeX>
            </div>
          </div>
        </Entra>
      )}

      {step === 3 && (
        <Entra style={{ display: "grid", gridTemplateColumns: "1040px 1fr", gap: 64 }}>
          <div>
            <span className="label">∇ log: el cambio de cada mes respecto al anterior, 1949–1959</span>
            <SeriesChart ancho={1040} alto={480} series={[{ id: "dl", valores: DL.valores, desde: DL.desde, grosor: 1.8 }]} ventana={[0, N + 11]} bandas={[PRUEBA]} fmtY={(v) => v.toFixed(1)} pasoY={0.1} />
          </div>
          <div>
            <Correlogram valores={ACF_DL} n={DL.valores.length} ancho={590} alto={300} titulo="ACF de ∇ log" rotular={[12]} marcar={[12, 24]} y={[-0.5, 1]} />
            <p style={{ ...TXT, marginTop: 18 }}>
              Ya no sube, pero repite un dibujo cada año: <span className="mono" style={ROJO}>r₁₂ = {f2(ACF_DL[12])}</span>.
            </p>
          </div>
        </Entra>
      )}

      {step === 4 && (
        <Entra style={{ display: "grid", gridTemplateColumns: "1040px 1fr", gap: 64 }}>
          <div>
            <span className="label">Los 12 cambios que pronostica para 1960 (en log)</span>
            <Barras
              valores={CAMBIOS}
              etiquetas={MESES}
              ancho={1040}
              alto={480}
              rojo={() => true}
              encima={(i) => (i < 2 ? f3(CAMBIOS[i]) : undefined)}
              fmtY={(v) => v.toFixed(2)}
              pasoY={0.01}
            />
          </div>
          <div style={{ paddingTop: 20 }}>
            <div style={{ fontSize: 28 }}>
              <TeX>{"\\nabla \\ln y_t = c + \\varepsilon_t + \\theta\\,\\varepsilon_{t-1}"}</TeX>
            </div>
            <p style={{ ...TXT, marginTop: 20 }}>
              ARIMA(0,1,1) con deriva: <span className="mono">θ̂ = {f2(A.theta)}</span>. La deriva c es el cambio promedio por mes: <span style={ROJO}>+{pct(A.deriva)}</span>.
            </p>
            <p style={{ ...TXT, marginTop: 18 }}>El primer cambio trae la corrección del MA; los demás son la deriva.</p>
          </div>
        </Entra>
      )}

      {nivel && (
        <div style={{ display: "grid", gridTemplateColumns: "1040px 1fr", gap: 64 }}>
          <div>
            <span className="label">
              Miles · franja: banda del 95 % (recortada; llega a {miles(BANDA.arriba[11])})
            </span>
            <SeriesChart
              ancho={1040}
              alto={480}
              series={[
                { id: "ent", valores: entrenamiento, grosor: 2 },
                { id: "pron", valores: NIVEL, desde: N, color: "var(--red)", grosor: 3, puntos: true },
                ...(step >= 6 ? [{ id: "real", valores: prueba, desde: N, color: "var(--text)", grosor: 2.5, puntos: true }] : []),
              ]}
              ventana={VENTANA_NIVEL}
              y={Y_NIVEL}
              bandas={step >= 6 ? [] : [PRUEBA]}
              franjas={[{ id: "ic", desde: N, ...BANDA }]}
              recortar
            />
          </div>
          {step === 5 && (
            <Entra style={{ paddingTop: 40 }}>
              <p style={TXT}>
                Se pronostica el cambio y luego se suma. Enero: el logaritmo de diciembre de 1959 + {f3(CAMBIOS[0])} → <span style={ROJO}>{miles(NIVEL[0])} mil</span>.
              </p>
              <p style={{ ...TXT, marginTop: 18 }}>La banda se abre cada mes: cada paso suma un error más.</p>
            </Entra>
          )}
          {step === 6 && (
            <Entra style={{ paddingTop: 40 }}>
              <p style={TXT}>
                Se destapa 1960 (blanco). La curva pasa por en medio de la onda: <span style={ROJO}>se queda corta de {lista(CORTO)}</span> (en {MESES_COMPLETOS[PEOR]}, por{" "}
                {miles(ERROR[PEOR])} mil) y se pasa el resto.
              </p>
              <p style={{ ...TXT, marginTop: 18 }}>
                MAE: <span className="mono">{mae(prueba, NIVEL).toFixed(1)}</span> mil.
              </p>
            </Entra>
          )}
          {step >= 7 && (
            <Entra style={{ paddingTop: 40 }}>
              <p className="takeaway" style={{ margin: 0 }}>
                La I resolvió la tendencia. <em>Lo que este modelo no puede ver es que cada verano sube:</em> le falta el rezago 12.
              </p>
            </Entra>
          )}
        </div>
      )}
    </SlideFrame>
  );
}
