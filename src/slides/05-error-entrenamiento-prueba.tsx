import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Reveal } from "../components/Reveal";
import { Adult3DScene, LeyendaAdult } from "../components/Adult3DScene";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { adult3d, adultMuestra, bounds3d, curvaProfundidad } from "../lib/adult";
import { linear } from "../lib/scale";
import { accuracy, fitClassifier, leafBoxes, type ClassNode } from "../lib/tree";

const MAX_DEPTH = 15;
const E = adult3d.entrenamiento;
const P = adult3d.prueba;

// ======================= Gráfica de error =======================
type Punto = { x: number; etiqueta: string; train: number; test: number };

const CW = 660;
const CH = 400;
const M = { l: 60, r: 18, t: 16, b: 74 };

function ErrorChart({
  puntos,
  actual,
  testLabel,
  yMin = 0,
}: {
  puntos: Punto[];
  actual?: number;
  testLabel: string;
  /** Piso del eje: en Adult-3D los errores viven entre 14 % y 24 %, así se leen mejor. */
  yMin?: number;
}) {
  const xs = puntos.map((p) => p.x);
  const fx = linear([Math.min(...xs), Math.max(...xs)], [M.l, CW - M.r]);
  const fy = linear([yMin, 0.26], [CH - M.b, M.t]);
  const linea = (k: "train" | "test") => puntos.map((p, i) => `${i ? "L" : "M"}${fx(p.x)},${fy(p[k])}`).join("");
  const mejor = puntos.reduce((a, b) => (b.test < a.test ? b : a));
  const cada = puntos.length > 16 ? 5 : 2;
  return (
    <svg width={CW} height={CH} style={{ display: "block" }}>
      {[0, 0.05, 0.1, 0.15, 0.2, 0.25].filter((v) => v >= yMin).map((v) => (
        <g key={v}>
          <line x1={M.l} x2={CW - M.r} y1={fy(v)} y2={fy(v)} stroke="var(--line)" />
          <text x={M.l - 12} y={fy(v) + 5} textAnchor="end" className="mono" fontSize={20} fill="var(--text-3)">
            {Math.round(v * 100)}%
          </text>
        </g>
      ))}
      {puntos.map((p, i) =>
        i % cada === 0 || i === puntos.length - 1 ? (
          <text key={p.x} x={fx(p.x)} y={CH - M.b + 28} textAnchor="middle" className="mono" fontSize={20} fill="var(--text-3)">
            {p.etiqueta}
          </text>
        ) : null,
      )}
      <text x={CW - M.r} y={CH - 4} textAnchor="end" className="mono" fontSize={20} fill="var(--text-3)">
        profundidad máxima
      </text>
      {actual !== undefined && <line x1={fx(actual)} x2={fx(actual)} y1={M.t} y2={CH - M.b} stroke="var(--line-2)" />}
      <path d={linea("train")} fill="none" stroke="var(--data)" strokeWidth={2.5} />
      <path d={linea("test")} fill="none" stroke="var(--red)" strokeWidth={3} />
      {puntos.map((p) => (
        <g key={p.x}>
          <circle cx={fx(p.x)} cy={fy(p.train)} r={p.x === actual ? 6 : 3} fill="var(--data)" />
          <circle cx={fx(p.x)} cy={fy(p.test)} r={p.x === actual ? 7 : 3.5} fill="var(--red)" />
        </g>
      ))}
      <circle cx={fx(mejor.x)} cy={fy(mejor.test)} r={12} fill="none" stroke="var(--red-2)" strokeWidth={1.5} />
      <text x={fx(mejor.x)} y={fy(mejor.test) + 32} textAnchor="middle" className="mono" fontSize={20} fill="var(--red-2)">
        mínimo · {mejor.etiqueta}
      </text>
      <g className="mono" fontSize={20}>
        <text x={CW - M.r} y={M.t + 18} textAnchor="end" fill="var(--red-2)">
          {testLabel}
        </text>
        <text x={CW - M.r} y={M.t + 46} textAnchor="end" fill="var(--data)">
          entrenamiento
        </text>
      </g>
    </svg>
  );
}

// ======================= Esquema del concepto (sin datos) =======================
function Esquema() {
  const w = 760;
  const h = 470;
  const m = { l: 40, r: 20, t: 20, b: 50 };
  const fx = linear([0, 10], [m.l, w - m.r]);
  const fy = linear([0, 1], [h - m.b, m.t]);
  const tr = (c: number) => 0.08 + 0.75 * Math.exp(-c / 2.2);
  const te = (c: number) => tr(c) + 0.06 + 0.0045 * c * c;
  const cs = Array.from({ length: 101 }, (_, i) => i / 10);
  const path = (f: (c: number) => number) => cs.map((c, i) => `${i ? "L" : "M"}${fx(c)},${fy(f(c))}`).join("");
  const best = cs.reduce((a, b) => (te(b) < te(a) ? b : a));
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <rect x={m.l} y={m.t} width={fx(best) - m.l} height={h - m.b - m.t} fill="rgba(255,255,255,0.025)" />
      <rect x={fx(best)} y={m.t} width={w - m.r - fx(best)} height={h - m.b - m.t} fill="var(--red-dim)" opacity={0.6} />
      <line x1={m.l} x2={m.l} y1={m.t} y2={h - m.b} stroke="var(--line-2)" />
      <line x1={m.l} x2={w - m.r} y1={h - m.b} y2={h - m.b} stroke="var(--line-2)" />
      <path d={path(tr)} fill="none" stroke="var(--data)" strokeWidth={3} />
      <path d={path(te)} fill="none" stroke="var(--red)" strokeWidth={3.5} />
      <text x={fx(9.7)} y={fy(tr(9.7)) - 14} textAnchor="end" fontSize={20} fill="var(--data)">
        error de entrenamiento
      </text>
      <text x={fx(9.7)} y={fy(te(9.7)) + 30} textAnchor="end" fontSize={20} fill="var(--red-2)">
        error de prueba
      </text>
      <text x={m.l + 16} y={m.t + 30} className="mono" fontSize={20} fill="var(--text-2)" letterSpacing="0.1em">
        SUBAJUSTE
      </text>
      <text x={m.l + 16} y={m.t + 54} fontSize={20} fill="var(--text-3)">
        demasiado simple
      </text>
      <text x={w - m.r - 16} y={m.t + 30} textAnchor="end" className="mono" fontSize={20} fill="var(--red-2)" letterSpacing="0.1em">
        SOBREAJUSTE
      </text>
      <text x={w - m.r - 16} y={m.t + 54} textAnchor="end" fontSize={20} fill="var(--text-3)">
        memoriza el ruido
      </text>
      <circle cx={fx(best)} cy={fy(te(best))} r={9} fill="var(--red)" />
      <text x={fx(best)} y={fy(te(best)) + 34} textAnchor="middle" fontSize={20} fill="var(--text-2)">
        punto justo
      </text>
      <text x={w - m.r} y={h - 16} textAnchor="end" className="mono" fontSize={20} fill="var(--text-3)">
        complejidad del modelo →
      </text>
      <text x={m.l - 14} y={m.t + 6} textAnchor="end" className="mono" fontSize={20} fill="var(--text-3)" transform={`rotate(-90 ${m.l - 14} ${m.t + 6})`}>
        error
      </text>
    </svg>
  );
}

const defs = [
  ["Error de entrenamiento", "Qué tanto se equivoca el modelo con los datos con los que aprendió."],
  ["Error de prueba", "Qué tanto se equivoca con datos que nunca vio. Es el que importa: así le irá con casos nuevos."],
  ["Sobreajuste", "El modelo memoriza hasta el ruido: el error de entrenamiento sigue bajando, pero el de prueba sube."],
];

// ======================= Diapositiva =======================
const pct = (v: number, d = 1) => `${(v * 100).toFixed(d)}%`;

export default function ErrorEntrenamientoPrueba({ step, active }: SlideProps) {
  const [depth, setDepth] = useState(3);
  const [trees, setTrees] = useState<ClassNode[] | null>(null);

  // Entrena los 15 árboles con las 10 000 personas (≈0.4 s) después de pintar la diapositiva.
  useEffect(() => {
    const id = window.setTimeout(() => setTrees(Array.from({ length: MAX_DEPTH }, (_, i) => fitClassifier(E.X, E.y, i + 1))), 50);
    return () => clearTimeout(id);
  }, []);

  const curva3d: Punto[] | null = useMemo(
    () =>
      trees &&
      trees.map((t, i) => ({ x: i + 1, etiqueta: String(i + 1), train: 1 - accuracy(t, E.X, E.y), test: 1 - accuracy(t, P.X, P.y) })),
    [trees],
  );

  // Adult completo: la profundidad "sin límite" se dibuja después de la 30 con la etiqueta ∞.
  const curvaCompleta: Punto[] = curvaProfundidad.map((c) => ({
    x: c.profundidad ?? 33,
    etiqueta: c.profundidad === null ? "∞" : String(c.profundidad),
    train: 1 - c.acc_entrenamiento,
    test: 1 - c.acc_cv,
  }));
  const sinLimite = curvaProfundidad.find((c) => c.profundidad === null)!;
  const mejorCompleta = curvaProfundidad.reduce((a, b) => (b.acc_cv > a.acc_cv ? b : a));

  useEffect(() => {
    if (!active || step < 1) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") setDepth((d) => Math.min(MAX_DEPTH, d + 1));
      if (e.key === "ArrowDown") setDepth((d) => Math.max(1, d - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, step]);

  const caso = step >= 1;
  const cur = curva3d?.[depth - 1];
  // Solo se dibujan las cajas donde el árbol predice "> 50K".
  const cajas = useMemo(() => (trees ? leafBoxes(trees[depth - 1], bounds3d).filter((b) => b.pos / b.n > 0.5) : []), [trees, depth]);

  return (
    <SlideFrame
      section={["U7 · Ensambles", "A. Bases"]}
      num={5}
      caso={step === 1 ? "Adult · 3 variables" : step >= 2 ? "Adult" : null}
      title={
        <>
          Error de entrenamiento <span style={{ color: "var(--text-3)" }}>vs</span> error de prueba
        </>
      }
      lede={
        caso
          ? "Un árbol que predice si una persona gana más de 50 mil dólares al año. Cada caja roja es una región donde el árbol dice que sí."
          : "Un modelo más complejo se ajusta cada vez mejor a los datos con los que aprendió. La pregunta que importa es si también acierta con datos que nunca vio."
      }
    >
      <AnimatePresence mode="wait">
        {!caso ? (
          <motion.div
            key="concepto"
            style={{ display: "grid", gridTemplateColumns: "780px 760px", justifyContent: "space-between" }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 34, paddingTop: 10 }}>
              {defs.map(([t, d]) => (
                <div key={t} style={{ borderLeft: "1px solid var(--line-2)", paddingLeft: 26 }}>
                  <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.01em" }}>{t}</div>
                  <div style={{ fontSize: 26, color: "var(--text-2)", lineHeight: 1.45, marginTop: 8 }}>{d}</div>
                </div>
              ))}
            </div>
            <div>
              <span className="label">Esquema · no son datos</span>
              <div style={{ marginTop: 14 }}>
                <Esquema />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="caso"
            style={{ display: "grid", gridTemplateColumns: "940px 660px", justifyContent: "space-between" }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            {/* Izquierda: el árbol sobre Adult-3D */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span className="label">Árbol entrenado con 10,000 personas · se dibujan 400</span>
                <LeyendaAdult />
              </div>
              <div style={{ position: "relative", height: 470, marginTop: 8 }}>
                <Adult3DScene cajas={cajas} />
                {!trees && (
                  <div className="label" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
                    entrenando…
                  </div>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "300px 1fr 330px", alignItems: "center", gap: 24, marginTop: 6 }}>
                <div style={{ fontSize: 26 }}>
                  Profundidad máxima{" "}
                  <span className="mono" style={{ color: "var(--red)", fontSize: 30, marginLeft: 8 }}>
                    {depth}
                  </span>
                </div>
                <input
                  className="range"
                  type="range"
                  min={1}
                  max={MAX_DEPTH}
                  value={depth}
                  onChange={(e) => setDepth(Number(e.target.value))}
                  onPointerUp={(e) => e.currentTarget.blur()}
                />
                <div className="mono" style={{ fontSize: 20, color: "var(--text-2)", textAlign: "right", lineHeight: 1.5 }}>
                  <div>
                    error entrenamiento <span style={{ color: "var(--text)" }}>{cur ? pct(cur.train) : "—"}</span>
                  </div>
                  <div>
                    error prueba <span style={{ color: "var(--red-2)" }}>{cur ? pct(cur.test) : "—"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Derecha: la curva; primero la de Adult-3D, luego la de Adult completo */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={step >= 2 ? "completo" : "3d"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="label">
                    {step >= 2 ? `Adult completo · ${adultMuestra.columnas.length} variables · CV de 5 pliegues` : "Adult · 3 variables · 5,000 personas de prueba"}
                  </span>
                  <div style={{ marginTop: 14 }}>
                    {step >= 2 ? (
                      <ErrorChart puntos={curvaCompleta} testLabel="error de prueba (CV)" />
                    ) : curva3d ? (
                      <ErrorChart puntos={curva3d} actual={depth} testLabel="error de prueba" yMin={0.1} />
                    ) : null}
                  </div>
                </motion.div>
              </AnimatePresence>
              <Reveal step={step} at={3} style={{ marginTop: 26 }}>
                <p className="takeaway" style={{ margin: 0, fontSize: 26 }}>
                  Sin límite, el árbol acierta el <em>{pct(sinLimite.acc_entrenamiento, 2)}</em> de sus datos, pero solo el{" "}
                  <em>{pct(sinLimite.acc_cv)}</em> con personas nuevas. Con profundidad {mejorCompleta.profundidad} llega a{" "}
                  {pct(mejorCompleta.acc_cv)}.
                </p>
              </Reveal>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SlideFrame>
  );
}
