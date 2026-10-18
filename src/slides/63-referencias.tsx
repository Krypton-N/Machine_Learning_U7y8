import { motion } from "motion/react";
import { SlideFrame } from "../deck/SlideFrame";
import { COMPLEMENTARIAS, PRINCIPALES, type Cita } from "../deck/referencias";
import type { SlideProps } from "../deck/types";

// Una cita por renglón: año, autores, título y dónde se publicó; a la derecha, en qué diapositivas se usó.
// Es una lista de consulta (no se lee en voz alta): se marca como rótulo.
function Renglon({ c, i, grande }: { c: Cita; i: number; grande: boolean }) {
  return (
    <motion.div
      data-rotulo
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 * i, duration: 0.35 }}
      style={{ display: "grid", gridTemplateColumns: "150px 1fr 180px", gap: 30, borderTop: "1px solid var(--line-2)", padding: grande ? "16px 0" : "12px 0", alignItems: "baseline" }}
    >
      <span className="mono" style={{ fontSize: 22, color: "var(--red-2)" }}>
        {c.anio}
      </span>
      <div style={{ lineHeight: 1.3 }}>
        <span style={{ fontSize: grande ? 26 : 24, fontWeight: 600 }}>{c.autores}</span>
        <span style={{ fontSize: grande ? 26 : 22, fontStyle: "italic", color: "var(--text)" }}> · {c.titulo}</span>
        <div style={{ fontSize: grande ? 22 : 20, color: "var(--text-2)", marginTop: 4 }}>{c.donde}</div>
      </div>
      <span className="mono" style={{ fontSize: 22, color: "var(--text-2)", textAlign: "right" }}>
        {c.diapositivas ? `diap. ${c.diapositivas}` : ""}
      </span>
    </motion.div>
  );
}

// 0 las cinco principales · 1–3 las complementarias, un grupo por clic.
export default function Referencias({ step }: SlideProps) {
  const grupo = step >= 1 ? COMPLEMENTARIAS[Math.min(step, COMPLEMENTARIAS.length) - 1] : null;
  return (
    <SlideFrame section={["Cierre", "Referencias"]} num={63} title="Referencias">
      <span className="label" style={{ display: "block", marginBottom: 14 }}>
        {grupo ? `Complementarias · ${grupo.grupo}` : "Las cinco principales y dónde se usaron"}
      </span>
      <div key={step}>
        {(grupo ? grupo.citas : PRINCIPALES).map((c, i) => (
          <Renglon key={c.titulo} c={c} i={i} grande={!grupo} />
        ))}
      </div>
    </SlideFrame>
  );
}
