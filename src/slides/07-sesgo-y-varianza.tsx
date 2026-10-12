import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Adult3DScene, type Caja, type Plano } from "../components/Adult3DScene";
import { Chips } from "../components/Piezas";
import { Reveal } from "../components/Reveal";
import { TeX } from "../components/TeX";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { adult3d, bounds3d } from "../lib/adult";
import { gaussian, mulberry32 } from "../lib/rng";
import { fitClassifier, leafBoxes, predictProba, type ClassNode } from "../lib/tree";

const E = adult3d.entrenamiento;
const P = adult3d.prueba;

// ---------- Concepto: la diana ----------
function Diana({ sesgo, varianza, semilla }: { sesgo: boolean; varianza: boolean; semilla: number }) {
  const tiros = useMemo(() => {
    const r = mulberry32(semilla);
    const cx = sesgo ? 46 : 0;
    const cy = sesgo ? -34 : 0;
    const s = varianza ? 30 : 8;
    return Array.from({ length: 12 }, () => [cx + s * gaussian(r), cy + s * gaussian(r)]);
  }, [sesgo, varianza, semilla]);
  return (
    <svg width={230} height={230} viewBox="-115 -115 230 230">
      {[105, 70, 35].map((r) => (
        <circle key={r} r={r} fill="none" stroke="var(--line-2)" />
      ))}
      <circle r={5} fill="var(--text-2)" />
      {tiros.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={6} fill="var(--red)" opacity={0.9} />
      ))}
    </svg>
  );
}

// ---------- Caso: 25 árboles, cada uno con un grupo distinto de 400 personas ----------
const GRUPOS = (() => {
  const r = mulberry32(7);
  const orden = E.X.map((_, i) => i).sort(() => r() - 0.5);
  return Array.from({ length: 25 }, (_, g) => orden.slice(g * 400, (g + 1) * 400));
})();

const PROFUNDIDADES = [
  { valor: 1, texto: "1 pregunta (stump)" },
  { valor: 3, texto: "profundidad 3" },
  { valor: 99, texto: "sin límite" },
];

type Resultado = { arboles: ClassNode[]; errMedio: number; errPromedio: number; varianza: number };

// Identidad exacta sobre el error cuadrático de la probabilidad que da cada árbol:
// promedio del error de los árboles = error del promedio + varianza entre árboles.
function medir(profundidad: number): Resultado {
  const arboles = GRUPOS.map((g) => fitClassifier(E.X, E.y, profundidad === 99 ? Infinity : profundidad, g));
  let errMedio = 0;
  let errPromedio = 0;
  let varianza = 0;
  for (let i = 0; i < P.X.length; i++) {
    const ps = arboles.map((t) => predictProba(t, P.X[i]));
    const m = ps.reduce((s, p) => s + p, 0) / ps.length;
    errMedio += ps.reduce((s, p) => s + (p - P.y[i]) ** 2, 0) / ps.length;
    errPromedio += (m - P.y[i]) ** 2;
    varianza += ps.reduce((s, p) => s + (p - m) ** 2, 0) / ps.length;
  }
  const n = P.X.length;
  return { arboles, errMedio: errMedio / n, errPromedio: errPromedio / n, varianza: varianza / n };
}

const TINTES = ["#e5383b", "#ff8a80", "#b8b8c0", "#8e8e96", "#ffffff"];

export default function SesgoYVarianza({ step }: SlideProps) {
  const [profundidad, setProfundidad] = useState(99);
  const [res, setRes] = useState<Record<number, Resultado> | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => setRes({ 1: medir(1), 3: medir(3), 99: medir(99) }), 60);
    return () => clearTimeout(id);
  }, []);

  // En 3D se sobreponen 5 de los 25 árboles: sus cajas "sí" o, si es un stump, su único corte.
  const { cajas, planos } = useMemo(() => {
    const cajas: Caja[] = [];
    const planos: Plano[] = [];
    res?.[profundidad].arboles.slice(0, 5).forEach((t, k) => {
      if (profundidad === 1) {
        if (!t.leaf) planos.push({ variable: t.feature as 0 | 1 | 2, valor: t.threshold, color: TINTES[k] });
      } else {
        for (const b of leafBoxes(t, bounds3d)) if (b.pos / b.n > 0.5) cajas.push({ ...b, estilo: "contorno", color: TINTES[k] });
      }
    });
    return { cajas, planos };
  }, [res, profundidad]);

  const caso = step >= 2;
  const escala = 0.28;

  return (
    <SlideFrame
      section={["U7 · Ensambles", "A. Bases"]}
      num={7}
      caso={caso ? "Adult · 3 variables" : null}
      title="Sesgo y varianza"
      lede={
        caso
          ? "25 árboles, cada uno entrenado con 400 personas distintas. ¿Qué tanto se parecen entre sí y qué tanto se equivocan?"
          : "Dos formas distintas de fallar: apuntar siempre al mismo lugar equivocado, o apuntar a un lugar distinto cada vez."
      }
    >
      <AnimatePresence mode="wait">
        {!caso ? (
          <motion.div
            key="concepto"
            style={{ display: "grid", gridTemplateColumns: "640px 1fr", gap: 90 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <div>
              <span className="label">Esquema · cada punto es un modelo entrenado con datos distintos</span>
              <div style={{ display: "grid", gridTemplateColumns: "110px 230px 230px", gap: "8px 20px", alignItems: "center", marginTop: 16 }}>
                <span />
                <span className="label" style={{ textAlign: "center" }}>
                  poca varianza
                </span>
                <span className="label" style={{ textAlign: "center" }}>
                  mucha varianza
                </span>
                <span className="label">poco sesgo</span>
                <Diana sesgo={false} varianza={false} semilla={1} />
                <Diana sesgo={false} varianza semilla={2} />
                <span className="label">mucho sesgo</span>
                <Diana sesgo varianza={false} semilla={3} />
                <Diana sesgo varianza semilla={4} />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 26, paddingTop: 34 }}>
              <div style={{ fontSize: 24, lineHeight: 1.5, color: "var(--text-2)" }}>
                <p style={{ margin: "0 0 14px" }}>
                  <b style={{ color: "var(--text)", fontWeight: 600 }}>Sesgo:</b> el modelo es demasiado simple y, en promedio, apunta lejos
                  del centro.
                </p>
                <p style={{ margin: "0 0 14px" }}>
                  <b style={{ color: "var(--text)", fontWeight: 600 }}>Varianza:</b> el modelo cambia mucho cuando cambian los datos con
                  los que aprendió.
                </p>
                <p style={{ margin: 0 }}>
                  <b style={{ color: "var(--text)", fontWeight: 600 }}>Ruido:</b> lo que ningún modelo puede adivinar.
                </p>
              </div>
              <Reveal step={step} at={1}>
                <div style={{ fontSize: 27, borderTop: "1px solid var(--line)", paddingTop: 26 }}>
                  <TeX block>
                    {
                      "\\mathbb{E}\\big[(y-\\hat f(x))^2\\big] = \\underbrace{\\big(\\mathbb{E}[\\hat f(x)]-f(x)\\big)^2}_{\\text{sesgo}^2} + \\underbrace{{\\color{#e5383b}\\mathrm{Var}[\\hat f(x)]}}_{\\text{varianza}} + \\underbrace{\\sigma^2}_{\\text{ruido}}"
                    }
                  </TeX>
                </div>
                <p style={{ fontSize: 21, color: "var(--text-3)", margin: "14px 0 0", lineHeight: 1.45 }}>
                  Es exacta para el error cuadrático. Es la curva de la diapositiva 5: a la izquierda domina el sesgo y a la
                  derecha, la varianza.
                </p>
              </Reveal>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="caso"
            style={{ display: "grid", gridTemplateColumns: "860px 740px", justifyContent: "space-between" }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="label">5 de los 25 árboles</span>
                <Chips opciones={PROFUNDIDADES} valor={profundidad} onChange={setProfundidad} />
              </div>
              <div style={{ height: 480, marginTop: 8 }}>
                <Adult3DScene cajas={cajas} planos={planos} estilo={() => ({ tenue: true })} />
              </div>
              <div style={{ fontSize: 22, color: "var(--text-2)" }}>
                {profundidad === 1
                  ? "Con una sola pregunta el corte puede caer en otro lugar, pero la respuesta casi no cambia: poca varianza, mucho sesgo."
                  : profundidad === 3
                    ? "Con profundidad 3 las cajas se parecen, pero ya no coinciden."
                    : "Sin límite, cada árbol dibuja algo distinto: memorizó a sus 400 personas."}
              </div>
            </div>
            <div>
              <Reveal step={step} at={3}>
                <span className="label">Error cuadrático con 5,000 personas nuevas</span>
                <div style={{ display: "grid", gap: 26, marginTop: 22 }}>
                  {PROFUNDIDADES.map((p) => {
                    const r = res?.[p.valor];
                    const activo = p.valor === profundidad;
                    return (
                      <div key={p.valor} style={{ opacity: activo ? 1 : 0.55 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, marginBottom: 8 }}>
                          <span>{p.texto}</span>
                          <span className="mono" style={{ color: "var(--text-2)" }}>
                            {r ? `${r.errPromedio.toFixed(3)} + ${r.varianza.toFixed(3)} = ${r.errMedio.toFixed(3)}` : "…"}
                          </span>
                        </div>
                        <div style={{ display: "flex", height: 30, background: "var(--line)" }}>
                          <motion.div animate={{ width: `${((r?.errPromedio ?? 0) / escala) * 100}%` }} style={{ background: "var(--data-dim)" }} />
                          <motion.div animate={{ width: `${((r?.varianza ?? 0) / escala) * 100}%` }} style={{ background: "var(--red)" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="label" style={{ display: "flex", gap: 26, marginTop: 20, fontSize: 15 }}>
                  <span>
                    <i style={{ display: "inline-block", width: 14, height: 14, background: "var(--data-dim)", marginRight: 8, verticalAlign: -2 }} />
                    error del promedio de los 25
                  </span>
                  <span style={{ color: "var(--red-2)" }}>
                    <i style={{ display: "inline-block", width: 14, height: 14, background: "var(--red)", marginRight: 8, verticalAlign: -2 }} />
                    varianza entre árboles
                  </span>
                </div>
                <p style={{ fontSize: 20, color: "var(--text-3)", margin: "14px 0 0", lineHeight: 1.45 }}>
                  La barra completa es el error promedio de un árbol. Las dos partes suman exacto: no es una aproximación.
                </p>
              </Reveal>
              <Reveal step={step} at={4} style={{ marginTop: 26 }}>
                <p className="takeaway" style={{ margin: 0, fontSize: 26 }}>
                  Al árbol sin límite casi todo el error extra le viene de la <em>varianza</em>. Si promediamos muchos, esa parte roja
                  desaparece.
                </p>
              </Reveal>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SlideFrame>
  );
}
