# Hito 4 — Puente y fundamentos de series (diapositivas 29–40)

**Estado:** Cerrado · *(Borrador → Aprobado el 2026-10-12 → En construcción → Cerrado el 2026-10-13)*
**Última actualización:** 2026-10-13

## 1. Alcance

- **Entran 12 diapositivas:** el puente (29–30) y F. Fundamentos de series (31–40). Con ellas queda completa la clase 2 (20–40).
- **Caso:** pasajeros aéreos 1949–1960, los 144 meses. Es el primer contacto del público con este dataset.
- **Qué deben saber ya al llegar:** validación cruzada y por qué se separa entrenamiento de prueba (3 y 5), qué es un
  Random Forest (14) y que la 28 cerró con "todo esto supuso que las filas se pueden barajar. ¿Y si el orden importa?".
  Nada más: correlación, logaritmo, p-valor y regresión se recuerdan aquí con su recuadro.
- **Qué deja listo para el hito 5 (41–50):** el dataset en caché y en JSON, `lib/series.ts` verificada, `lib/pasajeros.ts`
  y las piezas compartidas `SeriesChart`, `Barras`, `Correlogram`, `Dispersion`, `SplitDiagram`, `CalendarGrid`,
  `AnioMes3D`, `LagCloud3D` y la prop `vista` de `Scene3D`.
- **Fuera a propósito:** ruido blanco definido con cuidado (41), AR y MA como modelos (42–43), la banda de Bartlett y la
  identificación de órdenes (46), KPSS (R3), la forma "cintas" de `AnioMes3D` (47) y las curvas teóricas sobre el
  correlograma (43–46). Aquí solo se nombran con su número de diapositiva.
- **Pendiente que este hito le hereda al 5** (no se resuelve aquí, se anota en el handoff al cerrar): los números de la
  sección G se calculan con 1949–1959 y no van a coincidir con los de la 37 y la 39, que usan los 144 meses (ver decisión 4).

## 2. Lo que se revisó para planear

**Leído:** `CLAUDE.md`, `docs/HANDOFF.md`, las entradas 29–40 y las tablas finales de `docs/PLAN-DIAPOSITIVAS.md`, las dos
especificaciones completas (`F1-puente-fundamentos-29-35.md` y `F2-fundamentos-36-40.md`), las notas y la lista de piezas de
`G-modelos-series-41-50.md` (para no chocar con el hito 5) y el código que se va a reutilizar: `Lineas`, `TablaCruda`,
`Scene3D`, `Piezas`, `lib/scale.ts`, `lib/rng.ts`, `lib/metricas.ts`, `lib/adult.ts`, `scripts/verificar.ts`,
`scripts/adult_comun.py` y las diapositivas 3 y 28.

**Comprobado antes de escribir** (tres scripts temporales fuera del repo; no se construyó ninguna diapositiva):

- **`statsmodels` instala.** Versión 0.15.0 en el `.venv` (Python 3.14.2, numpy 2.5.3, pandas 3.0.6, scikit-learn 1.9.1).
  **Ya quedó instalado**; no hace falta recrear el entorno con 3.12.
- **Cómo llega el dataset.** `statsmodels.datasets.get_rdataset("AirPassengers", "datasets")` devuelve 144 filas y dos
  columnas: `time` (decimal: 1949.000000, 1949.083333, …) y `value` (entero). No trae una columna "mes" como suponía el
  handoff. Suma 40 363, primero 112, último 432, mínimo 104 (nov 1949), máximo 622 (jul 1960).
- **Los números "esperados" de las especificaciones se reproducen** con las librerías reales (detalle en la sección 4).
- **Tres cosas no salieron como las cuentan las especificaciones** y cambian el plan (decisiones 1, 3 y 4):
  1. El resultado de la 30 **no es estable si la prueba es solo 1960**: con 20 barajados distintos el error "barajado" va de
     24.4 a 51.3 mil y en 1 de 20 sale peor que el pronóstico (44.1).
  2. En la 37, el veredicto de ADF para `∇ log` y `∇₁₂ log` **depende de cómo se eligen los rezagos y de si se incluye 1960**.
  3. La especificación de la 30 anuncia el corte 1949–1958 / 1959–1960; `CLAUDE.md`, el plan maestro y la especificación G
     dicen 1949–1959 / 1960.

**Problemas que atraviesan las dos especificaciones** (se corrigen en todas las diapositivas):

- **Falta la regla 8.** Ninguna enseña el dataset crudo. Se agrega en la 29 (decisión 5).
- **Demasiadas piezas y con nombres dobles.** Entre F1 y F2 proponen 22 componentes (`TimeSeriesChart` y `SeriesChart`,
  `Bars3D` y `MatrixSurface3D`, `LagScatter` y `ScatterFit`, `MiniBars`, `ImpulsoChoque`, `PesosVentana`, `CameraRig`,
  `Label3D`…) y dos versiones de `lib/series.ts` y de `lib/pasajeros.ts`. Quedan 9 compartidas y el resto local (sección 5).
- **Piezas que no existen o están prohibidas:** `Label3D` y las etiquetas `Html` de drei (se usa la prop `etiquetas` de
  `Scene3D`); "`OrbitControls` sin zoom" (toda escena hereda el zoom y el doble clic de `Scene3D`).
- **Cifras escritas en las frases** ("correlación 0.96", "26.2 contra 67.2", "×1.227"). Todas se leen de los datos.
- **Interacciones que no sirven al presentar:** el cursor que "sigue al mouse" (el deck lo oculta) y los barridos automáticos
  de 5 a 6.5 s (38 y 39). Todo control es por clic, botones o ↑ ↓.
- **Términos usados antes de definirse:** correlación (29), MAE (30), logaritmo (34), AR/MA (36), ruido blanco (39). Cada
  uno recibe una línea o un recuadro en el lugar donde aparece por primera vez.
- **Nombres en inglés en la librería** (`simulateAR`, `decompose`, `shuffle`). Van en español, como el resto de `src/lib/`.
- **"Se puede recortar" / "si falta tiempo se fusiona".** No aplica (regla 5): los pasos optativos se vuelven clics propios.
- **Dos scripts y dos verificadores.** Queda uno de cada uno: `scripts/exportar_hito4.py` y `scripts/verificar.ts`.

| Diapositiva | Se toma de la especificación | Se corrige o se descarta, y por qué |
|---|---|---|
| 29 | Recuadro i.i.d.; las dos tiras que se barajan; la serie que se baraja; la dispersión "este mes contra el siguiente"; la advertencia de que una correlación alta no prueba dependencia | Se agregan dos clics para el dataset crudo (regla 8). Se quita la fórmula de intercambiabilidad con permutaciones (demasiado para este público; se dice con palabras). La correlación se usa sin haberse definido: lleva una línea de lectura. Pasa de 5 a 7 clics |
| 30 | Recuadro de validación cruzada; el esquema de 20 momentos con la flecha de fuga calculada; `TimeSeriesSplit`; las dos franjas de 144 meses; "el bosque no predice más que su máximo de entrenamiento" (es exacto) | El corte que anuncia el cierre contradice a `CLAUDE.md`. El número central depende del barajado: se muestra con 20 barajados, no con uno (decisión 1). `TimeSeriesSplit` y origen móvil en un mismo paso no caben: clics separados. MAE se define en una línea. Se usa "origen móvil", el mismo nombre que la 50 |
| 31 | Definición, índice, frecuencia y horizonte; la tabla 12 × 12 que se desdobla; el cursor con lectura calculada; "1961 ?" | La 29 ya enseñó la serie: aquí la tabla se presenta como "la misma columna `value` en renglones de 12", sin repetir el `head()`. El cursor se mueve solo con ↑ ↓. La notación ŷ con subíndice T+h∣T se acompaña de su lectura en palabras |
| 32 | Los tres esquemas; medias anuales como escalones y pico de cada año; barras 3D con dos vistas; el respaldo en 2D | Las etiquetas 3D van por `etiquetas` de `Scene3D`. Las vistas se hacen con una prop nueva de `Scene3D`, no con un `CameraRig` aparte. "Julio o agosto en los 12 años" se comprueba en el código (hay empates en 1949–1951) |
| 33 | Las tres definiciones; las dos series de esquema con la distancia entre picos calculada; el doblez en renglones de 12; el mapa de calor | Usa el símbolo TC donde la 32 y la 34 usan T: se deja T y se dice "T incluye al ciclo". "El mejor pronóstico del ruido es su promedio" se presenta como propiedad del ruido ideal y remite a la 41 |
| 34 | Esquemas con envolventes; el embudo; el paso a escala logarítmica; los 4 paneles; las fichas de julio; el error de cada descomposición | El paso de los paneles estaba sobrecargado: aditiva y multiplicativa en clics separados (6 en total). El cierre decía "de aquí en adelante se modela log": es falso para la 38 y la 39, que usan pasajeros sin transformar; se reescribe. El logaritmo lleva recuadro. La onda crece más que el nivel (×5.3 contra ×3.8) y eso se dice |
| 35 | El recuadro de media, varianza y covarianza; las 200 historias con el corte móvil; el segundo corte y la dispersión; ventanas anuales con el botón original / log | "Con log la desviación queda casi plana" exagera: sube de 0.108 a 0.157. Se dice con el dato (×1.4 contra ×5.7). La desviación muestral (ddof = 1) no existe en `lib/metricas.ts` (la de ahí divide entre n): se agrega a `lib/series.ts` |
| 36 | Las dos series de juguete y sus operaciones animadas; la superficie año × mes con las cuatro transformaciones; las lecturas generadas de los datos; escala fija para las tres diferencias | Habla de "AR o MA" antes de la 42: se dice "los modelos de la sección G". `∇₁₂ log` no tenía clic propio y el plan maestro sí la lista: se le da (7 clics). Las celdas sin dato se dibujaban en 0, lo que parece un dato: no se dibujan |
| 37 | Las dos series con los mismos choques; las dos regresiones; el histograma simulado con el p-valor como área; la tabla fila por fila; la nota de que no rechazar no prueba nada | El cierre le atribuye D = 1 a ADF, y ADF no mide estacionalidad. Las dos filas de en medio son frágiles (decisión 3). El área del histograma (simulada) y el p de la tabla (MacKinnon) difieren en el tercer decimal: en pantalla solo va el p de statsmodels. Pasa de 6 a 7 clics |
| 38 | La ventana que se desliza; los botones de ventana; centrado contra atrasado; el diagrama "promedio móvil contra MA(q)" | Se quita el barrido automático de ventanas. El desfase de 5.5 meses y los 132 valores válidos se calculan |
| 39 | La tabla de rezagos y el r₁ a mano; la copia recorrida con sus productos; el correlograma que se llena; la banda; el correlograma de `∇∇₁₂ log`; la decisión de no dibujar la nube de pares | El barrido automático se vuelve un botón. La 29 enseña 0.960 y aquí r₁ = 0.948: se explica en una nota (una media contra dos). "Casi todos los productos son positivos" se cuenta |
| 40 | La cadena; la nube 3D con sombra y plano; los correlogramas teóricos; ACF y PACF del caso; el botón "otra muestra" | Dos definiciones de la PACF son demasiadas: queda la de regresión, que es la que se ve en 3D. "PACF(1) = 0.95 es la huella de la raíz unitaria" es afirmar de más. El método se nombra: los demás métodos de statsmodels sacan otras barras de la banda |

## 3. Decisiones que necesita el usuario

> **Respondidas el 2026-10-12:** el usuario aprobó el plan con la opción recomendada en las cinco (diseño A en la 30, con
> el segundo modelo; ADF con valores por omisión, advertencia y cierre reescrito; 1960 a la vista en 29–40, dicho en el
> cierre de la 30; dataset de Rdatasets enseñado tal como llega).

1. **Qué resultado enseña la 30.** Se midieron tres diseños con el mismo modelo (Random Forest de 300 árboles; variables:
   número de mes y mes del año):

   | Diseño | Barajado | Pronosticando | ¿Se sostiene? |
   |---|---|---|---|
   | A. Los mismos 24 meses (1959–1960); el pronóstico entrena con 1949–1958 | MAE 26.2 con la semilla 42; entre 23.6 y 38.1 en 20 barajados | MAE 67.2 | Sí: en los 20 barajados |
   | B. Los mismos 12 meses (1960); el pronóstico entrena con 1949–1959 | Entre 24.4 y 51.3 (media 31.9) | MAE 44.1 | No: en 1 de 20 el barajado sale peor |
   | C. Con 1949–1959, qué error promete cada validación; después se destapa 1960 | Promete 6.8 % | Origen móvil promete 10.2 %; el real fue 8.5 % | A medias: las dos se equivocan por 1.7 puntos, en sentidos opuestos |

   **Recomiendo A**, mostrando los 20 barajados y no uno solo. Es el único resultado firme y su causa se explica con algo que
   el público ya conoce: un bosque promedia valores que ya vio, así que nunca predice más que su máximo de entrenamiento
   (505; el real llegó a 622). Costo: esta demostración usa un corte propio (1958), distinto del que rige desde la 41 (1959).
   Se rotula "solo para esta demostración" y el cierre anuncia el corte verdadero.

2. **¿Un segundo modelo en la 30?** Con una regresión lineal sobre el logaritmo (tendencia más un ajuste por mes), que sí
   puede extrapolar, pasa lo mismo aunque menos: 23.1 barajado contra 43.0 pronosticando. **Recomiendo incluirlo como un
   renglón más de la tabla de errores**, para que nadie concluya que el problema es solo del bosque. Cuesta una línea de
   explicación ("una recta para la tendencia y un ajuste fijo por mes").

3. **Cómo se presenta ADF en la 37.** Con los valores por omisión de statsmodels (rezagos por AIC) sale lo que dice el plan
   maestro: `∇ log` p = 0.071, `∇₁₂ log` p = 0.072, `∇∇₁₂ log` p = 0.00025. Pero eligiendo los rezagos por BIC dan 0.030 y
   0.013 (se rechazaría), y sin 1960 dan 0.029 y 0.096. La primera y la última fila no cambian con nada.
   **Recomiendo:** la tabla con los valores por omisión, un clic final con la advertencia ("las dos filas de en medio están
   en la frontera: con otro criterio para elegir rezagos dan 0.030 y 0.013") y reescribir el cierre: ADF descarta la raíz
   unitaria con las dos diferencias; que haga falta la diferencia estacional lo dicen el patrón por mes de la 36 y los picos
   en 12 y 24 de la 39, no ADF. La alternativa es callarlo; no la recomiendo, porque es la pregunta que haría alguien que
   corra `adfuller` con otros argumentos.

4. **1960 a la vista en 29–40.** El plan maestro dice que estas diapositivas describen la serie completa y que 1960 se
   aparta desde la 41. Eso significa que el logaritmo, d = 1 y D = 1 se deciden viendo también el año de prueba, justo
   después de que la 30 dice que no se entrena con el futuro. **Recomiendo mantenerlo como está y decirlo en pantalla** en el
   cierre de la 30 ("describir la serie no es evaluar un modelo; desde la 41, 1960 se guarda y todo se decide con
   1949–1959"). El hito 5 repite las decisiones con 132 meses. La alternativa, tapar 1960 desde la 36, haría que 36–40 y la
   sección G compartan números, pero obliga a rehacer la 31–35 con un año tapado sin haber explicado todavía por qué.

5. **Fuente y forma cruda del dataset.** **Recomiendo** `get_rdataset("AirPassengers")` de statsmodels con caché en
   `scripts/cache/` (ignorado por git, como Adult; internet solo la primera vez) y enseñar la tabla tal como llega: `time`
   en decimal y `value`. Es menos bonita que una columna "mes", pero es la verdad y da pie a explicar qué se le cambia
   (1949.083333 = febrero de 1949). La alternativa es guardar un CSV propio en el repo con el mes ya escrito, que sería
   enseñar un dato ya arreglado.

Además, dos avisos que no necesitan respuesta salvo que no estés de acuerdo: **se amplía `Lineas`** en vez de crear otra
gráfica de líneas (sección 5), y **los clics de varias diapositivas cambian** respecto a la especificación (29: 7, 30: 7,
34: 6, 36: 7, 37: 7; las demás quedan igual: 31, 32, 33 y 38 con 4; 35, 39 y 40 con 5).

## 4. Datos

- **Dataset crudo (regla 8).** Sale de `statsmodels.datasets.get_rdataset("AirPassengers", "datasets", cache=scripts/cache)`:
  es el `AirPassengers` de R, la serie G de Box y Jenkins. 144 filas, 2 columnas: `time` (año en decimal) y `value` (total
  mensual de pasajeros de aerolíneas internacionales, en miles). Se enseña en la **29, clic 2**, con `TablaCruda`
  (`pasajeros.head()`; `time` se exporta como texto con los 6 decimales que imprime pandas). En el **clic 3**, lo que se le
  cambia: `time` pasa a año y mes y a un índice t = 1…144; `value` no se toca; no hay faltantes ni columnas que quitar. La
  fuente no dice país ni aerolínea: no se afirma. La 31 retoma la misma columna acomodada en 12 × 12, sin repetir el `head()`.
- **Dependencias de Python:** `statsmodels` 0.15.0, **ya instalado y probado** en el `.venv`. Se anota en `README.md`.
- **Scripts:** `scripts/series_comun.py` (`cargar_pasajeros_crudo()` y `cargar_pasajeros()`, para que el hito 5 los reutilice;
  hace `assert` de n = 144, suma 40 363, primero 112, último 432) y `scripts/exportar_hito4.py`. Semilla 42 en todo. Tarda
  1 o 2 minutos (lo lento son los 20 barajados de la 30). Deja registro en `scripts/cache/hito4.log`, incluidos los diseños
  B y C de la decisión 1, que no van a pantalla.

| JSON | Qué trae | Lo usan |
|---|---|---|
| `pasajeros.json` | `fuente`, `unidades`, `inicio` [1949, 1], `crudo` (columnas y 5 filas tal como llegan), `valores` (144) y `n_entrenamiento` (132, para el hito 5). Menos de 2 KB | 29–40 y todo el hito 5 |
| `validacion_temporal.json` | Modelo y variables; pliegue de cada mes con `KFold(5, shuffle=True, random_state=42)`; predicción fuera de pliegue de los 144 meses; MAE en 1959–1960 de 20 barajados (semillas 0–19); pronóstico de 1959–1960 entrenando con 1949–1958; lo mismo para la regresión lineal si se aprueba la decisión 2 | 30 |
| `adf_pasajeros.json` | `filas`: τ, p, rezagos, observaciones y críticos de `adfuller` por omisión para pasajeros, log, `∇ log`, `∇₁₂ log` y `∇∇₁₂ log`; `sensibilidad`: lo mismo con BIC y con 1949–1959; `esquema`: 150 choques, las dos series y su Dickey-Fuller sin rezagos; `nulo`: histograma de τ en 20 000 caminatas de 131 valores, con percentil 5 % y mediana | 37 |
| `referencias_hito4.json` | Solo para `verificar.ts` (no entra al paquete de la página): todo lo que se lista abajo en "Verificación" | `scripts/verificar.ts` |

- **Vivo, esquema o JSON:**
  - *Vivo* (TypeScript sobre `pasajeros.json`): correlación de la 29, MAE de la 30 (recalculado de las predicciones), medias,
    desviaciones, picos y anchos por año, descomposición, diferencias, promedios móviles, ACF, PACF, bandas y todos los
    textos que citan una cifra.
  - *Esquema con semilla* (`mulberry32`, marcado "Esquema" en pantalla): tiras de la 29, K-Fold de 20 momentos de la 30,
    series de la 32 y la 33, 200 + 200 historias de la 35, juguetes de 36, 38 y 39, AR(1) de la nube de la 40.
  - *JSON* (lo que depende de sklearn o statsmodels): predicciones del bosque (30) y todo ADF, incluidas las dos series del
    esquema de la 37, que se simulan en Python porque su τ y su p los calcula statsmodels.
- **Verificación** (se agrega a `scripts/verificar.ts`; referencia entre paréntesis):
  - `diferencia` (`numpy.diff` con rezagos 1 y 12), tolerancia 1e-12.
  - `promedioMovil` centrado con 3, 5 y 7 (`pandas rolling(k, center=True).mean()`), atrasado de 12 (`rolling(12).mean()`) y
    2×12 (`seasonal_decompose(period=12).trend`), 1e-9.
  - `descomponer` aditiva y multiplicativa (`statsmodels.tsa.seasonal.seasonal_decompose(period=12)` con sus valores por
    omisión: filtro centrado, sin extrapolar los extremos): tendencia, índices y residuo, 1e-9.
  - `acf` (`statsmodels.tsa.stattools.acf(nlags=36, adjusted=False, fft=False)`), sobre pasajeros y sobre `∇∇₁₂ log`, 1e-12.
  - `pacf` por Durbin-Levinson (`pacf(nlags=36, method="ywm")`), sobre log y sobre `∇∇₁₂ log`, 1e-10. Comprobado hoy: coincide
    a 2e-16 con `"ywm"` y con `"ldb"` (el que nombra la especificación G; son el mismo cálculo) y **no** con `"yw"`, `"ld"`,
    `"ols"` ni `"burg"`, que difieren hasta en 0.1.
  - `pearson` (`numpy.corrcoef`) y `desviacionMuestral` (`numpy.std(ddof=1)`), 1e-12.
  - `minimosCuadrados` (coeficientes, errores estándar y t de `statsmodels OLS`), 1e-9; y que el t de la pendiente en las dos
    series del esquema de la 37 sea el estadístico de `adfuller(maxlag=0, autolag=None)`.
  - `particionTemporal` (índices de `sklearn TimeSeriesSplit(5)` con n = 20 y n = 144): idénticos.
  - `mae` (`sklearn mean_absolute_error` guardado junto a cada predicción), 1e-12.
  - Sin referencia externa posible (el azar es propio): `barajar` devuelve una permutación; `kfoldBarajado` pone cada índice
    en un solo pliegue; en `simularAR`, x_t − φ·x_{t−1} reproduce los choques; la varianza de las 200 historias de la 35 cae
    dentro de la banda de muestreo de su valor teórico.
  - Afirmaciones que sostienen un texto: el pico anual cae en julio o agosto en los 12 años; r₁₂ y r₂₄ superan a sus vecinos;
    los rezagos de mayor magnitud en `∇∇₁₂ log` son 1 y 12; el pronóstico del bosque no supera el máximo de entrenamiento.
  - Dentro del script de Python (`assert`): la fracción simulada bajo H₀ coincide con el p de MacKinnon a ±0.01; en el
    esquema de la 37, p > 0.10 para la caminata y p < 0.01 para la otra. Si un `assert` falla no se cambia la semilla en
    silencio: se anota en la bitácora.
- **Números "esperados" del plan maestro, recalculados hoy:**

  | Dónde | Esperado | Lo que salió |
  |---|---|---|
  | 30 | "barajado parece mucho mejor" | 26.2 contra 67.2 en 1959–1960; con solo 1960 no es estable (decisión 1) |
  | 32 | medias anuales 126.7 → 476.2 | 126.67 → 476.17 (×3.76). Pico: jul y ago empatan en 1949–1951; después ago, ago, jul, jul, jul, ago, ago, ago, jul |
  | 34 | la onda pasa de 44 a 232 | 44 → 232 (×5.3; el nivel, ×3.8). En log: 0.353 → 0.467. Error de la aditiva 14.4 mil; de la multiplicativa, 6.6 |
  | 35 | con log la desviación se empareja | Original 13.7 → 77.7 (×5.7); en log 0.108 → 0.157 (×1.4): mejora, no se empareja |
  | 36 | quedan 131 meses | 131 |
  | 37 | p ≈ 0.07 y ≈ 0.0003 | 0.0711 y 0.000249 con AIC; frágil en las filas de en medio (decisión 3) |
  | 39 | salvo los rezagos 1 y 12 | Fuera de ±0.171: 1, 3, 9, 12, 23 y 32; los dos mayores son 12 (−0.387) y 1 (−0.341) |
  | 40 | 1 y 12 marcados | PACF fuera de la banda: 1, 3, 9 y 12 |

## 5. Piezas

**Una sola gráfica de líneas.** `Lineas` se amplía con opciones nuevas, todas optativas, de modo que las diapositivas ya
hechas (8, 11, 12, 14, 16, 21, 22 y 27) no cambian: un valor `NaN` corta la línea, `bandas` (tramos sombreados),
`segmentos` (tramos horizontales), escala vertical logarítmica con mezcla animada y transición del trazo al cambiar de
datos. `SeriesChart` es un envoltorio delgado que convierte una serie mensual en lo que `Lineas` espera (eje de años,
desplazamiento de las series que empiezan tarde, dominio con `ejeQueCubre`). Al terminar la tanda 0 se vuelven a ver las
ocho diapositivas que usan `Lineas`.

| Pieza | Nueva o existente | Para qué | La usan |
|---|---|---|---|
| `lib/series.ts` | Nueva, pura | `diferencia(x, k)`, `promedioMovil(x, k, modo)`, `descomponer(x, m, modo)`, `acf(x, K)`, `productosRezago(x, k)`, `pacf(r)`, `banda95(n)`, `pearson(a, b)`, `desviacionMuestral(x)`, `minimosCuadrados(X, y)`, `mae(real, pred)`, `porPeriodo(x, m)`, `barajar(n, rand)`, `kfoldBarajado(n, k, rand)`, `particionTemporal(n, k)`, `simularAR(phis, n, rand, opciones)`, `caminata(n, rand)`, `densidadNormal(z)`. Usa `media` de `lib/metricas.ts` | 29–40, hito 5 |
| `lib/pasajeros.ts` | Nueva (lee JSON, como `lib/adult.ts`) | `pasajeros` (crudo, valores, matriz 12 × 12), `MESES`, `fecha(t)`, `etiqueta(t)` → "jul 1955", `TRANSFORMACIONES` (log, `∇ log`, `∇₁₂ log`, `∇∇₁₂ log` con su desplazamiento y su TeX), `validacionTemporal`, `adf` | 29–40, hito 5 |
| `Lineas` | Existente, se amplía | Ver arriba | Todas las gráficas de líneas |
| `SeriesChart` | Nueva (envoltorio) | `{ ancho, alto, series: { id, valores, desde?, color?, guion?, puntos? }[], inicio?, eje?: "años" \| "indice", y?, ventana?, bandas?, segmentos?, cursor?, escala? }` | 29–32, 34, 36–39 |
| `Barras` | Nueva | Barras sobre un índice entero, con línea en 0, alturas que se interpolan al cambiar de datos y valor encima. Sustituye a `MiniBars`, `ImpulsoChoque` y `PesosVentana`; el hito 5 la usa como `ImpulseResponse` | 34, 35, 37, 38 |
| `Correlogram` | Nueva, sobre `Barras` | `{ valores, n, hasta?, resaltar?, anotaciones?, titulo? }`: banda ±1.96/√n, barras fuera de la banda en rojo con su valor | 39, 40, hito 5 |
| `Dispersion` | Nueva | `{ x, y, lado, rotulos, recta?: "diagonal" \| "ajuste", pie? }`: los puntos se mueven al cambiar los datos. Sustituye a `LagScatter` y a `ScatterFit` | 29, 35, 37, hito 5 |
| `SplitDiagram` | Nueva | `{ n, filas: { etiqueta, entrenamiento, prueba }[], fuga?, flecha?, eje?, altoCelda? }`: gris = entrenamiento, rojo = prueba, vacío = todavía no existe, rayado = futuro usado para entrenar | 30, 50, 62 |
| `CalendarGrid` | Nueva | `{ matriz, modo: "numeros" \| "calor", resaltar?, fase: "tabla" \| "serie", cursor? }`: rejilla año × mes cuyas celdas vuelan a la línea de tiempo y de regreso. Absorbe a `TablaASerie` | 31, 33 |
| `Scene3D` | Existente, se amplía | Prop optativa `vista` (`{ camera, target }`): al cambiar, la cámara se desliza a esa posición. Sustituye a `CameraRig` | 32, 36, 40 |
| `AnioMes3D` | Nueva | `{ matriz, forma: "barras" \| "superficie", rango, resaltar?, planoCero?, rotuloAltura }`. La forma "cintas" se agrega en el hito 5 | 32, 36 |
| `OperacionAnimada` | Nueva | `{ x, op: { tipo: "diferencia", k } \| { tipo: "ventana", k }, etiquetas? }`: la operación ocurre punto por punto y cae a un panel inferior. El resultado sale de `lib/series.ts` | 36, 38 |
| `LagCloud3D` | Nueva | `{ puntos, sombra?, plano?, vista: "sombra" \| "canto" }`: nube de (x de antier, x de ayer, x de hoy) con su proyección en la pared y el plano de regresión | 40, 42 |
| Se reutilizan | Existentes | `SlideFrame`, `Reveal`, `Recap`, `TeX`, `Def`, `Chips`, `Boton`, `Dato`, `TablaCruda`, `useFlechas`, `ejeQueCubre`, `mulberry32`, `gaussian` | — |

**Locales** (viven en el archivo de su diapositiva): las tiras que se barajan (29), los cuatro paneles de la descomposición
(34), el haz de historias con su corte (35), el histograma bajo H₀ y la tabla de ADF (37), el diagrama "promedio móvil
contra MA(q)" (38), la tabla de rezagos (39) y la cadena (40).

**Cambios al deck:** ninguno; solo se registran las 12 diapositivas en `src/slides/index.ts`. **Convención que cambia:**
`CLAUDE.md` dice "solo `lib/adult.ts` lee los JSON"; pasa a "solo `lib/adult.ts` y `lib/pasajeros.ts`".

## 6. Diapositiva por diapositiva

Encabezado común: `section` = `["U8 · Datos secuenciales", "Puente"]` en 29 y 30, y `["U8 · Datos secuenciales",
"F. Fundamentos de series"]` de la 31 a la 40. `caso="Pasajeros aéreos"` desde el primer clic de caso. Toda cifra que
aparece abajo es la medida hoy; en pantalla se lee de los datos.

### 29 · El orden importa — `29-el-orden-importa.tsx`, 7 clics

- **Lede:** recoge la pregunta de la 28: "En la parte 1 cada fila era otra persona y se podían barajar. ¿Y si el orden
  también es dato?"
- **Clics:**
  0. *Concepto.* A la izquierda (540 px) el recuadro i.i.d. A la derecha, marcadas "Esquema · simulado", dos tiras de 24
     barras: A, tiros de un dado; B, una serie con memoria ("cada valor = 0.9 × el anterior + un empujón al azar").
  1. Botones "barajar" y "orden original": las dos tiras se reordenan con la misma permutación. Bajo cada una, su veredicto:
     A se ve igual; B perdió sus subidas y bajadas. Si los datos son i.i.d., cualquier orden es igual de probable.
  2. *Caso · dataset crudo.* `pasajeros.head()` con `TablaCruda` y tres notas: de dónde sale (serie G de Box y Jenkins;
     totales mensuales de pasajeros de aerolíneas internacionales), qué es cada columna y qué se quiere predecir (los
     meses que siguen).
  3. Qué se le cambia: `time` = año + (mes − 1)/12 se convierte en año y mes (1949.083333 es febrero de 1949); `value` son
     miles (112 = 112 000 pasajeros); 144 filas, 12 años completos, sin faltantes (contado). A la derecha se dibuja la serie.
  4. "Barajar" sobre los 144 meses: desaparecen la subida de los años y la onda del verano.
  5. La serie se angosta y entra la dispersión "este mes contra el siguiente" (143 puntos) con su correlación (0.960) y una
     línea de lectura: "1 = los puntos caen sobre una recta que sube; 0 = nube sin forma". Al barajar, la nube se deshace y
     r se recalcula (queda entre −0.21 y 0.21 según el barajado: se lee el de la pantalla).
  6. *Cierre.*
- **Recordatorio:** i.i.d.: independientes (saber un dato no cambia lo que esperas de otro) e idénticamente distribuidos
  (todos salen de la misma urna). Sin la fórmula de permutaciones.
- **Visuales:** tiras (local), `TablaCruda`, `SeriesChart` con puntos que cambian de lugar, `Dispersion` con diagonal.
- **Datos:** tiras, esquema con semilla; tabla y serie, `pasajeros.json`; correlación, viva (`pearson`).
- **Cierre:** "Barajar y K-Fold suponen que el orden no dice nada. En pasajeros el orden es parte del dato: los meses
  cercanos se parecen y el nivel cambia con los años. Hay que validar de otra forma."
- **Riesgos:** una correlación alta no prueba dependencia (una tendencia con ruido independiente también la da): el texto
  dice "el orden contiene información", nunca "los errores están correlacionados". La 39 enseñará 0.948 para lo que parece
  lo mismo: allá se explica. Las semillas de las tiras se eligen para que el contraste se vea y se documentan en el código.

### 30 · Validación temporal — `30-validacion-temporal.tsx`, 7 clics

*Se describe con el diseño A y el segundo modelo (decisiones 1 y 2).*

- **Clics:**
  0. *Concepto.* Recuadro de validación cruzada (520 px). A la derecha, "Esquema · 20 momentos": K-Fold barajado, 5 filas de
     20 celdas con 4 de prueba cada una y la flecha "tiempo →".
  1. Una flecha roja sale del vecino de la derecha hacia la primera celda de prueba que lo tenga en entrenamiento (se
     calcula): "para predecir este momento, el modelo ya vio el siguiente". Se rayan las celdas de entrenamiento posteriores
     a alguna de prueba, con su contador. Nombre: fuga de datos.
  2. El diagrama se transforma en ventana creciente (`TimeSeriesSplit`): la prueba siempre va después y lo que sigue aparece
     vacío, "todavía no existe".
  3. Se transforma en origen móvil (*walk-forward*): la ventana avanza un paso y se prueba solo el siguiente.
  4. *Caso.* Dos franjas de 144 meses con los años en el eje: K-Fold barajado (semilla 42) y `TimeSeriesSplit(5)` (entrena
     24, 48, 72, 96 y 120 meses; prueba los 24 siguientes). Contador vivo: 117 de 143 meses de prueba tienen el mes
     siguiente en entrenamiento.
  5. El mismo modelo evaluado de las dos formas en los mismos 24 meses, rotulado "solo para esta demostración se pronostican
     dos años". Gráfica de 1957 a 1960: real, predicción barajada (pegada a la real) y pronóstico (por debajo). Al lado, MAE
     definido en una línea ("en promedio, por cuántos miles de pasajeros se equivoca cada mes") y la tabla: Random Forest
     26.2 barajado (entre 23.6 y 38.1 en 20 barajados) contra 67.2 pronosticando; regresión lineal 23.1 contra 43.0.
  6. *Cierre.* Línea horizontal en el máximo de entrenamiento (505) y marca de que el pronóstico de 1960 repite al de 1959.
- **Recordatorio:** validación cruzada, tres renglones, con liga a la 3.
- **Visuales:** `SplitDiagram` (esquema y franjas), `SeriesChart` con `ventana`, tabla de errores.
- **Datos:** esquema con semilla (`kfoldBarajado`, `particionTemporal`); `validacion_temporal.json`; MAE vivo.
- **Cierre:** "Barajado, el modelo solo rellena huecos entre meses que ya vio. Pronosticar es ir más allá de lo visto, y un
  bosque nunca predice más que el máximo de su entrenamiento. Regla: la prueba siempre va después. Describir la serie no es
  evaluar un modelo: desde la 41, 1960 se guarda como prueba y todo se decide con 1949–1959."
- **Riesgos:** el paso 5 es denso (gráfica y tabla): la tabla entra después de la gráfica dentro del mismo clic. Las 144
  celdas miden unos 11 px: se leen como franja; solo se rotulan los años. No se dice "K-Fold nunca sirve en series" (hay
  casos en que sí es válido); se dice qué esconde aquí. Los números del bosque dependen de la versión de sklearn: van en
  JSON y no se recalculan en el navegador.

### 31 · ¿Qué es una serie de tiempo? — `31-que-es-una-serie.tsx`, 4 clics

- **Clics:**
  0. *Concepto.* A la izquierda, la definición ("mediciones de una misma variable, ordenadas en el tiempo y, normalmente, a
     intervalos regulares") y tres `Def`: índice t, frecuencia (cada cuánto se mide) y horizonte h (cuántos pasos adelante).
     A la derecha, "Esquema": 8 puntos, la línea "hoy" y tres casillas punteadas con "?". Debajo, el contraste con Adult:
     allá la fila es una persona; aquí, un momento.
  1. *Caso.* La columna `value` de la 29 acomodada en 12 renglones (años) por 12 columnas (meses), en mono de 20 px: "así
     viene impresa en el libro".
  2. Cada celda vuela a su lugar en la línea de tiempo; aparece t = 12 · (año − 1949) + mes.
  3. *Cierre.* Cursor sobre la serie con lectura "t = 79 · jul 1955 · 364 mil", que se mueve con ↑ ↓; franja de datos
     (144 meses, 12 por año, mínimo 104 en nov 1949, máximo 622 en jul 1960) y 12 casillas punteadas "1961 ?".
- **Recordatorio:** ninguno.
- **Visuales:** `SeriesChart` (esquema y serie con cursor), `CalendarGrid` con `fase`.
- **Datos:** `pasajeros.json`; fechas, extremos y lectura del cursor, vivos.
- **Cierre:** "Una serie es una sola variable vista a lo largo del tiempo: el dato es el par (t, y). Pronosticar es estimar
  lo que sigue usando solo lo que ya pasó."
- **Riesgos:** 144 números en pantalla: se ven, no se leen en voz alta. La animación mueve 144 elementos: se prueba en la
  laptop con la que se va a exponer.

### 32 · Tendencia y estacionalidad — `32-tendencia-y-estacionalidad.tsx`, 4 clics

- **Clics:**
  0. *Concepto.* Tres gráficas apiladas, marcadas "Esquema": una recta (tendencia), una onda de periodo 12 (estacionalidad)
     y su suma. A la derecha, las dos definiciones y "se repite cada m pasos: 12 meses, 7 días, 24 horas". Nota: cómo se
     combinan (suma o producto) se decide en la 34.
  1. *Caso.* La serie con la media de cada año como escalón (126.7 el primero, 476.2 el último, ×3.8) y el máximo de cada
     año marcado con su mes.
  2. *3D.* Barras con el mes en un eje y el año en el otro; el máximo de cada año en rojo. Botones: "por meses" (de frente:
     la joroba del verano), "por años" (de lado: la subida) y "libre".
  3. *Cierre*, con la escena a la vista.
- **Recordatorio:** ninguno.
- **Visuales:** `SeriesChart` (× 3 de esquema y la del caso, con `segmentos` y marcas), `AnioMes3D` en forma "barras" dentro
  de `Scene3D` con `vista` y con los meses y los años como `etiquetas`.
- **Datos:** esquema con parámetros fijos; medias, picos y anchos por año, vivos.
- **Cierre:** "Tendencia: cómo cambia el nivel de un año a otro. Estacionalidad: la forma dentro del año, siempre en los
  mismos meses (el máximo cae en julio o agosto los 12 años). Y un aviso: la onda de 1960 mide 232 y la de 1949, 44."
- **Riesgos:** la media anual es una estimación burda de la tendencia; se dice, y la buena llega en la 34 y la 38. En 3D los
  años altos tapan a los bajos vistos de frente: si en la revisión no se entiende, respaldo en 2D (12 líneas, una por año,
  sobre ene–dic). Son 12 + 6 etiquetas en la escena: se revisa que no se encimen.

### 33 · Ciclo, estacionalidad y ruido — `33-ciclo-y-ruido.tsx`, 4 clics

- **Clics:**
  0. *Concepto.* Tres definiciones en columnas: estacionalidad (periodo fijo de calendario), ciclo (sube y baja, pero cada
     vuelta dura distinto, por lo común más de dos años) y ruido (lo que queda sin patrón). Abajo, "Esquema": una serie
     estacional y una cíclica, con sus picos marcados y la distancia entre picos consecutivos calculada.
  1. Cada serie se dobla en renglones de 12: en la estacional los picos caen en una sola columna; en la cíclica, dispersos.
  2. *Caso.* Mapa de calor 12 × 12: cuánto queda cada mes por arriba o por abajo de la media de su año (rojo arriba, gris
     abajo, solo intensidad), con el máximo de cada año contorneado. Julio y agosto forman una franja vertical.
  3. *Cierre.* La fórmula y = T + S + R ("o producto: se ve en la 34"; "T incluye al ciclo") y una tira de ruido de esquema.
- **Recordatorio:** ninguno.
- **Visuales:** `SeriesChart` (esquemas y tira de ruido), `CalendarGrid` en modo "calor" y con el doblez.
- **Datos:** esquemas con semilla; porcentaje sobre la media anual, vivo.
- **Cierre:** "¿Hay ciclo en pasajeros? Con 12 años no se distingue de la tendencia: por eso se estiman juntos. El ruido es
  lo que no explica nada de lo anterior; la 41 lo define con cuidado."
- **Riesgos:** se parece a la 31 y a la 32 (otra vez la rejilla): lo nuevo es la distinción ciclo contra estación, y ahí va
  el tiempo. No se afirma que pasajeros "no tiene ciclo". El mapa de calor describe; no es una descomposición.

### 34 · Descomposición: aditiva o multiplicativa — `34-aditiva-o-multiplicativa.tsx`, 6 clics

- **Clics:**
  0. *Concepto.* Dos esquemas lado a lado con sus envolventes: aditiva (y = T + S, la onda mide siempre lo mismo) y
     multiplicativa (y = T × S, la onda crece con el nivel y forma un embudo).
  1. *Caso.* Pasajeros con la envolvente de máximos y mínimos de cada año. Al lado, el ancho de la onda por año: de 44 a
     232 (×5.3) mientras el nivel crece ×3.8.
  2. Botón "lineal / log": la misma gráfica pasa a escala logarítmica y el ancho se mide como ln(máx/mín): de 0.353 a 0.467.
     Entra el recuadro del logaritmo.
  3. Los cuatro paneles (observada, tendencia, estacional y lo que sobra) en modo **aditivo**, con las fichas de julio: le
     suma siempre 63.8, así que se pasa en 1949 (190.6 contra 148) y se queda corta en 1959 (494.5 contra 548). Se sombrea
     la onda que quedó en lo que sobra.
  4. Modo **multiplicativo**: julio vale ×1.227 (155.5 y 528.3). Error medio de cada una: 14.4 mil contra 6.6.
  5. *Cierre.*
- **Recordatorio:** logaritmo, dos renglones: convierte multiplicaciones en sumas; crecer 10 % suma siempre lo mismo.
- **Visuales:** `SeriesChart` con `escala`, `Barras` (ancho por año), cuatro paneles locales, fichas con `Dato`.
- **Datos:** todo vivo (`descomponer`), verificado contra `seasonal_decompose`.
- **Cierre:** "En pasajeros la onda crece con el nivel: es multiplicativa. Para modelarla se usa el logaritmo (36, 37 y la
  sección G), que la vuelve casi aditiva. Casi: en logaritmo el ancho todavía pasa de 0.35 a 0.47."
- **Riesgos:** la tendencia de los paneles es el promedio de 12 meses de la 38: aquí solo se nombra ("se explica en la 38")
  y se avisa que no existe en los primeros ni en los últimos 6 meses. Elegir multiplicativa es un diagnóstico, no una
  prueba. No se dice que el patrón aditivo del logaritmo "es" el multiplicativo (e^0.2108 = 1.235 contra 1.227). Las
  marcas del eje al pasar a logaritmo se revisan en pantalla para que no se encimen.

### 35 · Estacionariedad — `35-estacionariedad.tsx`, 5 clics

- **Clics:**
  0. *Concepto.* Recuadro (560 px) y, a la derecha, la definición: "su comportamiento promedio no depende de cuándo la
     mires", con las tres condiciones (misma media, misma varianza, y un parecido entre dos momentos que solo depende de la
     distancia entre ellos).
  1. Dos paneles marcados "Esquema · simulado": 200 historias de una serie estacionaria y 200 de un paseo aleatorio (40
     dibujadas, una resaltada). Un corte vertical que se mueve con ↑ ↓ y, al borde, el histograma de los 200 valores en ese
     instante, con media y desviación medidas junto a las teóricas. En la estacionaria el histograma no cambia; en el paseo
     se abre.
  2. Segundo corte, 5 pasos después, y la dispersión de las 200 historias entre los dos cortes: en la estacionaria la
     correlación es la misma en cualquier t; en el paseo crece con t.
  3. *Caso.* "Solo tenemos una historia: comparamos ventanas de 12 meses." Media y desviación de cada año, con el botón
     "original / log". Original: 126.7 → 476.2 y 13.7 → 77.7. En logaritmo la media sigue subiendo y la desviación crece
     mucho menos (0.108 → 0.157).
  4. *Cierre.*
- **Recordatorio:** media (el centro), varianza (qué tanto se aleja del centro) y covarianza (si dos cosas se mueven
  juntas; dividida entre las desviaciones es la correlación, entre −1 y 1).
- **Visuales:** haz de historias (local), `Dispersion`, `Barras` × 2.
- **Datos:** historias, esquema con semilla (`simularAR` con inicio estacionario, `caminata`); ventanas anuales, vivas.
- **Cierre:** "Pasajeros no es estacionaria: la media sube cada año y, además, depende del mes. El logaritmo frena el
  crecimiento de la dispersión; para la media hace falta diferenciar (36)."
- **Riesgos:** "muchas historias posibles" es una idea difícil: se cuenta como "repetir el mismo experimento 200 veces".
  La estacionariedad es propiedad del proceso y con una sola serie solo se diagnostica: la diapositiva dice "diagnóstico".
  La serie estacionaria arranca de su distribución de equilibrio; si arrancara en 0 no lo sería desde el primer paso.

### 36 · Diferenciar — `36-diferenciar.tsx`, 7 clics

- **Clics:**
  0. *Concepto.* Tres enunciados: los modelos de la sección G aprenden números fijos (una media, un peso); eso solo sirve si
     la serie se comporta igual en cualquier tramo; si no, se transforma y al pronosticar la transformación se deshace. A la
     derecha, "Esquema": 12 valores de juguete con la media de sus primeros y de sus últimos 4 (4.75 y 13.25).
  1. ∇x = x de hoy menos x de ayer ("∇ se lee diferencia"). Cada salto de la serie cae como barra a un panel inferior: la
     subida constante se vuelve un nivel constante (media 1).
  2. Diferencia estacional con una serie trimestral de juguete: restar el mismo trimestre del año anterior cancela el
     patrón que se repite. Línea: "trimestral: s = 4 · mensual: s = 12".
  3. *Caso · 3D.* Superficie año × mes del logaritmo de pasajeros. Botones log, `∇ log`, `∇₁₂ log` y `∇∇₁₂ log`. A la derecha,
     la fórmula, una lectura generada de los datos y la serie con la media de sus primeros y de sus últimos 24 valores.
  4. `∇ log`: la inclinación entre años desaparece (en promedio +0.95 % por mes), pero la ondulación por mes sigue: marzo,
     junio, julio y diciembre suben todos los años; septiembre, octubre y noviembre bajan todos los años.
  5. `∇₁₂ log`: cada mes contra el mismo mes del año anterior. Se va el patrón por mes; queda el crecimiento anual, que no
     es parejo (medias de 0.148 al inicio y 0.112 al final).
  6. `∇∇₁₂ log` y *cierre*: la superficie queda como ruido alrededor de cero.
- **Recordatorio:** ninguno.
- **Visuales:** `OperacionAnimada` (modo "diferencia"), `AnioMes3D` en forma "superficie" con plano en 0, `SeriesChart`.
  Las tres diferencias comparten escala (±0.35) para que se vea cómo se aplana; el rótulo del eje vertical cambia con cada
  transformación.
- **Datos:** juguetes, esquema; todo lo demás, vivo (`diferencia`).
- **Cierre:** "Logaritmo, una diferencia y una diferencia estacional. Se pierden 13 meses: quedan 131. ¿Ya es estacionaria?
  Eso se pone a prueba en la 37."
- **Riesgos:** al pasar de log a `∇ log` la altura cambia de significado (nivel → cambio): por eso el plano en 0 y el rótulo.
  Las celdas sin dato (enero de 1949; todo 1949 en las estacionales) no se dibujan. El concepto usa s = 4 y el caso s = 12:
  se dice. Enero tiene 11 diferencias, no 12: el texto dice "todos los años disponibles".

### 37 · Prueba ADF — `37-prueba-adf.tsx`, 7 clics

*Se describe con la recomendación de la decisión 3.*

- **Clics:**
  0. *Concepto.* "Esquema · simulado con los mismos 150 choques": dos series apiladas. Una regresa a su media (cada valor =
     0.5 × el anterior + un choque); la otra acumula cada choque para siempre (factor 1: raíz unitaria). Al lado, el efecto
     de un choque después de k pasos: barras que se apagan contra barras que no bajan.
  1. Las series se cambian por dos dispersiones: valor de ayer contra cambio de hoy, con su recta. En la primera, si está
     arriba, baja (pendiente −0.43); en la otra el nivel no dice a dónde va (−0.01). ADF pregunta eso: ¿la pendiente es
     negativa? El estadístico τ es la pendiente dividida entre su incertidumbre.
  2. Recuadro del p-valor e histograma de τ en 20 000 caminatas simuladas ("lo que saldría si hubiera raíz unitaria"), con
     la línea del 5 % (−2.89) y los dos τ del esquema: −0.87 (p = 0.80) y −6.34 (fuera del eje, con flecha).
  3. *Caso.* Tabla fila por fila; cada fila deja su marca en el histograma. Pasajeros (τ = 0.82, p = 0.99) y log (−1.72,
     p = 0.42): ni se acercan. Nota: la "A" es de aumentada, agrega cambios pasados a la regresión.
  4. `∇ log` (−2.72, p = 0.071) y `∇₁₂ log` (−2.71, p = 0.072): quedan justo a la derecha de la línea.
  5. `∇∇₁₂ log` (−4.44, p = 0.00025): se rechaza.
  6. *Advertencia y cierre.* "Las dos filas de en medio están en la frontera: con otro criterio para elegir los rezagos dan
     0.030 y 0.013." Y: no rechazar no prueba que haya raíz unitaria.
- **Recordatorio:** p-valor: "supón que H₀ es cierta; el p-valor es qué tan raro sería un resultado como el que salió. Si
  p < 0.05, sería muy raro y se rechaza H₀. Si no, no se rechaza, que no es lo mismo que probarla". Aquí H₀: hay raíz
  unitaria.
- **Visuales:** `SeriesChart` × 2, `Barras` (efecto del choque), `Dispersion` × 2 con recta ajustada, histograma local con
  la curva normal de comparación, tabla local con una miniatura de cada serie.
- **Datos:** todo de `adf_pasajeros.json`, salvo la recta de las dispersiones (viva, `minimosCuadrados`) y la curva normal.
- **Cierre:** "Con logaritmo y las dos diferencias, ADF descarta la raíz unitaria. Que haga falta la diferencia estacional
  no lo dice ADF: lo dicen el patrón por mes de la 36 y los picos cada 12 de la 39. Para pasajeros: d = 1 y D = 1."
- **Riesgos:** confundir "p grande" con "demostrado que no es estacionaria". El histograma es de la prueba simple con 131
  valores y las filas tienen entre 118 y 130 observaciones y rezagos: sirve para ver el área, no para leer el p; el p es
  el de statsmodels. Preguntas probables con respuesta lista y sin mostrar: con tendencia en la regresión (`"ct"`) los p
  son 0.55, 0.52, 0.10, 0.10 y 0.002; sin logaritmo, `∇₁₂` da 0.012.

### 38 · Promedio móvil como suavizado — `38-promedio-movil.tsx`, 4 clics

- **Clics:**
  0. *Concepto.* Fórmula del promedio centrado y "Esquema": 9 valores de juguete (una tendencia más un patrón que se repite
     cada 3). Una ventana de 3 recorre la serie, escribe su cuenta y deja caer el promedio: queda una recta.
  1. *Caso.* Pasajeros con su promedio móvil encima y botones 3, 5, 7 y 2×12 (también ↑ ↓). Debajo, una barra por cada peso
     de la ventana. Con 2×12: "12 es par y no tiene centro; se promedian dos ventanas seguidas: 13 meses, con medio peso
     en los extremos". Faltan 6 meses al inicio y 6 al final (quedan 132).
  2. Acercamiento a 1958–1960: el centrado termina en junio de 1960 porque necesita 6 meses del futuro; el atrasado de 12
     llega a diciembre, pero va 5.5 meses detrás.
  3. *Cierre.* Dos diagramas: promedio móvil (promedia observaciones; se aplica, no se estima; no pronostica) contra MA(q)
     (combina choques que no se ven; sus pesos se estiman; es un modelo: diapositiva 43).
- **Recordatorio:** ninguno.
- **Visuales:** `OperacionAnimada` (modo "ventana"), `SeriesChart` con `ventana`, `Barras` (pesos), diagrama local.
- **Datos:** juguete, esquema; lo demás, vivo (`promedioMovil`).
- **Cierre:** "Mismo nombre, otra cosa: el suavizado promedia lo que vemos; MA(q) combina choques que no vemos."
- **Riesgos:** el clic 3 es el punto de la diapositiva. El centrado "usa el futuro": es la misma idea que la fuga de la 30
  y se dice en una frase. Con estacionalidad multiplicativa la cancelación del 2×12 es aproximada; el texto habla de lo
  que se ve.

### 39 · Rezagos y autocorrelación (ACF) — `39-rezagos-y-acf.tsx`, 5 clics

- **Clics:**
  0. *Concepto.* "Esquema": tabla de 8 valores; la columna se copia y se desliza una fila (el valor de ayer) y otra más (el
     de antier). Recuadro de correlación.
  1. Columna de productos: (valor − media) × (valor recorrido − media). Suma de productos 18, suma de cuadrados 34,
     r₁ = 0.53. Botones k = 1…4 y un mini correlograma del esquema.
  2. *Caso.* Arriba, pasajeros, su media y la copia recorrida k meses; abajo, las barras de los productos. A la derecha, el
     correlograma de k = 0 a 36, que se llena con ↑ ↓ (o con el botón "recorrer"). Junto a r₁ = 0.948, la nota: "en la 29
     salió 0.960: allá cada lista tenía su propia media; aquí se usa una sola".
  3. Banda ±0.163 ("si no hubiera relación alguna entre los meses, 95 de cada 100 barras caerían aquí; eso se llama ruido
     blanco: diapositiva 41") y dos anotaciones: decae muy lento (tendencia) y picos en 12 y 24 (estacionalidad). A la
     izquierda: con tendencia, los primeros años quedan bajo la media y los últimos arriba, así que casi todos los
     productos son positivos para cualquier k (se cuenta cuántos).
  4. *Cierre.* El correlograma cambia al de `∇∇₁₂ log` (131 valores, banda ±0.171): casi todo dentro. Las dos barras mayores
     son 12 (−0.39) y 1 (−0.34); salen apenas 3, 9, 23 y 32. Nota: con 36 barras, unas 2 saldrían por azar.
- **Recordatorio:** correlación: mide si dos listas suben y bajan juntas (+1 juntas, −1 al revés, 0 sin relación).
- **Visuales:** tabla de rezagos (local), `SeriesChart`, `Barras` (productos), `Correlogram`.
- **Datos:** juguete, esquema; todo lo demás, vivo (`acf`, `productosRezago`, `banda95`).
- **Cierre:** "Una ACF que baja lento indica tendencia; picos cada 12, estacionalidad. Después de diferenciar quedan dos
  huellas, en 1 y en 12: es lo que un modelo puede aprender (46 y 47)."
- **Riesgos:** r_k no es la correlación de los pares (con k = 12 da 0.76 y los pares, 0.99): por eso no se dibuja la nube y
  sí la suma de productos, que es la fórmula misma. La banda es la de ruido blanco; la 46 puede necesitar la de Bartlett:
  lo decide el hito 5. Cinco paneles en el caso: las anotaciones entran hasta el clic 3.

### 40 · Autocorrelación parcial (PACF) — `40-pacf.tsx`, 5 clics

- **Clics:**
  0. *Concepto.* Cadena x de antier → x de ayer → x de hoy, con el camino indirecto resaltado y una flecha directa en duda.
     La ACF cuenta todo el parecido, también el que llega de rebote; la PACF, solo el directo: es el coeficiente del valor
     de hace k pasos cuando la regresión también incluye a todos los de en medio. Recuadro de regresión.
  1. *3D.* "Esquema · simulado": nube de una serie con memoria (factor 0.8) con ejes antier, ayer y hoy; se ajusta con 1 000
     valores y se dibujan 300. De frente, la sombra en la pared: antier y hoy parecen muy relacionados (pendiente ≈ 0.64).
     Botón "otra muestra".
  2. La cámara gira y aparece el plano de regresión, visto de canto: con ayer en la cuenta, antier ya no aporta
     (coeficiente ≈ 0). Eso es la PACF en 2.
  3. La escena se reduce y entran dos correlogramas teóricos de esa serie: la ACF decae (0.80, 0.64, 0.51…) y la PACF se
     corta después de 1.
  4. *Caso y cierre.* ACF y PACF de `∇∇₁₂ log` lado a lado, con 1 y 12 rotulados (PACF: −0.34 y −0.34; fuera de la banda
     también 3 y 9). Pie: "PACF por Durbin-Levinson; el primer valor siempre coincide con r₁". Botón optativo "sin
     diferenciar": la PACF del logaritmo empieza en 0.95.
- **Recordatorio:** regresión: una recta, o un plano, que predice una cosa a partir de otras; el residuo es lo que no explica.
- **Visuales:** cadena (local), `LagCloud3D` dentro de `Scene3D` con `vista`, `Correlogram` × 2.
- **Datos:** teóricos y simulación, vivos (`simularAR`, `minimosCuadrados`, `pacf`); caso, vivo.
- **Cierre:** "ACF y PACF juntas son las huellas para elegir el modelo: se leen en la 46. En pasajeros destacan 1 y 12 en
  las dos: corto plazo y estación."
- **Riesgos:** el coeficiente del plano es la PACF por regresión y el caso usa Durbin-Levinson: dan números parecidos, no
  iguales, y cada uno dice de dónde sale. Con algunas semillas el coeficiente de antier se aleja de 0 por azar: el botón
  "otra muestra" enseña esa variación en vez de esconderla; la semilla inicial se documenta. En datos reales no hay cortes
  limpios: se dice "destacan", no "se corta". No se adelanta la lectura de órdenes de la 46.

## 7. Orden de construcción

- [x] **Tanda 0 · Base.** `scripts/series_comun.py` y `scripts/exportar_hito4.py` con sus cuatro JSON y su registro;
  `lib/series.ts` y `lib/pasajeros.ts`; las comprobaciones nuevas en `scripts/verificar.ts`; ampliar `Lineas` y crear
  `SeriesChart`; volver a ver las ocho diapositivas que usan `Lineas`; anotar `statsmodels` en `README.md`.
- [x] **Tanda 1 · 29, 30 y 31.** Con ellas: `Dispersion`, `SplitDiagram` y `CalendarGrid` (rejilla y vuelo a la serie).
- [x] **Tanda 2 · 32, 33, 34 y 35.** Con ellas: `vista` en `Scene3D`, `AnioMes3D` (barras), `Barras` y el modo "calor".
- [x] **Tanda 3 · 36, 37 y 38.** Con ellas: `OperacionAnimada` y `AnioMes3D` (superficie).
- [x] **Tanda 4 · 39 y 40.** Con ellas: `Correlogram` y `LagCloud3D`.
- [x] **Cierre del hito** (ver sección 8). Cerrado el 2026-10-13 con el visto bueno del usuario (ver la bitácora).

Cada tanda termina con `npm run build`, `npm run verify` y sus diapositivas vistas clic por clic. Es probable que el hito
lleve más de una sesión: al cortar, se marcan las casillas y se anota en la bitácora por dónde seguir.

## 8. Cómo se da por terminado

1. `npm run build` sin errores y `npm run verify` con "Todo coincide".
2. Las 12 diapositivas vistas en el navegador clic por clic, sin errores en consola ni textos encimados; además, las ocho
   anteriores que usan `Lineas`.
3. Revisión de rigor (cada afirmación en pantalla tiene su dato) y de claridad (se entiende desde cero).
4. Bitácora de abajo al día, con lo que **no** se revisó.
5. `docs/HANDOFF.md`, `CLAUDE.md` ("Piezas disponibles" y la convención de quién lee los JSON) y la subtarea 195 de
   ListKeeper actualizados. En `docs/PLAN-DIAPOSITIVAS.md` se corrigen las entradas que cambiaron: 29 (dataset crudo), 30
   (corte y segundo modelo), 34 (cierre), 36 (clic de `∇₁₂ log`), 37 (cierre y advertencia) y la tabla de componentes.
6. En el handoff, lo que el hito 5 tiene que decidir: la banda del correlograma y cómo conviven los números con 144 meses
   (36–40) con los de 132 (sección G).

## 9. Bitácora

### 2026-10-12 · Antes de construir (comprobaciones para escribir el plan)

- **Hecho:** se instaló `statsmodels` 0.15.0 en el `.venv`. No se tocó nada más del repo; los scripts de comprobación y el
  caché de la descarga quedaron en la carpeta temporal de la sesión.
- **Hallazgos:**
  - El dataset llega con `time` en decimal y `value`, no con una columna de mes.
  - La 30 con solo 1960 como prueba no se sostiene: el MAE barajado va de 24.4 a 51.3 según la semilla, contra 44.1 del
    pronóstico. Con 1959–1960 sí: 23.6 a 38.1 contra 67.2. Midiendo qué promete cada validación con 1949–1959, K-Fold
    barajado promete 6.8 % (MAE 17.6), el origen móvil 10.2 % (MAE 38.5) y el error real de 1960 fue 8.5 % (MAE 44.1).
  - El pronóstico del bosque para 1960 (MAE 44.1) queda apenas mejor que copiar 1959 (47.8), y se queda corto en 10 de
    los 12 meses. Sirve para la 49.
  - ADF con 1949–1959: `∇ log` p = 0.029, `∇₁₂ log` p = 0.096, `∇∇₁₂ log` p = 0.001. Con los 144 meses y rezagos por BIC:
    0.030, 0.013 y prácticamente 0.
  - Con 1949–1959 las barras de `∇∇₁₂ log` fuera de la banda cambian: en la ACF salen 1, 3, 12, 23, 32 y 35; en la PACF,
    1, 3, 9, 12, 23 y 36. Los rezagos 1 y 12 siguen siendo los mayores.
  - `pacf` por Durbin-Levinson sobre la ACF es idéntico a `method="ywm"` y a `"ldb"` de statsmodels.
### 2026-10-12 · Tandas 0 y 1 (base, 29, 30 y 31)

- **Lo que cambió respecto a este plan, y por qué:**
  - `Lineas` la usan **10** diapositivas, no 8: también la 18 y la 19.
  - `simularAR` quedó para un solo coeficiente (`simularAR(phi, n, rand, sigma)`): es todo lo que piden 29, 35 y 40. Si el
    hito 5 necesita más rezagos, se amplía allá. Se agregó `pesosCentrados(k)` (los pesos de la ventana, para la 38).
  - `SeriesChart` no lee `lib/pasajeros.ts`: recibe `anioInicial` (1949 por omisión) y sirve para cualquier serie mensual.
    Ganó `sinMarcasX` (la serie barajada de la 29 no tiene fechas) y exporta `pasoRedondo`.
  - `CalendarGrid` ganó `anchoTabla` (la tabla de la 31 ocupa 1,040 px y la serie, todo el ancho), `futuro` y `cursor`.
  - **30, esquema:** el contador de fuga del plan ("celdas de entrenamiento posteriores a alguna de prueba") daba 16 de 16
    en la ronda 1, que no dice nada. Se cambió por el mismo que usa el caso: 14 de 19 momentos tienen al siguiente en el
    entrenamiento de su ronda.
  - **29:** las tiras usan las semillas 55 (dado) y 155 (serie con memoria), elegidas por búsqueda: correlación entre
    vecinos −0.05 y 0.86. Barajado inicial: semilla 12.
  - El script escribe además `sensibilidad.con_tendencia` en `adf_pasajeros.json` (para las preguntas de la 37).
- **Hallazgos:** `lib/series.ts` coincide con las referencias con diferencias de 1e-13 o menos (el Dickey-Fuller del
  esquema, 1e-7, porque sus series se guardan con 6 decimales). `exportar_hito4.py` tarda 84 s.
- **Lo que no se revisó o quedó pendiente:**
  - De las 10 diapositivas con `Lineas` se revisó por DOM el último paso de 9 (trazos completos, sin `NaN`, sin errores
    en consola): 8, 12, 14, 16, 18, 19, 21, 22 y 27. **No se vieron en captura** y falta la 11. `Lineas` sin las opciones
    nuevas sigue el mismo camino de dibujo que antes.
  - Capturas a 626 × 391 px (el panel no dio más): sirven para ver distribución y encimados gruesos, no para leer el
    texto chico. Vistos: 29 (pasos 1, 3, 5 y 6 con "barajar"), 30 (1, 4 y 6) y 31 (1 y 3 con ↑). No se vieron en captura:
    29 (0, 2 y 4), 30 (0, 2, 3 y 5) ni 31 (0 y 2).
  - Para capturar sin animaciones a medias: en la consola, `MotionGlobalConfig.skipAnimations = true` del módulo
    `motion_react.js` que ya cargó la página, y avanzar con las flechas en vez de recargar.

### 2026-10-12 · Tandas 2, 3 y 4 (32 a 40)

- **Lo que cambió respecto a este plan, y por qué:**
  - **32:** tres vistas de cámara (`VISTAS_ANIO_MES`: por meses, por años y libre). El texto de cada vista sale de los
    datos (comparado con el mismo mes del año anterior, sube 127 de 132 veces). Los años empatados rotulan "jul = ago".
  - **33:** las dos series de esquema se dibujan con `CalendarGrid` en modo "puntos" (no con `SeriesChart`), para que sea
    la misma pieza la que se dobla en renglones de 12. La cíclica usa vueltas de 14, 21, 10, 17 y 10 pasos.
  - **34:** el paso a logaritmo no usa una mezcla animada sino la opción `escalaY` de `Lineas` con transición del trazo.
    La frase "en logaritmo el ancho casi no cambia" se cambió por el dato: se multiplica por 1.3, no por 5.3. No se sombrea
    la onda sobrante: se dice con una frase, y solo si la correlación entre lo que sobra y el patrón cambia de signo entre
    el primer año y el último (se calcula).
  - **35:** el corte se mueve de 5 en 5 pasos (de 1 en 1 eran 100 pulsaciones). Segundo corte a 5 pasos.
  - **36:** el tope de la escala de las tres diferencias (±0.35) se calcula del mayor cambio, no está escrito.
  - **37:** las filas frágiles no están escritas: se detectan comparando el veredicto al 5 % con AIC y con BIC. La tabla
    no lleva columna de rezagos (no cabía); el máximo se dice en la nota. `.label` con τ usa `label natural`.
  - **38:** sin barrido automático; la tira de pesos usa la misma escala para todas las ventanas, así se ve que con 2×12
    cada mes pesa mucho menos.
  - **39:** el botón "recorrer" llena el correlograma; cualquier flecha lo detiene. El panel de productos es de 144 barras.
  - **40:** la nube se mira con un ángulo de visión angosto (16°) y la cámara lejos, para que de frente la nube y su
    sombra casi coincidan. La vista de canto es desde el lado negativo de "antier": desde el otro, "ayer" crecía hacia la
    izquierda y la relación se leía al revés. Semilla inicial 43 (entre la 40 y la 49, el coeficiente de antier va de
    −0.06 a 0.05 y la pendiente de la sombra, de 0.58 a 0.71). No se usa la definición por correlación de residuos.
  - `Correlogram` exporta `fueraDeBanda`; `Lineas` ganó `abajo` en los segmentos; `Scene3D` exporta el tipo `Vista`.
- **Hallazgos:** ninguno que contradiga lo medido al planear. Lo que se lee en pantalla: 29, r = 0.960 y −0.16 con el
  barajado inicial; 30, 26.2 (23.6 a 38.1) contra 67.2 y 23.1 (21.4 a 27.1) contra 43.0; 35, con t = 20 la desviación
  entre historias es 1.43 (teórica 1.40) y 4.23 (teórica 4.47); 39, con k = 12, 120 de 132 productos positivos en
  pasajeros y 51 de 119 tras diferenciar; 40, pendiente de la sombra 0.64 y plano 0.80 × ayer + 0.00 × antier.
- **Lo que no se revisó o quedó pendiente (el hito NO está cerrado):**
  - **Revisión a tamaño real.** Todas las capturas son de 626 × 391 px (un tercio del lienzo): se ve la distribución, que
    nada se desborda y que no hay encimados gruesos, pero **no se puede leer el texto de 20 a 24 px ni las etiquetas de
    los ejes**. Falta ver cada diapositiva a 1280 × 720 o más.
  - **Pasos vistos en captura:** 32 (1, 2, 3 y la vista "por meses"), 33 (1 y 2), 34 (2 y 5), 35 (1, 2 y 4), 36 (1, 2, 4
    y 6), 37 (0, 1, 2 y 6), 38 (0, 1, 2 y 3), 39 (1, 3 y 4) y 40 (0, 1, 2, 3 y 4). **No vistos:** 32 (0 y "por años"),
    33 (0 y 3), 34 (0, 1, 3 y 4), 35 (0 y 3), 36 (0, 3 y 5), 37 (3, 4 y 5) y 39 (0 y 2). De todos se midió por DOM que el
    contenido no rebasa el cuerpo, salvo donde se anota abajo.
  - **Sin probar a mano:** los botones "aditiva / multiplicativa" y "lineal / log" de la 34, "original / log" de la 35,
    los de transformación de la 36, las ventanas de la 38, "recorrer" de la 39, "otra muestra" y "sin diferenciar" de la
    40, el clic en las filas de la tabla de la 37 y el giro con el mouse de las tres escenas 3D. Sí se probaron "barajar"
    (29), el cursor (31), "por meses" (32) y ↑ ↓ en la 35.
  - **Ajustes hechos después de la última captura, sin volver a ver:** rayado más fino de la fuga y franjas más altas (30),
    alineación de la tabla de errores (30), rótulos de picos empatados (32), esquemas más altos (33), encabezado y ejes
    de los paneles (34), paneles de historias más altos (35), miniaturas de la tabla (37) y gráfica del acercamiento más
    baja (38, se desbordaba 23 px).
  - **Revisión de rigor y de claridad** (sección 8, punto 3): no se hizo como pasada aparte.
  - En la consola quedó un solo error en toda la sesión, de un estado intermedio mientras se editaba la 30
    (`FUTURO_R1 is not defined`, con la marca de tiempo del módulo viejo). Con el código actual no aparece.
  - No se actualizó la subtarea 195 de ListKeeper: toca al cerrar.

### 2026-10-13 · Cierre

- **Publicado.** A petición del usuario, Claude hizo commit (`abe12f3`) y push a `main`; el despliegue terminó en verde y la
  página publicada trae las 29–40.
- **Revisión a tamaño real: la hizo el usuario** en GitHub Pages. Su veredicto: "me parece todo bien", sin cambios. No
  detalló qué pasos ni qué botones recorrió, así que la lista de arriba ("lo que no se revisó") queda como registro de lo
  que Claude no vio por su cuenta.
- **Lo que sigue sin hacerse y se hereda:**
  - La revisión de rigor y de claridad como pasada aparte (sección 8, punto 3). Se cierra con el visto bueno del usuario.
  - Ver en captura las 10 diapositivas que usan `Lineas`; la 11 ni siquiera se comprobó por DOM.
  - Legibilidad en proyector: nunca se ha probado.
- **Lo que el hito 5 tiene que decidir** está en `docs/HANDOFF.md` ("Lo que el plan del hito 5 tiene que resolver").
