import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Def } from "../components/Piezas";
import { Reveal } from "../components/Reveal";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { importancias } from "../lib/adult";
import { mulberry32 } from "../lib/rng";

// ---------- Concepto: barajar una columna y ver cuánto empeora el modelo ----------
const TABLA = [
  [25, 40, "no"],
  [52, 60, "sí"],
  [38, 45, "sí"],
  [19, 20, "no"],
  [44, 50, "sí"],
] as const;

function ColumnaBarajada({ activa }: { activa: boolean }) {
  const [orden, setOrden] = useState([0, 1, 2, 3, 4]);
  useEffect(() => {
    if (!activa) return;
    const r = mulberry32(3);
    const id = window.setInterval(() => setOrden((o) => [...o].sort(() => r() - 0.5)), 1800);
    return () => clearInterval(id);
  }, [activa]);
  const alto = 46;
  const col = [0, 150, 300];
  return (
    <svg width={440} height={alto * 6 + 10}>
      {["edad", "horas", "y"].map((t, c) => (
        <text key={t} x={col[c] + 50} y={26} textAnchor="middle" className="mono" fontSize={16} fill={c === 0 ? "var(--red-2)" : "var(--text-3)"}>
          {c === 0 ? "edad (barajada)" : t}
        </text>
      ))}
      {TABLA.map((fila, i) => (
        <g key={i}>
          <line x1={0} x2={420} y1={alto * (i + 1) - 4} y2={alto * (i + 1) - 4} stroke="var(--line)" />
          <text x={col[1] + 50} y={alto * (i + 1) + 28} textAnchor="middle" className="mono" fontSize={22} fill="var(--text)">
            {fila[1]}
          </text>
          <text x={col[2] + 50} y={alto * (i + 1) + 28} textAnchor="middle" fontSize={22} fill="var(--text)">
            {fila[2]}
          </text>
        </g>
      ))}
      {/* La columna barajada: cada valor viaja a la fila que le tocó. */}
      {orden.map((origen, destino) => (
        <motion.text
          key={origen}
          x={col[0] + 50}
          initial={false}
          animate={{ y: alto * (destino + 1) + 28 }}
          transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
          textAnchor="middle"
          className="mono"
          fontSize={22}
          fill="var(--red-2)"
        >
          {TABLA[origen][0]}
        </motion.text>
      ))}
    </svg>
  );
}

// ---------- Caso: Random Forest en Adult, con una columna de ruido como control ----------
const FILAS = [...importancias.filas].sort((a, b) => b.mdi - a.mdi);
const MAX_MDI = Math.max(...FILAS.map((f) => f.mdi));
const MAX_PERM = Math.max(...FILAS.map((f) => f.permutacion));
const SOSPECHOSAS = new Set(["ruido"]);
const ruido = FILAS.find((f) => f.variable === "ruido")!;
const lugarRuido = FILAS.indexOf(ruido) + 1;
// Tres decimales, sin escribir "-0.000" cuando el valor es prácticamente cero.
const tres = (v: number) => (Math.abs(v) < 0.0005 ? 0 : v).toFixed(3);

function Barras({ conPermutacion }: { conPermutacion: boolean }) {
  const h = 31;
  const xNombre = 250;
  const wBarra = 520;
  const x2 = xNombre + wBarra + 130;
  return (
    <svg width={1696} height={FILAS.length * h + 40} style={{ display: "block" }}>
      <text x={xNombre} y={18} className="mono" fontSize={15} fill="var(--text-3)" letterSpacing="0.1em">
        MDI · SE MIDE AL ENTRENAR
      </text>
      {conPermutacion && (
        <text x={x2} y={18} className="mono" fontSize={15} fill="var(--text-3)" letterSpacing="0.1em">
          PERMUTACIÓN · CUÁNTO BAJAN LOS ACIERTOS EN DATOS NO VISTOS
        </text>
      )}
      {FILAS.map((f, i) => {
        const y = 34 + i * h;
        const raro = SOSPECHOSAS.has(f.variable);
        return (
          <g key={f.variable}>
            <text x={xNombre - 16} y={y + 18} textAnchor="end" fontSize={20} fill={raro ? "var(--red-2)" : "var(--text-2)"}>
              {f.nombre_es}
            </text>
            <motion.rect
              x={xNombre}
              y={y + 4}
              height={h - 10}
              initial={{ width: 0 }}
              animate={{ width: (f.mdi / MAX_MDI) * wBarra }}
              transition={{ duration: 0.6, delay: i * 0.03 }}
              fill={raro ? "var(--red)" : "var(--data-dim)"}
            />
            <text x={xNombre + (f.mdi / MAX_MDI) * wBarra + 10} y={y + 18} className="mono" fontSize={16} fill="var(--text-3)">
              {f.mdi.toFixed(3)}
            </text>
            {conPermutacion && (
              <>
                <motion.rect
                  x={x2}
                  y={y + 4}
                  height={h - 10}
                  initial={{ width: 0 }}
                  animate={{ width: Math.max(0, f.permutacion / MAX_PERM) * wBarra }}
                  transition={{ duration: 0.6, delay: i * 0.03 }}
                  fill={raro ? "var(--red)" : "var(--data)"}
                />
                <text x={x2 + Math.max(0, f.permutacion / MAX_PERM) * wBarra + 10} y={y + 18} className="mono" fontSize={16} fill={raro ? "var(--red-2)" : "var(--text-3)"}>
                  {tres(f.permutacion)}
                </text>
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default function ImportanciaDeVariables({ step, active }: SlideProps) {
  const caso = step >= 1;
  return (
    <SlideFrame
      section={["U7 · Ensambles", "C. Random Forest"]}
      num={15}
      caso={caso ? "Adult" : null}
      title="¿Qué variables importan?"
      lede={
        caso
          ? "Random Forest de 300 árboles. Se agregó una columna de ruido puro, sin relación con la respuesta, como control."
          : "Un bosque no se puede leer como un árbol, pero sí se le puede preguntar en qué variables se apoya. Hay dos formas de medirlo."
      }
    >
      <AnimatePresence mode="wait">
        {!caso ? (
          <motion.div key="concepto" style={{ display: "grid", gridTemplateColumns: "1fr 460px", gap: 100 }} exit={{ opacity: 0, transition: { duration: 0.2 } }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 36, paddingTop: 20 }}>
              <Def termino="MDI: cuánto ordena cada variable">
                Cada vez que un árbol pregunta por una variable, los grupos quedan menos revueltos. Se suma esa mejora en todos los árboles. Se
                calcula con los datos de entrenamiento.
              </Def>
              <Def termino="Permutación: qué pasa si la rompo">
                Se baraja una columna en datos que el modelo no vio y se mide cuánto bajan los aciertos. Si no bajan, el modelo no la
                necesitaba.
              </Def>
            </div>
            <div>
              <span className="label">Esquema · barajar una columna</span>
              <div style={{ marginTop: 16 }}>
                <ColumnaBarajada activa={active && !caso} />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="caso" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <Barras conPermutacion={step >= 2} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, marginTop: 6 }}>
              <p style={{ fontSize: 22, color: "var(--text-2)", lineHeight: 1.4, margin: 0 }}>
                Según MDI, el <b style={{ color: "var(--red-2)" }}>ruido</b> es la variable número {lugarRuido} de {FILAS.length}.
                {step >= 2 && <> Al barajarlo, los aciertos casi no cambian ({tres(ruido.permutacion)}).</>}
              </p>
              <Reveal step={step} at={3}>
                <p className="takeaway" style={{ margin: 0, fontSize: 24 }}>
                  MDI premia a las variables con <em>muchos valores distintos</em>, aunque no sirvan. La permutación en datos no vistos es
                  más confiable.
                </p>
              </Reveal>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SlideFrame>
  );
}
