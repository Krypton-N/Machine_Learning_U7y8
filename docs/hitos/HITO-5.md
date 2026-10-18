# Hito 5 — G. Modelos de series (diapositivas 41–50)

**Estado:** En construcción · *(Borrador → Aprobado el 2026-10-13 → En construcción → Cerrado el AAAA-MM-DD)*
**Última actualización:** 2026-10-13

## 1. Alcance

- **Entran 10 diapositivas:** 41 ruido blanco, 42 AR(p), 43 MA(q), 44 ARMA(p,q), 45 ARIMA(p,d,q), 46 identificación con ACF
  y PACF, 47 SARIMA, 48 elegir y evaluar, 49 la línea base y 50 la demo.
- **Abren la clase 3** (41–64). El público llega otro día: la 41 arranca con una línea que recoge dónde quedó la clase 2
  (logaritmo, d = 1, D = 1 y dos huellas, en 1 y en 12). El mapa con la marca "vamos aquí" es del hito 7.
- **Caso:** pasajeros aéreos. **Todo se ajusta con 1949–1959 (132 meses)**; 1960 aparece como un bloque "PRUEBA · 1960"
  sin datos hasta que una diapositiva lo evalúa (45, 47, 48, 49 y 50).
- **Qué deben saber ya al llegar:** la serie y su forma cruda (29), validar hacia adelante y MAE en palabras (30), tendencia
  y estacionalidad (32–34), estacionariedad (35), diferenciar y el símbolo ∇ (36), ADF y p-valor (37), promedio móvil (38),
  ACF con su banda (39) y PACF (40).
- **Términos que la sección F dejó prometidos y aquí se pagan:** ruido blanco (39 → 41), AR y MA como modelos (36 y 38 →
  42 y 43), leer los órdenes en ACF y PACF (39 y 40 → 46), MAE con su fórmula (30 → 48) y la línea base (49).
- **Qué deja listo para después:** `MetricTable`, `PValueScale` y el `SplitDiagram` con varios orígenes, que reutiliza la 62.
- **Fuera a propósito:** KPSS (R3), suavizado exponencial y otros modelos de pronóstico, estimación por máxima verosimilitud
  explicada por dentro (solo se dice qué busca), el filtro de Kalman, búsqueda automática de órdenes (`auto_arima`).

## 2. Lo que se revisó para planear

**Leído:** `CLAUDE.md`, `docs/HANDOFF.md`, las entradas 41–50 y las tablas finales de `docs/PLAN-DIAPOSITIVAS.md`, la
especificación completa `docs/especificaciones/G-modelos-series-41-50.md`, `docs/hitos/HITO-4.md` con su bitácora, y el
código que se va a reutilizar: `lib/series.ts`, `lib/pasajeros.ts`, `lib/rng.ts`, `Lineas`, `SeriesChart`, `Barras`,
`Correlogram`, `LagCloud3D`, `AnioMes3D`, `SplitDiagram`, `Receta`, `scripts/series_comun.py` y `scripts/exportar_hito4.py`.

**Comprobado antes de escribir** (dos scripts temporales de Python y uno de Node, fuera del repo; unos 90 s en total; no se
construyó ninguna diapositiva ni se tocó `src/`). Con `statsmodels` 0.15.0, Python 3.14.2, numpy 2.5.3, scikit-learn 1.9.1:

- **`SARIMAX` ajusta el modelo de aerolínea sin avisos.** Con 1949–1959: θ̂ = −0.348, Θ̂ = −0.562, converge en 21
  iteraciones, sin ninguna advertencia. Su pronóstico coincide con la recursión hecha a mano a 8e-7 (en logaritmo).
- **La rejilla de 16 no converge completa con los valores por omisión:** 2 de 16 avisan (`(1,1,1)(1,1,1)` y
  `(0,1,1)(1,1,0)`). Con `maxiter=500` queda 1; con Nelder-Mead convergen los 16 y **ningún AIC cambia en el segundo
  decimal**. El orden de la rejilla no depende de eso, pero el script tiene que decirlo (sección 4).
- **El candidato sí sale de la ACF y la PACF**, con dos matices que la diapositiva debe decir (46).
- **SARIMA le gana al ingenuo estacional en 1960** (MAE 13.3 contra 47.8) y **la tabla de origen móvil se reproduce**.
- **Seis cosas no salieron como las cuenta la especificación** y cambian el plan:

  | # | Dónde | La especificación dice | Lo que salió | Qué se hace |
  |---|---|---|---|---|
  | 1 | 44 | La ACF teórica del ARMA(1,1) "es la que sigue a las barras"; un AR(1) "se apaga demasiado rápido". Mensaje: parsimonia | En los rezagos 1–8 el ARMA(1,1) sigue a las barras (distancia 0.035), **pero un AR(2) las sigue igual** (0.029) con los mismos dos coeficientes y un AIC una unidad menor (−417.2 contra −416.2). Del rezago 9 en adelante **ninguno** las sigue: las barras se vuelven negativas y la del 12 sale de la banda (−0.24). Contando los 20 rezagos, el AR(1) queda más cerca que el ARMA | El caso no demuestra parsimonia. Se reescribe (decisión 4) |
  | 2 | 45 | El mejor ARIMA por AIC "se queda corto"; MAPE ≈ 12.3 % | La rejilla elige ARIMA(2,1,1), con **raíz MA en 1.002** (los cuatro mejores por AIC la tienen en 1.00). No se queda corto: **se pasa en 9 de 12 meses** y su MAE es 72.3 (MAPE 15.8 %), casi tan malo como repetir el último valor (76.0). **Los nueve ARIMA sin estación pierden contra copiar 1959** (MAE 58 a 72 contra 47.8) | Se cambia de modelo y de frase (decisión 3) |
  | 3 | 45 y 50 | "∇ log todavía no pasa ADF; con la diferencia estacional sí" | Con 132 meses es al revés en las filas frágiles: `∇ log` p = 0.029 (pasa) y `∇₁₂ log` p = 0.096 (no pasa). Firmes: log 0.62 y `∇∇₁₂ log` 0.001 | Es lo que avisó la 37. La 50 lo enseña así (decisión 1) |
  | 4 | 47 | El script exige que el ajuste con 144 meses coincida con el libro (−0.40, −0.61) a ±0.02 | statsmodels da (−0.402, −0.557): Θ difiere en 0.05 (el libro usa otro estimador). Ese `assert` fallaría | Se registra, no se exige. En pantalla no van los valores del libro |
  | 5 | 49 | SARIMA mejora 63 % el RMSE del ingenuo | Cierto (63.3 %). Pero un ingenuo apenas más listo, **el mismo mes de 1959 multiplicado por lo que creció el total de 1958 a 1959 (×1.124)**, da MAE 13.4 y RMSE 16.8: empata con SARIMA en 1960 (13.3 y 18.6) | Se propone enseñarlo (decisión 5) |
  | 6 | 41–45 | Los 132 choques con semilla 41 se reutilizan en 42–45 | Con la semilla 41, el MA(1) de esquema de la 43 (θ = 0.8) saca de la banda **también el rezago 2** (0.17): contradice "la memoria se corta en 1" | La semilla se elige por búsqueda y se documenta (46 y 49 dan un esquema limpio; ver riesgos de la 41) |

- **Dos hallazgos más, que no contradicen pero hay que decidir si se enseñan:**
  - **El elegido por AIC no es el de menor error en 1960.** 6 de los otros 15 SARIMA tienen menor MAE (11.0 a 12.4 contra
    13.3), incluidos algunos con ΔAIC de 6 a 8. Es un solo año y las diferencias son chicas (decisión 7).
  - **Con 3 orígenes la conclusión de la 50 es débil; con 6 es clara.** 1958–1960: SARIMA 5.75 ± 2.05 % de MAPE contra
    8.06 ± 3.51 % del ingenuo (gana 2 de 3). 1955–1960: 4.24 % contra 10.71 % (gana 5 de 6; solo pierde 1958). Con origen
    en 1953 (60 meses) ya no: 10 de 16 ajustes no convergen, la aerolínea entre ellos (decisión 6).

**Problemas que atraviesan toda la especificación** (se corrigen en todas las diapositivas):

- **"Versión corta", "recortable", "si se recorta la 44".** No aplica (regla 5). La 44 no es optativa.
- **Animaciones con reloj y teclas propias:** el corchete que avanza cada 350 ms (43), el cursor que recorre la serie en 6 s
  (43), la tecla R (41). Todo se controla con clic, botones o ↑ ↓, como en el hito 4.
- **Demasiadas piezas nuevas.** Propone 13 compartidas y 4 locales; 8 ya existen con otro nombre (`ImpulseResponse` es
  `Barras`, `LagScatter` es `Dispersion`, `CameraTween` es la prop `vista` de `Scene3D`, `MonthYear3D` es `AnioMes3D`,
  `WalkForward` es `SplitDiagram`). Quedan 3 compartidas nuevas (sección 5).
- **Piezas prohibidas:** `Label3D`, `OrbitControls` propio. Las etiquetas van por `etiquetas` de `Scene3D`.
- **Nombres en inglés en la librería** (`shocks`, `psiWeights`, `simulateArma`, `olsAR`, `maFilter`…). Van en español.
- **Dos scripts, tres JSON y un verificador que corre en el navegador** (`verificarSeries.ts` desde `main.tsx`). Queda un
  script (`exportar_hito5.py`), dos JSON y el `scripts/verificar.ts` de siempre.
- **Cifras escritas en las frases** ("φ̂ = 0.743", "MAPE 2.9 %", "mejora 63 %"). Todas se leen de los datos.
- **Términos usados antes de definirse:** AIC (45, se define en la 48), máxima verosimilitud (43 y 44), deriva (45),
  operador B (45), invertible (43), "mediana" del pronóstico (45), χ² y grados de libertad (48). Cada uno recibe una línea
  donde aparece por primera vez, o no se nombra hasta su diapositiva.
- **Dice que `∇∇₁₂ log` "todavía no tiene notación" hasta la 47.** En este deck la tiene desde la 36: se usa el símbolo,
  acompañado de sus palabras ("logaritmo, sin tendencia ni estación").
- **Regla 8.** No hay dataset nuevo: pasajeros se enseñó crudo en la 29. Lo que cambia aquí es que se aparta 1960, y la 41
  lo dice en pantalla en su primer clic de caso.

| Diapositiva | Se toma de la especificación | Se corrige o se descarta, y por qué |
|---|---|---|
| 41 | Serie simulada con su ACF y el contador; la nube redonda y el pronóstico plano; pasajeros con su ACF fuera de la banda; la ACF de la serie transformada | La semilla 41 no sirve para la 43 (hallazgo 6). Sin tecla R: botón "otra muestra". Se agrega decir qué cambia desde aquí (132 meses) y por qué las barras chicas no coinciden con las de la 39. Pasa de 4 a 5 clics |
| 42 | Botones de φ sobre los mismos choques; el eco φᵏ; el crecimiento anual con la nube y la recta; el plano AR(2) al girar; el pronóstico que regresa a la media | `LagCloud3D` ya existe y su vista "canto" es justo "ayer contra hoy": no hace falta `CameraTween` ni otra nube. El pronóstico de 1960 queda por arriba del real los 12 meses: no se evalúa aquí, pero se lleva la respuesta preparada. No se afirma que el crecimiento anual sea estacionario (ADF p = 0.096) |
| 43 | La cinta de choques; los dos ecos; la tabla "No confundir"; el MA(1) ajustado y su ρ₁ teórico junto a r₁ | Se quita la gráfica de pasajeros con el promedio 2×12: la 38 ya la enseñó y aquí basta la tabla. La predicción a un paso explica solo el 10 % de la variación: se dice. El rezago 3 también sale de la banda: se dice. El corchete se mueve con ↑ ↓. Pasa de 4 a 5 clics |
| 44 | Los tres ecos; la ACF del crecimiento anual con las teóricas encima; que el MA(1) no alcanza (ρ₁ ≤ 0.5) | El caso no demuestra parsimonia (hallazgo 1). La parsimonia se enseña exacta en el concepto y el caso cuenta lo que pasa. Pasa de 3 a 4 clics |
| 45 | La caminata como suma acumulada; el abanico √h; pronosticar el cambio y volver a sumar; destapar 1960 | El modelo y la frase (hallazgo 2). No se usa AIC antes de la 48. No se apoya en ADF (hallazgo 3): lo que delata la estación es r₁₂ = 0.83. Pasa de 4 a 5 clics |
| 46 | La rejilla 3 × 2 teórica y luego con muestras; los dos correlogramas anchos; el triángulo para los rezagos estacionales en vez de color | La lectura "corta en 1" necesita decir que el 3 también sale. Hay dos candidatos, no uno. Se agrega la banda de Bartlett como botón (decisión 2). Pasa de 4 a 5 clics |
| 47 | La rejilla con las dos flechas; las cintas 3D que se transforman; la fórmula expandida con el término 13; el pronóstico con su banda | El destape de 1960 va en clic propio. Se dice lo que el dato enseña: sigue los picos, pero se pasa en 11 de 12 meses. Sin `Label3D`. Pasa de 5 a 6 clics |
| 48 | Las tres preguntas en tres columnas; las métricas con 4 meses de esquema; las dos escalas de p opuestas; la rejilla con ΔAIC | Tres columnas de 540 px con concepto y caso a la vez no caben a 22 px: la fila de concepto se pliega al pasar al caso. Se agrega la franja `Receta` (el componente ya la prevé) y la nota del hallazgo de la decisión 7. Pasa de 6 a 7 clics |
| 49 | El bloque del último año que se copia; la tabla; el recuadro que liga con la clase mayoritaria | La tabla gana renglones (decisión 5) y usa los datos ya medidos del Random Forest de la 30 y del ARIMA de la 45. Pasa de 3 a 4 clics |
| 50 | Las 6 estaciones; el origen móvil; la tabla por año; Ljung-Box por ajuste | La frase de ADF (hallazgo 3). El número de orígenes (decisión 6). `SplitDiagram` en lugar de `WalkForward`. Pasa de 6 a 7 clics |

## 3. Decisiones que necesita el usuario

> **Respondidas el 2026-10-13:** el usuario aprobó el plan en modo plan, sin cambios: queda la opción recomendada (A) en
> las siete decisiones y no objetó los tres avisos.

| # | Decisión | Opciones | Recomendación y por qué |
|---|---|---|---|
| 1 | **Dos tamaños de muestra** (36–40 usan 144 meses; la sección G, 132) | A. La sección G recalcula todo con 132 y lo dice una vez, en la 41 y en la 50 · B. Rehacer 36–40 con 1960 tapado · C. No decir nada | **A.** Es lo que la 30 prometió ("desde la 41, 1960 se guarda"). La 41 enseña qué se mueve y qué no (r₁ pasa de −0.34 a −0.32 y r₁₂ de −0.39 a −0.41; las barras chicas cambian: sale el 9, entra el 35). La 50 repite ADF con 132 y enseña que las dos filas frágiles cambiaron de lado (0.071 → 0.029 y 0.072 → 0.096), justo lo que avisó la 37. B obligaría a tocar un hito cerrado |
| 2 | **Banda del correlograma** | A. La de ruido blanco en todo y la de Bartlett como botón solo en la ACF del caso de la 46 · B. Solo ruido blanco · C. Bartlett en todas | **A.** La de ruido blanco es la que ya conocen (39–41) y la que corresponde a la pregunta "¿esto es ruido?". La de Bartlett es la que dibuja `plot_acf` por omisión, así que quien lo repita en Python verá una banda que se ensancha: conviene haberla nombrado. Con ella solo quedan fuera 1, 3 y 12, que refuerza la lectura. Se calcula en vivo y se compara con statsmodels |
| 3 | **Qué ARIMA sin estación se enseña** (45, 49 y 50) | A. ARIMA(0,1,1) con deriva, fijo · B. El de menor AIC, ARIMA(2,1,1), con su raíz MA en 1.002 · C. El de menor AIC entre los que tienen la raíz MA lejos de 1 | **A.** Es el modelo de aerolínea sin su parte estacional: la 47 solo le agrega el reloj de 12 meses y se ve qué aporta. Su pronóstico se explica completo (un ajuste el primer mes y después +1.01 % mensual). No pide AIC antes de la 48. B enseña un modelo degenerado que oscila con periodo de 9 meses; C depende de un umbral (en 5 de 7 orígenes la raíz queda entre 1.01 y 1.04). Lo de la rejilla se guarda en el JSON y se lleva como respuesta preparada |
| 4 | **El caso de la 44** | A. Contar lo que salió: MA(1) y AR(1) no alcanzan; ARMA(1,1) y AR(2) empatan hasta el rezago 8; ninguno explica el 12. La parsimonia se demuestra exacta en el concepto · B. Dibujar solo los rezagos 1–8 y mantener "el ARMA es el que sigue a las barras" · C. Buscar otra serie para el caso | **A.** B esconde el AR(2) y el hueco en 12, que es justo el puente a la 47. En el concepto la parsimonia es exacta y se calcula: para imitar el eco de un ARMA(1,1) con φ = 0.7 y θ = 0.5, un AR puro necesita 5 coeficientes (1.2, −0.6, 0.3, −0.15, 0.075…) |
| 5 | **Renglones de la tabla de la 49** | A. Cinco: ingenuo estacional, ingenuo con crecimiento, Random Forest de la 30, ARIMA de la 45 y SARIMA · B. Dos, como la especificación: ingenuo estacional y SARIMA | **A.** El ingenuo con crecimiento empata con SARIMA en 1960 (MAE 13.4 contra 13.3; RMSE 16.8 contra 18.6): callarlo sería presumir un 63 % contra una vara baja. Y la lección queda mejor: la línea base debe ser la más alta que salga gratis. La 50 muestra que en 6 años SARIMA sí le gana (decisión 6). El bosque (44.1) y el ARIMA (58.0) enseñan que dos modelos "de verdad" apenas igualan o pierden contra copiar el año pasado |
| 6 | **Cuántos orígenes en la 50** | A. Seis: 1955 a 1960 · B. Tres: 1958 a 1960, como la especificación | **A.** Con tres, "SARIMA gana en promedio" descansa en 2 de 3 años y las desviaciones se enciman. Con seis gana 5 de 6 y 1958 queda como la excepción que es. Todos los ajustes convergen desde 72 meses; con 60 ya no (por eso no se usa 1954). Cuesta 3 columnas más en la tabla y unos 20 s de script |
| 7 | **¿Se dice que el elegido por AIC no fue el mejor en 1960?** | A. Sí, como nota al cierre de la 48 · B. No | **A.** Es la pregunta que haría quien corra la rejilla. La respuesta es parte de la lección: AIC elige sin ver la prueba; escoger entre los 16 mirando 1960 sería usar la prueba para elegir, la misma fuga de la 30. Una línea, con el dato (6 de 15, MAE de 11.0 a 12.4 contra 13.3) |

Además, tres avisos que no necesitan respuesta salvo que no estés de acuerdo:

- **Clics:** 41: 5 · 42: 5 · 43: 5 · 44: 4 · 45: 5 · 46: 5 · 47: 6 · 48: 7 · 49: 4 · 50: 7 (53 en total; la especificación
  suma 44). Suben porque los cierres y los destapes de 1960 van en clic propio.
- **La 48 cambia de distribución:** tres columnas, pero la fila de concepto se pliega a una línea cuando entra el caso.
- **Qué se calcula en el navegador:** todo menos los ajustes de statsmodels (coeficientes, AIC, pronósticos y residuos) y
  el pronóstico del bosque. Las métricas, las ACF y PACF muestrales y teóricas, los ecos, el AR por mínimos cuadrados, la
  banda de Bartlett y Ljung-Box con su p se calculan vivos y se verifican (sección 4).

## 4. Datos

- **Dataset crudo (regla 8).** El mismo de la 29 (`pasajeros.json`, ya en caché y ya enseñado con `TablaCruda`). No se
  repite el `head()`. **Qué se le cambia aquí:** los primeros 132 valores son entrenamiento y los 12 de 1960, prueba; lo
  dice la 41 en su clic 2 con el bloque "PRUEBA · 1960".
- **Dependencias de Python:** ninguna nueva. `statsmodels` 0.15.0 ya instalado y probado con `SARIMAX`, `ARIMA`,
  `AutoReg`, `ArmaProcess` y `acorr_ljungbox`.
- **Script:** `scripts/exportar_hito5.py` (reutiliza `series_comun.py` y `guardar`). Semilla 42. Tarda 1 o 2 minutos (los
  dos scripts de comprobación sumaron 86 s con más ajustes de los necesarios). Registro en `scripts/cache/hito5.log`.
- **Protocolo de convergencia** (va escrito en el script y en el registro):
  - `SARIMAX(..., trend="n").fit(disp=False, maxiter=500)`. Si no converge o avisa, se vuelve a ajustar con
    `method="nm"` y se exige que el AIC de los dos coincida a 0.01; se guarda con qué método quedó.
  - Clase `ARIMA` (43, 44 y 45): `method_kwargs={"maxiter": 1000}`. El AR(1) del crecimiento anual avisa aun así, con los
    mismos parámetros que da `method="innovations_mle"` (φ̂ = 0.751): ante un aviso se ajusta por el segundo método y se
    exige que los parámetros coincidan a 1e-3.
  - `assert`: la aerolínea converge con |θ̂| < 1 y |Θ̂| < 1; es la de menor AIC con 132 meses; `aic == −2·llf + 2k`;
    ningún ajuste del origen móvil ve datos posteriores a su origen. Si un `assert` falla no se arregla en silencio: se
    anota en la bitácora.

| JSON | Qué trae | Lo usan |
|---|---|---|
| `series_modelos.json` | `versiones` · `ma1` (θ̂, error estándar, σ², valores ajustados; 43) · `arma_crecimiento` (AR(1), MA(1), ARMA(1,1) y AR(2) sobre `∇₁₂ log`: coeficientes, constante, AIC, método; 44) · `arima` (el (0,1,1) con deriva: parámetros, pronóstico y banda del 95 % en logaritmo; y `rejilla` de los 9 con AIC y raíz MA mínima; 45) · `sarima_rejilla` (16 × órdenes, AIC, BIC, llf, k, convergencia y pronóstico en logaritmo; 48) · `elegido` (órdenes, regla, θ̂, Θ̂, σ², errores estándar, pronóstico y banda en logaritmo, 119 residuos; 47–50) · `linea_base.bosque` (pronóstico de 1960 del Random Forest de la 30 entrenado con 1949–1959; 49) · `origen_movil` (6 × año, meses de entrenamiento, ΔAIC al segundo, pronósticos en logaritmo de SARIMA y de ARIMA, residuos; 50) · `registro` (la aerolínea con 144 meses, solo como constancia) | 43, 44, 45, 47–50 |
| `referencias_hito5.json` | Solo para `verificar.ts` (no entra a la página): todo lo de "Verificación" | `scripts/verificar.ts` |

  `adf_pasajeros.json` ya trae la tabla con 132 meses (`sensibilidad.sin_1960`): la 50 la toma de ahí.

- **Vivo, esquema o JSON:**
  - *Vivo* (TypeScript sobre `pasajeros.json`): transformaciones con 132 meses, ACF y PACF, bandas, mínimos cuadrados del
    AR(1) y el AR(2) con su pronóstico (42), la recursión del MA(1) (43), ACF y PACF teóricas y ecos (42–46), `exp` de los
    pronósticos, MAE, RMSE, MAPE y mejora (48–50), el ingenuo estacional y el ingenuo con crecimiento (49 y 50), el
    producto θ̂Θ̂ (47), Ljung-Box con su p (48 y 50), la descomposición (50) y todos los textos que citan una cifra.
  - *Esquema con semilla* (`mulberry32`, marcado "Esquema"): los 132 choques y lo que se simula con ellos (41–45), las
    tres muestras de la 46, los 4 meses de la 48 (valores fijos: real 100, 120, 110, 130; pronóstico 104, 114, 112, 110),
    los 3 años de la 49 (una recta más una onda).
  - *JSON:* todo ajuste de statsmodels y el pronóstico del bosque.
- **Verificación** (se agrega a `scripts/verificar.ts`; referencia entre paréntesis):
  - `acf` y `pacf` de las cinco transformaciones con 132 meses (`acf(nlags=36, adjusted=False, fft=False)` y
    `pacf(method="ywm")`), 1e-10. Ya están verificadas con 144; se repite con el tramo que usa esta sección.
  - `bandaBartlett(r, n)` (semiancho de `acf(alpha=0.05, bartlett_confint=True)`), 1e-10.
  - `pesosPsi`, `pesosPi` y `acfTeorica` de cada modelo de esquema (`ArmaProcess.arma2ma`, `.arma2ar` y `.acf`), y la PACF
    teórica como `pacf(acfTeorica(...))` (`ArmaProcess.pacf`), 1e-10.
  - `ajustarAR(z, p)` con p = 1 y 2 y `pronosticarAR` (`AutoReg(z, lags=p, trend="c")`: `params` y
    `predict(start=120, end=131)`), 1e-10.
  - `filtroMA1(w, θ̂)` contra los valores ajustados de statsmodels desde el valor 20 (medido: 1.5e-9; al inicio difieren
    1.4e-3 porque statsmodels no arranca en 0), tolerancia 1e-6.
  - `rmse` y `mape` (`sklearn root_mean_squared_error` y `mean_absolute_percentage_error` × 100) sobre cada pronóstico
    guardado, 1e-9; `mae` ya está verificada.
  - `ljungBox(e, h, gl)` (`acorr_ljungbox(resid, lags=[12, 24], model_df=2)`), 1e-8; `colaChi2(x, k)`
    (`scipy.stats.chi2.sf` en 20 pares), 1e-10.
  - `descomponer` multiplicativa con 132 meses (`seasonal_decompose`), 1e-9.
  - Sin referencia externa: `simularARMA` reproduce sus choques (x_t − Σφx − Σθε = ε_t); `acumular(diferencia(x))`
    devuelve x; `ingenuoEstacional` es igual, elemento por elemento, a los 12 valores anteriores.
  - Afirmaciones que sostienen un texto: las 24 barras de pasajeros salen de la banda; en `∇∇₁₂ log` los dos rezagos
    mayores son 12 y 1; r₂ queda dentro y r₂₄ y r₃₆ también; la aerolínea es el mínimo de AIC y de BIC; 1960 supera a
    1959 en los 12 meses; SARIMA tiene menor MAPE que el ingenuo en 5 de 6 orígenes y pierde en 1958; el p de Ljung-Box
    supera 0.05 en los 6 ajustes.
- **Números "esperados" de la especificación, medidos hoy** (132 meses salvo donde se indica):

  | Dónde | Esperado | Lo que salió |
  |---|---|---|
  | 41 | r₁ ≈ 0.94 y las 24 barras fuera | 0.942; 24 de 24 fuera de ±0.171 |
  | 41 | En `∇∇₁₂ log`: r₁ ≈ −0.317, r₁₂ ≈ −0.410; salen 3 y 23 | −0.317 y −0.410; fuera de ±0.180: 1, 3, 12 y 23 (hasta 36, además 32 y 35) |
  | 42 | Media del crecimiento ≈ 0.121 (12.9 %) | 0.1212 (12.89 %) |
  | 42 | AR(1): 0.0323 y 0.743 · AR(2): 0.0254, 0.579 y 0.222 | 0.0323 y 0.7434 · 0.0254, 0.5791 y 0.2219 |
  | 42 | PACF del crecimiento en 2 ≈ 0.219 sobre la banda 0.179 | 0.219 contra 0.179. El pronóstico va de 0.166 a 0.134 (μ̂ = 0.128); el real de 1960 promedió 0.106 |
  | 43 | θ̂ entre −0.36 y −0.39 | −0.345 (error estándar 0.076); converge sin avisos. ρ₁ teórico −0.308 contra r₁ = −0.317 |
  | 44 | ARMA(1,1): φ ≈ 0.857, θ ≈ −0.284 · AR(1) ≈ 0.726 · MA(1) ≈ 0.477 | 0.857 y −0.249 · 0.751 · 0.495. Lo que no se sostiene es la conclusión (hallazgo 1) |
  | 45 | r₁₂ de `∇ log` ≈ 0.833 | 0.833 (y r₂₄ = 0.714) |
  | 45 | ADF de `∇ log`: no pasa | p = 0.029 con 132 meses (0.071 con 144) |
  | 45 | ARIMA(2,1,1) con raíz MA ≈ −0.999 y MAPE ≈ 12.3 % | Sí es el de menor AIC y sí tiene la raíz en 1.002; MAPE 15.8 %. El (0,1,1) con deriva: MAE 58.0, RMSE 78.7, MAPE 11.3 % |
  | 46 | ACF: −0.317, −0.216 (3), −0.410 (12), −0.030 (24), 0.011 (36) | Iguales. r₂ = 0.109 (dentro) |
  | 46 | PACF: −0.317, 0.009, −0.199 (3), −0.355 (12) | Iguales. En 24: −0.105; en 36: −0.181 (fuera por una milésima). Con Bartlett solo salen 1, 3 y 12 |
  | 47 | θ̂ ≈ −0.33, Θ̂ ≈ −0.58 | −0.348 y −0.562 |
  | 47 | Pronóstico ≈ 419, 399, 467, 455, 473, 547, 622, 629, 527, 462, 407, 452 | 419.3, 398.9, 466.6, 454.4, 473.3, 547.1, 622.2, 630.1, 526.7, 462.3, 406.6, 452.3 |
  | 48 | MAE ≈ 13.2, RMSE ≈ 18.5, MAPE ≈ 2.9 % | 13.26, 18.59 y 2.90 % |
  | 48 | (1,1,0)(0,1,1) y la aerolínea a ≈ 1 de AIC | 0.42. La aerolínea es el mínimo de AIC y de BIC; cuatro modelos a menos de 2 |
  | 48 | BIC con n = 119 | Sí: statsmodels usa las 119 observaciones efectivas |
  | 48 | Ljung-Box: p ≈ 0.55 (12) y 0.69 (24) | 0.74 y 0.67 (Q = 6.84 y 18.59). De la ACF de los residuos solo sale el rezago 23 |
  | 49 | Ingenuo: 47.8, 50.7 y 9.99 %; 12 de 12; mejora 0.63 | 47.83, 50.71 y 9.99 %; 12 de 12; 63.3 % en RMSE (72.3 % en MAE) |
  | 50 | MAPE 1958 / 1959 / 1960: ingenuo 3.1 / 11.1 / 10.0 · SARIMA 7.3 / 6.7 / 2.9 · ARIMA 11.5 / 12.9 / 12.5 | 3.14 / 11.06 / 9.99 · 7.61 / 6.75 / 2.90 · ARIMA(0,1,1): 11.60 / 13.62 / 11.26 |
  | 50 | Crecimiento del total: 12.2, 3.4 y 12.4 % | 12.2 % (1957), 3.4 % (1958), 12.4 % (1959) y 11.2 % (1960) |
  | 50 | En cada origen la regla elige por AIC | En los 6 orígenes (y también con 60 meses) el mínimo de AIC es la aerolínea; el segundo queda a entre 0.37 y 1.22 |

## 5. Piezas

| Pieza | Nueva o existente | Para qué | La usan |
|---|---|---|---|
| `lib/series.ts` | Existente, se amplía (sigue pura) | `choques(n, rand)`, `simularARMA(phis, thetas, choques, calentamiento?)`, `pesosPsi(phis, thetas, K)` (eco), `pesosPi(phis, thetas, K)` (el mismo modelo escrito como AR puro), `acfTeorica(phis, thetas, K)`, `ajustarAR(x, p)` → `{ c, phis, residuos }`, `pronosticarAR(ajuste, x, h)`, `filtroMA1(w, theta)` → `{ choques, prediccion }`, `acumular(d, inicio)`, `bandaBartlett(r, n)`, `rmse`, `mape`, `ingenuoEstacional(x, h, m)`, `colaChi2(x, k)`, `ljungBox(e, h, gl)` → `{ Q, gl, p }`. `simularAR` no se toca (la usan 29, 35 y 40) | 41–50 |
| `lib/pasajeros.ts` | Existente, se amplía | `entrenamiento` (132), `prueba` (12), `TRANSFORMACIONES_ENT` (las mismas cinco con 132 meses), `modelos` (el JSON con sus tipos), `enMiles(log)` | 41–50 |
| `Lineas` / `SeriesChart` | Existentes, se amplían | Opción `areas`: una franja entre dos curvas (la banda del pronóstico). El bloque "PRUEBA · 1960" se hace con `bandas`, que ya existe: la serie simplemente no trae esos 12 valores | 41, 42, 45, 47, 49, 50 |
| `Barras` | Existente, se amplía | `banda` acepta una lista (un ancho por barra, para Bartlett) y `marcas` (un guion por barra, para la curva teórica) | 42–46, 48 |
| `Correlogram` | Existente, se amplía | `teorica` (una o varias curvas con su rótulo), `banda: "blanco" \| "bartlett"`, `marcar` (triángulo en el eje para 12, 24 y 36), `atenuar` (rango de rezagos en segundo plano), `contador` | 41, 43, 44, 46, 48, 50 |
| `LagCloud3D` | Existente, se amplía | `recta` (hoy ≈ a + b · ayer, sobre la pared que se ve en la vista "canto") y `residuos` (un segmento de cada punto al plano) | 42 |
| `AnioMes3D` | Existente, se amplía | `forma: "cintas"` (una línea por año) y `flechas` (del mes anterior y del mismo mes del año anterior a una celda) | 47 |
| `AicGrid` | Nueva | `{ celdas, criterio: "aic" \| "bic", elegido, compacto? }`: 4 × 4 con la diferencia al mínimo, el mínimo con borde rojo y las que quedan a menos de 2 sombreadas | 48, 50 |
| `MetricTable` | Nueva | `{ columnas, filas, destacarColumna?, pie? }`: números tabulares, el mejor de cada columna en rojo, media ± desviación | 49, 50, 62 |
| `PValueScale` | Nueva | `{ p, quiere: "chico" \| "grande", rotulo, h0, ancho }`: eje logarítmico de p con la raya en 0.05 y la zona buscada en rojo | 48, 50 |
| Se reutilizan | Existentes | `SlideFrame`, `Reveal`, `Recap`, `TeX`, `Def`, `Chips`, `Boton`, `Dato`, `Dispersion`, `SplitDiagram`, `Receta`, `Scene3D` (`vista`, `etiquetas`), `useFlechas`, `ejeQueCubre`, `pasoRedondo`, `mulberry32`, `gaussian`, `lib/adult.ts` (la clase mayoritaria de la 49) | — |

**Locales** (en el archivo de su diapositiva): la cinta de choques (43), la suma acumulada que se apila (45), la rejilla
de rezagos con sus dos flechas (47), la tira de errores que se vuelve MAE, RMSE y MAPE (48), el año que se copia (49) y la
línea de 6 estaciones (50).

**Cambios al deck:** ninguno; se registran las 10 diapositivas en `src/slides/index.ts`. **Convenciones:** ninguna cambia.

## 6. Diapositiva por diapositiva

Encabezado común: `section` = `["U8 · Datos secuenciales", "G. Modelos de series"]`; `caso="Pasajeros aéreos"` desde el
primer clic de caso. Las letras griegas en rótulos usan `label natural`. Toda cifra de abajo es la medida hoy; en pantalla
se lee de los datos. En todas las gráficas del caso, 1960 es el bloque "PRUEBA · 1960" hasta el clic que lo destapa.

### 41 · Ruido blanco — `41-ruido-blanco.tsx`, 5 clics

- **Lede:** "La clase pasada: logaritmo, una diferencia y una diferencia estacional. Quedaron dos huellas, en 1 y en 12.
  Antes de modelarlas: ¿cómo se ve una serie en la que ya no queda nada que aprender?"
- **Clics:**
  0. *Concepto.* A la izquierda (1040 px), "Esquema · simulado con ruido normal": 132 valores y, debajo, su ACF de 1 a 24
     con la banda ±0.171 y el contador "k de 24 fuera". A la derecha, las tres condiciones, cada una con sus palabras y su
     fórmula: media cero, misma dispersión siempre, ningún parecido entre momentos distintos. Botón "otra muestra". Línea:
     "con 24 barras, por puro azar sale 1 en promedio: la banda deja fuera al 5 %".
  1. La dispersión "ayer contra hoy" (nube redonda, con su r₁) y, sobre la serie, el pronóstico de los 12 pasos
     siguientes: una línea plana en la media con su franja ±1.96σ. "Si el pasado no dice nada, lo mejor que se puede
     pronosticar es la media, a cualquier distancia."
  2. *Caso.* La serie se cambia por pasajeros 1949–1959 y 1960 queda como bloque "PRUEBA · 1960". Nota de lo que cambia
     desde aquí: 132 meses para ajustar, 12 guardados. La ACF se recalcula: 24 de 24 fuera, r₁ = 0.94; la nube se vuelve
     una diagonal.
  3. La nube se cambia por una segunda ACF: la de `∇∇₁₂ log` (logaritmo, sin tendencia ni estación), 119 valores, banda
     ±0.180. Salen 1, 3, 12 y 23; se rotulan r₁ = −0.32 y r₁₂ = −0.41. Nota: "en la 39, con los 144 meses, salían 1, 3, 9,
     12 y 23: al quitar un año se mueven las barras chicas; 1 y 12 siguen siendo las mayores".
  4. *Cierre.*
- **Recordatorio:** la banda (39), en dos renglones.
- **Visuales:** `SeriesChart` (con `areas` y `bandas`), `Correlogram` con `contador`, `Dispersion`.
- **Datos:** choques, esquema con semilla; lo demás, vivo sobre `entrenamiento`.
- **Cierre:** "Ruido blanco es lo que ya no se puede predecir. Pasajeros está muy lejos de serlo; transformada, casi: quedan
  1 y 12. Un modelo sirve si lo que le sobra parece ruido blanco. Eso se revisa en la 48."
- **Riesgos:** la semilla inicial se elige por búsqueda con tres condiciones (una barra fuera en el ruido, para que "no
  tienen que salir 0" se vea; el MA(1) con θ = 0.8 de la 43 con solo el rezago 1 fuera; el AR(1) con φ = 0.9 con r₁
  cerca de 0.9). **Quedó la 170** (ver la bitácora de la tanda 0; la 46 que se pensaba al planear no sirvió). Se
  documenta en el código. "Otra muestra" puede dar 0 o 3 fuera: es el
  punto. Las diapositivas 42–45 usan siempre los choques de la semilla inicial, no los del botón. El ruido simulado es
  normal e independiente, un caso particular de ruido blanco: se rotula así.

### 42 · AR(p) — `42-ar.tsx`, 5 clics

- **Clics:**
  0. *Concepto.* "Hoy = una fracción φ de ayer + un choque nuevo", con su fórmula y la general de AR(p). A la izquierda,
     "Esquema · los mismos choques de la 41": la serie con botones φ = 0, 0.5, 0.9, −0.6 y 1 (también ↑ ↓). Con 0 es la
     serie de la 41; con 1, la caminata de la 35 y la 37 ("no estacionaria").
  1. "Eco de un choque": barras φᵏ para k de 0 a 20 con el φ elegido. Con 0.9 se apaga despacio; con −0.6 alterna; con 1 no
     se apaga. Condición |φ| < 1 y a dónde regresa: μ = c / (1 − φ).
  2. *Caso.* A la izquierda, el crecimiento anual (`∇₁₂ log`, de 1950 a 1959, 120 valores) con el eje en porcentaje exacto
     y su media (12.9 %). A la derecha, la nube de la 40 mirada de canto: ayer contra hoy, con su recta. φ̂ = 0.74: "si
     este mes se creció mucho respecto al año pasado, el siguiente también".
  3. La cámara gira: aparece el eje de antier y el plano del AR(2), con un segmento de cada punto al plano (lo que el
     modelo no explica). φ̂₁ = 0.58 y φ̂₂ = 0.22. Línea: "en la 40, con la serie simulada, antier no aportaba; aquí, un poco".
  4. *Cierre.* Sobre la serie de la izquierda, el pronóstico del AR(2) para 1960: empieza en 18.1 % y baja hacia su media
     (13.6 %). 1960 sigue tapado.
- **Recordatorio:** regresión (40), un renglón: aquí las variables son la propia serie, uno y dos pasos atrás.
- **Visuales:** `SeriesChart`, `Barras` (eco), `LagCloud3D` con `recta`, `plano` y `residuos` dentro de `Scene3D`.
- **Datos:** esquema (`simularARMA`); caso vivo (`ajustarAR`, `pronosticarAR`), verificado contra `AutoReg`.
- **Cierre:** "Un AR es una regresión de la serie sobre su propio pasado. Su pronóstico regresa a la media: el pasado
  reciente pesa, pero cada vez menos."
- **Riesgos:** no se afirma que el crecimiento anual sea estacionario (ADF p = 0.096); el modelo final usa además la otra
  diferencia. Los coeficientes son de mínimos cuadrados y se rotulan así; statsmodels por máxima verosimilitud da 0.751,
  0.585 y 0.222. Con φ = 1 la serie se aleja: el eje se recalcula con transición. **Respuesta preparada, sin mostrar:**
  ese pronóstico quedó por arriba del real en los 12 meses de 1960 (el crecimiento real promedió 11.2 %); llevado a
  pasajeros, MAE 19.3. La vista de canto se mira desde el lado en que "ayer" crece hacia la derecha (bitácora del hito 4).

### 43 · MA(q) — `43-ma.tsx`, 5 clics

- **Clics:**
  0. *Concepto.* "Hoy = el choque de hoy + θ veces el choque de ayer", con su fórmula y la general de MA(q). "Esquema · los
     mismos choques": abajo, 24 choques; arriba, cada valor armado con dos tramos (el choque de hoy en gris y θ por el de
     ayer en rojo). Un corchete abarca [t − 1, t] y se mueve con ↑ ↓ (botón "recorrer"). Botones θ = 0.8 y −0.6.
  1. Dos ecos lado a lado: AR(1) con 0.6 (se apaga poco a poco) y MA(1) con 0.6 (dos barras y después, cero exacto). "Un
     choque dura q + 1 periodos y desaparece."
  2. La tabla "No confundir", 4 renglones: qué promedia (lo observado / choques que no se ven), si usa el futuro (sí,
     centrado / no), para qué sirve (describir la tendencia / pronosticar) y sus pesos (fijos / estimados). Liga con la 38.
  3. *Caso.* `∇∇₁₂ log` (119 meses) y, encima, la predicción a un paso del MA(1) ajustado: θ̂ = −0.35. Un cursor (↑ ↓)
     enseña de dónde sale cada predicción: θ̂ por el error del mes anterior. "Si el mes pasado quedó arriba de lo esperado,
     este mes se espera una corrección hacia abajo." Y el dato: esa predicción explica el 10 % de la variación; el resto
     es choque nuevo.
  4. *Cierre.* La ACF de `∇∇₁₂ log` de 1 a 11 con una marca en el ρ₁ teórico del MA(1) ajustado (−0.31) junto a la barra
     observada (−0.32). Del 2 en adelante la teórica vale 0; en los datos sale además el 3 (−0.22).
- **Recordatorio:** ninguno (la tabla del clic 2 hace ese papel).
- **Visuales:** cinta de choques (local), `Barras` × 2, tabla, `SeriesChart` con `cursor`, `Correlogram` con `teorica`.
- **Datos:** esquema; θ̂ de `series_modelos.json`; la recursión y ρ₁ = θ / (1 + θ²), vivos.
- **Cierre:** "Un MA recuerda choques, no valores, y solo los últimos q. Su huella: una ACF que se corta. Mismo nombre que
  el promedio móvil de la 38; otra cosa."
- **Riesgos:** θ̂ lo estima statsmodels; "cómo" se dice en una línea ("el θ con el que los datos resultan más creíbles; la
  48 le pone nombre"). La recursión de la pantalla arranca con error 0 y la de statsmodels no: difieren al inicio (hasta
  0.0014) y coinciden desde el mes 10 (1e-7); se rotula "predicción a un paso". Convención de signo: aquí y en statsmodels
  es +θ; Box y Jenkins escriben −θ (respuesta preparada). Invertible no se nombra en pantalla.

### 44 · ARMA(p,q) — `44-arma.tsx`, 4 clics

*Se describe con la opción A de la decisión 4.*

- **Clics:**
  0. *Concepto.* La fórmula con sumas (sin operador B) y tres ecos lado a lado, "Esquema · teórico": AR(1) con φ = 0.7,
     MA(1) con θ = 0.5 y ARMA(1,1) con los dos. En el tercero se rotula ψ₁ = φ + θ = 1.2. "El MA ajusta el primer rebote;
     el AR, cómo se apaga después."
  1. *Parsimonia.* El mismo ARMA(1,1) escrito como AR puro: barras de sus coeficientes (1.2, −0.6, 0.3, −0.15, 0.075…).
     "Para imitarlo con un AR hacen falta 5 coeficientes antes de que el siguiente pese menos de 0.05. El ARMA usa 2."
  2. *Caso.* La ACF del crecimiento anual, rezagos 1 a 20, en barras; encima, la ACF teórica de cada modelo ajustado, con
     botones MA(1), AR(1), ARMA(1,1) y AR(2). MA(1): su ρ₁ es 0.40 contra 0.74 observado (nunca pasa de 0.5). AR(1): baja
     más rápido que las barras.
  3. *Cierre.* ARMA(1,1) y AR(2) encendidos: los dos siguen a las barras hasta el rezago 8. Después, ninguno: las barras se
     vuelven negativas y la del 12 sale de la banda (−0.24). "Eso no es de corto plazo: es del año. Diapositiva 47."
- **Recordatorio:** ninguno.
- **Visuales:** `Barras` × 3 y la de coeficientes, `Correlogram` con `teorica` y `atenuar`.
- **Datos:** teóricas, vivas (`pesosPsi`, `pesosPi`, `acfTeorica`); coeficientes, `series_modelos.json`.
- **Cierre:** "Mezclar AR y MA da formas que cada uno por separado solo imita con muchos coeficientes. En pasajeros, dos
  coeficientes bastan para el corto plazo, de una forma o de otra. Cómo elegir entre candidatos: 48."
- **Riesgos:** las curvas son la ACF teórica con los parámetros estimados, no un ajuste a las barras: se rotula. No se
  muestra AIC (llega en la 48); respuesta preparada: AR(2) −417.2, ARMA(1,1) −416.2, AR(1) −413.2, MA(1) −365.4. Cuatro
  curvas sobre 20 barras saturan: se encienden con botones y las apagadas bajan de opacidad.

### 45 · ARIMA(p,d,q) — `45-arima.tsx`, 5 clics

*Se describe con la opción A de la decisión 3.*

- **Clics:**
  0. *Concepto.* "Esquema · los mismos choques": abajo los choques como barras; arriba, la caminata que resulta de
     sumarlos uno tras otro. Botones "integrar" y "diferenciar": las barras se apilan y forman la serie, o la serie
     regresa a barras. "ARIMA(p,d,q): se diferencia d veces, se modela con un ARMA(p,q) y se vuelve a sumar."
  1. El pronóstico de la caminata: plano en el último valor, con un abanico de ±1.96σ√h a 24 pasos. "Al sumar errores, la
     incertidumbre crece con la distancia."
  2. *Caso.* `∇ log` (131 cambios mensuales): ya no sube, pero repite un dibujo cada año; al lado, su ACF con r₁₂ = 0.83
     rotulado. Debajo, lo que pronostica un ARIMA(0,1,1) con deriva para 1960, en 12 barras: 0.043 el primer mes y 0.0101
     en los demás. Deriva: "el cambio promedio por mes: +1.01 %". Recuadro del operador B.
  3. Las 12 barras se apilan desde el logaritmo de diciembre de 1959 y se convierten en la curva de pasajeros (en miles),
     con su banda del 95 %.
  4. *Cierre.* Se destapa 1960. La curva pasa por en medio de la onda: se queda corta de abril a septiembre (173 mil en
     julio) y se pasa de octubre a marzo. MAE 58.0.
- **Recordatorio:** operador B, dos renglones: B es "el valor anterior"; (1 − B) y = y de hoy − y de ayer = ∇y. Se usa
  en la 47.
- **Visuales:** suma acumulada que se apila (local, con `Barras` y `SeriesChart`), `SeriesChart` con `areas`,
  `Correlogram` chico.
- **Datos:** esquema; `series_modelos.json.arima`; `exp` y la suma acumulada, vivos.
- **Cierre:** "Diferenciar, modelar y volver a sumar: la I resolvió la tendencia. Lo que este modelo no puede ver es que
  cada verano sube: falta el rezago 12."
- **Riesgos:** la banda del 95 % es enorme (en diciembre, de 198 a 1 128 mil): el eje vertical se fija con los datos y la
  banda se recorta, con la nota "la banda sigue hasta 1 128". Sus 12 reales caen dentro: no es mérito, es una banda que no
  compromete nada; se dice. El abanico √h es exacto solo para la caminata; en el caso crece más rápido (×4.3 a 12 meses
  contra ×3.5) y se dice "crece", no "como √h". `exp` del pronóstico en logaritmo es la mediana: se rotula "pronóstico" y
  la precisión va en la respuesta preparada. **Respuestas preparadas:** por qué (0,1,1) y no el de menor AIC (decisión 3);
  ADF de `∇ log` con 132 meses da p = 0.029 y aun así la estación sigue ahí.

### 46 · Identificación con ACF y PACF — `46-identificacion.tsx`, 5 clics

- **Clics:**
  0. *Concepto.* "Esquema · teórico": rejilla de 3 renglones (AR(2) con 0.5 y 0.3; MA(1) con −0.6; ARMA(1,1) con 0.7 y
     0.4) por 2 columnas (ACF y PACF). A la derecha, la tabla de reglas: AR(p), la PACF se corta en p y la ACF decae;
     MA(q), la ACF se corta en q y la PACF decae; ARMA, las dos decaen. Entra renglón por renglón, con la que se corta
     subrayada.
  1. Las mismas seis con una muestra simulada de 132 valores de cada modelo (barras), la teórica como marca fina y la
     banda. Botones "teórica / muestra" y "otra muestra". "Con datos, las barras tiemblan: esto propone candidatos, no
     decide."
  2. *Caso.* Dos correlogramas anchos de `∇∇₁₂ log` (119 valores, rezagos 1 a 36): ACF arriba y PACF abajo; del 12 en
     adelante, atenuados. Corto plazo: la ACF sale en 1 (−0.32) y el 2 ya está dentro (0.11): q = 1. La PACF hace lo mismo
     (−0.32 y 0.01): también podría ser p = 1. El 3 sale en las dos (−0.22 y −0.20): "con 36 barras, unas 2 salen por azar".
  3. Se marcan 12, 24 y 36 con un triángulo y se atenúa lo demás. ACF: −0.41, −0.03 y 0.01 (se corta en 12): Q = 1. PACF:
     −0.36, −0.10 y −0.18 (no se corta limpio). "Se lee igual que el corto plazo, pero contando en años."
  4. *Cierre.* Botón "banda de Bartlett" sobre la ACF: la banda se ensancha con el rezago y solo quedan fuera 1, 3 y 12.
     Al pie, los dos candidatos: SARIMA(0,1,1)(0,1,1)₁₂ y SARIMA(1,1,0)(0,1,1)₁₂.
- **Recordatorio:** PACF (40), un renglón: lo que aporta el rezago k cuando ya se cuentan los de en medio.
- **Visuales:** `Correlogram` × 6 chicos y × 2 anchos (`teorica`, `marcar`, `atenuar`, `banda`), tabla de reglas.
- **Datos:** teóricas, vivas; muestras, esquema con semilla (100 valores de calentamiento); caso, vivo.
- **Cierre:** "La que se corta dice el orden. En pasajeros: un MA(1) de meses, o un AR(1), y un MA(1) de años. Qué
  significa la parte de años: 47. Cuál de los dos candidatos: 48."
- **Riesgos:** seis gráficas chicas: etiquetas de 15 px o más, un solo eje rotulado por columna, 20 rezagos. Las semillas
  iniciales de las tres muestras se buscan para que la huella se reconozca sin quedar perfecta, y se documentan. La banda
  de Bartlett se explica en una línea ("si ya aceptamos que hay parecido en los rezagos anteriores, las barras siguientes
  son más inciertas; es la que dibuja `plot_acf`") y solo aplica a la ACF. El rojo ya significa "fuera de la banda": los
  rezagos estacionales se marcan con triángulo, no con color. Nada se "demuestra" con estas gráficas: se dice "candidatos".

### 47 · SARIMA — `47-sarima.tsx`, 6 clics

- **Clics:**
  0. *Concepto.* "Esquema": rejilla de 12 meses por 5 años con una celda en rojo y dos flechas: a la de su izquierda (el
     mes anterior) y a la de arriba (el mismo mes del año anterior); en enero, la primera da la vuelta a diciembre. A la
     derecha, la notación SARIMA(p,d,q)(P,D,Q)ₛ con la parte de meses en gris y la de años en rojo, y `∇ₛ`.
  1. *Caso · 3D.* 11 cintas (1949–1959) del logaritmo: el mes a lo ancho, el año al fondo. Las dos flechas sobre julio de
     1955. "Cada año repite la forma y sube un escalón."
  2. `∇₁₂`: cada celda menos la del año anterior. La cinta de 1949 desaparece ("sin año anterior"), la forma del verano se
     va y cada cinta queda casi plana, a su altura.
  3. `∇` después: las cintas quedan como ruido alrededor de 0. A la derecha, el modelo de aerolínea con θ̂ = −0.35 y
     Θ̂ = −0.56: primero en palabras y en su forma desarrollada (choque de hoy + θ̂ por el del mes pasado + Θ̂ por el de hace
     un año + θ̂Θ̂ = 0.20 por el de hace 13 meses) y, debajo, en su forma corta con B.
  4. La escena se reduce y entra la gráfica de 1957 a 1960 en miles: el pronóstico de 1960 con su banda del 95 %, todavía
     sobre el bloque de prueba.
  5. *Cierre.* Se destapa 1960. Julio: 622.2 pronosticado, 622 real. Y lo que también dice el dato: se pasó en 11 de 12
     meses (supuso crecer 14.0 % y se creció 11.2 %) y marzo quedó fuera de la banda.
- **Recordatorio:** ninguno (B se explicó en la 45).
- **Visuales:** rejilla de rezagos (local), `AnioMes3D` en forma "cintas" con `flechas` dentro de `Scene3D`, `SeriesChart`
  con `areas`.
- **Datos:** transformaciones, vivas; coeficientes, pronóstico y banda, `series_modelos.json.elegido`.
- **Cierre:** "Un reloj de meses y otro de años. Con dos coeficientes, el pronóstico tiene la onda que al ARIMA de la 45
  le faltaba. ¿Es el mejor modelo? ¿Qué tan bueno es? Diapositiva 48."
- **Riesgos:** la 36 ya enseñó estas transformaciones como superficie: lo nuevo aquí son las flechas (dos direcciones de
  memoria), y ahí va el tiempo; los clics 2 y 3 se pasan rápido. Cámara lejos y ángulo angosto (bitácora del hito 4);
  etiquetas solo en 3 meses y 3 años. Las celdas sin dato no se dibujan. El término del rezago 13 no es un coeficiente
  libre: sale del producto. "Modelo de aerolínea" es el nombre que le dieron Box y Jenkins, que lo propusieron para esta
  serie: se dice. Los valores del libro no van a pantalla (hallazgo 4). La banda transformada con `exp` no es simétrica.

### 48 · Elegir y evaluar — `48-elegir-y-evaluar.tsx`, 7 clics

*Fundamento. Se describe con la opción A de la decisión 7.*

- **Distribución:** arriba, la franja `Receta` con "Validación" y "Métrica" resaltadas. Debajo, tres columnas con su
  pregunta como encabezado: "¿Qué órdenes?", "¿Pronostica bien?" y "¿Dejó algo sin explicar?". En los clics 0 a 2 cada
  columna muestra su concepto a toda la altura; en el 3 la fila de concepto se pliega a una línea (la fórmula) y el caso
  ocupa el resto.
- **Clics:**
  0. *Concepto · columna 1.* AIC y BIC con su fórmula y su lectura: premian que el modelo haga creíbles los datos y cobran
     por cada parámetro; BIC cobra más. Menor es mejor. Regla: solo se comparan modelos sobre la misma serie y con las
     mismas diferencias.
  1. *Columna 2.* MAE, RMSE y MAPE con 4 meses de esquema: las barras de error se vuelven valor absoluto y se promedian
     (MAE 8); al cuadrado, promedio y raíz (RMSE 10.7); divididas entre el real (MAPE 6.5 %). El error grande del mes 4 es
     lo que separa RMSE de MAE.
  2. *Columna 3.* Ljung-Box: junta las primeras h barras de la ACF de los residuos en un solo número, Q; si los residuos
     fueran ruido blanco, Q sería chico. Dos escalas de p, una sobre otra: en ADF se quiere p < 0.05; aquí, p > 0.05.
  3. *Caso · columna 1.* La rejilla de 16 SARIMA(p,1,q)(P,1,Q)₁₂ con su diferencia de AIC al mínimo; botones AIC y BIC.
     El mínimo de los dos es la aerolínea; el otro candidato de la 46 queda a 0.42; cuatro a menos de 2 ("diferencias así
     no distinguen modelos").
  4. *Columna 2.* Los 12 errores de la aerolínea en 1960 y las tres métricas: MAE 13.3 mil, RMSE 18.6 mil, MAPE 2.9 %.
  5. *Columna 3.* La ACF de los 119 residuos (solo sale el 23) y Q con su p en la escala: 0.74 con 12 rezagos y 0.67 con
     24. No se rechaza.
  6. *Cierre*, con la nota: "6 de los otros 15 habrían tenido menor error en 1960 (MAE de 11.0 a 12.4). Elegir entre los 16
     mirando 1960 sería usar la prueba para elegir: la fuga de la 30."
- **Recordatorio:** verosimilitud, dos renglones: qué tan creíbles resultan los datos con los parámetros elegidos; estimar
  es buscar los parámetros que la hacen máxima.
- **Visuales:** `Receta` (franja), `AicGrid`, tira de errores (local), `PValueScale` × 2 y × 1, `Correlogram`.
- **Datos:** rejilla y residuos, `series_modelos.json`; métricas, Q y p, vivos (`rmse`, `mape`, `ljungBox`).
- **Cierre:** "AIC elige sin tocar la prueba. La prueba mide. Ljung-Box revisa lo que sobró. Y falta una cosa: ¿13.3 es
  poco o mucho? Depende de contra qué se compare: 49."
- **Riesgos:** es la más densa: cada columna entra sola y el pliegue se prueba a tamaño real. k cuenta también la varianza
  (3 en la aerolínea) y BIC usa las 119 observaciones efectivas: va al pie de la rejilla. "Menos de 2" es una regla
  práctica, no una prueba. p > 0.05 es "sin evidencia de parecido", no "es ruido blanco". Se descartan los 13 primeros
  residuos (son el arranque del filtro: el primero vale 4.7 y el 13.º, −2.4). Los grados de libertad son h menos 2
  coeficientes: sin restarlos, p sería 0.87 y 0.77; no cambia la lectura. AIC va en logaritmo y las métricas en miles:
  cada bloque lleva su unidad. No se compara el AIC de la 45 con estos (otras diferencias). MAPE falla si el real se
  acerca a 0; aquí el mínimo es 104.

### 49 · La línea base — `49-linea-base.tsx`, 4 clics

*Se describe con la opción A de la decisión 5.*

- **Clics:**
  0. *Concepto.* "Esquema": 3 años de barras con tendencia y onda; el último año se desliza 12 lugares y queda, punteado,
     como pronóstico. La fórmula del ingenuo estacional. Recuadro.
  1. *Caso.* 1958–1960 en miles: 1959 copiado sobre 1960 y, después, el real. Se queda corto los 12 meses: no sabe que el
     tráfico crece. MAE 47.8.
  2. La tabla, renglón por renglón (MAE, RMSE, MAPE), cada uno con su línea en la gráfica: ingenuo estacional (47.8, 50.7,
     9.99 %) · ingenuo con crecimiento, 1959 por lo que creció el total el año anterior, ×1.124 (13.4, 16.8, 2.95 %) ·
     Random Forest de la 30 (MAE 44.1) · ARIMA de la 45 (58.0, 78.7, 11.26 %) · SARIMA (13.3, 18.6, 2.90 %).
  3. *Cierre.* Se resalta la mejora de SARIMA sobre cada línea base: 72 % en MAE contra copiar el año pasado; contra la
     que además sabe del crecimiento, un empate. "¿Fue suerte de 1960? Siguiente diapositiva."
- **Recordatorio:** línea base: en Adult, decir siempre "no" acertaba 76.1 % sin aprender nada (26); todo modelo se medía
  contra eso.
- **Visuales:** el año que se copia (local), `SeriesChart` con rótulo al final de cada línea, `MetricTable`.
- **Datos:** ingenuos y métricas, vivos; bosque, ARIMA y SARIMA, `series_modelos.json`; 76.1 %, `lib/adult.ts`.
- **Cierre:** "Un modelo que no le gana a la regla más simple no aporta. Y la vara debe ser la más alta que salga gratis:
  aquí, copiar el año pasado y subirlo lo que venía creciendo."
- **Riesgos:** cinco líneas más la real en una gráfica: solo se dibuja la del renglón señalado y la de SARIMA. El bosque
  de la 30 usó otro corte en pantalla (1958); aquí se entrena con 1949–1959 y se dice. El ingenuo con crecimiento usa
  solo datos anteriores a 1960. "Mejora" es 1 − error del modelo / error de la línea base, y se rotula con su métrica.

### 50 · Demo: de la serie al pronóstico — `50-demo-series.tsx`, 7 clics

*Se describe con la opción A de las decisiones 1 y 6.*

- **Clics:**
  0. *Receta.* Una línea con 6 estaciones y la diapositiva donde se vio cada una: transformar (34 y 36) · ¿estacionaria?
     (37) · identificar (46) · elegir (48) · pronosticar y comparar (47 y 49) · diagnosticar (48). Un renglón por estación.
  1. *Caso · estaciones 1 y 2.* A la izquierda, la descomposición multiplicativa de 1949–1959 en tres franjas. A la
     derecha, la tabla de ADF con 132 meses: 0.99, 0.62, 0.029, 0.096 y 0.001. Texto: firmes la segunda (no) y la última
     (sí); las dos de en medio cambiaron de lado respecto a la 37 (0.071 y 0.072), como se avisó. Que haga falta D = 1 lo
     dice el patrón por mes (r₁₂ = 0.83 en `∇ log`), no ADF.
  2. *Estaciones 3 y 4.* ACF y PACF en chico con 1 y 12 anotados; la rejilla de AIC compacta; en grande, el elegido.
  3. *Estación 5.* Arriba, el origen móvil: seis renglones, de "1949–1954 → 1955" a "1949–1959 → 1960". Abajo, la gráfica
     del año señalado (botones o ↑ ↓; empieza en 1960): real, SARIMA, ARIMA e ingenuo. "En cada origen todo se vuelve a
     estimar solo con el pasado."
  4. La tabla: MAPE de cada año y media ± desviación para ingenuo estacional, ARIMA(0,1,1) con deriva y SARIMA. Promedio:
     10.7 %, 11.9 % y 4.2 %. SARIMA gana 5 de 6. Se señala 1958: el ingenuo gana (3.1 % contra 7.6 %), con el dato al
     pie: ese año el total creció 3.4 %, contra 12.2 % el anterior.
  5. *Estación 6.* Seis escalas de p: Ljung-Box (24 rezagos) de los residuos de cada ajuste, todas a la derecha de 0.05
     (de 0.67 a 0.93).
  6. *Cierre.*
- **Recordatorio:** ninguno.
- **Visuales:** línea de estaciones (local), `SeriesChart` × 3 (franjas), tabla de ADF, `Correlogram` × 2 chicos,
  `AicGrid` compacta, `SplitDiagram`, `SeriesChart`, `MetricTable`, `PValueScale` × 6.
- **Datos:** descomposición, ingenuo y métricas, vivos; ADF, `adf_pasajeros.json` (`sensibilidad.sin_1960`); pronósticos
  y residuos por origen, `series_modelos.json.origen_movil`.
- **Cierre:** "La receta completa, de la serie cruda al pronóstico evaluado. SARIMA gana en promedio, no todos los años:
  por eso se evalúa en varios orígenes y siempre contra una línea base."
- **Riesgos:** cada estación reemplaza a la anterior; nada se amontona. Seis años es poco: se dice "seis años", y la
  desviación es poblacional como en la parte 1. Lo de 1958 se presenta como hecho de los datos; no se le atribuye causa.
  En los seis orígenes el mínimo de AIC es la aerolínea: se dice, porque es lo que hace legítimo fijar el modelo. La tabla
  tiene 3 renglones por 6 años más el promedio: se revisa que quepa a 22 px. Cuatro líneas en la gráfica: gris continuo,
  punteado, discontinuo y rojo, con rótulo al final y 3 px de grosor.

## 7. Orden de construcción

- [x] **Tanda 0 · Base.** `scripts/exportar_hito5.py` con sus dos JSON y su registro; lo nuevo de `lib/series.ts` y
  `lib/pasajeros.ts`; las comprobaciones en `scripts/verificar.ts`; `areas` en `Lineas` y `SeriesChart`; lo nuevo de
  `Barras` y `Correlogram`; búsqueda y registro de la semilla de los choques. Volver a ver la 39 y la 40 (usan
  `Correlogram`) y una de las que usan `Barras`.
- [x] **Tanda 1 · 41, 42, 43 y 44.** Con ellas: `recta` y `residuos` en `LagCloud3D`.
- [x] **Tanda 2 · 45, 46 y 47.** Con ellas: la forma "cintas" y las flechas de `AnioMes3D`.
- [x] **Tanda 3 · 48, 49 y 50.** Con ellas: `AicGrid`, `MetricTable` y `PValueScale`.
- [ ] **Cierre del hito** (ver sección 8).

Cada tanda termina con `npm run build`, `npm run verify` y sus diapositivas vistas clic por clic. Es probable que el hito
lleve más de una sesión: al cortar, se marcan las casillas y se anota en la bitácora por dónde seguir.

## 8. Cómo se da por terminado

1. `npm run build` sin errores y `npm run verify` con "Todo coincide".
2. Las 10 diapositivas vistas en el navegador clic por clic, sin errores en consola ni textos encimados; además la 39, la
   40 y una con `Barras`.
3. Revisión de rigor (cada afirmación en pantalla tiene su dato) y de claridad (se entiende desde cero).
4. Bitácora de abajo al día, con lo que **no** se revisó.
5. `docs/HANDOFF.md`, `CLAUDE.md` ("Piezas disponibles") y la subtarea 195 de ListKeeper actualizados. En
   `docs/PLAN-DIAPOSITIVAS.md` se corrigen las entradas que cambian: 43 (sin la gráfica del 2×12), 44 (el caso), 45 (el
   modelo y "se queda corto"), 46 (dos candidatos y Bartlett), 47 (el destape), 48 (la nota), 49 (los renglones), 50 (seis
   orígenes y ADF con 132), la tabla de componentes y el "protocolo fijo" (origen móvil 1955–1960).
6. Recordarle al usuario que nada se publica hasta que haga commit y push.

## 9. Bitácora

### 2026-10-13 · Antes de construir (comprobaciones para escribir el plan)

- **Hecho:** dos scripts temporales de Python y uno de Node en la carpeta temporal de la sesión. No se tocó `src/`, no se
  instaló nada y no se construyó ninguna diapositiva.
- **Hallazgos** (los que cambian el plan están en la sección 2; aquí, los números completos):
  - **Aerolínea con 132 meses:** θ̂ = −0.3483 (error estándar 0.081), Θ̂ = −0.5624 (0.094), σ̂² = 0.0013; llf 223.63,
    AIC −441.25, BIC −432.92 (con n = 119). Con 144 meses: −0.4017 y −0.5567.
  - **Pronóstico de 1960:** se pasa en 11 de 12 meses (solo abril queda corto); error medio −12.2; la suma del año queda
    2.6 % arriba. 11 de 12 reales dentro de la banda del 95 % (marzo fuera: 419 contra 423.6–513.9) y los mismos 11
    dentro de la del 80 %.
  - **Rejilla de 16**, por AIC: (0,1,1)(0,1,1) 0.00 · (1,1,0)(0,1,1) 0.42 · (1,1,1)(0,1,1) 1.74 · (0,1,1)(1,1,1) 1.79 ·
    (1,1,0)(1,1,1) 2.31 · (1,1,1)(1,1,1) 3.57 · (0,1,1)(1,1,0) 6.48 · (1,1,0)(1,1,0) 7.34 · (1,1,1)(1,1,0) 8.46 ·
    (0,1,0)(0,1,1) 11.00 · (0,1,0)(1,1,1) 12.98 · (0,1,0)(1,1,0) 20.91 · los cuatro sin parte estacional, de 31.4 a 42.2.
    MAE en 1960 de los 12 primeros: entre 11.0 y 15.7; de los cuatro últimos: entre 31.7 y 38.6, y su Ljung-Box rechaza
    (p ≤ 0.001).
  - **ARIMA sin estación con deriva** (AIC · raíz MA mínima · MAE en 1960): (2,1,1) −246.5 · 1.002 · 72.3 — (1,1,2)
    −242.1 · 1.000 · 65.9 — (2,1,2) −240.6 · 1.000 · 63.9 — (0,1,2) −229.5 · 1.001 · 69.4 — (1,1,1) −221.1 · 1.150 · 58.7
    — (2,1,0) −216.6 · — · 59.1 — (0,1,1) −216.5 · 3.876 · 58.0 — (1,1,0) −214.7 · — · 58.2 — (0,1,0) −212.0 · — · 62.1.
    El (2,1,1) tiene raíces AR complejas con periodo de 9.1 meses. Con los valores por omisión avisan (1,1,2) y (2,1,2);
    con `maxiter=1000`, ninguno.
  - **Crecimiento anual (44):** distancia media entre la ACF teórica y las barras en los rezagos 1–8 / 9–20: AR(1)
    0.113 / 0.156 · MA(1) 0.412 / 0.145 · ARMA(1,1) 0.035 / 0.229 · AR(2) 0.029 / 0.217.
  - **Líneas base en 1960** (MAE): media de entrenamiento 213.7 · último valor 76.0 · ARIMA(0,1,1) con deriva 58.0 ·
    ingenuo estacional 47.8 · Random Forest 44.1 · AR(2) sobre el crecimiento anual 19.3 · ingenuo con crecimiento 13.4 ·
    SARIMA 13.3.
  - **Origen móvil**, MAPE por año (1954 a 1960): ingenuo estacional 6.82, 15.84, 13.49, 10.76, 3.14, 11.06 y 9.99 ·
    ingenuo con crecimiento 8.01, 10.64, 2.84, 3.15, 8.72, 8.02 y 2.95 · ARIMA(0,1,1) con deriva 10.94, 12.33, 10.90,
    11.69, 11.60, 13.62 y 11.26 · SARIMA 3.39, 4.77, 1.73, 1.66, 7.61, 6.75 y 2.90. SARIMA le gana al ingenuo con
    crecimiento en MAPE los 7 años (en 1960 por 0.05 puntos). Ljung-Box (24) de la aerolínea, 1955 a 1960: 0.73, 0.93,
    0.84, 0.72, 0.71 y 0.67. Con origen en 1953 (60 meses) Θ̂ = −0.92 y 10 de 16 ajustes no convergen.
  - **ADF con 132 meses** (τ, p): pasajeros 0.89, 0.993 · log −1.32, 0.621 · `∇ log` −3.07, 0.029 · `∇₁₂ log` −2.58,
    0.096 · `∇∇₁₂ log` −4.09, 0.001.
  - **Semillas de los choques** (132 valores; barras de la ACF fuera de la banda · las del MA(1) con θ = 0.8): 41: 2 y
    21 · 1, 2 y 23 — 45: ninguna · 1 y 24 — 46: 11 · 1 — 49: ninguna · 1 — 50: 18 · 1 y 18.
- **Lo que no se comprobó y queda para construir:** las semillas de las tres muestras de la 46; que la tabla de la 50 y
  las tres columnas de la 48 quepan a 22 px; el aspecto de las cintas 3D con 11 años; el pronóstico del bosque entrenado
  con 1949–1959 (se usó el MAE 44.1 medido en el hito 4; RMSE y MAPE salen al exportar).

### 2026-10-13 · Aprobación e inicio de la tanda 0

- **Aprobado** por el usuario en modo plan, sin cambios: opción A en las siete decisiones.
- **Hecho:** `scripts/exportar_hito5.py` escrito (un solo script; dos JSON; protocolo de convergencia y `assert` de lo que
  las diapositivas afirman).
- El modo automático de la sesión bloqueó los comandos después de la aprobación; el usuario autorizó la tanda 0 en el
  chat y se terminó ese mismo día (entrada siguiente).

### 2026-10-13 · Tanda 0 (base)

- **Hecho:**
  - `scripts/exportar_hito5.py` corrió a la primera (≈ 1 min) y escribió `series_modelos.json` (18 KB, entra a la página)
    y `referencias_hito5.json` (31 KB, solo para `verificar.ts`). Registro en `scripts/cache/hito5.log`.
  - `lib/series.ts`: `rmse`, `mape`, `acumular`, `bandaBartlett`, `pesosPsi`, `pesosPi`, `acfTeorica`, `ajustarAR`,
    `pronosticarAR`, `filtroMA1`, `ingenuoEstacional`, `colaChi2`, `ljungBox`, `choques` y `simularARMA`.
  - `lib/pasajeros.ts`: `entrenamiento`, `prueba`, `TRANSFORMACIONES_ENT`, `enMiles` y `modelos` (el JSON con sus tipos).
  - `scripts/verificar.ts`: 11 comprobaciones nuevas. "Todo coincide"; la mayor diferencia contra statsmodels, scipy y
    sklearn es 2e-14, salvo la recursión del MA(1) (5.5e-9, porque los valores ajustados se guardan con 8 decimales).
  - Componentes: `Lineas` ganó `areas` (franja entre dos curvas, siempre recortada) y `SeriesChart`, `franjas`. `Barras`
    ganó `banda` como lista, `curvas`, `opacidad` y `senalar`. `Correlogram` ganó `banda: "blanco" | "bartlett"`,
    `teorica`, `marcar`, `atenuar` y `contador`; `fueraDeBanda` acepta la banda como tercer argumento.
  - `npm run build` sin errores. `README.md` lista el script nuevo.
- **Lo que cambió respecto a este plan, y por qué:**
  - **La semilla de los choques es la 170**, no la 46. Al buscar con las funciones definitivas, la 46 deja un MA(1) con
    θ = −0.6 con cinco barras fuera. Criterios de la 170 (entre las semillas 1 a 400): en el ruido sale una sola barra de
    24, lejos del inicio (la 14; r₁ = −0.03); media −0.07 y desviación 1.03; el AR(1) con φ = 0.9 da r₁ = 0.88; el MA(1)
    con θ = 0.8 solo saca el rezago 1. Ninguna semilla de 1 a 400 deja limpios a la vez el ruido con una barra fuera y el
    MA(1) con θ = −0.6 (con la 170 ese saca 1, 13 y 14). No estorba: el plan no dibuja la ACF muestral del MA de esquema
    en la 43, solo la cinta y los ecos teóricos. Si al construirla se decide dibujarla, hay que volver a buscar.
  - **La banda del correlograma se dibuja ahora como un escalón por barra** (también la pareja), para que pueda pasar de
    ruido blanco a Bartlett con transición. Las diapositivas 39 y 40 se ven igual.
  - `bandaBartlett` usa el cuantil exacto (1.959964) y no 1.96, para coincidir con statsmodels; en el rezago 1 difiere
    de la banda de ruido blanco en el sexto decimal.
  - El JSON no trae `adf` propio: la tabla con 132 meses ya está en `adf_pasajeros.json` (`sensibilidad.sin_1960`).
  - `arma_crecimiento[].media` es la media del proceso (lo que statsmodels llama `const` con `trend="c"`), no la
    constante c de la fórmula; c = media × (1 − Σφ).
- **Hallazgos** (todos coinciden con lo medido al planear; lo nuevo):
  - El bosque entrenado con 1949–1959 pronostica 1960 con MAE 44.1, RMSE 56.9 y MAPE 8.46 %.
  - Origen móvil con seis años, MAPE medio ± desviación: ingenuo 10.71 ± 3.92, ARIMA(0,1,1) 11.90 ± 0.88, SARIMA
    4.24 ± 2.33.
  - Avisos de convergencia en toda la corrida: el AR(1) del crecimiento anual (el método de innovaciones da los mismos
    parámetros) y `(0,1,1)(1,1,0)` con 132 meses (Nelder-Mead da el mismo AIC, −434.78). En el origen móvil, ninguno
    más.
- **Lo que no se revisó o quedó pendiente:**
  - Las opciones nuevas de los componentes **no se han visto en pantalla**: ninguna diapositiva las usa todavía. Solo se
    comprobó que lo anterior no cambió: se vieron en captura la 38 (paso 1), la 39 (paso 4) y la 40 (paso 4), sin errores
    en consola. No se vieron las demás que usan `Barras` (34, 35, 37) ni las que usan `Lineas`.
  - `CLAUDE.md` ("Piezas disponibles") se actualiza al cerrar el hito, como dice la sección 8.

### 2026-10-14 · Tanda 1 (41, 42, 43 y 44)

- **Hecho:** `41-ruido-blanco.tsx` (5 clics), `42-ar.tsx` (5), `43-ma.tsx` (5) y `44-arma.tsx` (4), registradas en
  `src/slides/index.ts`. `src/slides/choquesG.ts` guarda los 132 choques compartidos (semilla 170, con el porqué).
  `LagCloud3D` ganó `centro` (para series que no giran alrededor del 0), `recta` (hoy contra ayer, en la cara que se ve
  de canto) y `residuos`. `npm run build` sin errores y `npm run verify` con "Todo coincide".
- **Lo que cambió respecto a este plan, y por qué:**
  - **41:** el pronóstico plano y su franja se ven solo en el clic 1 (en el caso estorbarían). El aviso de que desde aquí
    se usan 132 meses va en el clic 2, junto a la nube de pasajeros. Las listas de barras fuera de la banda, con 132 y con
    144 meses, se calculan en la diapositiva (salen 1, 3, 12 y 23, contra 1, 3, 9, 12 y 23).
  - **42:** los ejes de la nube se llaman "antier", "ayer" y "hoy" (como en la 40), y el texto dice que aquí son meses.
    Con "hace 2 meses" y "mes anterior", la etiqueta de abajo chocaba con el aviso de la rueda de `Scene3D`. Por lo
    mismo, la etiqueta de "ayer" de `LagCloud3D` se movió un poco a la izquierda del centro (la 40 también la usa). En el
    clic 4 las dos medias (datos 12.9 %, modelo 13.6 %) quedaban casi juntas y sus rótulos se encimaban: se quitaron los
    rótulos y los valores van en el texto.
  - **43:** la cinta de choques tiene, además de ↑ ↓, un botón "ver todo". El caso usa ↑ ↓ para mover el cursor sobre
    `∇∇₁₂ log`, y la lectura del cursor sale de `filtroMA1`. La predicción explica el 10 % de la variación (se calcula).
  - **44:** las barras fuera de la banda ya van en rojo, así que las curvas teóricas no pueden ir en rojo. Van en blanco
    (los de dos coeficientes) y gris (los de uno), con trazo continuo o punteado; la leyenda es la lista de coeficientes.
    Por eso `Barras` y `Correlogram` ganaron `guion` en las curvas. Se encienden con botones; al entrar a cada clic se
    prenden las que corresponden. Las distancias (0.035, 0.029 y 0.113 en los rezagos 1 a 8) se calculan.
- **Hallazgos:** ninguno que contradiga lo medido al planear. Lo que se lee en pantalla: 41, con la semilla 170, sale 1
  barra de 24 (la 14) y r₁ = −0.03; pasajeros, 24 de 24 y r₁ = 0.94. 42, φ̂ = 0.74; AR(2) 0.58 y 0.22; el pronóstico va
  de 18.1 % a la media del modelo, 13.6 %. 43, θ̂ = −0.35 y ρ₁ teórico −0.31 contra r₁ = −0.32. 44, para imitar al ARMA(1,1)
  hacen falta 5 coeficientes de AR puro; MA(1) da ρ₁ = 0.40 contra 0.74 observado.
- **Lo que no se revisó o quedó pendiente:**
  - **Pasos vistos en captura** (1280 × 720): 41 (0, 1, 2, 3 y 4), 42 (1, 2, 3 y 4), 43 (0, 2 y 4) y 44 (1, 2 y 3).
    Los pasos no vistos (42: 0; 43: 1 y 3; 44: 0) son subconjuntos de los vistos: muestran lo mismo con menos cosas.
  - **Sin probar a mano:** "otra muestra" (41), los botones de φ y ↑ ↓ (42), θ, "ver todo" y ↑ ↓ en la cinta y en el
    caso (43), los cuatro botones de curvas (44) y el giro con el mouse de la nube 3D (42).
  - En la 42 la cámara del panel de vista previa se congela a veces a media transición: la vista de canto se juzgó por
    la captura final, que sí quedó de canto (la caja se ve como dos cuadrados, uno dentro del otro).
  - En la consola quedaron dos errores `COLOR is not defined`, con la marca de tiempo de un estado intermedio mientras se
    editaba la 44. El archivo actual no usa `COLOR`, compila y se ve completo.
  - En la ACF de pasajeros de la 41 (todas las barras altas), el rótulo "±0.171" queda detrás de la última barra. Pasa lo
    mismo que en la 39; no se cambió.

### 2026-10-14 · Pronóstico en la 43 y tanda 2 (45, 46 y 47)

- **Pedido del usuario al revisar la tanda 1:** en la 43 el bloque "PRUEBA · 1960" quedaba vacío. Se agregó el
  pronóstico del MA(1) para 1960, en el clic 4: el primer mes θ̂ por el último error (−0.0135) y después 0, porque la
  memoria se corta. `exportar_hito5.py` guarda ahora `ma1.pronostico` (de `get_forecast`) y `verificar.ts` lo compara
  (3.9e-9).
- **Hecho:** `45-arima.tsx` (5 clics), `46-identificacion.tsx` (5) y `47-sarima.tsx` (6), registradas. `AnioMes3D` ganó
  la forma `"cintas"` (una línea por año con una cortina translúcida hasta el piso o hasta el 0) y `flechas` (gris al mes
  anterior, rojo al mismo mes del año anterior, como tubos para que se vean). `lib/pasajeros.ts` ganó `MESES_COMPLETOS`.
  `npm run build` sin errores y `npm run verify` con "Todo coincide".
- **Lo que cambió respecto a este plan, y por qué:**
  - **45:** la caminata se arma con ↑ ↓ de 5 en 5 (de 1 en 1 eran 131 pulsaciones) y un botón "sumar todos"; el abanico
    usa σ = 1, la de los choques simulados. El clic 3 no "apila" las barras con animación: cambia la gráfica de barras por
    la del nivel y el texto explica la suma. El recuadro del operador B va en el clic 2. El eje del nivel va de 200 a 700
    y la banda se recorta, con su rango escrito al pie.
  - **46:** los paneles chicos muestran 12 rezagos (no 20): con 20 no se leían. Las tres muestras usan los mismos choques
    con la semilla 3. Con ella se reconocen las tres huellas; eso pasa en 161, 100 y 122 de 300 semillas (AR(2), MA(1),
    ARMA(1,1)), y la diapositiva dice que con datos "las barras tiemblan". La banda de Bartlett es un par de botones en el
    clic 4, que entra ya con Bartlett puesto.
  - **47:** la rejilla del concepto nombra las celdas t, t−1 y t−12 adentro (las flechas entre celdas vecinas eran
    diminutas); la vuelta de enero sale por la izquierda y entra en diciembre del renglón de arriba. Los meses en las
    frases van con nombre completo ("mar" se leía como otra palabra); también en la 45.
- **Hallazgos:** ninguno nuevo. En pantalla: 45, r₁₂ de ∇ log = 0.83, deriva 1.01 % mensual, corto de abril a septiembre
  (173 mil en julio), MAE 58.0; 46, fuera con Bartlett 1, 3 y 12; 47, julio 622.2 contra 622, se pasa en 11 de 12, supuso
  14.0 % y se creció 11.2 %, marzo fuera de la banda.
- **Lo que no se revisó o quedó pendiente:**
  - **Pasos vistos en captura:** 43 (4), 45 (0, 1, 2, 3 y 4), 46 (1, 3 y 4), 47 (0, 1, 2, 3 y 5). La 46 en los pasos 0 y 2
    y la 47 en el 4 no se vieron (el panel dejó de capturar un rato; de la 46/4 se revisó por DOM que nada se desborda).
  - **Sin probar a mano:** ↑ ↓ y "sumar todos" (45), "teórica / muestra", "otra muestra" y los botones de banda (46), y el
    giro con el mouse de las cintas (47).
  - En la 47 el texto de la parte 1 dice que la flecha de "mes anterior" es gris: se corrigió el componente para que lo
    sea (al principio las dos eran rojas).

### 2026-10-14 · Tanda 3 (48, 49 y 50) y cierre de la documentación

- **Hecho:** `48-elegir-y-evaluar.tsx` (7 clics), `49-linea-base.tsx` (4) y `50-demo-series.tsx` (7), registradas. Piezas
  nuevas: `AicGrid`, `MetricTable` y `PValueScale`. `exportar_hito5.py` guarda además las métricas del ingenuo con
  crecimiento y `verificar.ts` las compara. `npm run build` sin errores y `npm run verify` con "Todo coincide".
  Documentación de cierre: `CLAUDE.md` ("Piezas disponibles"), `docs/PLAN-DIAPOSITIVAS.md` (entradas 41–50, tabla de
  componentes, protocolo con origen móvil 1955–1960) y `docs/HANDOFF.md`.
- **Lo que cambió respecto a este plan, y por qué:**
  - **48:** el concepto de cada columna se pliega a una línea cuando entra su caso, y cada columna entra en su clic (1, 2
    y 3 para el concepto; 4, 5 y 6 para el caso). La rejilla dice "mínimo" y "+Δ" en cada celda. La etiqueta de la
    rejilla usa `label natural`: en mayúsculas, "p" se volvía "P" y se confundía con la P estacional.
  - **49:** la gráfica dibuja la línea del renglón escogido en la tabla (clic en el renglón) y la de SARIMA; empieza con
    el ingenuo con crecimiento. Muestra solo 1958–1960 (sin `recortar`, para que se vean los rótulos de las líneas).
  - **50:** la gráfica del origen móvil lleva una leyenda arriba en lugar de rótulos al final (en diciembre se
    encimaban). En la tabla de ADF los p menores que 0.001 se escriben en notación científica (`formatoP`).
  - `PValueScale` escribe el veredicto junto al título, no a la derecha: con p cerca de 1 chocaba con el rótulo del p.
- **Hallazgos:** ninguno nuevo; lo que se lee en pantalla coincide con el plan (48: aerolínea mínima en AIC y BIC, cuatro a
  menos de 2, MAE 13.3, Ljung-Box p = 0.74 y 0.67, 6 de 15 con menor error en 1960; 49: el ingenuo con crecimiento ×1.124
  da 13.4 / 16.8 / 2.95 %; 50: SARIMA 4.24 ± 2.33 % contra 10.71 ± 3.92 % del ingenuo, gana 5 de 6, pierde 1958).
- **Lo que no se revisó o quedó pendiente (el hito NO está cerrado):**
  - **Pasos vistos en captura** (1280 × 720): 48 (2, 5 y 6), 49 (0 y 3), 50 (1, 2, 3, 4, 5 y 6). No vistos: 48 (0, 1, 3 y
    4), 49 (1 y 2), 50 (0); son subconjuntos de los vistos o cambian solo el texto.
  - **Sin probar a mano:** AIC / BIC (48), el clic en los renglones (49), los botones de año y ↑ ↓ (50).
  - **Falta la revisión del usuario** a tamaño real, como en el hito 4 (ahí la hizo en GitHub Pages). Después: estado
    *Cerrado* y la subtarea 195 de ListKeeper.
  - La revisión de rigor y de claridad (sección 8, punto 3) no se hizo como pasada aparte.
