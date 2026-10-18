import { mulberry32 } from "../lib/rng";
import { choques } from "../lib/series";

// Los 132 choques que comparten las diapositivas 41 a 45 ("Esquema · los mismos choques"): con ellos se ve el
// ruido blanco (41), qué le hace un AR (42) o un MA (43) a ese mismo ruido, y la caminata que sale de sumarlos (45).
//
// La semilla se eligió por búsqueda entre 1 y 400 (bitácora del hito 5, tanda 0) para que el esquema enseñe lo que
// dice: en la ACF del ruido sale una sola barra de 24, lejos del inicio (la 14), así que "no tienen que salir 0" se
// ve; media −0.07 y desviación 1.03; con φ = 0.9 el AR(1) da r₁ = 0.88; con θ = 0.8 el MA(1) solo saca el rezago 1.
// El botón "otra muestra" de la 41 enseña que con otras semillas salen más o menos barras.
export const SEMILLA_CHOQUES = 170;
export const N_CHOQUES = 132;
export const CHOQUES = choques(N_CHOQUES, mulberry32(SEMILLA_CHOQUES));
