import { motion } from "motion/react";
import { R } from "../deck/tipografia";
import { CORTO, fmtP } from "../lib/clima";
import { enumerarCaminos, type HMM } from "../lib/hmm";
import { estiloEstado } from "./DiagramaClima";

// Fuerza bruta: el árbol de las Nᵀ historias posibles y, a la derecha de cada hoja, la barra de P(O, Q).
// Etapas: "esquema" (sin datos) · "arbol" (hojas con nombre) · "barras" · "suma" (las barras se apilan en P(O)) ·
// "maximo" (la más alta en rojo) · "apriori" (la más probable sin ver nada, resaltada).

export type EtapaArbol = "esquema" | "arbol" | "barras" | "suma" | "maximo" | "apriori";

export function ArbolCaminos({ modelo, obs, etapa, ancho, alto }: { modelo: HMM; obs: number[]; etapa: EtapaArbol; ancho: number; alto: number }) {
  const T = obs.length;
  const caminos = enumerarCaminos(modelo, obs);
  const P = caminos.reduce((s, c) => s + c.conjunta, 0);
  const mejor = caminos.reduce((a, c) => (c.conjunta > a.conjunta ? c : a));
  const apriori = caminos.reduce((a, c) => (c.pQ > a.pQ ? c : a));
  const nombre = (q: number[]) => q.map((j) => CORTO[j]).join(" ");

  const filas = caminos.length;
  const arriba = 10;
  const altoFila = (alto - arriba - 90) / filas;
  const yHoja = (k: number) => arriba + (k + 0.5) * altoFila;
  const xNivel = (n: number) => 30 + n * 150;
  const xNombre = xNivel(T) + 60;
  const xBarra = xNombre + 120;
  const anchoTotal = ancho - xBarra - 240; // a la derecha cabe "Σ = 0.033612"
  const escala = anchoTotal / P;
  const yTotal = arriba + filas * altoFila + 46;
  const conDatos = etapa !== "esquema";
  const conBarras = etapa !== "esquema" && etapa !== "arbol";

  // Nodos del árbol: en el nivel n hay N^n nodos; cada uno se centra sobre sus hojas.
  const N = modelo.states.length;
  const nodos: { n: number; k: number; j: number; y: number }[] = [];
  for (let n = 1; n <= T; n++) {
    const porNodo = N ** (T - n);
    for (let k = 0; k < N ** n; k++) nodos.push({ n, k, j: k % N, y: (yHoja(k * porNodo) + yHoja((k + 1) * porNodo - 1)) / 2 });
  }
  const yRaiz = (yHoja(0) + yHoja(filas - 1)) / 2;
  const padre = (n: number, k: number) => (n === 1 ? yRaiz : nodos.find((o) => o.n === n - 1 && o.k === Math.floor(k / N))!.y);
  const retraso = (n: number) => (etapa === "esquema" ? 0.5 * (n - 1) : 0);

  let acumulado = 0;
  return (
    <svg width={ancho} height={alto} style={{ display: "block", overflow: "visible" }}>
      <circle cx={xNivel(0)} cy={yRaiz} r={8} fill="var(--text-2)" />
      {nodos.map(({ n, k, j, y }) => {
        const e = estiloEstado(j);
        return (
          <motion.g key={`${n}-${k}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: retraso(n) }}>
            <line x1={xNivel(n - 1) + (n === 1 ? 8 : 26)} y1={padre(n, k)} x2={xNivel(n) - 26} y2={y} stroke="var(--line-2)" strokeWidth={2} />
            <rect x={xNivel(n) - 26} y={y - 19} width={52} height={38} fill={conDatos ? e.fill : "var(--panel)"} stroke={conDatos ? e.stroke : "var(--text-3)"} strokeWidth={2} />
            <text x={xNivel(n)} y={y + 8} textAnchor="middle" fontSize={22} fontWeight={600} fill={conDatos ? e.texto : "var(--text-2)"}>
              {conDatos ? CORTO[j] : `s${j === 0 ? "₁" : "₂"}`}
            </text>
          </motion.g>
        );
      })}

      {caminos.map((c, k) => {
        const y = yHoja(k);
        const w = c.conjunta * escala;
        const esMejor = c === mejor;
        const esApriori = c === apriori;
        const opac = etapa === "maximo" ? (esMejor ? 1 : 0.3) : etapa === "apriori" ? (esApriori ? 1 : 0.3) : 1;
        const color = etapa === "maximo" && esMejor ? "var(--red)" : etapa === "apriori" && esApriori ? "var(--text)" : "var(--data)";
        const x0 = acumulado * escala;
        acumulado += c.conjunta;
        const enSuma = etapa === "suma";
        return (
          <g key={k}>
            {conDatos && (
              <motion.text x={xNombre} y={y + 8} className="mono" fontSize={24} fill="var(--text)" initial={{ opacity: 0 }} animate={{ opacity: opac }}>
                {nombre(c.q)}
              </motion.text>
            )}
            {conBarras && (
              <>
                <motion.rect
                  height={altoFila * 0.56}
                  fill={color}
                  initial={{ x: xBarra, y: y - altoFila * 0.28, width: 0, opacity: 1 }}
                  animate={{
                    x: enSuma ? xBarra + x0 : xBarra,
                    y: enSuma ? yTotal - altoFila * 0.32 : y - altoFila * 0.28,
                    width: w,
                    opacity: enSuma ? 1 : opac,
                  }}
                  stroke={enSuma ? "var(--bg)" : "none"}
                  strokeWidth={2}
                  transition={{ duration: 0.7, delay: enSuma ? 0.06 * k : etapa === "barras" ? 0.08 * k : 0, ease: [0.2, 0.7, 0.2, 1] }}
                />
                <motion.text
                  x={xBarra + w + 12}
                  y={y + 8}
                  className="mono"
                  fontSize={22}
                  fill={etapa === "maximo" && esMejor ? "var(--red-2)" : "var(--text-2)"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: enSuma ? 0.25 : opac }}
                  transition={{ delay: etapa === "barras" ? 0.08 * k + 0.4 : 0 }}
                >
                  {fmtP(c.conjunta)}
                  {etapa === "maximo" && esMejor && `  ·  ${((100 * c.conjunta) / P).toFixed(1)} % del total`}
                  {etapa === "apriori" && esApriori && `  ·  sin ver nada ${fmtP(c.pQ)} · explica lo visto ${fmtP(c.pOdadoQ)}`}
                </motion.text>
              </>
            )}
          </g>
        );
      })}

      {etapa === "suma" && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>
          <line x1={xBarra} x2={xBarra + P * escala} y1={yTotal - altoFila * 0.32 - 14} y2={yTotal - altoFila * 0.32 - 14} stroke="var(--red)" strokeWidth={2} />
          <text x={xBarra + P * escala + 14} y={yTotal + 6} className="mono" fontSize={R + 6} fill="var(--red-2)">
            Σ = {fmtP(P)}
          </text>
        </motion.g>
      )}
    </svg>
  );
}
