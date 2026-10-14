import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Correlogram, fueraDeBanda } from "../components/Correlogram";
import { LagCloud3D } from "../components/LagCloud3D";
import { Boton, Chips } from "../components/Piezas";
import { Recap } from "../components/Recap";
import { Reveal } from "../components/Reveal";
import { TeX } from "../components/TeX";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { TRANSFORMACIONES } from "../lib/pasajeros";
import { mulberry32 } from "../lib/rng";
import { acf, minimosCuadrados, pacf, simularAR } from "../lib/series";

// ---------- Concepto: una serie con memoria de un solo paso (esquema simulado) ----------
const PHI = 0.8;
const N_AJUSTE = 1000;
const N_DIBUJO = 300;
// Semilla con la que abre la diapositiva. No es especial: entre las semillas 40 y 49 el coeficiente de antier
// va de −0.06 a 0.05 y la pendiente de la sombra, de 0.58 a 0.71. El botón "otra muestra" enseña esa variación.
const SEMILLA_INICIAL = 43;
const RADIO = 6;
const K_TEORICO = 8;
const ACF_TEORICA = Array.from({ length: K_TEORICO + 1 }, (_, k) => PHI ** k);
const PACF_TEORICA = pacf(ACF_TEORICA);
/** Dos decimales, sin escribir "−0.00" cuando el número es prácticamente cero. */
const dos = (v: number) => (Math.abs(v) < 0.005 ? 0 : v).toFixed(2);

function muestra(semilla: number) {
  const x = simularAR(PHI, N_AJUSTE, mulberry32(semilla)).x;
  const hoy = x.slice(2);
  const plano = minimosCuadrados(
    hoy.map((_, i) => [x[i + 1], x[i]]),
    hoy,
  );
  const sombra = minimosCuadrados(
    hoy.map((_, i) => [x[i]]),
    hoy,
  );
  const puntos = hoy.slice(0, N_DIBUJO).map((v, i): [number, number, number] => [x[i], x[i + 1], v]);
  return { puntos, plano: { c: plano.beta[0], b1: plano.beta[1], b2: plano.beta[2] }, sombra: { a: sombra.beta[0], b: sombra.beta[1] } };
}

function Caja({ x, tex }: { x: number; tex: string }) {
  return (
    <div style={{ position: "absolute", left: x - 60, top: 96, width: 120, height: 64, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, border: "1.5px solid var(--text-3)", background: "var(--bg)" }}>
      <TeX>{tex}</TeX>
    </div>
  );
}

function Cadena() {
  const xs = [90, 380, 670];
  return (
    <div style={{ position: "relative", width: 760, height: 190 }}>
      <svg width={760} height={190} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <marker id="punta-cadena" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={8} markerHeight={8} orient="auto">
            <path d="M0,0L10,5L0,10z" fill="var(--red)" />
          </marker>
          <marker id="punta-directa" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={8} markerHeight={8} orient="auto">
            <path d="M0,0L10,5L0,10z" fill="var(--text-3)" />
          </marker>
        </defs>
        <line x1={xs[0] + 62} x2={xs[1] - 64} y1={128} y2={128} stroke="var(--red)" strokeWidth={3} markerEnd="url(#punta-cadena)" />
        <line x1={xs[1] + 62} x2={xs[2] - 64} y1={128} y2={128} stroke="var(--red)" strokeWidth={3} markerEnd="url(#punta-cadena)" />
        <path d={`M${xs[0]},94 Q${xs[1]},-30 ${xs[2]},92`} fill="none" stroke="var(--text-3)" strokeWidth={2} strokeDasharray="7 7" markerEnd="url(#punta-directa)" />
        <text x={xs[1]} y={22} textAnchor="middle" fontSize={22} fill="var(--text-2)">
          ¿efecto directo?
        </text>
        <text x={(xs[0] + xs[1]) / 2} y={116} textAnchor="middle" fontSize={24} fill="var(--red-2)">
          φ
        </text>
        <text x={(xs[1] + xs[2]) / 2} y={116} textAnchor="middle" fontSize={24} fill="var(--red-2)">
          φ
        </text>
        <text x={xs[1]} y={186} textAnchor="middle" className="mono" fontSize={19} fill="var(--red-2)">
          de rebote, pasando por ayer: φ · φ = φ²
        </text>
      </svg>
      <Caja x={xs[0]} tex="x_{t-2}" />
      <Caja x={xs[1]} tex="x_{t-1}" />
      <Caja x={xs[2]} tex="x_t" />
    </div>
  );
}

// ---------- Caso ----------
const K_MAX = 36;
const SERIES = {
  dd12log: { titulo: "con las dos diferencias" },
  log: { titulo: "sin diferenciar" },
} as const;
type Cual = keyof typeof SERIES;
const CUALES = (Object.keys(SERIES) as Cual[]).map((k) => ({ valor: k, texto: TRANSFORMACIONES[k].nombre }));
const CALCULO = Object.fromEntries(
  (Object.keys(SERIES) as Cual[]).map((k) => {
    const v = TRANSFORMACIONES[k].valores;
    const a = acf(v, K_MAX);
    return [k, { n: v.length, acf: a, pacf: pacf(a) }];
  }),
) as Record<Cual, { n: number; acf: number[]; pacf: number[] }>;
const PERIODO = 12;

export default function PACF({ step }: SlideProps) {
  const [semilla, setSemilla] = useState(SEMILLA_INICIAL);
  const [cual, setCual] = useState<Cual>("dd12log");
  useEffect(() => setCual("dd12log"), [step]);
  const m = useMemo(() => muestra(semilla), [semilla]);
  const C = CALCULO[cual];
  const fueraPacf = fueraDeBanda(C.pacf, C.n);

  return (
    <SlideFrame
      section={["U8 · Datos secuenciales", "F. Fundamentos de series"]}
      num={40}
      caso={step >= 4 ? "Pasajeros aéreos" : null}
      title="Autocorrelación parcial (PACF)"
      lede="La ACF cuenta todo el parecido con el valor de hace k pasos, también el que llega de rebote. La PACF solo cuenta el directo."
    >
      {step === 0 && (
        <motion.div key="cadena" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "grid", gridTemplateColumns: "800px 1fr", gap: 80 }}>
          <div>
            <Cadena />
            <p style={{ fontSize: 24, lineHeight: 1.42, marginTop: 30 }}>
              Si cada valor depende del anterior, antier se parece a hoy <b>aunque no lo toque</b>: su efecto llega pasando por ayer. La ACF en 2 cuenta ese
              parecido completo.
            </p>
            <p style={{ fontSize: 24, lineHeight: 1.42, marginTop: 14 }}>
              <span style={{ color: "var(--red-2)" }}>PACF en k:</span> el coeficiente del valor de hace k pasos cuando la regresión también incluye a todos los de
              en medio. Lo que antier aporta además de lo que ya dijo ayer.
            </p>
          </div>
          <Recap title="regresión">
            <p>Una recta (o un plano) que predice una cosa a partir de otras. Cada coeficiente dice cuánto aporta su variable cuando las demás ya están en la cuenta.</p>
            <p style={{ marginTop: 10 }}>El residuo es lo que la recta no explica.</p>
          </Recap>
        </motion.div>
      )}

      {step >= 1 && step <= 3 && (
        <motion.div key="nube" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "grid", gridTemplateColumns: step === 3 ? "700px 1fr" : "1040px 1fr", gap: 50 }}>
          <div>
            <span className="label natural">
              ESQUEMA · SIMULADO: CADA VALOR = {PHI} × EL ANTERIOR + UN CHOQUE · SE AJUSTA CON {N_AJUSTE.toLocaleString("es-MX")} VALORES Y SE DIBUJAN {N_DIBUJO}
            </span>
            <div style={{ height: step === 3 ? 440 : 540 }}>
              <LagCloud3D puntos={m.puntos} radio={RADIO} sombra={m.sombra} plano={step >= 2 ? m.plano : undefined} vista={step === 1 ? "sombra" : step === 2 ? "canto" : "libre"} />
            </div>
          </div>
          {step < 3 ? (
            <div style={{ paddingTop: 30 }}>
              <Boton onClick={() => setSemilla((s) => s + 1)}>otra muestra</Boton>
              {step === 1 ? (
                <p style={{ fontSize: 25, lineHeight: 1.42, marginTop: 22 }}>
                  De frente solo se ven antier y hoy. La nube y su sombra en la pared suben juntas: pendiente{" "}
                  <span className="mono" style={{ color: "var(--red-2)" }}>
                    {m.sombra.b.toFixed(2)}
                  </span>
                  , cerca de φ² = {(PHI * PHI).toFixed(2)}.
                  <br />
                  <br />
                  <span style={{ color: "var(--text-2)" }}>Si se ignora ayer, antier y hoy parecen muy relacionados. Eso es la ACF en 2.</span>
                </p>
              ) : (
                <p style={{ fontSize: 25, lineHeight: 1.42, marginTop: 22 }}>
                  Ahora se mira a lo largo del eje de antier y aparece el plano que predice hoy con ayer y antier:
                  <br />
                  <span className="mono" style={{ fontSize: 23 }}>
                    hoy ≈ <span style={{ color: "var(--red-2)" }}>{dos(m.plano.b1)}</span> × ayer + <span style={{ color: "var(--red-2)" }}>{dos(m.plano.b2)}</span> ×
                    antier
                  </span>
                  <br />
                  <br />
                  El plano se ve casi como una línea: con ayer en la cuenta, <span style={{ color: "var(--red-2)" }}>antier ya no aporta.</span> Eso es la PACF en 2: cerca
                  de 0.
                </p>
              )}
            </div>
          ) : (
            <div>
              <span className="label natural">VALORES TEÓRICOS DE ESA SERIE (φ = {PHI})</span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 6 }}>
                <Correlogram valores={ACF_TEORICA} ancho={450} alto={300} titulo="ACF: se apaga poco a poco" rotular={[1, 2, 3]} cada={1} y={[0, 1]} />
                <Correlogram valores={PACF_TEORICA.map((v) => (Math.abs(v) < 1e-12 ? 0 : v))} ancho={450} alto={300} titulo="PACF: se corta después de 1" rotular={[1, 2]} cada={1} y={[0, 1]} />
              </div>
              <p style={{ fontSize: 24, lineHeight: 1.42, marginTop: 18 }}>
                Así se reconoce una serie con memoria de un paso: <b>la ACF decae y la PACF se corta.</b> Si la memoria fuera de p pasos, la PACF se cortaría
                después de p. Se usa en la diapositiva 46.
              </p>
            </div>
          )}
        </motion.div>
      )}

      {step >= 4 && (
        <motion.div key="caso" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 24 }}>
              Pasajeros, {SERIES[cual].titulo} · {C.n} valores
            </span>
            <Chips opciones={CUALES} valor={cual} onChange={setCual} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 50 }}>
            <Correlogram valores={C.acf} n={C.n} ancho={820} alto={380} titulo="ACF" rotular={[1, PERIODO]} y={cual === "log" ? [-0.5, 1] : [-0.5, 0.5]} />
            <Correlogram valores={C.pacf} n={C.n} ancho={820} alto={380} titulo="PACF" rotular={[1, PERIODO]} y={cual === "log" ? [-0.5, 1] : [-0.5, 0.5]} />
          </div>
          <p className="mono" style={{ fontSize: 19, color: "var(--text-2)", margin: "8px 0 0" }}>
            PACF por Durbin-Levinson · su primer valor siempre coincide con el de la ACF ({C.pacf[1].toFixed(2)}) · fuera de la banda en la PACF: {fueraPacf.join(", ")}
            {cual === "log" && ` · sin diferenciar, la PACF empieza en ${C.pacf[1].toFixed(2)}`}
          </p>
          <Reveal step={step} at={4} style={{ marginTop: 12 }}>
            <p className="takeaway" style={{ margin: 0, fontSize: 26 }}>
              ACF y PACF juntas son <em>las huellas para elegir el modelo</em>: se leen en la 46. En pasajeros, ya diferenciados, destacan 1 y {PERIODO} en las dos:
              corto plazo y estación.
            </p>
          </Reveal>
        </motion.div>
      )}
    </SlideFrame>
  );
}
