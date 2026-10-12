# Especificación detallada — Puente a secuencias (29–30) y F. Fundamentos de series, parte 1 (31–35). Caso de estudio: 

> Borrador de diseño generado por un agente. Sirve de referencia al construir; el plan vigente es `docs/PLAN-DIAPOSITIVAS.md`. Los números son los esperados y se recalculan al construir.

**Notas de la sección:** Puente a secuencias (29–30) y F. Fundamentos de series, parte 1 (31–35). Caso de estudio: pasajeros aéreos 1949–1960 (Box y Jenkins, serie G; 144 meses, en miles; suma comprobada 40 363, primero 112, último 432). Etiquetas de sección: ["U8 · Datos secuenciales", "Puente"] en la 29 y la 30, y ["U8 · Datos secuenciales", "F. Fundamentos de series"] de la 31 a la 35. Prop caso = "Pasajeros aéreos" desde el primer paso de caso. Archivos: src/slides/29-orden-importa.tsx (5 pasos), 30-validacion-temporal.tsx (5), 31-que-es-serie.tsx (4), 32-tendencia-estacionalidad.tsx (4), 33-ciclo-ruido.tsx (4, se puede recortar), 34-aditiva-multiplicativa.tsx (5), 35-estacionariedad.tsx (5). Se registran en src/slides/index.ts con esos num y steps. Lenguaje visual común a toda la sección: el entrenamiento y lo real se dibujan en gris (--data / --text) y la prueba, el pronóstico y lo que se señala, en rojo. La tabla año × mes (12 × 12) es el hilo visual que se repite: en la 31 se desenrolla, en la 32 se vuelve barras 3D, en la 33 se dobla con sus picos y en la 35 da las ventanas anuales. Todos los números de las fichas salen de los cálculos que corrí con numpy y sklearn 1.9.1 sobre los 144 valores. En la diapositiva no se escribe ninguno a mano: se calculan en TS o se leen del JSON. Hay que coordinar tres cosas con otras secciones: el corte entrenamiento 1949–1958 / prueba 1959–1960 (de la 45 a la 50), el promedio móvil centrado 2×12 que aquí se usa sin detallar (38) y la gráfica de rezagos de la 29 (39).


## 29 · El orden importa

- **Objetivo:** Entender qué supone i.i.d., por qué en la parte 1 se podía barajar sin perder nada y por qué en una serie de tiempo el orden es parte de la información.
- **Estado:** nueva · **Duración:** 70 s

### Pasos

**Paso 0 (concepto).** Lede: 'En la parte 1 cada fila era otra persona y podíamos barajarlas. En una serie, el orden de los datos también es dato.' Cuadrícula de dos columnas (560px | 1060px). A la izquierda, Recap 'i.i.d.' con independientes (saber un dato no cambia lo que esperas del otro) e idénticamente distribuidos (todos salen de la misma distribución). A la derecha, etiqueta 'Esquema · simulado, no son datos' y dos tiras ShuffleSeries apiladas de 1060×200: 'A · 24 tiros de un dado' (barras de 1 a 6) y 'B · una serie con memoria' (barras de un AR(1) con φ = 0.9).

- Animación: Las barras crecen de izquierda a derecha, con 25 ms entre una y otra, para sugerir el orden de llegada.
- Interacción: ninguna
- Frase clave: i.i.d.: cada dato es un sorteo nuevo de la misma urna.

**Paso 1 (concepto).** El mismo layout. Bajo cada tira aparece un veredicto: A 'se ve igual de aleatoria'; B 'se perdieron las subidas y bajadas'. Arriba a la derecha, los chips 'barajar' y 'orden original'.

- Animación: Las dos tiras se barajan con la misma permutación (Fisher-Yates con mulberry32). Cada barra se desliza en horizontal a su nueva posición (0.8 s, 12 ms entre barras).
- Interacción: chips 'barajar' (nueva semilla) y 'orden original'
- Frase clave: Si los datos son i.i.d., cualquier orden es igual de probable: barajar no quita información. En B, el orden era la información.

**Paso 2 (caso).** Aparece la etiqueta Caso · Pasajeros aéreos. A la izquierda: 'Pasajeros internacionales por mes, 1949–1960, en miles. Cada punto es un mes: 144 en total.' A la derecha, ShuffleSeries en modo línea con puntos (1060×420), con marcas de enero de cada año en el eje X.

- Animación: Con 'barajar', los puntos vuelan a meses al azar y la línea se vuelve a trazar en el nuevo orden (el atributo d del path se anima). La subida y la onda anual se convierten en un zigzag.
- Interacción: chips 'barajar' y 'orden original'
- Frase clave: Barajados, desaparecen la subida de los años y la onda del verano.

**Paso 3 (caso).** El layout pasa a 1000px | 560px. La serie queda a la izquierda y a la derecha aparece LagScatter (520×420): X = pasajeros en el mes t, Y = pasajeros en el mes t+1, 143 puntos, diagonal de referencia y la correlación r en mono grande.

- Animación: Al alternar 'barajar' y 'orden original', los puntos del diagrama se mueven entre las dos configuraciones (0.8 s): la diagonal se deshace en una nube y r baja de 0.96 a un valor cercano a 0, calculado en vivo.
- Interacción: los mismos chips; afectan la serie y el diagrama
- Frase clave: Cada mes se parece al anterior (correlación 0.96). Al barajar, esa relación desaparece.

**Paso 4 (cierre).** Franja takeaway al pie, de ancho completo; la serie y el diagrama siguen arriba.

- Animación: Reveal del texto.
- Interacción: ninguna
- Frase clave: Barajar y K-Fold suponen datos i.i.d. En Adult lo suponíamos: cada fila es otra persona. En pasajeros no: los meses cercanos se parecen y el nivel cambia con los años. Hay que validar de otra forma.

### Visuales

- **Recuadro i.i.d.** (texto, Recap + TeX (existentes)): Definición en dos renglones, con la fórmula de intercambiabilidad en pequeño.
- **Tiras dado vs serie con memoria** (svg, ShuffleSeries (nuevo)): Dos tiras de 24 barras que se barajan con animación, para comparar qué se pierde.
- **Serie de pasajeros barajable** (svg, ShuffleSeries (nuevo; usa los ejes de TimeSeriesChart)): Los 144 meses en línea y puntos; los puntos vuelan a su posición barajada.
- **Este mes vs el siguiente** (svg, LagScatter (nuevo)): Diagrama de dispersión de (y_t, y_{t+1}) con r en vivo; los puntos se animan entre el orden original y el barajado.

### Datos

- **dado** (esquema-didactico): 24 enteros uniformes en {1,…,6}. — *Cálculo:* TS en vivo: floor(rand()*6)+1 con mulberry32 de semilla fija (p. ej. 29). — *Verificación:* Lleva la etiqueta 'esquema · simulado'. Es determinista con la semilla, así que se ve igual en cada carga.
- **ar1_memoria** (esquema-didactico): 24 valores de x_t = 0.9 x_{t-1} + ε_t, con ε_t ~ N(0,1) y x_0 ~ N(0, 1/(1−0.81)). — *Cálculo:* simulateAR([0.9], 24, mulberry32(semilla), {sigma: 1, inicioEstacionario: true}) en src/lib/series.ts, con gaussian() de rng.ts. — *Verificación:* Prueba unitaria: x_t − 0.9·x_{t−1} reproduce exactamente la sucesión ε_t generada por gaussian() con la misma semilla.
- **permutacion** (ts-vivo): Permutación de 0…n−1 que se usa para barajar. — *Cálculo:* shuffle(n, rand) con Fisher-Yates en series.ts. — *Verificación:* Prueba: la permutación ordenada es 0…n−1, y con la misma semilla sale la misma permutación.
- **pasajeros** (python-json): Los 144 totales mensuales, de enero de 1949 a diciembre de 1960, en miles. — *Cálculo:* src/data/pasajeros.json, generado por scripts/exportar_series.py y leído con src/lib/pasajeros.ts. — *Verificación:* El script exige n = 144, suma = 40 363, y[0] = 112, y[143] = 432 y máximo 622 en julio de 1960 (lo comprobé con numpy).
- **r1_original** (ts-vivo): Correlación de Pearson entre los pares (y_t, y_{t+1}) para t = 1…143, con dos medias (la fórmula de np.corrcoef). Da 0.9602. — *Cálculo:* pearson(x.slice(0,-1), x.slice(1)) en series.ts. — *Verificación:* Contra referencia.r1 de pasajeros.json (np.corrcoef(y[:-1], y[1:])[0,1] = 0.96019), con tolerancia de 1e-12.
- **r1_barajado** (ts-vivo): La misma correlación sobre la serie barajada; depende de la semilla y queda cerca de 0. — *Cálculo:* pearson sobre y[perm]. — *Verificación:* Prueba de desarrollo: se exporta la permutación de la semilla por defecto, se calcula r con numpy y se compara.

### Fórmulas

- `Y_1,\dots,Y_n \overset{\text{i.i.d.}}{\sim} F`
- `P(Y_i\in A,\ Y_j\in B) = P(Y_i\in A)\,P(Y_j\in B)`
- `(Y_1,\dots,Y_n) \overset{d}{=} (Y_{\pi(1)},\dots,Y_{\pi(n)})\ \text{ para toda permutación } \pi`
- `x_t = 0.9\,x_{t-1} + \varepsilon_t \quad (\text{esquema})`
- `r = \dfrac{\sum_{t=1}^{143}(y_t-\bar y_{a})(y_{t+1}-\bar y_{b})}{\sqrt{\sum_t (y_t-\bar y_{a})^2}\,\sqrt{\sum_t (y_{t+1}-\bar y_{b})^2}}`

### Rigor

- i.i.d. implica intercambiabilidad: la distribución conjunta no cambia al permutar. Por eso 'barajar no quita información' es exacto para datos i.i.d.
- Un r1 alto en pasajeros NO prueba dependencia en sentido estricto: una tendencia determinista más ruido independiente también daría r1 alto. Las frases dicen 'el orden contiene información' y 'los meses cercanos se parecen', nunca 'los errores están correlacionados'. Que no estén idénticamente distribuidos sí es directo: la media anual sube (se mide en la 32 y en la 35).
- Que Adult sea i.i.d. es un supuesto del muestreo, no algo medido. No se mide el orden de filas de adult3d.json porque train_test_split ya lo barajó y el argumento sería circular.
- r1 se calcula como np.corrcoef (dos medias). La ACF de la 39 usa una sola media y un solo denominador y da un valor un poco distinto. Si aparecen los dos números, hay que aclararlo.

### Riesgos

- Se adelanta a la 39 (rezagos): presentar el diagrama solo como 'este mes vs el siguiente' y acordar con la 39 que lo retome.
- Muchos principiantes no conocen la correlación: decir 'qué tan alineados están los puntos con la diagonal' y dejar r como dato secundario.
- r barajado cambia con la semilla: no narrar un valor fijo, leer el de la pantalla.
- Se pierde tiempo si se barajan muchas veces: con un 'barajar' y un 'orden original' por paso basta.

## 30 · Validación temporal

- **Objetivo:** Ver que barajar una serie para validarla es entrenar con el futuro (fuga de datos), y que la validación correcta siempre prueba con fechas posteriores a las de entrenamiento.
- **Estado:** nueva · **Duración:** 90 s

### Pasos

**Paso 0 (concepto).** Cuadrícula 520px | 1fr. A la izquierda, Recap 'validación cruzada': partir en K bloques, entrenar con K−1, probar con el que queda, repetir K veces y promediar. A la derecha, 'Esquema · 20 momentos' con SplitDiagram 'K-Fold barajado (K = 5)': 5 filas de 20 celdas, 4 rojas de prueba repartidas al azar por fila y el resto gris de entrenamiento, con la flecha 'tiempo →' abajo.

- Animación: Las filas aparecen una por una, con 150 ms entre filas.
- Interacción: ninguna
- Frase clave: Así validamos en la parte 1: cada dato es prueba una vez.

**Paso 1 (concepto).** En la fila 1, la primera celda de prueba cuyo vecino derecho es de entrenamiento (se calcula, no se elige a mano) recibe un arco rojo desde ese vecino, con la nota 'para predecir t = i, el modelo ya vio t = i+1'. En todas las filas, las celdas de entrenamiento posteriores a alguna de prueba se rayan en rojo, con la leyenda 'futuro usado para entrenar' y un contador en vivo ('X de 16 celdas de entrenamiento de la fila 1').

- Animación: El arco se dibuja con pathLength de 0 a 1 y el rayado se enciende fila por fila.
- Interacción: ninguna
- Frase clave: Barajar = entrenar con el futuro. Es fuga de datos: el error medido sale mejor de lo que será al pronosticar.

**Paso 2 (concepto).** El diagrama se vuelve TimeSeriesSplit (ventana creciente): 5 filas en escalera, con el entrenamiento desde el inicio, la prueba en el bloque siguiente y el resto vacío y tenue ('aún no existe'). Debajo, un bloque más chico 'walk-forward' de 6 filas: la ventana avanza un paso por fila y se prueba solo la celda siguiente.

- Animación: Las celdas cambian de color con transiciones de 0.4 s, sin cortes entre diagramas.
- Interacción: ninguna
- Frase clave: Regla: la prueba siempre va después del entrenamiento, como cuando se pronostica de verdad.

**Paso 3 (caso).** Aparece Caso · Pasajeros aéreos. Arriba, a lo ancho (1696px), dos SplitDiagram compactos de 144 meses con celdas de 12px de alto y años en el eje: 'K-Fold barajado (5 pliegues, semilla 42)' y 'TimeSeriesSplit(5): entrena 24, 48, 72, 96 y 120 meses y prueba los 24 siguientes'. Contador en vivo: '117 de 143 meses de prueba tienen el mes siguiente en entrenamiento'. Abajo, a la izquierda, TimeSeriesChart de 1957 a 1960 (1100×330): real (línea --text), predicciones de K-Fold para 1959–1960 (--data punteada) y pronóstico entrenado solo con 1949–1958 (rojo). A la derecha, dos cifras grandes en mono (MAE barajado 26.2 y MAE pronóstico 67.2, en miles) y la nota del modelo: 'Random Forest de 300 árboles; variables: número de mes y mes del año'.

- Animación: Primero se dibuja la línea real, luego la punteada de K-Fold, que va pegada a la real, y al final la roja, que se queda abajo y plana.
- Interacción: ninguna
- Frase clave: Mismo modelo, mismos 24 meses: barajado se equivoca en promedio 26.2 mil pasajeros por mes; pronosticando de verdad, 67.2.

**Paso 4 (cierre).** En la gráfica se agrega una línea horizontal discontinua en el máximo de entrenamiento (505) y una llave que marca que 1960 repite a 1959 en el pronóstico rojo. Takeaway al pie.

- Animación: Reveal de la línea, la llave y el texto.
- Interacción: ninguna
- Frase clave: Barajado, el bosque solo rellena huecos entre meses que ya vio. Al pronosticar tiene que ir más allá, y un bosque nunca predice más que el máximo de su entrenamiento. De aquí en adelante: entrenar con 1949–1958 y probar con 1959–1960.

### Visuales

- **Recuadro validación cruzada** (texto, Recap (existente)): Recordatorio de K-Fold en tres renglones (la diapositiva 3 ya lo presentó).
- **Diagrama de particiones** (diagrama, SplitDiagram (nuevo)): Filas = pliegues, celdas = momentos; gris = entrenamiento, rojo = prueba, vacío = futuro no disponible, rayado rojo = fuga; arco de fuga. Pasa de K-Fold a TimeSeriesSplit y a walk-forward.
- **Mismos 24 meses, dos validaciones** (svg, TimeSeriesChart (nuevo) con ventanaX y bandas de entrenamiento/prueba): Ventana 1957–1960: real, predicción de K-Fold y pronóstico honesto, con la línea del máximo de entrenamiento.
- **Cifras de error** (texto, JSX con la clase .mono): Dos MAE grandes en mono y su razón (2.6×), calculados en vivo.

### Datos

- **esquema_kfold_20** (esquema-didactico): Asignación de 20 momentos a 5 pliegues barajados (4 por pliegue). — *Cálculo:* kfoldShuffle(20, 5, mulberry32(30)) en series.ts. — *Verificación:* Prueba: cada índice cae en exactamente un pliegue y cada pliegue tiene 4.
- **esquema_tss_20** (esquema-didactico): TimeSeriesSplit con n = 20 y K = 5: tamaño de prueba floor(20/6) = 3; el entrenamiento termina en 5, 8, 11, 14 y 17. — *Cálculo:* timeSeriesSplit(n, k) en series.ts, con la misma fórmula que sklearn. — *Verificación:* Prueba cruzada contra sklearn.model_selection.TimeSeriesSplit para n = 20 y n = 144: índices idénticos.
- **fuga_esquema** (ts-vivo): Primera celda de prueba de la fila 1 cuyo vecino t+1 es de entrenamiento, y número de celdas de entrenamiento posteriores a alguna de prueba. — *Cálculo:* Recorrido simple sobre la asignación. — *Verificación:* Se revisa visualmente en el esquema; el contador se recalcula con la misma asignación.
- **pliegues_kfold_reales** (python-json): Pliegue (0–4) de cada uno de los 144 meses con KFold(n_splits=5, shuffle=True, random_state=42) de sklearn 1.9.1; tamaños 29, 29, 29, 29 y 28. — *Cálculo:* validacion_temporal.json → kfold.pliego. — *Verificación:* El script imprime bincount = [29, 29, 29, 29, 28].
- **conteo_fuga_real** (ts-vivo): Meses de prueba cuyo mes siguiente está en entrenamiento: 117 de 143. Con ambos vecinos en entrenamiento: 94 de 142. Con algún mes posterior en entrenamiento: 143 de 144. — *Cálculo:* A partir de kfold.pliego. — *Verificación:* Lo calculé con numpy sobre la misma asignación: 117, 94 y 143.
- **tss_real** (python-json): Los 5 pliegues de TimeSeriesSplit(5) en 144 meses: entrenamiento de 24, 48, 72, 96 y 120; prueba de 24 meses cada uno. — *Cálculo:* validacion_temporal.json → tss.pliegues (también reproducible con timeSeriesSplit de TS). — *Verificación:* Los índices del JSON coinciden con timeSeriesSplit(144, 5) en TS.
- **pred_kfold_59_60** (python-json): Predicción fuera de pliegue (out-of-fold) de RandomForestRegressor(n_estimators=300, random_state=42) con X = [t (0–143), mes (1–12)] para cada mes, cuando ese mes era de prueba en el K-Fold barajado. — *Cálculo:* validacion_temporal.json → kfold.pred_oof (144 valores); en la diapositiva se usan los índices 120–143. — *Verificación:* El script guarda el MAE de referencia; el TS recalcula el MAE en 1959–1960 = 26.2 (MAPE 5.7 %), como mi corrida.
- **pronostico_honesto** (python-json): El mismo bosque entrenado con los meses 0–119 (1949–1958), prediciendo 120–143 (1959–1960). — *Cálculo:* validacion_temporal.json → pronostico.pred (24 valores). — *Verificación:* El MAE recalculado en TS es 67.2 (MAPE 14.2 %). Es igual al último pliegue de TimeSeriesSplit, que comparte semilla y datos. pred[0:12] == pred[12:24] (comprobado).
- **maximo_entrenamiento** (ts-vivo): Máximo de y en 1949–1958: 505 (agosto de 1958). El máximo pronosticado es 469. — *Cálculo:* Math.max(...valores.slice(0,120)) y Math.max(...pred). — *Verificación:* numpy: y[:120].max() = 505 y p.max() = 469.08.
- **mae_medias_cv** (python-json): Promedios de CV: K-Fold barajado 17.8, TimeSeriesSplit 48.7. — *Cálculo:* Se guardan en el JSON solo como referencia. — *Verificación:* Se recomienda NO mostrarlos: promedian meses de niveles distintos y la comparación justa es la de los mismos 24 meses.

### Fórmulas

- `\text{MAE} = \frac{1}{n}\sum_{t}\lvert y_t - \hat y_t\rvert`
- `\text{tamaño de prueba} = \left\lfloor \tfrac{n}{K+1} \right\rfloor = \left\lfloor \tfrac{144}{6} \right\rfloor = 24`
- `\text{pliegue } k:\ \text{entrena } \{1,\dots,24k\},\ \text{prueba } \{24k+1,\dots,24(k+1)\},\ k=1,\dots,5`
- `\hat y(x) = \sum_i w_i(x)\,y_i,\quad w_i\ge 0,\ \sum_i w_i = 1 \ \Rightarrow\ \min_i y_i \le \hat y(x) \le \max_i y_i`

### Rigor

- La comparación justa es sobre los mismos 24 meses (1959–1960). El MAE crece con el nivel de la serie, así que comparar 17.8 (promedio de K-Fold sobre todos los años) contra 67.2 sería injusto.
- La cota del bosque es exacta para RandomForestRegressor con criterio de error cuadrático: cada hoja promedia valores y de entrenamiento, así que ninguna predicción supera el máximo visto.
- Que 1960 repita a 1959 tiene una explicación exacta: todos los cortes en t están entre 0 y 119, así que todo t ≥ 120 cae del mismo lado de cada corte y la predicción depende solo del mes. Se comprueba en el JSON.
- TimeSeriesSplit en sklearn 1.9.1: n_splits = 5 por defecto, ventana creciente (max_train_size = None) y gap = 0.
- Fuga de datos: información que no estaría disponible al momento de predecir y se cuela al entrenamiento.
- No generalizar a 'K-Fold nunca sirve en series': Bergmeir, Hyndman y Koo (2018) muestran que es válido para modelos autorregresivos puros con errores no correlacionados. Aquí el modelo usa t y la tarea es extrapolar, y eso es lo que el barajado esconde.

### Riesgos

- Densidad del paso 3 (dos diagramas y una gráfica): mostrar primero los diagramas y luego la gráfica, y mantener los 640px de alto (celdas de 12px).
- 144 celdas de unos 11px de ancho: se leen como franja, no celda por celda. Marcar solo los años.
- Los números del bosque dependen de la versión de sklearn: se precalculan y se leen del JSON, nunca se vuelven a calcular en el navegador.
- El corte 1949–1958 / 1959–1960 se anuncia aquí: hay que confirmarlo con los diseños de la 45 a la 50 antes de construir.
- Distinguir los nombres: TimeSeriesSplit (bloques de 24) frente a walk-forward u origen móvil (paso de 1).

## 31 · ¿Qué es una serie de tiempo?

- **Objetivo:** Reconocer una serie de tiempo como una sola variable medida en momentos ordenados y regulares, donde el índice t es parte del dato y pronosticar es estimar valores futuros con solo el pasado.
- **Estado:** nueva · **Duración:** 60 s

### Pasos

**Paso 0 (concepto).** A la izquierda (760px), la definición: 'Mediciones de una misma variable, ordenadas en el tiempo y tomadas a intervalos regulares', la notación {y_t} y tres definiciones con borde izquierdo, como en la 5: índice t (el orden), frecuencia (cada cuánto se mide) y horizonte h (cuántos pasos al futuro). A la derecha (820px), 'Esquema': 8 puntos y_1…y_8 unidos por una línea, una línea vertical 'hoy (T = 8)' y tres casillas punteadas en t = 9, 10 y 11 con '?' y ŷ_{9|8}, … Debajo, mini contraste: 'Tabla (Adult): fila = persona, se puede barajar' frente a 'Serie: fila = momento, el orden es dato'.

- Animación: Los puntos aparecen de izquierda a derecha (120 ms entre puntos) y después las casillas '?' se encienden una vez.
- Interacción: ninguna
- Frase clave: Una serie es una sola variable vista a lo largo del tiempo: el dato es el par (t, y_t).

**Paso 1 (caso).** Caso · Pasajeros aéreos. TablaASerie en fase 'tabla', centrada (unos 880×470): filas 1949–1960, columnas ene–dic, valores en mono de 20px. Pie: 'Box y Jenkins, serie G · miles de pasajeros por mes'.

- Animación: La tabla aparece renglón por renglón (60 ms).
- Interacción: ninguna
- Frase clave: Así viene en el libro: 12 años por 12 meses.

**Paso 2 (caso).** Fase 'serie': la tabla se vuelve una línea de tiempo de 1696×400 con eje de años. Aparece la fórmula t = 12(año − 1949) + mes.

- Animación: Cada celda vuela a su punto en la línea de tiempo (0.9 s, 80 ms entre años); al aterrizar, la línea que los une se dibuja con pathLength de 0 a 1 y la tabla se desvanece.
- Interacción: ninguna
- Frase clave: La serie es esa tabla leída renglón por renglón: 144 meses en fila.

**Paso 3 (cierre).** Cursor vertical sobre la serie con la lectura 't = 79 · jul 1955 · 364 mil' (calculada). Franja de datos en vivo: 'T = 144 · frecuencia 12 (mensual) · mínimo 104 (nov 1949) · máximo 622 (jul 1960)'. Después de diciembre de 1960, 12 casillas punteadas '1961 ?'.

- Animación: El cursor se desliza con un resorte (spring) y las casillas de 1961 aparecen con Reveal.
- Interacción: ↑/↓ mueven el cursor un mes (mantener presionado lo acelera); también sigue al mouse.
- Frase clave: Pronosticar = estimar y_{T+h} usando solo y_1, …, y_T.

### Visuales

- **Esquema de serie y horizonte** (svg, TimeSeriesChart (nuevo) con n = 11 y valores null en el futuro): 8 puntos con índice t, la línea 'hoy' y 3 casillas futuras con '?'.
- **Tabla que se vuelve serie** (mixto, TablaASerie (nuevo)): Un solo SVG donde cada uno de los 144 valores es un motion.g que pasa de su celda de la tabla a su punto en la línea de tiempo.
- **Definiciones** (texto, JSX + TeX): Índice, frecuencia y horizonte, con el estilo de las definiciones de la 5.

### Datos

- **pasajeros** (python-json): Los 144 valores y la fecha de inicio [1949, 1]. — *Cálculo:* lib/pasajeros.ts: valores, matriz 12×12 (filas = años) y etiqueta(t) → 'jul 1955'. — *Verificación:* Las comprobaciones del script; además, matriz[a][m] === valores[12a + m].
- **t_fecha** (ts-vivo): Conversión de t (1–144) a mes y año, y su inversa. — *Cálculo:* mes = ((t−1) mod 12) + 1; año = 1949 + floor((t−1)/12). — *Verificación:* Pruebas: t = 1 → ene 1949, t = 79 → jul 1955, t = 144 → dic 1960.
- **extremos** (ts-vivo): Mínimo 104 (índice 10 = nov 1949) y máximo 622 (índice 138 = jul 1960); ambos son únicos. — *Cálculo:* argmin y argmax sobre valores. — *Verificación:* numpy: y.min() = 104, y.argmax() = 138.

### Fórmulas

- `\{y_t\}_{t=1}^{T},\quad T = 144`
- `t = 12\,(\text{año} - 1949) + \text{mes}`
- `\hat y_{T+h \mid T}\ :\ \text{pronóstico hecho en } T \text{ para } h \text{ pasos adelante}`

### Rigor

- La fuente solo dice 'totales mensuales de pasajeros internacionales de aerolíneas, 1949–1960' (Box, Jenkins y Reinsel; AirPassengers en R). No afirmar país ni aerolínea.
- Las unidades son miles de pasajeros: 112 significa 112 000.
- 'Intervalos regulares' describe lo usual; existen series con espaciado irregular. Decir 'normalmente'.

### Riesgos

- 144 números en la tabla: con mono de 20px en el lienzo de 1920 se leen en el proyector, pero no hay que leerlos en voz alta.
- El cursor del mouse se oculta tras 2 s (body.idle): conviene usar ↑/↓ al presentar.
- La animación de 144 elementos con motion corre fluida; probarla en la laptop de la exposición.

## 32 · Tendencia y estacionalidad

- **Objetivo:** Distinguir la tendencia (cambio de nivel a largo plazo) de la estacionalidad (patrón que se repite con periodo fijo del calendario) y verlas por separado en pasajeros.
- **Estado:** nueva · **Duración:** 75 s

### Pasos

**Paso 0 (concepto).** A la izquierda (900px), tres mini gráficas apiladas de 900×150, marcadas 'Esquema': 'tendencia T_t' (recta ascendente), 'estacionalidad S_t' (onda de periodo 12, 4 periodos) y 'serie y_t'. A la derecha, las definiciones y S_{t+m} = S_t con ejemplos de m (12 meses, 7 días, 24 horas). Nota: 'cómo se combinan (suma o producto) se decide en la 34'.

- Animación: Se traza T, luego S, y después y crece de izquierda a derecha mientras unas flechas verticales en los picos muestran cómo S se suma a T.
- Interacción: ninguna
- Frase clave: Tendencia: hacia dónde va el nivel. Estacionalidad: lo que se repite cada periodo fijo.

**Paso 1 (caso).** Caso · Pasajeros aéreos. TimeSeriesChart a lo ancho (1696×380) con 12 segmentos horizontales rojo tenue con la media de cada año, el primero y el último etiquetados (126.7 y 476.2, ×3.8), y el máximo de cada año como punto rojo con etiqueta de mes. Debajo, el texto de los dos hallazgos.

- Animación: Los segmentos aparecen año por año (100 ms) y después los puntos de los picos.
- Interacción: ninguna
- Frase clave: Tendencia: el promedio anual sube de 126.7 a 476.2 mil. Estacionalidad: en los 12 años, el máximo cae en julio o agosto.

**Paso 2 (caso).** Cuadrícula 900px | 1fr. A la izquierda, Scene3D (900×560) con Bars3D: X = mes, Z = año, altura = pasajeros; el máximo de cada año en rojo y el resto gris; meses en el borde frontal y años en el lateral. A la derecha, chips 'ver los meses (estacionalidad)', 'ver los años (tendencia)' y 'libre', con un texto que explica qué muestra cada vista.

- Animación: Las barras crecen desde 0 año por año. CameraRig mueve la cámara a cada vista en 1.2 s con easing.
- Interacción: chips de vista y arrastrar para girar (OrbitControls sin zoom)
- Frase clave: Es la tabla de la 31 con alturas: de frente se ve la forma del año; de lado, el crecimiento de un año a otro.

**Paso 3 (cierre).** Takeaway en la columna derecha, bajo los chips. La escena 3D sigue visible.

- Animación: Reveal.
- Interacción: los chips siguen activos
- Frase clave: Tendencia: cómo cambia el nivel de un año a otro. Estacionalidad: la forma dentro del año, siempre en los mismos meses. Y ojo: la onda de 1960 mide 232 y la de 1949, 44. Eso lo resuelve la 34.

### Visuales

- **Suma tendencia + estacionalidad** (svg, TimeSeriesChart (nuevo), 3 instancias): Tres paneles de esquema con la construcción animada de y_t.
- **Medias anuales y picos** (svg, TimeSeriesChart con marcas y segmentos): La serie real con escalones de media anual y marcas en los máximos de cada año.
- **Barras 3D año × mes** (3d, Scene3D (ajuste: OrbitControls makeDefault) + Bars3D (nuevo) + CameraRig (nuevo) + Label3D): 144 barras (instancedMesh) con dos vistas de cámara: el eje de meses muestra la estacionalidad y el de años, la tendencia.

### Datos

- **esquema_T_S** (esquema-didactico): T_t = a + b·t y S_t = A·sin(2πt/12), con parámetros fijos en el código. — *Cálculo:* TS en vivo. — *Verificación:* Lleva la etiqueta 'Esquema'.
- **media_anual** (ts-vivo): Media de los 12 meses de cada año: 126.67 (1949) … 476.17 (1960); la razón es 3.76. — *Cálculo:* mean(matriz[a]) en series.ts. — *Verificación:* Contra referencia.media_anual de pasajeros.json (numpy), con tolerancia de 1e-9.
- **pico_anual** (ts-vivo): Mes o meses del máximo de cada año: jul y ago empatados en 1949, 1950 y 1951; luego ago, ago, jul, jul, jul, ago, ago, ago, jul. — *Cálculo:* Todos los argmax por fila (con empates). — *Verificación:* Mi corrida con numpy dio esa misma lista. La afirmación 'julio o agosto en los 12 años' se comprueba en el código con every().
- **rango_anual** (ts-vivo): Máximo menos mínimo de cada año: 44 (1949) … 232 (1960). — *Cálculo:* max − min por fila. — *Verificación:* numpy: 44, 56, 54, 71, 92, 114, 131, 142, 166, 195, 217, 232.

### Fórmulas

- `y_t = f(T_t,\ S_t,\ R_t)`
- `S_{t+m} = S_t,\quad m = 12`
- `\bar y_a = \frac{1}{12}\sum_{\text{mes}=1}^{12} y_{a,\text{mes}}`

### Rigor

- La media anual es una estimación burda de la tendencia; la formal (promedio móvil centrado) se usa en la 34 y se explica en la 38. Decirlo así.
- Estacionalidad = periodo fijo y conocido, ligado al calendario (Hyndman y Athanasopoulos, FPP3 §2.3).
- 'Máximo en julio o agosto' se comprueba en el código; hay empates jul/ago en 1949–1951 y se muestran los dos.

### Riesgos

- Oclusión en 3D: de frente, los años tardíos (más altos) asoman sobre los primeros, y eso funciona; de lado se ve la envolvente. Si en el ensayo no se entiende, hay un respaldo 2D: gráfica estacional con 12 líneas sobre ene–dic.
- 24 etiquetas Html en 3D: usar la clase .axis3d y probar su legibilidad en el proyector.
- CameraRig necesita que Scene3D exponga los controles (makeDefault). Es un cambio retrocompatible.

## 33 · Ciclo, estacionalidad y ruido

- **Objetivo:** Distinguir la estacionalidad (periodo fijo de calendario) del ciclo (vueltas de duración variable) y reconocer el ruido como lo que queda sin patrón.
- **Estado:** nueva · **Duración:** 55 s

### Pasos

**Paso 0 (concepto).** Arriba, tres columnas de definiciones cortas: estacionalidad, ciclo y ruido. Abajo, dos series de esquema (1696×170): A, estacional (seno de periodo 12, 72 puntos); B, cíclica (vueltas de duraciones distintas, fijadas como parámetros del esquema). Cada pico lleva un punto rojo y la distancia entre picos consecutivos va anotada (calculada).

- Animación: Las series se trazan y luego aparecen las distancias entre picos.
- Interacción: ninguna
- Frase clave: Estacionalidad: cada 12 meses, exacto. Ciclo: sube y baja, pero cada vuelta dura distinto.

**Paso 1 (concepto).** Cada serie se dobla en renglones de 12 y forma un CalendarGrid chico con los picos marcados: en A los picos quedan en una sola columna; en B, dispersos.

- Animación: Los tramos de 12 bajan y se acomodan en renglones (la animación de la 31 al revés).
- Interacción: ninguna
- Frase clave: Estacionalidad: el pico cae siempre en la misma columna del calendario. Ciclo: ninguna columna funciona.

**Paso 2 (caso).** Caso · Pasajeros aéreos. CalendarGrid de 12×12 en modo calor (celdas de 70×36): el color es el porcentaje arriba o abajo de la media de su año (rojo arriba, gris abajo, con el valor en pequeño) y el máximo de cada año va contorneado en rojo. A la derecha, la nota sobre el ciclo.

- Animación: Primero las celdas y después los contornos, año por año.
- Interacción: ninguna
- Frase clave: Los picos forman una franja vertical en julio y agosto. ¿Un ciclo? En 12 años no se distingue de la tendencia: los métodos clásicos estiman juntas tendencia y ciclo.

**Paso 3 (cierre).** La fórmula y_t = TC_t + S_t + R_t (con la nota 'o producto: 34') y una tira de esquema de ruido blanco simulado.

- Animación: Reveal.
- Interacción: ninguna
- Frase clave: El ruido R_t es lo que no explica nada de lo anterior. Su mejor pronóstico es su promedio. En la 34 lo medimos en pasajeros.

### Visuales

- **Estacional vs cíclica** (svg, TimeSeriesChart (nuevo)): Dos series de esquema con picos y distancias entre picos.
- **Doblar por periodo** (mixto, CalendarGrid (nuevo)): La serie se acomoda en renglones de 12 y los picos se alinean o no.
- **Mapa de calor de pasajeros** (tabla, CalendarGrid (nuevo), modo 'calor'): 12×12 con el porcentaje respecto a la media anual y los picos contorneados.
- **Tira de ruido** (svg, TimeSeriesChart): Ruido blanco simulado, marcado como esquema.

### Datos

- **esquema_estacional** (esquema-didactico): sin(2πt/12), t = 0…71. — *Cálculo:* TS en vivo. — *Verificación:* Etiqueta de esquema; las distancias entre picos calculadas son todas 12.
- **esquema_ciclo** (esquema-didactico): Concatenación de medias ondas con duraciones distintas, fijadas como constantes del esquema en el código (p. ej. 14, 22, 17 y 25). — *Cálculo:* TS en vivo; los picos son el argmax de cada vuelta. — *Verificación:* Las distancias que se muestran se calculan de la serie generada, no se copian de las constantes.
- **calor_pasajeros** (ts-vivo): y_{a,m} / ȳ_a − 1 por celda; p. ej. julio de 1949 +16.8 % y julio de 1960 +30.6 %. — *Cálculo:* Con matriz y media_anual de series.ts. — *Verificación:* numpy: 148/126.67 − 1 = 0.168 y 622/476.17 − 1 = 0.306.
- **ruido_esquema** (esquema-didactico): 60 valores N(0,1). — *Cálculo:* gaussian(mulberry32(33)). — *Verificación:* Etiqueta de esquema.

### Fórmulas

- `y_t = TC_t + S_t + R_t`
- `\frac{y_{a,m}}{\bar y_a} - 1`
- `\hat R_{T+h} = \mathbb{E}[R_t] \quad(=0 \text{ en la aditiva})`

### Rigor

- Ciclo: subidas y bajadas sin frecuencia fija, normalmente de al menos 2 años (FPP3 §2.3).
- No afirmar que pasajeros 'no tiene ciclo', sino que con 12 años no se puede identificar ni separar de la tendencia. Por eso se habla de tendencia-ciclo.
- 'El mejor pronóstico del ruido es su promedio' vale para ruido independiente y error cuadrático. Decirlo como propiedad del ruido ideal, no del residuo real.
- El mapa de calor es descriptivo (razón con la media anual), no una descomposición.

### Riesgos

- Es una diapositiva que se puede recortar: la 34 debe definir el residuo por su cuenta para no depender de esta.
- Se parece a la 31 y la 32 (otra vez la tabla 12×12): pasar rápido por el caso, unos 15 s.
- La escala de color en el proyector: usar solo la intensidad del rojo y el gris del tema, sin degradados de colores.

## 34 · Descomposición: aditiva o multiplicativa

- **Objetivo:** Decidir entre descomposición aditiva y multiplicativa viendo si la onda estacional crece con el nivel, y entender que el logaritmo convierte la multiplicativa en aditiva; en pasajeros, es multiplicativa.
- **Estado:** nueva · **Duración:** 90 s

### Pasos

**Paso 0 (concepto).** Dos esquemas lado a lado (800×300 cada uno): aditiva y = T + S, con envolventes paralelas punteadas, y multiplicativa y = T × S, con envolventes en embudo. La fórmula va debajo de cada uno.

- Animación: Se trazan las series y después las envolventes.
- Interacción: ninguna
- Frase clave: Aditiva: la onda mide lo mismo siempre. Multiplicativa: la onda crece en proporción al nivel.

**Paso 1 (caso).** Caso · Pasajeros aéreos. TimeSeriesChart (1100×400) con la envolvente anual: máximos y mínimos de cada año unidos con líneas discontinuas, que forman un embudo. A la derecha, MiniBars 'ancho de la onda (máx − mín) por año': de 44 a 232, con 'nivel ×3.8, ancho ×5.3'.

- Animación: La envolvente se dibuja de izquierda a derecha y las barras crecen.
- Interacción: ninguna
- Frase clave: La onda crece con el nivel, como en la multiplicativa.

**Paso 2 (caso).** La misma gráfica en escala logarítmica, con marcas en 100, 200, 400 y 600 colocadas en sus posiciones log. MiniBars pasa a ln(máx/mín) por año: de 0.353 a 0.467 (×1.3). Aparece la fórmula del logaritmo.

- Animación: Morph continuo de 1.2 s de escala lineal a log (logMix de 0 a 1, cada punto y la envolvente interpolan su altura); las marcas del eje se cruzan con un fundido y las barras se reacomodan.
- Interacción: chip 'lineal / log' para ir y volver
- Frase clave: En logaritmo la onda casi no cambia de tamaño: el log convierte la multiplicativa en aditiva.

**Paso 3 (caso).** DecompositionPanels: 4 paneles apilados (1100×115: observada, tendencia, estacional, residuo) con los chips 'aditiva' y 'multiplicativa'. A la derecha (520px), dos fichas de julio de 1949 y julio de 1959 con real, T+S y T×S, y el MAE de lo que sobra: aditiva 14.4 y multiplicativa 6.6 (miles, 132 meses). Al pie, la fórmula de la tendencia 2×12 con 'detalle en la 38' y el aviso de que los primeros y últimos 6 meses no tienen tendencia.

- Animación: La serie observada se separa en tres: cada componente baja a su panel. Al cambiar de chip, los paneles interpolan sus trazos. En el modo aditivo se sombrea la onda que queda en el residuo, negativa al inicio y positiva al final.
- Interacción: chips 'aditiva' / 'multiplicativa'
- Frase clave: La aditiva le pone a julio siempre +63.8: se pasa en 1949 (190.6 contra 148 reales) y se queda corta en 1959 (494.5 contra 548). La multiplicativa usa ×1.227: 155.5 y 528.3.

**Paso 4 (cierre).** Takeaway al pie; los paneles se quedan en modo multiplicativo.

- Animación: Reveal.
- Interacción: ninguna
- Frase clave: Pasajeros es multiplicativa: de aquí en adelante se modela log(pasajeros). El log no la deja perfecta (el ancho en log aún pasa de 0.35 a 0.47), pero quita casi todo el crecimiento de la onda.

### Visuales

- **Esquemas aditivo y multiplicativo** (svg, TimeSeriesChart (nuevo)): Dos series de esquema con sus envolventes.
- **Embudo y morph a log** (svg, TimeSeriesChart con escala 'lineal'|'log' animada): La serie real con su envolvente anual; la escala pasa de lineal a log de forma continua.
- **Ancho de la onda por año** (svg, MiniBars (nuevo)): 12 barras con el rango anual, en escala original o en log.
- **Descomposición en 4 paneles** (svg, DecompositionPanels (nuevo, sobre TimeSeriesChart)): Observada, tendencia, estacional y residuo, en modo aditivo o multiplicativo, con las fichas de julio.

### Datos

- **envolvente_rango** (ts-vivo): Máximo y mínimo de cada año; rango 44 … 232; ln(máx/mín) 0.353 … 0.467. — *Cálculo:* Por fila de la matriz, en series.ts. — *Verificación:* numpy: rango y log-rango por año (corrida hecha: 0.353, 0.400, 0.317, 0.347, 0.413, 0.474, 0.446, 0.421, 0.439, 0.488, 0.491, 0.467).
- **descomposicion_clasica** (ts-vivo): Descomposición clásica con el mismo algoritmo que statsmodels seasonal_decompose(period=12): tendencia con el filtro centrado [½, 1×11, ½]/12 (sin valor en los primeros y últimos 6 meses); índices estacionales como promedio por mes de y − T (o y/T), normalizados para sumar 0 (o promediar 1); residuo y − T − S (o y/(T·S)). — *Cálculo:* decompose(valores, 12, 'aditiva'|'multiplicativa') en series.ts. — *Verificación:* Contra referencia.descomposicion de pasajeros.json, generada con statsmodels seasonal_decompose: diferencia absoluta máxima < 1e-9 en tendencia, estacional y residuo. Mi réplica en numpy dio S_jul aditiva = +63.83 y multiplicativa = 1.2266.
- **fichas_julio** (ts-vivo): Julio de 1949: real 148, T+S = 190.6, T×S = 155.5. Julio de 1959: real 548, T+S = 494.5, T×S = 528.3. — *Cálculo:* T[t] + S[t] y T[t]·S[t] en t = 6 y t = 126 (índice 0). — *Verificación:* Mi réplica en numpy de statsmodels: 190.62 / 155.52 y 494.54 / 528.29.
- **mae_residuo** (ts-vivo): Promedio de |y − ajuste| en los 132 meses con tendencia: aditiva 14.41 y multiplicativa 6.60 (miles). — *Cálculo:* mae sobre los índices 6–137. — *Verificación:* numpy: 14.41 y 6.60.
- **patron_residuo_aditivo** (ts-vivo): Correlación por año entre el residuo aditivo y S: −1.00 (1949) … +0.96 (1959), es decir, la onda que la aditiva no explicó. — *Cálculo:* pearson por año sobre los meses válidos. — *Verificación:* numpy: −1.00, −0.95, −0.95, −0.92, −0.81, −0.61, 0.36, 0.91, 0.98, 0.94, 0.96, 0.68. Se usa para el sombreado; el número no tiene que mostrarse.

### Fórmulas

- `y_t = T_t + S_t + R_t`
- `y_t = T_t \cdot S_t \cdot R_t`
- `\log y_t = \log T_t + \log S_t + \log R_t`
- `\hat T_t = \frac{1}{12}\left(\tfrac12 y_{t-6} + y_{t-5} + \dots + y_{t+5} + \tfrac12 y_{t+6}\right)`
- `S_m = \tilde S_m - \tfrac{1}{12}\sum_{j=1}^{12} \tilde S_j,\quad \tilde S_m = \operatorname{prom}_{t \equiv m}\,(y_t - \hat T_t) \quad (\text{aditiva})`
- `S_m = \tilde S_m \Big/ \tfrac{1}{12}\sum_{j=1}^{12} \tilde S_j,\quad \tilde S_m = \operatorname{prom}_{t \equiv m}\,(y_t / \hat T_t) \quad (\text{multiplicativa})`
- `\text{MAE} = \frac{1}{132}\sum_{t=7}^{138} \lvert y_t - \hat y_t \rvert`

### Rigor

- Es la descomposición clásica (FPP3 §3.4; statsmodels): no da tendencia en los primeros y últimos 6 meses y supone una estacionalidad constante. Mencionar los huecos.
- Elegir 'multiplicativa' se basa en el diagnóstico rango–nivel (el gráfico rango-media clásico de Box-Jenkins para elegir transformación), no en una prueba formal.
- El log no estabiliza por completo: la desviación anual en log pasa de 0.108 a 0.157 y el rango, de 0.353 a 0.467. Decir 'casi' o 'buena parte'.
- log(T·S·R) = log T + log S + log R es exacto, y aplica porque y > 0 (mínimo 104).
- S de la descomposición aditiva del log no es exactamente log de S multiplicativa (e^{0.2108} = 1.235 frente a 1.227): no decir que son iguales.

### Riesgos

- Sobrecarga en el paso 3 (4 paneles y 2 fichas): presentar primero la aditiva y su defecto, y después la multiplicativa.
- El 2×12 se adelanta a la 38: solo nombrarlo y acordar con la 38 que lo explique.
- Morph a log: las marcas del eje deben cruzarse con un fundido sin encimarse. Medirlo en la vista previa.
- Se pasa de 90 s si se explica la fórmula de los índices: dejarla como pie de página.

## 35 · Estacionariedad débil

- **Objetivo:** Entender que una serie es (débilmente) estacionaria si su media, su varianza y sus covarianzas no dependen del momento, y ver que pasajeros no lo es.
- **Estado:** nueva · **Duración:** 90 s

### Pasos

**Paso 0 (concepto).** Cuadrícula 580px | 1fr. A la izquierda, Recap 'media, varianza y covarianza': tres renglones con su fórmula y lo que significan (centro, qué tanto se aleja del centro, si dos variables se mueven juntas, y la correlación en [−1, 1]). A la derecha, la definición: 'su comportamiento promedio no depende de cuándo la mires', con las tres condiciones numeradas en TeX y la línea: 'Estricta: toda la distribución. Débil: solo media, varianza y covarianzas. La 2 es la 3 con k = 0.'

- Animación: Reveal de las condiciones una por una.
- Interacción: ninguna
- Frase clave: Estacionaria: misma media, misma dispersión y mismo parecido entre momentos separados por k, sin importar el instante.

**Paso 1 (concepto).** EnsembleCut con dos paneles de 820×400, marcados 'Esquema · simulado': 'estacionaria (AR(1), φ = 0.7)' y 'no estacionaria (paseo aleatorio)'. En cada uno, 40 de 200 historias en gris fino y una resaltada en blanco, un corte rojo vertical en el instante t y, en el borde derecho, el histograma horizontal de los 200 valores en t. Lecturas en vivo: media y desviación a través de las historias, junto al valor teórico (AR: 0 y 1.400; paseo: 0 y √t).

- Animación: Al entrar, el corte barre de t = 5 a t = 95 en 4 s; el histograma del AR se queda igual y el del paseo se abre.
- Interacción: ↑/↓ o deslizador para mover t (1–100), sincronizado en los dos paneles
- Frase clave: La media y la varianza se calculan a través de muchas historias posibles en el mismo instante t. Si es estacionaria, el histograma no cambia al mover t.

**Paso 2 (concepto).** Un segundo corte en t+5 en ambos paneles y un diagrama de dispersión insertado (y_t, y_{t+5}) de las 200 historias, con la correlación medida y la teórica: AR 0.7^5 = 0.168 en cualquier t; paseo √(t/(t+5)), que va de 0.41 en t = 1 a 0.97 en t = 95.

- Animación: Los dos cortes se mueven juntos; los puntos del diagrama se animan con t.
- Interacción: ↑/↓ o deslizador
- Frase clave: La covarianza solo puede depender de la distancia k, no de dónde estés.

**Paso 3 (caso).** Caso · Pasajeros aéreos. 'Solo tenemos una historia: comparamos ventanas de 12 meses.' Dos MiniBars lado a lado (800×330): 'media de cada año' y 'desviación de cada año', con el chip 'original / log'. En original: 126.7 → 476.2 y 13.7 → 77.7. En log: la media sigue subiendo y la desviación queda casi plana (0.108 → 0.157).

- Animación: Las barras crecen año por año; al cambiar de chip, las barras interpolan su altura y el eje cambia con un fundido.
- Interacción: chip 'original / log'
- Frase clave: Si la media o la dispersión cambian de una ventana a otra, la serie no es estacionaria.

**Paso 4 (cierre).** Takeaway al pie.

- Animación: Reveal.
- Interacción: ninguna
- Frase clave: Pasajeros no es estacionaria: la media sube cada año (y en escala original también la dispersión). El log estabiliza buena parte de la varianza; para la media hace falta diferenciar (36) y comprobarlo con ADF (37). Además, la estacionalidad rompe la condición 1: la media depende del mes.

### Visuales

- **Recuadro media, varianza, covarianza** (formula, Recap + TeX (existentes)): Tres fórmulas con su lectura en palabras; ocupa como máximo un tercio de la diapositiva.
- **Muchas historias y un corte** (svg, EnsembleCut (nuevo)): Haz de realizaciones con un corte móvil, histograma lateral y diagrama (y_t, y_{t+k}).
- **Ventanas anuales** (svg, MiniBars (nuevo)): Media y desviación por año, en escala original o en log.

### Datos

- **historias_ar1** (esquema-didactico): 200 historias de 100 pasos de y_t = 0.7 y_{t−1} + ε_t, ε ~ N(0,1), con y_0 ~ N(0, 1/(1−0.49)) (inicio estacionario). — *Cálculo:* simulateAR([0.7], 100, mulberry32(35), {inicioEstacionario: true}) × 200 en series.ts. — *Verificación:* Teoría: Var = 1/0.51 = 1.961 (desv. 1.400) y Corr(k) = 0.7^k. Prueba: en varios t, la varianza muestral de las 200 cae dentro de la banda de error de muestreo (±3·√(2/199)·σ²).
- **historias_rw** (esquema-didactico): 200 paseos aleatorios y_t = y_{t−1} + ε_t con y_0 = 0. — *Cálculo:* randomWalk en series.ts con la misma semilla base. — *Verificación:* Teoría: Var(y_t) = t y Corr(y_t, y_{t+k}) = √(t/(t+k)). Misma prueba de banda.
- **stats_corte** (ts-vivo): Media, desviación (ddof = 1) y correlación de Pearson a través de las 200 historias en t y en t+k. — *Cálculo:* mean, std y pearson de series.ts sobre la columna t. — *Verificación:* Prueba unitaria de las funciones contra numpy con vectores fijos.
- **ventanas_pasajeros** (ts-vivo): Media y desviación muestral (ddof = 1) por año, en escala original (126.67 → 476.17; 13.72 → 77.74) y en log (desviación 0.1084 → 0.1567; la media de log se calcula). — *Cálculo:* Por fila de la matriz, y del logaritmo de la matriz. — *Verificación:* Contra referencia.media_anual, desv_anual, log_media_anual y log_desv_anual de pasajeros.json (numpy, ddof = 1), con tolerancia de 1e-9.

### Fórmulas

- `\mu = \mathbb{E}[Y] \approx \bar y = \tfrac{1}{n}\textstyle\sum_i y_i`
- `\sigma^2 = \operatorname{Var}(Y) = \mathbb{E}[(Y-\mu)^2]`
- `\operatorname{Cov}(X,Y) = \mathbb{E}[(X-\mu_X)(Y-\mu_Y)],\qquad \rho = \dfrac{\operatorname{Cov}(X,Y)}{\sigma_X\,\sigma_Y} \in [-1,1]`
- `(1)\ \mathbb{E}[y_t] = \mu \quad (2)\ \operatorname{Var}(y_t) = \sigma^2 < \infty \quad (3)\ \operatorname{Cov}(y_t, y_{t+k}) = \gamma(k) \qquad \forall t`
- `y_t = \phi\,y_{t-1} + \varepsilon_t:\quad \operatorname{Var}(y_t) = \dfrac{\sigma^2}{1-\phi^2},\quad \operatorname{Corr}(y_t, y_{t+k}) = \phi^k`
- `y_t = y_{t-1} + \varepsilon_t,\ y_0 = 0:\quad \operatorname{Var}(y_t) = t\,\sigma^2,\quad \operatorname{Corr}(y_t, y_{t+k}) = \sqrt{\tfrac{t}{t+k}}`
- `s_a = \sqrt{\tfrac{1}{11}\textstyle\sum_{m=1}^{12}(y_{a,m} - \bar y_a)^2}`

### Rigor

- La estacionariedad es una propiedad del proceso, no de una muestra: con una sola serie solo se diagnostica (ventanas) o se prueba (ADF en la 37, KPSS en R3). La diapositiva dice 'diagnóstico'.
- El AR(1) con |φ| < 1 es estacionario desde t = 1 solo si y_0 sale de su distribución estacionaria. Si empieza en 0, solo lo es de forma asintótica. Por eso se usa inicio estacionario.
- Las fórmulas del paseo aleatorio son exactas con y_0 = 0 y ruido independiente de varianza σ².
- Las ventanas de 12 meses promedian la estacionalidad. Sin eso, la media de cada ventana dependería del mes de inicio.
- El log estabiliza la desviación anual (×1.44 frente a ×5.67), pero no la hace constante. Decir 'buena parte'.
- La desviación es muestral (ddof = 1), igual en TS y en Python.

### Riesgos

- La idea de 'muchas historias posibles' es difícil para principiantes: narrarla como 'repetir el mismo experimento 200 veces' y destacar una sola historia en blanco.
- Si el tiempo es corto, el paso 2 (covarianza) se puede saltar: dejarlo como un clic independiente.
- El diagrama (y_t, y_{t+k}) se adelanta a la ACF de la 39: acordar que la 39 lo retome.
- Dos paneles con 40 líneas cada uno: usar opacidad de 0.35 para que no se vuelvan una mancha en el proyector.

## Componentes nuevos propuestos

- **TimeSeriesChart** — Gráfica SVG de serie de tiempo con eje de fechas mensuales. Es la pieza base de toda la parte de series y comparte márgenes y tipografía con el ErrorChart de la 5. · API: width, height, inicio: [año, mes], n (largo del eje X; permite casillas futuras), series: {id, valores: (number|null)[], desde?: number, color, ancho?, punteada?: boolean, puntos?: boolean, opacidad?}[], yDomain: [min, max], escala?: 'lineal'|'log' (morph animado con logMix 0→1, 1.2 s), bandas?: {desde, hasta, relleno, etiqueta}[], marcas?: {t, etiqueta, color}[], segmentos?: {desde, hasta, y, color}[], cursor?: number|null, ventanaX?: [t0, t1], yTicks?: number[], etiquetaY?: string · usado en: 29, 30, 31, 32, 33, 34, 35
- **ShuffleSeries** — Muestra una serie (barras o línea con puntos) y la reordena con animación según una permutación, para ver qué se pierde al barajar. · API: valores: number[], orden: number[] (permutación), modo: 'barras'|'linea', width, height, yDomain, duracion = 0.8, escalonado = 0.012 · usado en: 29
- **LagScatter** — Diagrama de dispersión de (x_t, x_{t+lag}) con la diagonal y la correlación de Pearson en vivo; los puntos se animan al cambiar el orden. · API: x: number[], lag = 1, orden?: number[], size, mostrarDiagonal = true, etiquetas: {x, y} · usado en: 29
- **SplitDiagram** — Diagrama de particiones de validación: filas = pliegues, celdas = momentos (entrenamiento gris, prueba roja, futuro vacío), con rayado de fuga y un arco opcional. · API: n, filas: {etiqueta, train: number[], test: number[]}[], resaltarFuga?: boolean, flecha?: {fila, desde, hacia, texto}, eje?: {inicio: [año, mes], cada: 12}, width, cellH, filasVisibles?: number · usado en: 30
- **TablaASerie** — Un solo SVG con la tabla 12×12 (año × mes) cuyos 144 valores vuelan a su posición en la línea de tiempo; muestra que t = 12(año − 1949) + mes. · API: matriz: number[][], etiquetasFilas, etiquetasCols, fase: 'tabla'|'serie', cursor?: number|null, width, height · usado en: 31
- **CalendarGrid** — Cuadrícula periodo × posición dentro del periodo (año × mes), con números o mapa de calor y contorno en celdas destacadas; sirve para doblar una serie por su periodo. · API: matriz: number[][], modo: 'numeros'|'calor', valorColor?: (fila, col) => número en [−1, 1], resaltar: [fila, col][], etiquetasFilas, etiquetasCols, cellW, cellH, formato?: (v) => string · usado en: 33
- **Bars3D** — Barras 3D de una matriz año × mes (instancedMesh), para ver de un vistazo la tendencia (eje de años) y la estacionalidad (eje de meses). · API: matriz: number[][], etiquetasFilas, etiquetasCols, resaltar: boolean[][], alto (altura máxima en el mundo), crecer?: boolean. Va dentro de Scene3D, con Label3D para los ejes. · usado en: 32
- **CameraRig** — Lleva la cámara de Scene3D a una vista predefinida con una transición suave y conserva el giro con el mouse. · API: posicion: [x, y, z], objetivo: [x, y, z], duracion = 1.2. Requiere un ajuste retrocompatible en Scene3D: <OrbitControls makeDefault …/>, para leer los controles con useThree(s => s.controls). · usado en: 32
- **DecompositionPanels** — Descomposición en 4 paneles apilados (observada, tendencia, estacional, residuo) con eje X compartido y animación al cambiar de modelo. · API: comp: {observada, tendencia: (number|null)[], estacional, residuo}, modo: 'aditiva'|'multiplicativa', inicio, width, panelH, anotaciones?: {t, texto}[], sombrearResiduo?: boolean · usado en: 34
- **EnsembleCut** — Haz de realizaciones simuladas con un corte vertical móvil, el histograma de los valores en ese instante y, opcionalmente, un segundo corte en t+k con su diagrama de dispersión; ilustra media, varianza y covarianza a través de historias. · API: historias: number[][], mostrar = 40, resaltada = 0, t: number, k?: number, yDomain, teorico?: {media, desv, corr?}, width, height, titulo · usado en: 35
- **MiniBars** — Gráfica de barras pequeña (una barra por año) que interpola sus alturas al cambiar de datos; se usa para el ancho de la onda y para la media y la desviación por ventana. · API: valores: number[], etiquetas: string[], yDomain?, color, formato: (v) => string, resaltar?: number[], width, height · usado en: 34, 35
- **lib/series.ts (librería)** — Funciones puras de series, todas verificadas contra numpy, statsmodels o sklearn. · API: mean, variance(x, ddof), std, pearson(a, b), lagPairs(x, k), shuffle(n, rand), kfoldShuffle(n, k, rand), timeSeriesSplit(n, k) (misma fórmula que sklearn), centeredMA(x, m) (2×m si m es par), decompose(x, m, 'aditiva'|'multiplicativa') → {tendencia, indices, estacional, residuo} (igual que statsmodels seasonal_decompose), simulateAR(phis, n, rand, {sigma, inicioEstacionario}), randomWalk(n, rand), mae, mape, porFilas(x, m) · usado en: 29, 30, 31, 32, 33, 34, 35
- **lib/pasajeros.ts (librería)** — Lee pasajeros.json y validacion_temporal.json y expone la serie con sus fechas. · API: valores, inicio, matriz (12×12), MESES (abreviaturas en español), etiqueta(t) → 'jul 1955', fecha(t) → {año, mes}, corte (120), validacion: {kfold, tss, pronostico} · usado en: 29, 30, 31, 32, 33, 34, 35

## Datos nuevos propuestos

- **src/data/pasajeros.json** — { fuente: 'Box, Jenkins y Reinsel, Time Series Analysis: Forecasting and Control, serie G (AirPassengers de R)', unidades: 'miles de pasajeros', inicio: [1949, 1], frecuencia: 12, valores: [144 enteros], corte_entrenamiento: 120 (1949-01…1958-12 entrenamiento, 1959-01…1960-12 prueba; hay que acordarlo con la 45 a la 50), referencia: { r1: np.corrcoef(y[:-1], y[1:])[0,1], media_anual[12], desv_anual[12] (ddof = 1), log_media_anual[12], log_desv_anual[12], descomposicion: { aditiva: {tendencia[144, null en los extremos], indices[12], residuo[144]}, multiplicativa: {…} } } }. El bloque 'referencia' sigue el patrón de referencia_sklearn de adult3d.json: no lo usan las diapositivas, solo las pruebas que comparan series.ts. · script: scripts/exportar_series.py: descarga una sola vez el CSV AirPassengers de Rdatasets (o usa statsmodels.datasets.get_rdataset) a scripts/cache/AirPassengers.csv. Exige n = 144, suma = 40 363, y[0] = 112, y[-1] = 432 y argmax = 138 (622, jul 1960). Calcula las referencias con numpy y statsmodels.tsa.seasonal.seasonal_decompose(period=12, model='additive'/'multiplicative') y guarda el JSON con el mismo guardar() de exportar_datos.py (separators compactos, utf-8). · dependencias: pandas, numpy y statsmodels (falta en .venv: pip install statsmodels; también lo necesitarán ADF, ACF/PACF, SARIMA y Ljung-Box de la 37 a la 50). Red solo la primera vez; después lee del caché.
- **src/data/validacion_temporal.json** — { modelo: 'RandomForestRegressor(n_estimators=300, random_state=42)', variables: ['t (0–143)', 'mes del año (1–12)'], kfold: { n_splits: 5, shuffle: true, random_state: 42, pliego[144], pred_oof[144], mae_por_pliegue[5], mae_media (17.78, solo referencia) }, tss: { n_splits: 5, pliegues: [{ train_fin, test_ini, test_fin, mae, pred[24] }] (entrenamiento de 24, 48, 72, 96 y 120; MAE 41.4, 33.3, 57.4, 44.2 y 67.2), mae_media (48.69, solo referencia) }, pronostico: { corte: 120, pred[24], mae: 67.2, mape: 14.17 }, referencia_mismos_meses: { mae_kfold: 26.2, mape_kfold: 5.69, mae_pronostico: 67.2 } }. Las diapositivas recalculan los MAE en TS a partir de las predicciones y los comparan con estas referencias. · script: scripts/validacion_temporal.py: lee la serie de src/data/pasajeros.json; X = [t, t mod 12 + 1]; cross_val_predict / bucle con KFold(5, shuffle=True, random_state=42) y TimeSeriesSplit(5); ajuste final con los índices 0–119 y predicción de 120–143. Imprime bincount de pliegues, el MAE de cada esquema y la comprobación pred[0:12] == pred[12:24]. Tarda unos 3 s. · dependencias: scikit-learn 1.9.1 y numpy (ya están en .venv). Depende de que pasajeros.json exista: se corre después de exportar_series.py.
