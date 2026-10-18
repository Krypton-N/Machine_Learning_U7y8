import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Adult3DScene, LeyendaAdult } from "../components/Adult3DScene";
import { ArbolGlifo } from "../components/FlujoEnsamble";
import { Lineas } from "../components/Lineas";
import { Chips, Def, pct } from "../components/Piezas";
import { REJILLA, VoteVolume3D } from "../components/VoteVolume3D";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { adult3d, adultMuestra, bounds3d, comparacion } from "../lib/adult";
import { arbolBootstrap } from "../lib/bagging";
import { mulberry32 } from "../lib/rng";
import { accuracy, fitClassifier, predictProba, type ClassNode } from "../lib/tree";

const E = adult3d.entrenamiento;
const P = adult3d.prueba;
const B_MAX = 100;
const todos = E.X.map((_, i) => i);

// Corte 2D del espacio: edad × educación, para alguien que trabaja 40 horas.
const HORAS = 40;
const EDADES = Array.from({ length: bounds3d.max[0] - bounds3d.min[0] + 1 }, (_, i) => bounds3d.min[0] + i);
const EDUS = Array.from({ length: bounds3d.max[1] - bounds3d.min[1] + 1 }, (_, i) => bounds3d.min[1] + i);

type Estado = {
  n: number; // árboles entrenados
  /** Suma de probabilidades de los primeros b árboles en cada celda: sumaRejilla[b-1]. */
  sumaRejilla: Float32Array[];
  sumaCorte: Float32Array[];
  errores: number[]; // error de prueba del promedio de los primeros b árboles
};

function Corte({ suma, b }: { suma: Float32Array | undefined; b: number }) {
  const W = 660;
  const H = 340;
  const m = { l: 56, b: 34 };
  const cw = (W - m.l) / EDADES.length;
  const ch = (H - m.b) / EDUS.length;
  return (
    <svg width={W} height={H} style={{ display: "block" }}>
      {suma &&
        EDADES.map((_, i) =>
          EDUS.map((_, j) => {
            const p = suma[i * EDUS.length + j] / b;
            return <rect key={`${i}-${j}`} x={m.l + i * cw} y={H - m.b - (j + 1) * ch} width={cw + 0.5} height={ch + 0.5} fill="var(--red)" opacity={p} />;
          }),
        )}
      <rect x={m.l} y={0} width={W - m.l} height={H - m.b} fill="none" stroke="var(--line-2)" />
      {[20, 30, 40, 50, 60, 70, 80, 90].map((e) => (
        <text key={e} x={m.l + (e - bounds3d.min[0] + 0.5) * cw} y={H - 6} textAnchor={e === 90 ? "end" : "middle"} className="mono" fontSize={20} fill="var(--text-3)">
          {e}
        </text>
      ))}
      {[4, 8, 12, 16].map((e) => (
        <text key={e} x={m.l - 10} y={H - m.b - (e - 0.5) * ch + 5} textAnchor="end" className="mono" fontSize={20} fill="var(--text-3)">
          {e}
        </text>
      ))}
    </svg>
  );
}

// Concepto: tres árboles opinan sobre la misma persona.
function Votacion() {
  const votos = ["sí", "sí", "no"];
  return (
    <svg width={760} height={330}>
      <rect x={0} y={126} width={170} height={70} fill="var(--panel)" stroke="var(--line-2)" />
      <text x={85} y={156} textAnchor="middle" fontSize={20} fill="var(--text)">
        una persona
      </text>
      <text x={85} y={180} textAnchor="middle" className="mono" fontSize={20} fill="var(--text-3)">
        nueva
      </text>
      {votos.map((v, i) => {
        const y = 50 + i * 110;
        return (
          <motion.g key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.25 }}>
            <line x1={170} y1={161} x2={250} y2={y} stroke="var(--line-2)" />
            <ArbolGlifo x={310} y={y - 34} niveles={3} ancho={84} />
            <line x1={370} y1={y} x2={430} y2={y} stroke="var(--line-2)" />
            <text x={450} y={y + 8} fontSize={26} fontWeight={600} fill={v === "sí" ? "var(--red-2)" : "var(--text-2)"}>
              {v}
            </text>
            <line x1={500} y1={y} x2={570} y2={161} stroke="var(--line-2)" />
          </motion.g>
        );
      })}
      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
        <rect x={570} y={122} width={180} height={78} fill="var(--red-dim)" stroke="var(--red)" />
        <text x={660} y={154} textAnchor="middle" className="mono" fontSize={20} fill="var(--text-2)">
          2 de 3
        </text>
        <text x={660} y={184} textAnchor="middle" fontSize={26} fontWeight={600} fill="var(--text)">
          sí
        </text>
      </motion.g>
    </svg>
  );
}

const OPCIONES = [1, 10, 100].map((b) => ({ valor: b, texto: b === 1 ? "1 árbol" : `${b} árboles` }));

export default function Agregacion({ step, active }: SlideProps) {
  const [estado, setEstado] = useState<Estado>({ n: 0, sumaRejilla: [], sumaCorte: [], errores: [] });
  const [elegido, setElegido] = useState<number | null>(null);
  const caso = step >= 1;

  // Bagging en vivo: 100 árboles sin límite sobre las 10 000 personas, entrenados por tandas para no congelar la pantalla.
  useEffect(() => {
    if (!active || !caso) return;
    const rand = mulberry32(11);
    const acum = new Float64Array(P.X.length);
    const sumaRejilla: Float32Array[] = [];
    const sumaCorte: Float32Array[] = [];
    const errores: number[] = [];
    let id = 0;
    const tanda = () => {
      for (let k = 0; k < 4 && errores.length < B_MAX; k++) {
        const { tree } = arbolBootstrap(E.X, E.y, todos, rand);
        const b = errores.length;
        const rej = new Float32Array(REJILLA.celdas.length);
        REJILLA.celdas.forEach((c, n) => (rej[n] = (b ? sumaRejilla[b - 1][n] : 0) + predictProba(tree, c.centro)));
        sumaRejilla.push(rej);
        const cor = new Float32Array(EDADES.length * EDUS.length);
        EDADES.forEach((e, i) => EDUS.forEach((u, j) => (cor[i * EDUS.length + j] = (b ? sumaCorte[b - 1][i * EDUS.length + j] : 0) + predictProba(tree, [e, u, HORAS]))));
        sumaCorte.push(cor);
        let ok = 0;
        for (let i = 0; i < P.X.length; i++) {
          acum[i] += predictProba(tree, P.X[i]);
          if ((acum[i] / (b + 1) > 0.5 ? 1 : 0) === P.y[i]) ok++;
        }
        errores.push(1 - ok / P.X.length);
      }
      setEstado({ n: errores.length, sumaRejilla, sumaCorte, errores });
      if (errores.length < B_MAX) id = window.setTimeout(tanda, 30);
    };
    id = window.setTimeout(tanda, 80);
    return () => clearTimeout(id);
  }, [active, caso]);

  // Cada clic sube el tamaño del bosque: 1 → 10 → 100 (y se queda en 100). Los botones permiten regresar.
  useEffect(() => setElegido(null), [step]);
  const pedido = elegido ?? (step <= 1 ? 1 : step === 2 ? 10 : 100);
  const b = Math.min(pedido, estado.n);

  const fraccion = useMemo(() => {
    if (!b) return null;
    const s = estado.sumaRejilla[b - 1];
    return Float32Array.from(s, (v) => v / b);
  }, [estado, b]);

  // Referencias honestas: el árbol de profundidad 3 con las mismas 3 variables, y Adult completo.
  const prof3 = useMemo(() => 1 - accuracy(fitClassifier(E.X, E.y, 3) as ClassNode, P.X, P.y), []);
  const acc = (modelo: string) => comparacion.find((c) => c.modelo === modelo)!.accuracy.media;

  return (
    <SlideFrame
      section={["U7 · Ensambles", "B. Bagging"]}
      num={11}
      caso={caso ? "Adult · 3 variables" : null}
      title="Agregación: muchos árboles, una respuesta"
      lede={
        caso
          ? "Bagging entrenándose aquí mismo: cada árbol, sin límite de profundidad, con su propia muestra bootstrap de las 10,000 personas."
          : "Bagging = bootstrap + agregación. Cada árbol opina y la respuesta final es lo que diga la mayoría."
      }
    >
      <AnimatePresence mode="wait">
        {!caso ? (
          <motion.div
            key="concepto"
            style={{ display: "grid", gridTemplateColumns: "780px 1fr", gap: 90 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <div>
              <span className="label">Esquema · tres árboles, una persona</span>
              <div style={{ marginTop: 20 }}>
                <Votacion />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 30, paddingTop: 30 }}>
              <Def termino="Clasificación">
                Gana la clase con más votos. En la práctica se promedian las probabilidades que da cada árbol (así lo hace sklearn).
              </Def>
              <Def termino="Regresión">Se promedian los números que predice cada árbol.</Def>
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Chips opciones={OPCIONES} valor={pedido} onChange={setElegido} />
                <span className="label">{estado.n < B_MAX ? `entrenando… ${estado.n} de ${B_MAX}` : `${B_MAX} árboles listos`}</span>
              </div>
              <div style={{ height: 480, marginTop: 8 }}>
                <Adult3DScene estilo={() => ({ tenue: true })}>
                  <VoteVolume3D fraccion={fraccion} />
                </Adult3DScene>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="label" style={{ color: "var(--red-2)" }}>
                  región roja = más de la mitad dice que sí
                </span>
                <LeyendaAdult />
              </div>
            </div>
            {/* Derecha, un clic por idea: el corte 2D (1, 10 y 100 árboles), luego la curva de error y al final la conclusión. */}
            <div>
              {step <= 3 && (
                <motion.div key="corte" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <span className="label">Corte a {HORAS} h · más rojo = más árboles dicen sí</span>
                  <div style={{ marginTop: 10 }}>
                    <Corte suma={b ? estado.sumaCorte[b - 1] : undefined} b={b} />
                  </div>
                  <div className="label" style={{ marginTop: 8 }}>
                    ↑ años de educación · edad →
                  </div>
                  <div className="mono" style={{ fontSize: 26, color: "var(--red-2)", marginTop: 26 }}>
                    error de prueba: {b ? pct(estado.errores[b - 1]) : "…"}
                  </div>
                </motion.div>
              )}
              {step === 4 && (
                <motion.div key="curva" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <span className="label">Error de prueba contra árboles en el bosque</span>
                  <div style={{ marginTop: 14 }}>
                    <Lineas
                      ancho={700}
                      alto={360}
                      x={[1, B_MAX]}
                      y={[0.21, 0.26]}
                      ticksX={[1, 10, 25, 50, 75, 100]}
                      ticksY={[0.22, 0.24, 0.26]}
                      fmtY={(v) => `${Math.round(v * 100)}%`}
                      rotuloX="árboles en el bosque"
                      margen={{ l: 56, r: 22, t: 10, b: 44 }}
                      series={[{ id: "err", pts: estado.errores.map((e, i): [number, number] => [i + 1, e]), color: "var(--red)", grosor: 2.5 }]}
                      marcas={b ? [{ x: b, y: estado.errores[b - 1] }] : []}
                    />
                  </div>
                  <div className="mono" style={{ fontSize: 26, color: "var(--red-2)", marginTop: 18 }}>
                    error de prueba con {b} {b === 1 ? "árbol" : "árboles"}: {b ? pct(estado.errores[b - 1]) : "…"}
                  </div>
                </motion.div>
              )}
              {step >= 5 && (
                <motion.div key="cierre" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} style={{ paddingTop: 30 }}>
                  <p className="takeaway" style={{ margin: 0 }}>
                    Mismo tipo de árbol, <em>menos varianza</em>: los escalones de un solo árbol se difuminan en una frontera gradual.
                  </p>
                  <p style={{ fontSize: 26, color: "var(--text-3)", margin: "28px 0 0", lineHeight: 1.4 }}>
                    Con solo 3 variables, un árbol de profundidad 3 falla menos ({pct(prof3)}): bagging no arregla la falta de información. Con
                    las {adultMuestra.columnas.length} variables sí gana: {pct(acc("Árbol de decisión"))} → {pct(acc("Bagging"))} de aciertos.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SlideFrame>
  );
}
