import { useEffect, useState } from "react";
import { Barras } from "../components/Barras";
import { Correlogram } from "../components/Correlogram";
import { Entra } from "../components/Reveal";
import { TeX } from "../components/TeX";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { modelos, TRANSFORMACIONES_ENT } from "../lib/pasajeros";
import { acf, acfTeorica, pesosPi, pesosPsi } from "../lib/series";

// ---------- Concepto: tres ecos y la parsimonia, todo teórico ----------
const PHI = 0.7;
const THETA = 0.5;
const K_ECO = 12;
const ECOS = [
  { titulo: `AR(1), φ = ${PHI}`, psi: pesosPsi([PHI], [], K_ECO) },
  { titulo: `MA(1), θ = ${THETA}`, psi: pesosPsi([], [THETA], K_ECO) },
  { titulo: `ARMA(1,1), los dos`, psi: pesosPsi([PHI], [THETA], K_ECO) },
];
const K_PI = 10;
const PI = pesosPi([PHI], [THETA], K_PI);
const UMBRAL = 0.05;
/** Cuántos coeficientes necesita el AR puro antes de que el siguiente pese menos que el umbral. */
const HACEN_FALTA = PI.findIndex((v) => Math.abs(v) < UMBRAL);

// ---------- Caso: crecimiento anual (∇₁₂ log) con 1950–1959 ----------
const Z = TRANSFORMACIONES_ENT.d12log.valores;
const K = 20;
const ACF_Z = acf(Z, K);
const CORTO = 8; // hasta dónde siguen a las barras los modelos de dos coeficientes
type Id = "MA(1)" | "AR(1)" | "ARMA(1,1)" | "AR(2)";
const IDS: Id[] = ["MA(1)", "AR(1)", "ARMA(1,1)", "AR(2)"];
// Las barras fuera de la banda ya van en rojo: las curvas se distinguen por tono (blanco los de dos coeficientes,
// gris los de uno) y por trazo (continuo o punteado).
const ESTILO: Record<Id, { color: string; guion?: string }> = {
  "MA(1)": { color: "var(--text-3)" },
  "AR(1)": { color: "var(--text-3)", guion: "7 6" },
  "ARMA(1,1)": { color: "var(--text)" },
  "AR(2)": { color: "var(--text)", guion: "7 6" },
};

function Muestra({ id }: { id: Id }) {
  return (
    <svg width={34} height={10} style={{ marginRight: 10, verticalAlign: "middle" }}>
      <line x1={0} x2={34} y1={5} y2={5} stroke={ESTILO[id].color} strokeWidth={3} strokeDasharray={ESTILO[id].guion} />
    </svg>
  );
}
const TEORICAS = Object.fromEntries(
  IDS.map((id) => {
    const m = modelos.arma_crecimiento.find((x) => x.id === id)!;
    return [id, { m, rho: acfTeorica(m.ar, m.ma, K) }];
  }),
) as Record<Id, { m: (typeof modelos.arma_crecimiento)[number]; rho: number[] }>;
/** Distancia media (raíz del promedio de las diferencias al cuadrado) entre la ACF teórica y las barras. */
const distancia = (id: Id, desde: number, hasta: number) => {
  const d = Array.from({ length: hasta - desde + 1 }, (_, i) => (TEORICAS[id].rho[desde + i] - ACF_Z[desde + i]) ** 2);
  return Math.sqrt(d.reduce((s, v) => s + v, 0) / d.length);
};
const f2 = (v: number) => v.toFixed(2).replace("-", "−");
const f3 = (v: number) => v.toFixed(3).replace("-", "−");
const TXT = { fontSize: 26, lineHeight: 1.42, margin: 0 } as const;
const ROJO = { color: "var(--red-2)" };

// Un clic, una idea: 0 los tres ecos; 1 la parsimonia; 2–4 el caso; 5 el cierre.
export default function ARMA({ step }: SlideProps) {
  const [encendidos, setEncendidos] = useState<Id[]>(["MA(1)", "AR(1)"]);
  useEffect(() => {
    setEncendidos(step >= 3 ? ["ARMA(1,1)", "AR(2)"] : ["MA(1)", "AR(1)"]);
  }, [step]);
  const alternar = (id: Id) => setEncendidos((e) => (e.includes(id) ? e.filter((x) => x !== id) : [...e, id]));
  const caso = step >= 2;

  return (
    <SlideFrame
      section={["U8 · Datos secuenciales", "G. Modelos de series"]}
      num={44}
      caso={caso ? "Pasajeros aéreos" : null}
      title="ARMA(p,q): memoria larga y rebote corto"
      lede="Un ARMA junta las dos ideas: el valor de hoy depende de valores pasados (AR) y de choques recientes (MA)."
    >
      {step === 0 && (
        <Entra>
          <div style={{ fontSize: 30 }}>
            <TeX>{"x_t = c + \\sum_{j=1}^{p} \\phi_j\\, x_{t-j} + \\varepsilon_t + \\sum_{j=1}^{q} \\theta_j\\, \\varepsilon_{t-j}"}</TeX>
          </div>
          <span className="label natural" style={{ display: "block", marginTop: 14 }}>
            ESQUEMA · TEÓRICO: EL ECO DE UN CHOQUE EN CADA MODELO
          </span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28, marginTop: 6 }}>
            {ECOS.map((e, i) => (
              <Barras
                key={e.titulo}
                valores={e.psi}
                etiquetas={e.psi.map((_, k) => (k % 2 === 0 ? String(k) : ""))}
                ancho={546}
                alto={330}
                y={[0, 1.25]}
                pasoY={0.5}
                fmtY={(v) => v.toFixed(1)}
                rotulo={e.titulo}
                rojo={i === 2 ? (k) => k === 1 : undefined}
                encima={i === 2 ? (k) => (k === 1 ? `ψ₁ = φ + θ = ${(PHI + THETA).toFixed(1)}` : undefined) : undefined}
              />
            ))}
          </div>
          <p style={{ ...TXT, marginTop: 14 }}>
            El MA ajusta <span style={ROJO}>el primer rebote</span>; el AR decide cómo se apaga después.
          </p>
        </Entra>
      )}

      {step === 1 && (
        <Entra style={{ display: "grid", gridTemplateColumns: "1040px 1fr", gap: 64 }}>
          <div>
            <span className="label">Esquema · el mismo ARMA(1,1) escrito como AR puro</span>
            <Barras
              valores={PI}
              etiquetas={PI.map((_, k) => String(k + 1))}
              ancho={1040}
              alto={440}
              y={[-1, 1.5]}
              pasoY={0.5}
              fmtY={(v) => v.toFixed(1)}
              rotulo="el peso de cada valor anterior"
              rojo={(k) => k < HACEN_FALTA}
              encima={(k) => (k < HACEN_FALTA + 1 ? PI[k].toFixed(3).replace(/0+$/, "").replace("-", "−") : undefined)}
            />
          </div>
          <div style={{ paddingTop: 40 }}>
            <p style={TXT}>
              <b>Parsimonia.</b> Para imitar ese eco con un AR puro hacen falta <span style={ROJO}>{HACEN_FALTA} coeficientes</span> antes de que el siguiente pese menos de{" "}
              {UMBRAL}.
            </p>
            <p style={{ ...TXT, marginTop: 18 }}>El ARMA usa 2.</p>
          </div>
        </Entra>
      )}

      {caso && (
        <div style={{ display: "grid", gridTemplateColumns: "1040px 1fr", gap: 64 }}>
          <div>
            <span className="label">ACF del crecimiento anual · líneas: teórica de cada modelo ajustado</span>
            <Correlogram
              valores={ACF_Z}
              n={Z.length}
              ancho={1040}
              alto={500}
              cada={2}
              y={[-0.5, 1]}
              rotular={step >= 4 ? [12] : [1]}
              atenuar={step === 4 ? (k) => k <= CORTO : undefined}
              teorica={IDS.filter((id) => encendidos.includes(id)).map((id) => ({ id, valores: TEORICAS[id].rho, ...ESTILO[id], linea: true }))}
            />
          </div>
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {IDS.map((id) => (
                <button key={id} className="chip" aria-pressed={encendidos.includes(id)} onClick={(e) => (alternar(id), e.currentTarget.blur())} style={{ textAlign: "left" }}>
                  <Muestra id={id} />
                  {id}
                </button>
              ))}
            </div>
            <div style={{ marginTop: 28 }}>
              {step === 2 && (
                <Entra>
                  <p style={TXT}>
                    <b>MA(1)</b>: su ρ₁ es {f2(TEORICAS["MA(1)"].rho[1])} contra {f2(ACF_Z[1])} observado. Un MA(1) nunca pasa de 0.5: no alcanza.
                  </p>
                  <p style={{ ...TXT, marginTop: 18 }}>
                    <b>AR(1)</b>: empieza bien, pero baja más rápido que las barras.
                  </p>
                </Entra>
              )}
              {step === 3 && (
                <Entra>
                  <p style={TXT}>
                    <b style={ROJO}>ARMA(1,1) y AR(2)</b> siguen a las barras hasta el rezago {CORTO}: distancia media {f3(distancia("ARMA(1,1)", 1, CORTO))} y{" "}
                    {f3(distancia("AR(2)", 1, CORTO))}, contra {f3(distancia("AR(1)", 1, CORTO))} del AR(1).
                  </p>
                  <p style={{ ...TXT, marginTop: 18 }}>Dos coeficientes bastan, de una forma o de otra.</p>
                </Entra>
              )}
              {step === 4 && (
                <Entra>
                  <p style={TXT}>
                    Después, ninguno: las barras se vuelven negativas y la del 12 sale de la banda ({f2(ACF_Z[12])}).
                  </p>
                  <p style={{ ...TXT, marginTop: 18 }}>
                    Eso no es de corto plazo: <span style={ROJO}>es del año</span>. Diapositiva 45.
                  </p>
                </Entra>
              )}
              {step >= 5 && (
                <Entra>
                  <p className="takeaway" style={{ margin: 0 }}>
                    Mezclar AR y MA da formas que cada uno solo imita con muchos coeficientes. <em>En pasajeros, dos bastan para el corto plazo.</em> Cómo elegir: 46.
                  </p>
                </Entra>
              )}
            </div>
          </div>
        </div>
      )}
    </SlideFrame>
  );
}
