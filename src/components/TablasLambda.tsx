import { AnimatePresence, motion } from "motion/react";
import type { CSSProperties, ReactNode } from "react";
import { CORTO, fmtP } from "../lib/clima";
import type { HMM } from "../lib/hmm";

// Las tablas que definen un HMM: π (cómo empieza), A (cómo cambia) y B (qué produce). Simbólicas (π_L, a_LS, …) o
// con números, con la suma de cada renglón, y opcionalmente comparadas con otro modelo (real → aprendido).

type Tabla = "pi" | "A" | "B";

const TITULO: Record<Tabla, { simbolo: string; palabras: string }> = {
  pi: { simbolo: "π", palabras: "cómo empieza" },
  A: { simbolo: "A", palabras: "cómo cambia" },
  B: { simbolo: "B", palabras: "qué produce" },
};

const celda: CSSProperties = { padding: "8px 14px", textAlign: "right", borderBottom: "1px solid var(--line)", whiteSpace: "nowrap" };
const cabeza: CSSProperties = { ...celda, color: "var(--text-3)", fontSize: 22, fontWeight: 400, borderBottom: "1px solid var(--line-2)" };

export function TablasLambda({
  modelo,
  cuales,
  simbolica = false,
  sumas = false,
  comparar,
  conTitulo = true,
  tam = 26,
  separacion = 70,
}: {
  modelo: HMM;
  cuales: Tabla[];
  simbolica?: boolean;
  /** Columna "suma" de cada renglón (siempre 1). */
  sumas?: boolean;
  /** Otro modelo con los mismos estados: cada casilla muestra "propio → otro". */
  comparar?: HMM;
  conTitulo?: boolean;
  tam?: number;
  separacion?: number;
}) {
  const sub = (t: string) => <sub style={{ fontSize: "0.8em" }}>{t}</sub>;
  const valor = (v: number, sim: ReactNode, otro?: number): ReactNode => {
    if (simbolica) return <span style={{ fontStyle: "italic", fontFamily: "var(--sans)", fontSize: "1.15em" }}>{sim}</span>;
    if (otro === undefined) return fmtP(v);
    const lejos = Math.abs(otro - v) >= 0.05;
    return (
      <>
        <span style={{ color: "var(--text-3)" }}>{fmtP(v)}</span>
        <span style={{ color: "var(--text-3)" }}> → </span>
        <span style={{ color: lejos ? "var(--red-2)" : "var(--text)" }}>{otro.toFixed(3)}</span>
      </>
    );
  };
  const casilla = (key: string, contenido: ReactNode) => (
    <td key={key} style={celda}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={simbolica ? "s" : "n"} style={{ display: "inline-block" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          {contenido}
        </motion.span>
      </AnimatePresence>
    </td>
  );
  const suma = (fila: number[]) =>
    sumas && (
      <td style={{ ...celda, color: "var(--text-3)", borderLeft: "1px solid var(--line-2)" }}>{simbolica ? "1" : fmtP(fila.reduce((a, b) => a + b, 0))}</td>
    );
  const colSuma = sumas && <th style={{ ...cabeza, borderLeft: "1px solid var(--line-2)" }}>suma</th>;

  const tablas: Record<Tabla, ReactNode> = {
    pi: (
      <table data-rotulo className="mono" style={{ borderCollapse: "collapse", fontSize: tam }}>
        <thead>
          <tr>
            {modelo.states.map((s) => (
              <th key={s} style={cabeza}>
                {s}
              </th>
            ))}
            {colSuma}
          </tr>
        </thead>
        <tbody>
          <tr>
            {modelo.pi.map((p, j) => casilla(`p${j}`, valor(p, <>π{sub(CORTO[j])}</>, comparar?.pi[j])))}
            {suma(modelo.pi)}
          </tr>
        </tbody>
      </table>
    ),
    A: (
      <table data-rotulo className="mono" style={{ borderCollapse: "collapse", fontSize: tam }}>
        <thead>
          <tr>
            <th style={{ ...cabeza, textAlign: "left" }}>hoy \ mañana</th>
            {modelo.states.map((s) => (
              <th key={s} style={cabeza}>
                {s}
              </th>
            ))}
            {colSuma}
          </tr>
        </thead>
        <tbody>
          {modelo.A.map((fila, i) => (
            <tr key={i}>
              <td style={{ ...celda, textAlign: "left", color: "var(--text-2)", fontFamily: "var(--sans)" }}>{modelo.states[i]}</td>
              {fila.map((a, j) => casilla(`a${i}${j}`, valor(a, <>a{sub(CORTO[i] + CORTO[j])}</>, comparar?.A[i][j])))}
              {suma(fila)}
            </tr>
          ))}
        </tbody>
      </table>
    ),
    B: (
      <table data-rotulo className="mono" style={{ borderCollapse: "collapse", fontSize: tam }}>
        <thead>
          <tr>
            <th style={{ ...cabeza, textAlign: "left" }}>clima \ hace</th>
            {modelo.symbols.map((s) => (
              <th key={s} style={cabeza}>
                {s}
              </th>
            ))}
            {colSuma}
          </tr>
        </thead>
        <tbody>
          {modelo.B.map((fila, i) => (
            <tr key={i}>
              <td style={{ ...celda, textAlign: "left", color: "var(--text-2)", fontFamily: "var(--sans)" }}>{modelo.states[i]}</td>
              {fila.map((b, k) => casilla(`b${i}${k}`, valor(b, <>b{sub(CORTO[i])}({modelo.symbols[k].slice(0, 3)})</>, comparar?.B[i][k])))}
              {suma(fila)}
            </tr>
          ))}
        </tbody>
      </table>
    ),
  };

  return (
    <div style={{ display: "flex", gap: separacion, alignItems: "flex-start", flexWrap: "wrap" }}>
      {cuales.map((t) => (
        <div key={t}>
          {conTitulo && (
            <div style={{ marginBottom: 12, display: "flex", alignItems: "baseline", gap: 14 }}>
              <span style={{ fontSize: 34, fontWeight: 600 }}>{TITULO[t].simbolo}</span>
              <span style={{ fontSize: 26, color: "var(--text-2)" }}>{TITULO[t].palabras}</span>
            </div>
          )}
          {tablas[t]}
        </div>
      ))}
    </div>
  );
}
