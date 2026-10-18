// Tamaños mínimos de la regla 9 de CLAUDE.md (se proyecta en un cañón), en px del lienzo de 1920 × 1080.
// Las piezas en SVG los usan para calcular sus márgenes con el tamaño real de los números de los ejes.
export const TIPO = {
  /** Párrafos, definiciones, recordatorios, conclusiones. */
  lectura: 26,
  /** Números de ejes, leyendas, etiquetas y rótulos. */
  rotulo: 20,
  /** Fórmulas. */
  formula: 28,
  /** Solo ayudas para quien expone (no para el público), como la pista de las escenas 3D. */
  ayuda: 18,
} as const;

/** Tamaño de rótulo, para escribirlo corto en los SVG. */
export const R = TIPO.rotulo;

/** Ancho aproximado de un texto en IBM Plex Mono: 0.6 em por carácter. */
export const anchoMono = (texto: string, tam: number = R) => texto.length * tam * 0.6;

/** Margen izquierdo que deja caber los números del eje y (alineados a la derecha, a `sep` px del eje). */
export const margenIzq = (minimo: number, textos: string[], sep = 12) => Math.max(minimo, Math.max(0, ...textos.map((t) => anchoMono(t))) + sep + 6);
