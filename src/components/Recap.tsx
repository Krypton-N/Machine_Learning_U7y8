import type { ReactNode } from "react";

// Recuadro de fundamentos: lo básico que el tema necesita, en una caja fija.
export function Recap({ title, children }: { title: string; children: ReactNode }) {
  return (
    <aside className="recap">
      <span className="label">Recordatorio · {title}</span>
      {children}
    </aside>
  );
}
