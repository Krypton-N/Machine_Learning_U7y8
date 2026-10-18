import { motion } from "motion/react";
import type { CSSProperties, ReactNode } from "react";

// Aparece con un fundido al montarse. Para los bloques que solo existen en un clic (`{step === 3 && <Entra>…}`):
// a diferencia de `Reveal`, no ocupa lugar cuando no se ve.
export function Entra({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <motion.div style={style} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      {children}
    </motion.div>
  );
}

// Aparece cuando la diapositiva llega al paso `at`.
export function Reveal({
  step,
  at,
  children,
  style,
  className,
  y = 14,
}: {
  step: number;
  at: number;
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  y?: number;
}) {
  const on = step >= at;
  return (
    <motion.div
      className={className}
      style={{ ...style, pointerEvents: on ? undefined : "none" }}
      initial={false}
      animate={{ opacity: on ? 1 : 0, y: on ? 0 : y }}
      transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
