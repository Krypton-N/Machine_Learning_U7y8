# Hito 8 — Recorte de la clase 3 a 15 diapositivas

**Estado:** Aprobado (2026-10-20). El usuario vio la propuesta de recorte y pidió "recórtalo a 15 diapositivas".

## 1. Por qué

La exposición ya llegó hasta la 40. Lo que falta (41–62, 22 diapositivas y 166 clics) no cabe en el tiempo que queda. El
usuario pide **15 diapositivas como máximo**, más cortas, **sin perder temas**, y quitar lo menos relevante y las
animaciones menos impresionantes. La 63 (referencias) y la 64 (preguntas) se van.

Esto cambia la regla 5 de `CLAUDE.md` ("sin recortes por tiempo"): la clase 3 pasa a ser 41–55.

## 2. Cómo se recorta sin reescribir

Cada diapositiva nueva es una **lista de clics escogidos** de las diapositivas viejas (`src/slides/recorte.tsx`): el clic
k de la nueva muestra el clic s de la vieja tal como estaba construido y verificado. Así no se toca el contenido (que ya
pasó el medidor y la verificación) y el recorte se puede deshacer. Si dos clics seguidos son de la misma diapositiva
vieja, la animación entre ellos se conserva; al pasar a otra, el título cambia al de esa parte.

- El número que se ve arriba lo pone el `Deck` (contexto en `SlideFrame`), no el número que cada archivo traía escrito.
- El total pasa de 64 a 55. Los rangos del mapa de la 2 (`estructura.ts`): G = 41–47, H = 48–54, Cierre = 55.
- Las referencias a otras diapositivas dentro del texto se corrigen a la numeración nueva.

## 3. Las 15 (clics que se quedan, numerados desde 0 como en el archivo viejo)

| Nueva | Tema | Clics (vieja: pasos) | Clics | Lo que se va (se dice de palabra si preguntan) |
|---|---|---|---|---|
| 41 | Ruido blanco y AR | 41: 0, 2, 5, 7 · 42: 0, 1, 3, 4 | 8 | Banda de la ACF (ya en la 39), pronóstico plano, aviso de 132 meses, pronóstico AR(2) y cierre del AR |
| 42 | MA y ARMA | 43: 0, 1, 6 · 44: 0, 3, 4 | 6 | "No confundir" con el promedio móvil, caso del MA(1), parsimonia, MA(1) y AR(1) que no alcanzan |
| 43 | ARIMA | 45: 1, 2, 5, 7 | 4 | Cursor de la caminata, ∇ log, los 12 cambios |
| 44 | Identificación | 46: 0, 2, 4, 6 | 4 | Muestras simuladas, el rezago 3, banda de Bartlett |
| 45 | SARIMA | 47: 0, 1, 2, 4, 5, 8 | 6 | Fase intermedia de las cintas, forma con B, pronóstico tapado, cierre |
| 46 | Elegir y evaluar | 48: 0, 1, 2, 3, 5, 7 | 6 | MAE del caso (sale en la 47), las dos escalas de p, la nota de fuga, el cierre |
| 47 | Línea base y validación | 49: 0, 3, 5 · 50: 0, 5, 6 | 6 | Ingenuo solo, SARIMA contra ingenuo; descomposición, ADF, ACF, AIC, Ljung-Box por año, cierre |
| 48 | Causas ocultas y cadena de Markov | 51: 1, 4 · 52: 1, 2, 3, 4 | 6 | Red sin "?", definiciones, aplicaciones, las dos preguntas; recap de probabilidad condicional y rachas |
| 49 | Estados ocultos | 53: 0, 1, 2, 3, 5 | 5 | La semana con clima visible, Bayes de un día |
| 50 | λ = (π, A, B) | 54: 0, 3, 4, 6 | 4 | Tablas con números y diagrama completo (los números salen en la conjunta) |
| 51 | Tres preguntas y fuerza bruta | 55: 4 · 56: 2, 3, 4, 7 | 5 | Apertura de las preguntas renglón por renglón; recap, árbol vacío, L L L, botones de T |
| 52 | Forward | 57: 0, 3, 4, 5, 7 | 5 | Nodo del trellis, fórmulas, día 3 por separado; **la 58 completa** (14 contra 40 multiplicaciones, de palabra) |
| 53 | Viterbi | 59: 0, 3, 5, 6 · 60: 5 | 5 | Esquema de rutas, t = 1 y t = 3 por separado; la 60 queda solo en su cuadro final |
| 54 | Del pizarrón a la práctica | 61: 1, 2, 3, 4, 6, 11, 13 | 7 | Índice, λ real contra aprendido, recap de logaritmos, comparación con hmmlearn, log-verosimilitud, aplicaciones |
| 55 | La misma receta en los tres casos | 62: 1, 2, 3, 5 | 4 | Clic vacío del inicio y el marco de validación sin cierre |

Total: **81 clics** (antes 166 en 22 diapositivas). Se quedan las animaciones fuertes: botones de φ, nube 3D con recta y
plano, cintas 3D del SARIMA, árbol con barras que se apilan, barras de Forward que viajan, regreso de Viterbi y curvas EM.

## 4. Casillas

- [x] `recorte.tsx`, contexto del número, total 55, registro de las 15
- [x] Referencias a números viejos dentro del texto
- [x] `estructura.ts` (mapa de la 2), `CLAUDE.md` (regla 5 y reparto), plan maestro, handoff
- [x] `npm run build`, `npm run verify`, recorrido clic por clic y `scripts/legibilidad.js`

## 5. Pendiente fuera de este hito

- La guía de las 63 se deja igual; para la clase 3 recortada hay una guía aparte (`https://claude.ai/artifact/Fbk1UvB23GU61NBUwCcVak`).

## 9. Bitácora

- 2026-10-20: plan escrito y aprobado en la misma sesión, por la prisa (la clase 3 está por darse).
- 2026-10-20: construido tal como la tabla. El mapa de la 2 también tenía los rangos de los casos (pasajeros 29–50,
  clima 51–61) y truena si un rango pasa del total: quedaron 29–47 y 48–54. El tramo Cierre se rotula "55", no "55–55".
- Medidor (`scripts/legibilidad.js`, 40–55, 86 posiciones): cero textos < 18, cero rótulos < 20, nada fuera ni
  encimado. Una sola marca: la "d" en negritas de la definición de ARIMA (43/0) mide 25.4 px; es el redondeo de la
  escala (el texto es de 26 px) y ya salía igual en la 45 vieja.
- En la 54, el clic de "clima que dura" entra sin el de "clima del libro"; los botones de la diapositiva permiten
  pasar de uno a otro si se quiere comparar.
- Los archivos 58 (tabla α) y 63 (referencias) ya no se registran, pero se conservan; `referencias.ts` sigue.
