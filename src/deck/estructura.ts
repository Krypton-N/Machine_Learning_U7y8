// La estructura de la exposición (55 diapositivas desde el recorte de la clase 3, hito 8): secciones, unidades y clases.
// La usa el mapa de la 2. Los rangos son la estructura, no datos: si el plan cambia, se cambian aquí.

export type Seccion = { letra: string; nombre: string; desde: number; hasta: number; unidad: "U7" | "U8" | null };

export const SECCIONES: Seccion[] = [
  { letra: "", nombre: "Apertura", desde: 1, hasta: 3, unidad: null },
  { letra: "A", nombre: "Bases", desde: 4, hasta: 9, unidad: "U7" },
  { letra: "B", nombre: "Bagging", desde: 10, hasta: 12, unidad: "U7" },
  { letra: "C", nombre: "Random Forest", desde: 13, hasta: 16, unidad: "U7" },
  { letra: "D", nombre: "Boosting", desde: 17, hasta: 24, unidad: "U7" },
  { letra: "E", nombre: "Comparación", desde: 25, hasta: 28, unidad: "U7" },
  { letra: "", nombre: "Puente", desde: 29, hasta: 30, unidad: "U8" },
  { letra: "F", nombre: "Fundamentos de series", desde: 31, hasta: 40, unidad: "U8" },
  { letra: "G", nombre: "Modelos de series", desde: 41, hasta: 47, unidad: "U8" },
  { letra: "H", nombre: "Modelos ocultos de Markov", desde: 48, hasta: 54, unidad: "U8" },
  { letra: "", nombre: "Cierre", desde: 55, hasta: 55, unidad: null },
];

export const UNIDADES = [
  { id: "U7", nombre: "U7 · Ensambles" },
  { id: "U8", nombre: "U8 · Datos secuenciales" },
] as const;

/** Reparto en clases del plan maestro (sección "Duración y reparto en clases"). */
export const CLASES = [
  { nombre: "Clase 1", desde: 1, hasta: 19 },
  { nombre: "Clase 2", desde: 20, hasta: 40 },
  { nombre: "Clase 3", desde: 41, hasta: 55 },
];
