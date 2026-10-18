import { motion } from "motion/react";
import { estiloEstado } from "./DiagramaClima";

// Franja de días: arriba el clima de cada día (Lluvioso relleno, Soleado con borde) y, si se dan, abajo las
// actividades. `ocultarEstados` cambia la fila de arriba por "?": lo que ve quien solo escucha al amigo.

export function TiraDias({
  estados,
  obs,
  nombresEstado,
  simbolos,
  celda,
  altoEstado = 60,
  ocultarEstados = false,
  marcasCada,
}: {
  estados: number[];
  obs?: number[];
  nombresEstado?: string[];
  simbolos?: string[];
  /** Ancho de cada día en px. */
  celda: number;
  altoEstado?: number;
  ocultarEstados?: boolean;
  /** Número de día debajo cada tantos días (para tiras largas). */
  marcasCada?: number;
}) {
  const conTexto = celda >= 120;
  const pausa = estados.length > 20 ? 0.012 : 0.1;
  return (
    <div style={{ display: "flex", gap: conTexto ? 10 : 2 }}>
      {estados.map((q, t) => {
        const e = estiloEstado(q);
        return (
          <motion.div
            key={t}
            style={{ width: celda, display: "flex", flexDirection: "column", gap: 8 }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: pausa * t }}
          >
            <div style={{ position: "relative", height: altoEstado }}>
              <motion.div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: e.fill,
                  border: `2px solid ${e.stroke}`,
                  color: e.texto,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 26,
                  fontWeight: 600,
                }}
                initial={false}
                animate={{ opacity: ocultarEstados ? 0 : 1 }}
                transition={{ duration: 0.6 }}
              >
                {conTexto && nombresEstado ? nombresEstado[q] : ""}
              </motion.div>
              {ocultarEstados && (
                <motion.div
                  style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 34, color: "var(--text-2)", border: "2px dashed var(--line-2)" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  ?
                </motion.div>
              )}
            </div>
            {obs && simbolos && (
              <div style={{ height: 60, border: "1px solid var(--line-2)", display: "grid", placeItems: "center", fontSize: 26 }}>{simbolos[obs[t]]}</div>
            )}
            {marcasCada && (t + 1) % marcasCada === 0 && (
              <div className="mono" style={{ fontSize: 20, color: "var(--text-3)", textAlign: "center", whiteSpace: "nowrap", marginLeft: -30, marginRight: -30 }}>
                {t + 1}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
