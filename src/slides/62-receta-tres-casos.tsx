import { motion } from "motion/react";
import { pct } from "../components/Piezas";
import { PASOS_RECETA, Receta } from "../components/Receta";
import { Entra } from "../components/Reveal";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { adultMuestra, comparacion } from "../lib/adult";
import { climaSimulado as SIM } from "../lib/climaSimulado";
import { viterbiLog } from "../lib/hmm";
import { ANIO_INICIAL, enMiles, entrenamiento, modelos, pasajeros, prueba } from "../lib/pasajeros";
import { ingenuoEstacional, mae } from "../lib/series";

const TXT = { fontSize: 26, lineHeight: 1.45, margin: 0 } as const;
const miles = (n: number) => n.toLocaleString("es-MX");

// ---------- Adult (comparacion_adult.json, la misma de la 27) ----------
const f1 = (nombre: string) => comparacion.find((m) => m.modelo === nombre)!.f1_macro.media;
const MEJOR = comparacion.reduce((a, m) => (m.f1_macro.media > a.f1_macro.media ? m : a));
const N_PLIEGUES = adultMuestra.pliegues.length;

// ---------- Pasajeros (los mismos cálculos de la 49) ----------
const N = pasajeros.nEntrenamiento;
const ANIO_PRUEBA = ANIO_INICIAL + N / 12;
const MAE_SARIMA = mae(prueba, enMiles(modelos.elegido.pronostico_log));
const MAE_INGENUO = mae(prueba, ingenuoEstacional(entrenamiento, 12));
const sub12 = "₁₂";
const ORDEN = `SARIMA(${modelos.elegido.orden.join(",")})(${modelos.elegido.estacional.slice(0, 3).join(",")})${sub12}`;

// ---------- Clima (la prueba de la 61) ----------
const B = SIM.base;
const vit = viterbiLog(B.aprendido, B.prueba.obs).camino;
const ACIERTO = vit.filter((q, t) => q === B.prueba.estados[t]).length / B.prueba.estados.length;

type Renglon = { caso: string; completo: string[]; claves: string[] };
const RENGLONES: Renglon[] = [
  {
    caso: "Adult",
    completo: [
      `${miles(adultMuestra.n)} personas, ${adultMuestra.columnas.length} variables`,
      "un árbol y sus ensambles: bagging, Random Forest y boosting",
      `${N_PLIEGUES} pliegues estratificados: cada persona es independiente, barajar está bien`,
      `F1-macro: ${MEJOR.modelo} ${MEJOR.f1_macro.media.toFixed(3)}; decir siempre "no", ${f1("Clase mayoritaria").toFixed(3)}`,
    ],
    claves: ["personas", "ensambles", `${N_PLIEGUES} pliegues, barajados`, "F1-macro"],
  },
  {
    caso: "Pasajeros",
    completo: [
      `${pasajeros.valores.length} meses, ${ANIO_INICIAL}–${ANIO_PRUEBA}`,
      ORDEN,
      `${ANIO_PRUEBA} aparte, y un origen móvil año por año: nunca barajar`,
      `MAE en ${ANIO_PRUEBA}: ${MAE_SARIMA.toFixed(1)} mil contra ${MAE_INGENUO.toFixed(1)} de copiar ${ANIO_PRUEBA - 1}`,
    ],
    claves: ["meses", "SARIMA", `${ANIO_PRUEBA} aparte, en orden`, "MAE"],
  },
  {
    caso: "Clima",
    completo: [
      `un diario simulado de ${miles(SIM.nEntrenamiento)} días`,
      "HMM, λ = (π, A, B) aprendido con Baum-Welch",
      `los ${miles(SIM.nPrueba)} días siguientes, aparte y sin barajar`,
      `log-verosimilitud y días con el clima correcto: Viterbi ${pct(ACIERTO, 0)}`,
    ],
    claves: ["días", "HMM", `${miles(SIM.nPrueba)} días después, en orden`, "log-verosimilitud"],
  },
];
const COL = "200px repeat(4, 1fr)";
const ANCHO_COL = (1696 - 200 - 4 * 24) / 4;

// Un clic, una idea: 0 la receta vacía · 1–3 un caso por clic (el anterior queda en palabras clave) ·
// 4 lo que cambia es la validación · 5 la pregunta que queda.
export default function RecetaTresCasos({ step }: SlideProps) {
  const activo = step >= 1 && step <= 3 ? step - 1 : -1;
  const validacion = step >= 4;
  const caso = activo >= 0 ? RENGLONES[activo].caso : null;
  return (
    <SlideFrame section={["Cierre", "Resumen"]} num={62} caso={caso} title="La misma receta en los tres casos">
      <div style={{ display: "grid", gridTemplateColumns: COL, gap: 24 }}>
        <span />
        <div style={{ gridColumn: "2 / 6" }}>
          <Receta franja textos={["", "", "", ""]} resaltar={validacion ? 2 : undefined} />
        </div>
      </div>

      <div style={{ position: "relative", marginTop: 18 }}>
        {RENGLONES.map((r, i) => {
          const completo = i === activo;
          const visible = step >= 4 || i <= activo;
          return (
            <motion.div
              key={r.caso}
              layout
              style={{ display: "grid", gridTemplateColumns: COL, gap: 24, borderTop: "1px solid var(--line-2)", padding: completo ? "22px 0 26px" : "14px 0", alignItems: "baseline" }}
            >
              <span className="mono" style={{ fontSize: 24, color: completo ? "var(--red-2)" : "var(--text-2)", letterSpacing: "0.08em" }}>
                {r.caso.toUpperCase()}
              </span>
              {PASOS_RECETA.map((p, k) => {
                if (!visible) return <span key={p} />;
                const atenuar = validacion && k !== 2;
                return completo ? (
                  <Entra key={`c${p}`}>
                    <p style={TXT}>{r.completo[k]}</p>
                  </Entra>
                ) : (
                  <motion.span
                    key={`k${p}`}
                    data-rotulo
                    className="mono"
                    style={{ fontSize: 22, color: validacion && k === 2 ? "var(--text)" : "var(--text-2)" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: atenuar ? 0.45 : 1 }}
                  >
                    {r.claves[k]}
                  </motion.span>
                );
              })}
            </motion.div>
          );
        })}
        <div style={{ borderTop: "1px solid var(--line-2)" }} />
        {validacion && (
          <motion.div
            // La columna Validación: después de los 200 px de nombres y de dos columnas, cada una con su hueco de 24 px.
            style={{
              position: "absolute",
              top: -96,
              bottom: -12,
              left: 200 + 24 + 2 * (ANCHO_COL + 24) - 12,
              width: ANCHO_COL + 24,
              border: "2px solid var(--red)",
              pointerEvents: "none",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>
        {step === 0 && (
          <Entra>
            <p style={TXT}>La receta de la diapositiva 3 no cambió. Veamos cómo se llenó en cada caso.</p>
          </Entra>
        )}
        {step === 4 && (
          <Entra>
            <p style={TXT}>
              Lo que cambia entre los casos es <b style={{ color: "var(--red-2)" }}>cómo se valida</b>: si el orden importa, la prueba va después y nunca se
              baraja.
            </p>
          </Entra>
        )}
        {step >= 5 && (
          <Entra>
            <p className="takeaway" style={{ margin: 0 }}>
              Antes de creer un número, pregunta: ¿con qué <em>datos</em>?, ¿cómo se <em>validó</em>?, ¿con qué <em>métrica</em>?
            </p>
          </Entra>
        )}
      </div>
    </SlideFrame>
  );
}
