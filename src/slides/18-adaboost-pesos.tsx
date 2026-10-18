import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { Adult3DScene, LeyendaAdult, vistaX, vistaY, type Plano } from "../components/Adult3DScene";
import { JugueteAdaBoost, RONDAS_JUGUETE } from "../components/JugueteAdaBoost";
import { Lineas } from "../components/Lineas";
import { Def, pct } from "../components/Piezas";
import { Reveal } from "../components/Reveal";
import { REJILLA, VoteVolume3D } from "../components/VoteVolume3D";
import { useFlechas } from "../deck/hooks";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { adult3d } from "../lib/adult";
import { adaboost, errorPorRonda, puntaje } from "../lib/adaboost";

const P = adult3d.prueba;
const N = vistaX.length;
const MAX = 50;

export default function AdaboostPesos({ step, active }: SlideProps) {
  const [ronda, setRonda] = useState(1);
  const caso = step >= 2;
  useFlechas(active && caso, () => setRonda((r) => Math.min(MAX, r + 1)), () => setRonda((r) => Math.max(1, r - 1)));

  // AdaBoost con stumps sobre las 400 personas visibles: 50 rondas.
  const rondas = useMemo(() => adaboost(vistaX, vistaY, MAX), []);
  const errEntrenamiento = useMemo(() => errorPorRonda(rondas, vistaX, vistaY), [rondas]);
  const errPrueba = useMemo(() => errorPorRonda(rondas, P.X, P.y), [rondas]);
  const r = rondas[ronda - 1];

  // Región donde el comité de las primeras `ronda` rondas responde "sí".
  const fraccion = useMemo(() => Float32Array.from(REJILLA.celdas, (c) => (puntaje(rondas, c.centro, ronda) > 0 ? 1 : 0)), [rondas, ronda]);
  const plano: Plano[] = r.stump.feature >= 0 ? [{ variable: r.stump.feature as 0 | 1 | 2, valor: r.stump.threshold, color: "#ffffff" }] : [];
  // El peso de cada persona al empezar la ronda, comparado con el peso parejo 1/N.
  const escala = (k: number) => Math.min(3.2, Math.max(0.55, Math.sqrt(r.pesosAntes[k] * N)));
  const malRonda1 = RONDAS_JUGUETE[0].pesosAntes.filter((_, i) => RONDAS_JUGUETE[0].pesos[i] > RONDAS_JUGUETE[0].pesosAntes[i]).length;

  return (
    <SlideFrame
      section={["U7 · Ensambles", "D. Boosting"]}
      num={18}
      caso={caso ? "Adult · 3 variables" : null}
      title="AdaBoost: darle más peso a los errores"
      lede={
        caso
          ? "AdaBoost sobre las 400 personas que ves. El tamaño de cada punto es su peso; el plano blanco es la pregunta de esta ronda."
          : "Cada ejemplo tiene un peso. Los que el modelo clasifica mal pesan más en la siguiente ronda, así que el nuevo stump se fija en ellos."
      }
    >
      <AnimatePresence mode="wait">
        {!caso ? (
          <motion.div key="concepto" style={{ display: "grid", gridTemplateColumns: "460px 460px 1fr", gap: 60 }} exit={{ opacity: 0, transition: { duration: 0.2 } }}>
            <div>
              <span className="label">Esquema · ronda 1</span>
              <div style={{ marginTop: 12 }}>
                <JugueteAdaBoost m={0} />
              </div>
              <div style={{ fontSize: 26, color: "var(--text-2)", marginTop: 8, lineHeight: 1.4 }}>
                Todos pesan igual. El stump falla {malRonda1} (borde punteado).
              </div>
            </div>
            <Reveal step={step} at={1}>
              <span className="label">Ronda 2</span>
              <div style={{ marginTop: 12 }}>
                <JugueteAdaBoost m={1} />
              </div>
              <div style={{ fontSize: 26, color: "var(--text-2)", marginTop: 8, lineHeight: 1.4 }}>
                Los que falló ahora son más grandes. El nuevo corte los atiende.
              </div>
            </Reveal>
            <div style={{ display: "flex", flexDirection: "column", gap: 28, paddingTop: 36 }}>
              <Def termino="Peso de un ejemplo">Qué tanto cuenta equivocarse con él. Al inicio todos pesan lo mismo.</Def>
              <Reveal step={step} at={1}>
                <Def termino="Re-ponderar">
                  Después de cada ronda suben los pesos de los mal clasificados y bajan los demás. Zona roja = donde el stump dice "sí".
                </Def>
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
                <span className="label" style={{ color: "var(--red-2)" }}>
                  región roja = el comité dice que sí
                </span>
                <LeyendaAdult />
              </div>
              <div style={{ height: 470, marginTop: 8 }}>
                <Adult3DScene estilo={(k) => ({ escala: escala(k) })} planos={plano}>
                  <VoteVolume3D fraccion={fraccion} />
                </Adult3DScene>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", alignItems: "center", gap: 24 }}>
                <div style={{ fontSize: 26 }}>
                  Ronda{" "}
                  <span className="mono" style={{ color: "var(--red)", fontSize: 30, marginLeft: 8 }}>
                    {ronda}
                  </span>
                </div>
                <input className="range" type="range" min={1} max={MAX} value={ronda} onChange={(e) => setRonda(Number(e.target.value))} onPointerUp={(e) => e.currentTarget.blur()} />
              </div>
              <div className="label" style={{ fontSize: 20, marginTop: 4 }}>
                ↑ ↓ cambian de ronda
              </div>
            </div>
            <div>
              <span className="label">
                Error del comité · <span style={{ color: "var(--red-2)" }}>prueba (5,000 personas)</span> · entrenamiento
              </span>
              <div style={{ marginTop: 10 }}>
                <Lineas
                  ancho={700}
                  alto={330}
                  x={[1, MAX]}
                  y={[0.12, 0.26]}
                  ticksX={[1, 10, 20, 30, 40, 50]}
                  ticksY={[0.12, 0.16, 0.2, 0.24]}
                  fmtY={(v) => `${Math.round(v * 100)}%`}
                  rotuloX="rondas"
                  lineaV={ronda}
                  series={[
                    { id: "tr", pts: errEntrenamiento.map((e, i): [number, number] => [i + 1, e]) },
                    { id: "te", pts: errPrueba.map((e, i): [number, number] => [i + 1, e]), color: "var(--red)", grosor: 3 },
                  ]}
                />
              </div>
              <div className="mono" style={{ fontSize: 20, color: "var(--text-2)", lineHeight: 1.6, marginTop: 6 }}>
                <div>
                  error ponderado de este stump: <span style={{ color: "var(--text)" }}>{pct(r.eps)}</span>
                </div>
                <div>
                  error del comité: entrenamiento {pct(errEntrenamiento[ronda - 1])} · prueba{" "}
                  <span style={{ color: "var(--red-2)" }}>{pct(errPrueba[ronda - 1])}</span>
                </div>
              </div>
              <Reveal step={step} at={3} style={{ marginTop: 18 }}>
                <p className="takeaway" style={{ margin: 0, fontSize: 26 }}>
                  Cada stump es débil, pero <em>se especializa en lo que el comité todavía falla</em>. La región se va armando corte por
                  corte.
                </p>
              </Reveal>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SlideFrame>
  );
}
