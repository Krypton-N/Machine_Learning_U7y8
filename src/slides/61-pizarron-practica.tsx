import { useState } from "react";
import { Barras } from "../components/Barras";
import { Lineas } from "../components/Lineas";
import { Chips, Dato, pct } from "../components/Piezas";
import { Recap } from "../components/Recap";
import { Entra } from "../components/Reveal";
import { TablaCruda } from "../components/TablaCruda";
import { TablasLambda } from "../components/TablasLambda";
import { TeX } from "../components/TeX";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { CLIMA, CORTO, OBS_EJEMPLO } from "../lib/clima";
import { climaSimulado as SIM } from "../lib/climaSimulado";
import { diaUnderflow, forwardEscalado, prefijosSinEscalar, viterbi, viterbiLog, type HMM } from "../lib/hmm";

const TXT = { fontSize: 26, lineHeight: 1.45, margin: 0 } as const;
const LN10 = Math.log(10);
const B = SIM.base;
const NP = SIM.nPrueba;

// ---------- Aprender λ (Baum-Welch de hmmlearn, del JSON) ----------
const bw = B.baumWelch;
const nArranques = bw.arranques.length;
const errorMax = Math.max(
  ...B.aprendido.A.flatMap((r, i) => r.map((v, j) => Math.abs(v - CLIMA.A[i][j]))),
  ...B.aprendido.B.flatMap((r, i) => r.map((v, k) => Math.abs(v - CLIMA.B[i][k]))),
);

// ---------- Decimales que desaparecen (vivo, sobre los 1 000 días de prueba) ----------
const escalado = forwardEscalado(CLIMA, B.prueba.obs).logPrefijo.map((v) => v / LN10);
const crudo = prefijosSinEscalar(CLIMA, B.prueba.obs);
const T0 = diaUnderflow(CLIMA, B.prueba.obs);
const PISO = -480;
const NORMAL = Math.log10(2) * -1022; // menor double normal, 2⁻¹⁰²²
const MINIMO = Math.log10(Number.MIN_VALUE); // menor double (subnormal)

// ---------- Comprobar (navegador contra hmmlearn) ----------
const vEj = viterbi(CLIMA, OBS_EJEMPLO);
const vPrueba = viterbiLog(CLIMA, B.prueba.obs);
const coinciden = vPrueba.camino.filter((q, t) => String(q) === B.hmmlearn.decode_prueba.camino[t]).length;
const COMPROBACION = [
  { que: "ln P de los 3 días", nav: forwardEscalado(CLIMA, OBS_EJEMPLO).logP, ref: SIM.hmmlearnEjemplo.score },
  { que: `Viterbi de los 3 días (${vEj.path.map((j) => CORTO[j]).join(" ")}): ln P*`, nav: Math.log(vEj.best), ref: SIM.hmmlearnEjemplo.decode.logprob },
  { que: `ln P de los ${NP.toLocaleString("es-MX")} días de prueba`, nav: forwardEscalado(CLIMA, B.prueba.obs).logP, ref: B.hmmlearn.score_prueba },
];

// ---------- Evaluar (vivo, con el λ aprendido del JSON) ----------
function evaluar(e: typeof SIM.base) {
  const { obs, estados } = e.prueba;
  const acierto = (c: number[]) => c.filter((q, t) => q === estados[t]).length / estados.length;
  const regla = [0, 1, 2].map((k) => (e.aprendido.B[0][k] >= e.aprendido.B[1][k] ? 0 : 1));
  const porDia = (m: HMM) => forwardEscalado(m, obs).logP / obs.length;
  return {
    real: porDia(e.real),
    aprendido: porDia(e.aprendido),
    sinMemoria: obs.reduce((s, o) => s + Math.log(e.entrenamiento.frecuencias[o]), 0) / obs.length,
    aciertos: [acierto(estados.map(() => e.entrenamiento.mas_comun)), acierto(obs.map((o) => regla[o])), acierto(viterbiLog(e.aprendido, obs).camino)],
    rachas: e.real.A.map((r, i) => 1 / (1 - r[i])),
  };
}
const EVAL = { base: evaluar(SIM.base), persistente: evaluar(SIM.persistente) };
const BARRAS = ["el clima más común", "solo la actividad del día", "Viterbi"];

const TEMAS: [number, number, string][] = [
  [1, 5, "01 · Aprender λ"],
  [6, 7, "02 · Decimales que desaparecen"],
  [8, 8, "03 · Comprobar"],
  [9, 11, "04 · Evaluar"],
];
const RETOS = ["aprender λ", "decimales que desaparecen", "comprobar", "evaluar"];
const APLICACIONES = [
  ["voz", "los reconocedores clásicos (hoy dominan las redes neuronales)"],
  ["lenguaje", "la categoría gramatical de cada palabra"],
  ["biología", "familias de proteínas y genes"],
  ["economía", "cambios de régimen: crecimiento o recesión"],
];

// Ciclo de Baum-Welch (esquema): dos pasos que se repiten.
function CicloEM() {
  const caja = { border: "1px solid var(--line-2)", padding: "18px 24px", fontSize: 27, lineHeight: 1.4, background: "var(--panel)" } as const;
  return (
    <div style={{ position: "relative", width: 780, height: 380 }}>
      <div style={{ ...caja, position: "absolute", left: 0, right: 90, top: 0 }}>
        <b style={{ color: "var(--red-2)" }}>E</b> · con el λ actual, ¿qué tan probable es cada clima cada día?
      </div>
      <div style={{ ...caja, position: "absolute", left: 90, right: 0, bottom: 0 }}>
        <b style={{ color: "var(--red-2)" }}>M</b> · recalcular π, A y B con esas probabilidades.
      </div>
      <svg width={780} height={380} style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}>
        <defs>
          <marker id="em61" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={16} markerHeight={16} markerUnits="userSpaceOnUse" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--text-2)" />
          </marker>
        </defs>
        <path d="M700,118 C760,170 760,220 730,262" fill="none" stroke="var(--text-2)" strokeWidth={2.5} markerEnd="url(#em61)" />
        <path d="M80,262 C20,220 20,170 50,118" fill="none" stroke="var(--text-2)" strokeWidth={2.5} markerEnd="url(#em61)" />
      </svg>
    </div>
  );
}

// Un clic, una idea. 0 los cuatro retos · 1–2 el dato crudo · 3–5 aprender λ · 6–7 decimales · 8 comprobar ·
// 9–11 evaluar · 12 aplicaciones · 13 cierre.
export default function PizarronPractica({ step }: SlideProps) {
  const [escenario, setEscenario] = useState<"base" | "persistente">("persistente");
  const caso = step >= 1 && step <= 11;
  const tema = TEMAS.find(([a, b]) => step >= a && step <= b)?.[2];
  // Hasta el clic 10 todo es el clima del libro; en el 11 entra el persistente (con botones para ir y volver).
  const esc = step <= 10 ? "base" : escenario;
  const ev = EVAL[esc];

  return (
    <SlideFrame section={["U8 · Datos secuenciales", "H. HMM"]} num={61} caso={caso ? "Clima" : null} title="Del pizarrón a la práctica">
      {tema && (
        <span className="label natural" style={{ display: "block", marginBottom: 22, color: "var(--red-2)" }}>
          {tema.toUpperCase().replace("Λ", "λ")}
        </span>
      )}

      {step === 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "760px 1fr", gap: 90 }}>
          <Entra style={{ display: "grid", gap: 6 }}>
            {RETOS.map((r, i) => (
              <div key={r} style={{ display: "flex", gap: 26, alignItems: "baseline", borderTop: "1px solid var(--line-2)", padding: "18px 0" }}>
                <span className="mono" style={{ fontSize: 26, color: "var(--red-2)" }}>
                  0{i + 1}
                </span>
                <span style={{ fontSize: 32, fontWeight: 600 }}>{r}</span>
              </div>
            ))}
          </Entra>
          <Entra>
            <p style={{ ...TXT, paddingTop: 20 }}>Con tres días todo cabe en una tabla. Con datos reales hay que aprender λ, cuidar los decimales y medir qué tan bien funciona.</p>
          </Entra>
        </div>
      )}

      {(step === 1 || step === 2) && (
        <div style={{ display: "grid", gridTemplateColumns: "640px 1fr", gap: 90 }}>
          <TablaCruda datos={SIM.crudo} tamano={26} anotada={step === 2} quitadas={["clima"]} />
          {step === 1 ? (
            <Entra>
              <p style={TXT}>
                El diario del amigo: {SIM.nEntrenamiento.toLocaleString("es-MX")} días simulados con el λ del libro. Cada renglón, un día: qué hizo y qué clima hubo.
                El clima existe solo porque lo simulamos.
              </p>
            </Entra>
          ) : (
            <Entra>
              <p style={TXT}>
                Qué se le cambia: la actividad pasa a 0, 1, 2 y <b>el clima se aparta</b> (solo sirve para medir). La prueba: los{" "}
                {NP.toLocaleString("es-MX")} días siguientes, aparte y sin barajar.
              </p>
            </Entra>
          )}
        </div>
      )}

      {step === 3 && (
        <Entra style={{ display: "grid", gridTemplateColumns: "780px 1fr", gap: 90 }}>
          <div>
            <span className="label">Esquema · Baum-Welch</span>
            <div style={{ marginTop: 20 }}>
              <CicloEM />
            </div>
          </div>
          <div style={{ display: "grid", gap: 30, alignContent: "start", paddingTop: 40 }}>
            <p style={TXT}>Nadie nos da π, A y B: se estiman solo con lo que se ve, repitiendo dos pasos. Cada vuelta no empeora.</p>
            <div style={{ fontSize: 30 }}>
              <TeX>{"P(O \\mid \\lambda^{(k+1)}) \\ \\ge\\ P(O \\mid \\lambda^{(k)})"}</TeX>
            </div>
          </div>
        </Entra>
      )}

      {step === 4 && (
        <Entra style={{ display: "grid", gridTemplateColumns: "1040px 1fr", gap: 70 }}>
          <div>
            <span className="label">ln P del entrenamiento en cada vuelta · {nArranques} arranques</span>
            <Lineas
              ancho={1040}
              alto={500}
              x={[0, 3]}
              y={[-11000, -10900]}
              ticksX={[0, 1, 2, 3].map((v) => ({ v, texto: String(10 ** v) }))}
              ticksY={[-11000, -10950, -10900]}
              fmtY={(v) => v.toLocaleString("es-MX")}
              rotuloX="vuelta (escala log)"
              recortar
              series={bw.arranques.map((a) => ({
                id: String(a.semilla),
                pts: a.historia.map(([i, v]) => [Math.log10(i), v] as [number, number]),
                color: a.semilla === bw.mejor ? "var(--red)" : "var(--data)",
                grosor: a.semilla === bw.mejor ? 3 : 1.6,
                opacidad: a.semilla === bw.mejor ? 1 : 0.7,
              }))}
              lineasH={[{ y: SIM.base.entrenamiento.logP_real, texto: "con el λ real", abajo: true }]}
              margen={{ l: 90, r: 20, t: 16, b: 48 }}
            />
          </div>
          <p style={{ ...TXT, paddingTop: 50 }}>
            {bw.llegan_al_mejor} de {nArranques} arranques llegan al mismo valor y {nArranques - bw.llegan_al_mejor} se quedan abajo. A dónde llegas depende de dónde
            arrancas: se prueban varios y se queda el mejor.
          </p>
        </Entra>
      )}

      {step === 5 && (
        <Entra style={{ display: "grid", gap: 40 }}>
          <TablasLambda modelo={CLIMA} cuales={["A", "B"]} comparar={B.aprendido} tam={24} separacion={60} />
          <p style={TXT}>
            Real → aprendido. Se parece, pero no es igual: error máximo {errorMax.toFixed(2)}. Los estados salen sin nombre: hubo que emparejarlos con los reales.
          </p>
        </Entra>
      )}

      {(step === 6 || step === 7) && (
        <div style={{ display: "grid", gridTemplateColumns: "1040px 1fr", gap: 70 }}>
          <div>
            <span className="label">log₁₀ P(lo visto hasta el día T) · prueba</span>
            <Lineas
              ancho={1040}
              alto={500}
              x={[1, NP]}
              y={[PISO, 0]}
              ticksX={[1, 250, 500, 750, 1000]}
              ticksY={[0, -100, -200, -300, -400]}
              rotuloX="día T"
              series={[
                { id: "escalado", pts: escalado.map((v, t) => [t + 1, v] as [number, number]), color: "var(--data)", grosor: 3, etiqueta: "con logaritmos" },
                {
                  id: "crudo",
                  pts: crudo.map((v, t) => [t + 1, v > 0 ? Math.log10(v) : PISO] as [number, number]).filter((_, t) => t % 20 === 19),
                  color: "var(--red)",
                  sinLinea: true,
                },
              ]}
              lineasH={[
                { y: NORMAL, texto: "menor número normal", abajo: false },
                { y: MINIMO, texto: "menor número que cabe", abajo: true },
              ]}
              marcas={T0 ? [{ x: T0, y: PISO, texto: `día ${T0}: vale 0`, ancla: "middle", r: 9 }] : []}
              margen={{ l: 70, r: 170, t: 16, b: 48 }}
            />
          </div>
          <div style={{ paddingTop: 40 }}>
            {step === 6 ? (
              <Entra>
                <p style={TXT}>
                  Cada día multiplica por un número menor que 1. En el día {T0} ya no cabe en la computadora y Forward sin cuidado da 0 (puntos rojos).
                </p>
              </Entra>
            ) : (
              <Entra>
                <Recap title="logaritmos">
                  <p>Convierten productos en sumas: nada se vuelve cero.</p>
                  <div style={{ fontSize: 30, marginTop: 16, display: "grid", gap: 10 }}>
                    <TeX>{"\\log(ab) = \\log a + \\log b"}</TeX>
                    <TeX>{"\\log P(O) = \\textstyle\\sum_t \\log c_t"}</TeX>
                  </div>
                </Recap>
              </Entra>
            )}
          </div>
        </div>
      )}

      {step === 8 && (
        <Entra style={{ display: "grid", gap: 40 }}>
          <table className="mono" style={{ borderCollapse: "collapse", fontSize: 24 }}>
            <thead>
              <tr style={{ color: "var(--text-3)" }}>
                {["", "navegador", `hmmlearn ${SIM.versiones.hmmlearn}`, "diferencia"].map((h) => (
                  <th key={h} style={{ textAlign: h ? "right" : "left", fontWeight: 400, padding: "8px 20px", fontSize: 22, borderBottom: "1px solid var(--line-2)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPROBACION.map((c) => (
                <tr key={c.que} style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "12px 20px", fontFamily: "var(--sans)", fontSize: 26 }}>{c.que}</td>
                  <td style={{ padding: "12px 20px", textAlign: "right" }}>{c.nav.toFixed(6)}</td>
                  <td style={{ padding: "12px 20px", textAlign: "right" }}>{c.ref.toFixed(6)}</td>
                  <td style={{ padding: "12px 20px", textAlign: "right", color: Math.abs(c.nav - c.ref) < 1e-9 ? "var(--text-3)" : "var(--red-2)" }}>
                    {Math.abs(c.nav - c.ref).toExponential(0)}
                  </td>
                </tr>
              ))}
              <tr style={{ borderBottom: "1px solid var(--line)" }}>
                <td style={{ padding: "12px 20px", fontFamily: "var(--sans)", fontSize: 26 }}>Viterbi en los {NP.toLocaleString("es-MX")} días: el mismo clima</td>
                <td colSpan={2} style={{ padding: "12px 20px", textAlign: "right" }}>
                  {coinciden.toLocaleString("es-MX")} de {NP.toLocaleString("es-MX")} días
                </td>
                <td style={{ padding: "12px 20px", textAlign: "right", color: coinciden === NP ? "var(--text-3)" : "var(--red-2)" }}>{NP - coinciden} distintos</td>
              </tr>
            </tbody>
          </table>
          <p style={TXT}>Lo mismo que una librería.</p>
        </Entra>
      )}

      {step === 9 && (
        <Entra style={{ display: "grid", gap: 50 }}>
          <span className="label">Log-verosimilitud por día en los {NP.toLocaleString("es-MX")} días de prueba · más cerca de 0 = explica mejor</span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 360px)", gap: 60 }}>
            <Dato valor={ev.aprendido.toFixed(3)} rotulo="HMM con el λ aprendido" rojo />
            <Dato valor={ev.sinMemoria.toFixed(3)} rotulo="sin memoria: solo la frecuencia de cada actividad" />
            <Dato valor={ev.real.toFixed(3)} rotulo="HMM con el λ real (no se conoce)" />
          </div>
          <p style={TXT}>
            En días nuevos, el aprendido {ev.aprendido < ev.sinMemoria ? <b>no le gana</b> : "le gana apenas"} al modelo sin memoria. Siempre contra una línea base.
          </p>
        </Entra>
      )}

      {(step === 10 || step === 11) && (
        <div style={{ display: "grid", gridTemplateColumns: "980px 1fr", gap: 80 }}>
          <div>
            <span className="label">% de días con el clima correcto · prueba</span>
            <Barras
              valores={ev.aciertos}
              etiquetas={BARRAS}
              ancho={980}
              alto={470}
              y={[0, 1]}
              pasoY={0.25}
              fmtY={(v) => `${Math.round(v * 100)} %`}
              rojo={(i) => i === 2}
              encima={(i) => pct(ev.aciertos[i])}
              grosor={0.5}
            />
          </div>
          <div style={{ display: "grid", gap: 30, alignContent: "start", paddingTop: 30 }}>
            {step === 11 && (
              <Chips
                opciones={[
                  { valor: "base", texto: "clima del libro" },
                  { valor: "persistente", texto: "clima que dura" },
                ]}
                valor={escenario}
                onChange={setEscenario}
              />
            )}
            <p key={esc} style={TXT}>
              {esc === "base" ? (
                <>
                  Viterbi acierta {pct(ev.aciertos[2], 0)}; la actividad sola, {pct(ev.aciertos[1], 0)}. Este clima cambia seguido (rachas de {ev.rachas.map((r) => r.toFixed(1)).join(" y ")} días): los
                  vecinos dicen poco.
                </>
              ) : (
                <>
                  Otro clima, también simulado, que dura (rachas de {ev.rachas[0].toFixed(0)} días): Viterbi acierta {pct(ev.aciertos[2], 0)} contra{" "}
                  {pct(ev.aciertos[1], 0)}. Un HMM sirve cuando los estados duran.
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {step === 12 && (
        <Entra style={{ display: "grid", gap: 0, maxWidth: 1400 }}>
          {APLICACIONES.map(([area, que]) => (
            <div key={area} style={{ display: "grid", gridTemplateColumns: "260px 1fr", borderTop: "1px solid var(--line-2)", padding: "22px 0", alignItems: "baseline" }}>
              <span style={{ fontSize: 32, fontWeight: 600 }}>{area}</span>
              <span style={{ fontSize: 26, color: "var(--text-2)" }}>{que}</span>
            </div>
          ))}
        </Entra>
      )}

      {step >= 13 && (
        <Entra style={{ maxWidth: 1400, paddingTop: 40 }}>
          <p className="takeaway" style={{ margin: 0, fontSize: 34, lineHeight: 1.4 }}>
            Un HMM convierte lo que vemos en lo que probablemente pasó. Modelo: <em>λ</em>. Validación: <em>secuencias que no vio</em>. Métrica:{" "}
            <em>log-verosimilitud y aciertos</em>, contra una línea base.
          </p>
        </Entra>
      )}
    </SlideFrame>
  );
}

