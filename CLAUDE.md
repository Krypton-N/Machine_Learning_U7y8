# Exposición ML — U7 Ensambles y U8 Datos secuenciales

App web de diapositivas (Vite + React 19 + TypeScript) para una exposición de Aprendizaje Máquina en ESCOM-IPN.
Solo la editamos el usuario y Claude. Responder siempre en español.

**Antes de trabajar, leer `docs/HANDOFF.md`** (estado actual y qué toca en esta sesión) y el plan del hito vigente en
`docs/hitos/`. Si ese plan no existe todavía, lo primero es escribirlo (ver "Cómo se trabaja: un plan por hito").

## Reglas del usuario (no negociables)

1. **Todo se explica desde cero.** El público son compañeros que no tienen claras métricas, validación ni algoritmos.
   No se citan las prácticas de la materia ni sus resultados (cada quien las hizo distinto); sí se usan los mismos temas.
2. **El foco son los ensambles, las series de tiempo y HMM**, no los conceptos súper básicos. Los fundamentos van como
   recuadro `Recap` dentro de la diapositiva del tema (máximo un tercio). Solo 3, 5, 20 y 26 son diapositivas de fundamentos.
3. **Concepto → caso.** Cada diapositiva explica primero el concepto (definición + esquema o ejemplo mínimo, marcado
   "Esquema" si es ilustrativo) y, en los últimos clics, lo aplica al caso de estudio. Al entrar al caso se pasa la prop
   `caso` a `SlideFrame` y aparece la etiqueta "Caso · …" en el encabezado.
4. **Rigor: ningún número se escribe a mano.** Lo exacto se calcula en el navegador (`src/lib/`); lo demás se precalcula con
   Python a `src/data/*.json`. Todo cálculo en TypeScript se compara contra sklearn / statsmodels / hmmlearn en
   `scripts/verificar.ts`. Si un dato contradice lo planeado, se muestra el dato y se reescribe el texto.
5. **Reparto en clases.** Clase 1 = 1–19, clase 2 = 20–40, clase 3 = 41–55. La clase 3 se recortó por tiempo a pedido
   del usuario (2026-10-20, `docs/hitos/HITO-8.md`): de 22 diapositivas a 15, sin perder temas; la 63 (referencias) y la
   64 (preguntas) se fueron. No recortar más sin que el usuario lo pida.
6. **Estilo:** negro/gris oscuro con acento rojo, sobrio y editorial. Prohibido el estilo genérico "AI slop": nada de
   degradados de colores, tarjetas con íconos, emojis ni glassmorphism. 3D solo cuando ayuda a entender.
7. **Git lo maneja el usuario.** Él hace los commits y los push; Claude no sube nada y solo hace commit si se le pide.
   Esta carpeta tiene su propio repo, `https://github.com/Krypton-N/Machine_Learning_U7y8` (rama `main`), aunque viva
   dentro de la carpeta del repo `Ingenieria-en-Inteligencia-Artificial-IIA-`. Cada push a `main` compila y publica en
   `https://krypton-n.github.io/Machine_Learning_U7y8/` (`.github/workflows/pages.yml`). Los pasos para publicar y para
   revisar un despliegue están en `README.md` ("Publicar en GitHub Pages"): si el usuario pregunta cómo subir algo, se le
   dan esos pasos. Al terminar una sesión, recordarle que lo hecho no se publica hasta que haga commit y push. El repo
   es público: no dejar en él notas privadas (`.remember/` está en `.gitignore`).
8. **El dataset se enseña crudo antes de usarlo.** La primera vez que un tema usa un dataset se muestran sus primeras 5
   filas tal como llegan (como `df.head()`, con `TablaCruda`), explicando ese dataset en concreto: de dónde sale, qué es
   cada columna y qué se quiere predecir. Luego, qué se le cambia. Solo después va el método. Ya está en la 3 (Adult), en
   la 4 (Adult con 3 columnas) y en la 29 (pasajeros aéreos); falta en cualquier dato que use HMM.
9. **Se proyecta en un cañón, en un salón: legible desde el fondo y sin saturar** (pedido del usuario, 2026-10-14, al
   revisar la 48). Medidas sobre el lienzo de 1920 × 1080:
   - **Tamaños mínimos:** texto de lectura ≥ 26 px; etiquetas, números de ejes, leyendas y rótulos ≥ 20 px; **nada por
     debajo de 18 px**. Las fórmulas, ≥ 28 px.
   - **Una idea por clic, minimalista** (endurecido por el usuario, 2026-10-17, porque la 48 quedó sobrecargada). En
     pantalla, a lo más una gráfica principal (o dos hermanas que se comparan) y un bloque de texto de 25–40 palabras. A lo
     más dos fórmulas a la vista. **Nunca tres paneles o columnas a la vez.** Si no cabe a esos tamaños, se parte en más
     clics (no están limitados, regla 5) o, si de verdad hace falta, en más diapositivas; nunca se aprieta.
   - **Nada se sale del cuerpo útil (≈ 1696 × 640 px) ni se encima** con otro texto, ni con la ayuda de navegación.
   - **Sin notas al pie diminutas.** Si un dato importa, va en el texto; si es para una pregunta, se lleva preparado y se
     dice de palabra (va en "De palabra" o en las respuestas preparadas del plan del hito, o en la bitácora).
   - **El plan de cada hito dice, por diapositiva y por clic, qué hay en pantalla** (gráfica, texto con sus palabras,
     fórmulas), para que se vea que cada clic queda ligero antes de construirlo.
   - **Se comprueba por DOM** con `scripts/legibilidad.js` (instrucciones en su encabezado): cero textos menores a 18 px,
     cero rótulos menores a 20, cero textos fuera del cuerpo y cero encimados en todos los clics. Además se mira a tamaño
     real.

## Cómo se trabaja: un plan por hito

La exposición se construye por hitos (tabla en `docs/HANDOFF.md`). Desde el hito 4, **cada hito tiene su propio plan** en
`docs/hitos/HITO-N.md`, escrito a partir de `docs/hitos/PLANTILLA.md`, y pasa por cuatro pasos:

1. **Planear.** Se leen las entradas del hito en el plan maestro y su especificación, se revisa esa especificación con ojo
   crítico (es un borrador) y se escribe `HITO-N.md` con estado *Borrador*. **Mientras sea borrador no se construye ninguna
   diapositiva**; sí se puede comprobar lo que el plan necesita saber (que una dependencia instala, cómo llega un dataset).
2. **Aprobar.** El usuario lo lee, responde las "Decisiones que necesita el usuario" y pide cambios. Cuando da el visto
   bueno, el estado pasa a *Aprobado* con la fecha.
3. **Construir.** En el orden de tandas del plan, marcando cada casilla al terminarla. Lo que cambie respecto al plan, y lo
   que digan los datos, se anota en su bitácora en el momento. Así otra sesión puede seguir a medio hito.
4. **Cerrar.** Lo que pide la sección 8 del plan del hito; el estado pasa a *Cerrado*.

Qué es cada documento, para no duplicar:

| Documento | Qué contiene | Cuándo se toca |
|---|---|---|
| `CLAUDE.md` | Reglas permanentes, convenciones y piezas disponibles | Cuando cambia una regla o se agrega una pieza |
| `docs/PLAN-DIAPOSITIVAS.md` | Plan maestro: qué lleva cada una de las 64 diapositivas originales (la clase 3 recortada: `HITO-8.md`) | Si cambia lo que lleva una diapositiva |
| `docs/especificaciones/` | Borradores largos de diseño de F, G, H y apertura/cierre. **Son insumo, no verdad** | No se editan; lo que se corrige va al plan del hito |
| `docs/hitos/HITO-N.md` | Plan de trabajo de un hito y su bitácora | Durante todo el hito |
| `docs/HANDOFF.md` | Estado actual y qué toca en la siguiente sesión. Corto: apunta al hito vigente | Al terminar cada sesión |

Los hitos 0 a 3 son anteriores a este flujo y no tienen archivo propio: su registro está en las secciones "Lo que cambió al
construir…" del plan maestro y en el handoff.

## Casos de estudio

| Parte | Caso |
|---|---|
| U7 Ensambles | **Adult / Census Income**: ¿la persona gana > 50K? 48 842 personas, 23.9 % positivos. El archivo trae 14 columnas y se usan 13: se quita `fnlwgt` (peso censal, es del muestreo y no de la persona). Se conservan raza y sexo |
| U7, dibujos | **Adult con 3 variables** (edad, años de educación, horas por semana): entrena 10 000, prueba 5 000, se dibujan 400. Bootstrap, AdaBoost e inestabilidad entrenan con las 400 visibles |
| U8 Series | **Pasajeros aéreos** 1949–1960. Las 29–40 describen la serie completa; desde la 41 se aparta 1960 como prueba |
| U8 HMM | **Clima oculto**: π = (0.6, 0.4), A = [[0.7, 0.3], [0.4, 0.6]], B = [[0.1, 0.4, 0.5], [0.6, 0.3, 0.1]] |

## Comandos

```bash
npm run dev      # http://localhost:5180 (preview: configuración "exposicion" en .claude/launch.json)
npm run build    # tsc + un solo dist/index.html que funciona sin internet
npm run verify   # compara src/lib contra las referencias de Python; debe decir "Todo coincide"
.venv/Scripts/python scripts/exportar_hitoN.py   # regenera los JSON de src/data
```

## Convenciones del código

- **Una diapositiva = un archivo** `src/slides/NN-nombre.tsx` que recibe `{ step, active }`. Se registra en
  `src/slides/index.ts` con su `num` y su número de `steps` (clics). Desde el hito 8, las 41–55 se arman con
  `recorte([[Vieja, paso], …])` (`src/slides/recorte.tsx`): clics escogidos de los archivos viejos 41–62, que se
  conservan. El número del encabezado lo pone el `Deck` (contexto `NumeroVisible`), no el `num` que trae cada archivo.
- **Lienzo fijo de 1920×1080** escalado. El cuerpo útil mide ≈ 1696 × 640 px. Tamaños mínimos y densidad: regla 9
  (lectura ≥ 26 px, etiquetas ≥ 20 px, nada menor a 18 px). Las diapositivas 1–50 se hicieron con la regla anterior
  (lectura ≥ 22, etiquetas ≥ 14) y todavía no se ajustan.
- **Color con significado fijo:** rojo = clase positiva, datos de prueba o lo que se resalta; gris claro (`--data`) = contra
  qué se compara. Tokens en `src/theme.css`.
- **`.label` pasa el texto a mayúsculas.** Si lleva letras griegas hay que usar `className="label natural"`
  (λ en mayúscula es Λ, otra letra).
- **Miles con `toLocaleString("es-MX")`** (48,842). Porcentajes con `pct()` de `Piezas`.
- **Etiquetas 3D:** se pasan a `Scene3D` por la prop `etiquetas`. No usar `Html` de drei (se pierde con React 19).
- **Toda escena 3D va dentro de `Scene3D`:** así hereda el giro, el zoom con la rueda (acotado) y el doble clic que
  regresa a la vista inicial.
- **Los archivos de `src/lib/` son puros** (no importan JSON) y se importan entre sí con extensión `.ts`, para que
  `node scripts/verificar.ts` los pueda ejecutar. Solo `lib/adult.ts`, `lib/pasajeros.ts` y `lib/climaSimulado.ts` leen los JSON.
- **Cálculo pesado al montar:** dentro de `useEffect` con `setTimeout`, o por tandas (ver `11-agregacion.tsx`). No usar
  guardas con `useRef` que rompan en StrictMode.
- **Semillas fijas** (`mulberry32`) en todo lo aleatorio: la exposición debe ser repetible.
- Comentarios en español, breves, explicando el porqué. Nombres de dominio en español.

## Piezas disponibles

- `deck/`: `SlideFrame` (encabezado con la unidad y el tema en rojo, título, lede, `caso`), `useFlechas` (↑ ↓ propios de una diapositiva). `Deck` también avanza en el celular: toque en la mitad derecha o deslizar a la izquierda avanza; lo contrario regresa (no cuenta sobre botones, escenas 3D, con dos dedos ni con la pantalla acercada).
- `components/`: `Reveal`, `Recap`, `TeX`, `Piezas` (`Def`, `BarraClases`, `Chips`, `Boton`, `Dato`, `pct`), `Lineas`
  (gráfica de líneas con marcas, líneas horizontales y recorte), `PuntosIntervalo` (un renglón por modelo: puntos por
  pliegue y media ± desviación; se desliza si cambia la escala), `TablaCruda` (un dataset tal como llega, por bloques de
  columnas, con la opción de marcar lo que se quita, lo que se predice y los faltantes), `Receta`, `TreeDiagram` (+ `diagramaDe`),
  `FlujoEnsamble` (`FlujoParalelo`, `FlujoSecuencial`, `ArbolGlifo`), `TableroSorteos`, `RejillaRaices`, `JugueteAdaBoost`,
  `Scene3D` (con `vista` la cámara viaja a una posición), `Adult3DScene` (personas, cajas, planos, `vista`, `vistaX/Y`),
  `VoteVolume3D` (+ `REJILLA`), `Surface3D`.
- `components/` para series (hito 4): `SeriesChart` (una serie mensual sobre `Lineas`: eje de años, `desde`, `ventana`,
  `cursor`; exporta `pasoRedondo`), `Barras` (barras desde el 0 que viajan al cambiar los datos, con banda), `Correlogram`
  (ACF o PACF con su banda; + `fueraDeBanda`), `Dispersion` (puntos que viajan; recta diagonal o ajustada), `SplitDiagram`
  (particiones de validación con fuga; + `futuroUsado`), `CalendarGrid` (rejilla año × mes en números, calor o puntos, que
  vuela a la línea de tiempo y de regreso), `AnioMes3D` (barras o superficie; + `VISTAS_ANIO_MES`), `OperacionAnimada`
  (diferencia o ventana, paso a paso, sobre una serie de juguete), `LagCloud3D` (nube antier–ayer–hoy con sombra y plano).
  `Lineas` acepta además `NaN` (corta la línea), `bandas`, `segmentos`, `escalaY`, `transicion` y `areas` (franja entre
  dos curvas, siempre recortada).
- `components/` para modelos de series (hito 5): `AicGrid` (los 16 SARIMA con la diferencia de AIC o BIC al mejor),
  `MetricTable` (métricas con el mejor de cada columna en rojo, `textos` para "media ± desv" y renglones que se pueden
  escoger), `PValueScale` (escala logarítmica de p con la zona que se quiere; exporta `formatoP`). Además: `SeriesChart`
  acepta `franjas` (banda de un pronóstico; no cuentan para el eje); `Correlogram`, `teorica` (curvas con `guion`; **no
  en rojo**, el rojo ya es "fuera de la banda"), `banda: "blanco" | "bartlett"`, `marcar`, `atenuar` y `contador`;
  `Barras`, `curvas`, `opacidad`, `senalar` y `banda` por barra; `AnioMes3D`, la forma `"cintas"` y `flechas`;
  `LagCloud3D`, `centro`, `recta` y `residuos`. Si una serie empieza antes de la `ventana` de `SeriesChart`, hay que pasar
  `recortar` (o mandar solo el tramo visible, si la línea lleva `etiqueta`, que se recortaría).
- `components/` para HMM (hito 6): `RedTemporal` (red desplegada en el tiempo: `"ar" | "hmm" | "cadena"`, `cortina`,
  `resaltar` un supuesto y sus flechas `prohibidas`; exporta `sub`), `DiagramaClima` (estados con A, π y B, grosor =
  probabilidad, ficha que recorre un `camino`; exporta `estiloEstado`: Lluvioso relleno, Soleado con borde), `TiraDias`
  (clima y actividad por día, `ocultarEstados`), `TablasLambda` (π, A, B simbólicas o con números, `sumas`, `comparar`
  real → aprendido), `ArbolCaminos` (las Nᵀ historias con su barra; etapas hasta la suma y la más alta), `BarrasForward`
  (predecir y corregir con trozos que viajan), `TablaAMano` (tabla de pizarrón de Forward o Viterbi con candidatos,
  flechas ψ, `regreso` y `masAlta`). Las tablas de datos llevan `data-rotulo` (el medidor no las cuenta como lectura).
- `src/slides/choquesG.ts`: los 132 choques que comparten 41–45 (semilla 170, con el porqué).
- `lib/`: `tree` (CART Gini), `bagging`, `adaboost`, `gboost`, `logistic`, `metricas` (matriz de confusión, accuracy,
  precision, recall, F1, F1-macro, media y desviación), `hmm`, `rng`, `scale`, `adult` (los JSON de Adult), `series`
  (diferencias, promedio móvil, descomposición clásica, ACF, PACF, mínimos cuadrados, particiones temporales, simulación;
  y desde el hito 5: ecos y ACF teóricas de un ARMA, AR por mínimos cuadrados y su pronóstico, filtro del MA(1), banda de
  Bartlett, RMSE, MAPE, ingenuo estacional, Ljung-Box con la cola de la χ², simulación ARMA con choques dados; verificada
  contra numpy, pandas, statsmodels, scipy y sklearn), `pasajeros` (los JSON de pasajeros, fechas, transformaciones; desde
  el hito 5, `entrenamiento`, `prueba`, `TRANSFORMACIONES_ENT`, `modelos`, `enMiles` y `MESES_COMPLETOS`). Del hito 6:
  `hmm` con caminos, `pasosForward`, `forwardEscalado`, `viterbiLog`, `suavizado`, `simular`, `rachas`, underflow y
  conteo de multiplicaciones (verificado contra numpy y hmmlearn); `clima` (el único λ de la sección, `OBS_EJEMPLO`,
  `fmtP` para probabilidades sin ruido de punto flotante, `fmtEntero`); `climaSimulado` (el JSON de la 61: diario
  simulado y Baum-Welch de hmmlearn).

## Cómo se da por terminada una diapositiva

1. `npm run build` sin errores y `npm run verify` con "Todo coincide".
2. Revisada en el navegador clic por clic, sin errores en consola, y medida con `scripts/legibilidad.js`: sin textos
   chicos, encimados ni fuera del cuerpo (regla 9).
3. Lo que cambió respecto al plan se anota en la bitácora del hito (`docs/hitos/HITO-N.md`, sección 9). Si cambió lo que
   lleva la diapositiva, se corrige además su entrada en `docs/PLAN-DIAPOSITIVAS.md`.
