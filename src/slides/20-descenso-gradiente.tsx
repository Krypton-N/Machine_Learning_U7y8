import { Line } from "@react-three/drei";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Recap } from "../components/Recap";
import { Scene3D } from "../components/Scene3D";
import { etiquetasSuperficie, inDomain, Surface3D, toWorld, type SurfaceSpec } from "../components/Surface3D";
import { TeX } from "../components/TeX";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { educacion } from "../lib/adult";
import { logLoss, logLossGrad, logLossHessian, maxEigen } from "../lib/logistic";

// ---------- Concepto: f(x, y) = ½x² + 2y² ----------
// Gradiente exacto (x, 4y); curvatura 1 en x y 4 en y, así que converge solo si η < 2/4 = 0.5.
const toy: SurfaceSpec = {
  f: (x, y) => 0.5 * x * x + 2 * y * y,
  u: [-3, 3],
  v: [-2, 2],
  fRange: [0, 12.5],
  levels: [0.25, 0.75, 1.5, 2.5, 3.75, 5.5, 8],
  labels: { u: "x", v: "y", f: "f" },
};
const toyGrad = (x: number, y: number): [number, number] => [x, 4 * y];

// ---------- Caso: log-loss de P(>50K) = σ(w·educación + b) sobre las 48 842 personas de Adult ----------
const G = educacion.grupos;
const N = G.reduce((s, g) => s + g.positivos + g.negativos, 0);
const adult: SurfaceSpec = {
  f: (w, b) => logLoss(G, w, b),
  u: [-1.5, 3.2],
  v: [-3.8, 1],
  fRange: [0.45, 1.5],
  levels: [0.495, 0.51, 0.54, 0.6, 0.7, 0.85, 1.05, 1.3],
  labels: { u: "w", v: "b", f: "log-loss" },
};
// Curvatura máxima en el mínimo (valor propio mayor de la hessiana): de ahí sale el límite local de η.
const lambdaMax = maxEigen(logLossHessian(G, educacion.sklearn.w, educacion.sklearn.b));

type Mode = {
  spec: SurfaceSpec;
  grad: (u: number, v: number) => [number, number];
  start: [number, number];
  rates: { eta: number; name: string }[];
  defaultEta: number;
};

const MODES: Record<"toy" | "adult", Mode> = {
  toy: {
    spec: toy,
    grad: toyGrad,
    start: [-2.6, 1.5],
    rates: [
      { eta: 0.05, name: "muy chico" },
      { eta: 0.2, name: "adecuado" },
      { eta: 0.45, name: "grande" },
      { eta: 0.52, name: "demasiado" },
    ],
    defaultEta: 0.2,
  },
  adult: {
    spec: adult,
    grad: (w, b) => logLossGrad(G, w, b),
    start: [-1, 0.5],
    rates: [
      { eta: 1, name: "muy chico" },
      { eta: 3, name: "adecuado" },
      { eta: 9, name: "grande" },
      { eta: 11, name: "demasiado" },
    ],
    defaultEta: 3,
  },
};

const ITERS = 40;

function descend(m: Mode, eta: number) {
  const pts: [number, number][] = [m.start];
  for (let t = 0; t < ITERS; t++) {
    const [u, v] = pts[pts.length - 1];
    const [gu, gv] = m.grad(u, v);
    const next: [number, number] = [u - eta * gu, v - eta * gv];
    if (!inDomain(m.spec, next[0], next[1])) break; // se salió de la gráfica: diverge
    pts.push(next);
  }
  return pts;
}

// Evita mostrar "-0.000" cuando el valor ya es prácticamente cero.
const num = (v: number, d = 2) => (Math.abs(v) < 0.5 * 10 ** -d ? 0 : v).toFixed(d);

function Path({ spec, pts, shown }: { spec: SurfaceSpec; pts: [number, number][]; shown: number }) {
  const world = pts.slice(0, Math.max(1, shown)).map(([u, v]) => toWorld(spec, u, v));
  const last = world[world.length - 1];
  return (
    <group>
      {world.length > 1 && <Line points={world} color="#e5383b" lineWidth={3.5} depthTest={false} renderOrder={10} />}
      {world.map((w, i) => (
        <mesh key={i} position={w} renderOrder={11}>
          <sphereGeometry args={[i === world.length - 1 ? 0.1 : 0.05, 16, 16]} />
          <meshBasicMaterial color={i === world.length - 1 ? "#ff6b5e" : "#e5383b"} depthTest={false} />
        </mesh>
      ))}
      {/* Sombra del punto actual en el piso: ayuda a leer la posición en 3D */}
      <mesh position={[last[0], 0.005, last[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.08, 0.12, 32]} />
        <meshBasicMaterial color="#e5383b" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

function RateChips({ mode, eta, setEta }: { mode: Mode; eta: number; setEta: (e: number) => void }) {
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      {mode.rates.map((r) => (
        <button key={r.eta} className="chip" aria-pressed={eta === r.eta} onClick={(e) => (setEta(r.eta), e.currentTarget.blur())}>
          η = {r.eta} <span style={{ color: "var(--text-3)" }}>· {r.name}</span>
        </button>
      ))}
    </div>
  );
}

const p = { fontSize: 26, color: "var(--text-2)", lineHeight: 1.5, margin: 0 } as const;
const strong = { color: "var(--text)", fontWeight: 500 } as const;

export default function DescensoGradiente({ step }: SlideProps) {
  const key = step >= 2 ? "adult" : "toy";
  const isAdult = key === "adult";
  const mode = MODES[key];
  const [eta, setEta] = useState(mode.defaultEta);

  // Al entrar a cada modo arranca con su η adecuada; los botones la cambian después.
  useEffect(() => setEta(MODES[key].defaultEta), [key]);

  // η de la otra función puede quedar un instante en el estado al cambiar de modo: se ignora.
  const etaOk = mode.rates.some((r) => r.eta === eta) ? eta : mode.defaultEta;
  const pts = useMemo(() => descend(mode, etaOk), [mode, etaOk]);

  // Reproduce el descenso un paso cada 110 ms.
  const running = step >= 1;
  const [shown, setShown] = useState(1);
  useEffect(() => {
    setShown(1);
    if (!running) return;
    const id = window.setInterval(() => setShown((s) => (s >= pts.length ? s : s + 1)), 110);
    return () => clearInterval(id);
  }, [pts, running]);

  const cur = pts[Math.min(shown, pts.length) - 1];
  const diverged = pts.length < ITERS + 1 && shown >= pts.length;
  const d = isAdult ? 3 : 2;

  return (
    <SlideFrame
      section={["U7 · Ensambles", "D. Boosting"]}
      num={20}
      caso={isAdult ? "Adult" : null}
      title="Descenso de gradiente"
      lede="Estás en una montaña con niebla: no ves el valle, solo sientes la inclinación bajo tus pies. Das un paso cuesta abajo y repites."
    >
      <div style={{ display: "grid", gridTemplateColumns: "1000px 1fr", gap: 72, height: "100%" }}>
        <div style={{ position: "relative", height: "100%", borderTop: "1px solid var(--line)" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={key}
              style={{ position: "absolute", inset: 0 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <Scene3D camera={[3.4, 5.8, 6.0]} etiquetas={etiquetasSuperficie(mode.spec)}>
                <Surface3D spec={mode.spec} />
                {running && <Path spec={mode.spec} pts={pts} shown={shown} />}
              </Scene3D>
            </motion.div>
          </AnimatePresence>
          <div className="label" style={{ position: "absolute", left: 0, bottom: 8, fontSize: 20 }}>
            Arrastra para girar
          </div>
          {running && (
            <div className="mono" style={{ position: "absolute", right: 0, top: 18, textAlign: "right", fontSize: 20, lineHeight: 1.7, color: "var(--text-2)" }}>
              <div>
                t = <span style={{ color: "var(--text)" }}>{Math.min(shown, pts.length) - 1}</span>
              </div>
              <div>
                ({mode.spec.labels.u}, {mode.spec.labels.v}) = ({num(cur[0], d)}, {num(cur[1], d)})
              </div>
              <div>
                {mode.spec.labels.f} = <span style={{ color: "var(--red-2)" }}>{mode.spec.f(cur[0], cur[1]).toFixed(d + 1)}</span>
              </div>
              {diverged && <div style={{ color: "var(--red)", marginTop: 6 }}>diverge</div>}
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {!isAdult ? (
            <motion.div
              key="concepto"
              style={{ display: "flex", flexDirection: "column", gap: 32 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
            >
              {step === 0 && (
              <Recap title="gradiente">
                <p>
                  <TeX>{"\\nabla f"}</TeX> es el vector de derivadas parciales. Apunta hacia donde <TeX>f</TeX> sube más rápido;
                  su negativo, hacia donde baja más rápido.
                </p>
              </Recap>
              )}
              <div>
                <div className="label" style={{ marginBottom: 14 }}>
                  La regla
                </div>
                <div style={{ fontSize: 34 }}>
                  <TeX>{"\\theta_{t+1} = \\theta_t - {\\color{#e5383b}\\eta}\\, \\nabla f(\\theta_t)"}</TeX>
                </div>
                <p style={{ ...p, marginTop: 14 }}>
                  <TeX>{"\\eta"}</TeX> es la <b style={strong}>tasa de aprendizaje</b>: el tamaño del paso. En este ejemplo{" "}
                  <TeX>{"f(x,y)=\\tfrac12 x^2 + 2y^2"}</TeX> y <TeX>{"\\nabla f = (x,\\ 4y)"}</TeX>.
                </p>
              </div>
              {/* Solo existe en su clic: oculto también ocuparía lugar y empujaría la escena fuera del cuerpo. */}
              {step === 1 && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <div className="label" style={{ marginBottom: 14 }}>
                  Prueba otro tamaño de paso
                </div>
                <RateChips mode={mode} eta={etaOk} setEta={setEta} />
                <p style={{ ...p, marginTop: 16 }}>
                  Si <TeX>{"\\eta"}</TeX> es muy grande, el paso se pasa del valle: oscila o diverge. Aquí converge solo si{" "}
                  <TeX>{"\\eta < 2/4 = 0.5"}</TeX>, donde 4 es la curvatura en <TeX>y</TeX>.
                </p>
              </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="caso"
              style={{ display: "flex", flexDirection: "column", gap: 30 }}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <div>
                <div className="label" style={{ marginBottom: 14 }}>
                  El modelo
                </div>
                <div style={{ fontSize: 30 }}>
                  <TeX>{"P(\\text{gana} > 50\\text{K}) = \\sigma(w\\cdot z + b)"}</TeX>
                </div>
                {step === 2 && (
                <>
                <p style={{ ...p, marginTop: 14 }}>
                  <TeX>z</TeX> son los años de educación estandarizados. La montaña es la <b style={strong}>log-loss</b> de las{" "}
                  {N.toLocaleString("es-MX")} personas para cada par <TeX>(w, b)</TeX>: bajar es equivocarse menos.
                </p>
                <p className="mono" style={{ ...p, fontSize: 20, marginTop: 12, color: "var(--text-3)" }}>
                  mínimo según sklearn: w* = {educacion.sklearn.w.toFixed(3)} · b* = {educacion.sklearn.b.toFixed(3)} · log-loss ={" "}
                  {educacion.sklearn.logloss.toFixed(4)}
                </p>
                </>
                )}
              </div>

              {step === 3 && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <div className="label" style={{ marginBottom: 14 }}>
                  Prueba otro tamaño de paso
                </div>
                <RateChips mode={mode} eta={etaOk} setEta={setEta} />
                <p style={{ ...p, marginTop: 16 }}>
                  Cerca del mínimo la curvatura más fuerte es <TeX>{`\\lambda_{\\max} \\approx ${lambdaMax.toFixed(3)}`}</TeX>, así que
                  ahí converge si <TeX>{`\\eta < 2/\\lambda_{\\max} \\approx ${(2 / lambdaMax).toFixed(1)}`}</TeX>. Lejos del mínimo la
                  curvatura es otra: no hay un único límite.
                </p>
              </motion.div>
              )}

              {step >= 4 && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <p className="takeaway" style={{ margin: 0, fontSize: 26 }}>
                  En Gradient Boosting el paso <em>no mueve w y b: agrega un árbol</em>. Con log-loss, el árbol aprende{" "}
                  <TeX>{"-\\partial L/\\partial F = y - p"}</TeX>: lo que le falta a cada predicción.
                </p>
              </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SlideFrame>
  );
}
