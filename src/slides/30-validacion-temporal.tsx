import { motion } from "motion/react";
import type { ReactNode } from "react";
import { Def } from "../components/Piezas";
import { Recap } from "../components/Recap";
import { Reveal } from "../components/Reveal";
import { SeriesChart } from "../components/SeriesChart";
import { SplitDiagram, type FilaParticion } from "../components/SplitDiagram";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { ANIOS, ANIO_INICIAL, pasajeros, validacionTemporal } from "../lib/pasajeros";
import { mulberry32 } from "../lib/rng";
import { kfoldBarajado, mae, particionTemporal } from "../lib/series";

const rango = (a: number, b: number) => Array.from({ length: Math.max(0, b - a + 1) }, (_, i) => a + i);

/** Filas de un K-Fold a partir del pliegue de cada posición: en la ronda r se prueba con el pliegue r. */
const filasKFold = (pliegue: number[], k: number): FilaParticion[] =>
  Array.from({ length: k }, (_, r) => ({
    etiqueta: `ronda ${r + 1}`,
    prueba: pliegue.flatMap((p, i) => (p === r ? [i] : [])),
    entrenamiento: pliegue.flatMap((p, i) => (p === r ? [] : [i])),
  }));

const filasCreciente = (n: number, k: number): FilaParticion[] =>
  particionTemporal(n, k).map((c, r) => ({ etiqueta: `ronda ${r + 1}`, entrenamiento: rango(0, c.entrenamiento - 1), prueba: rango(c.pruebaDesde, c.pruebaHasta) }));

// ---------- Concepto: 20 momentos de esquema ----------
const N = 20;
const K = 5;
const PLIEGUE_ESQUEMA = kfoldBarajado(N, K, mulberry32(30));
const BARAJADO = filasKFold(PLIEGUE_ESQUEMA, K);
const CRECIENTE = filasCreciente(N, K);
// Origen móvil: se entrena con todo lo anterior y se prueba solo el momento que sigue.
const MOVIL: FilaParticion[] = Array.from({ length: K }, (_, r) => ({ etiqueta: `ronda ${r + 1}`, entrenamiento: rango(0, N - K - 1 + r), prueba: [N - K + r] }));

// La fuga más clara: la primera celda de prueba de la ronda 1 cuyo vecino de la derecha se usó para entrenar.
const R1 = BARAJADO[0];
const FUGA = R1.prueba.find((i) => R1.entrenamiento.includes(i + 1))!;
// Momentos que, cuando les toca ser prueba, tienen al siguiente en el entrenamiento de esa ronda.
const VECINO_FUTURO = PLIEGUE_ESQUEMA.slice(0, -1).filter((p, i) => p !== PLIEGUE_ESQUEMA[i + 1]).length;

// ---------- Caso: pasajeros ----------
const Y = pasajeros.valores;
const V = validacionTemporal;
const N_MESES = Y.length;
const KFOLD_REAL = filasKFold(V.pliegue, K);
const CRECIENTE_REAL = filasCreciente(N_MESES, K);
const CORTES = particionTemporal(N_MESES, K);
const MARCAS_ANIO = ANIOS.map((a, i) => ({ i: i * 12, texto: String(a) }));
// Meses que, cuando les toca ser prueba, tienen al mes siguiente en el entrenamiento de esa ronda.
const CON_FUGA = V.pliegue.slice(0, -1).filter((p, i) => p !== V.pliegue[i + 1]).length;

const CORTE = V.corte;
const REAL = Y.slice(CORTE);
const ANIO_CORTE = ANIO_INICIAL + CORTE / 12;
const PRUEBA = `${ANIO_CORTE}–${ANIOS[ANIOS.length - 1]}`;
const TECHO = Math.max(...Y.slice(0, CORTE));
const BOSQUE = V.modelos[0];
const MEDIDAS = V.modelos.map((m) => ({
  ...m,
  barajado: mae(REAL, m.pred_barajado.slice(CORTE)),
  pronosticando: mae(REAL, m.pronostico),
  min: Math.min(...m.mae_barajados),
  max: Math.max(...m.mae_barajados),
}));
// En el bosque todo corte por "número de mes" queda antes del corte: después, la predicción solo depende del mes del año.
const REPITE = BOSQUE.pronostico.slice(0, 12).every((v, i) => v === BOSQUE.pronostico[i + 12]);
const MAX_PRONOSTICO = Math.max(...BOSQUE.pronostico);
const VENTANA: [number, number] = [CORTE - 24, N_MESES - 1];

const TEXTO_ESQUEMA = [
  "Así validamos en la parte 1: cada dato sirve una vez de prueba.",
  null,
  "Ventana creciente: se entrena con todo lo anterior y se prueba con el bloque que sigue. Lo de después todavía no existe.",
  "Origen móvil (walk-forward): la ventana avanza un paso y se prueba solo el momento siguiente. Es lo más parecido a pronosticar de verdad.",
];

function Leyenda({ color, guion, children }: { color: string; guion?: boolean; children: ReactNode }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: 19, color: "var(--text-2)" }}>
      <svg width={34} height={6}>
        <line x1={0} x2={34} y1={3} y2={3} stroke={color} strokeWidth={3} strokeDasharray={guion ? "6 5" : undefined} />
      </svg>
      {children}
    </span>
  );
}

export default function ValidacionTemporal({ step }: SlideProps) {
  const filas = step <= 1 ? BARAJADO : step === 2 ? CRECIENTE : MOVIL;
  const celda = { padding: "9px 14px", borderBottom: "1px solid var(--line)", fontSize: 21, verticalAlign: "top" } as const;
  return (
    <SlideFrame
      section={["U8 · Datos secuenciales", "Puente"]}
      num={30}
      caso={step >= 4 ? "Pasajeros aéreos" : null}
      title="Validación temporal"
      lede="Si el orden importa, la prueba tiene que ir después del entrenamiento: igual que cuando se pronostica de verdad."
    >
      {step <= 3 && (
        <motion.div key="concepto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "grid", gridTemplateColumns: "520px 1fr", gap: 70 }}>
          <div>
            <Recap title="validación cruzada">
              <p>Partir los datos en K bloques, entrenar con K − 1 y probar con el que queda. Repetir K veces y promediar (diapositiva 3).</p>
            </Recap>
            <Reveal step={step} at={1} style={{ marginTop: 30 }}>
              <Def termino="Fuga de datos">Información que no existiría al momento de predecir y que se cuela al entrenamiento.</Def>
            </Reveal>
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span className="label">Esquema · {N} momentos en orden</span>
              <span className="label" style={{ color: "var(--text-2)" }}>
                {step <= 1 ? `K-Fold barajado (K = ${K})` : step === 2 ? "ventana creciente" : "origen móvil"}
              </span>
            </div>
            <SplitDiagram n={N} filas={filas} ancho={1100} altoCelda={44} fuga={step === 1} flecha={step === 1 ? { fila: 0, desde: FUGA + 1, hacia: FUGA } : undefined} />
            <div style={{ display: "flex", gap: 28, marginTop: 4, fontSize: 18, color: "var(--text-3)" }} className="mono">
              <span style={{ color: "var(--red-2)" }}>■ prueba</span>
              <span>■ entrenamiento</span>
              {step === 1 && <span style={{ color: "var(--red-2)" }}>▨ futuro usado para entrenar</span>}
              {step >= 2 && <span>┄ todavía no existe</span>}
            </div>
            <div style={{ fontSize: 24, lineHeight: 1.42, marginTop: 16, minHeight: 104 }}>
              {step === 1 ? (
                <>
                  Para predecir el momento {FUGA + 1}, el modelo ya vio el {FUGA + 2}. Y no es un caso raro: {VECINO_FUTURO} de {N - 1} momentos tienen al
                  siguiente en el entrenamiento de su ronda. <span style={{ color: "var(--red-2)" }}>Barajar es entrenar con el futuro:</span> el error medido
                  sale mejor de lo que será al pronosticar.
                </>
              ) : (
                TEXTO_ESQUEMA[step]
              )}
            </div>
          </div>
        </motion.div>
      )}

      {step === 4 && (
        <motion.div key="particiones" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontSize: 23 }}>K-Fold barajado, {K} rondas</span>
            <span className="label">los {N_MESES} meses de pasajeros · rojo = prueba</span>
          </div>
          <SplitDiagram n={N_MESES} filas={KFOLD_REAL} ancho={1696} altoCelda={28} separacion={6} anchoEtiqueta={110} hueco={1} marcas={MARCAS_ANIO} />
          <div style={{ fontSize: 23, marginTop: 14 }}>
            Ventana creciente, {K} rondas: entrena con {CORTES.map((c) => c.entrenamiento).join(", ")} meses y prueba los {CORTES[0].pruebaHasta - CORTES[0].pruebaDesde + 1}{" "}
            siguientes
          </div>
          <SplitDiagram n={N_MESES} filas={CRECIENTE_REAL} ancho={1696} altoCelda={28} separacion={6} anchoEtiqueta={110} hueco={1} marcas={MARCAS_ANIO} />
          <p style={{ fontSize: 25, margin: "12px 0 0", lineHeight: 1.4 }}>
            Barajados, <span style={{ color: "var(--red-2)" }}>{CON_FUGA} de {N_MESES - 1} meses</span> tienen al mes siguiente en el entrenamiento de su ronda. Con la
            ventana creciente, ninguno.
          </p>
        </motion.div>
      )}

      {step >= 5 && (
        <motion.div key="resultado" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "980px 1fr", gap: 50 }}>
            <div>
              <div style={{ display: "flex", gap: 30, marginBottom: 4 }}>
                <Leyenda color="var(--text)">lo que pasó</Leyenda>
                <Leyenda color="var(--data)" guion>
                  predicho con K-Fold barajado
                </Leyenda>
                <Leyenda color="var(--red)">pronosticado desde {ANIO_CORTE - 1}</Leyenda>
              </div>
              <SeriesChart
                ancho={980}
                alto={370}
                ventana={VENTANA}
                recortar
                pasoY={100}
                rotuloY="miles de pasajeros"
                series={[
                  { id: "real", valores: Y, color: "var(--text)", grosor: 2.5 },
                  { id: "barajado", valores: BOSQUE.pred_barajado.slice(CORTE), desde: CORTE, color: "var(--data)", guion: "6 5", grosor: 2 },
                  { id: "pronostico", valores: BOSQUE.pronostico, desde: CORTE, color: "var(--red)", grosor: 3 },
                ]}
                bandas={[{ desde: CORTE - 0.5, hasta: N_MESES - 1, texto: `prueba · ${PRUEBA}` }]}
                lineasH={step >= 6 ? [{ y: TECHO, texto: `máximo de entrenamiento: ${TECHO}`, color: "var(--red-2)" }] : []}
              />
            </div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
              <span className="label">solo para esta demostración se pronostican dos años</span>
              <p style={{ fontSize: 21, color: "var(--text-2)", margin: "10px 0 12px", lineHeight: 1.4 }}>
                <b style={{ color: "var(--text)" }}>MAE:</b> en promedio, por cuántos miles de pasajeros se equivoca cada mes. El mismo modelo, los mismos{" "}
                {REAL.length} meses.
              </p>
              <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                  <tr className="mono" style={{ fontSize: 15, color: "var(--text-3)", textAlign: "left" }}>
                    <th style={celda}>modelo</th>
                    <th style={{ ...celda, textAlign: "right" }}>barajado</th>
                    <th style={{ ...celda, textAlign: "right" }}>pronosticando</th>
                  </tr>
                </thead>
                <tbody>
                  {MEDIDAS.map((m) => (
                    <tr key={m.id}>
                      <td style={celda}>
                        {m.nombre}
                        <div style={{ fontSize: 16, color: "var(--text-3)", lineHeight: 1.3 }}>{m.descripcion}</div>
                      </td>
                      <td className="mono" style={{ ...celda, textAlign: "right", fontSize: 30, whiteSpace: "nowrap" }}>
                        {m.barajado.toFixed(1)}
                        <div style={{ fontSize: 15, color: "var(--text-3)" }}>
                          {m.min.toFixed(1)} a {m.max.toFixed(1)} en {m.mae_barajados.length} barajados
                        </div>
                      </td>
                      <td className="mono" style={{ ...celda, textAlign: "right", fontSize: 30, color: "var(--red-2)", verticalAlign: "top" }}>
                        {m.pronosticando.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Reveal step={step} at={6} style={{ fontSize: 20, color: "var(--text-2)", lineHeight: 1.4, marginTop: 12 }}>
                Un bosque promedia valores que ya vio: lo más que pronostica es {MAX_PRONOSTICO.toFixed(0)}, y {PRUEBA.slice(-4)} llegó a {Math.max(...REAL)}.
                {REPITE && ` Su pronóstico de ${ANIO_CORTE + 1} es idéntico al de ${ANIO_CORTE}.`}
              </Reveal>
            </motion.div>
          </div>
          <Reveal step={step} at={6} style={{ marginTop: 14 }}>
            <p className="takeaway" style={{ margin: 0, fontSize: 25 }}>
              Barajado, el modelo solo rellena huecos entre meses que ya vio; pronosticar es ir más allá. <em>La prueba siempre va después.</em> Describir la serie no
              es evaluar un modelo: desde la 41, {ANIOS[ANIOS.length - 1]} se guarda como prueba y todo se decide con {ANIOS[0]}–{ANIOS[ANIOS.length - 2]}.
            </p>
          </Reveal>
        </motion.div>
      )}
    </SlideFrame>
  );
}
