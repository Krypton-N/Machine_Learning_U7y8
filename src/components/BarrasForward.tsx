import { motion } from "motion/react";
import { R } from "../deck/tipografia";
import { CORTO, fmtP } from "../lib/clima";
import { pasosForward, type HMM } from "../lib/hmm";
import { estiloEstado } from "./DiagramaClima";

// El mecanismo de Forward con barras, un día por columna. Predecir: cada barra de ayer se parte según su renglón de A
// y los trozos viajan a hoy (conservan el color del estado de donde vienen). Corregir: se encogen por b_j(o_t).
// Cada día se dibuja a la escala de lo que trae (la altura completa es la suma de ayer), rotulada abajo.
// Etapas: 0 = π del día 1 · 1 = α₁ · 2 = día 2 predicho · 3 = α₂ · 4 = día 3 (predecir y corregir) · 5 = la suma.

export function BarrasForward({ modelo, obs, etapa, ancho, alto }: { modelo: HMM; obs: number[]; etapa: number; ancho: number; alto: number }) {
  const { alpha, predicho } = pasosForward(modelo, obs);
  const N = modelo.states.length;
  const T = obs.length;
  const arriba = 70;
  const abajo = 96;
  const H = alto - arriba - abajo;
  const base = arriba + H;
  // Se reserva un poco de ancho a la derecha para la barra de la suma.
  const anchoCol = ancho / (T + 0.4);
  const wb = 92;
  const xBarra = (t: number, j: number) => anchoCol * t + anchoCol / 2 + (j - (N - 1) / 2) * (wb + 34) - wb / 2;
  const sumas = alpha.map((a) => a.reduce((s, v) => s + v, 0));
  const escala = (t: number) => H / (t === 0 ? 1 : sumas[t - 1]);
  // Hasta qué día se ve cada etapa
  const dias = etapa <= 1 ? 1 : etapa <= 3 ? 2 : 3;
  const corregido = (t: number) => (t === 0 ? etapa >= 1 : t === 1 ? etapa >= 3 : etapa >= 4);
  const SUAVE = [0.2, 0.7, 0.2, 1] as const;

  const columnas = Array.from({ length: dias }, (_, t) => t);
  return (
    <svg width={ancho} height={alto} style={{ display: "block", overflow: "visible" }}>
      {columnas.map((t) => {
        const x0 = anchoCol * t + 30;
        const x1 = anchoCol * (t + 1) - 30;
        return (
          <motion.g key={`col${t}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <text x={(x0 + x1) / 2} y={28} textAnchor="middle" fontSize={26} fill="var(--text)">
              día {t + 1} · <tspan fill="var(--red-2)">{modelo.symbols[obs[t]]}</tspan>
            </text>
            {/* La altura completa = lo que trae ese día */}
            <line x1={x0} x2={x1} y1={arriba} y2={arriba} stroke="var(--line-2)" strokeDasharray="4 6" />
            <line x1={x0} x2={x1} y1={base} y2={base} stroke="var(--line-2)" />
            <text x={(x0 + x1) / 2} y={base + 84} textAnchor="middle" className="mono" fontSize={R} fill="var(--text-3)">
              altura completa = {t === 0 ? "1" : fmtP(sumas[t - 1])}
            </text>
            {Array.from({ length: N }, (_, j) => (
              <text key={j} x={xBarra(t, j) + wb / 2} y={base + 34} textAnchor="middle" fontSize={26} fontWeight={600} fill="var(--text-2)">
                {CORTO[j]}
              </text>
            ))}
          </motion.g>
        );
      })}

      {/* Día 1: π que se encoge por b(o₁) */}
      {Array.from({ length: N }, (_, j) => {
        const e = estiloEstado(j);
        const v = corregido(0) ? alpha[0][j] : modelo.pi[j];
        const h = v * escala(0);
        return (
          <g key={`d1${j}`}>
            {corregido(0) && (
              <rect x={xBarra(0, j)} y={base - modelo.pi[j] * H} width={wb} height={modelo.pi[j] * H} fill="none" stroke="var(--line-2)" strokeDasharray="5 6" />
            )}
            <motion.rect
              x={xBarra(0, j)}
              width={wb}
              fill={e.fill}
              stroke={e.stroke}
              strokeWidth={2}
              initial={{ y: base - modelo.pi[j] * H, height: modelo.pi[j] * H }}
              animate={{ y: base - h, height: h }}
              transition={{ duration: 0.8, ease: SUAVE }}
            />
            <Valor x={xBarra(0, j) + wb / 2} y={base - h - 12} texto={fmtP(v)} />
          </g>
        );
      })}

      {/* Días 2 y 3: trozos que vienen de cada estado de ayer */}
      {columnas.slice(1).map((t) => {
        const enDia3 = t === 2;
        return Array.from({ length: N }, (_, j) => {
          const b = modelo.B[j][obs[t]];
          const listo = corregido(t);
          // Fusionados: cuando ya se ve el día siguiente, cada barra de este día toma el color de su estado.
          const fundido = (t === 1 && etapa >= 4) || (t === 2 && etapa >= 5);
          let acumulado = 0;
          const trozos = Array.from({ length: N }, (_, i) => {
            const masa = alpha[t - 1][i] * modelo.A[i][j];
            const alturaPred = masa * escala(t);
            const altura = listo ? alturaPred * b : alturaPred;
            const y = base - acumulado - altura;
            acumulado += altura;
            // De dónde sale: el tramo de la barra de ayer (estado i) que se va a j; abajo el que va a L, arriba el que va a S.
            const hOrigen = alpha[t - 1][i] * escala(t - 1);
            const yOrigen = base - hOrigen * modelo.A[i].slice(0, j + 1).reduce((s, a) => s + a, 0);
            const e = estiloEstado(fundido ? j : i);
            const yPredicho = base - (acumulado - altura) / (listo ? b : 1) - alturaPred;
            return (
              <motion.rect
                key={`t${t}j${j}i${i}`}
                width={wb}
                fill={e.fill}
                stroke={fundido ? e.stroke : estiloEstado(i).stroke}
                strokeWidth={2}
                initial={{ x: xBarra(t - 1, i), y: yOrigen, height: alpha[t - 1][i] * escala(t - 1) * modelo.A[i][j], opacity: 0.9 }}
                animate={
                  enDia3 && etapa === 4
                    ? { x: [null, xBarra(t, j), xBarra(t, j)], y: [null, yPredicho, y], height: [null, alturaPred, altura], opacity: 1 }
                    : { x: xBarra(t, j), y, height: altura, opacity: 1 }
                }
                transition={{ duration: enDia3 && etapa === 4 ? 1.6 : 0.9, times: enDia3 && etapa === 4 ? [0, 0.55, 1] : undefined, ease: SUAVE }}
              />
            );
          });
          const total = (listo ? alpha[t][j] : predicho[t][j]) * escala(t);
          return (
            <g key={`d${t}${j}`}>
              {trozos}
              <Valor x={xBarra(t, j) + wb / 2} y={base - total - 12} texto={fmtP(listo ? alpha[t][j] : predicho[t][j])} retraso={enDia3 && etapa === 4 ? 1.6 : 0.9} />
            </g>
          );
        });
      })}

      {/* La suma del último día: P(O | λ) */}
      {etapa >= 5 && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          {(() => {
            const P = sumas[T - 1];
            const h = P * escala(T - 1);
            const x = anchoCol * T + 4;
            return (
              <>
                <rect x={x} y={base - h} width={56} height={h} fill="var(--red)" />
                <text x={x + 28} y={base + 34} textAnchor="middle" fontSize={26} fontWeight={600} fill="var(--red-2)">
                  Σ
                </text>
                <Valor x={x + 28} y={base - h - 12} texto={fmtP(P)} rojo />
              </>
            );
          })()}
        </motion.g>
      )}
    </svg>
  );
}

function Valor({ x, y, texto, rojo, retraso = 0.6 }: { x: number; y: number; texto: string; rojo?: boolean; retraso?: number }) {
  return (
    <motion.text
      key={texto}
      x={x}
      y={y}
      textAnchor="middle"
      className="mono"
      fontSize={24}
      fill={rojo ? "var(--red-2)" : "var(--text)"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: retraso, duration: 0.3 }}
    >
      {texto}
    </motion.text>
  );
}
