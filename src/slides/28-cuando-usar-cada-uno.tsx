import { motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { Chips, pct } from "../components/Piezas";
import { Reveal } from "../components/Reveal";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { comparacion, curvasArboles, matrices, rfHiper, ruidoEtiquetas, xgbFaltantes } from "../lib/adult";
import { exactitud, f1Macro, media } from "../lib/metricas";
import { linear } from "../lib/scale";

const de = (modelo: string) => comparacion.find((c) => c.modelo === modelo)!;
const f1 = (modelo: string) => de(modelo).f1_macro.media.toFixed(3);
const P = matrices.arbolPodado;
const T = xgbFaltantes.tiempos;

const C_RF = curvasArboles.modelos["Random Forest"];
const USADOS = curvasArboles.usados_en_la_comparacion;

// Cuánto F1-macro pierde cada modelo cuando 1 de cada 5 etiquetas de entrenamiento está volteada.
const I_RUIDO = ruidoEtiquetas.fracciones.length - 1;
const FRACCION = ruidoEtiquetas.fracciones[I_RUIDO];
const caida = (modelo: string) => {
  const r = ruidoEtiquetas.modelos.find((m) => m.modelo === modelo)!;
  return media(r.f1_macro[0]) - media(r.f1_macro[I_RUIDO]);
};

// ---------- Dispersión: segundos de un ajuste (escala logarítmica) contra F1-macro ----------
type Punto = { nombre: string; f1: number; s: number; s1: number };
const PUNTOS: Punto[] = [
  ...comparacion
    .filter((c) => c.modelo !== "Clase mayoritaria")
    .map((c) => ({ nombre: c.modelo === "Árbol de decisión" ? "Árbol sin límite" : c.modelo, f1: c.f1_macro.media, s: c.segundos_ajuste, s1: c.segundos_ajuste_1_nucleo })),
  { nombre: "Árbol podado", f1: media(P.pliegues.map(f1Macro)), s: P.segundos_ajuste, s1: P.segundos_ajuste },
];
// Hacia dónde va el nombre de cada punto para que no se encimen. Al pasar a un núcleo, bagging y Random Forest
// se recorren a la derecha y quedan junto a AdaBoost: por eso esos tres cambian de lado según el caso.
type Lado = { dx: number; dy: number; ancla: "start" | "end" | "middle" };
const ARRIBA: Lado = { dx: 0, dy: -16, ancla: "middle" };
const ABAJO: Lado = { dx: 0, dy: 30, ancla: "middle" };
const DERECHA: Lado = { dx: 14, dy: 6, ancla: "start" };
const IZQUIERDA: Lado = { dx: -14, dy: 6, ancla: "end" };
const ETIQUETA: Record<string, [todos: Lado, uno: Lado]> = {
  "Árbol sin límite": [DERECHA, DERECHA],
  "Árbol podado": [DERECHA, DERECHA],
  Bagging: [ABAJO, DERECHA],
  "Random Forest": [IZQUIERDA, ABAJO],
  AdaBoost: [ARRIBA, IZQUIERDA],
  "Gradient Boosting": [ARRIBA, ARRIBA],
  XGBoost: [ARRIBA, ARRIBA],
};
const NUCLEOS = [
  { valor: "todos" as const, texto: `${T.nucleos} núcleos` },
  { valor: "uno" as const, texto: "1 núcleo" },
];
const TICKS_S = [0.1, 0.3, 1, 3, 10, 30];

function Dispersion({ unNucleo, resaltar }: { unNucleo: boolean; resaltar: string[] }) {
  const W = 680;
  const H = 440;
  const m = { l: 70, r: 30, t: 20, b: 52 };
  const fx = linear([Math.log10(0.05), Math.log10(45)], [m.l, W - m.r]);
  const fy = linear([0.735, 0.825], [H - m.b, m.t]);
  return (
    <svg width={W} height={H} style={{ display: "block", overflow: "visible" }}>
      {[0.74, 0.76, 0.78, 0.8, 0.82].map((v) => (
        <g key={v}>
          <line x1={m.l} x2={W - m.r} y1={fy(v)} y2={fy(v)} stroke="var(--line)" />
          <text x={m.l - 12} y={fy(v) + 5} textAnchor="end" className="mono" fontSize={15} fill="var(--text-3)">
            {v.toFixed(2)}
          </text>
        </g>
      ))}
      {TICKS_S.map((s) => (
        <g key={s}>
          <line x1={fx(Math.log10(s))} x2={fx(Math.log10(s))} y1={m.t} y2={H - m.b} stroke="var(--line)" />
          <text x={fx(Math.log10(s))} y={H - m.b + 26} textAnchor="middle" className="mono" fontSize={15} fill="var(--text-3)">
            {s} s
          </text>
        </g>
      ))}
      <text x={m.l} y={m.t - 6} className="mono" fontSize={14} fill="var(--text-3)">
        F1-macro
      </text>
      <text x={W - m.r} y={H - 2} textAnchor="end" className="mono" fontSize={14} fill="var(--text-3)">
        segundos de un ajuste (escala logarítmica)
      </text>
      {PUNTOS.map((p) => {
        const on = resaltar.includes(p.nombre);
        const e = ETIQUETA[p.nombre][unNucleo ? 1 : 0];
        return (
          <motion.g
            key={p.nombre}
            initial={false}
            animate={{ x: fx(Math.log10(unNucleo ? p.s1 : p.s)), y: fy(p.f1) }}
            transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <motion.circle r={9} initial={false} animate={{ fill: on ? "#e5383b" : "#55555d" }} />
            <motion.text key={e.ancla + e.dy} x={e.dx} y={e.dy} textAnchor={e.ancla} fontSize={19} initial={false} animate={{ fill: on ? "#ededee" : "#a3a3ab" }}>
              {p.nombre}
            </motion.text>
          </motion.g>
        );
      })}
    </svg>
  );
}

// ---------- La guía: situación → modelo → evidencia en Adult ----------
const HOJA_1 = rfHiper.min_samples_leaf[0];
const MEJOR_HOJA = rfHiper.min_samples_leaf.reduce((a, b) => (b.acc > a.acc ? b : a));
const ACC_PODADO = media(P.pliegues.map(exactitud));
const ACC_RF = de("Random Forest").accuracy.media;
const MIL = curvasArboles.arboles[curvasArboles.arboles.length - 1].toLocaleString("es-MX");

const GUIA: { si: string; usa: string; evidencia: ReactNode; puntos: string[] }[] = [
  {
    si: "Hay que explicar cada decisión",
    usa: "un árbol podado",
    evidencia: (
      <>
        {P.profundidad} preguntas en cadena: accuracy {pct(ACC_PODADO)}, {ACC_PODADO > ACC_RF ? "más que" : "contra"} el {pct(ACC_RF)} de Random Forest sin
        ajustar. A cambio, su F1-macro es {media(P.pliegues.map(f1Macro)).toFixed(3)} contra {f1("Random Forest")}.
      </>
    ),
    puntos: ["Árbol podado"],
  },
  {
    si: "Poco que vigilar al entrenar",
    usa: "Random Forest",
    evidencia: (
      <>
        Agregar árboles no lo empeora: falla {pct(C_RF.validacion[curvasArboles.arboles.indexOf(USADOS)], 2)} con {USADOS} y{" "}
        {pct(C_RF.validacion[C_RF.validacion.length - 1], 2)} con {MIL}. Y una sola perilla, hojas de al menos {MEJOR_HOJA.valor} personas, lo sube de{" "}
        {pct(HOJA_1.acc)} a {pct(MEJOR_HOJA.acc)}.
      </>
    ),
    puntos: ["Random Forest"],
  },
  {
    si: "El mejor desempeño en datos de tabla",
    usa: "Gradient Boosting o XGBoost",
    evidencia: (
      <>
        F1-macro {f1("Gradient Boosting")} y {f1("XGBoost")}, contra {f1("Random Forest")} de Random Forest, en los 5 pliegues. A cambio hay que buscarles
        cuántos árboles (XGBoost: {curvasArboles.modelos.XGBoost.mejor_n}).
      </>
    ),
    puntos: ["Gradient Boosting", "XGBoost"],
  },
  {
    si: "Muchos datos, huecos o poco tiempo",
    usa: "XGBoost",
    evidencia: (
      <>
        El mismo modelo (300 árboles de 6 niveles): {T.gradient_boosting_sklearn.toFixed(1)} s en sklearn, {T.xgboost_un_nucleo.toFixed(2)} s en XGBoost con 1
        núcleo. Acepta datos faltantes.
      </>
    ),
    puntos: ["XGBoost"],
  },
  {
    si: "Las etiquetas traen errores",
    usa: "árboles chicos, en bosque o en boosting",
    evidencia: (
      <>
        Con {pct(FRACCION, 0)} de etiquetas volteadas al azar pierden de F1-macro: Random Forest {caida("Random Forest").toFixed(3)} y XGBoost de{" "}
        {ruidoEtiquetas.profundidad_profundo} niveles {caida("XGBoost profundo").toFixed(3)}; XGBoost {caida("XGBoost").toFixed(3)} y Random Forest podado{" "}
        {Math.max(0, caida("Random Forest podado")).toFixed(3)}.
      </>
    ),
    puntos: ["AdaBoost", "Gradient Boosting", "XGBoost", "Árbol podado"],
  },
];

export default function CuandoUsarCadaUno({ step }: SlideProps) {
  const [nucleos, setNucleos] = useState<"todos" | "uno">("todos");
  const actual = Math.min(step, GUIA.length - 1);
  return (
    <SlideFrame
      section={["U7 · Ensambles", "E. Cierre de la parte 1"]}
      num={28}
      caso="Adult"
      title="Cuándo usar cada uno"
      lede="No hay un ganador para todo. Cada recomendación sale de algo que ya medimos en Adult."
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 680px", gap: 60 }}>
        <div>
          {GUIA.map((g, i) => (
            <Reveal key={g.si} step={step} at={i}>
              <motion.div
                initial={false}
                animate={{ opacity: i === actual || step >= GUIA.length ? 1 : 0.45 }}
                style={{ borderTop: "1px solid var(--line)", padding: "10px 0 11px" }}
              >
                <div style={{ display: "flex", alignItems: "baseline", gap: 16, whiteSpace: "nowrap" }}>
                  <span style={{ fontSize: 25 }}>{g.si}</span>
                  <span className="mono" style={{ color: "var(--red)", fontSize: 22 }}>
                    →
                  </span>
                  <span style={{ fontSize: 27, fontWeight: 600, letterSpacing: "-0.01em" }}>{g.usa}</span>
                </div>
                <div style={{ fontSize: 21, color: "var(--text-2)", lineHeight: 1.38, marginTop: 4 }}>{g.evidencia}</div>
              </motion.div>
            </Reveal>
          ))}
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span className="label">Arriba y a la izquierda es mejor</span>
            <Chips opciones={NUCLEOS} valor={nucleos} onChange={setNucleos} />
          </div>
          <Dispersion unNucleo={nucleos === "uno"} resaltar={step >= GUIA.length ? [] : GUIA[actual].puntos} />
          <div className="label" style={{ fontSize: 14, marginTop: 4 }}>
            un solo ajuste · cada modelo como en la comparación
          </div>
        </div>
      </div>
      <Reveal step={step} at={GUIA.length} style={{ marginTop: 14 }}>
        <p className="takeaway" style={{ margin: 0, fontSize: 27 }}>
          Todo esto supuso que las filas se pueden barajar. <em>¿Y si el orden importa?</em>
        </p>
      </Reveal>
    </SlideFrame>
  );
}
