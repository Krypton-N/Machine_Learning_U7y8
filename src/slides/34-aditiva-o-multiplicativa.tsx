import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Barras } from "../components/Barras";
import { Chips } from "../components/Piezas";
import { Recap } from "../components/Recap";
import { Reveal } from "../components/Reveal";
import { SeriesChart, pasoRedondo } from "../components/SeriesChart";
import { TeX } from "../components/TeX";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { ANIOS, etiqueta, pasajeros } from "../lib/pasajeros";
import { ejeQueCubre } from "../lib/scale";
import { descomponer, pearson } from "../lib/series";

// ---------- Concepto: la misma tendencia con una onda que suma y con una que multiplica (esquema) ----------
const N_ESQ = 61;
const T_ESQ = Array.from({ length: N_ESQ }, (_, t) => 8 + 0.4 * t);
const ONDA = T_ESQ.map((_, t) => Math.sin((2 * Math.PI * t) / 12));
const SUMA = 5;
const FACTOR = 0.3;
const ESQUEMAS = [
  { titulo: "Aditiva", tex: "y_t = T_t + S_t", frase: "La onda mide siempre lo mismo.", y: T_ESQ.map((v, t) => v + SUMA * ONDA[t]), arriba: T_ESQ.map((v) => v + SUMA), abajo: T_ESQ.map((v) => v - SUMA) },
  {
    titulo: "Multiplicativa",
    tex: "y_t = T_t \\times S_t",
    frase: "La onda crece en proporción al nivel: forma un embudo.",
    y: T_ESQ.map((v, t) => v * (1 + FACTOR * ONDA[t])),
    arriba: T_ESQ.map((v) => v * (1 + FACTOR)),
    abajo: T_ESQ.map((v) => v * (1 - FACTOR)),
  },
];

// ---------- Caso ----------
const Y = pasajeros.valores;
const M = pasajeros.matriz;
const U = ANIOS.length - 1;
const EJE = ejeQueCubre(Y, 100);
// Marcas del eje en logaritmo: cada una es el doble de la anterior, más el tope, y todas dentro de los datos.
const MARCAS_LOG = [100, 200, 400, EJE.dominio[1]];

/** Une con rectas el máximo (o el mínimo) de cada año; fuera del primero y del último no hay envolvente. */
function envolvente(elegir: (fila: number[]) => number): number[] {
  const puntos = M.map((fila, a) => ({ i: a * 12 + fila.indexOf(elegir(fila)), v: elegir(fila) }));
  return Y.map((_, i) => {
    const k = puntos.findIndex((p) => p.i >= i);
    if (k < 0 || (k === 0 && puntos[0].i > i)) return NaN;
    if (puntos[k].i === i) return puntos[k].v;
    const a = puntos[k - 1];
    const b = puntos[k];
    return a.v + ((b.v - a.v) * (i - a.i)) / (b.i - a.i);
  });
}
const TECHO = envolvente((f) => Math.max(...f));
const PISO = envolvente((f) => Math.min(...f));
const ANCHO = M.map((f) => Math.max(...f) - Math.min(...f));
const ANCHO_LOG = M.map((f) => Math.log(Math.max(...f) / Math.min(...f)));
const NIVEL = M.map((f) => f.reduce((s, v) => s + v, 0) / f.length);

const D = { aditiva: descomponer(Y, 12, "aditiva"), multiplicativa: descomponer(Y, 12, "multiplicativa") };
type Modo = keyof typeof D;
const ajuste = (modo: Modo, i: number) => (modo === "aditiva" ? D[modo].tendencia[i] + D[modo].estacional[i] : D[modo].tendencia[i] * D[modo].estacional[i]);
const CON_TENDENCIA = Y.map((_, i) => i).filter((i) => !Number.isNaN(D.aditiva.tendencia[i]));
const errorMedio = (modo: Modo) => CON_TENDENCIA.reduce((s, i) => s + Math.abs(Y[i] - ajuste(modo, i)), 0) / CON_TENDENCIA.length;
const JULIO = 6;
const FICHAS = [JULIO, (U - 1) * 12 + JULIO]; // julio del primer año y del penúltimo (el último ya no tiene tendencia en julio)
// ¿Quedó la onda en lo que sobra? Se mide en el primer y el último año completos con tendencia.
const parecido = (modo: Modo, a: number) => {
  const idx = Array.from({ length: 12 }, (_, m) => a * 12 + m);
  return pearson(idx.map((i) => D[modo].residuo[i]), idx.map((i) => D[modo].estacional[i]));
};
const ONDA_SOBRANTE = { inicio: parecido("aditiva", 1), fin: parecido("aditiva", U - 1) };

const MODOS: { valor: Modo; texto: string }[] = [
  { valor: "aditiva", texto: "aditiva" },
  { valor: "multiplicativa", texto: "multiplicativa" },
];
const ESCALAS = [
  { valor: "lineal" as const, texto: "lineal" },
  { valor: "log" as const, texto: "log" },
];

function Panel({ titulo, valores, ultimo, rojo }: { titulo: string; valores: number[]; ultimo?: boolean; rojo?: boolean }) {
  const datos = valores.filter((v) => !Number.isNaN(v));
  const eje = ejeQueCubre(datos, pasoRedondo(Math.max(...datos) - Math.min(...datos) || 1, 6));
  const decimales = eje.dominio[1] - eje.dominio[0] < 5 ? 1 : 0;
  return (
    <div>
      <div className="mono" style={{ fontSize: 20, color: "var(--text-2)", marginLeft: 64 }}>
        {titulo}
      </div>
      <SeriesChart
        ancho={1080}
        alto={ultimo ? 136 : 104}
        series={[{ id: titulo, valores, color: rojo ? "var(--red)" : "var(--data)", grosor: 2 }]}
        y={eje.dominio}
        ticksY={[eje.dominio[0], eje.dominio[1]]}
        fmtY={(v) => v.toFixed(decimales)}
        sinMarcasX={!ultimo}
        margen={{ l: 64, r: 10, t: 6, b: ultimo ? 32 : 6 }}
        transicion={0.7}
      />
    </div>
  );
}

export default function AditivaOMultiplicativa({ step }: SlideProps) {
  const [escala, setEscala] = useState<"lineal" | "log">("lineal");
  const [modo, setModo] = useState<Modo>("aditiva");
  useEffect(() => {
    setEscala(step === 2 ? "log" : "lineal");
    setModo(step >= 4 ? "multiplicativa" : "aditiva");
  }, [step]);
  const log = escala === "log" && step === 2;
  const d = D[modo];
  const celda = { padding: "7px 12px", borderBottom: "1px solid var(--line)", fontSize: 26 } as const;

  return (
    <SlideFrame
      section={["U8 · Datos secuenciales", "F. Fundamentos de series"]}
      num={34}
      caso={step >= 1 ? "Pasajeros aéreos" : null}
      title="Descomposición: aditiva o multiplicativa"
      lede="Tendencia y estacionalidad se pueden combinar sumando o multiplicando. Se distingue viendo si la onda crece con el nivel."
    >
      {step === 0 && (
        <motion.div key="concepto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <span className="label">Esquema · no son datos</span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, marginTop: 10 }}>
            {ESQUEMAS.map((e) => (
              <div key={e.titulo}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
                  <span style={{ fontSize: 30, fontWeight: 600 }}>{e.titulo}</span>
                  <span style={{ fontSize: 26 }}>
                    <TeX>{e.tex}</TeX>
                  </span>
                </div>
                <SeriesChart
                  ancho={800}
                  alto={330}
                  series={[
                    { id: "arriba", valores: e.arriba, color: "var(--red)", guion: "6 6", grosor: 2 },
                    { id: "abajo", valores: e.abajo, color: "var(--red)", guion: "6 6", grosor: 2 },
                    { id: "y", valores: e.y, color: "var(--data)" },
                  ]}
                  y={[0, 45]}
                  ticksY={[]}
                  sinMarcasX
                  margen={{ l: 8, r: 8, t: 12, b: 12 }}
                />
                <p style={{ fontSize: 26, margin: "8px 0 0" }}>{e.frase}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {(step === 1 || step === 2) && (
        <motion.div key="embudo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "grid", gridTemplateColumns: "1080px 1fr", gap: 56 }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: 46 }}>
              <span className="label">miles de pasajeros · máximo y mínimo de cada año unidos · escala {log ? "logarítmica" : "lineal"}</span>
              {step === 2 && <Chips opciones={ESCALAS} valor={escala} onChange={setEscala} />}
            </div>
            <SeriesChart
              ancho={1080}
              alto={450}
              series={[
                { id: "techo", valores: TECHO, color: "var(--red)", guion: "6 6", grosor: 2 },
                { id: "piso", valores: PISO, color: "var(--red)", guion: "6 6", grosor: 2 },
                { id: "pasajeros", valores: Y, color: "var(--text)", grosor: 2 },
              ]}
              y={EJE.dominio}
              ticksY={log ? MARCAS_LOG : EJE.ticks}
              escalaY={log ? Math.log : undefined}
              transicion={1}
            />
          </div>
          <div>
            <Barras
              valores={log ? ANCHO_LOG : ANCHO}
              etiquetas={ANIOS.map((a) => `’${String(a).slice(2)}`)}
              ancho={540}
              alto={250}
              rotulo={log ? "ancho de la onda en log: ln(máx / mín)" : "ancho de la onda por año: máx − mín"}
              fmtY={(v) => (log ? v.toFixed(1) : String(v))}
              rojo={(i) => i === 0 || i === U}
              encima={(i) => (i === 0 || i === U ? (log ? ANCHO_LOG[i].toFixed(2) : String(ANCHO[i])) : undefined)}
              cada={2}
            />
            {step === 1 ? (
              <p style={{ fontSize: 26, lineHeight: 1.42, margin: "14px 0 0" }}>
                La onda pasa de {ANCHO[0]} a {ANCHO[U]} mil: se multiplica por <span style={{ color: "var(--red-2)" }}>{(ANCHO[U] / ANCHO[0]).toFixed(1)}</span>,
                mientras el nivel se multiplica por {(NIVEL[U] / NIVEL[0]).toFixed(1)}. Crece con el nivel (y un poco más): como en la multiplicativa.
              </p>
            ) : (
              <>
                <p style={{ fontSize: 26, lineHeight: 1.4, margin: "12px 0 14px" }}>
                  En logaritmo el ancho va de {ANCHO_LOG[0].toFixed(2)} a {ANCHO_LOG[U].toFixed(2)}: se multiplica por {(ANCHO_LOG[U] / ANCHO_LOG[0]).toFixed(1)}, no por{" "}
                  {(ANCHO[U] / ANCHO[0]).toFixed(1)}. El embudo queda casi como una banda.
                </p>
                <Recap title="logaritmo">
                  <p style={{ fontSize: 26 }}>
                    Convierte multiplicaciones en sumas: <TeX>{"\\log(T \\times S) = \\log T + \\log S"}</TeX>. Crecer 10 % suma siempre lo mismo, sea de 100 a 110 o
                    de 500 a 550.
                  </p>
                </Recap>
              </>
            )}
          </div>
        </motion.div>
      )}

      {step >= 3 && (
        <motion.div key="paneles" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "grid", gridTemplateColumns: "1080px 1fr", gap: 56 }}>
          <div style={{ display: "grid", gap: 8, alignContent: "start" }}>
            <Panel titulo="observada" valores={Y} />
            <Panel titulo="tendencia: el promedio de los 12 meses de alrededor (se explica en la 38)" valores={d.tendencia} />
            <Panel titulo={modo === "aditiva" ? "estacional: lo que se le suma a cada mes" : "estacional: por cuánto se multiplica cada mes"} valores={d.estacional} />
            <Panel titulo={modo === "aditiva" ? "lo que sobra: observada − tendencia − estacional" : "lo que sobra: observada / (tendencia × estacional)"} valores={d.residuo} ultimo rojo />
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: 46 }}>
              <span className="label">descomposición</span>
              {step >= 4 && <Chips opciones={MODOS} valor={modo} onChange={setModo} />}
            </div>
            {/* La tabla de julio en los clics 3 y 4; en el 5 su lugar lo toman el error medio y la conclusión. */}
            {step <= 4 && (
            <>
            <p style={{ fontSize: 26, lineHeight: 1.4, margin: "10px 0" }}>
              {modo === "aditiva" ? (
                <>
                  A julio le suma siempre <span style={{ color: "var(--red-2)" }}>{d.indices[JULIO].toFixed(1)}</span> mil, sea el año que sea:
                </>
              ) : (
                <>
                  A julio lo multiplica siempre por <span style={{ color: "var(--red-2)" }}>{d.indices[JULIO].toFixed(3)}</span>:
                </>
              )}
            </p>
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr className="mono" style={{ fontSize: 20, color: "var(--text-3)", textAlign: "right" }}>
                  <th style={{ ...celda, textAlign: "left" }} />
                  <th style={celda}>real</th>
                  <th style={celda}>tendencia {modo === "aditiva" ? "+" : "×"} estacional</th>
                </tr>
              </thead>
              <tbody>
                {FICHAS.map((i) => {
                  const a = ajuste(modo, i);
                  return (
                    <tr key={i}>
                      <td style={celda}>{etiqueta(i)}</td>
                      <td className="mono" style={{ ...celda, textAlign: "right" }}>
                        {Y[i]}
                      </td>
                      <td className="mono" style={{ ...celda, textAlign: "right", color: "var(--red-2)" }}>
                        {a.toFixed(1)}
                        <span data-rotulo style={{ fontSize: 20, color: "var(--text-3)", marginLeft: 10 }}>{a > Y[i] ? "se pasa" : "se queda corta"}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="label" style={{ marginTop: 10 }}>
              la tendencia no existe en los primeros ni en los últimos {CON_TENDENCIA[0]} meses
            </div>
            {step === 3 && ONDA_SOBRANTE.inicio < 0 && ONDA_SOBRANTE.fin > 0 && (
              <p style={{ fontSize: 26, lineHeight: 1.4, color: "var(--text-2)", marginTop: 14 }}>
                Por eso en lo que sobra quedó la onda: al revés al principio y al derecho al final.
              </p>
            )}
            </>
            )}
            <Reveal step={step} at={4} style={{ marginTop: 14 }}>
              <div className="mono" style={{ fontSize: 24, lineHeight: 1.6 }}>
                error medio en {CON_TENDENCIA.length} meses
                <br />
                aditiva <span style={{ color: modo === "aditiva" ? "var(--red-2)" : "var(--text)" }}>{errorMedio("aditiva").toFixed(1)} mil</span> · multiplicativa{" "}
                <span style={{ color: modo === "multiplicativa" ? "var(--red-2)" : "var(--text)" }}>{errorMedio("multiplicativa").toFixed(1)} mil</span>
              </div>
            </Reveal>
            <Reveal step={step} at={5} style={{ marginTop: 16 }}>
              <p className="takeaway" style={{ margin: 0, fontSize: 26 }}>
                En pasajeros la onda crece con el nivel: <em>es multiplicativa.</em> Para modelarla se usa el logaritmo (36, 37 y la sección G), que la vuelve casi
                aditiva. Casi: en logaritmo el ancho todavía pasa de {ANCHO_LOG[0].toFixed(2)} a {ANCHO_LOG[U].toFixed(2)}.
              </p>
            </Reveal>
          </div>
        </motion.div>
      )}
    </SlideFrame>
  );
}
