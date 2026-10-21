import { createContext } from "react";

// El número que se ve en el encabezado lo pone el Deck. Desde el recorte de la clase 3 (hito 8) una diapositiva puede
// juntar clics de varias viejas, y cada archivo trae escrito su número viejo.
export const NumeroVisible = createContext<number | null>(null);
