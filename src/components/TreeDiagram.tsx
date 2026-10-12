import { motion } from "motion/react";
import type { ClassNode } from "../lib/tree";

// Árbol de decisión como diagrama: cada nodo es una pregunta; a la izquierda va el "sí" y a la derecha el "no".

export type NodoDiagrama = {
  /** La pregunta (nodo) o la respuesta (hoja). */
  texto: string;
  detalle?: string;
  /** Proporción de la clase positiva en el nodo: dibuja una barra gris/roja. */
  proporcion?: number;
  /** En las hojas, si el árbol responde "sí". */
  positiva?: boolean;
  hijos?: [NodoDiagrama, NodoDiagrama];
};

const NW_MAX = 250;
const NH = 96;
const DY = 170;

type Colocado = { nodo: NodoDiagrama; x: number; y: number; nivel: number; padre?: Colocado; lado?: "sí" | "no" };

function colocar(raiz: NodoDiagrama, ancho: number): Colocado[] {
  const out: Colocado[] = [];
  const hojas = (n: NodoDiagrama): number => (n.hijos ? hojas(n.hijos[0]) + hojas(n.hijos[1]) : 1);
  const total = hojas(raiz);
  const paso = ancho / total;
  let cursor = 0;
  const rec = (nodo: NodoDiagrama, nivel: number, padre?: Colocado, lado?: "sí" | "no"): Colocado => {
    const c: Colocado = { nodo, x: 0, y: nivel * DY, nivel, padre, lado };
    out.push(c);
    if (nodo.hijos) {
      const a = rec(nodo.hijos[0], nivel + 1, c, "sí");
      const b = rec(nodo.hijos[1], nivel + 1, c, "no");
      c.x = (a.x + b.x) / 2;
    } else {
      c.x = (cursor + 0.5) * paso;
      cursor++;
    }
    return c;
  };
  rec(raiz, 0);
  return out;
}

export function TreeDiagram({
  raiz,
  ancho,
  nivelVisible = 99,
  resaltar,
}: {
  raiz: NodoDiagrama;
  ancho: number;
  /** Hasta qué nivel se dibuja (0 = solo la raíz). Los niveles aparecen con animación. */
  nivelVisible?: number;
  /** Nivel cuyas preguntas se resaltan en rojo (el corte que se está explicando). */
  resaltar?: number;
}) {
  const nodos = colocar(raiz, ancho);
  // Con muchas hojas, los nodos se angostan para no encimarse.
  const NW = Math.min(NW_MAX, ancho / nodos.filter((n) => !n.nodo.hijos).length - 16);
  const niveles = Math.max(...nodos.map((n) => n.nivel));
  return (
    <svg width={ancho} height={niveles * DY + NH + 4} style={{ display: "block", overflow: "visible" }}>
      {nodos.map((c, i) => {
        const visible = c.nivel <= nivelVisible;
        const hoja = !c.nodo.hijos;
        const rojo = (!hoja && resaltar === c.nivel) || (hoja && c.nodo.positiva);
        return (
          <motion.g key={i} initial={false} animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 12 }} transition={{ duration: 0.45 }}>
            {c.padre && (
              <>
                <line x1={c.padre.x} y1={c.padre.y + NH} x2={c.x} y2={c.y} stroke="var(--line-2)" strokeWidth={1.5} />
                <text
                  x={(c.padre.x + c.x) / 2 + (c.lado === "sí" ? -16 : 16)}
                  y={(c.padre.y + NH + c.y) / 2 + 2}
                  textAnchor={c.lado === "sí" ? "end" : "start"}
                  className="mono"
                  fontSize={17}
                  fill="var(--text-3)"
                >
                  {c.lado}
                </text>
              </>
            )}
            <rect
              x={c.x - NW / 2}
              y={c.y}
              width={NW}
              height={NH}
              fill={hoja && c.nodo.positiva ? "var(--red-dim)" : "var(--panel)"}
              stroke={rojo ? "var(--red)" : "var(--line-2)"}
              strokeWidth={rojo ? 2 : 1}
            />
            <text x={c.x} y={c.y + 34} textAnchor="middle" fontSize={22} fontWeight={hoja ? 400 : 500} fill="var(--text)">
              {c.nodo.texto}
            </text>
            {c.nodo.detalle && (
              <text x={c.x} y={c.y + 60} textAnchor="middle" className="mono" fontSize={15} fill="var(--text-3)">
                {c.nodo.detalle}
              </text>
            )}
            {c.nodo.proporcion !== undefined && (
              <g>
                <rect x={c.x - NW / 2 + 18} y={c.y + NH - 20} width={NW - 36} height={7} fill="var(--data-dim)" />
                <rect
                  x={c.x - NW / 2 + 18 + (NW - 36) * (1 - c.nodo.proporcion)}
                  y={c.y + NH - 20}
                  width={(NW - 36) * c.nodo.proporcion}
                  height={7}
                  fill="var(--red)"
                />
              </g>
            )}
          </motion.g>
        );
      })}
    </svg>
  );
}

/** Convierte un árbol entrenado en un diagrama. Con datos enteros, "≤ 12.5" se escribe "≤ 12". */
export function diagramaDe(arbol: ClassNode, variables: string[], maxNivel = 99, nivel = 0): NodoDiagrama {
  const p = arbol.pos / arbol.n;
  const detalle = `${arbol.n.toLocaleString("es-MX")} · ${(p * 100).toFixed(1)} % sí`;
  if (arbol.leaf || nivel >= maxNivel) return { texto: p > 0.5 ? "dice: sí" : "dice: no", detalle, proporcion: p, positiva: p > 0.5 };
  return {
    texto: `¿${variables[arbol.feature]} ≤ ${Math.floor(arbol.threshold)}?`,
    detalle,
    proporcion: p,
    hijos: [diagramaDe(arbol.left, variables, maxNivel, nivel + 1), diagramaDe(arbol.right, variables, maxNivel, nivel + 1)],
  };
}
