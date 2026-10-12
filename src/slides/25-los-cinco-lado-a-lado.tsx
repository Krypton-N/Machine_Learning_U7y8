import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { ArbolGlifo } from "../components/FlujoEnsamble";
import { pct } from "../components/Piezas";
import { Reveal } from "../components/Reveal";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { adultMuestra, comparacion, ruidoEtiquetas, xgbFaltantes } from "../lib/adult";
import { media } from "../lib/metricas";

const MODELOS = ["Bagging", "Random Forest", "AdaBoost", "Gradient Boosting", "XGBoost"];
const REJILLA = { display: "grid", gridTemplateColumns: "270px repeat(5, 1fr)" } as const;

// Tres árboles: sueltos (cada uno por su cuenta) o encadenados (cada uno corrige al anterior).
function Miniatura({ secuencia = false }: { secuencia?: boolean }) {
  return (
    <svg width={156} height={44} style={{ display: "block" }}>
      {[24, 78, 132].map((x, i) => (
        <g key={x}>
          <ArbolGlifo x={x} y={secuencia ? 12 : 4} niveles={secuencia ? 1 : 2} ancho={secuencia ? 40 : 56} />
          {secuencia && i < 2 && <path d={`M${x + 18},22 H${x + 34} m-6,-5 l6,5 l-6,5`} fill="none" stroke="var(--red)" strokeWidth={1.6} />}
        </g>
      ))}
    </svg>
  );
}

// ---------- Concepto: en qué se parecen y en qué no ----------
// Una celda abarca varias columnas cuando esos modelos coinciden.
type Celda = [texto: ReactNode, columnas?: number];
const RENGLONES: { titulo: string; celdas: Celda[] }[] = [
  {
    titulo: "Cada árbol es",
    celdas: [["profundo, sin límite: por sí solo memoriza", 2], ["un stump: una sola pregunta"], ["chico: 3 preguntas en cadena"], ["mediano: 6 niveles, y cada hoja paga un cobro"]],
  },
  {
    titulo: "Qué problema ataca",
    celdas: [["la varianza: promedia árboles inestables", 2], ["el sesgo: cada árbol corrige lo que le faltó al anterior", 3]],
  },
  {
    titulo: "Cómo se combinan",
    celdas: [["voto o promedio: todos los árboles valen igual", 2], ["voto con peso α: vale más el que menos falla"], ["suma: cada árbol entra encogido por ν", 2]],
  },
  {
    titulo: "Por qué salen distintos",
    celdas: [["cada uno ve otra muestra bootstrap"], ["bootstrap más sorteo de variables"], ["cambia el peso de cada persona"], ["cada uno aprende lo que falta (el gradiente)", 2]],
  },
  {
    titulo: "¿Más árboles sobreajusta?",
    celdas: [["no: el error se estabiliza", 2], ["puede, pero con stumps tarda mucho"], ["sí: hay que parar a tiempo", 2]],
  },
  {
    titulo: "Etiquetas equivocadas",
    celdas: [["cada árbol las memoriza; el voto solo las diluye", 2], ["les sube el peso ronda tras ronda"], ["las persigue como a cualquier otro error", 2]],
  },
  {
    titulo: "Qué se ajusta",
    celdas: [["cuántos árboles"], ["variables sorteadas y tamaño de hoja"], ["cuántas rondas"], ["ν, cuántos árboles y su profundidad"], ["lo mismo, más los cobros λ y γ"]],
  },
];

// ---------- Caso: lo medido en Adult, en las mismas cinco columnas ----------
const de = (modelo: string) => comparacion.find((c) => c.modelo === modelo)!;
const seg = (s: number) => `${s.toFixed(s < 1 ? 2 : 1)} s`;
const I_RUIDO = ruidoEtiquetas.fracciones.length - 1;
const FRACCION = ruidoEtiquetas.fracciones[I_RUIDO];
const caida = (modelo: string) => {
  const r = ruidoEtiquetas.modelos.find((m) => m.modelo === modelo)!;
  return media(r.f1_macro[0]) - media(r.f1_macro[I_RUIDO]);
};
const rango = (ms: string[]) => {
  const v = ms.map(caida);
  return `${Math.min(...v).toFixed(3)} a ${Math.max(...v).toFixed(3)}`;
};

// Cada renglón medido: el número, una barra proporcional a él y cuál de los cinco sale mejor.
type Medida = { titulo: string; nota: string; valor: (m: string) => number; texto: (m: string) => ReactNode; abajo?: (m: string) => string; mejorEsMayor: boolean };
const MEDIDO: Medida[] = [
  {
    titulo: "F1-macro",
    nota: "media ± desviación de los 5 pliegues",
    valor: (m) => de(m).f1_macro.media,
    texto: (m) => (
      <>
        {de(m).f1_macro.media.toFixed(3)} <span style={{ color: "var(--text-3)", fontSize: 20 }}>± {de(m).f1_macro.desv.toFixed(3)}</span>
      </>
    ),
    mejorEsMayor: true,
  },
  {
    titulo: "Un ajuste tarda",
    nota: `las ${adultMuestra.n.toLocaleString("es-MX")} personas, ${xgbFaltantes.tiempos.nucleos} núcleos`,
    valor: (m) => de(m).segundos_ajuste,
    texto: (m) => seg(de(m).segundos_ajuste),
    // Bagging, Random Forest y XGBoost reparten el trabajo entre núcleos; AdaBoost y Gradient Boosting de sklearn no.
    abajo: (m) => (de(m).segundos_ajuste_1_nucleo !== de(m).segundos_ajuste ? `${seg(de(m).segundos_ajuste_1_nucleo)} con 1 núcleo` : "solo usa 1 núcleo"),
    mejorEsMayor: false,
  },
  {
    titulo: "Etiquetas equivocadas",
    nota: `F1-macro que pierde con ${pct(FRACCION, 0)} volteadas al azar`,
    valor: caida,
    texto: (m) => <>−{caida(m).toFixed(3)}</>,
    mejorEsMayor: false,
  },
];

const celda = { fontSize: 22, lineHeight: 1.25, padding: "10px 22px 11px 0", borderTop: "1px solid var(--line)", color: "var(--text)" } as const;
const titulo = { ...celda, color: "var(--text-3)", fontSize: 21 } as const;

function RenglonMedido({ r }: { r: Medida }) {
  const valores = MODELOS.map(r.valor);
  const tope = Math.max(...valores);
  const mejor = r.mejorEsMayor ? tope : Math.min(...valores);
  // El F1-macro se mueve en un rango angosto: su barra arranca en 0.75 y así se dice. Las otras arrancan en 0.
  const base = r.mejorEsMayor ? 0.75 : 0;
  return (
    <div style={REJILLA}>
      <div style={{ borderTop: "1px solid var(--line)", padding: "18px 22px 18px 0" }}>
        <div style={{ fontSize: 24, color: "var(--red-2)" }}>{r.titulo}</div>
        <div style={{ fontSize: 17, color: "var(--text-3)", lineHeight: 1.3, marginTop: 4 }}>{r.nota}</div>
      </div>
      {MODELOS.map((m, i) => (
        <div key={m} style={{ borderTop: "1px solid var(--line)", padding: "18px 26px 18px 0", minWidth: 0 }}>
          <div className="mono" style={{ fontSize: 28, whiteSpace: "nowrap", color: valores[i] === mejor ? "var(--red-2)" : "var(--text)" }}>
            {r.texto(m)}
          </div>
          <div style={{ height: 8, background: "var(--line)", marginTop: 12 }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(0.6, ((valores[i] - base) / (tope - base)) * 100)}%` }}
              transition={{ duration: 0.7, delay: 0.1 + i * 0.05 }}
              style={{ height: 8, background: valores[i] === mejor ? "var(--red)" : "var(--data-dim)" }}
            />
          </div>
          {r.abajo && (
            <div className="mono" style={{ fontSize: 17, color: "var(--text-3)", marginTop: 8 }}>
              {r.abajo(m)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function LosCincoLadoALado({ step }: SlideProps) {
  const caso = step >= RENGLONES.length;
  return (
    <SlideFrame section={["U7 · Ensambles", "E. Cierre de la parte 1"]} num={25} caso={caso ? "Adult" : null} title="Los cinco ensambles, lado a lado">
      <div style={{ marginTop: -14 }}>
        <div style={REJILLA}>
          <span />
          <div style={{ gridColumn: "span 2", display: "flex", alignItems: "center", gap: 18, paddingBottom: 6 }}>
            <Miniatura />
            <span className="label">En paralelo</span>
          </div>
          <div style={{ gridColumn: "span 3", display: "flex", alignItems: "center", gap: 18, paddingBottom: 6 }}>
            <Miniatura secuencia />
            <span className="label">En secuencia</span>
          </div>
          <span />
          {MODELOS.map((m) => (
            <div key={m} style={{ fontSize: 27, fontWeight: 600, letterSpacing: "-0.015em", padding: "6px 0 10px", borderTop: "2px solid var(--line-2)" }}>
              {m}
            </div>
          ))}
        </div>
        <AnimatePresence mode="wait">
          {!caso ? (
            <motion.div key="concepto" exit={{ opacity: 0, transition: { duration: 0.2 } }}>
              {RENGLONES.map((r, i) => (
                <Reveal key={r.titulo} step={step} at={i} style={REJILLA} y={8}>
                  <div style={titulo}>{r.titulo}</div>
                  {r.celdas.map(([texto, columnas = 1], k) => (
                    <div key={k} style={{ ...celda, gridColumn: `span ${columnas}`, textAlign: columnas > 1 ? "center" : "left" }}>
                      {texto}
                    </div>
                  ))}
                </Reveal>
              ))}
            </motion.div>
          ) : (
            <motion.div key="medido" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
              {MEDIDO.map((r) => (
                <RenglonMedido key={r.titulo} r={r} />
              ))}
              <div className="label" style={{ fontSize: 14, marginTop: 10 }}>
                barras: la de F1-macro arranca en 0.75; las otras dos, en 0 · rojo = el mejor de los cinco en ese renglón
              </div>
              <p style={{ fontSize: 25, color: "var(--text-2)", lineHeight: 1.42, margin: "24px 0 0", maxWidth: 1640 }}>
                Con {pct(FRACCION, 0)} de las etiquetas de entrenamiento volteadas al azar, los bosques pierden de {rango(["Bagging", "Random Forest"])} de
                F1-macro y los de boosting, de {rango(["AdaBoost", "Gradient Boosting", "XGBoost"])}.{" "}
                <b style={{ color: "var(--text)" }}>No es por la forma de combinar, es por el tamaño del árbol:</b> un Random Forest con árboles podados a{" "}
                {ruidoEtiquetas.profundidad_podado} niveles pierde {Math.max(0, caida("Random Forest podado")).toFixed(3)}, y un XGBoost con árboles de{" "}
                {ruidoEtiquetas.profundidad_profundo} niveles pierde {caida("XGBoost profundo").toFixed(3)}.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SlideFrame>
  );
}
