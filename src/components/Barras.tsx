import { R, margenIzq } from "../deck/tipografia";
import { motion } from "motion/react";
import { ejeQueCubre, linear } from "../lib/scale";
import { pasoRedondo } from "./SeriesChart";

// Barras sobre una lista en orden (años, rezagos, pasos después de un choque, pesos de una ventana).
// Siempre nacen de la línea del 0 y, si cambian los datos, cada una viaja a su nueva altura.

const SUAVE = [0.2, 0.7, 0.2, 1] as const;

export function Barras({
  valores,
  etiquetas,
  ancho,
  alto,
  y,
  pasoY,
  fmtY = (v) => String(v),
  rojo,
  color = "var(--data)",
  banda,
  rotulo,
  encima,
  cada = 1,
  grosor = 0.62,
  margen = { l: 58, r: 12, t: 22, b: 36 },
  transicion = 0.5,
  rotuloBanda,
  curvas = [],
  opacidad,
  senalar = [],
}: {
  /** Una barra por valor; `null` deja el hueco. */
  valores: (number | null)[];
  /** Texto bajo cada barra (se muestra una de cada `cada`). */
  etiquetas?: string[];
  ancho: number;
  alto: number;
  /** Dominio vertical; si falta, se calcula de los datos e incluye al 0. */
  y?: [number, number];
  pasoY?: number;
  fmtY?: (v: number) => string;
  /** Qué barras van en rojo. */
  rojo?: (i: number) => boolean;
  color?: string;
  /** Franja de ±banda alrededor del 0 (lo que cabría esperar por azar). Con una lista, un ancho por barra. */
  banda?: number | (number | null)[];
  rotulo?: string;
  /** Texto sobre la barra i (por ejemplo su valor); `undefined` para no escribir nada. */
  encima?: (i: number) => string | undefined;
  cada?: number;
  /** Fracción del espacio de cada barra que ocupa su ancho. */
  grosor?: number;
  margen?: { l: number; r: number; t: number; b: number };
  transicion?: number;
  rotuloBanda?: string;
  /** Valores contra los que se comparan las barras (por ejemplo, lo que diría la teoría): un guion por barra y, si se pide, una línea que los une. */
  curvas?: { id: string; valores: (number | null)[]; color?: string; etiqueta?: string; opacidad?: number; linea?: boolean; guion?: string }[];
  /** Opacidad de la barra i (para dejar unas en segundo plano). */
  opacidad?: (i: number) => number;
  /** Barras que se señalan con un triángulo bajo el eje (sin usar color). */
  senalar?: number[];
}) {
  const datos = valores.filter((v): v is number => v !== null && !Number.isNaN(v));
  const anchos = banda === undefined ? undefined : valores.map((_, i) => (typeof banda === "number" ? banda : (banda[i] ?? 0)));
  const tope = anchos ? Math.max(...anchos) : 0;
  const cubrir = [...datos, 0, ...(anchos ? [tope, -tope] : []), ...curvas.flatMap((c) => c.valores.filter((v): v is number => v !== null))];
  const eje = y ? ejeQueCubre(y, pasoY ?? pasoRedondo(y[1] - y[0], 4)) : ejeQueCubre(cubrir, pasoY ?? pasoRedondo(Math.max(...cubrir) - Math.min(...cubrir) || 1, 4));
  // El margen crece lo necesario para que los números del eje, el título y las etiquetas quepan a tamaño de rótulo.
  const m = {
    l: margenIzq(margen.l, eje.ticks.map(fmtY), 10),
    r: margen.r,
    t: rotulo ? Math.max(margen.t, R + 12) : margen.t,
    b: etiquetas ? Math.max(margen.b, R + 14) : margen.b,
  };
  const fy = linear(eje.dominio, [alto - m.b, m.t]);
  const paso = (ancho - m.l - m.r) / valores.length;
  const cero = fy(0);
  return (
    <svg width={ancho} height={alto} style={{ display: "block", overflow: "visible" }}>
      {eje.ticks.map((t) => (
        <g key={t}>
          <line x1={m.l} x2={ancho - m.r} y1={fy(t)} y2={fy(t)} stroke="var(--line)" />
          <text x={m.l - 10} y={fy(t) + 7} textAnchor="end" className="mono" fontSize={R} fill="var(--text-3)">
            {fmtY(t)}
          </text>
        </g>
      ))}
      {anchos && (
        <g>
          {/* Un escalón por barra, también cuando la banda es pareja: así puede pasar de una forma a la otra. */}
          <motion.path
            fill="var(--red-dim)"
            initial={false}
            animate={{
              d:
                anchos.map((b, i) => `${i ? "L" : "M"}${m.l + i * paso},${fy(b)}L${m.l + (i + 1) * paso},${fy(b)}`).join("") +
                anchos
                  .map((b, i) => `L${m.l + (i + 1) * paso},${fy(-b)}L${m.l + i * paso},${fy(-b)}`)
                  .reverse()
                  .join("") +
                "Z",
            }}
            transition={{ duration: transicion }}
          />
          {rotuloBanda && (
            <motion.text x={ancho - m.r} textAnchor="end" className="mono" fontSize={R} fill="var(--red-2)" initial={false} animate={{ y: fy(anchos[anchos.length - 1]) - 8 }} transition={{ duration: transicion }}>
              {rotuloBanda}
            </motion.text>
          )}
        </g>
      )}
      {rotulo && (
        <text x={m.l} y={m.t - 8} className="mono" fontSize={R} fill="var(--text-2)">
          {rotulo}
        </text>
      )}
      {valores.map((v, i) => {
        if (v === null || Number.isNaN(v)) return null;
        const x = m.l + i * paso + (paso * (1 - grosor)) / 2;
        const arriba = Math.min(fy(v), cero);
        const h = Math.max(1, Math.abs(fy(v) - cero));
        const texto = encima?.(i);
        return (
          <g key={i} opacity={opacidad?.(i) ?? 1}>
            <motion.rect x={x} width={paso * grosor} fill={rojo?.(i) ? "var(--red)" : color} initial={false} animate={{ y: arriba, height: h }} transition={{ duration: transicion, ease: SUAVE }} />
            {texto !== undefined && (
              <motion.text
                x={x + (paso * grosor) / 2}
                textAnchor="middle"
                className="mono"
                fontSize={R}
                fill={rojo?.(i) ? "var(--red-2)" : "var(--text-2)"}
                initial={false}
                animate={{ y: v >= 0 ? arriba - 7 : arriba + h + R + 2 }}
                transition={{ duration: transicion, ease: SUAVE }}
              >
                {texto}
              </motion.text>
            )}
          </g>
        );
      })}
      <line x1={m.l} x2={ancho - m.r} y1={cero} y2={cero} stroke="var(--line-2)" />
      {curvas.map((c) => {
        const tono = c.color ?? "var(--text)";
        const pts = c.valores.flatMap((v, i) => (v === null ? [] : [{ i, x: m.l + i * paso + paso / 2, y: fy(v) }]));
        const fin = pts[pts.length - 1];
        const medio = (paso * grosor) / 2 + 3;
        return (
          <motion.g key={c.id} initial={{ opacity: 0 }} animate={{ opacity: c.opacidad ?? 1 }} transition={{ duration: 0.4 }}>
            {c.linea && <motion.path fill="none" stroke={tono} strokeWidth={2.5} strokeDasharray={c.guion} initial={false} animate={{ d: pts.map((p, j) => `${j ? "L" : "M"}${p.x},${p.y}`).join("") }} transition={{ duration: transicion, ease: SUAVE }} />}
            {pts.map((p) => (
              <motion.line key={p.i} x1={p.x - medio} x2={p.x + medio} stroke={tono} strokeWidth={3} initial={false} animate={{ y1: p.y, y2: p.y }} transition={{ duration: transicion, ease: SUAVE }} />
            ))}
            {c.etiqueta && fin && (
              <motion.text x={fin.x + medio + 8} fontSize={R} fill={tono} initial={false} animate={{ y: fin.y + 7 }} transition={{ duration: transicion, ease: SUAVE }}>
                {c.etiqueta}
              </motion.text>
            )}
          </motion.g>
        );
      })}
      {senalar.map((i) => {
        const cx = m.l + i * paso + paso / 2;
        const yb = alto - m.b + 4;
        return <path key={i} d={`M${cx},${yb}L${cx - 6},${yb + 9}L${cx + 6},${yb + 9}Z`} fill="var(--text-2)" />;
      })}
      {etiquetas?.map((t, i) =>
        i % cada === 0 ? (
          <text key={i} x={m.l + i * paso + paso / 2} y={alto - m.b + R + 6} textAnchor="middle" className="mono" fontSize={R} fill="var(--text-3)">
            {t}
          </text>
        ) : null,
      )}
    </svg>
  );
}
