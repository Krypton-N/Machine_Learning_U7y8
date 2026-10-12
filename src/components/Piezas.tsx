import type { CSSProperties, ReactNode } from "react";

// Piezas pequeñas que se repiten en muchas diapositivas.

/** Definición con filete a la izquierda: término en grande y su explicación debajo. */
export function Def({ termino, children, style }: { termino: ReactNode; children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ borderLeft: "1px solid var(--line-2)", paddingLeft: 26, ...style }}>
      <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.01em" }}>{termino}</div>
      <div style={{ fontSize: 24, color: "var(--text-2)", lineHeight: 1.45, marginTop: 8 }}>{children}</div>
    </div>
  );
}

/** Barra apilada de dos clases: gris = no, rojo = sí (gana > 50K). */
export function BarraClases({
  positivos,
  total,
  ancho = 560,
  alto = 18,
  rotulos = true,
}: {
  positivos: number;
  total: number;
  ancho?: number;
  alto?: number;
  rotulos?: boolean;
}) {
  const p = total ? positivos / total : 0;
  return (
    <div style={{ width: ancho }}>
      <div style={{ display: "flex", height: alto, background: "var(--line)" }}>
        <div style={{ width: `${(1 - p) * 100}%`, background: "var(--data-dim)" }} />
        <div style={{ width: `${p * 100}%`, background: "var(--red)" }} />
      </div>
      {rotulos && (
        <div className="mono" style={{ display: "flex", justifyContent: "space-between", fontSize: 16, marginTop: 6, color: "var(--text-3)" }}>
          <span>no · {((1 - p) * 100).toFixed(1)} %</span>
          <span style={{ color: "var(--red-2)" }}>gana &gt; 50K · {(p * 100).toFixed(1)} %</span>
        </div>
      )}
    </div>
  );
}

/** Botones de opción (uno activo). Después del clic sueltan el foco para que el espacio siga avanzando. */
export function Chips<T extends string | number>({
  opciones,
  valor,
  onChange,
}: {
  opciones: { valor: T; texto: ReactNode }[];
  valor: T;
  onChange: (v: T) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      {opciones.map((o) => (
        <button key={String(o.valor)} className="chip" aria-pressed={o.valor === valor} onClick={(e) => (onChange(o.valor), e.currentTarget.blur())}>
          {o.texto}
        </button>
      ))}
    </div>
  );
}

/** Botón de acción (no de opción). */
export function Boton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button className="chip" onClick={(e) => (onClick(), e.currentTarget.blur())}>
      {children}
    </button>
  );
}

/** Número grande con su rótulo: para lecturas en vivo. */
export function Dato({ valor, rotulo, rojo }: { valor: ReactNode; rotulo: ReactNode; rojo?: boolean }) {
  return (
    <div>
      <div className="mono" style={{ fontSize: 40, lineHeight: 1.1, color: rojo ? "var(--red-2)" : "var(--text)" }}>
        {valor}
      </div>
      <div style={{ fontSize: 20, color: "var(--text-3)", marginTop: 4 }}>{rotulo}</div>
    </div>
  );
}

export const pct = (v: number, d = 1) => `${(v * 100).toFixed(d)} %`;
