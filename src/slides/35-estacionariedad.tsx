import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Barras } from "../components/Barras";
import { Dispersion } from "../components/Dispersion";
import { Chips } from "../components/Piezas";
import { Recap } from "../components/Recap";
import { Reveal } from "../components/Reveal";
import { TeX } from "../components/TeX";
import { useFlechas } from "../deck/hooks";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { media } from "../lib/metricas";
import { ANIOS, pasajeros } from "../lib/pasajeros";
import { mulberry32 } from "../lib/rng";
import { linear } from "../lib/scale";
import { caminata, desviacionMuestral, pearson, simularAR } from "../lib/series";

// ---------- Concepto: el mismo experimento repetido 200 veces (esquema con semilla) ----------
const HISTORIAS = 200;
const PASOS = 100;
const PHI = 0.7;
const K = 5; // separación entre los dos cortes
const SALTO = 5; // cuánto mueven el corte ↑ y ↓
const azar = mulberry32(35);
const ESTACIONARIAS = Array.from({ length: HISTORIAS }, () => simularAR(PHI, PASOS, azar).x);
const PASEOS = Array.from({ length: HISTORIAS }, () => caminata(PASOS, azar));
const DESV_ESTACIONARIA = 1 / Math.sqrt(1 - PHI * PHI);

type Haz = { historias: number[][]; y: [number, number]; desvTeorica: (t: number) => number; corrTeorica: (t: number) => number };
const HACES: Record<"estacionaria" | "paseo", Haz & { titulo: string }> = {
  estacionaria: { titulo: `Estacionaria: cada valor = ${PHI} × el anterior + un choque`, historias: ESTACIONARIAS, y: [-5, 5], desvTeorica: () => DESV_ESTACIONARIA, corrTeorica: () => PHI ** K },
  paseo: { titulo: "No estacionaria: paseo aleatorio (acumula todos los choques)", historias: PASEOS, y: [-30, 30], desvTeorica: (t) => Math.sqrt(t), corrTeorica: (t) => Math.sqrt(t / (t + K)) },
};

const DIBUJADAS = 40;
const CAJAS = 24;

function HazDeHistorias({ haz, t, pares }: { haz: Haz; t: number; pares: boolean }) {
  const W = pares ? 500 : 800;
  const H = 400;
  const fin = pares ? W - 10 : W - 170;
  const fx = linear([1, PASOS], [46, fin]);
  const fy = linear(haz.y, [H - 30, 10]);
  const trazos = useMemo(() => haz.historias.slice(0, DIBUJADAS).map((h) => h.map((v, i) => `${i ? "L" : "M"}${fx(i + 1).toFixed(1)},${fy(v).toFixed(1)}`).join("")), [haz, fin]);
  const enT = haz.historias.map((h) => h[t - 1]);
  const enTK = haz.historias.map((h) => h[t - 1 + K]);
  // Histograma de los 200 valores que hay en el corte.
  const cuentas = new Array<number>(CAJAS).fill(0);
  for (const v of enT) cuentas[Math.max(0, Math.min(CAJAS - 1, Math.floor(((v - haz.y[0]) / (haz.y[1] - haz.y[0])) * CAJAS)))]++;
  const fh = linear([0, Math.max(60, ...cuentas)], [0, 150]);
  const altoCaja = (fy(haz.y[0]) - fy(haz.y[1])) / CAJAS;
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <svg width={W} height={H} style={{ display: "block", overflow: "visible" }}>
        {[haz.y[0], 0, haz.y[1]].map((v) => (
          <g key={v}>
            <line x1={46} x2={fin} y1={fy(v)} y2={fy(v)} stroke="var(--line)" />
            <text x={38} y={fy(v) + 5} textAnchor="end" className="mono" fontSize={20} fill="var(--text-3)">
              {v}
            </text>
          </g>
        ))}
        {trazos.map((d, i) => (
          <path key={i} d={d} fill="none" stroke={i === 0 ? "var(--text)" : "var(--data)"} strokeWidth={i === 0 ? 2 : 1} opacity={i === 0 ? 1 : 0.28} />
        ))}
        <motion.line y1={6} y2={H - 30} stroke="var(--red)" strokeWidth={2.5} initial={false} animate={{ x1: fx(t), x2: fx(t) }} transition={{ duration: 0.35 }} />
        {pares && <motion.line y1={6} y2={H - 30} stroke="var(--red-2)" strokeWidth={2} strokeDasharray="5 5" initial={false} animate={{ x1: fx(t + K), x2: fx(t + K) }} transition={{ duration: 0.35 }} />}
        <text x={fx(t)} y={H - 8} textAnchor="middle" className="mono" fontSize={20} fill="var(--red-2)">
          t = {t}
        </text>
        {!pares &&
          cuentas.map((c, j) => (
            <motion.rect key={j} x={W - 156} y={fy(haz.y[0]) - (j + 1) * altoCaja + 1} height={Math.max(1, altoCaja - 2)} fill="var(--red)" initial={false} animate={{ width: fh(c) }} transition={{ duration: 0.35 }} />
          ))}
      </svg>
      {pares && (
        <Dispersion x={enT} y={enTK} ancho={290} alto={330} dominioX={haz.y} dominioY={haz.y} rotuloX={`valor en t = ${t}`} rotuloY={`en t = ${t + K}`} radio={3} opacidad={0.7} transicion={0.35} />
      )}
    </div>
  );
}

function PanelHaz({ nombre, t, pares }: { nombre: keyof typeof HACES; t: number; pares: boolean }) {
  const haz = HACES[nombre];
  const enT = haz.historias.map((h) => h[t - 1]);
  const r = pearson(
    enT,
    haz.historias.map((h) => h[t - 1 + K]),
  );
  return (
    <div>
      <div style={{ fontSize: 26, marginBottom: 4 }}>{haz.titulo}</div>
      <HazDeHistorias haz={haz} t={t} pares={pares} />
      <div className="mono" style={{ fontSize: 20, marginTop: 6, color: "var(--text-2)" }}>
        {pares ? (
          <>
            correlación entre los dos cortes: <span style={{ color: "var(--red-2)" }}>{r.toFixed(2)}</span> (teórica {haz.corrTeorica(t).toFixed(2)})
          </>
        ) : (
          <>
            en t = {t}: media {media(enT).toFixed(2)} (teórica 0) · desviación <span style={{ color: "var(--red-2)" }}>{desviacionMuestral(enT).toFixed(2)}</span> (teórica{" "}
            {haz.desvTeorica(t).toFixed(2)})
          </>
        )}
      </div>
    </div>
  );
}

// ---------- Caso: una sola historia, vista por ventanas de 12 meses ----------
const M = pasajeros.matriz;
const U = ANIOS.length - 1;
const VENTANAS = {
  original: { media: M.map(media), desv: M.map(desviacionMuestral) },
  log: { media: M.map((f) => media(f.map(Math.log))), desv: M.map((f) => desviacionMuestral(f.map(Math.log))) },
};
type Escala = keyof typeof VENTANAS;
const ESCALAS: { valor: Escala; texto: string }[] = [
  { valor: "original", texto: "original" },
  { valor: "log", texto: "log" },
];
const veces = (v: number[]) => (v[U] / v[0]).toFixed(1);
const ETIQUETAS_ANIO = ANIOS.map((a) => `’${String(a).slice(2)}`);

export default function Estacionariedad({ step, active }: SlideProps) {
  const [t, setT] = useState(10);
  const [escala, setEscala] = useState<Escala>("original");
  useEffect(() => setEscala("original"), [step]);
  useFlechas(
    active && (step === 1 || step === 2),
    () => setT((v) => Math.min(PASOS - K, v + SALTO)),
    () => setT((v) => Math.max(SALTO, v - SALTO)),
  );
  const V = VENTANAS[escala];
  const dec = escala === "log" ? 2 : 1;

  return (
    <SlideFrame
      section={["U8 · Datos secuenciales", "F. Fundamentos de series"]}
      num={35}
      caso={step >= 3 ? "Pasajeros aéreos" : null}
      title="Estacionariedad"
      lede="Una serie es estacionaria si su comportamiento promedio no depende de cuándo la mires."
    >
      {step === 0 && (
        <motion.div key="definicion" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "grid", gridTemplateColumns: "560px 1fr", gap: 80 }}>
          <Recap title="media, varianza y covarianza">
            <p>
              <b>Media:</b> el centro de los datos.
            </p>
            <p style={{ marginTop: 10 }}>
              <b>Varianza:</b> qué tanto se alejan del centro. Su raíz es la desviación.
            </p>
            <p style={{ marginTop: 10 }}>
              <b>Covarianza:</b> si dos cosas suben y bajan juntas. Dividida entre las dos desviaciones es la correlación, entre −1 y 1.
            </p>
          </Recap>
          <div>
            <p style={{ fontSize: 26, margin: "0 0 18px" }}>Estacionaria (en sentido débil) quiere decir tres cosas, para cualquier momento t:</p>
            {[
              { texto: "La misma media.", tex: "\\mathbb{E}[y_t] = \\mu" },
              { texto: "La misma dispersión.", tex: "\\operatorname{Var}(y_t) = \\sigma^2" },
              { texto: "El parecido entre dos momentos solo depende de cuánto están separados, no de dónde están.", tex: "\\operatorname{Cov}(y_t,\\, y_{t+k}) = \\gamma(k)" },
            ].map((c, i) => (
              <Reveal key={i} step={step} at={0} style={{ display: "grid", gridTemplateColumns: "50px 1fr 380px", alignItems: "baseline", gap: 10, padding: "16px 0", borderTop: "1px solid var(--line)" }}>
                <span className="mono" style={{ fontSize: 28, color: "var(--red)" }}>
                  {i + 1}
                </span>
                <span style={{ fontSize: 26, lineHeight: 1.35 }}>{c.texto}</span>
                <span style={{ fontSize: 26 }}>
                  <TeX>{c.tex}</TeX>
                </span>
              </Reveal>
            ))}
          </div>
        </motion.div>
      )}

      {(step === 1 || step === 2) && (
        <motion.div key="historias" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span className="label">
              Esquema · el mismo experimento repetido {HISTORIAS} veces (se dibujan {DIBUJADAS}; una, resaltada)
            </span>
            <span className="label" style={{ color: "var(--text-2)" }}>
              ↑ ↓ mueven el corte
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60 }}>
            <PanelHaz nombre="estacionaria" t={t} pares={step === 2} />
            <PanelHaz nombre="paseo" t={t} pares={step === 2} />
          </div>
          <p style={{ fontSize: 26, lineHeight: 1.4, margin: "20px 0 0" }}>
            {step === 1
              ? "La media y la dispersión se miden a través de las historias, en un mismo instante. En la estacionaria el histograma no cambia al mover el corte; en el paseo se abre cada vez más."
              : `Dos cortes separados ${K} pasos: cada punto es una historia. En la estacionaria el parecido es el mismo en cualquier lugar; en el paseo depende de dónde se corte.`}
          </p>
        </motion.div>
      )}

      {step >= 3 && (
        <motion.div key="caso" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 26 }}>Solo tenemos una historia: se comparan ventanas de 12 meses. Es un diagnóstico, no una prueba.</span>
            <Chips opciones={ESCALAS} valor={escala} onChange={setEscala} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 70 }}>
            {(["media", "desv"] as const).map((k) => (
              <div key={k}>
                <Barras
                  valores={V[k]}
                  etiquetas={ETIQUETAS_ANIO}
                  ancho={810}
                  alto={320}
                  rotulo={`${k === "media" ? "media" : "desviación"} de cada año${escala === "log" ? " (del logaritmo)" : " (miles de pasajeros)"}`}
                  fmtY={(v) => (escala === "log" ? v.toFixed(k === "media" ? 0 : 2) : String(v))}
                  rojo={(i) => i === 0 || i === U}
                  encima={(i) => (i === 0 || i === U ? V[k][i].toFixed(dec) : undefined)}
                />
                <div className="mono" style={{ fontSize: 21, marginTop: 4 }}>
                  de {V[k][0].toFixed(dec)} a {V[k][U].toFixed(dec)}
                  {(escala === "original" || k === "desv") && (
                    <>
                      : se multiplica por <span style={{ color: "var(--red-2)" }}>{veces(V[k])}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Reveal step={step} at={4} style={{ marginTop: 20 }}>
            <p className="takeaway" style={{ margin: 0, fontSize: 26 }}>
              Pasajeros <em>no es estacionaria</em>: la media sube cada año y, además, depende del mes. El logaritmo frena el crecimiento de la dispersión (se
              multiplica por {veces(VENTANAS.log.desv)} en vez de por {veces(VENTANAS.original.desv)}); para la media hace falta diferenciar (36).
            </p>
          </Reveal>
        </motion.div>
      )}
    </SlideFrame>
  );
}
