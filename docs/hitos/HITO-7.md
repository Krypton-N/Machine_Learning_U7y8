# Hito 7 — Mapa y cierre (diapositivas 2, 62 y 63)

**Estado:** En construcción · *(Borrador → Aprobado el 2026-10-17 → En construcción → Cerrado el AAAA-MM-DD)*
**Última actualización:** 2026-10-17

## 1. Alcance

- **Entran 3 diapositivas:** 2 (mapa de la exposición), 62 (la misma receta en los tres casos) y 63 (referencias).
- **Fuera, por decisión del usuario (2026-10-17):** el ajuste de la portada (1), la 64 (preguntas), las de respaldo R1–R4
  y el hito 8 (ensayo). Lo de R1–R4 se lleva preparado de palabra (ya está en la guía de estudio). Sin la 64 no hacen
  falta los saltos entre diapositivas (`IrA`), así que tampoco se hacen.
- **Contexto:** la exposición ya empezó; la clase 1 llegó hasta el inicio de boosting. La 2 sirve para abrir las clases
  2 y 3 con una marca "vamos aquí" que se mueve con botones y ↑ ↓.
- **Minimalismo (regla 9):** una idea por clic, ≤ 40 palabras de lectura, nada de minigráficas ilegibles (la revisión de
  la especificación ya pedía quitarlas de la 62).

## 2. Lo que se revisó para planear

Leído: `apertura-cierre-respaldo.md` (2, 62, 63), `apertura-revisiones.md`, las entradas del plan maestro y `Receta`.

| Diapositiva | Se toma | Se corrige o se descarta, y por qué |
|---|---|---|
| 2 | La línea de metro con tramos proporcionales al número de diapositivas; los corchetes U7 y U8; los tres casos; el hilo "modelo → validación → métrica" | Sin palabras clave ni rangos de 16–18 px (la revisión contó ~50 textos chicos y encimados): cada estación lleva letra, nombre y rango a ≥ 20 px. Sin la barra 76/24 ni la nota de "barajar" (aún no se explican). Se agrega un clic con las tres clases y la marca "vamos aquí" (botones y ↑ ↓), que pedía el plan maestro |
| 62 | La rejilla de la receta con un renglón por caso y la columna Validación enmarcada al final | Sin minigráficas (bigotes de 2 px, barras ilegibles): celdas de texto a 26 px. El renglón nuevo entra completo y los anteriores se reducen a palabras clave (la decisión 6 del hito de legibilidad). El renglón del clima ya tiene validación de verdad (la 61: 1 000 días aparte), así que deja de contradecir la receta |
| 63 | Las cinco fuentes principales y las complementarias | Las complementarias se parten en tres clics (ensambles, series, HMM y software). Se quitan las de R2 y R3 (KPSS), que no se construyen. Se agregan Dempster, Laird y Rubin (EM), Eddy (1998) y Hamilton (1989), que la 61 nombra. El ejemplo del clima se cita al artículo "Hidden Markov model" de Wikipedia, que es donde está (el de "Viterbi algorithm" usa otro ejemplo) |

## 3. Decisiones que necesita el usuario

> **Respondidas el 2026-10-17:** fuera la portada, la 64, R1–R4 y el hito 8; construir de una vez, sin esperar aprobación.

## 4. Datos

Sin datos nuevos ni script. Todo sale de lo que ya existe: los rangos de cada sección de `src/deck/estructura.ts` (la
estructura de 64); Adult de `adult_muestra.json` y `comparacion_adult.json`; pasajeros de `series_modelos.json` (MAE de
SARIMA e ingenuo estacional en 1960, calculados en vivo con `lib/series.ts`, como la 49); clima de `hmm_clima.json` (aciertos
de Viterbi en la prueba, calculados en vivo como la 61). Las citas, en `src/deck/referencias.ts`.

## 5. Piezas

| Pieza | Nueva o existente | Para qué |
|---|---|---|
| `src/deck/estructura.ts` | nueva | Secciones con letra, nombre, unidad y rango; clases (1–19, 20–40, 41–64) |
| `src/deck/referencias.ts` | nueva | Las citas, el único lugar donde están escritas |
| `Receta` (franja) | existente | Encabezado de la 62 |
| `Chips`, `useFlechas`, `Entra` | existentes | Marca "vamos aquí" de la 2 |

## 6. Diapositiva por diapositiva

### 2 · Mapa de la exposición — 4 clics

| Clic | Gráfica | Texto (≈ palabras) |
|---|---|---|
| 0 | Línea de metro: 11 estaciones con letra, nombre y rango; corchetes U7 y U8 | "Dos unidades: primero, cómo combinar muchos modelos; después, qué cambia cuando los datos vienen en orden." (17) |
| 1 | Bajo la línea, las tres clases como franjas | Solo los rótulos de las clases |
| 2 | Bajo la línea, los tres casos alineados con sus partes | Una pregunta por caso (≈ 20) |
| 3 | Hilo rojo "modelo → validación → métrica" que termina en la 62 | Conclusión (≈ 16) |

La marca "vamos aquí" (botones "clase 2" y "clase 3" y ↑ ↓ para moverla una diapositiva) se ve en todos los clics.

### 62 · La misma receta en los tres casos — 6 clics

| Clic | En pantalla |
|---|---|
| 0 | Franja de la receta y los tres renglones vacíos (Adult, Pasajeros, Clima); "La receta de la diapositiva 3 no cambió." |
| 1–3 | Un caso por clic: su renglón completo (cuatro celdas cortas a 26 px, datos leídos de los JSON); los anteriores, en palabras clave |
| 4 | Todos en palabras clave; la columna Validación enmarcada en rojo y las demás atenuadas: "Lo que cambia entre los casos es cómo se valida." |
| 5 | Conclusión: "Antes de creer un número, pregunta: ¿con qué datos?, ¿cómo se validó?, ¿con qué métrica?" |

### 63 · Referencias — 4 clics

| Clic | En pantalla |
|---|---|
| 0 | Las cinco principales, una por renglón: año, autores, título, dónde se publicó y en qué diapositivas se usó |
| 1 | Complementarias de ensambles |
| 2 | Complementarias de series y los datos |
| 3 | HMM y software |

## 7. Orden de construcción

- [x] **Tanda única:** `estructura.ts`, `referencias.ts`, 2, 62, 63; registro; build, verify y medidor.
- [ ] **Cierre del hito** (sección 8).

## 8. Cómo se da por terminado

1. `npm run build` sin errores y `npm run verify` con "Todo coincide".
2. Las tres vistas en el navegador; el medidor `scripts/legibilidad.js` sobre 2, 62 y 63 sin textos < 18, rótulos < 20,
   lecturas < 26, nada fuera del cuerpo, sin encimados y ≤ 40 palabras por clic.
3. `HANDOFF.md`, `CLAUDE.md` y el plan maestro al día. Después: actualizar la guía de estudio (artifact) con 41–63.

## 9. Bitácora

### 2026-10-17

- Plan escrito y aprobado en el mismo turno, por indicación del usuario.
- **Construidas** la 2 (4 clics), la 62 (6) y la 63 (4), con `src/deck/estructura.ts` y `src/deck/referencias.ts`.
- **Cambios al construir:** en la 2, el hilo rojo baja al centro del tramo Cierre (bajando en la 62 cruzaba el nombre de
  la sección H) y la pregunta del clima se acortó a "¿Qué clima hubo cada día?" (en su columna ocupaba cuatro renglones).
  La 63 es una lista de consulta, marcada `data-rotulo` como las tablas de datos.
- **Citas:** cotejadas de memoria contra los datos bibliográficos conocidos (volumen, número y páginas); no se abrió cada
  DOI. Si alguna resulta mal, se corrige en `referencias.ts`.
- **Revisado en captura:** 2 (1, 2, 3 con la marca en la clase 2), 62 (2 y 4) y 63 (0 y 3).
- **Medidor (`scripts/legibilidad.js`) sobre 2, 62 y 63 (14 posiciones):** 0 textos < 18 px, 0 rótulos < 20, 0 lecturas
  < 26, nada fuera del cuerpo, 0 encimados; el clic más cargado tiene 37 palabras (62/3). `npm run build` sin errores y
  `npm run verify` con "Todo coincide".
- **No se revisó en captura:** 2/0, 62/0, 62/1, 62/3, 62/5, 63/1 y 63/2 (pasaron por el medidor). Tampoco se probaron las
  flechas ↑ ↓ de la marca "vamos aquí" (sí los botones).
- **Falta:** que el usuario lo vea publicado; después, actualizar la guía de estudio con 2 y 41–63.
