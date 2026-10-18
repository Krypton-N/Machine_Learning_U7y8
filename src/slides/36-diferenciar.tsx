import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { AnioMes3D } from "../components/AnioMes3D";
import { OperacionAnimada } from "../components/OperacionAnimada";
import { Chips } from "../components/Piezas";
import { Reveal } from "../components/Reveal";
import { SeriesChart } from "../components/SeriesChart";
import { TeX } from "../components/TeX";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { media } from "../lib/metricas";
import { ANIOS, MESES, TRANSFORMACIONES, pasajeros, type Transformacion } from "../lib/pasajeros";
import { ejeQueCubre } from "../lib/scale";
import { porPeriodo } from "../lib/series";

// ---------- Concepto: dos series de juguete ----------
// Sube 1 por paso en promedio, con altibajos.
const CON_TENDENCIA = [3, 5, 4, 7, 8, 7, 10, 12, 11, 13, 15, 14];
// Tres años de cuatro trimestres: el mismo patrón (+2, +6, 0, +4) sobre un nivel que sube 1 por año.
const TRIMESTRAL = [10, 14, 8, 12, 11, 15, 9, 13, 12, 16, 10, 14];
const TRIMESTRES = TRIMESTRAL.map((_, i) => `T${(i % 4) + 1}`);
const TRAMOS: [number, number][] = [
  [0, 3],
  [8, 11],
];

// ---------- Caso: las cuatro transformaciones como año × mes ----------
type Tr = Exclude<Transformacion, "original">;
const ORDEN: Tr[] = ["log", "dlog", "d12log", "dd12log"];
const N = pasajeros.valores.length;
/** La transformación acomodada año × mes, con `null` en los meses que cada diferencia se comió. */
const matrizDe = (k: Tr) => porPeriodo(Array.from({ length: N }, (_, i) => (i >= TRANSFORMACIONES[k].desde ? TRANSFORMACIONES[k].valores[i - TRANSFORMACIONES[k].desde] : null)), 12);
const MATRIZ = Object.fromEntries(ORDEN.map((k) => [k, matrizDe(k)])) as Record<Tr, (number | null)[][]>;

// Las tres diferencias comparten escala, para ver cómo se aplana: el tope es el mayor cambio, redondeado hacia arriba.
const DIFERENCIAS: Tr[] = ["dlog", "d12log", "dd12log"];
const TOPE = Math.ceil(Math.max(...DIFERENCIAS.flatMap((k) => TRANSFORMACIONES[k].valores.map(Math.abs))) / 0.05) * 0.05;
const RANGO: Record<Tr, [number, number]> = {
  log: ejeQueCubre(TRANSFORMACIONES.log.valores, 0.5).dominio,
  dlog: [-TOPE, TOPE],
  d12log: [-TOPE, TOPE],
  dd12log: [-TOPE, TOPE],
};
const ALTURA: Record<Tr, string> = {
  log: "log(pasajeros)",
  dlog: "cambio contra el mes anterior",
  d12log: "cambio contra el mismo mes del año anterior",
  dd12log: "cambio del cambio",
};
const VENTANA_MEDIA = 24;
const mediasDeTramo = (k: Tr) => {
  const v = TRANSFORMACIONES[k].valores;
  return { inicio: media(v.slice(0, VENTANA_MEDIA)), fin: media(v.slice(-VENTANA_MEDIA)) };
};

// Lecturas que salen de los datos.
const NOMBRE_MES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const enLista = (v: string[]) => (v.length > 1 ? `${v.slice(0, -1).join(", ")} y ${v[v.length - 1]}` : v[0]);
const columna = (k: Tr, mes: number) => MATRIZ[k].map((f) => f[mes]).filter((v): v is number => v !== null);
const SUBEN = NOMBRE_MES.filter((_, mes) => columna("dlog", mes).every((v) => v > 0));
const BAJAN = NOMBRE_MES.filter((_, mes) => columna("dlog", mes).every((v) => v < 0));
const PICOS = [...new Set(pasajeros.matriz.map((f) => f.indexOf(Math.max(...f))))].sort((a, b) => a - b).map((i) => NOMBRE_MES[i]);
const porciento = (v: number, d = 1) => `${(Math.expm1(v) * 100).toFixed(d)} %`;
const M12 = mediasDeTramo("d12log");
const LECTURA: Record<Tr, string> = {
  log: `Sube año con año: tendencia. Y cada año repite el mismo pico, en ${enLista(PICOS)}: estacionalidad.`,
  dlog: `La inclinación entre años desaparece: en promedio +${porciento(media(TRANSFORMACIONES.dlog.valores), 2)} por mes. Pero la ondulación sigue: ${enLista(SUBEN)} suben todos los años disponibles; ${enLista(BAJAN)} bajan todos.`,
  d12log: `Cada mes contra el mismo mes del año anterior: el patrón por mes se va. Queda el crecimiento anual, que no es parejo: ${porciento(M12.inicio, 0)} al año al principio y ${porciento(M12.fin, 0)} al final.`,
  dd12log: `Sin tendencia y sin patrón por mes: queda algo parecido a ruido alrededor de cero. Se pierden ${TRANSFORMACIONES.dd12log.desde} meses: quedan ${TRANSFORMACIONES.dd12log.valores.length}.`,
};
const OPCIONES = ORDEN.map((k) => ({ valor: k, texto: TRANSFORMACIONES[k].nombre }));
const PASO_DE: Record<number, Tr> = { 3: "log", 4: "dlog", 5: "d12log", 6: "dd12log" };

export default function Diferenciar({ step }: SlideProps) {
  const [tr, setTr] = useState<Tr>("log");
  useEffect(() => {
    if (PASO_DE[step]) setTr(PASO_DE[step]);
  }, [step]);
  const T = TRANSFORMACIONES[tr];
  const tramo = mediasDeTramo(tr);
  const dec = tr === "log" ? 2 : 3;

  return (
    <SlideFrame
      section={["U8 · Datos secuenciales", "F. Fundamentos de series"]}
      num={36}
      caso={step >= 3 ? "Pasajeros aéreos" : null}
      title="Diferenciar: volver estacionaria una serie"
      lede="Si la serie no es estacionaria, se transforma hasta que lo sea. La herramienta es una resta."
    >
      {step <= 2 && (
        <motion.div key="concepto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "grid", gridTemplateColumns: "650px 1fr", gap: 60 }}>
          <div style={{ fontSize: 26, lineHeight: 1.42 }}>
            {step === 0 && (
              <div style={{ display: "grid", gap: 22 }}>
                {[
                  "Los modelos de la sección G aprenden números fijos: una media, un peso para el valor anterior.",
                  "Esos números solo describen el futuro si la serie se comporta igual en cualquier tramo: si es estacionaria.",
                  "Si no lo es, se transforma hasta que lo sea. Al pronosticar, la transformación se deshace.",
                ].map((t, i) => (
                  <div key={i} style={{ borderLeft: "1px solid var(--line-2)", paddingLeft: 24 }}>
                    {t}
                  </div>
                ))}
                <div style={{ color: "var(--red-2)" }}>Aquí la media cambia de un tramo a otro: no hay una sola que aprender.</div>
              </div>
            )}
            {step === 1 && (
              <div>
                <div style={{ fontSize: 40 }}>
                  <TeX>{"\\nabla x_t = x_t - x_{t-1}"}</TeX>
                </div>
                <p style={{ color: "var(--text-2)", margin: "10px 0 26px" }}>∇ se lee «diferencia»: el valor de hoy menos el de ayer.</p>
                <p style={{ margin: 0 }}>Si la serie sube lo mismo en cada paso, más unos altibajos, la diferencia se queda con la subida y los altibajos:</p>
                <div style={{ fontSize: 27, margin: "14px 0" }}>
                  <TeX>{"x_t = a + b\\,t + e_t \\;\\Rightarrow\\; \\nabla x_t = b + (e_t - e_{t-1})"}</TeX>
                </div>
                <p style={{ color: "var(--red-2)", margin: 0 }}>Una subida constante se vuelve un nivel constante.</p>
              </div>
            )}
            {step === 2 && (
              <div>
                <div style={{ fontSize: 40 }}>
                  <TeX>{"\\nabla_s\\, x_t = x_t - x_{t-s}"}</TeX>
                </div>
                <p style={{ color: "var(--text-2)", margin: "10px 0 26px" }}>Diferencia estacional: el valor de hoy menos el del mismo momento del periodo anterior.</p>
                <p style={{ margin: 0 }}>Lo que se repite igual cada periodo se cancela. Queda solo lo que cambió de un periodo al siguiente.</p>
                <p className="mono" style={{ fontSize: 22, color: "var(--text-2)", marginTop: 22 }}>
                  trimestral: s = 4 · mensual: s = 12
                </p>
              </div>
            )}
          </div>
          <div>
            <span className="label">Esquema · no son datos{step === 2 && " · 3 años de 4 trimestres"}</span>
            <div style={{ marginTop: 8 }}>
              {step === 0 && <OperacionAnimada x={CON_TENDENCIA} ancho={980} alto={330} tramos={TRAMOS} />}
              {step === 1 && <OperacionAnimada x={CON_TENDENCIA} op={{ tipo: "diferencia", k: 1 }} ancho={980} alto={520} />}
              {step === 2 && <OperacionAnimada x={TRIMESTRAL} op={{ tipo: "diferencia", k: 4 }} ancho={980} alto={520} etiquetas={TRIMESTRES} />}
            </div>
          </div>
        </motion.div>
      )}

      {step >= 3 && (
        <motion.div key="caso" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "grid", gridTemplateColumns: "960px 1fr", gap: 50 }}>
          <div style={{ height: 560 }}>
            <AnioMes3D
              matriz={MATRIZ[tr]}
              forma="superficie"
              rango={RANGO[tr]}
              planoCero={tr !== "log"}
              etiquetasFilas={ANIOS.map(String)}
              etiquetasCols={MESES}
              rotuloAltura={ALTURA[tr]}
            />
          </div>
          <div>
            <Chips opciones={OPCIONES} valor={tr} onChange={setTr} />
            <div style={{ fontSize: 30, margin: "16px 0 8px" }}>
              <TeX>{T.tex}</TeX>
            </div>
            <p style={{ fontSize: 26, lineHeight: 1.4, margin: 0, minHeight: 124 }}>{LECTURA[tr]}</p>
            <SeriesChart
              ancho={686}
              alto={200}
              series={[{ id: tr, valores: T.valores, desde: T.desde, color: "var(--data)", grosor: 2 }]}
              ventana={[0, N - 1]}
              y={RANGO[tr]}
              ticksY={tr === "log" ? RANGO[tr] : [-TOPE, 0, TOPE]}
              fmtY={(v) => v.toFixed(tr === "log" ? 1 : 2)}
              cadaAnios={2}
              segmentos={[
                { x0: T.desde, x1: T.desde + VENTANA_MEDIA - 1, y: tramo.inicio, texto: tramo.inicio.toFixed(dec) },
                { x0: N - VENTANA_MEDIA, x1: N - 1, y: tramo.fin, texto: tramo.fin.toFixed(dec) },
              ]}
              margen={{ l: 58, r: 14, t: 26, b: 34 }}
            />
            <div className="label" style={{ fontSize: 20 }}>
              en rojo: la media de los primeros y de los últimos {VENTANA_MEDIA} meses
            </div>
            <Reveal step={step} at={6} style={{ marginTop: 12 }}>
              <p className="takeaway" style={{ margin: 0, fontSize: 26 }}>
                Logaritmo, una diferencia y una diferencia estacional. <em>¿Ya es estacionaria?</em> Eso se pone a prueba en la 37.
              </p>
            </Reveal>
          </div>
        </motion.div>
      )}
    </SlideFrame>
  );
}
