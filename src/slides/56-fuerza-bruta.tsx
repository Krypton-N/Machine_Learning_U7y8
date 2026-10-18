import { useState } from "react";
import { ArbolCaminos, type EtapaArbol } from "../components/ArbolCaminos";
import { Lineas } from "../components/Lineas";
import { Chips } from "../components/Piezas";
import { Recap } from "../components/Recap";
import { Entra } from "../components/Reveal";
import { TeX } from "../components/TeX";
import { useFlechas } from "../deck/hooks";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { CLIMA, fmtEntero, fmtP, OBS_EJEMPLO } from "../lib/clima";
import { conteoMultiplicaciones, enumerarCaminos } from "../lib/hmm";

const TXT = { fontSize: 26, lineHeight: 1.45, margin: 0 } as const;
const N = CLIMA.states.length;
const caminos = enumerarCaminos(CLIMA, OBS_EJEMPLO);
const P = caminos.reduce((s, c) => s + c.conjunta, 0);
const TS = [3, 10, 30, 100];
const VELOCIDAD = 1e9; // caminos por segundo: un supuesto, se dice así
const ANIO = 31_557_600; // segundos de un año juliano

const SUPER = "⁰¹²³⁴⁵⁶⁷⁸⁹";
const potencia = (e: number) => `10${String(e).replace(/\d/g, (d) => SUPER[Number(d)])}`;
/** "4.0·10¹³" */
const cientifica = (v: number) => {
  const e = Math.floor(Math.log10(v));
  return `${(v / 10 ** e).toFixed(1)}·${potencia(e)}`;
};

const ETAPAS: Record<number, EtapaArbol> = { 1: "esquema", 2: "barras", 3: "suma", 4: "maximo", 5: "apriori" };

// Un clic, una idea: 0 probabilidad total · 1 el árbol · 2–5 el caso (barras, suma, la más alta, la más probable sin
// ver nada) · 6–7 cuánto crece.
export default function FuerzaBruta({ step, active }: SlideProps) {
  const [T, setT] = useState(100);
  useFlechas(
    active && step >= 6,
    () => setT((t) => TS[Math.min(TS.length - 1, TS.indexOf(t) + 1)]),
    () => setT((t) => TS[Math.max(0, TS.indexOf(t) - 1)]),
  );
  const caso = step >= 2 && step <= 5;
  const caminosT = BigInt(N) ** BigInt(T);
  const mejor = caminos.reduce((a, c) => (c.conjunta > a.conjunta ? c : a));
  const apriori = caminos.reduce((a, c) => (c.pQ > a.pQ ? c : a));
  const nombre = (q: number[]) => q.map((j) => "LS"[j]).join(" ");
  const textos: Record<number, string> = {
    1: "Si no sabemos el clima, sumamos sobre todas las historias posibles: con dos climas, 2 → 4 → 8.",
    2: "Cada historia, con su probabilidad: la multiplicación de la 54.",
    3: "Sumadas, responden la pregunta 1:",
    4: `La más alta, ${nombre(mejor.q)}, explica el ${((100 * mejor.conjunta) / P).toFixed(1)} % del total: ni la mejor historia es segura.`,
    5: `${nombre(apriori.q)} es la más probable sin ver nada (${fmtP(apriori.pQ)}), pero explica mal lo que se vio (${fmtP(apriori.pOdadoQ)}).`,
  };

  return (
    <SlideFrame section={["U8 · Datos secuenciales", "H. HMM"]} num={56} caso={caso ? "Clima" : null} title="Fuerza bruta: sumar todas las historias">
      {step === 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "560px 1fr", gap: 90 }}>
          <Entra>
            <Recap title="probabilidad total">
              <p>Si las historias no se enciman y cubren todos los casos, la probabilidad de lo visto es la suma de lo que aporta cada una.</p>
            </Recap>
          </Entra>
          <Entra style={{ display: "grid", gap: 30, alignContent: "start", paddingTop: 30 }}>
            <div style={{ fontSize: 34 }}>
              <TeX>{"P(O \\mid \\lambda) = \\sum_{Q} P(O, Q \\mid \\lambda)"}</TeX>
            </div>
            <p style={TXT}>Q es una historia completa de estados ocultos.</p>
          </Entra>
        </div>
      )}

      {step >= 1 && step <= 5 && (
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 30, minHeight: 44 }}>
            <p key={step} style={TXT}>
              {textos[step]}
            </p>
            {step === 3 && (
              <span style={{ fontSize: 30 }}>
                <TeX>{`P(O \\mid \\lambda) = ${fmtP(P)}`}</TeX>
              </span>
            )}
          </div>
          {step === 1 && <span className="label">Esquema</span>}
          <div style={{ marginTop: 14 }}>
            <ArbolCaminos modelo={CLIMA} obs={OBS_EJEMPLO} etapa={ETAPAS[step]} ancho={1696} alto={590} />
          </div>
        </div>
      )}

      {step >= 6 && (
        <div style={{ display: "grid", gridTemplateColumns: "980px 1fr", gap: 80 }}>
          <div>
            <span className="label">Cuántas cuentas: historias contra Forward</span>
            <Lineas
              ancho={980}
              alto={520}
              x={[1, 100]}
              y={[0, 32]}
              ticksX={[1, 25, 50, 75, 100]}
              ticksY={[0, 10, 20, 30]}
              fmtY={potencia}
              rotuloX="días T"
              series={[
                { id: "caminos", pts: Array.from({ length: 100 }, (_, t) => [t + 1, (t + 1) * Math.log10(N)]), color: "var(--red)", grosor: 3, etiqueta: "historias Nᵀ" },
                { id: "forward", pts: Array.from({ length: 100 }, (_, t) => [t + 1, Math.log10(N * N * (t + 1))]), color: "var(--data)", grosor: 3, etiqueta: "Forward N²T" },
              ]}
              marcas={[{ x: T, y: T * Math.log10(N), color: "var(--red)" }]}
              margen={{ l: 64, r: 150, t: 16, b: 48 }}
            />
          </div>
          <div style={{ display: "grid", gap: 26, alignContent: "start" }}>
            <Chips opciones={TS.map((v) => ({ valor: v, texto: `T = ${v}` }))} valor={T} onChange={setT} />
            <div>
              <div className="mono" style={{ fontSize: 26, color: "var(--red-2)", wordBreak: "break-all", lineHeight: 1.35 }}>
                {fmtEntero(caminosT)}
              </div>
              <div data-rotulo style={{ fontSize: 20, color: "var(--text-3)", marginTop: 6 }}>
                historias posibles con {T} días
              </div>
            </div>
            <div>
              <div className="mono" style={{ fontSize: 26 }}>{conteoMultiplicaciones(N, T).forward.toLocaleString("es-MX")}</div>
              <div data-rotulo style={{ fontSize: 20, color: "var(--text-3)", marginTop: 6 }}>
                multiplicaciones que hace Forward
              </div>
            </div>
            {step >= 7 && (
              <Entra>
                <p className="takeaway" style={{ margin: 0, fontSize: 28 }}>
                  Con 100 días, a mil millones de historias por segundo: <em>{cientifica(N ** 100 / VELOCIDAD / ANIO)} años</em>. Hay que sumar sin
                  enumerar.
                </p>
              </Entra>
            )}
          </div>
        </div>
      )}
    </SlideFrame>
  );
}
