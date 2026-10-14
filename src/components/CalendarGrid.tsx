import { motion } from "motion/react";
import { ejeQueCubre, linear } from "../lib/scale";
import { pasoRedondo } from "./SeriesChart";

// Una serie acomodada en renglones de un periodo (año × mes). Tiene dos fases y cada valor viaja de una a otra:
// "tabla" (la rejilla) y "serie" (los mismos valores en fila, sobre el eje del tiempo). Así se ve que la serie
// es la tabla leída renglón por renglón, y al revés: que doblar una serie por su periodo alinea lo que se repite.

const SUAVE = [0.2, 0.7, 0.2, 1] as const;

export function CalendarGrid({
  matriz,
  ancho,
  alto,
  anchoTabla,
  fase = "tabla",
  modo = "numeros",
  etiquetasFilas = [],
  etiquetasCols = [],
  resaltar = [],
  intensidad,
  formato = (v) => String(v),
  tamano = 20,
  cursor,
  futuro = 0,
  rotuloFuturo,
  cadaFilas = 1,
}: {
  /** matriz[fila][columna]: fila = periodo (año), columna = posición dentro del periodo (mes). */
  matriz: number[][];
  ancho: number;
  alto: number;
  /** Ancho que ocupa la rejilla en la fase "tabla" (por omisión, todo). La serie siempre usa el ancho completo. */
  anchoTabla?: number;
  fase?: "tabla" | "serie";
  /** "numeros": el valor escrito. "calor": la celda se pinta según `intensidad`. "puntos": solo un punto por valor. */
  modo?: "numeros" | "calor" | "puntos";
  etiquetasFilas?: string[];
  etiquetasCols?: string[];
  /** Celdas [fila, columna] que se marcan en rojo. */
  resaltar?: [number, number][];
  /** Para el modo "calor": un número entre −1 (gris) y 1 (rojo) por celda. */
  intensidad?: (fila: number, col: number) => number;
  formato?: (v: number) => string;
  tamano?: number;
  /** En la fase "serie": posición (0 = primer valor) que se señala con una línea vertical. */
  cursor?: number;
  /** En la fase "serie": cuántas casillas vacías se dibujan después del último valor. */
  futuro?: number;
  rotuloFuturo?: string;
  /** En la fase "serie": cada cuántos periodos se rotula el eje. */
  cadaFilas?: number;
}) {
  const filas = matriz.length;
  const cols = matriz[0].length;
  const n = filas * cols;
  const marcado = new Set(resaltar.map(([f, c]) => f * cols + c));

  // Fase "tabla": rejilla con una columna de rótulos a la izquierda y un renglón arriba.
  const izq = etiquetasFilas.length ? 86 : 0;
  const arriba = etiquetasCols.length ? 34 : 0;
  const wTabla = anchoTabla ?? ancho;
  const cw = (wTabla - izq) / cols;
  const ch = (alto - arriba) / filas;

  // Fase "serie": los mismos valores en fila.
  const todos = matriz.flat();
  const eje = ejeQueCubre(todos, pasoRedondo(Math.max(...todos) - Math.min(...todos) || 1, 6));
  const ms = { l: 64, r: 20, t: 16, b: 44 };
  const fx = linear([0, n - 1 + futuro], [ms.l, ancho - ms.r]);
  const fy = linear(eje.dominio, [alto - ms.b, ms.t]);
  const enSerie = fase === "serie";
  const mover = { duration: 0.9, ease: SUAVE };
  const linea = todos.map((v, i) => `${i ? "L" : "M"}${fx(i)},${fy(v)}`).join("");

  return (
    <svg width={ancho} height={alto} style={{ display: "block", overflow: "visible" }}>
      {/* Rótulos de la tabla */}
      <motion.g initial={false} animate={{ opacity: enSerie ? 0 : 1 }} transition={{ duration: 0.4 }}>
        {etiquetasCols.map((t, c) => (
          <text key={t + c} x={izq + c * cw + cw / 2} y={20} textAnchor="middle" className="mono" fontSize={16} fill="var(--text-3)">
            {t}
          </text>
        ))}
        {etiquetasFilas.map((t, f) => (
          <text key={t} x={izq - 18} y={arriba + f * ch + ch / 2 + 6} textAnchor="end" className="mono" fontSize={16} fill="var(--text-3)">
            {t}
          </text>
        ))}
        {Array.from({ length: filas + 1 }, (_, f) => (
          <line key={f} x1={izq} x2={wTabla} y1={arriba + f * ch} y2={arriba + f * ch} stroke="var(--line)" />
        ))}
      </motion.g>

      {/* Ejes de la serie */}
      <motion.g initial={false} animate={{ opacity: enSerie ? 1 : 0 }} transition={{ duration: 0.5, delay: enSerie ? 0.7 : 0 }}>
        {eje.ticks.map((t) => (
          <g key={t}>
            <line x1={ms.l} x2={ancho - ms.r} y1={fy(t)} y2={fy(t)} stroke="var(--line)" />
            <text x={ms.l - 12} y={fy(t) + 5} textAnchor="end" className="mono" fontSize={15} fill="var(--text-3)">
              {formato(t)}
            </text>
          </g>
        ))}
        {etiquetasFilas.map((t, f) =>
          f % cadaFilas === 0 ? (
            <text key={t} x={fx(f * cols)} y={alto - ms.b + 28} textAnchor="middle" className="mono" fontSize={15} fill="var(--text-3)">
              {t}
            </text>
          ) : null,
        )}
        <motion.path d={linea} fill="none" stroke="var(--data)" strokeWidth={2} initial={false} animate={{ pathLength: enSerie ? 1 : 0 }} transition={{ duration: enSerie ? 1.2 : 0.2, delay: enSerie ? 0.9 : 0 }} />
        {Array.from({ length: futuro }, (_, j) => (
          <rect key={j} x={fx(n + j) - 5} y={fy(eje.dominio[1]) + 20} width={10} height={fy(eje.dominio[0]) - fy(eje.dominio[1]) - 20} fill="none" stroke="var(--red-line)" strokeDasharray="3 4" />
        ))}
        {futuro > 0 && rotuloFuturo && (
          <text x={fx(n + (futuro - 1) / 2)} y={fy(eje.dominio[1]) + 12} textAnchor="middle" className="mono" fontSize={16} fill="var(--red-2)">
            {rotuloFuturo}
          </text>
        )}
        {cursor !== undefined && <line x1={fx(cursor)} x2={fx(cursor)} y1={ms.t} y2={alto - ms.b} stroke="var(--red)" strokeWidth={1.5} />}
      </motion.g>

      {/* Los valores: una celda en la tabla, un punto en la serie */}
      {todos.map((v, i) => {
        const f = Math.floor(i / cols);
        const c = i % cols;
        const rojo = marcado.has(i);
        const k = intensidad ? intensidad(f, c) : 0;
        const fondo = modo !== "calor" ? "rgba(0,0,0,0)" : k >= 0 ? `rgba(229, 56, 59, ${Math.min(1, k) * 0.85})` : `rgba(189, 189, 196, ${Math.min(1, -k) * 0.4})`;
        const actual = cursor === i && enSerie;
        return (
          <motion.g
            key={i}
            initial={false}
            animate={{ x: enSerie ? fx(i) : izq + c * cw + cw / 2, y: enSerie ? fy(v) : arriba + f * ch + ch / 2 }}
            transition={{ ...mover, delay: enSerie ? f * 0.05 : 0 }}
          >
            {modo !== "puntos" && (
              <motion.g initial={false} animate={{ opacity: enSerie ? 0 : 1 }} transition={{ duration: 0.5 }}>
                <rect x={-cw / 2 + 2} y={-ch / 2 + 2} width={cw - 4} height={ch - 4} fill={fondo} stroke={rojo ? "var(--red)" : "none"} strokeWidth={2} />
                <text y={tamano * 0.35} textAnchor="middle" className="mono" fontSize={tamano} fill={rojo && modo === "numeros" ? "var(--red-2)" : "var(--text)"}>
                  {formato(v)}
                </text>
              </motion.g>
            )}
            <motion.circle
              initial={false}
              animate={{ opacity: enSerie || modo === "puntos" ? 1 : 0, r: actual ? 8 : modo === "puntos" ? (rojo ? 7 : 4) : 3 }}
              transition={{ duration: 0.4 }}
              fill={rojo || actual ? "var(--red)" : "var(--data)"}
            />
          </motion.g>
        );
      })}
    </svg>
  );
}
