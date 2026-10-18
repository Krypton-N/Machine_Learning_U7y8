import { Def } from "../components/Piezas";
import { Entra } from "../components/Reveal";
import { RedTemporal, sub } from "../components/RedTemporal";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { CLIMA, OBS_EJEMPLO } from "../lib/clima";

const TXT = { fontSize: 26, lineHeight: 1.45, margin: 0 } as const;
const APLICACIONES = [
  ["el audio de una frase", "las palabras que se dijeron"],
  ["las palabras de una oración", "su categoría gramatical"],
  ["una secuencia de ADN", "qué tramos son genes"],
];

// Un clic, una idea: 0–3 el concepto (AR contra estado oculto, definiciones, dónde aparece); 4–5 el caso del amigo.
export default function CausasOcultas({ step }: SlideProps) {
  const caso = step >= 4;
  return (
    <SlideFrame section={["U8 · Datos secuenciales", "H. HMM"]} num={51} caso={caso ? "Clima" : null} title="Causas ocultas: deducir lo que no se ve">
      <div style={{ display: "grid", gridTemplateColumns: "1000px 1fr", gap: 80, height: "100%" }}>
        <div>
          {step <= 2 && (
            <>
              <span className="label">Esquema · {step === 0 ? "una serie, como AR" : "un modelo con estados ocultos"}</span>
              <div style={{ marginTop: 24 }}>
                <RedTemporal
                  T={4}
                  variante={step === 0 ? "ar" : "hmm"}
                  ancho={1000}
                  alto={420}
                  rotuloOculto={() => "?"}
                  rotuloVisto={(t) => (step === 0 ? `y${sub(t)}` : `o${sub(t)}`)}
                  rotulosFila={["no se ve", "se mide"]}
                />
              </div>
            </>
          )}
          {step === 3 && (
            <Entra>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 60px 1fr", rowGap: 0, marginTop: 30 }}>
                <span className="label" style={{ paddingBottom: 14 }}>Se ve</span>
                <span />
                <span className="label" style={{ paddingBottom: 14 }}>Oculto</span>
                {APLICACIONES.flatMap(([ve, oculto]) => [
                  <div key={ve} style={{ ...TXT, padding: "22px 0", borderTop: "1px solid var(--line-2)" }}>
                    {ve}
                  </div>,
                  <div key={`${ve}→`} style={{ ...TXT, padding: "22px 0", borderTop: "1px solid var(--line-2)", color: "var(--text-3)" }}>
                    →
                  </div>,
                  <div key={oculto} style={{ ...TXT, padding: "22px 0", borderTop: "1px solid var(--line-2)", color: "var(--red-2)" }}>
                    {oculto}
                  </div>,
                ])}
              </div>
            </Entra>
          )}
          {caso && (
            <Entra>
              <span className="label">Lo que te cuenta tu amigo, tres días</span>
              <div style={{ marginTop: 24 }}>
                <RedTemporal
                  T={3}
                  variante="hmm"
                  ancho={1000}
                  alto={420}
                  rotuloOculto={() => "?"}
                  rotuloVisto={(t) => CLIMA.symbols[OBS_EJEMPLO[t]]}
                  rotulosFila={["el clima", "lo que hizo"]}
                />
              </div>
            </Entra>
          )}
        </div>

        <div style={{ paddingTop: 50 }}>
          {step === 0 && (
            <Entra>
              <p style={TXT}>En una serie de tiempo modelamos lo que medimos: el valor de hoy depende de los anteriores.</p>
            </Entra>
          )}
          {step === 1 && (
            <Entra>
              <p style={TXT}>
                A veces lo que medimos es solo el <b>efecto</b> de algo que no vemos: un <span style={{ color: "var(--red-2)" }}>estado oculto</span>.
              </p>
            </Entra>
          )}
          {step === 2 && (
            <Entra style={{ display: "grid", gap: 30 }}>
              <Def termino="Observada">lo que se mide.</Def>
              <Def termino="Oculta">lo que la produce y no se mide.</Def>
              <p style={TXT}>
                El objetivo: <b>deducir lo oculto</b> a partir de lo observado.
              </p>
            </Entra>
          )}
          {step === 3 && (
            <Entra>
              <p style={TXT}>El mismo problema en la voz, el lenguaje y la biología.</p>
            </Entra>
          )}
          {caso && (
            <Entra style={{ display: "grid", gap: 34 }}>
              <p style={TXT}>
                Tu amigo vive en otra ciudad. Cada día te cuenta qué hizo, pero nunca qué clima hubo. ¿Puedes deducirlo?
              </p>
              {step >= 5 && (
                <Entra>
                  <p className="takeaway" style={{ margin: 0 }}>
                    Dos preguntas: ¿qué tan <em>probable</em> es lo que me contó? y ¿qué <em>clima</em> lo explica mejor?
                  </p>
                </Entra>
              )}
            </Entra>
          )}
        </div>
      </div>
    </SlideFrame>
  );
}
