import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { Lineas } from "../components/Lineas";
import { Chips, Dato, pct } from "../components/Piezas";
import { PuntosIntervalo, type FilaPuntos } from "../components/PuntosIntervalo";
import { Reveal } from "../components/Reveal";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { adultMuestra, comparacion, curvasArboles, matrices, rfHiper } from "../lib/adult";
import { desviacion, exactitud, f1Macro, media, recall } from "../lib/metricas";
import { linear } from "../lib/scale";

const N = adultMuestra.n.toLocaleString("es-MX");
const de = (modelo: string) => comparacion.find((c) => c.modelo === modelo)!;
const f1De = (modelo: string) => de(modelo).f1_macro;

// ---------- Vista 1: F1-macro de cada modelo, pliegue por pliegue ----------
// En qué clic aparece cada modelo.
const APARECE: Record<string, number> = {
  "Clase mayoritaria": 0,
  "Árbol de decisión": 1,
  Bagging: 2,
  "Random Forest": 3,
  AdaBoost: 4,
  "Gradient Boosting": 4,
  XGBoost: 4,
};
const PASO_AVISOS = 5;
const NOMBRE: Record<string, string> = { "Árbol de decisión": "Árbol sin límite" };
const P = matrices.arbolPodado;
const PODADO = { f1: P.pliegues.map(f1Macro), acc: P.pliegues.map(exactitud) };
const ALTO_FILA = 42;

// Con el piso (0.43) en la misma escala los ensambles se enciman: al llegar a bagging la escala se acerca.
const AMPLIO = { dominio: [0.4, 0.85] as [number, number], ticks: [0.4, 0.5, 0.6, 0.7, 0.8] };
const CERCA = { dominio: [0.73, 0.83] as [number, number], ticks: [0.74, 0.76, 0.78, 0.8, 0.82] };

// GB contra XGBoost con las mismas personas de examen: la diferencia en cada pliegue.
const DIF = f1De("XGBoost").pliegues.map((v, k) => v - f1De("Gradient Boosting").pliegues[k]);
const GANA_XGB = DIF.filter((d) => d > 0).length;

function Diferencias() {
  const ancho = 540;
  const tope = Math.max(...DIF.map(Math.abs)) * 1.25;
  const fx = linear([-tope, tope], [10, ancho - 10]);
  return (
    <svg width={ancho} height={56} style={{ display: "block" }}>
      <line x1={0} x2={ancho} y1={22} y2={22} stroke="var(--line-2)" />
      <line x1={fx(0)} x2={fx(0)} y1={6} y2={38} stroke="var(--text-3)" />
      <text x={fx(0)} y={54} textAnchor="middle" className="mono" fontSize={14} fill="var(--text-3)">
        0 · empate
      </text>
      <text x={ancho} y={54} textAnchor="end" className="mono" fontSize={14} fill="var(--text-3)">
        gana XGBoost →
      </text>
      <text x={0} y={54} className="mono" fontSize={14} fill="var(--text-3)">
        ← gana GB
      </text>
      {DIF.map((d, k) => (
        <circle key={k} cx={fx(d)} cy={22} r={7} fill={d > 0 ? "var(--red)" : "var(--data)"} stroke="var(--bg)" strokeWidth={2} />
      ))}
    </svg>
  );
}

function Aviso({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div style={{ borderTop: "2px solid var(--line-2)", paddingTop: 12 }}>
      <div className="label" style={{ color: "var(--red-2)", marginBottom: 8 }}>
        {titulo}
      </div>
      <div style={{ fontSize: 21, color: "var(--text-2)", lineHeight: 1.4 }}>{children}</div>
    </div>
  );
}

// ---------- Vista 2: error contra número de árboles ----------
const C = curvasArboles;
const N_MAX = C.arboles[C.arboles.length - 1];
const USADOS = C.usados_en_la_comparacion;
const I_USADOS = C.arboles.indexOf(USADOS);
const lx = (n: number) => Math.log10(n);
const TICKS_X = [1, 3, 10, 30, 100, 300, 1000].map((n) => ({ v: lx(n), texto: n.toLocaleString("es-MX") }));
const ENSAMBLES = Object.keys(C.modelos).map((m) => ({ valor: m, texto: m }));
const curva = (ys: number[]) => C.arboles.map((n, i): [number, number] => [lx(n), ys[i]]);

// Qué se ve en la curva de cada uno. Las cifras se leen de los datos.
type CurvaModelo = (typeof C.modelos)[string];
const alFinal = (v: number[]) => v[v.length - 1];
const MIL = N_MAX.toLocaleString("es-MX");
const LECTURA: Record<string, (c: CurvaModelo) => string> = {
  "Random Forest": (c) =>
    `Se estabiliza: con ${USADOS} árboles falla ${pct(c.validacion[I_USADOS], 2)} y con ${MIL}, ${pct(alFinal(c.validacion), 2)}. Agregar árboles no lo empeora. En entrenamiento falla solo ${pct(alFinal(c.entrenamiento))}: su curva queda debajo de la gráfica.`,
  AdaBoost: (c) =>
    `Sigue bajando hasta el final: ${pct(alFinal(c.validacion), 2)} con ${MIL} rondas. En la comparación lo detuvimos antes de tiempo. Entrenamiento y validación van pegados: un árbol de una pregunta no alcanza a memorizar.`,
  "Gradient Boosting": (c) =>
    `De ${USADOS} a ${MIL} árboles casi no se mueve (${pct(c.validacion[I_USADOS], 2)} y ${pct(alFinal(c.validacion), 2)}): menos que su ± entre pliegues. El entrenamiento sí sigue bajando; lo que aprende de más ya no sirve con personas nuevas.`,
  XGBoost: (c) =>
    `Su mínimo llega con ${c.mejor_n} árboles. Después la validación sube hasta ${pct(alFinal(c.validacion), 2)} mientras el entrenamiento baja a ${pct(alFinal(c.entrenamiento), 2)}: memoriza. Con ${USADOS} ya iba de subida.`,
};

export default function DemoSieteModelos({ step }: SlideProps) {
  const [ensamble, setEnsamble] = useState("Random Forest");
  const curvas = step >= 6;
  const escala = step >= 2 ? CERCA : AMPLIO;

  const filas: FilaPuntos[] = [
    ...comparacion.map((c) => ({
      nombre: NOMBRE[c.modelo] ?? c.modelo,
      valores: c.f1_macro.pliegues,
      tenue: c.modelo === "Clase mayoritaria" || c.modelo === "Árbol de decisión",
      visible: step >= APARECE[c.modelo],
    })),
    { nombre: `Árbol podado a ${P.profundidad} niveles`, valores: PODADO.f1, tenue: true, visible: step >= PASO_AVISOS },
  ];
  // Las columnas de la derecha siguen el mismo orden y la misma altura de renglón que la gráfica.
  const columnas = [
    ...comparacion.map((c) => ({ acc: c.accuracy.media, entrenamiento: c.accuracy_entrenamiento, visible: step >= APARECE[c.modelo] })),
    { acc: media(PODADO.acc), entrenamiento: P.accuracy_entrenamiento, visible: step >= PASO_AVISOS },
  ];

  const arbol = de("Árbol de decisión");
  const rf = de("Random Forest");
  const bag = de("Bagging");
  const gb = de("Gradient Boosting");
  const ada = de("AdaBoost");
  // Diferencia de F1-macro pliegue a pliegue: los dos modelos se examinan con las mismas personas.
  const dif = (a: typeof rf, b: typeof rf) => a.f1_macro.pliegues.map((v, k) => v - b.f1_macro.pliegues[k]);
  const gana = (d: number[]) => `${d.filter((x) => x > 0).length} de ${d.length}`;
  const rfBag = dif(rf, bag);
  const gbRf = dif(gb, rf);
  const comentario = [
    <>
      El piso: responder siempre "no". Acierta {pct(de("Clase mayoritaria").accuracy.media)} de las veces sin encontrar a nadie. Todo modelo que
      sirva de algo tiene que quedar a su derecha.
    </>,
    <>
      Un solo árbol sin límite: acierta {pct(arbol.accuracy_entrenamiento)} con las personas que estudió y {pct(arbol.accuracy.media)} con las que
      no. Memoriza.
    </>,
    <>
      <b style={{ color: "var(--text)" }}>La escala se acercó.</b> Bagging promedia {USADOS} de esos mismos árboles y da el salto grande: de{" "}
      {arbol.f1_macro.media.toFixed(3)} a {bag.f1_macro.media.toFixed(3)}.
    </>,
    <>
      Random Forest agrega el sorteo de variables y sube {media(rfBag).toFixed(3)} más. Gana en {gana(rfBag)} pliegues, pero por menos que su ± (
      {rf.f1_macro.desv.toFixed(3)}): aquí el sorteo ayuda poco.
    </>,
    <>
      AdaBoost, con árboles de una sola pregunta, queda {ada.f1_macro.media > rf.f1_macro.media ? "apenas arriba" : "a la altura"} de los bosques.
      Gradient Boosting y XGBoost quedan {media(gbRf).toFixed(3)} arriba de Random Forest, y Gradient Boosting le gana en {gana(gbRf)} pliegues.
    </>,
  ];
  const hoja1 = rfHiper.min_samples_leaf[0];
  const mejorHoja = rfHiper.min_samples_leaf.reduce((a, b) => (b.acc > a.acc ? b : a));
  const accPodado = media(PODADO.acc);

  const c = C.modelos[ensamble];

  return (
    <SlideFrame
      section={["U7 · Ensambles", "E. Cierre de la parte 1"]}
      num={27}
      caso="Adult"
      title="Los siete modelos, con el mismo examen"
      lede={
        curvas
          ? "Error (1 − accuracy) según cuántos árboles lleva el ensamble, promedio de los 5 pliegues."
          : `Las ${N} personas, los mismos 5 pliegues para todos y ningún hiperparámetro ajustado.`
      }
    >
      <AnimatePresence mode="wait">
        {!curvas ? (
          <motion.div key="puntos" exit={{ opacity: 0, transition: { duration: 0.2 } }}>
            <div style={{ display: "grid", gridTemplateColumns: "1250px 1fr", gap: 40 }}>
              <div>
                <div className="label" style={{ marginBottom: 10 }}>
                  F1-macro, a la derecha es mejor · círculo hueco = un pliegue · punto lleno = media · barra = ± desviación
                </div>
                <PuntosIntervalo ancho={1250} altoFila={ALTO_FILA} filas={filas} dominio={escala.dominio} ticks={escala.ticks} />
              </div>
              <div>
                <div className="label" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", textAlign: "right", marginBottom: 10, whiteSpace: "nowrap" }}>
                  <span>Accuracy</span>
                  <span>En entrenamiento</span>
                </div>
                {columnas.map((f, i) => (
                  <motion.div
                    key={i}
                    className="mono"
                    initial={false}
                    animate={{ opacity: f.visible ? 1 : 0 }}
                    style={{ display: "grid", gridTemplateColumns: "1fr 1fr", textAlign: "right", height: ALTO_FILA, alignItems: "center", fontSize: 19 }}
                  >
                    <span>{pct(f.acc)}</span>
                    {/* En rojo cuando acierta mucho más con lo que estudió que con lo que no: está memorizando. */}
                    <span style={{ color: f.entrenamiento - f.acc > 0.05 ? "var(--red-2)" : "var(--text-2)" }}>{pct(f.entrenamiento)}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 18, minHeight: 200 }}>
              <AnimatePresence mode="wait">
                {step < PASO_AVISOS ? (
                  <motion.p
                    key={step}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    style={{ fontSize: 27, color: "var(--text-2)", lineHeight: 1.4, margin: 0, maxWidth: 1400 }}
                  >
                    {comentario[step]}
                  </motion.p>
                ) : (
                  <motion.div key="avisos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr 1fr", gap: 50 }}>
                    <Aviso titulo="Sin ajustar">
                      Nadie buscó los mejores valores: cada modelo va casi como viene, con {USADOS} árboles. Con otros, el orden cambia: Random
                      Forest con hojas de al menos {mejorHoja.valor} personas pasa de {pct(hoja1.acc)} a {pct(mejorHoja.acc)}.
                    </Aviso>
                    <Aviso titulo="GB contra XGBoost, pliegue a pliegue">
                      <Diferencias />
                      XGBoost gana en {GANA_XGB} de {DIF.length} pliegues, por {media(DIF).toFixed(3)} en promedio (± {desviacion(DIF).toFixed(3)}).{" "}
                      {GANA_XGB === DIF.length
                        ? "Es una ventaja chica pero constante: comparando pliegue a pliegue se ve, aunque el ± de cada modelo se encime con el del otro."
                        : "No alcanza para decir cuál es mejor."}
                    </Aviso>
                    <Aviso titulo="Un solo árbol, bien podado">
                      Con {P.profundidad} preguntas en cadena (la mejor profundidad de la diapositiva 5) acierta {pct(accPodado)},{" "}
                      {accPodado > rf.accuracy.media ? "más que" : "casi como"} Random Forest ({pct(rf.accuracy.media)}). En F1-macro queda abajo:
                      encuentra a {pct(recall(P.todas), 0)} de quienes ganan más de 50K; Random Forest, a{" "}
                      {pct(recall(matrices.modelos.find((m) => m.modelo === "Random Forest")!.todas), 0)}.
                    </Aviso>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <motion.div key="curvas" style={{ display: "grid", gridTemplateColumns: "1000px 1fr", gap: 70 }} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <div>
              <Chips opciones={ENSAMBLES} valor={ensamble} onChange={setEnsamble} />
              <div style={{ marginTop: 12 }}>
                <Lineas
                  ancho={1000}
                  alto={450}
                  x={[0, lx(N_MAX)]}
                  y={[0.095, 0.18]}
                  ticksX={TICKS_X}
                  ticksY={[0.1, 0.12, 0.14, 0.16, 0.18]}
                  fmtY={(v) => `${(v * 100).toFixed(0)} %`}
                  rotuloX="árboles (escala logarítmica)"
                  recortar
                  series={[
                    ...ENSAMBLES.filter((e) => e.valor !== ensamble).map((e) => ({ id: e.valor, pts: curva(C.modelos[e.valor].validacion), color: "var(--red)", opacidad: 0.22, grosor: 2 })),
                    { id: "tr", pts: curva(c.entrenamiento) },
                    { id: "va", pts: curva(c.validacion), color: "var(--red)", grosor: 3.5 },
                  ]}
                  marcas={[{ x: lx(c.mejor_n), y: c.mejor_validacion, texto: `mínimo: ${c.mejor_n.toLocaleString("es-MX")} árboles`, abajo: true }]}
                  lineaV={lx(USADOS)}
                />
              </div>
              <div className="label" style={{ fontSize: 14 }}>
                <span style={{ color: "var(--red-2)" }}>— validación</span> · — entrenamiento · tenues = los otros tres · línea vertical = {USADOS} árboles
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 26, paddingTop: 50 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px 24px" }}>
                <Dato rojo valor={pct(c.validacion[I_USADOS], 2)} rotulo={`error de validación con ${USADOS} árboles`} />
                <Dato valor={pct(c.mejor_validacion, 2)} rotulo={`su mínimo, con ${c.mejor_n.toLocaleString("es-MX")}`} />
                <Dato valor={pct(alFinal(c.validacion), 2)} rotulo={`error de validación con ${MIL}`} />
                <Dato valor={pct(c.entrenamiento[I_USADOS], 2)} rotulo={`error de entrenamiento con ${USADOS}`} />
              </div>
              <p style={{ fontSize: 22, color: "var(--text-2)", margin: 0, lineHeight: 1.45 }}>{LECTURA[ensamble](c)}</p>
              <Reveal step={step} at={7} style={{ marginTop: "auto" }}>
                <p className="takeaway" style={{ margin: 0, fontSize: 25 }}>
                  Cuántos árboles <em>también se decide</em>: a un bosque le pueden sobrar sin daño; en boosting se busca con validación.
                </p>
              </Reveal>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SlideFrame>
  );
}
