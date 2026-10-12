import { motion } from "motion/react";

// La receta de todo experimento: Datos → Modelo → Validación → Métrica.
// Aparece completa en la diapositiva 3 y como franja en las que la retoman (26, 30, 48, 62).

export const PASOS_RECETA = ["Datos", "Modelo", "Validación", "Métrica"] as const;

const GENERICO = [
  "Una tabla: cada fila es un ejemplo y cada columna una variable. Una columna, y, es lo que se quiere predecir.",
  "Una regla que aprende, de las filas de entrenamiento, a ir de las variables a y.",
  "Cómo se apartan filas que el modelo no ve, para examinarlo con ellas.",
  "El número con el que se califica ese examen.",
];

export function Receta({
  textos = GENERICO,
  resaltar,
  franja = false,
}: {
  /** Un texto por paso; por omisión, la explicación genérica. */
  textos?: string[];
  /** Índice del paso que va en rojo. */
  resaltar?: number;
  /** Versión compacta de una línea. */
  franja?: boolean;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: franja ? 24 : 40 }}>
      {PASOS_RECETA.map((p, i) => (
        <motion.div
          key={p}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.12, duration: 0.4 }}
          style={{ borderTop: `2px solid ${resaltar === i ? "var(--red)" : "var(--line-2)"}`, paddingTop: franja ? 12 : 22 }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
            <span className="mono" style={{ color: "var(--red)", fontSize: franja ? 16 : 20 }}>
              0{i + 1}
            </span>
            <span style={{ fontSize: franja ? 24 : 36, fontWeight: 600, letterSpacing: "-0.015em" }}>{p}</span>
            {i < 3 && !franja && (
              <span className="mono" style={{ marginLeft: "auto", color: "var(--text-3)", fontSize: 26 }}>
                →
              </span>
            )}
          </div>
          <div style={{ fontSize: franja ? 20 : 24, color: "var(--text-2)", lineHeight: 1.45, marginTop: franja ? 6 : 14 }}>{textos[i]}</div>
        </motion.div>
      ))}
    </div>
  );
}
