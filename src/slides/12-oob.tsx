import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Lineas } from "../components/Lineas";
import { Chips, Dato, Def, pct } from "../components/Piezas";
import { Reveal } from "../components/Reveal";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { adultMuestra, oobVsCv } from "../lib/adult";
import { bootstrap, multiplicidad } from "../lib/bagging";
import { mulberry32 } from "../lib/rng";

// ---------- Concepto: 8 personas × 6 árboles. ¿Qué árbol vio a quién? ----------
const NP = 8;
const NA = 6;
const ESQ = (() => {
  const r = mulberry32(4);
  const personas = Array.from({ length: NP }, (_, i) => i);
  // vio[a][p]: el árbol a tuvo a la persona p en su muestra bootstrap.
  const vio = Array.from({ length: NA }, () => multiplicidad(bootstrap(personas, r), NP).map((v) => v > 0));
  // Voto de cada árbol sobre cada persona (ilustrativo).
  const voto = Array.from({ length: NA }, () => personas.map(() => r() < 0.5));
  return { vio, voto };
})();
// Persona que se resalta: la primera con al menos 2 árboles que no la vieron.
const FILA = Array.from({ length: NP }, (_, p) => p).find((p) => ESQ.vio.filter((a) => !a[p]).length >= 2) ?? 0;

function MatrizOOB({ resaltar }: { resaltar: boolean }) {
  const cw = 104;
  const ch = 50;
  const x0 = 150;
  const y0 = 46;
  const jueces = ESQ.vio.map((a, i) => (!a[FILA] ? i : -1)).filter((i) => i >= 0);
  const si = jueces.filter((a) => ESQ.voto[a][FILA]).length;
  return (
    <svg width={x0 + NA * cw + 10} height={y0 + NP * ch + 70} style={{ display: "block" }}>
      {ESQ.vio.map((_, a) => (
        <text key={a} x={x0 + a * cw + cw / 2} y={28} textAnchor="middle" className="mono" fontSize={20} fill="var(--text-3)">
          árbol {a + 1}
        </text>
      ))}
      {Array.from({ length: NP }, (_, p) => {
        const fila = resaltar && p === FILA;
        return (
          <motion.g key={p} initial={false} animate={{ opacity: resaltar && !fila ? 0.3 : 1 }}>
            <text x={0} y={y0 + p * ch + 32} fontSize={20} fill={fila ? "var(--text)" : "var(--text-2)"}>
              persona {p + 1}
            </text>
            {ESQ.vio.map((arbol, a) => {
              const vio = arbol[p];
              const juez = fila && !vio;
              return (
                <g key={a}>
                  <rect
                    x={x0 + a * cw + 4}
                    y={y0 + p * ch + 4}
                    width={cw - 8}
                    height={ch - 8}
                    fill={vio ? "var(--panel)" : "var(--red-dim)"}
                    stroke={vio ? "var(--line-2)" : "var(--red)"}
                    strokeWidth={juez ? 2.5 : 1}
                  />
                  <text x={x0 + a * cw + cw / 2} y={y0 + p * ch + 31} textAnchor="middle" className="mono" fontSize={20} fill={vio ? "var(--text-3)" : "var(--red-2)"}>
                    {juez ? (ESQ.voto[a][p] ? "vota sí" : "vota no") : vio ? "la vio" : "no la vio"}
                  </text>
                </g>
              );
            })}
          </motion.g>
        );
      })}
      {resaltar && (
        <text x={0} y={y0 + NP * ch + 44} fontSize={22} fill="var(--text)">
          A la persona {FILA + 1} la califican solo los {jueces.length} árboles que no la vieron: {si} sí, {jueces.length - si} no.
        </text>
      )}
    </svg>
  );
}

// ---------- Caso: OOB contra validación cruzada en Adult completo ----------
const METODOS = [
  { valor: "bagging" as const, texto: "Bagging" },
  { valor: "random_forest" as const, texto: "Random Forest" },
];

export default function Oob({ step }: SlideProps) {
  const [metodo, setMetodo] = useState<"bagging" | "random_forest">("bagging");
  const d = oobVsCv[metodo];
  const B = oobVsCv.B;
  const ultimo = B.length - 1;
  const caso = step >= 2;

  return (
    <SlideFrame
      section={["U7 · Ensambles", "B. Bagging"]}
      num={12}
      caso={caso ? "Adult" : null}
      title="OOB: una validación que sale gratis"
      lede={
        caso
          ? `Aciertos estimados con OOB y con validación cruzada de 5 pliegues, sobre las ${adultMuestra.n.toLocaleString("es-MX")} personas, según el tamaño del bosque.`
          : "Cada árbol dejó fuera a más o menos un tercio de las personas. Para ese árbol, esas personas son datos que nunca vio."
      }
    >
      <AnimatePresence mode="wait">
        {!caso ? (
          <motion.div
            key="concepto"
            style={{ display: "grid", gridTemplateColumns: "800px 1fr", gap: 80 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <div>
              <span className="label">Esquema · 8 personas y 6 árboles, cada uno con su muestra bootstrap</span>
              <div style={{ marginTop: 14 }}>
                <MatrizOOB resaltar={step >= 1} />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 30, paddingTop: 40 }}>
              <Def termino="OOB (out-of-bag)">Las personas que no salieron en la muestra de un árbol: quedaron "fuera de la bolsa".</Def>
              <Reveal step={step} at={1}>
                <Def termino="Error OOB">
                  A cada persona la califican <b style={{ color: "var(--text)" }}>solo los árboles que no la vieron</b>. Se compara ese voto
                  con la respuesta real, persona por persona.
                </Def>
              </Reveal>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="caso"
            style={{ display: "grid", gridTemplateColumns: "920px 1fr", gap: 80 }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="label">
                  <span style={{ color: "var(--red-2)" }}>— OOB</span>&nbsp;&nbsp;&nbsp;— validación cruzada
                </span>
                <Chips opciones={METODOS} valor={metodo} onChange={setMetodo} />
              </div>
              <div style={{ marginTop: 14 }}>
                <Lineas
                  ancho={920}
                  alto={440}
                  x={[0, 300]}
                  y={[0.835, 0.862]}
                  ticksX={B}
                  ticksY={[0.84, 0.845, 0.85, 0.855, 0.86]}
                  fmtY={(v) => `${(v * 100).toFixed(1)}%`}
                  rotuloX="árboles en el bosque"
                  series={[
                    { id: "cv", pts: B.map((b, i): [number, number] => [b, d.cv_media[i]]), puntos: true },
                    { id: "oob", pts: B.map((b, i): [number, number] => [b, d.oob[i]]), color: "var(--red)", grosor: 3, puntos: true },
                  ]}
                />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 28, paddingTop: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30 }}>
                <Dato rojo valor={pct(d.oob[ultimo], 2)} rotulo={`OOB con ${B[ultimo]} árboles`} />
                <Dato valor={pct(d.cv_media[ultimo], 2)} rotulo="validación cruzada" />
                <Dato rojo valor={`${d.segundos_un_ajuste} s`} rotulo="lo que tardó el OOB" />
                <Dato valor={`${d.segundos_cv} s`} rotulo="lo que tardó la validación cruzada" />
              </div>
              {/* La advertencia y la conclusión van en clics distintos: una idea por clic. */}
              <Reveal step={step} at={3}>
              <p style={{ fontSize: 26, color: "var(--text-3)", margin: 0, lineHeight: 1.45 }}>
                Con pocos árboles el OOB sale más bajo: a cada persona la califican muy pocos árboles ({pct(d.oob[0])} contra{" "}
                {pct(d.cv_media[0])} con {B[0]}).
              </p>
              </Reveal>
              <Reveal step={step} at={4} style={{ marginTop: "auto" }}>
                <p className="takeaway" style={{ margin: 0, fontSize: 26 }}>
                  Con suficientes árboles, el OOB dice <em>lo mismo que la validación cruzada</em> sin apartar datos ni entrenar de nuevo.
                  Solo existe en bagging y Random Forest.
                </p>
              </Reveal>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SlideFrame>
  );
}
