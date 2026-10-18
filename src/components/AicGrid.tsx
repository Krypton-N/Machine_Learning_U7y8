// Rejilla de los 16 SARIMA(p,1,q)(P,1,Q)₁₂: renglones = parte de meses (p, q), columnas = parte de años (P, Q).
// Cada celda dice cuánto le falta al modelo para igualar al mejor (Δ del criterio). El mínimo lleva borde rojo y
// los que quedan a menos de 2 se sombrean: diferencias así no distinguen modelos.

export type CeldaAic = { orden: number[]; estacional: number[]; aic: number; bic: number };

const COMBOS: [number, number][] = [
  [0, 0],
  [0, 1],
  [1, 0],
  [1, 1],
];

export function AicGrid({ celdas, criterio, compacto = false, empate = 2 }: { celdas: CeldaAic[]; criterio: "aic" | "bic"; compacto?: boolean; empate?: number }) {
  const minimo = Math.min(...celdas.map((c) => c[criterio]));
  const busca = (p: number, q: number, P: number, Q: number) => celdas.find((c) => c.orden[0] === p && c.orden[2] === q && c.estacional[0] === P && c.estacional[2] === Q);
  const fuente = compacto ? 20 : 22;
  const alto = compacto ? 40 : 50;
  return (
    <div style={{ display: "grid", gridTemplateColumns: `${compacto ? 130 : 150}px repeat(4, 1fr)`, gap: compacto ? 3 : 5, fontSize: fuente }}>
      <span className="mono" style={{ fontSize: 20, color: "var(--text-3)", alignSelf: "end" }}>
        meses \ años
      </span>
      {COMBOS.map(([P, Q]) => (
        <span key={`c${P}${Q}`} className="mono" style={{ fontSize: 20, color: "var(--red-2)", textAlign: "center" }}>
          ({P},1,{Q})₁₂
        </span>
      ))}
      {COMBOS.map(([p, q]) => (
        <div key={`f${p}${q}`} style={{ display: "contents" }}>
          <span className="mono" style={{ fontSize: 20, color: "var(--text-2)", alignSelf: "center" }}>
            ({p},1,{q})
          </span>
          {COMBOS.map(([P, Q]) => {
            const c = busca(p, q, P, Q);
            if (!c) return <span key={`${P}${Q}`} />;
            const d = c[criterio] - minimo;
            const esMin = d === 0;
            return (
              <div
                key={`${P}${Q}`}
                className="mono"
                style={{
                  height: alto,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: esMin ? "2px solid var(--red)" : "1px solid var(--line)",
                  background: d < empate ? "var(--red-dim)" : "transparent",
                  color: esMin ? "var(--text)" : d < empate ? "var(--red-2)" : "var(--text-3)",
                }}
              >
                {esMin ? "mínimo" : `+${d.toFixed(1)}`}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
