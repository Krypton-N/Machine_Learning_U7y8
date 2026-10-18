import { useMemo, useState } from "react";
import { Correlogram, fueraDeBanda } from "../components/Correlogram";
import { Dispersion } from "../components/Dispersion";
import { Boton } from "../components/Piezas";
import { Recap } from "../components/Recap";
import { Entra } from "../components/Reveal";
import { SeriesChart } from "../components/SeriesChart";
import { TeX } from "../components/TeX";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { media } from "../lib/metricas";
import { entrenamiento, pasajeros, TRANSFORMACIONES_ENT } from "../lib/pasajeros";
import { mulberry32 } from "../lib/rng";
import { acf, choques, desviacionMuestral } from "../lib/series";
import { N_CHOQUES, SEMILLA_CHOQUES } from "./choquesG";

const K = 24;
const H = 12; // pasos que se pronostican
const N = pasajeros.nEntrenamiento;
const PRUEBA = { desde: N - 0.5, hasta: N + H - 1, texto: "PRUEBA · 1960", color: "var(--line)" };

// Caso: pasajeros 1949–1959 y, ya transformados, ∇∇₁₂ log.
const ACF_PAS = acf(entrenamiento, K);
const W = TRANSFORMACIONES_ENT.dd12log;
const ACF_W = acf(W.valores, K);
const FUERA_W = fueraDeBanda(ACF_W, W.valores.length);

const TXT = { fontSize: 26, lineHeight: 1.42, margin: 0 } as const;
const CONDICIONES = ["En promedio, cero.", "La misma dispersión siempre.", "Ningún parecido entre momentos distintos:"];

// Un clic, una idea: 0–3 el concepto con ruido simulado; 4–6 el caso; 7 el cierre.
export default function RuidoBlanco({ step }: SlideProps) {
  const [semilla, setSemilla] = useState(SEMILLA_CHOQUES);
  const ruido = useMemo(() => choques(N_CHOQUES, mulberry32(semilla)), [semilla]);
  const r = useMemo(() => acf(ruido, K), [ruido]);
  const mu = media(ruido);
  const s = desviacionMuestral(ruido);
  const caso = step >= 4;
  const otraMuestra = <Boton onClick={() => setSemilla((v) => v + 1)}>otra muestra</Boton>;

  return (
    <SlideFrame
      section={["U8 · Datos secuenciales", "G. Modelos de series"]}
      num={41}
      caso={caso ? "Pasajeros aéreos" : null}
      title="Ruido blanco: lo que ya no se puede predecir"
      lede="La clase pasada quedaron dos huellas, en 1 y en 12. Antes de modelarlas: ¿cómo se ve una serie en la que ya no queda nada que aprender?"
    >
      {step === 0 && (
        <Entra style={{ display: "grid", gridTemplateColumns: "1040px 1fr", gap: 64 }}>
          <div>
            <span className="label">Esquema · simulado con ruido normal · {N_CHOQUES} valores</span>
            <SeriesChart ancho={1040} alto={430} series={[{ id: "ruido", valores: ruido, grosor: 1.6 }]} eje="indice" sinMarcasX rotuloX="tiempo →" />
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="label natural">ε ES RUIDO BLANCO SI…</span>
              {otraMuestra}
            </div>
            <ol style={{ ...TXT, paddingLeft: 32, marginTop: 18, display: "grid", gap: 12 }}>
              {CONDICIONES.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ol>
            <div style={{ fontSize: 28, marginTop: 14, paddingLeft: 32 }}>
              <TeX>{"\\operatorname{Corr}(\\varepsilon_t,\\ \\varepsilon_{t-k}) = 0"}</TeX>
            </div>
          </div>
        </Entra>
      )}

      {step === 1 && (
        <Entra style={{ display: "grid", gridTemplateColumns: "1040px 1fr", gap: 64 }}>
          <div>
            <Correlogram valores={r} n={ruido.length} ancho={1040} alto={460} titulo="ACF del ruido" contador y={[-0.5, 0.5]} />
          </div>
          <div style={{ display: "grid", gap: 24, alignContent: "start" }}>
            <div>{otraMuestra}</div>
            <Recap title="la banda">
              <p>Si la serie fuera ruido blanco, 95 de cada 100 barras caerían dentro de ±1.96/√n (39).</p>
              <p style={{ marginTop: 12 }}>Con 24 barras, por puro azar sale una en promedio. No tienen que salir cero.</p>
            </Recap>
          </div>
        </Entra>
      )}

      {step === 2 && (
        <Entra style={{ display: "grid", gridTemplateColumns: "520px 1fr", gap: 80, alignItems: "center" }}>
          <Dispersion
            x={ruido.slice(0, -1)}
            y={ruido.slice(1)}
            ancho={520}
            alto={500}
            rotuloX="valor de ayer"
            rotuloY="valor de hoy"
            dominioX={[-3.5, 3.5]}
            dominioY={[-3.5, 3.5]}
            radio={4}
            fmt={(v) => String(v)}
          />
          <p style={{ ...TXT, maxWidth: 760 }}>
            Cada punto es un valor contra el anterior. La nube es redonda: <span className="mono">r₁ = {r[1].toFixed(2)}</span>. Saber cómo fue ayer{" "}
            <span style={{ color: "var(--red-2)" }}>no dice nada</span> de hoy.
          </p>
        </Entra>
      )}

      {step === 3 && (
        <Entra style={{ display: "grid", gridTemplateColumns: "1040px 1fr", gap: 64 }}>
          <div>
            <span className="label">Esquema · el ruido y lo que se pronostica para los {H} pasos siguientes</span>
            <SeriesChart
              ancho={1040}
              alto={430}
              series={[
                { id: "ruido", valores: ruido, grosor: 1.6 },
                { id: "pronostico", valores: new Array(H).fill(mu), desde: N_CHOQUES, color: "var(--red)", grosor: 3 },
              ]}
              ventana={[0, N_CHOQUES + H - 1]}
              eje="indice"
              sinMarcasX
              rotuloX="tiempo →"
              franjas={[{ id: "f", desde: N_CHOQUES, abajo: new Array(H).fill(mu - 1.96 * s), arriba: new Array(H).fill(mu + 1.96 * s) }]}
            />
          </div>
          <p style={{ ...TXT, paddingTop: 40 }}>
            Si el pasado no dice nada, lo mejor que se puede pronosticar es <span style={{ color: "var(--red-2)" }}>la media</span>, a cualquier distancia. La franja: donde
            caería el 95 % de los valores.
          </p>
        </Entra>
      )}

      {step === 4 && (
        <Entra style={{ display: "grid", gridTemplateColumns: "1040px 1fr", gap: 64 }}>
          <div>
            <span className="label">Pasajeros 1949–1959 · 1960 se guarda</span>
            <SeriesChart
              ancho={1040}
              alto={430}
              series={[{ id: "pasajeros", valores: entrenamiento, grosor: 2 }]}
              ventana={[0, N + H - 1]}
              bandas={[PRUEBA]}
              rotuloY="miles de pasajeros"
            />
          </div>
          <div style={{ display: "grid", gap: 20, alignContent: "start", paddingTop: 40 }}>
            <p style={TXT}>
              Desde aquí todo se ajusta con <span style={{ color: "var(--red-2)" }}>{N} meses</span>, 1949–1959. Los 12 de 1960 se guardan para la prueba.
            </p>
            <p style={{ ...TXT, color: "var(--text-2)" }}>Por eso algunos números cambian un poco respecto a la 36–40, que usaban los 144.</p>
          </div>
        </Entra>
      )}

      {step === 5 && (
        <Entra style={{ display: "grid", gridTemplateColumns: "520px 1fr", gap: 80, alignItems: "center" }}>
          <Dispersion
            x={entrenamiento.slice(0, -1)}
            y={entrenamiento.slice(1)}
            ancho={520}
            alto={500}
            rotuloX="mes anterior"
            rotuloY="este mes"
            dominioX={[100, 560]}
            dominioY={[100, 560]}
            recta="diagonal"
            radio={4}
          />
          <p style={{ ...TXT, maxWidth: 760 }}>
            La misma nube con pasajeros: casi una recta, <span className="mono">r₁ = {ACF_PAS[1].toFixed(2)}</span>. Cada mes se parece mucho al anterior. Eso es{" "}
            <span style={{ color: "var(--red-2)" }}>memoria</span>, y es lo que un modelo aprovecha.
          </p>
        </Entra>
      )}

      {step >= 6 && (
        <Entra>
          <div style={{ display: "grid", gridTemplateColumns: "820px 820px", gap: 56 }}>
            <Correlogram valores={ACF_PAS} n={entrenamiento.length} ancho={820} alto={420} titulo="Pasajeros" contador y={[-0.5, 1]} cada={6} />
            <Correlogram valores={ACF_W} n={W.valores.length} ancho={820} alto={420} titulo="∇∇₁₂ log" contador rotular={[1, 12]} y={[-0.5, 1]} cada={6} />
          </div>
          {step === 6 ? (
            <p style={{ ...TXT, marginTop: 22 }}>
              Transformada (logaritmo, sin tendencia ni estación) casi todo cae dentro. Salen {FUERA_W.join(", ")}; las mayores siguen siendo{" "}
              <span style={{ color: "var(--red-2)" }}>1 y 12</span>.
            </p>
          ) : (
            <Entra>
              <p className="takeaway" style={{ margin: "18px 0 0" }}>
                Pasajeros está muy lejos del ruido blanco; transformada, casi. <em>Un modelo sirve si lo que le sobra parece ruido blanco.</em> Se revisa en la 48.
              </p>
            </Entra>
          )}
        </Entra>
      )}
    </SlideFrame>
  );
}
