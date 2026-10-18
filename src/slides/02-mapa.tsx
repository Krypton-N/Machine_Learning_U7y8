import { motion } from "motion/react";
import { useState } from "react";
import { Chips } from "../components/Piezas";
import { Entra } from "../components/Reveal";
import { CLASES, SECCIONES, UNIDADES } from "../deck/estructura";
import { useFlechas } from "../deck/hooks";
import { SlideFrame } from "../deck/SlideFrame";
import { R } from "../deck/tipografia";
import type { SlideProps } from "../deck/types";
import { TOTAL_PLANNED } from "../deck/types";

const W = 1696;
const H = 470;
const HUECO = 10;
const MINIMO = 120; // ancho mínimo de un tramo, para que quepan su letra y su rango
const Y_LINEA = 196;

// Ancho de cada tramo: proporcional a sus diapositivas, con un mínimo; los demás se reparten lo que sobra.
const ANCHOS = (() => {
  const util = W - HUECO * (SECCIONES.length - 1);
  const n = SECCIONES.map((s) => s.hasta - s.desde + 1);
  let fijos = new Set<number>();
  for (let vuelta = 0; vuelta < 5; vuelta++) {
    const libre = util - fijos.size * MINIMO;
    const resto = n.reduce((a, v, i) => (fijos.has(i) ? a : a + v), 0);
    const nuevos = new Set(n.map((v, i) => (fijos.has(i) || (v / resto) * libre < MINIMO ? i : -1)).filter((i) => i >= 0));
    if (nuevos.size === fijos.size) break;
    fijos = nuevos;
  }
  const libre = util - fijos.size * MINIMO;
  const resto = n.reduce((a, v, i) => (fijos.has(i) ? a : a + v), 0);
  return n.map((v, i) => (fijos.has(i) ? MINIMO : (v / resto) * libre));
})();
const INICIOS = ANCHOS.map((_, i) => ANCHOS.slice(0, i).reduce((a, b) => a + b, 0) + HUECO * i);

/** Posición horizontal de la diapositiva `num` (el centro de su lugar dentro de su tramo). */
function xDe(num: number) {
  const i = SECCIONES.findIndex((s) => num >= s.desde && num <= s.hasta);
  const s = SECCIONES[i];
  return INICIOS[i] + ((num - s.desde + 0.5) / (s.hasta - s.desde + 1)) * ANCHOS[i];
}
const borde = (num: number, lado: "ini" | "fin") => {
  const i = SECCIONES.findIndex((s) => num >= s.desde && num <= s.hasta);
  const s = SECCIONES[i];
  return lado === "ini" && num === s.desde ? INICIOS[i] : lado === "fin" && num === s.hasta ? INICIOS[i] + ANCHOS[i] : xDe(num);
};

const CASOS = [
  { nombre: "Adult", pregunta: "¿La persona gana más de 50K al año?", desde: 4, hasta: 28 },
  { nombre: "Pasajeros aéreos", pregunta: "¿Cuántos pasajeros habrá el próximo año?", desde: 29, hasta: 50 },
  { nombre: "Clima oculto", pregunta: "¿Qué clima hubo cada día?", desde: 51, hasta: 61 },
];
// El hilo baja al centro del tramo Cierre (ahí está la 62, que junta la receta de los tres casos): así no cruza
// el nombre de la sección H.
const X_CIERRE = INICIOS[SECCIONES.length - 1] + ANCHOS[SECCIONES.length - 1] / 2;

// Un clic, una idea: 0 el recorrido · 1 las tres clases · 2 los tres casos · 3 la misma receta en todos.
// La marca "vamos aquí" (botones y ↑ ↓) es para abrir las clases 2 y 3.
export default function Mapa({ step, active }: SlideProps) {
  const [vamos, setVamos] = useState<number | null>(null);
  useFlechas(
    active,
    () => setVamos((v) => (v === null ? 1 : Math.min(TOTAL_PLANNED, v + 1))),
    () => setVamos((v) => (v === null ? 1 : Math.max(1, v - 1))),
  );
  const unidad = (id: string) => {
    const idx = SECCIONES.map((s, i) => (s.unidad === id ? i : -1)).filter((i) => i >= 0);
    return { x0: INICIOS[idx[0]], x1: INICIOS[idx[idx.length - 1]] + ANCHOS[idx[idx.length - 1]] };
  };

  return (
    <SlideFrame section={["Apertura", "Mapa"]} num={2} caso={step === 2 ? "Adult · Pasajeros · Clima" : null} title="Mapa de la exposición">
      <div style={{ position: "relative", width: W, height: H }}>
        <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          {/* Unidades */}
          {UNIDADES.map((u) => {
            const { x0, x1 } = unidad(u.id);
            return (
              <g key={u.id}>
                <path d={`M${x0},${30} L${x0},${18} L${x1},${18} L${x1},${30}`} fill="none" stroke="var(--line-2)" strokeWidth={1.5} />
                <text x={(x0 + x1) / 2} y={8} textAnchor="middle" className="mono" fontSize={R + 2} letterSpacing="0.08em" fill="var(--text-2)">
                  {u.nombre.toUpperCase()}
                </text>
              </g>
            );
          })}

          {/* Tramos y estaciones */}
          {SECCIONES.map((s, i) => {
            const x0 = INICIOS[i];
            const cx = x0 + ANCHOS[i] / 2;
            const arriba = i % 2 === 0;
            const yNombre = arriba ? Y_LINEA - 78 : Y_LINEA + 54;
            return (
              <motion.g key={s.nombre} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * i, duration: 0.35 }}>
                <line x1={x0} x2={x0 + ANCHOS[i]} y1={Y_LINEA} y2={Y_LINEA} stroke="var(--text-2)" strokeWidth={4} />
                <circle cx={x0 + 4} cy={Y_LINEA} r={8} fill="var(--bg)" stroke="var(--text)" strokeWidth={3} />
                <line x1={cx} x2={cx} y1={Y_LINEA + (arriba ? -12 : 12)} y2={Y_LINEA + (arriba ? -22 : 22)} stroke="var(--line-2)" strokeWidth={1.5} />
                <text x={cx} y={yNombre} textAnchor="middle" fontSize={26} fontWeight={600} fill="var(--text)">
                  {s.letra && <tspan fill="var(--red-2)">{s.letra} · </tspan>}
                  {s.nombre}
                </text>
                <text x={cx} y={yNombre + 28} textAnchor="middle" className="mono" fontSize={R} fill="var(--text-2)">
                  {s.desde}–{s.hasta}
                </text>
              </motion.g>
            );
          })}

          {/* Las tres clases */}
          {step === 1 &&
            CLASES.map((c, i) => {
              const x0 = borde(c.desde, "ini");
              const x1 = borde(c.hasta, "fin");
              return (
                <motion.g key={c.nombre} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 * i }}>
                  <rect x={x0} y={318} width={x1 - x0 - 6} height={40} fill={i === 1 ? "var(--panel)" : "var(--bg-2)"} stroke="var(--line-2)" />
                  <text x={(x0 + x1) / 2} y={346} textAnchor="middle" className="mono" fontSize={R + 2} fill="var(--text)">
                    {c.nombre} · {c.desde}–{c.hasta}
                  </text>
                </motion.g>
              );
            })}

          {/* La misma receta en todo: un hilo que termina en la 62 */}
          {step >= 3 && (
            <g>
              <motion.path
                d={`M${INICIOS[1]},${330} L${X_CIERRE},${330} L${X_CIERRE},${Y_LINEA + 6}`}
                fill="none"
                stroke="var(--red)"
                strokeWidth={2.5}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1 }}
              />
              <text x={INICIOS[1]} y={320 - 10} className="mono" fontSize={R + 2} fill="var(--red-2)">
                modelo → validación → métrica
              </text>
            </g>
          )}

          {/* Vamos aquí */}
          {vamos !== null && (
            <motion.g initial={false} animate={{ x: xDe(vamos) }} transition={{ duration: 0.3 }}>
              <circle cx={0} cy={Y_LINEA} r={13} fill="var(--red)" stroke="var(--bg)" strokeWidth={3} />
            </motion.g>
          )}
        </svg>

        {/* Los tres casos, bajo las partes que los usan */}
        {step === 2 &&
          CASOS.map((c, i) => {
            const x0 = borde(c.desde, "ini");
            const x1 = borde(c.hasta, "fin");
            return (
              <Entra key={c.nombre} style={{ position: "absolute", left: x0, width: x1 - x0 - 20, top: 316, borderTop: "1px solid var(--line-2)", paddingTop: 14 }}>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 * i }}>
                  <div style={{ fontSize: 28, fontWeight: 600 }}>{c.nombre}</div>
                  <div style={{ fontSize: 26, color: "var(--text-2)", lineHeight: 1.35, marginTop: 6 }}>{c.pregunta}</div>
                </motion.div>
              </Entra>
            );
          })}
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 40 }}>
        <div style={{ maxWidth: 1100 }}>
          {step === 0 && (
            <Entra>
              <p style={{ fontSize: 26, lineHeight: 1.45, margin: 0 }}>
                Dos unidades: primero, cómo combinar muchos modelos; después, qué cambia cuando los datos vienen en orden.
              </p>
            </Entra>
          )}
          {step >= 3 && (
            <Entra>
              <p className="takeaway" style={{ margin: 0 }}>
                En cada parte, la misma receta: qué <em>modelo</em>, cómo se <em>valida</em> y con qué se <em>mide</em>. En la 62 lo juntamos.
              </p>
            </Entra>
          )}
        </div>
        <div style={{ display: "grid", gap: 10, justifyItems: "end" }}>
          {vamos !== null && (
            <span className="mono" style={{ fontSize: R, color: "var(--red-2)" }}>
              vamos en la {vamos}
            </span>
          )}
          <Chips
            opciones={[
              { valor: 0, texto: "sin marca" },
              ...CLASES.slice(1).map((c) => ({ valor: c.desde, texto: c.nombre.toLowerCase() })),
            ]}
            valor={vamos ?? 0}
            onChange={(v) => setVamos(v === 0 ? null : v)}
          />
        </div>
      </div>
    </SlideFrame>
  );
}
