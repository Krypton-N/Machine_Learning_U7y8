import { motion } from "motion/react";
import { useId } from "react";
import { R } from "../deck/tipografia";
import { fmtP } from "../lib/clima";
import type { HMM } from "../lib/hmm";

// Diagrama de estados del clima: Lluvioso y Soleado con sus transiciones (A), cómo empieza (π) y lo que produce cada
// uno (B). El grosor de cada flecha es su probabilidad. Lluvioso = cuadro relleno gris claro; Soleado = solo borde.

/** Estilo de un estado del clima (0 = Lluvioso, 1 = Soleado), el mismo en todas las piezas del HMM. */
export const estiloEstado = (j: number) =>
  j === 0
    ? { fill: "var(--data)", stroke: "var(--data)", texto: "var(--bg)" }
    : { fill: "var(--panel)", stroke: "var(--data)", texto: "var(--text)" };

const grosor = (p: number) => 1.5 + 12 * p;

export function DiagramaClima({
  modelo,
  mostrar,
  ancho,
  alto,
  camino,
  emisionesDe = [0, 1],
  resaltarFila = null,
}: {
  modelo: HMM;
  mostrar: { pi?: boolean; A?: boolean; B?: boolean };
  ancho: number;
  alto: number;
  /** Una ficha roja recorre estos estados, uno cada 0.7 s, al montarse. */
  camino?: number[];
  /** De qué estados se dibujan las emisiones (para mostrarlas por partes). */
  emisionesDe?: number[];
  /** Estado cuyas flechas (las de A si no hay B; las de B si las hay) van en rojo. */
  resaltarFila?: number | null;
}) {
  const id = useId().replace(/:/g, "");
  const w = 220;
  const h = 84;
  const dx = Math.min(ancho * 0.24, 280);
  const xs = [ancho / 2 - dx, ancho / 2 + dx];
  // Con A, los lazos necesitan ≈ 170 px arriba de los cuadros.
  const y = mostrar.B ? (mostrar.A ? 215 : 60) : alto * 0.62;
  const yAct = alto - 40;
  const gris = "var(--text-2)";

  const marcador = (k: string, color: string) => (
    <marker id={`${id}-${k}`} viewBox="0 0 10 10" refX={8} refY={5} markerWidth={18} markerHeight={18} markerUnits="userSpaceOnUse" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill={color} />
    </marker>
  );
  const rotulo = (x: number, yy: number, texto: string, color = "var(--text)") => (
    <g>
      <rect x={x - texto.length * R * 0.33 - 8} y={yy - R + 2} width={texto.length * R * 0.66 + 16} height={R + 10} fill="var(--bg)" />
      <text x={x} y={yy + 4} textAnchor="middle" className="mono" fontSize={R + 2} fill={color}>
        {texto}
      </text>
    </g>
  );
  const traza = (key: string, d: string, p: number, rojo: boolean, retraso: number) => (
    <motion.path
      key={key}
      d={d}
      fill="none"
      stroke={rojo ? "var(--red)" : gris}
      strokeWidth={grosor(p)}
      markerEnd={`url(#${id}-${rojo ? "r" : "g"})`}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.55, delay: retraso }}
    />
  );

  const arribaNodo = y - h / 2;
  const abajoNodo = y + h / 2;
  const rojoA = (i: number) => !mostrar.B && resaltarFila === i;

  // Posición de la ficha sobre cada estado (esquina superior derecha del cuadro)
  const fichaX = (j: number) => xs[j] + w / 2 - 6;
  const fichaY = arribaNodo + 6;

  return (
    <svg width={ancho} height={alto} style={{ display: "block", overflow: "visible" }}>
      <defs>
        {marcador("g", gris)}
        {marcador("r", "var(--red)")}
      </defs>

      {mostrar.A && (
        <g>
          {/* Autolazos (se quedan igual) */}
          {[0, 1].map((i) => {
            const x = xs[i];
            const d = `M${x - 46},${arribaNodo - 2} C${x - 110},${arribaNodo - 150} ${x + 110},${arribaNodo - 150} ${x + 46},${arribaNodo - 6}`;
            return (
              <g key={`lazo${i}`}>
                {traza(`lazo${i}`, d, modelo.A[i][i], rojoA(i), 0.15 * i)}
                {rotulo(x, arribaNodo - 128, fmtP(modelo.A[i][i]), rojoA(i) ? "var(--red-2)" : "var(--text)")}
              </g>
            );
          })}
          {/* L → S por arriba, S → L por abajo */}
          {traza("ls", `M${xs[0] + w / 2 + 4},${y - 20} Q${ancho / 2},${y - 80} ${xs[1] - w / 2 - 8},${y - 20}`, modelo.A[0][1], rojoA(0), 0.3)}
          {rotulo(ancho / 2, y - 62, fmtP(modelo.A[0][1]), rojoA(0) ? "var(--red-2)" : "var(--text)")}
          {traza("sl", `M${xs[1] - w / 2 - 4},${y + 20} Q${ancho / 2},${y + 80} ${xs[0] + w / 2 + 8},${y + 20}`, modelo.A[1][0], rojoA(1), 0.45)}
          {rotulo(ancho / 2, y + 74, fmtP(modelo.A[1][0]), rojoA(1) ? "var(--red-2)" : "var(--text)")}
        </g>
      )}

      {mostrar.pi && (
        <g>
          {[0, 1].map((i) => {
            const lado = i === 0 ? -1 : 1;
            const x0 = xs[i] + lado * (w / 2 + 130);
            const x1 = xs[i] + lado * (w / 2 + 6);
            return (
              <g key={`pi${i}`}>
                {traza(`pi${i}`, `M${x0},${y} L${x1},${y}`, modelo.pi[i], false, 0.1)}
                <text x={x0} y={y - 18} textAnchor={i === 0 ? "start" : "end"} className="mono" fontSize={R + 2} fill="var(--text)">
                  π = {fmtP(modelo.pi[i])}
                </text>
              </g>
            );
          })}
        </g>
      )}

      {mostrar.B && (
        <g>
          {modelo.symbols.map((s, k) => {
            const xa = ancho / 2 + (k - 1) * Math.min(330, ancho * 0.3);
            return (
              <g key={s}>
                <rect x={xa - 100} y={yAct - 34} width={200} height={68} fill="none" stroke="var(--line-2)" strokeWidth={1.5} />
                <text x={xa} y={yAct + 9} textAnchor="middle" fontSize={26} fill="var(--text)">
                  {s}
                </text>
              </g>
            );
          })}
          {emisionesDe.map((i, n) =>
            modelo.symbols.map((s, k) => {
              const xa = ancho / 2 + (k - 1) * Math.min(330, ancho * 0.3);
              const x0 = xs[i] + (k - 1) * 46;
              const y0 = abajoNodo + 4;
              const y1 = yAct - 40;
              const p = modelo.B[i][k];
              const rojo = resaltarFila === i;
              // El número va a un cuarto del camino, cerca de su estado, para que no se mezcle con los del otro.
              const lx = x0 + (xa - x0) * 0.24;
              const ly = y0 + (y1 - y0) * 0.24;
              return (
                <g key={`${i}-${s}`}>
                  {traza(`e${i}${k}`, `M${x0},${y0} L${xa + (i === 0 ? -24 : 24)},${y1}`, p, rojo, 0.5 * n + 0.1 * k)}
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 * n + 0.1 * k + 0.4 }}>
                    {rotulo(lx, ly + 8, fmtP(p), rojo ? "var(--red-2)" : "var(--text)")}
                  </motion.g>
                </g>
              );
            }),
          )}
        </g>
      )}

      {[0, 1].map((j) => {
        const e = estiloEstado(j);
        return (
          <g key={`n${j}`}>
            <rect x={xs[j] - w / 2} y={arribaNodo} width={w} height={h} fill={e.fill} stroke={e.stroke} strokeWidth={2} />
            <text x={xs[j]} y={y + 10} textAnchor="middle" fontSize={28} fontWeight={600} fill={e.texto}>
              {modelo.states[j]}
            </text>
          </g>
        );
      })}

      {camino && camino.length > 0 && ficha(camino)}
    </svg>
  );

  // La ficha salta por la flecha que toca: por arriba del lazo si se queda, por la curva si cambia de estado.
  function ficha(camino: number[]) {
    const kx = [fichaX(camino[0])];
    const ky = [fichaY];
    for (let t = 1; t < camino.length; t++) {
      const [a, b] = [camino[t - 1], camino[t]];
      if (a === b) {
        kx.push(xs[a]);
        ky.push(arribaNodo - 112);
      } else {
        kx.push(ancho / 2);
        ky.push(a === 0 ? y - 50 : y + 50);
      }
      kx.push(fichaX(b));
      ky.push(fichaY);
    }
    return (
      <motion.circle
        key={camino.join("")}
        r={15}
        fill="var(--red)"
        stroke="var(--bg)"
        strokeWidth={3}
        initial={{ cx: kx[0], cy: ky[0], opacity: 0 }}
        animate={{ cx: kx, cy: ky, opacity: 1 }}
        transition={{ duration: 0.7 * (camino.length - 1) + 0.3, ease: "easeInOut" }}
      />
    );
  }
}
