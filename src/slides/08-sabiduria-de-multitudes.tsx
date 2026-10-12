import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { Lineas } from "../components/Lineas";
import { Boton, Chips, Dato, pct } from "../components/Piezas";
import { Reveal } from "../components/Reveal";
import { TeX } from "../components/TeX";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { varianzaEnsamble } from "../lib/adult";
import { mulberry32 } from "../lib/rng";

// ---------- Concepto 1: un jurado de B miembros que aciertan con probabilidad p, cada uno por su cuenta ----------
const P_ACIERTO = 0.6;

/** Probabilidad exacta de que la mayoría de B votantes independientes acierte (B impar). */
function mayoria(B: number, p: number): number {
  let pmf = [1]; // distribución del número de aciertos
  for (let i = 0; i < B; i++) {
    const sig = new Array<number>(pmf.length + 1).fill(0);
    pmf.forEach((v, k) => {
      sig[k] += v * (1 - p);
      sig[k + 1] += v * p;
    });
    pmf = sig;
  }
  return pmf.reduce((s, v, k) => (k > B / 2 ? s + v : s), 0);
}

const IMPARES = Array.from({ length: 51 }, (_, i) => 2 * i + 1);
const curvaMayoria = IMPARES.map((B): [number, number] => [B, mayoria(B, P_ACIERTO)]);

function Jurado({ semilla }: { semilla: number }) {
  const votos = useMemo(() => {
    const r = mulberry32(semilla);
    return Array.from({ length: 11 }, () => r() < P_ACIERTO);
  }, [semilla]);
  const aciertos = votos.filter(Boolean).length;
  return (
    <div>
      <div style={{ display: "flex", gap: 12 }}>
        {votos.map((v, i) => (
          <motion.div
            key={`${semilla}-${i}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.05 }}
            style={{ width: 34, height: 34, borderRadius: 34, background: v ? "var(--red)" : "var(--data-dim)" }}
          />
        ))}
      </div>
      <div className="mono" style={{ fontSize: 20, color: "var(--text-2)", marginTop: 12 }}>
        aciertan {aciertos} de 11 → la mayoría{" "}
        <span style={{ color: aciertos >= 6 ? "var(--red-2)" : "var(--text)" }}>{aciertos >= 6 ? "acierta" : "se equivoca"}</span>
      </div>
    </div>
  );
}

// ---------- Concepto 2: si los miembros se copian (correlación ρ), promediar ayuda menos ----------
const RHOS = [
  { valor: 0, texto: "ρ = 0 · independientes" },
  { valor: 0.3, texto: "ρ = 0.3" },
  { valor: 0.6, texto: "ρ = 0.6 · se copian" },
];
const BS = Array.from({ length: 50 }, (_, i) => i + 1);
const varPromedio = (rho: number, B: number) => rho + (1 - rho) / B; // con σ² = 1

// ---------- Caso: árboles de bagging en Adult ----------
const V = varianzaEnsamble.bagging;

export default function SabiduriaDeMultitudes({ step }: SlideProps) {
  const [semilla, setSemilla] = useState(2);
  const [rho, setRho] = useState(0.3);
  const caso = step >= 2;

  return (
    <SlideFrame
      section={["U7 · Ensambles", "A. Bases"]}
      num={8}
      caso={caso ? "Adult" : null}
      title="La sabiduría de las multitudes"
      lede={
        caso
          ? `La probabilidad que da cada árbol, medida en ${varianzaEnsamble.n_prueba.toLocaleString("es-MX")} personas nuevas y repitiendo el entrenamiento ${varianzaEnsamble.R} veces con datos distintos.`
          : "Muchas opiniones regulares pueden dar una respuesta buena, con dos condiciones: que cada una sea mejor que adivinar y que no se copien entre sí."
      }
    >
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="jurado"
            style={{ display: "grid", gridTemplateColumns: "900px 1fr", gap: 80 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <div>
              <span className="label">Probabilidad de que la mayoría acierte · cada miembro acierta el 60 %</span>
              <div style={{ marginTop: 14 }}>
                <Lineas
                  ancho={900}
                  alto={440}
                  x={[1, 101]}
                  y={[0.5, 1]}
                  ticksX={[1, 11, 21, 41, 61, 81, 101]}
                  ticksY={[0.5, 0.6, 0.7, 0.8, 0.9, 1]}
                  fmtY={(v) => `${Math.round(v * 100)}%`}
                  rotuloX="miembros del jurado"
                  series={[{ id: "mayoria", pts: curvaMayoria, color: "var(--red)", grosor: 3 }]}
                  marcas={[1, 11, 101].map((B) => ({ x: B, y: mayoria(B, P_ACIERTO), texto: `${B} → ${pct(mayoria(B, P_ACIERTO))}`, abajo: B > 1 }))}
                />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 30, paddingTop: 30 }}>
              <div>
                <div className="label" style={{ marginBottom: 16 }}>
                  Esquema · una votación de 11
                </div>
                <Jurado semilla={semilla} />
                <div style={{ marginTop: 18 }}>
                  <Boton onClick={() => setSemilla((s) => s + 1)}>otra votación</Boton>
                </div>
              </div>
              <p style={{ fontSize: 24, color: "var(--text-2)", lineHeight: 1.5, margin: 0, borderTop: "1px solid var(--line)", paddingTop: 24 }}>
                Cada uno falla 4 de cada 10 veces, pero rara vez fallan <b style={{ color: "var(--text)" }}>todos a la vez</b>. Eso
                solo vale si se equivocan por su cuenta.
              </p>
            </div>
          </motion.div>
        )}
        {step === 1 && (
          <motion.div
            key="rho"
            style={{ display: "grid", gridTemplateColumns: "900px 1fr", gap: 80 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <div>
              <span className="label">Varianza del promedio de B modelos (la de uno solo = 1)</span>
              <div style={{ marginTop: 14 }}>
                <Lineas
                  ancho={900}
                  alto={440}
                  x={[1, 50]}
                  y={[0, 1]}
                  ticksX={[1, 10, 20, 30, 40, 50]}
                  ticksY={[0, 0.25, 0.5, 0.75, 1]}
                  rotuloX="modelos que se promedian (B)"
                  series={[
                    ...RHOS.filter((r) => r.valor !== rho).map((r) => ({
                      id: `r${r.valor}`,
                      pts: BS.map((B): [number, number] => [B, varPromedio(r.valor, B)]),
                      opacidad: 0.35,
                    })),
                    { id: "actual", pts: BS.map((B): [number, number] => [B, varPromedio(rho, B)]), color: "var(--red)", grosor: 3 },
                  ]}
                  lineasH={rho > 0 ? [{ y: rho, texto: `piso = ρσ² = ${rho}`, color: "var(--red-2)", abajo: true }] : []}
                />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 28, paddingTop: 30 }}>
              <div style={{ fontSize: 28 }}>
                <TeX block>{"\\mathrm{Var}(\\text{promedio}) = {\\color{#e5383b}\\rho\\,\\sigma^2} + \\frac{(1-\\rho)\\,\\sigma^2}{B}"}</TeX>
              </div>
              <p style={{ fontSize: 23, color: "var(--text-2)", lineHeight: 1.5, margin: 0 }}>
                <TeX>{"\\sigma^2"}</TeX> es la varianza de un modelo y <TeX>{"\\rho"}</TeX>, qué tanto se parecen dos de ellos. Agregar
                modelos achica el segundo término, pero el primero <b style={{ color: "var(--text)" }}>no baja nunca</b>.
              </p>
              <Chips opciones={RHOS} valor={rho} onChange={setRho} />
            </div>
          </motion.div>
        )}
        {caso && (
          <motion.div
            key="caso"
            style={{ display: "grid", gridTemplateColumns: "900px 1fr", gap: 80 }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div>
              <span className="label">Varianza del promedio de B árboles de bagging · puntos = medida · línea = fórmula</span>
              <div style={{ marginTop: 14 }}>
                <Lineas
                  ancho={900}
                  alto={440}
                  x={[1, 50]}
                  y={[-0.008, 0.11]}
                  ticksX={[1, 10, 20, 30, 40, 50]}
                  ticksY={[0, 0.02, 0.04, 0.06, 0.08, 0.1]}
                  fmtY={(v) => v.toFixed(2)}
                  rotuloX="árboles que se promedian (B)"
                  series={[
                    { id: "formula", pts: V.var_formula.map((v, i): [number, number] => [i + 1, v]), color: "var(--red)", grosor: 3 },
                    { id: "medida", pts: V.var_promedio.map((v, i): [number, number] => [i + 1, v]), sinLinea: true },
                  ]}
                  lineasH={[{ y: V.cov, texto: `piso = ρσ² = ${V.cov.toFixed(4)}`, color: "var(--red-2)", abajo: true }]}
                />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 26, paddingTop: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "26px 30px" }}>
                <Dato valor={V.sigma2.toFixed(3)} rotulo="varianza de un árbol (σ²)" />
                <Dato rojo valor={V.rho.toFixed(3)} rotulo="parecido entre dos árboles (ρ)" />
                <Dato valor={V.var_promedio[V.var_promedio.length - 1].toFixed(3)} rotulo={`varianza con ${varianzaEnsamble.B} árboles`} />
                <Dato valor={`${(V.accuracy[0] * 100).toFixed(1)} → ${pct(V.accuracy[V.accuracy.length - 1])}`} rotulo="aciertos: 1 árbol → 50" />
              </div>
              <p style={{ fontSize: 20, color: "var(--text-3)", margin: 0, lineHeight: 1.45 }}>
                ρ = covarianza media entre dos árboles ÷ varianza media de un árbol. Los árboles se parecen porque crecen de los mismos datos.
              </p>
              <Reveal step={step} at={3} style={{ marginTop: "auto" }}>
                <p className="takeaway" style={{ margin: 0, fontSize: 26 }}>
                  Promediar 50 árboles quita el <em>{pct(1 - V.var_promedio[V.var_promedio.length - 1] / V.sigma2, 0)}</em> de la varianza.
                  Lo que queda es el piso: para bajarlo hay que hacer que los árboles <em>se parezcan menos</em>.
                </p>
              </Reveal>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SlideFrame>
  );
}
