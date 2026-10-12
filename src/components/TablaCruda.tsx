import type { CSSProperties } from "react";

// Un dataset tal como llega, antes de tocarlo: lo que mostraría `df.head()` en pandas.
// Con muchas columnas se parte en bloques (`desde`–`hasta`), igual que pandas en una terminal angosta.

export type Crudo = {
  columnas: { nombre: string; tipo: "num" | "cat" }[];
  filas: (string | number | null)[][];
};

const celda: CSSProperties = { padding: "4px 16px", whiteSpace: "nowrap", transition: "color 0.4s, opacity 0.4s, background 0.4s" };

export function TablaCruda({
  datos,
  desde = 0,
  hasta = datos.columnas.length,
  anotada = false,
  quitadas = [],
  objetivo,
  tamano = 20,
}: {
  datos: Crudo;
  /** Bloque de columnas que se dibuja: [desde, hasta). */
  desde?: number;
  hasta?: number;
  /** Marca qué se va a cambiar: columnas que se quitan, la que se predice y los datos faltantes. */
  anotada?: boolean;
  quitadas?: string[];
  objetivo?: string;
  tamano?: number;
}) {
  const cols = datos.columnas.slice(desde, hasta);
  // Qué le pasa a cada columna al preparar los datos (solo se muestra en la versión anotada).
  const marca = (nombre: string): CSSProperties => {
    if (!anotada) return {};
    if (quitadas.includes(nombre)) return { color: "var(--text-3)", textDecoration: "line-through", opacity: 0.5 };
    if (nombre === objetivo) return { color: "var(--red-2)", background: "var(--red-dim)" };
    return {};
  };
  return (
    <table className="mono" style={{ borderCollapse: "collapse", fontSize: tamano, lineHeight: 1.4 }}>
      <thead>
        <tr>
          <th style={{ ...celda, borderBottom: "1px solid var(--line-2)" }} />
          {cols.map((c) => (
            <th key={c.nombre} style={{ ...celda, color: "var(--text-2)", fontWeight: 500, borderBottom: "1px solid var(--line-2)", textAlign: c.tipo === "num" ? "right" : "left", ...marca(c.nombre) }}>
              {c.nombre}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {datos.filas.map((fila, i) => (
          <tr key={i}>
            <td style={{ ...celda, color: "var(--text-3)", textAlign: "right", borderBottom: "1px solid var(--line)" }}>{i}</td>
            {cols.map((c, k) => {
              const v = fila[desde + k];
              const falta = v === null;
              return (
                <td
                  key={c.nombre}
                  style={{
                    ...celda,
                    textAlign: c.tipo === "num" ? "right" : "left",
                    borderBottom: "1px solid var(--line)",
                    ...marca(c.nombre),
                    ...(falta ? { color: anotada ? "var(--red-2)" : "var(--text-3)", background: anotada ? "var(--red-dim)" : "transparent" } : {}),
                  }}
                >
                  {falta ? "NaN" : v}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
