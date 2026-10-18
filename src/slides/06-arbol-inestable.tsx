import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { Adult3DScene, LeyendaAdult, vistaX, vistaY, type Caja } from "../components/Adult3DScene";
import { Boton, Chips, Dato, Def, pct } from "../components/Piezas";
import { Reveal } from "../components/Reveal";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { adult3d, bounds3d } from "../lib/adult";
import { mulberry32 } from "../lib/rng";
import { linear } from "../lib/scale";
import { fitClassifier, leafBoxes, predictClass } from "../lib/tree";

const P = adult3d.prueba;

// ---------- Concepto: 6 puntos. Quitar uno cambia la primera pregunta del árbol ----------
// Elegidos por búsqueda para que eso ocurra; el corte se calcula aquí con el mismo árbol de toda la exposición.
const JUGUETE = {
  X: [
    [1, 1],
    [2, 4],
    [4, 2],
    [6, 3],
    [5, 6],
    [3, 5],
  ],
  y: [0, 0, 1, 0, 1, 1],
  quitar: 2,
};

function Juguete({ sinPunto }: { sinPunto: boolean }) {
  const idx = JUGUETE.X.map((_, i) => i).filter((i) => !sinPunto || i !== JUGUETE.quitar);
  const arbol = fitClassifier(JUGUETE.X, JUGUETE.y, 1, idx);
  const S = 460;
  const f = linear([0, 7], [40, S - 20]);
  const fy = linear([0, 7], [S - 40, 20]);
  const errores = idx.filter((i) => predictClass(arbol, JUGUETE.X[i]) !== JUGUETE.y[i]).length;
  return (
    <div>
      <svg width={S} height={S} style={{ display: "block" }}>
        <rect x={40} y={20} width={S - 60} height={S - 60} fill="none" stroke="var(--line-2)" />
        {!arbol.leaf && (
          <motion.line
            initial={false}
            animate={
              arbol.feature === 0
                ? { x1: f(arbol.threshold), x2: f(arbol.threshold), y1: 20, y2: S - 40 }
                : { x1: 40, x2: S - 20, y1: fy(arbol.threshold), y2: fy(arbol.threshold) }
            }
            transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
            stroke="var(--red)"
            strokeWidth={3}
          />
        )}
        {JUGUETE.X.map(([a, b], i) => {
          const quitado = sinPunto && i === JUGUETE.quitar;
          return (
            <motion.circle
              key={i}
              cx={f(a)}
              cy={fy(b)}
              r={15}
              initial={false}
              animate={{ opacity: quitado ? 0.15 : 1 }}
              fill={JUGUETE.y[i] ? "var(--red)" : "var(--data)"}
              stroke={quitado ? "var(--text-2)" : "none"}
              strokeDasharray="4 4"
            />
          );
        })}
        <text x={S - 20} y={S - 12} textAnchor="end" className="mono" fontSize={20} fill="var(--text-3)">
          variable 1 →
        </text>
        <text x={34} y={16} className="mono" fontSize={20} fill="var(--text-3)">
          ↑ variable 2
        </text>
      </svg>
      <div className="mono" style={{ fontSize: 20, color: "var(--text-2)", marginTop: 10 }}>
        {!arbol.leaf && (
          <>
            primera pregunta: <span style={{ color: "var(--red-2)" }}>¿variable {arbol.feature + 1} ≤ {arbol.threshold}?</span> · se equivoca en{" "}
            {errores}
          </>
        )}
      </div>
    </div>
  );
}

// ---------- Caso: un árbol sobre las 400 personas visibles; se quitan 5 y se vuelve a entrenar ----------
const todas = vistaX.map((_, i) => i);
const PROFUNDIDADES = [
  { valor: 2, texto: "profundidad 2" },
  { valor: 4, texto: "profundidad 4" },
  { valor: 99, texto: "sin límite" },
];

export default function ArbolInestable({ step }: SlideProps) {
  const [profundidad, setProfundidad] = useState(4);
  const [intento, setIntento] = useState(0);
  const depth = profundidad === 99 ? Infinity : profundidad;

  const base = useMemo(() => fitClassifier(vistaX, vistaY, depth), [depth]);

  // Cada intento quita 5 personas distintas, con semilla fija para que la exposición sea repetible.
  const quitadas = useMemo(() => {
    if (intento === 0) return new Set<number>();
    const rand = mulberry32(104 + intento);
    const s = new Set<number>();
    while (s.size < 5) s.add(Math.floor(rand() * vistaX.length));
    return s;
  }, [intento]);

  const nuevo = useMemo(
    () => (quitadas.size ? fitClassifier(vistaX, vistaY, depth, todas.filter((i) => !quitadas.has(i))) : base),
    [quitadas, depth, base],
  );

  const cambian = useMemo(() => P.X.filter((x) => predictClass(base, x) !== predictClass(nuevo, x)).length, [base, nuevo]);

  const cajas: Caja[] = useMemo(() => {
    const si = (t: typeof base) => leafBoxes(t, bounds3d).filter((b) => b.pos / b.n > 0.5);
    return quitadas.size
      ? [...si(base).map((b) => ({ ...b, estilo: "contorno" as const, color: "#a3a3ab" })), ...si(nuevo)]
      : si(base);
  }, [base, nuevo, quitadas]);

  const caso = step >= 2;

  return (
    <SlideFrame
      section={["U7 · Ensambles", "A. Bases"]}
      num={6}
      caso={caso ? "Adult · 3 variables" : null}
      title="El árbol solo es inestable"
      lede={
        caso
          ? "Un árbol entrenado con las 400 personas que ves. Se quitan 5 al azar y se entrena otra vez: ¿sale el mismo árbol?"
          : "Un cambio pequeño en los datos puede cambiar la primera pregunta, y con ella todo lo que viene después."
      }
    >
      <AnimatePresence mode="wait">
        {!caso ? (
          <motion.div
            key="concepto"
            style={{ display: "grid", gridTemplateColumns: "560px 1fr", gap: 110 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <div>
              <span className="label">Esquema · 6 puntos, el corte se calcula en vivo</span>
              <div style={{ marginTop: 14 }}>
                <Juguete sinPunto={step >= 1} />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 34, paddingTop: 30 }}>
              <Def termino="Con los 6 puntos">El mejor primer corte es vertical, y aun así deja un punto mal clasificado.</Def>
              <Reveal step={step} at={1}>
                <Def termino="Sin un solo punto">
                  El mejor corte pasa a ser horizontal: <b style={{ color: "var(--text)" }}>otra variable, otra pregunta</b>. En un árbol
                  más profundo, todo lo que cuelga de ahí también cambia.
                </Def>
              </Reveal>
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
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span className="label">
                  {quitadas.size ? "gris = árbol original · rojo = sin esas 5" : "cajas donde el árbol dice que sí"}
                </span>
                <LeyendaAdult />
              </div>
              <div style={{ height: 500, marginTop: 8 }}>
                <Adult3DScene cajas={cajas} estilo={(k) => (quitadas.has(k) ? { oculto: true } : undefined)} />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 30, paddingTop: 10 }}>
              <div>
                <div className="label" style={{ marginBottom: 14 }}>
                  Tamaño del árbol
                </div>
                <Chips opciones={PROFUNDIDADES} valor={profundidad} onChange={(v) => (setProfundidad(v), setIntento(0))} />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <Boton onClick={() => setIntento((i) => i + 1)}>{intento ? "quitar otras 5" : "quitar 5 personas"}</Boton>
                {intento > 0 && <Boton onClick={() => setIntento(0)}>volver a las 400</Boton>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30, borderTop: "1px solid var(--line)", paddingTop: 26 }}>
                <Dato valor={quitadas.size ? `${400 - quitadas.size}` : "400"} rotulo="personas de entrenamiento" />
                <Dato
                  rojo={cambian > 0}
                  valor={quitadas.size ? `${cambian.toLocaleString("es-MX")}` : "—"}
                  rotulo={
                    quitadas.size ? `de 5,000 personas nuevas cambian de respuesta (${pct(cambian / P.X.length)})` : "personas nuevas que cambian de respuesta"
                  }
                />
              </div>
              <Reveal step={step} at={3} style={{ marginTop: "auto" }}>
                <p className="takeaway" style={{ margin: 0, fontSize: 26 }}>
                  Quitar 5 de 400 personas puede cambiar el modelo. Mientras más profundo el árbol, más cambia: eso es <em>alta varianza</em>.
                </p>
              </Reveal>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SlideFrame>
  );
}
