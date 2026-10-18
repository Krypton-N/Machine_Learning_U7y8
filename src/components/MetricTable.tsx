import type { ReactNode } from "react";

// Tabla de métricas: números tabulares, el mejor de cada columna en rojo. Si `onSeleccionar` está presente, cada
// renglón se puede escoger con un clic (para dibujar su línea en una gráfica al lado).

export type ColumnaMetrica = { clave: string; rotulo: ReactNode; fmt?: (v: number) => string; mejor?: "min" | "max" };
export type FilaMetrica = {
  id: string;
  nombre: ReactNode;
  valores: Record<string, number | null | undefined>;
  /** Texto que se escribe en lugar del número (por ejemplo, "4.2 ± 2.3"); el número sigue decidiendo cuál es el mejor. */
  textos?: Record<string, string>;
};

export function MetricTable({
  columnas,
  filas,
  destacarColumna,
  seleccion,
  onSeleccionar,
  tam = 21,
  anchoNombre,
}: {
  columnas: ColumnaMetrica[];
  filas: FilaMetrica[];
  destacarColumna?: string;
  seleccion?: string;
  onSeleccionar?: (id: string) => void;
  tam?: number;
  anchoNombre?: number;
}) {
  const mejor = Object.fromEntries(
    columnas.map((c) => {
      const vs = filas.map((f) => f.valores[c.clave]).filter((v): v is number => typeof v === "number");
      return [c.clave, c.mejor === "max" ? Math.max(...vs) : c.mejor === "min" ? Math.min(...vs) : undefined];
    }),
  );
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: tam }}>
      <thead>
        <tr style={{ color: "var(--text-3)" }}>
          <th style={{ textAlign: "left", fontWeight: 400, padding: "6px 10px", width: anchoNombre }} />
          {columnas.map((c) => (
            <th key={c.clave} style={{ textAlign: "right", fontWeight: 400, padding: "6px 10px", background: c.clave === destacarColumna ? "var(--red-dim)" : undefined, fontSize: Math.max(20, tam - 3) }}>
              {c.rotulo}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {filas.map((f) => {
          const elegida = f.id === seleccion;
          return (
            <tr
              key={f.id}
              onClick={onSeleccionar ? (e) => (e.stopPropagation(), onSeleccionar(f.id)) : undefined}
              style={{ borderTop: "1px solid var(--line)", cursor: onSeleccionar ? "pointer" : undefined, boxShadow: elegida ? "inset 3px 0 0 var(--red)" : undefined }}
            >
              <td style={{ padding: "7px 10px", color: elegida || !onSeleccionar ? "var(--text)" : "var(--text-2)" }}>{f.nombre}</td>
              {columnas.map((c) => {
                const v = f.valores[c.clave];
                const esMejor = typeof v === "number" && v === mejor[c.clave];
                return (
                  <td
                    key={c.clave}
                    className="mono"
                    style={{ textAlign: "right", padding: "7px 10px", color: esMejor ? "var(--red-2)" : "var(--text)", background: c.clave === destacarColumna ? "var(--red-dim)" : undefined }}
                  >
                    {f.textos?.[c.clave] ?? (typeof v === "number" ? (c.fmt ? c.fmt(v) : String(v)) : "—")}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
