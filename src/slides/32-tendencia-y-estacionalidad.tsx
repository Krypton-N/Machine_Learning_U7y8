import { motion } from "motion/react";
import { useState } from "react";
import { AnioMes3D, VISTAS_ANIO_MES } from "../components/AnioMes3D";
import { Chips, Def } from "../components/Piezas";
import { Reveal } from "../components/Reveal";
import { SeriesChart } from "../components/SeriesChart";
import { TeX } from "../components/TeX";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { ANIOS, MESES, pasajeros } from "../lib/pasajeros";
import { media } from "../lib/metricas";
import { ejeQueCubre } from "../lib/scale";

// ---------- Concepto: una recta, una onda y su suma (esquema) ----------
const PERIODO = 12;
const T_ESQ = Array.from({ length: 4 * PERIODO + 1 }, (_, t) => 2 + 0.07 * t);
const S_ESQ = T_ESQ.map((_, t) => 1.1 * Math.sin((2 * Math.PI * t) / PERIODO));
const Y_ESQ = T_ESQ.map((v, t) => v + S_ESQ[t]);

function Esquema({ titulo, valores, y, rojo }: { titulo: string; valores: number[]; y: [number, number]; rojo?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 21, color: "var(--text-2)" }}>{titulo}</div>
      <SeriesChart ancho={880} alto={130} series={[{ id: titulo, valores, color: rojo ? "var(--red)" : "var(--data)" }]} y={y} ticksY={[]} sinMarcasX margen={{ l: 8, r: 8, t: 8, b: 8 }} />
    </div>
  );
}

// ---------- Caso ----------
const Y = pasajeros.valores;
const M = pasajeros.matriz;
const EJE = ejeQueCubre(Y, 100);
const MEDIAS = M.map(media);
// Meses en que cada año alcanza su máximo (puede haber empate).
const PICOS = M.map((fila) => fila.flatMap((v, mes) => (v === Math.max(...fila) ? [mes] : [])));
const MESES_PICO = [...new Set(PICOS.flat())].sort((a, b) => a - b);
const NOMBRE_MES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const ANCHO_ONDA = M.map((fila) => Math.max(...fila) - Math.min(...fila));
const U = ANIOS.length - 1;
// Cuántas veces un mes quedó por arriba del mismo mes del año anterior.
const COMPARACIONES = M.slice(1).flatMap((fila, a) => fila.map((v, mes) => v > M[a][mes]));
const SUBIDAS = COMPARACIONES.filter(Boolean).length;

type NombreVista = keyof typeof VISTAS_ANIO_MES;
const VISTAS: { valor: NombreVista; texto: string }[] = [
  { valor: "meses", texto: "por meses" },
  { valor: "anios", texto: "por años" },
  { valor: "libre", texto: "libre" },
];
const LECTURA: Record<NombreVista, string> = {
  meses: `De frente, cada año es una silueta: sube hacia ${MESES_PICO.map((i) => NOMBRE_MES[i]).join(" y ")} y vuelve a bajar. Es la misma forma, cada vez más alta.`,
  anios: `De lado, cada mes es una rampa: comparado con el mismo mes del año anterior, sube ${SUBIDAS} de ${COMPARACIONES.length} veces.`,
  libre: "Arrastra para girar. Las barras rojas son el mes más alto de cada año.",
};

export default function TendenciaYEstacionalidad({ step }: SlideProps) {
  const [vista, setVista] = useState<NombreVista>("libre");
  return (
    <SlideFrame
      section={["U8 · Datos secuenciales", "F. Fundamentos de series"]}
      num={32}
      caso={step >= 1 ? "Pasajeros aéreos" : null}
      title="Tendencia y estacionalidad"
      lede="Dos cosas distintas que una serie puede hacer a la vez: cambiar de nivel poco a poco y repetir un patrón cada cierto tiempo."
    >
      {step === 0 && (
        <motion.div key="concepto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "grid", gridTemplateColumns: "880px 1fr", gap: 76 }}>
          <div>
            <span className="label">Esquema · no son datos</span>
            <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
              <Esquema titulo="tendencia" valores={T_ESQ} y={[0, 7]} />
              <Esquema titulo={`estacionalidad (se repite cada ${PERIODO} pasos)`} valores={S_ESQ} y={[-2, 2]} />
              <Esquema titulo="la serie: tendencia + estacionalidad" valores={Y_ESQ} y={[0, 7]} rojo />
            </div>
          </div>
          <div style={{ display: "grid", gap: 30, alignContent: "start", paddingTop: 30 }}>
            <Def termino="Tendencia">Hacia dónde va el nivel a largo plazo: sube, baja o se queda.</Def>
            <Def termino="Estacionalidad">
              Un patrón que se repite cada periodo fijo, ligado al calendario: <TeX>{"S_{t+m} = S_t"}</TeX>. El periodo m puede ser 12 meses, 7 días o 24 horas.
            </Def>
            <p style={{ fontSize: 22, color: "var(--text-3)", margin: 0 }}>Aquí se sumaron. Si se suman o se multiplican se decide en la diapositiva 34.</p>
          </div>
        </motion.div>
      )}

      {step === 1 && (
        <motion.div key="medias" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <SeriesChart
            ancho={1696}
            alto={430}
            series={[{ id: "pasajeros", valores: Y, color: "var(--data)", grosor: 2 }]}
            y={EJE.dominio}
            ticksY={EJE.ticks}
            rotuloY="miles de pasajeros"
            segmentos={MEDIAS.map((v, a) => ({ x0: a * 12, x1: a * 12 + 11, y: v, texto: a === 0 || a === U ? v.toFixed(1) : undefined, abajo: true }))}
            marcas={PICOS.flatMap((meses, a) => meses.map((mes, k) => ({ x: a * 12 + mes, y: M[a][mes], texto: k === 0 ? meses.map((i) => MESES[i]).join(" = ") : undefined, r: 5 })))}
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, marginTop: 18, fontSize: 25, lineHeight: 1.4 }}>
            <div>
              <b>Tendencia:</b> el promedio de cada año (tramos rojos) sube de {MEDIAS[0].toFixed(1)} a {MEDIAS[U].toFixed(1)} mil: se multiplica por{" "}
              {(MEDIAS[U] / MEDIAS[0]).toFixed(1)}.
            </div>
            <div>
              <b>Estacionalidad:</b> en los {ANIOS.length} años el mes más alto es {MESES_PICO.map((i) => NOMBRE_MES[i]).join(" o ")}.
            </div>
          </div>
        </motion.div>
      )}

      {step >= 2 && (
        <motion.div key="3d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "grid", gridTemplateColumns: "980px 1fr", gap: 60, height: "100%" }}>
          <div style={{ height: 560 }}>
            <AnioMes3D
              matriz={M}
              forma="barras"
              rango={[0, EJE.dominio[1]]}
              resaltar={(a, mes) => PICOS[a].includes(mes)}
              etiquetasFilas={ANIOS.map(String)}
              etiquetasCols={MESES}
              rotuloAltura="miles de pasajeros"
              vista={VISTAS_ANIO_MES[vista]}
            />
          </div>
          <div>
            <span className="label">la tabla de la 31, con alturas</span>
            <div style={{ marginTop: 12 }}>
              <Chips opciones={VISTAS} valor={vista} onChange={setVista} />
            </div>
            <p style={{ fontSize: 25, lineHeight: 1.42, marginTop: 22, minHeight: 110 }}>{LECTURA[vista]}</p>
            <Reveal step={step} at={3} style={{ marginTop: 10 }}>
              <p className="takeaway" style={{ margin: 0, fontSize: 26 }}>
                <em>Tendencia:</em> cómo cambia el nivel de un año a otro. <em>Estacionalidad:</em> la forma dentro del año, siempre en los mismos meses.
              </p>
              <p style={{ fontSize: 23, color: "var(--text-2)", lineHeight: 1.4, marginTop: 16 }}>
                Un aviso para la 34: la onda no mide siempre lo mismo. En {ANIOS[0]}, del mes más bajo al más alto hay {ANCHO_ONDA[0]} mil pasajeros; en {ANIOS[U]},{" "}
                {ANCHO_ONDA[U]}.
              </p>
            </Reveal>
          </div>
        </motion.div>
      )}
    </SlideFrame>
  );
}
