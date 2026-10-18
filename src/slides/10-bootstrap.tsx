import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { Adult3DScene, vista } from "../components/Adult3DScene";
import { Boton, Dato, pct } from "../components/Piezas";
import { Recap } from "../components/Recap";
import { Reveal } from "../components/Reveal";
import { TableroSorteos } from "../components/TableroSorteos";
import { TeX } from "../components/TeX";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { bootstrap, multiplicidad } from "../lib/bagging";
import { mulberry32 } from "../lib/rng";
import { linear } from "../lib/scale";

const N = vista.length; // 400
const indices = vista.map((_, k) => k);

/** Una muestra bootstrap de las 400 personas: cuántas veces salió cada una. */
const muestra = (semilla: number) => multiplicidad(bootstrap(indices, mulberry32(1000 + semilla)), N);
const fuera = (veces: number[]) => veces.filter((v) => v === 0).length;

// 200 muestras para ver cuántas personas quedan fuera cada vez.
const DOSCIENTAS = Array.from({ length: 200 }, (_, s) => fuera(muestra(s + 1)));
const esperado = N * (1 - 1 / N) ** N;

function Histograma() {
  const W = 620;
  const H = 250;
  const min = Math.min(...DOSCIENTAS);
  const max = Math.max(...DOSCIENTAS);
  const conteo = new Map<number, number>();
  DOSCIENTAS.forEach((v) => conteo.set(v, (conteo.get(v) ?? 0) + 1));
  const tope = Math.max(...conteo.values());
  const fx = linear([min - 1, max + 1], [20, W - 20]);
  const fy = linear([0, tope], [H - 40, 14]);
  const ancho = (fx(1) - fx(0)) * 0.8;
  return (
    <svg width={W} height={H} style={{ display: "block" }}>
      {[...conteo].map(([v, c]) => (
        <motion.rect
          key={v}
          x={fx(v) - ancho / 2}
          width={ancho}
          initial={{ y: fy(0), height: 0 }}
          animate={{ y: fy(c), height: fy(0) - fy(c) }}
          transition={{ duration: 0.6 }}
          fill="var(--data-dim)"
        />
      ))}
      <line x1={fx(esperado)} x2={fx(esperado)} y1={4} y2={H - 40} stroke="var(--red)" strokeWidth={2} />
      <text x={fx(esperado) + 8} y={18} className="mono" fontSize={20} fill="var(--red-2)">
        esperado: {esperado.toFixed(1)} ({pct(esperado / N)})
      </text>
      {[min, Math.round((min + max) / 2), max].map((v) => (
        <text key={v} x={fx(v)} y={H - 14} textAnchor="middle" className="mono" fontSize={20} fill="var(--text-3)">
          {v}
        </text>
      ))}
    </svg>
  );
}

export default function Bootstrap({ step }: SlideProps) {
  const [pelotas, setPelotas] = useState(1);
  const [sorteo, setSorteo] = useState(1);
  const veces = useMemo(() => muestra(sorteo), [sorteo]);
  const caso = step >= 2;

  return (
    <SlideFrame
      section={["U7 · Ensambles", "B. Bagging"]}
      num={10}
      caso={caso ? "Adult · 3 variables" : null}
      title="Bootstrap: fabricar muchos conjuntos de datos"
      lede={
        caso
          ? "Las 400 personas son la bolsa. Se sortean 400 veces con reemplazo: las elegidas se ven encendidas, más grandes si salieron varias veces."
          : "Para tener muchos árboles distintos hacen falta muchos conjuntos de datos. Solo tenemos uno, así que se remuestrea."
      }
    >
      <AnimatePresence mode="wait">
        {!caso ? (
          <motion.div
            key="concepto"
            style={{ display: "grid", gridTemplateColumns: "640px 1fr", gap: 100 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <div>
              <TableroSorteos semilla={pelotas} />
              <div style={{ marginTop: 18 }}>
                <Boton onClick={() => setPelotas((s) => s + 1)}>otro sorteo</Boton>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
              <Recap title="muestreo con reemplazo">
                <p>Se saca una pelota, se anota y se regresa a la bolsa antes de sacar la siguiente. Por eso una puede salir varias veces y otra, ninguna.</p>
              </Recap>
              <Reveal step={step} at={1}>
                <div className="label" style={{ marginBottom: 14 }}>
                  ¿Qué tan seguido una pelota no sale nunca?
                </div>
                <div style={{ fontSize: 30 }}>
                  <TeX>{"P(\\text{no salir}) = \\left(1-\\tfrac{1}{n}\\right)^{n}"}</TeX>
                </div>
                <p style={{ fontSize: 26, color: "var(--text-2)", lineHeight: 1.5, margin: "16px 0 0" }}>
                  Con 5 pelotas es <b style={{ color: "var(--text)" }}>{pct((1 - 1 / 5) ** 5)}</b>. Con muchas se acerca a{" "}
                  <TeX>{"e^{-1}"}</TeX> ≈ <b style={{ color: "var(--red-2)" }}>{pct(Math.exp(-1))}</b>: cada muestra deja fuera a poco más
                  de un tercio.
                </p>
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
              <span className="label">encendida = salió en esta muestra · tenue = quedó fuera</span>
              <div style={{ height: 500, marginTop: 8 }}>
                <Adult3DScene estilo={(k) => (veces[k] === 0 ? { tenue: true, escala: 0.8 } : { escala: 1 + 0.5 * (veces[k] - 1) })} />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 26, paddingTop: 10 }}>
              <div>
                <Boton onClick={() => setSorteo((s) => s + 1)}>otra muestra</Boton>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30 }}>
                <Dato valor={N - fuera(veces)} rotulo="personas distintas en la muestra" />
                <Dato rojo valor={`${fuera(veces)} · ${pct(fuera(veces) / N)}`} rotulo="quedaron fuera" />
              </div>
              <Reveal step={step} at={3}>
                <div className="label" style={{ margin: "6px 0 8px" }}>
                  Personas que quedan fuera en 200 muestras
                </div>
                <Histograma />
                <p className="takeaway" style={{ margin: "14px 0 0", fontSize: 26 }}>
                  Cada muestra es un conjunto <em>parecido pero distinto</em>. Bagging entrena un árbol con cada una.
                </p>
              </Reveal>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SlideFrame>
  );
}
