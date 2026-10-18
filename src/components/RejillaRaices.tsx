import { motion } from "motion/react";

// 100 árboles como una rejilla de 10 × 10: cada celda se pinta según la variable de su primera pregunta.
// Las 3 variables más frecuentes tienen tono propio; el resto va en gris oscuro.

const TONOS = ["#e5383b", "#ff9a8f", "#d0d0d6", "#8e8e96"];

export function RejillaRaices({ porArbol, nombres, lado = 40 }: { porArbol: string[]; nombres: Record<string, string>; lado?: number }) {
  const conteo = new Map<string, number>();
  porArbol.forEach((v) => conteo.set(v, (conteo.get(v) ?? 0) + 1));
  const orden = [...conteo].sort((a, b) => b[1] - a[1]);
  const tono = (v: string) => {
    const k = orden.findIndex(([n]) => n === v);
    return k < TONOS.length ? TONOS[k] : "#3a3a41";
  };
  const otras = orden.slice(TONOS.length);
  return (
    <div style={{ display: "flex", gap: 44, alignItems: "flex-start" }}>
      <svg width={10 * (lado + 4)} height={10 * (lado + 4)} style={{ display: "block", flexShrink: 0 }}>
        {porArbol.map((v, i) => (
          <motion.rect
            key={i}
            x={(i % 10) * (lado + 4)}
            y={Math.floor(i / 10) * (lado + 4)}
            width={lado}
            height={lado}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, fill: tono(v) }}
            transition={{ delay: i * 0.008, duration: 0.3 }}
          />
        ))}
      </svg>
      <div data-rotulo style={{ display: "grid", gap: 12, fontSize: 22 }}>
        {orden.slice(0, TONOS.length).map(([v, c], k) => (
          <div key={v} style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <i style={{ width: 20, height: 20, background: TONOS[k], display: "inline-block" }} />
            <span className="mono" style={{ width: 40, textAlign: "right" }}>
              {c}
            </span>
            <span style={{ color: "var(--text-2)" }}>{nombres[v] ?? v}</span>
          </div>
        ))}
        {otras.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <i style={{ width: 20, height: 20, background: "#3a3a41", display: "inline-block" }} />
            <span className="mono" style={{ width: 40, textAlign: "right" }}>
              {otras.reduce((s, [, c]) => s + c, 0)}
            </span>
            <span style={{ color: "var(--text-3)" }}>otras {otras.length} variables</span>
          </div>
        )}
      </div>
    </div>
  );
}
