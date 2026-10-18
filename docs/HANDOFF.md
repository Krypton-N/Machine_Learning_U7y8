# Handoff — estado al 2026-10-17

Este archivo es para retomar el trabajo en una sesión nueva. Las reglas permanentes y el flujo de trabajo están en
`CLAUDE.md`; qué lleva cada diapositiva, en `docs/PLAN-DIAPOSITIVAS.md`; el plan de cada hito, en `docs/hitos/`.

## Hito 6 (HMM): construido, falta la revisión del usuario

**`docs/hitos/HITO-6.md`** (2026-10-17): el usuario aprobó el plan pidiendo "decide lo más recomendable y empieza"
(opciones A de las 7 decisiones). **Las 10 diapositivas nuevas (51–59, 61) y los ajustes de la 60 están construidos**, con
datos (`scripts/exportar_hito6.py` → `hmm_clima.json`, `referencias_hito6.json`), 20 comprobaciones nuevas en
`npm run verify` ("Todo coincide") y `npm run build` sin errores. **El medidor `scripts/legibilidad.js` sobre los 82 clics
de 51–61:** ningún texto < 18 px, ningún rótulo < 20, ninguna lectura < 26, ninguna fórmula < 28, nada fuera del cuerpo,
ningún encimado y ningún clic con más de 40 palabras (detalle y lo que no se vio en captura, en la bitácora).
Nada tiene commit. Falta: **que el usuario lo revise a tamaño real** y, al dar el visto bueno, el cierre (sección 8 del
plan: estado *Cerrado*, subtarea 195 de ListKeeper). La tanda 4 de `HITO-LEGIBILIDAD.md` ya no necesita tocar la 60.

- **Requisito nuevo del usuario (2026-10-17): diapositivas minimalistas** (la 48 quedó sobrecargada). Ya está en la regla 9
  de `CLAUDE.md`: una idea por clic, 25–40 palabras, nunca tres paneles, nada fuera del cuerpo ni encimado, comprobado con
  `scripts/legibilidad.js`. El plan del hito 6 dice qué hay en pantalla en cada uno de sus 82 clics.
- **`hmmlearn 0.3.3` ya está instalado** en el `.venv` (pip lo compiló para Python 3.14) y reproduce todos los números del
  ejemplo de tres días.
- **Lo que contradijo la especificación** (detalle en la sección 2 del plan): con el λ del libro, Baum-Welch recupera mal B
  y el HMM aprendido no le gana al modelo sin memoria en prueba (el clima cambia casi al azar); con un clima persistente sí
  funciona. "El clima más probable de cada día" da S → L → L, igual que Viterbi, así que la pregunta del cierre de la 59 se
  reformula. π̂ sale (0, 1) con una sola secuencia. El underflow cae en el día 681, no 686.

## Qué toca en la siguiente sesión: cerrar el hito 5 con la revisión del usuario, luego el plan del hito 6

El hito 4 (29–40) está **cerrado y publicado** (2026-10-13). **El hito 5 (41–50) está construido completo** (2026-10-14):
las 10 diapositivas, sus datos y su verificación. Plan y bitácora en `docs/hitos/HITO-5.md`. Estado: *En construcción*,
porque falta lo mismo que cerró el hito 4: **que el usuario lo revise a tamaño real** (lo hizo en GitHub Pages) y dé el
visto bueno. Nada de esto tiene commit: lo sube el usuario cuando quiera.

1. Si el usuario pide cambios, se hacen y se anotan en la bitácora.
2. Al dar el visto bueno: estado *Cerrado* con la fecha en `HITO-5.md`, la subtarea 195 de ListKeeper y este handoff.
   `CLAUDE.md` y el plan maestro ya están al día.
3. Sigue el **hito 6, H. HMM (51–59, 61 y ajustes de la 60)**: construido el 2026-10-17, falta la revisión del usuario
   (`docs/hitos/HITO-6.md`, ver arriba).

**Lo que ya hay de la tanda 0:** `scripts/exportar_hito5.py` (≈ 1 min) → `series_modelos.json` y
`referencias_hito5.json`; en `lib/series.ts`, todo lo que piden las diapositivas (ecos, ACF teórica, AR por mínimos
cuadrados, filtro del MA(1), Bartlett, RMSE, MAPE, ingenuo estacional, Ljung-Box, simulación ARMA); en
`lib/pasajeros.ts`, `entrenamiento`, `prueba`, `TRANSFORMACIONES_ENT`, `enMiles` y `modelos`; `SeriesChart` con
`franjas` (banda del pronóstico); `Correlogram` con `teorica`, `banda="bartlett"`, `marcar`, `atenuar` y `contador`;
`Barras` con `curvas`, `opacidad` y `senalar`. `npm run verify` pasa con 11 comprobaciones nuevas. **Las opciones nuevas
de los componentes no se han visto en pantalla** (ninguna diapositiva las usa aún): revisarlas con cuidado en la tanda 1.

**Lo que midieron las comprobaciones de planeación** (detalle en la sección 2 y en la bitácora de `HITO-5.md`): `SARIMAX`
ajusta la aerolínea sin avisos (θ̂ = −0.348, Θ̂ = −0.562) y es el mínimo de AIC y de BIC entre los 16; en 1960, MAE 13.3
contra 47.8 del ingenuo estacional. Seis cosas contradicen la especificación G: el caso de la 44 no demuestra parsimonia
(un AR(2) empata con el ARMA(1,1)); el ARIMA de menor AIC de la 45 es degenerado y no "se queda corto"; ADF con 132 meses
voltea las dos filas frágiles; los valores del libro no se reproducen a ±0.02; un ingenuo con crecimiento empata con
SARIMA en 1960; y la semilla 41 estropea el esquema de la 43. Los scripts de comprobación eran temporales: no están en el
repo.

### Lo que el plan del hito 5 tenía que resolver (ya resuelto en `HITO-5.md`; se conserva como contexto)

Alcance: **41–50** (10 diapositivas): ruido blanco, AR, MA, ARMA, ARIMA, identificación, SARIMA, elegir y evaluar, línea
base y la demo. Regla de la sección: todo se ajusta con 1949–1959 (132 meses); 1960 aparece tapado con un bloque
"PRUEBA · 1960" hasta que se evalúa.

- **La especificación G es un borrador sin revisar**, igual que lo eran F1 y F2. En el hito 4 la revisión encontró tres
  afirmaciones que los datos no sostenían: hay que comprobar cada número "esperado" con statsmodels antes de planear.
- **Dos tamaños de muestra.** Las 36–40 usan los 144 meses; la sección G, 132. Los números no coinciden y hay que decidir
  cómo se cuenta: ADF de `∇ log` da p = 0.071 con 144 meses y 0.029 con 132; las barras de `∇∇₁₂ log` fuera de la banda
  son 1, 3, 9, 12, 23 y 32 con 144, y 1, 3, 12, 23, 32 y 35 con 132. Los rezagos 1 y 12 son los mayores en los dos casos.
  `adf_pasajeros.json` ya trae `sensibilidad.sin_1960`. La 30 ya le avisó al público que "desde la 41, 1960 se guarda".
- **La banda del correlograma.** `Correlogram` dibuja ±1.96/√n (ruido blanco). La especificación G pide la de Bartlett en
  la 46: decidir si se agrega como opción y cómo se explica que haya dos.
- **Lo que no se puede calcular en el navegador.** Los ajustes de ARIMA y SARIMA (`SARIMAX` de statsmodels), AIC y BIC de
  la rejilla de 16 modelos, Ljung-Box y los pronósticos con su banda van a `series_modelos.json`
  (`scripts/exportar_hito5.py`). Decidir qué sí se calcula vivo (métricas, ACF teóricas, ecos de un choque) y contra qué
  función exacta de statsmodels se verifica cada cosa.
- **Convergencia y versiones.** `statsmodels` 0.15.0 en Python 3.14.2: comprobar que `SARIMAX` ajusta el "modelo de
  aerolínea" (0,1,1)(0,1,1)₁₂ y los 16 de la rejilla sin avisos de convergencia; si alguno no converge, se dice.
- **Números que la especificación da por buenos y hay que medir:** que el candidato salga de la ACF y la PACF (46), que
  el ARIMA sin estacionalidad "se quede corto" (45), que SARIMA le gane al ingenuo estacional (49), y la tabla de origen
  móvil 1958–1960 (50). Si sale distinto, se muestra el dato.
- **Un dato ya medido para la 49:** el Random Forest de la 30, entrenado con 1949–1959, pronostica 1960 con MAE 44.1;
  copiar 1959 da 47.8.
- **PACF:** `pacf` de `lib/series.ts` es Durbin-Levinson sobre la ACF, idéntico a `method="ywm"` y a `"ldb"` de
  statsmodels (la especificación G nombra "ldb": es el mismo cálculo). Los demás métodos sacan otras barras de la banda.
- **Piezas que ya existen:** `SeriesChart`, `Barras` (sirve de `ImpulseResponse`), `Correlogram`, `Dispersion`,
  `SplitDiagram` (la 50 lo reutiliza), `CalendarGrid`, `AnioMes3D`, `LagCloud3D` (la 42 lo reutiliza),
  `OperacionAnimada`, `lib/series.ts` y `lib/pasajeros.ts` (`nEntrenamiento` = 132). **Lo que les falta:** la forma
  "cintas" de `AnioMes3D` (47), curvas teóricas sobre el correlograma (43, 44, 46), bandas de pronóstico y el bloque
  "PRUEBA · 1960" en `SeriesChart` (ya tiene `bandas`), y `simularAR` con más de un coeficiente (la 42 usa AR(2)).
- **Términos que la sección F dejó prometidos:** ruido blanco (39 → 41), AR y MA como modelos (36, 38 → 42, 43), leer los
  órdenes en ACF y PACF (39, 40 → 46), MAE con su fórmula (30 → 48) y la línea base (49).
- **Lo aprendido al construir el hito 4:** ejes calculados de los datos (`ejeQueCubre`, `pasoRedondo`); textos con cifras
  leídas de los datos; `label natural` cuando hay letras griegas (aquí φ, θ, ε); sin barridos automáticos (todo por clic,
  botones o ↑ ↓); en 3D, cámara lejos y ángulo angosto para no deformar, y cuidar desde qué lado se mira.
- **Son 10 diapositivas.** Conviene partir en tandas (base y datos, 41–44, 45–47, 48–50).

## Dónde estamos

**60 de 64 diapositivas construidas:** 1 y 3–61 (las 41–61 sin commit; 51–59 y 61 del 2026-10-17). Compila y `npm run verify` pasa completo. **El hito 4 ya está publicado** (commit `abe12f3`, 2026-10-13; lo subió Claude porque el usuario se lo pidió esa vez).
**Ya está en su propio repo y publicado** (2026-10-12): `https://github.com/Krypton-N/Machine_Learning_U7y8`, rama `main`;
cada push compila y publica en `https://krypton-n.github.io/Machine_Learning_U7y8/` (comprobado: la página carga y navega con
`#/3/3`). **Los commits y los push los hace el usuario**; Claude solo sube si él lo pide expresamente, cada vez. No se sabe si ya sacó la carpeta del repo
grande (`git rm -r --cached` ahí): si `git status` en la carpeta abuela sigue listando estos archivos, falta ese paso.

**Después de cerrar el hito 3 hubo una ronda de correcciones (misma fecha)** que cambió casi todos los números de Adult:
se quitó `fnlwgt` de las variables y se regeneraron todos los JSON. Los hallazgos de abajo ya son los nuevos; las secciones
"Lo que cambió al construir los hitos 0–3" del plan conservan las cifras viejas y el plan lo advierte.

| Hito | Contenido | Diapositivas | Estado |
|---|---|---|---|
| 0 | Base compartida | — | ✅ |
| 1 | A. Bases y B. Bagging | 3, 4, 6–12 | ✅ |
| 2 | C. Random Forest y D. Boosting | 13–19, 21–24 | ✅ |
| 3 | E. Cierre de la parte 1 | 25–28 | ✅ |
| 4 | Puente y F. Fundamentos de series | 29–40 | ✅ |
| **5** | **G. Modelos de series** | **41–50** | **construido; falta la revisión del usuario** |
| 6 | H. HMM | 51–59, 61 y ajustes de la 60 | **construido; falta la revisión del usuario** (`HITO-6.md`) |
| 7 | Apertura, cierre y respaldo | 2, 62–64, R1–R4, ajuste de la 1 | pendiente |
| 8 | Ensayo | cronometrar las 3 clases, exportar a PDF | pendiente |

Ya existían antes de los hitos: 1 (portada), 5, 20 y 60.

## Ronda de correcciones tras el hito 3

Pedida por el usuario después de preguntar si los datos seguían buenas prácticas:

- **Sin `fnlwgt`.** `adult_comun.cargar_adult()` la quita (`EXCLUIDAS`); `cargar_adult_crudo()` devuelve el archivo tal cual.
  Se regeneraron `exportar_datos`, `exportar_hito1`, `exportar_hito2` y `exportar_hito3` (≈ 25 min en total; registro en
  `scripts/cache/regenerar.log`). Las diapositivas leen de los datos cuántas variables hay (13).
- **Bagging con 300 árboles** en la comparación, igual que los demás. Antes iba con 100 y la 27 le atribuía toda la diferencia
  con Random Forest al sorteo de variables.
- **Experimento de ruido con controles** (Random Forest podado, XGBoost profundo) para sostener la frase de la 25.
- **Regla nueva (CLAUDE.md, n.º 8): el dataset se enseña crudo antes de usarlo.** `components/TablaCruda.tsx`. La 3 ganó dos
  clics (`adult.head()` y qué se le cambia) y la 4, uno (las 3 columnas que se dibujan). **Falta aplicarla a pasajeros aéreos
  en el hito 4.**
- **Encabezado:** la unidad y el tema van más grandes y el tema en rojo (`.slide-head .section` en `theme.css`).
- **Zoom en 3D:** `Scene3D` acerca con la rueda (acotado) y regresa con doble clic. Toda escena 3D debe ir dentro de `Scene3D`.
- **Escalas calculadas:** las gráficas de la 14 y la 16 ya no tienen el eje fijo (`ejeQueCubre` en `lib/scale.ts`); con el eje
  fijo los valores nuevos caían fuera. Ojo con esto en cualquier gráfica cuyo eje esté escrito a mano: 8, 11, 12, 21, 22 y 27.
- **Limitaciones que se quedaron como estaban** (dichas al usuario, no pidió cambiarlas): `education` y `education-num` son la
  misma información; el ± sale de una sola partición y una semilla; el umbral es 0.5 fijo; el experimento de ruido es una sola
  realización y solo simétrico; en los scripts de los hitos 1 y 2 el codificador se ajusta con todas las filas antes de la CV.

## Lo que quedó del hito 3 (25–28)

- **25 · Los cinco, lado a lado** (8 clics): siete renglones de concepto y, al final, las mismas columnas con lo medido en
  Adult. **26 · Cómo se comparan** (10 clics): 10 personas de esquema que caen en la matriz, las métricas una por una, el
  modelo que siempre dice "no", la matriz real con botones por modelo y los 5 pliegues. **27 · Los siete modelos**
  (8 clics): F1-macro por pliegue con la escala que se acerca, advertencias, y error contra número de árboles.
  **28 · Cuándo usar cada uno** (6 clics): guía de 5 renglones con evidencia y dispersión tiempo contra F1-macro.
- **Piezas nuevas:** `components/PuntosIntervalo.tsx`, `lib/metricas.ts`, `scripts/exportar_hito3.py` (tarda ≈ 15 min; deja
  registro en `scripts/cache/hito3.log`). JSON nuevos: `matrices_adult`, `curvas_n_estimators`, `ruido_etiquetas`;
  `comparacion_adult` ahora trae el valor de cada pliegue y lo escribe `exportar_hito3.py` (`comparar_ensambles.py` solo imprime).
- **No se hizo:** la revisión de rigor y de claridad "al cerrar el hito" fue una sola pasada propia, no una revisión aparte.
  El puente de la 28 ("¿y si el orden importa?") es una frase; la 29 debe retomarla.

## Después del hito 5

- **Hito 6 (HMM):** plan escrito en `docs/hitos/HITO-6.md` (construido el 2026-10-17); la especificación
  `H-hmm-51-61.md` ya se revisó ahí. Solo `apertura-cierre-respaldo.md` tiene además su revisión aparte
  (`apertura-revisiones.md`), ya incorporada al plan maestro.
- **Dependencias Python:** `statsmodels` (hitos 4, 5 y R3; ya instalado, 0.15.0) y `hmmlearn` (hito 6 y R4; 0.3.3,
  instalado el 2026-10-17: pip lo compila en Python 3.14).
- **Hito 7:** saltos entre diapositivas (`IrA` + contexto en `Deck`), `MapaExposicion` con la marca "vamos aquí" para abrir
  las clases 2 y 3, diapositivas de respaldo con `num` tipo "R1" (hoy `SlideDef.num` es numérico), `src/deck/meta.ts` con
  equipo, grupo, profesor y fecha.

## Pendientes pequeños

- **Revisión visual incompleta.** De las 13–24 se vio en captura el paso final de todas y algunos intermedios; no se vieron
  los pasos de concepto de 13, 14, 15, 16, 17 y 22. Tras corregir las etiquetas con letras griegas no se volvieron a capturar
  19, 21 y 23. De las 3–12 no se recapturaron el esquema de pliegues de la 3, las pelotas de la 10 ni la leyenda de la 12.
  De las 25–28 se vieron en captura: 25 (pasos 6 y 7), 26 (0, 3, 5, 6 y 9, con clase mayoritaria y con XGBoost), 27 (1, 4, 5 y
  7, con Random Forest y XGBoost en las curvas) y 28 (0, 2 con 1 núcleo, y 5). No se vieron los pasos 0–5 de la 25, 1, 2, 4,
  7 y 8 de la 26, 0, 2, 3 y 6 de la 27, ni las curvas de AdaBoost y Gradient Boosting.
  **Tras regenerar los datos sin `fnlwgt`** se capturaron: 3 (pasos 3, 4 y 5), 4 (2 y 3, con zoom), 5 (3), 14 (4), 15 (3), 16 (2),
  22 (2, con ν = 0.3), 24 (4), 25 (7), 26 (9), 27 (4, 5 y 7) y 28 (5). **No se volvieron a ver con los datos nuevos:** 8, 9, 11, 12,
  13, 17 y 23, ni los pasos 6 y 7 de la 3. Sus textos se calculan de los datos y sus ejes se revisaron en el código, pero
  falta verlas en pantalla.
- **Legibilidad a distancia:** nunca se probó en proyector, solo en el panel del navegador.
- **Decisiones que debe dar el usuario:** nombres para la portada, fecha, reparto por expositor.
- El workflow de Pages avisa que `actions/*@v4` (y `configure-pages@v5`) apuntan a Node 20 y se ejecutan forzados en Node 24.
  Es solo un aviso; cuando haya versiones mayores nuevas de esas acciones, subirlas en `.github/workflows/pages.yml`.

## Hallazgos que ya moldearon el contenido (no contradecirlos)

Todos con Adult **sin `fnlwgt`** (13 variables), 5 pliegues estratificados, semilla 42.

- Comparación, sin ajustar y con 300 árboles en los cinco ensambles (accuracy / F1-macro): mayoritaria 0.761 / 0.432 ·
  árbol sin límite 0.819 / 0.750 · bagging 0.848 / 0.783 · RF 0.851 / 0.785 · AdaBoost 0.858 / 0.788 · GB 0.874 / 0.814 ·
  XGBoost 0.874 / 0.817. Desviación entre pliegues ≈ 0.003–0.005.
- Pliegue a pliegue (F1-macro): RF le gana a bagging en 4 de 5 por 0.003 (menos que su ±); AdaBoost queda apenas arriba de
  los dos bosques; GB le gana a RF en 5 de 5 por 0.029; XGBoost le gana a GB en 5 de 5 por 0.003 ± 0.001 (ventaja chica
  pero constante).
- Árbol sin límite: 97.4 % en entrenamiento (ya no 99.99 %: hay personas con los mismos datos y distinta respuesta) y 81.9 % en CV.
- Árbol podado a 8 niveles: accuracy 0.857, **más que RF sin ajustar (0.851)** en los 5 pliegues, pero F1-macro 0.778 contra
  0.785: encuentra a 54 % de quienes ganan más de 50K y RF a 63 %.
- Tamaño de hoja en RF: con hojas de 1 persona 85.0 %; con hojas de al menos 5, 86.6 %. Es la perilla que importa. La curva
  de variables sorteadas es plana (cabe en 0.23 puntos).
- Etiquetas volteadas al azar en entrenamiento (20 %), pérdida de F1-macro: árbol sin límite 0.131 · bagging 0.063 · RF 0.056 ·
  AdaBoost 0.017 · GB 0.015 · XGBoost 0.015 · árbol podado 0.003. Controles: **RF con árboles podados a 8 niveles 0.000 y
  XGBoost con árboles de 20 niveles 0.062.** Lo que daña es la profundidad del árbol, no la forma de combinar. El "evitar
  AdaBoost con ruido" del plan original no se cumplió.
- Error contra número de árboles (CV): RF plano (14.93 % con 300, 14.96 % con 1,000; en entrenamiento 2.6 %); AdaBoost sigue
  bajando hasta 1,000 (13.92 %); GB plano de 300 a 1,000 (12.62 % y 12.55 %); XGBoost mínimo en 168 y sube a 12.89 % con 1,000.
- Un ajuste con las 48,842 personas (20 núcleos / 1 núcleo): árbol 0.16 s · bagging 3.1 s / 29.3 s · RF 1.2 s / 9.3 s ·
  AdaBoost 5.3 s · GB 10.7 s · XGBoost 0.26 s / 0.84 s. Mismo modelo (300 árboles de 6 niveles): sklearn 22.1 s, XGBoost
  0.87 s con 1 núcleo y 0.35 s con 20.
- Correlación entre árboles (30 repeticiones): 0.145 en bagging, 0.122 en RF. Promediar 50 quita el 84 % de la varianza.
- Las 100 raíces de bagging son `relationship` ("¿es esposo?"); con RF se reparten (27 siguen siendo `relationship`).
- Con solo 3 variables, bagging (22.4 % de error) no le gana al árbol de profundidad 3 (19.9 %). La 11 lo dice.
- OOB = CV con 300 árboles (84.85 % contra 84.80 %); con 10 árboles el OOB es pesimista (83.7 % contra 84.3 %).
- Importancia: el ruido puro queda **1.º de 14** según MDI (0.176) y vale 0 con permutación.
- El mejor stump acierta 76.1 %, igual que la clase mayoritaria.
- Tasa de aprendizaje: el mejor punto es casi el mismo con ν = 0.3, 0.1 y 0.03 (log-loss ≈ 0.275); cambia qué tan fácil es
  pasarse. Con ν = 1 el mínimo llega a los 24 árboles y es el peor; con ν = 0.03 todavía baja a los 1,500.
- Faltantes nativos de XGBoost contra rellenados: sin diferencia real en Adult (87.44 % contra 87.42 %).
- La velocidad de XGBoost viene sobre todo de agrupar valores en intervalos, no del paralelismo.
- **Por qué bajaron los bosques al quitar `fnlwgt`** (bagging de 85.6 % a 84.8 %, RF de 85.9 % a 85.1 %): esa columna casi
  no se repite entre personas y funcionaba como un sorteo extra en los cortes profundos, que hacía a los árboles menos
  parecidos (ρ era 0.081 y 0.059). Es una explicación propia, no medida aparte; no está en pantalla.

## Cosas que cuestan tiempo si no se saben

- **Capturas sin animaciones a medias (hito 4):** ya cargada la página, en la consola: buscar en
  `performance.getEntriesByType("resource")` la URL de `motion_react.js`, importarla y poner
  `MotionGlobalConfig.skipAnimations = true`. Después avanzar con las flechas, sin recargar. La primera captura tras un
  cambio suele fallar por tiempo: se repite. Con el tamaño emulado de 1280 × 720 las capturas salieron en mosaico; con el
  tamaño propio del panel (626 × 391), bien pero chicas.
- **Revisar en el navegador (preview):** el panel congela las animaciones cuando no se está capturando. Receta que funciona:
  fijar el tamaño con `resize_window` a 1280×720 y **recargar**; para ir a un paso, `location.hash = '#/NN/paso';
  location.reload()` (el deck solo lee el hash al cargar); esperar ~6 s; tomar una captura desechable a escala 0.15 y luego
  la buena. No encadenar teclas con `browser_batch`: el cambio de hash lo corta. En el hito 3 hicieron falta **dos**
  capturas desechables con 2 s de espera entre ellas (la primera "buena" salía a media animación); cambiar el hash y recargar
  con `javascript_tool` sí se puede encadenar en un mismo `browser_batch`.
- **Scripts de edición largos por Bash:** un heredoc con mucho TSX puede fallar ("unexpected EOF"). Escribir el script con
  Write en la carpeta temporal y ejecutarlo.
- **`Canvas` de R3F** necesita `resize={{ offsetSize: true }}` porque el escenario está escalado con CSS (ya está en `Scene3D`).
- **Cámara de `Adult3DScene`:** con `[6.3, 4.5, 6.9]` se ve la caja completa. Más cerca se corta.
- **El árbol en TypeScript** coincide exacto con sklearn hasta profundidad 5; más profundo difiere a lo más 0.0014 porque
  sklearn desempata cortes iguales al azar. Es esperado y está tolerado en `verificar.ts`.
- **Ejemplos "a mano" (6 puntos de la 6, 8 puntos de AdaBoost):** se encontraron por búsqueda aleatoria con un script
  temporal de `node`, para que el fenómeno ocurra de verdad con las librerías reales. Mismo método si hace falta otro.
- **`fetch_openml("adult")`** ya está en caché en `scripts/cache/` (ignorado por git). Sin caché necesita internet.
- **AdaBoost de sklearn** guarda `ln((1−ε)/ε)`, el doble del α binario que usamos.

## ListKeeper (MCP `list-keeper`)

- Tarea **#255** "Exposición ML — Unidades 7 y 8", en la lista 50 ("5 Semestre").
- Subtarea **195** (diapositivas): ahí se anota el avance al cerrar cada hito. El cierre del hito 4 ya quedó anotado (2026-10-13).
- Subtarea **190** (bloque, equipo, fecha, duración): la duración ya quedó resuelta.
- Nota **80** "Handoff — Estructura exposición ML U7 y U8": la estructura original (v4). El plan vigente es
  `docs/PLAN-DIAPOSITIVAS.md`; la nota no se ha vuelto a actualizar desde entonces.

## Sobre el usuario

- Prefiere avances concretos y resúmenes honestos de lo que no se revisó.
- En esta exposición Claude construye y verifica; él revisa y decide. (En las *prácticas* de otras materias es al revés:
  él corre los comandos primero. Eso no aplica aquí.)
- Si se llena el contexto, prefiere un handoff como este antes que compactar.
