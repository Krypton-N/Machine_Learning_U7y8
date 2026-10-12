import { useEffect, useRef } from "react";

/** ↑ y ↓ para los controles propios de una diapositiva (solo mientras está activa). */
export function useFlechas(activo: boolean, arriba: () => void, abajo: () => void) {
  const ref = useRef({ arriba, abajo });
  ref.current = { arriba, abajo };
  useEffect(() => {
    if (!activo) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") ref.current.arriba();
      if (e.key === "ArrowDown") ref.current.abajo();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activo]);
}
