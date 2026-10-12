import { FlujoParalelo, FlujoSecuencial } from "../components/FlujoEnsamble";
import { Reveal } from "../components/Reveal";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { comparacion } from "../lib/adult";
import { linear } from "../lib/scale";

const f1 = (modelo: string) => comparacion.find((c) => c.modelo === modelo)!.f1_macro;

// F1-macro de cada modelo como punto con su desviación entre pliegues. El árbol solo va en ambas columnas como referencia.
function Puntos({ modelos }: { modelos: string[] }) {
  const W = 760;
  const fx = linear([0.72, 0.83], [200, W - 60]);
  return (
    <svg width={W} height={modelos.length * 40 + 30} style={{ display: "block" }}>
      {[0.74, 0.76, 0.78, 0.8, 0.82].map((v) => (
        <g key={v}>
          <line x1={fx(v)} x2={fx(v)} y1={0} y2={modelos.length * 40} stroke="var(--line)" />
          <text x={fx(v)} y={modelos.length * 40 + 20} textAnchor="middle" className="mono" fontSize={14} fill="var(--text-3)">
            {v.toFixed(2)}
          </text>
        </g>
      ))}
      {modelos.map((m, i) => {
        const v = f1(m);
        const base = m === "Árbol de decisión";
        const y = i * 40 + 20;
        return (
          <g key={m}>
            <text x={0} y={y + 6} fontSize={20} fill={base ? "var(--text-3)" : "var(--text)"}>
              {base ? "Árbol solo" : m}
            </text>
            <line x1={fx(v.media - v.desv)} x2={fx(v.media + v.desv)} y1={y} y2={y} stroke={base ? "var(--data-dim)" : "var(--red)"} strokeWidth={3} />
            <circle cx={fx(v.media)} cy={y} r={7} fill={base ? "var(--data-dim)" : "var(--red)"} />
            <text x={fx(v.media) + 16} y={y + 6} className="mono" fontSize={17} fill="var(--text-2)">
              {v.media.toFixed(3)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function ParaleloOSecuencial({ step }: SlideProps) {
  return (
    <SlideFrame
      section={["U7 · Ensambles", "A. Bases"]}
      num={9}
      caso={step >= 2 ? "Adult" : null}
      title="Dos caminos para combinar árboles"
      lede="El árbol solo falla por varianza si es profundo y por sesgo si es muy simple. Cada familia de ensambles ataca uno de los dos problemas."
    >
      <div style={{ display: "grid", gridTemplateColumns: "760px 760px", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 34, fontWeight: 600, letterSpacing: "-0.015em" }}>En paralelo</div>
          <div style={{ fontSize: 22, color: "var(--text-2)", margin: "6px 0 14px" }}>
            Muchos árboles profundos, cada uno por su cuenta. <b style={{ color: "var(--text)" }}>Baja la varianza.</b>
          </div>
          <FlujoParalelo />
          <div className="label" style={{ marginTop: 8 }}>
            Bagging · Random Forest
          </div>
          <Reveal step={step} at={2} style={{ marginTop: 22, borderTop: "1px solid var(--line)", paddingTop: 16 }}>
            <div className="label" style={{ marginBottom: 10 }}>
              Adelanto · F1-macro en Adult · a la derecha es mejor
            </div>
            <Puntos modelos={["Árbol de decisión", "Bagging", "Random Forest"]} />
          </Reveal>
        </div>
        <Reveal step={step} at={1}>
          <div style={{ fontSize: 34, fontWeight: 600, letterSpacing: "-0.015em" }}>En secuencia</div>
          <div style={{ fontSize: 22, color: "var(--text-2)", margin: "6px 0 14px" }}>
            Árboles pequeños, cada uno corrige al anterior. <b style={{ color: "var(--text)" }}>Baja el sesgo.</b>
          </div>
          {step >= 1 && <FlujoSecuencial />}
          <div className="label" style={{ marginTop: 8 }}>
            AdaBoost · Gradient Boosting · XGBoost
          </div>
          <Reveal step={step} at={2} style={{ marginTop: 22, borderTop: "1px solid var(--line)", paddingTop: 16 }}>
            <div className="label" style={{ marginBottom: 10 }}>&nbsp;</div>
            <Puntos modelos={["Árbol de decisión", "AdaBoost", "Gradient Boosting", "XGBoost"]} />
          </Reveal>
        </Reveal>
      </div>
    </SlideFrame>
  );
}
