import { motion } from "motion/react";
import type { SlideProps } from "../deck/types";

const ease = [0.2, 0.7, 0.2, 1] as const;

// Las dos partes de la exposición, como índice en la portada.
const parts = [
  { n: "U7", name: "Ensambles", items: "Bagging · Random Forest · AdaBoost · Gradient Boosting · XGBoost" },
  { n: "U8", name: "Datos secuenciales", items: "Series de tiempo · AR · MA · ARIMA · SARIMA · Modelos ocultos de Markov" },
];

export default function Portada(_: SlideProps) {
  return (
    <div className="slide" style={{ padding: "72px 112px 88px" }}>
      <header className="slide-head" style={{ borderBottom: "none" }}>
        <span className="section">
          <b>Aprendizaje Máquina</b>&nbsp;&nbsp;/&nbsp;&nbsp;Exposición
        </span>
        <span>ESCOM · IPN</span>
      </header>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, ease }}
          style={{ width: 120, height: 4, background: "var(--red)", transformOrigin: "left" }}
        />
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease }}
          style={{
            margin: "40px 0 0",
            fontSize: 132,
            lineHeight: 0.98,
            fontWeight: 600,
            letterSpacing: "-0.035em",
          }}
        >
          Ensambles y
          <br />
          datos secuenciales
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          style={{ margin: "36px 0 0", fontSize: 30, color: "var(--text-2)", maxWidth: 1100, lineHeight: 1.4 }}
        >
          Cómo combinar muchos modelos en uno mejor que cualquiera de ellos, y cómo modelar datos donde el orden importa.
        </motion.p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64 }}>
        {parts.map((p, i) => (
          <motion.div
            key={p.n}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 + i * 0.12, ease }}
            style={{ borderTop: "1px solid var(--line-2)", paddingTop: 24 }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
              <span className="mono" style={{ color: "var(--red)", fontSize: 20 }}>
                {p.n}
              </span>
              <span style={{ fontSize: 34, fontWeight: 600, letterSpacing: "-0.015em" }}>{p.name}</span>
            </div>
            <div style={{ marginTop: 12, fontSize: 26, color: "var(--text-3)", lineHeight: 1.5 }}>{p.items}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
