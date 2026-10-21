import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { NumeroVisible } from "./numero";
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

  // En el celular: un toque en la mitad izquierda regresa y en la derecha avanza; deslizar el dedo hace lo mismo
  // (hacia la izquierda avanza, como pasar una hoja). Se ignoran los toques sobre botones y otros controles, los
  // gestos que empiezan en una escena 3D (ahí arrastrar gira la cámara), los de dos dedos y los que se hacen con la
  // pantalla acercada (ahí deslizar sirve para recorrerla).
  useEffect(() => {
    const INTERACTIVO = "button, a, input, select, textarea, label, canvas, [role='button'], .chip";
    let inicio: { x: number; y: number; t: number; valido: boolean } | null = null;
    const acercada = () => (window.visualViewport?.scale ?? 1) > 1.01;
    const onStart = (e: TouchEvent) => {
      const objetivo = e.target instanceof Element ? e.target : null;
      inicio =
        e.touches.length === 1
          ? { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now(), valido: !objetivo?.closest(INTERACTIVO) && !acercada() }
          : null;
    };
    const onEnd = (e: TouchEvent) => {
      const i = inicio;
      inicio = null;
      if (!i || !i.valido || e.touches.length > 0) return;
      const fin = e.changedTouches[0];
      const dx = fin.clientX - i.x;
      const dy = fin.clientY - i.y;
      if (Math.abs(dx) > 50 && Math.abs(dx) > 1.5 * Math.abs(dy)) {
        if (dx < 0) next();
        else prev();
      } else if (Math.abs(dx) < 12 && Math.abs(dy) < 12 && Date.now() - i.t < 500) {
        if (fin.clientX < window.innerWidth / 2) prev();
        else next();
      }
    };
    const onCancel = () => (inicio = null);
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd);
    window.addEventListener("touchcancel", onCancel);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchcancel", onCancel);
    };
  }, [next, prev]);

  // En pantallas táctiles la ayuda habla de toques, no de flechas.
  const [tactil] = useState(() => window.matchMedia?.("(pointer: coarse)").matches ?? false);

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
          <NumeroVisible.Provider value={slide.num}>
            <Component step={pos.step} active />
          </NumeroVisible.Provider>
        </motion.div>
      </AnimatePresence>

      {slide.steps > 1 && (
        <div className="steps">
          {Array.from({ length: slide.steps }, (_, i) => (
            <span key={i} className={i <= pos.step ? "on" : ""} />
          ))}
        </div>
      )}
      <div className="help">{tactil ? "toca a la izquierda o a la derecha · o desliza" : "← → avanzar · F pantalla completa"}</div>
      <div className="progress">
        <div style={{ width: `${(slide.num / TOTAL_PLANNED) * 100}%` }} />
      </div>
    </Stage>
  );
}
