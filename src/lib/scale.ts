// Escala lineal mínima (dominio → rango) para dibujar gráficas en SVG.
export function linear([d0, d1]: [number, number], [r0, r1]: [number, number]) {
  const k = (r1 - r0) / (d1 - d0);
  return (v: number) => r0 + (v - d0) * k;
}

/** Eje que cubre los valores: va de un múltiplo de `paso` a otro, con una marca en cada uno. */
export function ejeQueCubre(valores: number[], paso: number) {
  const lo = Math.floor(Math.min(...valores) / paso + 1e-9);
  const hi = Math.ceil(Math.max(...valores) / paso - 1e-9);
  const ticks = Array.from({ length: hi - lo + 1 }, (_, i) => Number(((lo + i) * paso).toFixed(6)));
  return { dominio: [ticks[0], ticks[ticks.length - 1]] as [number, number], ticks };
}
