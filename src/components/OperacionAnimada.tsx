import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { media } from "../lib/metricas";
import { linear } from "../lib/scale";
import { diferencia, promedioMovil } from "../lib/series";

// Una serie corta de esquema donde la operación ocurre punto por punto, a la vista:
// - "diferencia": cada salto (o cada arco, si se resta el valor de k pasos atrás) cae como barra a un panel inferior.
// - "ventana": un corchete recorre la serie, escribe su cuenta y deja el promedio como punto rojo.
// El resultado lo calcula src/lib/series.ts; aquí solo se dibuja.

export type Operacion = { tipo: "diferencia"; k: number } | { tipo: "ventana"; k: number };

const num = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(2));

export function OperacionAnimada({
  x,
  op,
  ancho,
  alto,
  etiquetas,
  tramos = [],
  msPorPaso = 380,
}: {
  x: number[];
  /** Sin operación se dibuja solo la serie (con las medias de `tramos`, si las hay). */
  op?: Operacion;
  ancho: number;
  alto: number;
  /** Rótulo de cada posición; si falta, 1, 2, 3… */
  etiquetas?: string[];
  /** Tramos [desde, hasta] (posiciones) de los que se dibuja la media. */
  tramos?: [number, number][];
  msPorPaso?: number;
}) {
  const n = x.length;
  const dif = op?.tipo === "diferencia" ? diferencia(x, op.k) : [];
  const prom = op?.tipo === "ventana" ? promedioMovil(x, op.k) : [];
  // Posiciones en las que la operación da un resultado, en el orden en que se recorren.
  const pasos = op?.tipo === "diferencia" ? dif.map((_, j) => j + op.k) : prom.flatMap((v, t) => (Number.isNaN(v) ? [] : [t]));

  // Cuántos resultados van a la vista: avanza solo hasta completarlos y se reinicia si cambia la operación.
  const clave = `${op?.tipo}-${op?.k}-${x.join()}`;
  const [hechos, setHechos] = useState(0);
  useEffect(() => {
    setHechos(0);
    if (!pasos.length) return;
    const id = setInterval(() => setHechos((h) => (h >= pasos.length ? h : h + 1)), msPorPaso);
    return () => clearInterval(id);
  }, [clave, msPorPaso, pasos.length]);
  const actual = hechos > 0 ? pasos[Math.min(hechos, pasos.length) - 1] : -1;

  const conPanel = op?.tipo === "diferencia";
  // La ventana deja un renglón abajo para escribir su cuenta.
  const hSerie = conPanel ? alto * 0.56 : op?.tipo === "ventana" ? alto - 44 : alto;
  const m = { l: 56, r: 24 };
  const fx = linear([0, n - 1], [m.l, ancho - m.r]);
  const lo = Math.min(...x);
  const hi = Math.max(...x);
  const fy = linear([lo - (hi - lo) * 0.12, hi + (hi - lo) * 0.22], [hSerie - 34, 10]);
  const linea = x.map((v, i) => `${i ? "L" : "M"}${fx(i)},${fy(v)}`).join("");

  // Panel inferior de las diferencias, con el 0 a la vista.
  const dLo = Math.min(0, ...dif);
  const dHi = Math.max(0, ...dif);
  const y0 = hSerie + 26;
  const fd = linear([dLo - (dHi - dLo) * 0.25, dHi + (dHi - dLo) * 0.35], [alto - 8, y0]);
  const anchoBarra = Math.min(46, ((ancho - m.l - m.r) / (n - 1)) * 0.5);
  const completa = hechos >= pasos.length && pasos.length > 0;

  return (
    <svg width={ancho} height={alto} style={{ display: "block", overflow: "visible" }}>
      {tramos.map(([a, b]) => {
        const mu = media(x.slice(a, b + 1));
        return (
          <g key={`${a}-${b}`}>
            <rect x={fx(a) - 18} y={6} width={fx(b) - fx(a) + 36} height={hSerie - 44} fill="var(--red-dim)" />
            <line x1={fx(a) - 18} x2={fx(b) + 18} y1={fy(mu)} y2={fy(mu)} stroke="var(--red)" strokeWidth={3} />
            <text x={(fx(a) + fx(b)) / 2} y={hSerie - 44 + 2} textAnchor="middle" className="mono" fontSize={18} fill="var(--red-2)">
              media {num(mu)}
            </text>
          </g>
        );
      })}
      <path d={linea} fill="none" stroke="var(--data-dim)" strokeWidth={2} />

      {/* Diferencia: de dónde a dónde salta cada valor */}
      {op?.tipo === "diferencia" &&
        pasos.slice(0, hechos).map((t) => {
          const a = t - op.k;
          const sube = x[t] >= x[a];
          const viva = t === actual && !completa;
          const d =
            op.k === 1
              ? `M${fx(t)},${fy(x[a])}L${fx(t)},${fy(x[t])}`
              : `M${fx(a)},${fy(x[a]) - 12}Q${(fx(a) + fx(t)) / 2},${Math.min(fy(x[a]), fy(x[t])) - 54} ${fx(t)},${fy(x[t]) - 12}`;
          return <path key={t} d={d} fill="none" stroke={sube ? "var(--red)" : "var(--data)"} strokeWidth={viva ? 4 : 2.5} opacity={viva || op.k === 1 ? 1 : 0.35} />;
        })}

      {/* Ventana: el corchete en su posición actual y la cuenta que hace */}
      {op?.tipo === "ventana" && actual >= 0 && (
        <g>
          {(() => {
            const h = (op.k - 1) / 2;
            const a = actual - h;
            const b = actual + h;
            const ventana = x.slice(a, b + 1);
            return (
              <>
                <motion.rect y={8} height={hSerie - 46} fill="var(--red-dim)" stroke="var(--red-line)" initial={false} animate={{ x: fx(a) - 22, width: fx(b) - fx(a) + 44 }} transition={{ duration: 0.25 }} />
                <text x={ancho / 2} y={alto - 4} textAnchor="middle" className="mono" fontSize={24} fill="var(--red-2)">
                  ({ventana.map(num).join(" + ")}) / {op.k} = {num(prom[actual])}
                </text>
              </>
            );
          })()}
        </g>
      )}
      {op?.tipo === "ventana" && (
        <path
          d={pasos
            .slice(0, hechos)
            .map((t, j) => `${j ? "L" : "M"}${fx(t)},${fy(prom[t])}`)
            .join("")}
          fill="none"
          stroke="var(--red)"
          strokeWidth={3}
        />
      )}
      {op?.tipo === "ventana" && pasos.slice(0, hechos).map((t) => <circle key={t} cx={fx(t)} cy={fy(prom[t])} r={8} fill="var(--red)" />)}

      {/* La serie y sus valores */}
      {x.map((v, i) => (
        <g key={i}>
          <circle cx={fx(i)} cy={fy(v)} r={6} fill="var(--data)" />
          <text x={fx(i)} y={fy(v) - 14} textAnchor="middle" className="mono" fontSize={19} fill="var(--text)">
            {num(v)}
          </text>
          <text x={fx(i)} y={hSerie - 8} textAnchor="middle" className="mono" fontSize={15} fill="var(--text-3)">
            {etiquetas?.[i] ?? i + 1}
          </text>
        </g>
      ))}

      {/* Panel de diferencias */}
      {conPanel && (
        <g>
          <line x1={m.l - 30} x2={ancho - m.r + 20} y1={fd(0)} y2={fd(0)} stroke="var(--line-2)" />
          <text x={m.l - 36} y={fd(0) + 5} textAnchor="end" className="mono" fontSize={15} fill="var(--text-3)">
            0
          </text>
          {pasos.slice(0, hechos).map((t, j) => {
            const v = dif[j];
            const arriba = Math.min(fd(v), fd(0));
            const h = Math.max(2, Math.abs(fd(v) - fd(0)));
            return (
              <g key={t}>
                <motion.rect x={fx(t) - anchoBarra / 2} width={anchoBarra} fill={v >= 0 ? "var(--red)" : "var(--data)"} initial={{ y: fd(0), height: 0 }} animate={{ y: arriba, height: h }} transition={{ duration: 0.25 }} />
                <text x={fx(t)} y={v >= 0 ? arriba - 8 : arriba + h + 20} textAnchor="middle" className="mono" fontSize={18} fill="var(--text)">
                  {v > 0 ? "+" : ""}
                  {num(v)}
                </text>
              </g>
            );
          })}
          {completa && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <line x1={m.l - 30} x2={ancho - m.r + 20} y1={fd(media(dif))} y2={fd(media(dif))} stroke="var(--red-2)" strokeDasharray="6 6" />
              <text x={m.l - 30} y={fd(media(dif)) - 8} className="mono" fontSize={17} fill="var(--red-2)">
                media {num(media(dif))}
              </text>
            </motion.g>
          )}
        </g>
      )}
    </svg>
  );
}
