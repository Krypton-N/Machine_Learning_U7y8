import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Adult3DScene, LeyendaAdult, vista } from "../components/Adult3DScene";
import { Lineas } from "../components/Lineas";
import { Dato } from "../components/Piezas";
import { Reveal } from "../components/Reveal";
import { TeX } from "../components/TeX";
import { useFlechas } from "../deck/hooks";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { adult3d } from "../lib/adult";
import { logLossDe, puntajeInicial, rondaLogLoss, rondaRegresion, sigmoide, valorArbol, type RegNode } from "../lib/gboost";
import { linear } from "../lib/scale";

// ---------- Concepto: regresión con 10 puntos. Cada ronda, un stump aprende los residuos ----------
const JX = Array.from({ length: 10 }, (_, i) => [i + 1]);
const JY = [2, 3, 5, 8, 9, 9, 7, 6, 8, 12];
const TASA_J = 0.5;
const RONDAS_J = 12;
const media = JY.reduce((s, v) => s + v, 0) / JY.length;

// Estado después de cada ronda: la predicción en cada punto y los árboles sumados hasta ahí.
const JUGUETE = (() => {
  const F = new Float64Array(JY.length).fill(media);
  const arboles: RegNode[] = [];
  const pasos = [{ F: Array.from(F), arboles: [] as RegNode[] }];
  for (let m = 0; m < RONDAS_J; m++) {
    arboles.push(rondaRegresion(JX, JY, F, TASA_J, 1));
    pasos.push({ F: Array.from(F), arboles: [...arboles] });
  }
  return pasos;
})();

function Juguete({ m }: { m: number }) {
  const W = 760;
  const paso = JUGUETE[m];
  const fx = linear([0.5, 10.5], [50, W - 16]);
  const fy = linear([0, 13], [300, 14]);
  const fr = linear([-6, 6], [470, 340]);
  // La predicción como función escalonada: media + tasa · (suma de los árboles).
  const xs = Array.from({ length: 201 }, (_, i) => 0.5 + (i / 200) * 10);
  const curva = xs
    .map((x, i) => {
      const y = fy(media + TASA_J * paso.arboles.reduce((s, t) => s + valorArbol(t, [x]), 0));
      return i === 0 ? `M${fx(x)},${y}` : `H${fx(x)}V${y}`;
    })
    .join("");
  return (
    <svg width={W} height={490} style={{ display: "block" }}>
      <text x={50} y={12} className="mono" fontSize={15} fill="var(--text-3)" letterSpacing="0.1em">
        LOS DATOS Y LA PREDICCIÓN
      </text>
      <line x1={50} x2={W - 16} y1={300} y2={300} stroke="var(--line-2)" />
      <motion.path d={curva} fill="none" stroke="var(--red)" strokeWidth={3} initial={false} animate={{ d: curva }} transition={{ duration: 0.45 }} />
      {JY.map((y, i) => (
        <g key={i}>
          <motion.line x1={fx(i + 1)} x2={fx(i + 1)} y1={fy(y)} initial={false} animate={{ y2: fy(paso.F[i]) }} stroke="var(--text-3)" strokeDasharray="3 4" />
          <circle cx={fx(i + 1)} cy={fy(y)} r={8} fill="var(--data)" />
        </g>
      ))}
      <text x={50} y={332} className="mono" fontSize={15} fill="var(--text-3)" letterSpacing="0.1em">
        LO QUE FALTA (RESIDUOS)
      </text>
      <line x1={50} x2={W - 16} y1={fr(0)} y2={fr(0)} stroke="var(--line-2)" />
      {JY.map((y, i) => (
        <motion.line key={i} x1={fx(i + 1)} x2={fx(i + 1)} y1={fr(0)} initial={false} animate={{ y2: fr(y - paso.F[i]) }} stroke="var(--red-2)" strokeWidth={10} />
      ))}
    </svg>
  );
}

// ---------- Caso: Gradient Boosting con log-loss sobre Adult-3D ----------
const E = adult3d.entrenamiento;
const P = adult3d.prueba;
const TASA = 0.3;
const PROF = 2;
const MAX = 50;
const base = E.y.reduce((s, v) => s + v, 0) / E.y.length;

type Caso = {
  /** Lo que le falta (y − p) a cada una de las 400 personas visibles, tras 0…MAX rondas. */
  falta: Float32Array[];
  entrenamiento: number[];
  prueba: number[];
};

function entrenar(): Caso {
  const F = new Float64Array(E.X.length).fill(puntajeInicial(E.y));
  const Fp = new Float64Array(P.X.length).fill(puntajeInicial(E.y));
  const foto = () => Float32Array.from(vista, (v) => v.y - sigmoide(F[v.i]));
  const c: Caso = { falta: [foto()], entrenamiento: [logLossDe(F, E.y)], prueba: [logLossDe(Fp, P.y)] };
  for (let m = 0; m < MAX; m++) {
    const arbol = rondaLogLoss(E.X, E.y, F, TASA, PROF);
    for (let i = 0; i < P.X.length; i++) Fp[i] += valorArbol(arbol, P.X[i]);
    c.falta.push(foto());
    c.entrenamiento.push(logLossDe(F, E.y));
    c.prueba.push(logLossDe(Fp, P.y));
  }
  return c;
}

export default function GradientBoosting({ step, active }: SlideProps) {
  const [mj, setMj] = useState(0);
  const [ronda, setRonda] = useState(0);
  const [modelo, setModelo] = useState<Caso | null>(null);
  const caso = step >= 2;

  useFlechas(
    active,
    () => (caso ? setRonda((r) => Math.min(MAX, r + 1)) : setMj((m) => Math.min(RONDAS_J, m + 1))),
    () => (caso ? setRonda((r) => Math.max(0, r - 1)) : setMj((m) => Math.max(0, m - 1))),
  );

  useEffect(() => {
    const id = window.setTimeout(() => setModelo(entrenar()), 60);
    return () => clearTimeout(id);
  }, []);

  const falta = modelo?.falta[ronda];
  const promedio = useMemo(() => {
    if (!falta) return null;
    const de = (clase: number) => {
      const v = vista.map((p, k) => (p.y === clase ? Math.abs(falta[k]) : -1)).filter((x) => x >= 0);
      return v.reduce((s, x) => s + x, 0) / v.length;
    };
    return { si: de(1), no: de(0) };
  }, [falta]);

  return (
    <SlideFrame
      section={["U7 · Ensambles", "D. Boosting"]}
      num={21}
      caso={caso ? "Adult · 3 variables" : null}
      title="Gradient Boosting: aprender lo que falta"
      lede={
        caso
          ? `Empieza diciendo lo mismo a todos: ${(base * 100).toFixed(1)} % de probabilidad de ganar más de 50K. El tamaño de cada punto es cuánto le falta a su predicción.`
          : "Se empieza con una predicción burda. Cada árbol nuevo no aprende la respuesta: aprende lo que al modelo todavía le falta para llegar a ella."
      }
    >
      <AnimatePresence mode="wait">
        {!caso ? (
          <motion.div key="concepto" style={{ display: "grid", gridTemplateColumns: "760px 1fr", gap: 90 }} exit={{ opacity: 0, transition: { duration: 0.2 } }}>
            <div>
              <Juguete m={mj} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div style={{ fontSize: 24 }}>
                  Árboles sumados{" "}
                  <span className="mono" style={{ color: "var(--red)", fontSize: 30, marginLeft: 8 }}>
                    {mj}
                  </span>
                </div>
                <span className="label" style={{ fontSize: 14 }}>
                  Esquema · 10 puntos · ↑ ↓ agrega o quita un árbol
                </span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 22, fontSize: 24, lineHeight: 1.45, paddingTop: 14 }}>
              <p style={{ margin: 0 }}>
                <span className="mono" style={{ color: "var(--red)" }}>
                  0
                </span>{" "}
                · La primera predicción es el promedio, igual para todos.
              </p>
              <p style={{ margin: 0 }}>
                <span className="mono" style={{ color: "var(--red)" }}>
                  1
                </span>{" "}
                · Se calcula lo que falta en cada punto: el <b>residuo</b>.
              </p>
              <p style={{ margin: 0 }}>
                <span className="mono" style={{ color: "var(--red)" }}>
                  2
                </span>{" "}
                · Un árbol pequeño aprende esos residuos.
              </p>
              <p style={{ margin: 0 }}>
                <span className="mono" style={{ color: "var(--red)" }}>
                  3
                </span>{" "}
                · Se suma <b>una fracción</b> de ese árbol a la predicción, y se repite.
              </p>
              <Reveal step={step} at={1} style={{ borderTop: "1px solid var(--line)", paddingTop: 22, marginTop: 6 }}>
                <div style={{ fontSize: 30 }}>
                  <TeX>{"F_m(x) = F_{m-1}(x) + {\\color{#e5383b}\\nu}\\, h_m(x)"}</TeX>
                </div>
                <p style={{ fontSize: 22, color: "var(--text-2)", margin: "14px 0 0" }}>
                  <TeX>{"h_m"}</TeX> aprende <TeX>{"-\\partial L/\\partial F"}</TeX>: con error cuadrático es el residuo <TeX>{"y - F"}</TeX>;
                  con log-loss es <TeX>{"y - p"}</TeX>. <TeX>{"\\nu"}</TeX> es la tasa de aprendizaje (aquí, {TASA_J}).
                </p>
              </Reveal>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="caso"
            style={{ display: "grid", gridTemplateColumns: "900px 700px", justifyContent: "space-between" }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span className="label">punto grande = al modelo le falta mucho con esa persona</span>
                <LeyendaAdult />
              </div>
              <div style={{ height: 470, marginTop: 8 }}>
                <Adult3DScene estilo={(k) => ({ escala: falta ? 0.45 + 2.4 * Math.abs(falta[k]) : 1 })} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", alignItems: "center", gap: 24 }}>
                <div style={{ fontSize: 24 }}>
                  Árboles sumados{" "}
                  <span className="mono" style={{ color: "var(--red)", fontSize: 30, marginLeft: 8 }}>
                    {ronda}
                  </span>
                </div>
                <input className="range" type="range" min={0} max={MAX} value={ronda} onChange={(e) => setRonda(Number(e.target.value))} onPointerUp={(e) => e.currentTarget.blur()} />
              </div>
              <div className="label natural" style={{ fontSize: 15, marginTop: 4 }}>
                ↑ ↓ agrega o quita un árbol · ν = {TASA} · árboles de {PROF} niveles · 10,000 personas
              </div>
            </div>
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30 }}>
                <Dato rojo valor={promedio ? promedio.si.toFixed(3) : "…"} rotulo="lo que falta, en promedio, a quien gana > 50K" />
                <Dato valor={promedio ? promedio.no.toFixed(3) : "…"} rotulo="lo que falta a quien no" />
              </div>
              <div className="label" style={{ margin: "26px 0 8px" }}>
                Log-loss · <span style={{ color: "var(--red-2)" }}>prueba</span> · entrenamiento
              </div>
              {modelo && (
                <Lineas
                  ancho={700}
                  alto={300}
                  x={[0, MAX]}
                  y={[0.4, 0.56]}
                  ticksX={[0, 10, 20, 30, 40, 50]}
                  ticksY={[0.4, 0.45, 0.5, 0.55]}
                  fmtY={(v) => v.toFixed(2)}
                  rotuloX="árboles"
                  lineaV={ronda}
                  series={[
                    { id: "tr", pts: modelo.entrenamiento.map((v, i): [number, number] => [i, v]) },
                    { id: "te", pts: modelo.prueba.map((v, i): [number, number] => [i, v]), color: "var(--red)", grosor: 3 },
                  ]}
                />
              )}
              <Reveal step={step} at={3} style={{ marginTop: 14 }}>
                <p className="takeaway" style={{ margin: 0, fontSize: 25 }}>
                  Con log-loss, lo que falta es <em>y − p</em>. Cada árbol empuja la probabilidad hacia donde debía estar, un poco cada vez.
                </p>
              </Reveal>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SlideFrame>
  );
}
