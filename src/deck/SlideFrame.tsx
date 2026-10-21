import { AnimatePresence, motion } from "motion/react";
import { useContext, type ReactNode } from "react";
import { NumeroVisible } from "./numero";
import { TOTAL_PLANNED } from "./types";

type Props = {
  /** Parte y sección, p. ej. ["U7 · Ensambles", "A. Bases"]. */
  section: [string, string];
  num: number;
  title: ReactNode;
  lede?: ReactNode;
  /** Si se indica, aparece la etiqueta del caso de estudio (p. ej. "Adult") en el encabezado. */
  caso?: string | null;
  children?: ReactNode;
};

export function SlideFrame({ section, num, title, lede, caso, children }: Props) {
  const visible = useContext(NumeroVisible) ?? num;
  return (
    <div className="slide">
      <header className="slide-head">
        <span className="section">
          <b>{section[0]}</b>&nbsp;&nbsp;/&nbsp;&nbsp;<span className="tema">{section[1]}</span>
        </span>
        <span className="head-right">
          <AnimatePresence>
            {caso && (
              <motion.span
                key={caso}
                className="caso-tag"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                Caso · {caso}
              </motion.span>
            )}
          </AnimatePresence>
          <span className="num">
            <em>{String(visible).padStart(2, "0")}</em> / {TOTAL_PLANNED}
          </span>
        </span>
      </header>
      <h1 className="slide-title">{title}</h1>
      {lede && <p className="slide-lede">{lede}</p>}
      <div className="slide-body">{children}</div>
    </div>
  );
}
