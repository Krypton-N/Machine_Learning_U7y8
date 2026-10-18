import { AnimatePresence, motion } from "motion/react";
import { useMemo } from "react";
import { Adult3DScene, LeyendaAdult, type Caja, type Plano } from "../components/Adult3DScene";
import { Def } from "../components/Piezas";
import { Recap } from "../components/Recap";
import { Reveal } from "../components/Reveal";
import { TablaCruda, type Crudo } from "../components/TablaCruda";
import { TeX } from "../components/TeX";
import { diagramaDe, TreeDiagram, type NodoDiagrama } from "../components/TreeDiagram";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { adult3d, adultMuestra, bounds3d } from "../lib/adult";
import { fitClassifier, leafBoxes, type ClassNode } from "../lib/tree";

const E = adult3d.entrenamiento;
const VARIABLES = ["edad", "educación", "horas"];

// Adult con 3 variables, tal como llega: las mismas 5 filas de la diapositiva 3, solo con las columnas que se dibujan.
const COLUMNAS_3D = ["age", "education-num", "hours-per-week"];
const EJES = ["edad: de izquierda a derecha", "años de educación: la altura", "horas por semana: el fondo"];
const CRUDO_3D: Crudo = (() => {
  const c = adultMuestra.crudo;
  const idx = [...COLUMNAS_3D, c.objetivo].map((n) => c.columnas.findIndex((x) => x.nombre === n));
  return { columnas: idx.map((i) => c.columnas[i]), filas: c.filas.map((f) => idx.map((i) => f[i])) };
})();
const miles = (n: number) => n.toLocaleString("es-MX");

function Adult3Crudo() {
  return (
    <div>
      <div className="mono" style={{ fontSize: 20, color: "var(--red-2)", marginBottom: 12 }}>
        adult[[{COLUMNAS_3D.map((c) => `"${c}"`).join(", ")}, "{adultMuestra.crudo.objetivo}"]].head()
      </div>
      <TablaCruda datos={CRUDO_3D} tamano={24} />
      <div style={{ display: "grid", gap: 8, marginTop: 26 }}>
        {COLUMNAS_3D.map((c, i) => (
          <div key={c} style={{ display: "grid", gridTemplateColumns: "250px 30px 1fr", fontSize: 26, alignItems: "baseline" }}>
            <span className="mono" style={{ color: "var(--text-2)" }}>
              {c}
            </span>
            <span className="mono" style={{ color: "var(--red)" }}>
              →
            </span>
            <span>{EJES[i]}</span>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 26, color: "var(--text-2)", lineHeight: 1.45, margin: "24px 0 0" }}>
        Cada fila pasa a ser un punto; el color es su <span className="mono">class</span>. Se entrena con {miles(E.X.length)} personas, se examina con otras{" "}
        {miles(adult3d.prueba.X.length)} y se dibujan {miles(adult3d.vista.length)}.
      </p>
    </div>
  );
}

// ---------- Concepto: un árbol de esquema, sin datos ----------
const esquema: NodoDiagrama = {
  texto: "¿pregunta 1?",
  detalle: "raíz",
  hijos: [
    {
      texto: "¿pregunta 2?",
      detalle: "nodo",
      hijos: [
        { texto: "respuesta", detalle: "hoja" },
        { texto: "respuesta", detalle: "hoja" },
      ],
    },
    { texto: "respuesta", detalle: "hoja" },
  ],
};

// Gini de una urna con `rojas` de 10: 1 − Σp² = 2p(1 − p) cuando hay dos clases.
const gini = (rojas: number) => 2 * (rojas / 10) * (1 - rojas / 10);

function Urna({ rojas }: { rojas: number }) {
  return (
    <div style={{ textAlign: "center" }}>
      <svg width={150} height={66}>
        {Array.from({ length: 10 }, (_, i) => (
          <circle key={i} cx={15 + (i % 5) * 30} cy={16 + Math.floor(i / 5) * 32} r={11} fill={i < rojas ? "var(--red)" : "var(--data-dim)"} />
        ))}
      </svg>
      <div className="mono" style={{ fontSize: 22, marginTop: 6 }}>
        {gini(rojas).toFixed(2)}
      </div>
    </div>
  );
}

// Los cortes del árbol como planos, cada uno recortado a la región donde aplica.
function planosDe(arbol: ClassNode, maxNivel: number, region = bounds3d, nivel = 0): (Plano & { nivel: number })[] {
  if (arbol.leaf || nivel > maxNivel) return [];
  const f = arbol.feature as 0 | 1 | 2;
  const izq = { min: region.min, max: region.max.map((v, i) => (i === f ? arbol.threshold : v)) };
  const der = { min: region.min.map((v, i) => (i === f ? arbol.threshold : v)), max: region.max };
  return [
    { variable: f, valor: arbol.threshold, region, nivel },
    ...planosDe(arbol.left, maxNivel, izq, nivel + 1),
    ...planosDe(arbol.right, maxNivel, der, nivel + 1),
  ];
}

export default function ArbolDeDecision({ step }: SlideProps) {
  const arbol = useMemo(() => fitClassifier(E.X, E.y, 2), []);
  const diagrama = useMemo(() => diagramaDe(arbol, VARIABLES), [arbol]);
  const caso = step >= 2;
  // Paso 2: los datos tal como llegan, todavía sin árbol. Paso 3: la primera pregunta. Paso 4 en adelante: el árbol completo y sus cajas.
  const crudo = step === 2;
  const nivel = step >= 4 ? 2 : 0;
  const planos = crudo ? [] : planosDe(arbol, nivel === 0 ? 0 : 1).map((p) => ({ ...p, color: p.nivel === 0 && nivel > 0 ? "#8e8e96" : "#e5383b" }));
  const cajas: Caja[] = step >= 4 ? leafBoxes(arbol, bounds3d).filter((b) => b.pos / b.n > 0.5) : [];
  const hojaSi = leafBoxes(arbol, bounds3d).find((b) => b.pos / b.n > 0.5);

  return (
    <SlideFrame
      section={["U7 · Ensambles", "A. Bases"]}
      num={4}
      caso={caso ? "Adult · 3 variables" : null}
      title="Árbol de decisión"
      lede={
        crudo
          ? "Para dibujar a las personas se usa una versión de Adult con solo 3 columnas. Así llegan esos datos."
          : caso
            ? "El árbol real de dos niveles para predecir si una persona gana más de 50 mil dólares al año. Cada pregunta es un corte de la caja."
          : "Como en el juego de las 20 preguntas: una cadena de preguntas de sí o no que termina en una respuesta."
      }
    >
      <AnimatePresence mode="wait">
        {!caso ? (
          <motion.div
            key="concepto"
            style={{ display: "grid", gridTemplateColumns: "820px 800px", justifyContent: "space-between" }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <div>
              <span className="label">Esquema · no son datos</span>
              <div style={{ marginTop: 22 }}>
                <TreeDiagram raiz={esquema} ancho={820} />
              </div>
              <p style={{ fontSize: 26, color: "var(--text-2)", lineHeight: 1.45, margin: "26px 0 0" }}>
                <b style={{ color: "var(--text)", fontWeight: 500 }}>Profundidad:</b> cuántas preguntas hay, como máximo, antes de responder.
                Este árbol tiene profundidad 2.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
              <Def termino="¿Cómo elige cada pregunta?">
                Prueba todos los cortes posibles y se queda con el que deja los dos grupos <b style={{ color: "var(--text)" }}>menos revueltos</b>.
              </Def>
              <Reveal step={step} at={1}>
                <Recap title="impureza de Gini">
                  <p>
                    Mide qué tan revuelto está un grupo: <TeX>{"G = 1 - \\sum_k p_k^2"}</TeX>. Vale 0 si todos son iguales y 0.5 si
                    están mitad y mitad.
                  </p>
                  <div style={{ display: "flex", gap: 44, marginTop: 22 }}>
                    <Urna rojas={5} />
                    <Urna rojas={1} />
                    <Urna rojas={0} />
                  </div>
                </Recap>
              </Reveal>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="caso"
            style={{ display: "grid", gridTemplateColumns: "840px 820px", justifyContent: "space-between" }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <AnimatePresence mode="wait">
              {crudo ? (
                <motion.div key="crudo" exit={{ opacity: 0, transition: { duration: 0.2 } }}>
                  <Adult3Crudo />
                </motion.div>
              ) : (
                <motion.div key="arbol" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                  <span className="label">Entrenado con 10,000 personas · en cada nodo: cuántas hay y qué porcentaje gana &gt; 50K</span>
                  <div style={{ marginTop: 22 }}>
                    <TreeDiagram raiz={diagrama} ancho={840} nivelVisible={nivel} resaltar={nivel === 0 ? 0 : 1} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span className="label">Se dibujan 400 personas · arrastra para girar</span>
                <LeyendaAdult />
              </div>
              <div style={{ height: 420, marginTop: 8 }}>
                <Adult3DScene planos={planos} cajas={cajas} />
              </div>
              <Reveal step={step} at={5}>
                <p className="takeaway" style={{ margin: 0, fontSize: 26 }}>
                  Un árbol parte el espacio en <em>cajas</em> y en cada una responde lo que es mayoría.
                  {hojaSi && (
                    <>
                      {" "}
                      Aquí solo una caja dice que sí: ahí el {((hojaSi.pos / hojaSi.n) * 100).toFixed(1)} % gana más de 50K.
                    </>
                  )}
                </p>
              </Reveal>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SlideFrame>
  );
}
