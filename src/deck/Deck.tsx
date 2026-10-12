import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { Stage } from "./Stage";
import { TOTAL_PLANNED, type SlideDef } from "./types";

type Pos = { index: number; step: number };

// La URL guarda la diapositiva y el paso (#/5/2) para recargar sin perder el lugar.
function readHash(slides: SlideDef[]): Pos {
  const [, num, step] = window.location.hash.match(/^#\/(\d+)(?:\/(\d+))?/) ?? [];
  const index = Math.max(0, slides.findIndex((s) => s.num === Number(num)));
  const max = slides[index].steps - 1;
  return { index, step: Math.min(max, Math.max(0, Number(step ?? 0))) };
}

export function Deck({ slides }: { slides: SlideDef[] }) {
  const [pos, setPos] = useState<Pos>(() => readHash(slides));
  const slide = slides[pos.index];

  const next = useCallback(
    () =>
      setPos(({ index, step }) =>
        step < slides[index].steps - 1
          ? { index, step: step + 1 }
          : index < slides.length - 1
            ? { index: index + 1, step: 0 }
            : { index, step },
      ),
    [slides],
  );

  // Al regresar a la diapositiva anterior se muestra completa, no desde cero.
  const prev = useCallback(
    () =>
      setPos(({ index, step }) =>
        step > 0
          ? { index, step: step - 1 }
          : index > 0
            ? { index: index - 1, step: slides[index - 1].steps - 1 }
            : { index, step },
      ),
    [slides],
  );

  useEffect(() => {
    window.history.replaceState(null, "", `#/${slide.num}/${pos.step}`);
  }, [slide.num, pos.step]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement && e.target.type !== "range") return;
      switch (e.key) {
        case "ArrowRight":
        case "PageDown":
        case " ":
          e.preventDefault();
          next();
          break;
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          prev();
          break;
        case "Home":
          setPos({ index: 0, step: 0 });
          break;
        case "End":
          setPos({ index: slides.length - 1, step: slides[slides.length - 1].steps - 1 });
          break;
        case "f":
        case "F":
          if (document.fullscreenElement) document.exitFullscreen();
          else document.documentElement.requestFullscreen();
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, slides]);

  // El cursor se esconde tras 2 s sin moverse para no estorbar en la proyección.
  useEffect(() => {
    let t = 0;
    const wake = () => {
      document.body.classList.remove("idle");
      clearTimeout(t);
      t = window.setTimeout(() => document.body.classList.add("idle"), 2000);
    };
    wake();
    window.addEventListener("mousemove", wake);
    return () => {
      clearTimeout(t);
      window.removeEventListener("mousemove", wake);
    };
  }, []);

  const { Component } = slide;

  return (
    <Stage>
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          style={{ position: "absolute", inset: 0 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Component step={pos.step} active />
        </motion.div>
      </AnimatePresence>

      {slide.steps > 1 && (
        <div className="steps">
          {Array.from({ length: slide.steps }, (_, i) => (
            <span key={i} className={i <= pos.step ? "on" : ""} />
          ))}
        </div>
      )}
      <div className="help">← → avanzar · F pantalla completa</div>
      <div className="progress">
        <div style={{ width: `${(slide.num / TOTAL_PLANNED) * 100}%` }} />
      </div>
    </Stage>
  );
}
