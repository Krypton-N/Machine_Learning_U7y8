import { Dato } from "../components/Piezas";
import { Entra } from "../components/Reveal";
import { TablaAMano } from "../components/TablaAMano";
import { TeX } from "../components/TeX";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { CLIMA, fmtP, OBS_EJEMPLO } from "../lib/clima";
import { conteoMultiplicaciones, forward } from "../lib/hmm";

const TXT = { fontSize: 26, lineHeight: 1.45, margin: 0 } as const;
const N = CLIMA.states.length;
const T = OBS_EJEMPLO.length;
const alpha = forward(CLIMA, OBS_EJEMPLO);
const P = alpha[T - 1].reduce((s, v) => s + v, 0);
const c3 = conteoMultiplicaciones(N, T);
const c100 = conteoMultiplicaciones(N, 100);
const SUPER = "⁰¹²³⁴⁵⁶⁷⁸⁹";
const cientifica = (n: bigint) => {
  const s = n.toString();
  const e = s.length - 1;
  return `${s[0]}.${s[1]}·10${String(e).replace(/\d/g, (d) => SUPER[Number(d)])}`;
};
const TEXTOS = ["Así se ve Forward en el pizarrón: estados por días. Cada casilla, con su operación.", "Día 1: cómo empieza (π) por lo que hizo (b).", "Día 2: lo de ayer, repartido por A, por lo que hizo hoy.", "Día 3: mismo procedimiento."];

// Un clic, una columna: 0 la plantilla · 1–3 los tres días · 4 la suma · 5 cuántas multiplicaciones.
export default function TablaForward({ step }: SlideProps) {
  const caso = step >= 1;
  return (
    <SlideFrame section={["U8 · Datos secuenciales", "H. HMM"]} num={58} caso={caso ? "Clima" : null} title="La tabla α a mano">
      <TablaAMano modelo={CLIMA} obs={OBS_EJEMPLO} tipo="forward" columnas={Math.min(step, T)} plantilla />
      <div style={{ marginTop: 50, display: "grid", gap: 26 }}>
        {step <= 3 && (
          <Entra key={step} style={{ display: "grid", gap: 26 }}>
            <p style={TXT}>{TEXTOS[step]}</p>
            {step === 0 && (
              <div style={{ fontSize: 30 }}>
                <TeX>{"\\alpha_2(\\text{L}) = \\big[\\alpha_1(\\text{L})\\,a_{\\text{LL}} + \\alpha_1(\\text{S})\\,a_{\\text{SL}}\\big]\\, b_{\\text{L}}(\\text{comprar})"}</TeX>
              </div>
            )}
          </Entra>
        )}
        {step === 4 && (
          <Entra style={{ display: "grid", gap: 20 }}>
            <div style={{ fontSize: 32 }}>
              <TeX>{`P(O \\mid \\lambda) = ${alpha[T - 1].map((v) => fmtP(v)).join(" + ")} = ${fmtP(P)}`}</TeX>
            </div>
            <p style={TXT}>Igual que la suma de las 8 historias de la 51.</p>
          </Entra>
        )}
        {step >= 5 && (
          <Entra style={{ display: "grid", gridTemplateColumns: "260px 260px 1fr", gap: 50, alignItems: "end" }}>
            <Dato valor={c3.forward} rotulo="multiplicaciones con Forward" rojo />
            <Dato valor={c3.bruta.toString()} rotulo="con fuerza bruta" />
            <p className="takeaway" style={{ margin: 0, fontSize: 28 }}>
              Con tres días el ahorro es chico; con cien, <em>{c100.forward.toLocaleString("es-MX")}</em> contra {cientifica(c100.bruta)}.
            </p>
          </Entra>
        )}
      </div>
    </SlideFrame>
  );
}
