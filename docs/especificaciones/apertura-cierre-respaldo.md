# Especificación detallada — Apertura, cierre y respaldo: diapositivas 1, 2, 3, 62, 63, 64, R1, R2, R3 y R4

> Borrador de diseño generado por un agente. Sirve de referencia al construir; el plan vigente es `docs/PLAN-DIAPOSITIVAS.md`. Los números son los esperados y se recalculan al construir.

**Notas de la sección:** Apertura, cierre y respaldo: diapositivas 1, 2, 3, 62, 63, 64, R1, R2, R3 y R4


## 1 · Ensambles y datos secuenciales (portada)

- **Objetivo:** Que el público sepa desde el primer segundo de qué trata la exposición (ensambles y datos secuenciales) y quién la presenta.
- **Estado:** existente-con-ajustes · **Duración:** 20 s

### Pasos

**Paso 0 (concepto).** Se queda como está: arriba el encabezado mono 'Aprendizaje Máquina / Exposición' a la izquierda y 'ESCOM · IPN' a la derecha. Luego la barra roja de 120×4 px, el título de 132 px en dos líneas, el subtítulo de 30 px (máximo 1100 px de ancho) y al pie las dos columnas U7 y U8 con sus temas (21 px). ÚNICO AJUSTE: bajo el subtítulo se agrega una línea mono de 18 px, color --text-3, con equipo · grupo · profesor · fecha. Sale de src/deck/meta.ts y, si ese archivo está vacío, la línea no aparece.

- Animación: Se queda la animación de ahora: la barra crece (scaleX de 0 a 1, 0.9 s), el título sube (0.7 s, retardo 0.15), luego entra el subtítulo (retardo 0.4) y al final las columnas U7/U8 escalonadas (0.6 + 0.12·i). La línea nueva entra con opacidad, con retardo de 0.5 s.
- Interacción: ninguna
- Frase clave: Cómo combinar muchos modelos en uno mejor que cualquiera de ellos, y cómo modelar datos donde el orden importa.

### Visuales

- **Portada** (texto, src/slides/01-portada.tsx (existente)): Título, subtítulo, barra roja e índice U7/U8. No cambia el diseño.
- **Línea de autoría** (texto, nuevo: src/deck/meta.ts (se usa también en la 64)): Línea mono de 18 px con los nombres reales que dé el usuario. Se oculta si no hay datos.

### Rigor

- Los temas de U7 y U8 en la portada deben coincidir con las secciones B–D y F–H del mapa (diapositiva 2). U7: Bagging, Random Forest, AdaBoost, Gradient Boosting, XGBoost. U8: series de tiempo, AR, MA, ARIMA, SARIMA, HMM. Hoy ya coinciden.
- Equipo, grupo y profesor: solo lo que escriba el usuario en meta.ts. No se ponen nombres de ejemplo que se vean en pantalla.

### Riesgos

- Si la línea de nombres es larga, se corta en dos renglones a 1100 px. Hay que revisar que no empuje las columnas U7/U8 fuera del lienzo.
- La animación de entrada se repite al regresar a la portada, porque se vuelve a montar. Se acepta así.

## 2 · Mapa de la exposición

- **Objetivo:** Que el público vea el recorrido completo (dos unidades, ocho secciones y tres casos de estudio) y sepa que todo se juzga igual: qué modelo, cómo se valida y con qué se mide.
- **Estado:** nueva · **Duración:** 55 s

### Pasos

**Paso 0 (concepto).** SlideFrame con sección ['Apertura', 'Mapa'] y número 02/64. Título: 'Mapa de la exposición'. Lede de una línea: 'Dos unidades y un mismo método: qué modelo, cómo se valida y con qué se mide.' Cuerpo de 1696×~650 px: una línea horizontal fina de 2 px, color --line-2, a 170 px del borde superior del cuerpo. Se divide en 11 tramos: Apertura 1–3 · A Bases 4–9 · B Bagging 10–12 · C Random Forest 13–16 · D Boosting 17–24 · E Comparación 25–28 · Puente 29–30 · F Fundamentos de series 31–40 · G Modelos de series 41–50 · H HMM 51–61 · Cierre 62–64. Cada tramo es proporcional al número de diapositivas registradas, con un mínimo de 96 px. Cada estación lleva un punto de 8 px sobre la línea, la letra en mono rojo de 20 px, el nombre en 24 px/600, el rango 'NN–NN' en mono gris de 16 px y hasta 3 palabras clave en 18 px gris: A 'árbol · sobreajuste · sesgo y varianza'; B 'bootstrap · votación · OOB'; C 'sorteo de variables · importancia'; D 'AdaBoost · gradiente · XGBoost'; E 'métricas · comparación'; Puente 'el orden importa'; F 'tendencia · estacionariedad · ACF'; G 'AR · MA · ARIMA · SARIMA'; H 'estados ocultos · Forward · Viterbi'. Las etiquetas se alternan arriba y abajo de la línea. Arriba de todo van dos corchetes finos: 'U7 · Ensambles' sobre A–E y 'U8 · Datos secuenciales' sobre F–H.

- Animación: La línea se dibuja de izquierda a derecha (pathLength de 0 a 1 en 1.2 s). Cada estación aparece cuando la línea pasa por su punto (opacidad y subida de 8 px, escalonado de 80 ms). Al final entran los corchetes U7/U8 (0.3 s).
- Interacción: ninguna
- Frase clave: Primero, cómo combinar muchos modelos; después, qué cambia cuando los datos vienen en orden.

**Paso 1 (caso).** Bajo la línea aparecen tres tarjetas sin fondo, con borde superior de 1 px como las columnas de la portada. Cada una va alineada bajo los tramos que cubre. (a) Bajo A–E: 'Adult · ¿la persona gana más de 50K al año?', con una BarraClases de 560×18 px (76.1 % 'no' en gris y 23.9 % 'sí' en rojo) y '48 842 personas · 14 variables'. (b) Bajo F–G: 'Pasajeros aéreos · ¿cuántos pasajeros habrá el próximo año?', con un sparkline real de 1949–1960 (420×90 px, trazo rojo de 2 px, sin ejes, solo 'ene 1949' y 'dic 1960' en mono de 15 px) y '144 meses'. (c) Bajo H: 'Clima oculto · ¿qué clima hubo, si solo sé qué hizo mi amigo?', con un esquema mínimo: dos círculos L y S unidos por flechas de ida, vuelta y sobre sí mismos, debajo las palabras 'caminar · comprar · limpiar' y el texto '2 estados ocultos · 3 acciones visibles'. La tarjeta (c) lleva la marca 'esquema'. En el encabezado aparece 'Caso · Adult · Pasajeros · Clima'.

- Animación: Las tarjetas suben 14 px y aparecen escalonadas cada 0.12 s. El sparkline se dibuja de izquierda a derecha (0.9 s) y la barra 76/24 crece desde 0.
- Interacción: ninguna
- Frase clave: Tres casos reales nos acompañan: personas del censo, pasajeros por mes y un clima que no se ve.

**Paso 2 (cierre).** El tramo Puente 29–30 se pone rojo (trazo de 3 px) con la nota de 20 px 'aquí cambia la validación: en una serie no se puede barajar'. Debajo de toda la línea, a 40 px, aparece un hilo rojo de 1.5 px con la leyenda en mono 'modelo → validación → métrica'. El hilo termina en la estación Cierre con el rótulo '62 · resumen'.

- Animación: El hilo rojo se dibuja de izquierda a derecha (1 s). El tramo Puente sube su opacidad de 0.6 a 1 una sola vez.
- Interacción: ninguna
- Frase clave: En cada parte veremos qué modelo, cómo se valida y con qué se mide; en la 62 lo juntamos todo.

### Visuales

- **Línea de metro de las secciones** (diagrama, nuevo: MapaExposicion (modo 'linea') + src/deck/estructura.ts): Tramos proporcionales al número de diapositivas registradas, con estaciones, rangos y palabras clave. Si se usa la versión corta, se recalcula sola.
- **Proporción de clases de Adult** (svg, nuevo: BarraClases): Barra apilada 76.1 % / 23.9 %.
- **Sparkline de pasajeros** (svg, nuevo: Lineas (sin ejes), o el componente de serie que cree la sección F): Los 144 meses reales, sin ejes, solo con las fechas de los extremos.
- **Esquema mínimo del HMM** (diagrama, SVG dentro de la diapositiva (02-mapa.tsx)): Dos nodos L/S con flechas y las tres acciones debajo. Va marcado 'esquema' y no lleva números.

### Datos

- **tramos** (ts-vivo): Número de diapositivas registradas en cada sección: los rangos de estructura.ts cruzados con los num de src/slides/index.ts, sin contar las de respaldo. — *Cálculo:* Conteo en TS al montar. Ancho del tramo = max(96, conteo · k), normalizado a 1696 px. — *Verificación:* La suma de conteos es igual al número de diapositivas no-respaldo registradas: 64 en la versión completa, 58 en la corta. Se revisa con console.assert en desarrollo.
- **adult_n_pos** (python-json): N = 48 842 personas, 11 687 positivas (gana > 50K) y 14 variables. — *Cálculo:* Se lee de src/data/adult_muestra.json (n, positivos, columnas.length). En TS se calcula 11 687/48 842 = 0.2393, que se muestra como 23.9 %. — *Verificación:* Coincide con X.shape y y.sum() de cargar_adult() (verificado: 48 842, 11 687, 14). Además se cruza en TS con la suma de conteos de educacion_logloss.json.
- **pasajeros_serie** (python-json): 144 totales mensuales de pasajeros internacionales en miles, de enero de 1949 a diciembre de 1960 (Serie G de Box-Jenkins). — *Cálculo:* Se lee de src/data/pasajeros.json, que genera la sección F. Aquí solo se dibuja. — *Verificación:* Longitud 144; primer valor 112 (ene 1949), mínimo 104 y máximo 622 (jul 1960), comparados con la tabla de Box-Jenkins / AirPassengers de R. La comprobación es responsabilidad del script de la sección F.
- **clima_estructura** (constante-de-libro): 2 estados (Lluvioso, Soleado) y 3 observaciones (caminar, comprar, limpiar) del ejemplo clásico. Aquí no se muestran π, A ni B. — *Cálculo:* Constante del λ que usa la 60 (lib/hmm). — *Verificación:* Mismos nombres que model.states y model.symbols de la 60.

### Rigor

- Los rangos de diapositivas salen de estructura.ts, no se escriben en la diapositiva. Si se recortan 15, 16, 33, 44 y 56, los tramos se ajustan solos.
- El 23.9 % se calcula (11 687/48 842), no se escribe a mano.
- La pregunta de pasajeros es de pronóstico ('cuántos habrá'), que es lo que hacen ARIMA y SARIMA.
- La tarjeta del clima es un esquema y no lleva números. π, A y B aparecen hasta la 54.
- Las palabras clave deben corresponder a lo que de verdad cubre cada sección (estructura vigente).

### Riesgos

- Tramos angostos (Puente con 2 diapositivas, Apertura y Cierre con 3): con proporción estricta miden ~53–80 px. Por eso el mínimo de 96 px y las etiquetas alternadas arriba y abajo.
- Sobrecarga de texto: si se ve cargado en el proyector, quitar las palabras clave y dejar solo letra, nombre y rango.
- Si pasajeros.json todavía no existe, la tarjeta (b) muestra solo texto. Nunca un sparkline de ejemplo.
- Un mismo rojo con dos papeles: el tramo Puente y el hilo. El hilo va más fino (1.5 px) y con leyenda para que no se confundan.

## 3 · ¿Cómo sabemos si un modelo sirve?

- **Objetivo:** Que el público entienda que un modelo se juzga con datos que no vio, siguiendo la receta Datos → Modelo → Validación → Métrica, y que en Adult cada pieza es concreta: una fila es una persona, y es si gana más de 50K, y solo 23.9 % gana más.
- **Estado:** nueva · **Duración:** 90 s

### Pasos

**Paso 0 (concepto).** SlideFrame con sección ['Apertura', 'Cómo se evalúa'] y número 03/64. Título '¿Cómo sabemos si un modelo sirve?'. Lede: 'Si el examen trae las mismas preguntas de la guía, sacar 10 no prueba que entendiste. Con un modelo pasa igual.' Cuerpo en tres columnas, con la etiqueta 'Esquema · alumnos inventados' arriba a la izquierda. Izquierda (600 px): tabla 'Entrenamiento · 6 alumnos' con las columnas horas de estudio · tareas entregadas · ¿aprobó? y estas filas: (2, 3, no), (8, 9, sí), (5, 7, sí), (1, 2, no), (9, 10, sí), (4, 4, no). Centro (380 px): una caja con borde de 1 px, 'Modelo memorión', y debajo 'guarda la tabla; si no conoce al alumno, dice no'. Derecha (600 px): tabla 'Nuevos · 4 alumnos': (7, 8, sí), (3, 3, no), (6, 9, sí), (2, 4, no). Bajo cada tabla, su marcador en mono de 26 px: 'aciertos 6/6 = 100 %' y 'aciertos 2/4 = 50 %'.

- Animación: Las 6 filas de entrenamiento se deslizan hacia la caja y se 'guardan' (0.5 s). Después el modelo contesta fila por fila, cada 200 ms: el acierto se marca en gris claro y el error en rojo, y el contador sube en vivo. Luego se repite con las 4 nuevas.
- Interacción: ninguna
- Frase clave: Entrenar no es evaluar: acertarle a lo que ya viste no demuestra nada.

**Paso 1 (concepto).** Las tablas se desvanecen. Aparece Receta en modo completo, a todo lo ancho: 4 columnas de 392 px unidas por flechas finas. 01 DATOS: 'Una tabla: cada fila es un ejemplo, cada columna una variable, y una columna y es lo que se quiere predecir.' 02 MODELO: 'Una regla que aprende de las filas de entrenamiento a ir de las variables x a una predicción ŷ.' 03 VALIDACIÓN: 'Cómo se separan los datos para examinar al modelo con filas que no vio al aprender.' 04 MÉTRICA: 'Un número que resume qué tan bien acierta en esas filas; por ejemplo, la proporción de aciertos (accuracy).' Cada columna lleva etiqueta mono, nombre de 34 px/600, la definición en 23 px y un dibujo de líneas de 120 px de alto: Datos es una cuadrícula de 5×4 con la última columna en rojo tenue (y); Modelo es una caja que atraviesa 'x → ŷ'; Validación es una barra de 10 celdas, 8 grises 'entrenamiento' y 2 rojas 'prueba'; Métrica es una regla de 0 a 1 con una marca, sin número. La columna Validación lleva borde rojo de 1 px.

- Animación: Las columnas aparecen escalonadas cada 0.12 s mientras la línea de flechas se dibuja de izquierda a derecha.
- Interacción: ninguna
- Frase clave: Datos, modelo, validación y métrica: si falta una, el número no significa nada.

**Paso 2 (concepto).** La receta se encoge a una franja de 64 px arriba, con 'Validación' en rojo. Cuerpo: Particiones en modo esquema con 20 cuadros de 56 px; 5 llevan un punto rojo, que son los positivos. Etiqueta: 'Esquema · 20 filas'. La secuencia tiene tres partes. (1) Los 20 cuadros se barajan. (2) Se agrupan en 5 pliegues de 4 y cada pliegue tiene exactamente 1 punto rojo, con el rótulo 'estratificado: cada pliegue conserva 1 positivo de cada 4'. (3) Se apilan 5 renglones, uno por ronda: en la ronda k, el pliegue k va relleno de rojo con el rótulo 'prueba' y los otros 4 solo con contorno, 'entrenamiento'. A la derecha de cada ronda va m₁ … m₅ en mono. Debajo, la fórmula media ± desviación en KaTeX de 30 px.

- Animación: El barajado usa layout de motion (resorte, 0.6 s) y la permutación sale de mulberry32(42). Los huecos entre pliegues se abren en 0.4 s. Las 5 rondas bajan una por una cada 0.45 s y la fórmula aparece al final. La secuencia se repite si se vuelve al paso.
- Interacción: ninguna
- Frase clave: Cada fila es prueba exactamente una vez: el resultado es el promedio de cinco exámenes.

**Paso 3 (caso).** En el encabezado aparece 'Caso · Adult'. Izquierda (600 px): FichaPersona con tres chips arriba, 'Persona A · B · C' (filas 0, 2 y 4 de OpenML adult v2). Tiene 14 renglones con el nombre en español (mono de 15 px: edad, tipo de empleo, peso censal (fnlwgt), escolaridad, años de educación, estado civil, ocupación, parentesco, raza, sexo, ganancia de capital, pérdida de capital, horas por semana, país de origen) y el valor original en 22 px. Al final va el renglón 'y · ¿gana > 50K?' en rojo. En la persona C, 'tipo de empleo' y 'ocupación' dicen 'faltante' en rojo tenue. El chip 'ver como números' cambia las categorías por su código entero (OrdinalEncoder). Derecha (1000 px): '48 842 filas = personas' y '14 variables · 6 numéricas, 8 categóricas' en 44 px. Debajo, una BarraClases de 900 px: 76.1 % 'no' (37 155) en gris y 23.9 % 'sí' (11 687) en rojo. Luego, en 20 px: 'faltantes reales: tipo de empleo 2 799 · ocupación 2 809 · país 857 (3 620 personas con al menos uno)'. Al final, una línea gris: 'las categorías se vuelven enteros y el faltante es una categoría más'.

- Animación: La ficha entra desde la izquierda y sus renglones aparecen en cascada (30 ms). La barra 76/24 crece desde 0 y los conteos suben de 0 a su valor en 0.8 s. Al cambiar de persona, los valores hacen cross-fade (0.25 s).
- Interacción: Chips Persona A/B/C y chip 'ver como números' (clic). Después del clic se llama blur() para que Espacio siga avanzando.
- Frase clave: Una fila es una persona; y es si gana más de 50K. Y solo 1 de cada 4 gana más.

**Paso 4 (caso).** Vuelve la franja Receta, ahora con el contenido de Adult. Modelo: 'árboles y ensambles (4–28)'. Validación y Métrica activas. Centro: Particiones con los datos reales: una barra de 1500 px que representa a las 48 842 personas, partida en 5 pliegues proporcionales. Sobre cada pliegue, su tamaño (9 769 · 9 769 · 9 768 · 9 768 · 9 768) y su porcentaje de positivos (23.93 · 23.93 · 23.92 · 23.92 · 23.92 %). Debajo, 5 renglones de 22 px; en la ronda k, el pliegue k va en rojo. Nota mono: 'StratifiedKFold · K = 5 · mismas particiones para todos los modelos (semilla 42) · la 5 usa exactamente esto'. A la derecha, 'accuracy = aciertos / personas de prueba' en TeX y 'F1-macro → diapositiva 26'. Abajo, un recuadro 'El piso': 'un modelo que siempre dice no acierta 76.1 %', con una mini BarraClases. Por último, el takeaway de 28 px: 'Todo número de esta exposición dice con qué datos, con qué validación y con qué métrica salió.'

- Animación: La barra de 48 842 se parte en 5 y los porcentajes aparecen sobre cada pliegue. Las rondas bajan con el mismo movimiento del paso 2, para que se reconozca. El recuadro del piso entra al último y el takeaway con un Reveal 0.6 s después.
- Interacción: ninguna
- Frase clave: Cualquier modelo tiene que ganarle al piso de 76.1 %; en la 26 veremos por qué el accuracy no basta.

### Visuales

- **Modelo memorión** (tabla, dentro de la diapositiva (03-como-se-evalua.tsx)): Dos tablas de alumnos inventados, una caja que guarda la tabla y marcadores de aciertos. Va marcado 'esquema'.
- **Receta Datos → Modelo → Validación → Métrica** (diagrama, nuevo: Receta): Modo completo con definiciones y dibujos de líneas (paso 1) y modo franja con el bloque activo (pasos 2 y 4).
- **K-fold estratificado de 20 filas** (svg, nuevo: Particiones (tipo 'kfold', esquema)): Barajado, agrupación en 5 pliegues con 1 positivo cada uno y 5 rondas.
- **Ficha de una persona de Adult** (tabla, nuevo: FichaPersona): 14 variables más y, con vista cruda y vista codificada, y faltantes resaltados.
- **Proporción 76/24** (svg, nuevo: BarraClases): Barra apilada con conteos. Se reusa en pequeño para 'El piso'.
- **Pliegues reales de Adult** (svg, nuevo: Particiones (tipo 'kfold', tamanos y positivos del JSON)): Barra de 48 842 partida en 5 con tamaños y porcentaje de positivos reales, más 5 rondas.
- **Fórmulas de accuracy y de media ± desviación** (formula, TeX (existente)): KaTeX de 30 px. Los números se inyectan desde el JSON.

### Datos

- **esquema_memorion** (esquema-didactico): 6 alumnos de entrenamiento y 4 nuevos, inventados (horas, tareas, ¿aprobó?). El modelo es un diccionario de coincidencia exacta que responde 'no' si no conoce al alumno. — *Cálculo:* TS: se buscan las filas nuevas en el diccionario y se cuentan los aciertos. Da 6/6 y 2/4 porque ninguna fila nueva está en la tabla y 2 de las 4 son 'no'. — *Verificación:* console.assert de que ninguna fila nueva coincide exactamente con una de entrenamiento. El conteo se revisa a mano.
- **esquema_kfold** (esquema-didactico): 20 elementos con 5 positivos repartidos en 5 pliegues estratificados (1 positivo y 3 negativos por pliegue). — *Cálculo:* TS: permutación con mulberry32(42); positivos y negativos se reparten por separado, en orden circular. — *Verificación:* Aserción en desarrollo: cada elemento está en prueba exactamente una vez y cada pliegue tiene 1 positivo.
- **adult_conteos** (python-json): n = 48 842, positivos = 11 687, negativos = 37 155. Las 14 columnas con su tipo: 6 numéricas (age, fnlwgt, education-num, capital-gain, capital-loss, hours-per-week) y 8 categóricas. — *Cálculo:* scripts/exportar_apertura.py → src/data/adult_muestra.json. En TS: 11 687/48 842 = 0.2393 y 1 − 0.2393 = 0.7607. — *Verificación:* Python: X.shape = (48842, 14), y.sum() = 11687 y dtypes (verificado). En TS se cruza con la suma de conteos de educacion_logloss.json (console.assert).
- **adult_ejemplos** (python-json): Filas 0, 2 y 4 de fetch_openml('adult', version=2), en crudo y codificadas con preprocesador(). Regla de elección: la primera con y=0 (fila 0: 25 años, 11th, ≤50K), la primera con y=1 (fila 2: 28 años, Assoc-acdm, >50K) y la primera con workclass faltante (fila 4: 18 años, workclass y occupation faltantes). — *Cálculo:* El script aplica la regla y guarda crudo (faltante = null) y codificado (OrdinalEncoder; por ejemplo, workclass faltante → 8, porque 'faltante' se ordena después de las categorías con mayúscula). — *Verificación:* El script imprime X.iloc[[0,2,4]] y pre.transform. Revisado: el código de workclass de la fila 4 es 8 y el de la fila 0 (Private) es 3.
- **adult_faltantes** (python-json): Faltantes reales por columna: workclass 2 799, occupation 2 809, native-country 857; filas con al menos uno: 3 620. — *Cálculo:* X.isna().sum() y X.isna().any(axis=1).sum() en exportar_apertura.py. — *Verificación:* Coincide con lo que imprime comparar_ensambles.py (mismos tres conteos).
- **adult_pliegues** (python-json): StratifiedKFold(n_splits=5, shuffle=True, random_state=42).split(X, y). Tamaños de prueba: [9 769, 9 769, 9 768, 9 768, 9 768]. Positivos de prueba: [2 338, 2 338, 2 337, 2 337, 2 337], o sea 23.93 / 23.93 / 23.92 / 23.92 / 23.92 %. Entrenamiento: 39 073 o 39 074. — *Cálculo:* Se recorre cv.split en exportar_apertura.py. En TS se calcula el porcentaje de cada pliegue. — *Verificación:* La suma de tamaños es 48 842. Es el mismo objeto y la misma semilla que comparar_ensambles.py y exportar_datos.py (verificado en Python).
- **piso_mayoritaria** (python-json): Accuracy de DummyClassifier(most_frequent) en CV de 5 pliegues = 0.7607. — *Cálculo:* Se lee de comparacion_adult.json (modelo 'Clase mayoritaria', accuracy.media). — *Verificación:* En TS: |0.7607 − (1 − 11 687/48 842)| < 1e−4 (console.assert).

### Fórmulas

- `\text{accuracy} = \dfrac{\#\,\text{aciertos}}{\#\,\text{filas de prueba}}`
- `\text{resultado} = \bar m \pm s,\qquad \bar m = \frac{1}{K}\sum_{k=1}^{K} m_k,\qquad s = \sqrt{\frac{1}{K}\sum_{k=1}^{K}\left(m_k-\bar m\right)^2}`
- `\text{piso} = \max(p,\;1-p),\qquad p = \frac{\#\,\text{positivos}}{n}`

### Rigor

- La desviación s es la poblacional (ddof = 0), igual que np.std en comparar_ensambles.py. Si se cambia a ddof = 1, hay que cambiarlo también en el script.
- Estratificado quiere decir que cada pliegue conserva la proporción de clases (23.92–23.93 % en Adult). No quiere decir que los pliegues sean idénticos.
- Cada fila cae en prueba exactamente una vez, y en cada ronda el modelo se entrena desde cero solo con los otros 4 pliegues.
- La validación cruzada supone filas independientes (i.i.d.); en series se valida distinto (29–30). Se dice en voz y no en pantalla, para no adelantar.
- fnlwgt es el peso muestral del censo (a cuántas personas representa la fila). Aquí se usa como una variable más, no como peso; si alguien pregunta, se dice así.
- education-num es la misma información que education: 16 niveles con correspondencia uno a uno, verificado en Python (16 pares distintos).
- Los valores categóricos se muestran en inglés, como vienen en el conjunto, porque son datos; solo se traducen los nombres de columna.
- El piso de 76.1 % es el accuracy de la clase mayoritaria en CV y coincide con la proporción de negativos. El 0.432 de F1-macro se guarda para la 26.
- El modelo memorión es un esquema con alumnos inventados, no datos de Adult; la etiqueta lo dice.

### Riesgos

- Es la diapositiva más larga de la apertura (5 pasos). Si se pasa de 90 s, el paso 0 se narra más rápido, pero el paso 2 (K-fold) no se quita: sostiene la 5, la 12, la 26 y la 30.
- La ficha de 14 renglones a 22 px mide ~480 px de alto. Hay que revisar que quepa con el lede de dos líneas (cuerpo de ~630 px); si no, se usan dos columnas de 7 renglones.
- El rojo tiene dos papeles: 'prueba' (relleno del pliegue) y 'positivo' (punto). En los pasos 2 y 4 el positivo siempre es un punto, nunca un relleno; en el paso 3 el rojo es 'gana > 50K'. Para daltonismo, las etiquetas de texto 'prueba' y 'sí' siempre acompañan al color.
- Valores en inglés como 'Married-civ-spouse' pueden distraer; se traducen al narrar.
- Los chips con foco podrían capturar Espacio: hay que llamar blur() tras el clic, como en la 20.

## 62 · La misma receta en los tres casos

- **Objetivo:** Que el público cierre con un solo mapa: para Adult, pasajeros y el clima, qué modelo se usó, cómo se validó y con qué se midió. Y que vea que lo que cambia entre ellos es la validación.
- **Estado:** nueva · **Duración:** 85 s

### Pasos

**Paso 0 (concepto).** SlideFrame con sección ['Cierre', 'Resumen'] y número 62/64. Título 'La misma receta en los tres casos'. Lede: 'La receta de la diapositiva 3 no cambió. Lo que cambió fue cómo se valida cuando el orden importa.' Cuerpo: rejilla con una columna de nombres de 150 px y 4 columnas (Datos 330 · Modelo 360 · Validación 420 · Métrica 436 px). El encabezado es la franja de Receta. Debajo van tres renglones vacíos de 170 px, separados por líneas de 1 px, con el nombre del caso en mono: ADULT · PASAJEROS · CLIMA.

- Animación: La franja de Receta entra con el mismo movimiento que en la 3; las líneas de los renglones se dibujan de izquierda a derecha.
- Interacción: ninguna
- Frase clave: Volvamos a la receta del principio.

**Paso 1 (caso).** Se llena el renglón Adult y en el encabezado aparece 'Caso · Adult'. Datos: '48 842 personas · 14 variables · y = gana > 50K', con BarraClases mini de 300 px. Modelo: 'árbol → bagging · Random Forest → AdaBoost · Gradient Boosting · XGBoost'. Validación: Particiones mini (k-fold estratificado de 5, 400×56 px) y 'filas independientes: barajar está bien'. Métrica: PuntosIntervalo con el F1-macro (media ± desv) de los 7 modelos de comparacion_adult.json, en un eje de 0.40 a 0.85; línea discontinua en la clase mayoritaria (0.432); GB y XGBoost en rojo. Nota mono: 'XGBoost: acc 0.874 · F1 0.817 · empatado con GB dentro de la variación entre pliegues'.

- Animación: Las celdas aparecen escalonadas cada 0.15 s. Los puntos de F1 se deslizan de 0.40 a su valor (0.6 s), en el orden en que se vieron en la exposición.
- Interacción: Clic en el renglón → IrA 27 (demo con la tabla real). Es un ancla y no reacciona a Espacio.
- Frase clave: En Adult se puede barajar: cada persona es independiente de las demás.

**Paso 2 (caso).** Renglón Pasajeros, con 'Caso · Pasajeros' en el encabezado. Datos: '144 meses · 1949–1960' y sparkline real. Modelo: 'AR · MA → ARIMA → SARIMA', con el orden elegido leído de series_resultados.json. Validación: Particiones mini tipo temporal: barra de tiempo con entrenamiento a la izquierda en gris y prueba al final en rojo, con las fechas del JSON, y el texto 'nunca barajar: se predice el futuro con el pasado'. Métrica: MAE · RMSE · MAPE del SARIMA contra la ingenua estacional, dos barras horizontales por métrica, y en mono 'residuos: Ljung-Box p = … (> 0.05: sin autocorrelación) · orden elegido con AIC'.

- Animación: En la columna Validación, una copia de los 5 bloques del k-fold de Adult baja y se reacomoda en orden temporal: los bloques se alinean en el tiempo y la prueba se va al final (0.8 s). El resto de las celdas aparece escalonado.
- Interacción: clic en el renglón → IrA 50
- Frase clave: En una serie, barajar es hacer trampa: el modelo vería el futuro.

**Paso 3 (caso).** Renglón Clima, con 'Caso · Clima' en el encabezado. Datos: 'secuencia de acciones: caminar → comprar → limpiar'. Modelo: 'HMM · λ = (π, A, B)'. Validación: 'λ es de libro: no se estimó con datos' y, en gris, 'con datos reales: se apartan secuencias completas (no se cortan)', con Particiones mini tipo secuencias. Métrica: 'P(O | λ) = 0.03361 (Forward) · mejor camino Soleado → Lluvioso → Lluvioso, 0.01344 (Viterbi)', calculado en vivo con lib/hmm. En gris: 'en la práctica: log-verosimilitud en secuencias apartadas (61)'.

- Animación: Igual que los renglones anteriores; los dos números del HMM cuentan de 0 a su valor en 0.6 s.
- Interacción: clic en el renglón → IrA 60
- Frase clave: Con un HMM se pregunta qué tan probable es lo observado y qué estados lo explican.

**Paso 4 (cierre).** La columna Validación se enmarca en rojo de arriba abajo, con el rótulo mono 'lo que cambia' en el encabezado. Las otras tres columnas bajan su opacidad a 0.55. Abajo, takeaway de 30 px: 'Antes de creer un número, pregunta: ¿con qué datos?, ¿cómo se validó?, ¿con qué métrica?'. Desaparece la etiqueta Caso.

- Animación: El marco rojo se dibuja (pathLength, 0.8 s) y las demás columnas se atenúan a la vez.
- Interacción: ninguna
- Frase clave: El modelo cambia en cada parte; la pregunta es siempre la misma: ¿acierta con datos que no vio?

### Visuales

- **Encabezado receta** (diagrama, nuevo: Receta (modo 'franja')): Franja de 64 px con los 4 bloques. Es el mismo componente de la 3, para que el público lo reconozca.
- **Mini-particiones por caso** (svg, nuevo: Particiones (compacto)): K-fold estratificado, partición temporal y secuencias completas; incluye la transformación de k-fold a temporal.
- **F1-macro de los 7 modelos** (svg, nuevo: PuntosIntervalo): Gráfica de puntos con bigotes ±desv y línea de referencia de la clase mayoritaria.
- **Sparkline de pasajeros** (svg, nuevo: Lineas (sin ejes)): Los 144 meses reales.
- **Barras de error del pronóstico** (svg, nuevo: PuntosIntervalo en modo barras, o SVG dentro de la diapositiva): MAE, RMSE y MAPE del SARIMA contra la ingenua estacional, en el periodo de prueba.
- **Números del HMM** (texto, lib/hmm.ts (existente: forward, viterbi)): P(O|λ) y el mejor camino, calculados en vivo.
- **Proporción 76/24** (svg, nuevo: BarraClases): BarraClases mini.

### Datos

- **f1_modelos** (python-json): F1-macro media y desv de StratifiedKFold(5, semilla 42), sin ajustar hiperparámetros: mayoritaria 0.432, árbol 0.743, bagging 0.788, RF 0.795, AdaBoost 0.789, GB 0.815 y XGBoost 0.817 (desv 0.003–0.004). — *Cálculo:* Se lee de src/data/comparacion_adult.json (campo f1_macro). — *Verificación:* Son los valores que imprimió comparar_ensambles.py. La 62 lee el mismo archivo que la 27, así que no puede haber discrepancia.
- **acc_xgb** (python-json): Accuracy de XGBoost (300 árboles, lr 0.1, profundidad 6) en CV = 0.8739. — *Cálculo:* comparacion_adult.json → accuracy.media, redondeado a 3 decimales. — *Verificación:* Coincide con la tabla de la 27.
- **empate_gb_xgb** (ts-vivo): Diferencia de F1-macro entre XGBoost y GB (0.8168 − 0.8145 = 0.0024) comparada con la desviación entre pliegues más grande de los dos (0.0044). — *Cálculo:* TS: si |Δ| < max(desv), se muestra 'empatado dentro de la variación entre pliegues'; si no, se muestra el ganador. — *Verificación:* Mismos números del JSON. El texto se genera solo, no se escribe.
- **series_resultados** (python-json): Orden del SARIMA final, periodo de prueba (desde y hasta), MAE/RMSE/MAPE del SARIMA y de la ingenua estacional en ese periodo, y p de Ljung-Box de los residuos con su número de rezagos. — *Cálculo:* Se lee de src/data/series_resultados.json, que genera la sección G con statsmodels. Aquí solo se muestra. — *Verificación:* Son los mismos números de las diapositivas 48–50 porque leen el mismo archivo. En desarrollo, console.assert de que los campos existen.
- **hmm_clima** (ts-vivo): Con el λ de la 54 y O = caminar, comprar, limpiar: P(O|λ) = 0.033612 y mejor camino S → L → L con 0.01344. — *Cálculo:* forward() y viterbi() de src/lib/hmm.ts (existentes). — *Verificación:* hmmlearn en respaldo_hmm.json: exp(score) = exp(−3.39287) = 0.033612 y exp(logprob de decode) = exp(−4.30952) = 0.01344, con el mismo camino [1, 0, 0].
- **particiones_adult** (python-json): Tamaños y porcentaje de positivos de los 5 pliegues. — *Cálculo:* src/data/adult_muestra.json (el mismo de la 3). — *Verificación:* Suma de 48 842; misma semilla que comparar_ensambles.py.

### Fórmulas

- `\bar m \pm s`
- `P(O\mid\lambda) = \sum_{j} \alpha_T(j)`

### Rigor

- 'Empatados' quiere decir que la diferencia de F1-macro entre GB y XGBoost (0.002) es menor que la variación entre pliegues (0.003–0.004). No es una prueba estadística formal y no se presenta como tal.
- P(O|λ) no es una métrica de desempeño: es la verosimilitud de la secuencia con un λ dado. Por eso la celda dice 'λ es de libro'.
- Con datos reales, un HMM se evalúa con la log-verosimilitud en secuencias completas apartadas y, si hay estados etiquetados, con la proporción de estados bien decodificados. El número de estados se elige con BIC o validación (lo cuenta la 61).
- Ljung-Box: H0 = sin autocorrelación en los residuos, así que se quiere p > 0.05 (corrección acordada).
- En la validación temporal la prueba siempre va después del entrenamiento. El periodo exacto lo fija la sección G y se lee del JSON.
- Si se mencionan, los tamaños de los ensambles deben coincidir con los del protocolo: Bagging 100, RF 300, AdaBoost 300, GB 300 y XGBoost 300 árboles.

### Riesgos

- Densidad: 12 celdas con mini-gráficas. Máximo 2 líneas por celda a 22 px y notas grises a 18 px. Si se ve cargado, se quitan las notas grises y se narran.
- Depende de series_resultados.json (sección G) y de pasajeros.json (sección F). Si faltan, las celdas de pasajeros muestran solo texto, nunca números de ejemplo.
- La transformación de la mini-partición entre renglones (layoutId) puede fallar si los renglones se montan en pasos distintos. Alternativa: animar una copia con posición absoluta.
- Clic en un renglón para saltar: está pensado para preguntas. Como es un ancla, ni el presentador inalámbrico ni Espacio lo activan.
- Los puntos de F1 de RF (0.795) y AdaBoost (0.789) quedan a ~7 px de distancia a 436 px de ancho: las etiquetas van a la izquierda, alineadas por renglón, no junto al punto.

## 63 · Referencias

- **Objetivo:** Que quien quiera profundizar sepa en qué fuente original se apoya cada parte, y que cada afirmación de la exposición tiene respaldo.
- **Estado:** nueva · **Duración:** 35 s

### Pasos

**Paso 0 (cierre).** SlideFrame con sección ['Cierre', 'Referencias'] y número 63/64. Lede: 'Las cinco fuentes principales y dónde se usaron.' Cinco renglones a todo lo ancho de ~100 px cada uno. A la izquierda, el año en mono rojo de 22 px; al centro, los autores en 24 px/600 seguidos del título en cursiva y la revista o editorial en 22 px gris claro; a la derecha, chips IrA con las diapositivas donde se usó. (1) Breiman (1996, 2001): 'Bagging predictors', Machine Learning 24(2), 123–140; 'Random Forests', Machine Learning 45(1), 5–32 → 10–16. (2) Hastie, Tibshirani y Friedman (2009): The Elements of Statistical Learning, 2.ª ed., Springer → 4–9, 17–22, R2. (3) Chen y Guestrin (2016): 'XGBoost: A Scalable Tree Boosting System', KDD '16, 785–794 → 23–24. (4) Box, Jenkins, Reinsel y Ljung (2015): Time Series Analysis: Forecasting and Control, 5.ª ed., Wiley (1.ª ed. 1970) → 31–50. (5) Rabiner (1989): 'A Tutorial on Hidden Markov Models and Selected Applications in Speech Recognition', Proceedings of the IEEE 77(2), 257–286 → 51–61, R4.

- Animación: Los renglones aparecen escalonados cada 80 ms.
- Interacción: Chips IrA (clic) para saltar durante las preguntas.
- Frase clave: Cada parte se apoya en su fuente original.

**Paso 1 (cierre).** Los 5 principales se compactan en una línea arriba y aparecen las complementarias en 3 columnas de 540 px, a 20 px con interlineado 1.35. Ensambles: Breiman, Friedman, Olshen y Stone (1984), CART, Wadsworth; Efron (1979), Ann. Stat. 7(1), 1–26; Freund y Schapire (1997), JCSS 55(1), 119–139; Friedman, Hastie y Tibshirani (2000), Ann. Stat. 28(2), 337–407; Friedman (2001), Ann. Stat. 29(5), 1189–1232; Zhu, Zou, Rosset y Hastie (2009), Statistics and Its Interface 2(3), 349–360. Series: Dickey y Fuller (1979), JASA 74(366), 427–431; Kwiatkowski, Phillips, Schmidt y Shin (1992), J. Econometrics 54(1–3), 159–178; Ljung y Box (1978), Biometrika 65(2), 297–303; Akaike (1974), IEEE TAC 19(6), 716–723; Schwarz (1978), Ann. Stat. 6(2), 461–464; Hyndman y Athanasopoulos (2021), Forecasting: Principles and Practice, 3.ª ed., OTexts. HMM, datos y software: Viterbi (1967), IEEE Trans. Inf. Theory 13(2), 260–269; Baum, Petrie, Soules y Weiss (1970), Ann. Math. Stat. 41(1), 164–171; el ejemplo del clima viene del artículo 'Viterbi algorithm' de Wikipedia en inglés; Becker y Kohavi (1996), Adult, UCI ML Repository, doi:10.24432/C5XW20; Pedregosa et al. (2011), scikit-learn, JMLR 12, 2825–2830; Seabold y Perktold (2010), statsmodels, Proc. SciPy; documentación de XGBoost 3.4.1 y de hmmlearn (versiones usadas).

- Animación: El bloque cambia con un cross-fade de 0.3 s.
- Interacción: ninguna
- Frase clave: Y las fuentes de los detalles: pruebas, criterios y software.

### Visuales

- **Lista principal con enlaces** (texto, nuevo: IrA (chips); los datos de las citas en src/deck/referencias.ts): 5 renglones con el año, la cita completa y chips de las diapositivas donde se usó.
- **Lista complementaria** (texto, dentro de la diapositiva (63-referencias.tsx)): 3 columnas a 20 px, agrupadas por parte.

### Datos

- **referencias** (constante-de-libro): Lista de citas (autores, año, título, revista o editorial, volumen y número, páginas, doi y diapositivas donde se usa). — *Cálculo:* src/deck/referencias.ts. La diapositiva solo la recorre. — *Verificación:* Antes de presentar, cada volumen, número y página se compara con el DOI o la página de la editorial. Los chips que apunten a una diapositiva no registrada se avisan con console.warn.

### Rigor

- Los datos bibliográficos están escritos de memoria y hay que confirmar cada uno contra su DOI: Breiman 1996, ML 24(2):123–140; Breiman 2001, ML 45(1):5–32; Chen y Guestrin, KDD '16, pp. 785–794; Rabiner 1989, Proc. IEEE 77(2):257–286; Freund y Schapire 1997, JCSS 55(1):119–139; Friedman, Hastie y Tibshirani 2000, Ann. Stat. 28(2):337–407; Friedman 2001, Ann. Stat. 29(5):1189–1232; Zhu et al. 2009, Stat. Interface 2(3):349–360; Dickey y Fuller 1979, JASA 74(366):427–431; KPSS 1992, J. Econometrics 54(1–3):159–178; Ljung y Box 1978, Biometrika 65(2):297–303; Akaike 1974, IEEE TAC 19(6):716–723; Schwarz 1978, Ann. Stat. 6(2):461–464; Viterbi 1967, IEEE Trans. IT 13(2):260–269; Baum et al. 1970, Ann. Math. Stat. 41(1):164–171; Efron 1979, Ann. Stat. 7(1):1–26; Pedregosa et al. 2011, JMLR 12:2825–2830.
- El ejemplo del clima (π = (0.6, 0.4), A, B y la secuencia caminar → comprar → limpiar con S → L → L y 0.01344) es el del artículo 'Viterbi algorithm' de Wikipedia. Se cita así y no se atribuye a Rabiner.
- Los pasajeros aéreos son la Serie G de Box y Jenkins: totales mensuales en miles, de 1949 a 1960.
- Zhu et al. (SAMME) se cita porque sklearn implementa SAMME y la 19 menciona α = ln((1−ε)/ε) + ln(K−1).
- Friedman, Hastie y Tibshirani (2000) es la fuente de la equivalencia de la R2 y KPSS (1992) la de la R3.
- No se citan las prácticas de la materia.

### Riesgos

- Texto denso: no se lee en voz alta. Se deja ~10 s y se avanza. 20 px es el mínimo legible para las complementarias en proyector; no se baja de ahí.
- Si alguna cita resulta mal al verificarla, se corrige en referencias.ts: es el único lugar donde está escrita.

## 64 · Preguntas

- **Objetivo:** Abrir la discusión y poder saltar en segundos a la diapositiva que responde cada pregunta, incluidas las de respaldo.
- **Estado:** nueva · **Duración:** 15 s

### Pasos

**Paso 0 (cierre).** Diseño propio como el de la portada, con el encabezado slide-head ['Cierre', 'Preguntas'] y 64/64, sin lede. Izquierda (720 px): barra roja de 120×4, 'Preguntas' a 120 px/600 y debajo 'Ensambles y datos secuenciales' en 28 px gris, con la línea de meta (equipo · grupo). Derecha (900 px): 'Volver a…', con MapaExposicion en modo índice. Hay 11 renglones, uno por sección: letra roja en mono más el nombre en 20 px, en una columna de 220 px, y luego chips cuadrados de 40 px con solo el número de cada diapositiva registrada, a 46 px de paso. Al pasar el mouse, una línea de estado mono abajo muestra el título corto (por ejemplo, '14 · Sorteo de √p variables'). Debajo, 'Respaldo': 4 chips anchos de 430×52 en 2×2 con su pregunta: R1 '¿De dónde sale el 36.8 %?' · R2 '¿Por qué AdaBoost re-pondera así?' · R3 '¿Y si ADF y KPSS no coinciden?' · R4 '¿Qué pasa con secuencias largas?'.

- Animación: Entrada como en la portada: la barra crece y el título sube. Los renglones del índice aparecen escalonados cada 50 ms.
- Interacción: Chips IrA (clic) → navega a la diapositiva, por omisión en su último paso (vista completa). Hover → título corto en la línea de estado.
- Frase clave: ¿Preguntas?

**Paso 1 (cierre).** Abajo a la izquierda aparece 'Para pensar' con 4 preguntas en 22 px, cada una con el chip de su diapositiva. (1) 'Random Forest ya promedia árboles: ¿para qué sortea variables en cada corte?' → 14. (2) '¿Por qué boosting sí se sobreajusta con demasiados árboles y Random Forest prácticamente no?' → 22. (3) '¿Por qué no se puede barajar una serie antes de validarla?' → 30. (4) 'Forward y Viterbi llenan la misma tabla: ¿qué cambia y qué responde cada uno?' → 60.

- Animación: Las preguntas suben 14 px, escalonadas cada 0.1 s.
- Interacción: chips IrA
- Frase clave: Si nadie pregunta: cuatro preguntas para comprobar que se entendió.

### Visuales

- **Título de cierre** (texto, dentro de la diapositiva + src/deck/meta.ts): Estilo portada: barra roja y 'Preguntas' a 120 px.
- **Índice navegable** (diagrama, nuevo: MapaExposicion (modo 'indice') + IrA + estructura.ts): Una fila por sección con chips numéricos de las diapositivas registradas y título corto al pasar el mouse.
- **Accesos a respaldo** (texto, nuevo: IrA (variante 'fila')): 4 chips anchos con la pregunta que responde cada diapositiva de respaldo.
- **Preguntas para pensar** (texto, nuevo: IrA): 4 preguntas con enlace a la diapositiva que las responde.

### Datos

- **indice** (ts-vivo): Diapositivas registradas agrupadas por sección, con su título corto. — *Cálculo:* useDeck().existe(num) sobre los rangos y los títulos cortos de estructura.ts. — *Verificación:* En desarrollo, console.warn si estructura.ts tiene un número sin registrar o si una diapositiva registrada no tiene título corto.

### Rigor

- Cada pregunta 'para pensar' tiene su respuesta en la diapositiva enlazada; no se agrega contenido nuevo. En la (2), boosting sí se sobreajusta con demasiados árboles y RF prácticamente no (corrección acordada).
- Los títulos cortos del índice son los mismos de estructura.ts que usa el mapa de la 2.

### Riesgos

- Sin los cambios al Deck (contexto con irA, escucha de hashchange y respaldo fuera del flujo normal), los chips no funcionan o mandan a la portada: readHash cae al índice 0 cuando no encuentra el num.
- Espacio: 11 renglones × 46 px = 506 px; la sección más larga, H con 11 diapositivas, mide 220 + 11×46 = 726 px de ancho; los chips de respaldo suman ~120 px. Cabe en ~700 px de alto, pero hay que revisarlo con la versión completa.
- Al llegar a la 64, → no debe entrar a R1 por accidente: el Deck no avanza a respaldo con flechas, solo por chip o URL.

## R1 · ¿Por qué queda fuera el 36.8 %?

- **Objetivo:** Que quien preguntó vea de dónde sale que cada muestra bootstrap deja fuera cerca del 36.8 % de las personas, (1 − 1/n)ⁿ → e⁻¹, y qué tan cerca está ya con n = 400.
- **Estado:** nueva · **Duración:** 70 s

### Pasos

**Paso 0 (concepto).** SlideFrame con sección ['Respaldo', 'B. Bagging'] y número 'R1 · respaldo'. Título '¿Por qué queda fuera el 36.8 %?'. Lede: 'Sorteamos n veces con reemplazo entre n personas. ¿Qué probabilidad tiene una persona de no salir nunca?' Etiqueta: 'Esquema · 5 pelotas (como en la 10)'. Izquierda (820 px): TableroSorteos de 5 renglones (pelotas 1–5) por 5 columnas (sorteos 1–5), con el renglón de la pelota 3 resaltado; en cada columna, su celda dice 'no sale: 4/5'. Debajo, el producto en TeX de 30 px: (4/5)(4/5)(4/5)(4/5)(4/5) = (1 − 1/5)⁵ = 1024/3125 = 0.32768. Derecha (760 px): Recap 'Recordatorio · sorteos independientes', con el texto 'si un sorteo no influye en otro, la probabilidad de que pasen todos a la vez es el producto'.

- Animación: Las 5 columnas se iluminan una por una cada 0.3 s; en cada una, el factor 4/5 vuela a la fórmula. Al final el resultado cuenta hasta 0.32768.
- Interacción: ninguna
- Frase clave: Cada sorteo la deja fuera con probabilidad 1 − 1/n; con n sorteos seguidos, (1 − 1/n)ⁿ.

**Paso 1 (concepto).** Izquierda (760 px): dos caminos al límite, uno debajo del otro, en KaTeX de 28 px. Camino A, por la definición de e: lim (1 + x/n)ⁿ = eˣ con x = −1. Camino B, el porqué: n·ln(1 − 1/n) = −1 − 1/(2n) − 1/(3n²) − … → −1. Debajo, la cota en una línea: e⁻¹(1 − 1/n) ≤ (1 − 1/n)ⁿ ≤ e⁻¹. Derecha (880×460): Lineas con eje x logarítmico de n = 1 a 100 000 (rótulos 1, 10, 100, 1 000, 10 000, 100 000) y eje y de 0 a 0.40. Puntos de (1 − 1/n)ⁿ en n = 1, 2, 3, 5, 10, 20, 50, 100, 400, 1 000, 10 000 y 100 000; línea discontinua en e⁻¹ = 0.3679; y la banda entre las dos cotas sombreada en rojo tenue.

- Animación: Los puntos aparecen de izquierda a derecha cada 120 ms y la banda se angosta con ellos; el último queda pegado a la asíntota.
- Interacción: ninguna
- Frase clave: La sucesión sube hacia e⁻¹ ≈ 0.368 sin pasarse, y el error es menor que e⁻¹/n.

**Paso 2 (caso).** En el encabezado aparece 'Caso · Adult · 3 variables'. En la gráfica se resaltan dos puntos con rótulo. n = 400 (las personas de la 10): (399/400)⁴⁰⁰ = 0.36742, a 0.00046 de e⁻¹, con cota de 0.00092. n = 10 000 (entrenamiento de Adult-3D): 0.36786. A la izquierda, en 30 px: 'De 400 personas, en promedio 400·(399/400)⁴⁰⁰ ≈ 147 quedan fuera de cada muestra y ≈ 253 entran. La muestra sigue teniendo 400 filas: hay repetidas.'

- Animación: Los dos puntos crecen de 4 a 9 px de radio y sus rótulos aparecen; los números cuentan hasta su valor.
- Interacción: ninguna
- Frase clave: Con 400 personas ya estamos a menos de una milésima del límite.

**Paso 3 (cierre).** Takeaway de 28 px: 'Cada árbol de bagging ve ≈ 63.2 % de las personas distintas; el ≈ 36.8 % que no vio es su examen gratis: el error OOB (12).' Chips IrA 'volver a 10', 'ir a 12' y 'volver a 64'.

- Animación: Reveal.
- Interacción: chips IrA
- Frase clave: 1 − e⁻¹ ≈ 63.2 % adentro y e⁻¹ ≈ 36.8 % afuera: de ahí sale el OOB.

### Visuales

- **Tablero de sorteos** (svg, nuevo: TableroSorteos): Cuadrícula de n×n (n = 5) con el renglón de una pelota resaltado y el factor 4/5 por columna.
- **Recordatorio de independencia** (texto, Recap (existente)): Una frase: la probabilidad de eventos independientes es el producto.
- **Convergencia a e⁻¹ con su banda** (svg, nuevo: Lineas (escala 'log' en x, bandas)): Eje x logarítmico, puntos de la sucesión, asíntota discontinua y banda entre las cotas.
- **Derivación** (formula, TeX (existente)): Los dos caminos al límite y la cota.

### Datos

- **producto_5** (ts-vivo): (1 − 1/5)⁵ = 1024/3125 = 0.32768. — *Cálculo:* Math.pow(4/5, 5). La fracción se arma con enteros: 4⁵ = 1024 y 5⁵ = 3125. — *Verificación:* Fraction(4,5)**5 en Python da 1024/3125 = 0.32768 (verificado).
- **sucesion** (ts-vivo): (1 − 1/n)ⁿ para n en {1, 2, 3, 5, 10, 20, 50, 100, 400, 1 000, 10 000, 100 000}. — *Cálculo:* Math.pow(1 − 1/n, n) en float64. — *Verificación:* Valores de Python: 0, 0.25, 0.296296, 0.32768, 0.348678, 0.358486, 0.364170, 0.366032, 0.367419, 0.367695, 0.367861, 0.367878 (verificado).
- **cotas** (ts-vivo): Cota inferior e⁻¹(1 − 1/n) y cota superior e⁻¹. — *Cálculo:* Math.exp(−1)·(1 − 1/n). — *Verificación:* console.assert de la desigualdad en cada n. Para n = 400: 0.366960 ≤ 0.367419 ≤ 0.367879 (Python).
- **fuera_400** (ts-vivo): Esperado de personas fuera de la muestra, n(1 − 1/n)ⁿ, con n = 400: 146.97. Distintas dentro: 253.03. — *Cálculo:* 400·Math.pow(399/400, 400). — *Verificación:* Python: 146.97 y 253.03 (verificado).
- **e_inv** (constante-de-libro): e⁻¹ = 0.3678794 y 1 − e⁻¹ = 0.6321206. — *Cálculo:* Math.exp(−1). — *Verificación:* math.exp(−1) en Python.

### Fórmulas

- `P(\text{no sale en un sorteo}) = 1-\tfrac{1}{n}`
- `P(\text{no sale en ninguno de los } n) = \left(1-\tfrac{1}{n}\right)^{n}`
- `\left(1-\tfrac{1}{5}\right)^{5} = \tfrac{1024}{3125} = 0.32768`
- `\lim_{n\to\infty}\left(1+\tfrac{x}{n}\right)^{n} = e^{x} \;\Rightarrow\; \left(1-\tfrac{1}{n}\right)^{n} \to e^{-1} \approx 0.3679`
- `n\ln\!\left(1-\tfrac{1}{n}\right) = -1-\tfrac{1}{2n}-\tfrac{1}{3n^{2}}-\cdots`
- `e^{-1}\left(1-\tfrac{1}{n}\right) \le \left(1-\tfrac{1}{n}\right)^{n} \le e^{-1}`
- `\mathbb{E}[\#\text{fuera}] = n\left(1-\tfrac{1}{n}\right)^{n},\qquad \mathbb{E}[\#\text{distintas}] = n\left[1-\left(1-\tfrac{1}{n}\right)^{n}\right]`

### Rigor

- Cota superior: ln(1 − u) ≤ −u, de donde n ln(1 − 1/n) ≤ −1. Cota inferior: ln(1 − u) ≥ −u/(1 − u), de donde (n − 1) ln(1 − 1/n) ≥ −1 y entonces (1 − 1/n)ⁿ ≥ e⁻¹(1 − 1/n). Las dos valen para todo n ≥ 1.
- La sucesión crece y se acerca por debajo. La diferencia real es ≈ e⁻¹/(2n) (0.00046 con n = 400), la mitad de la cota.
- El 63.2 % es de personas distintas. La muestra bootstrap tiene n filas, con repeticiones.
- El esperado de personas fuera es exacto por linealidad de la esperanza (suma de indicadores), aunque los eventos de distintas personas no sean independientes entre sí.
- La independencia que se usa es entre sorteos, no entre personas.

### Riesgos

- El camino B usa la serie de Taylor de ln. Si el público no la conoce, el centro es el camino A (definición de e) y el B se presenta como el porqué.
- Si se llega desde la 10, su contador simulado tiende a 0.3674 con n = 400, no exactamente a e⁻¹. Hay que decirlo para que no parezca contradicción.
- En el eje logarítmico se rotulan las potencias de 10 de forma explícita.

## R2 · AdaBoost es boosting con pérdida exponencial

- **Objetivo:** Que se vea que las reglas de AdaBoost (pesos e^{−yF} y α = ½ ln((1−ε)/ε)) no son arbitrarias: salen de minimizar la pérdida exponencial agregando un clasificador a la vez. Y que eso explica su sensibilidad a etiquetas equivocadas.
- **Estado:** nueva · **Duración:** 90 s

### Pasos

**Paso 0 (concepto).** SlideFrame con sección ['Respaldo', 'D. Boosting'] y número 'R2 · respaldo'. Título 'AdaBoost es boosting con pérdida exponencial'. Lede: 'Las reglas de AdaBoost parecen inventadas. Salen de una sola decisión: medir el error con e^{−yF}.' Izquierda (700 px): Recap 'Recordatorio · margen', con el texto 'con y ∈ {−1, +1} y F(x) = Σ αₘhₘ(x), el margen y·F(x) es positivo si el comité acierta, y más grande cuanto más seguro está'. Derecha (900×460): PerdidasMargen con eje x de margen de −2 a 4 y eje y de 0 a 4.5. Muestra el escalón 0–1 en gris claro, e^{−m} en rojo y, en gris tenue discontinuo, la log-loss escalada ln(1 + e^{−2m})/ln 2 (la que usa GB, 21). Un marcador vertical arrastrable muestra los tres valores en mono.

- Animación: Primero se dibuja el escalón; luego la exponencial encima (0.8 s); al final aparece la log-loss tenue.
- Interacción: Deslizador del margen (ratón o ↑ ↓) que mueve el marcador y lee L₀₋₁, e^{−m} y la log-loss en ese punto.
- Frase clave: e^{−m} siempre queda por encima del error 0–1: bajarla obliga a bajar el error.

**Paso 1 (concepto).** La gráfica se pasa a la derecha a 560 px. A la izquierda aparecen 5 renglones de álgebra en KaTeX de 28 px. (a) Agregar αh al comité minimizando la pérdida. (b) Se factoriza wᵢ = e^{−yᵢF_{m−1}(xᵢ)}, con el rótulo 'los pesos de AdaBoost aparecen solos' y wᵢ en rojo. (c) Se separa en aciertos y errores: (Σw)[e^{−α}(1−ε) + e^{α}ε]; con α > 0, lo mejor es el h de menor error ponderado ε. (d) Se deriva y se iguala a 0: α = ½ ln((1−ε)/ε), con α en rojo. (e) Actualización wᵢ ← wᵢ e^{−αyᵢh(xᵢ)}: los errores se multiplican por e^{α} y los aciertos por e^{−α}. Nota mono abajo: 'la condición de (d) equivale a esto: con los pesos nuevos, el clasificador recién agregado queda con error exactamente 50 %; el siguiente tiene que aprender algo nuevo'.

- Animación: Cada renglón entra 0.6 s después del anterior, dentro del mismo paso. Los términos que pasan de un renglón al siguiente se resaltan un momento.
- Interacción: ninguna
- Frase clave: Los pesos y el α de AdaBoost son la solución de minimizar e^{−yF} un clasificador a la vez.

**Paso 2 (caso).** En el encabezado aparece 'Caso · Adult · 3 variables'. Arriba, PerdidasMargen grande (1500×380) con las 400 personas visibles de Adult-3D como puntos sobre la curva e^{−m}: x = yᵢF_M(xᵢ) y altura = e^{−yᵢF_M(xᵢ)}. Rojo = gana > 50K y gris = no; el tamaño es proporcional al peso de AdaBoost en la ronda siguiente. Abajo, un deslizador M de 1 a 100 rondas y una lectura en mono: 'ronda M · error de entrenamiento · pérdida exponencial promedio'. Nota: 'entrenado con las 400 que ves; stumps con Gini ponderado, como sklearn'.

- Animación: Al mover M, los puntos se deslizan por la curva (resorte de 0.4 s). Con M = 1 solo hay dos grupos: aciertos en +α₁ y errores en −α₁.
- Interacción: Deslizador M (ratón o ↑ ↓) y chip 'reproducir', que avanza M de 1 a 100 en 6 s.
- Frase clave: El peso de cada persona en la siguiente ronda es la altura de la curva en su margen.

**Paso 3 (caso).** La gráfica de margen se reduce arriba. Abajo, Lineas de 1500×300 con x = ronda (1 a 100) y y de 0 a 1. En gris, el error de entrenamiento 0–1 del comité; en rojo, la pérdida exponencial promedio (1/N)Σe^{−yF}. Sobre la roja, puntos huecos con ∏ₖ 2√(εₖ(1−εₖ)) que caen exactamente encima. Rótulos: en la ronda 1, 'ε₁ = 0.240 · error 0.240 · pérdida 0.854'; en la ronda 100, 'error 0.185 · pérdida 0.610'.

- Animación: Las dos curvas se dibujan juntas de la ronda 1 a la 100 en 2 s y los puntos de la identidad aparecen sobre la roja.
- Interacción: ninguna
- Frase clave: AdaBoost baja una cota suave del error, y la baja en cada ronda sin excepción.

**Paso 4 (cierre).** Dos consecuencias en dos columnas de 24 px. (1) 'Lo que estima: F*(x) = ½ ln[P(y=1|x)/P(y=−1|x)], la mitad del log-momio. Por eso clasificar con el signo de F es lo mejor posible si F es correcta.' (2) 'El costo: un margen muy negativo pesa e^{|m|}, así que una etiqueta equivocada puede dominar. Con log-loss (GB, 21) el castigo crece solo linealmente.' Nota mono: 'sklearn (SAMME, K = 2) usa α = ln((1−ε)/ε), el doble: mismas predicciones y mismos pesos normalizados'. Chips IrA 'volver a 19', 'ir a 21' y 'volver a 64'.

- Animación: Reveal escalonado. En la gráfica de pérdidas mini, a la derecha, se resalta la zona m < −1, donde la exponencial se separa de la log-loss.
- Interacción: chips IrA
- Frase clave: Es la misma idea que Gradient Boosting con otra pérdida, y la exponencial es más sensible al ruido.

### Visuales

- **Pérdidas contra margen** (svg, nuevo: PerdidasMargen (sobre Lineas)): Escalón 0–1, e^{−m} y log-loss escalada, con marcador arrastrable; en el caso, las 400 personas como puntos sobre la curva.
- **Recordatorio de margen** (texto, Recap (existente)): y ∈ {−1, +1} y margen y·F(x).
- **Derivación por etapas** (formula, TeX (existente)): 5 renglones con wᵢ y α en rojo.
- **Error y pérdida exponencial por ronda** (svg, nuevo: Lineas): Dos curvas de 100 rondas y puntos de la identidad ∏Zₖ.

### Datos

- **curvas_perdida** (ts-vivo): L₀₋₁(m) = 1[m < 0], L_exp(m) = e^{−m} y L_log(m) = ln(1 + e^{−2m})/ln 2. — *Cálculo:* Funciones analíticas evaluadas en 400 puntos de [−2, 4]. — *Verificación:* L_exp(0) = L_log(0) = 1 y L_exp ≥ L₀₋₁ en todo el rango (console.assert).
- **adaboost_400** (ts-vivo): AdaBoost discreto binario con stumps (Gini ponderado), 100 rondas, sobre las 400 personas de adult3d.json → vista. Por ronda: εₖ, αₖ = ½ ln((1−εₖ)/εₖ), pesos, F, error de entrenamiento y pérdida exponencial. Valores esperados: ε₁ = 0.2400, ε₂ = 0.2887, ε₃ = 0.3444; error 0.24 → 0.185 en M = 100; pérdida exponencial 0.8542 → 0.6095. — *Cálculo:* lib/adaboost.ts (compartida con 18–19) en el navegador; tarda menos de 50 ms. — *Verificación:* respaldo_adaboost.json, de sklearn AdaBoostClassifier(DecisionTreeClassifier(max_depth=1), n_estimators=100, random_state=42): estimator_errors_ debe coincidir con εₖ, estimator_weights_/2 con αₖ y 1 − staged_score con el error. Ya se comprobó en Python que una implementación binaria con stumps de sklearn coincide en las 100 rondas (np.allclose).
- **identidad_cota** (ts-vivo): (1/N)Σe^{−yᵢF_M(xᵢ)} = ∏_{k≤M} 2√(εₖ(1−εₖ)). — *Cálculo:* Las dos expresiones se calculan por separado en TS. — *Verificación:* Coinciden a 1e−12 en Python (0.854166 en M = 1 y 0.609547 en M = 100). En TS va con console.assert.
- **margenes_400** (ts-vivo): yᵢF_M(xᵢ) de cada una de las 400 personas: de −0.576 a 0.576 en M = 1 y de −1.37 a 4.38 en M = 100. — *Cálculo:* Producto de y (±1) por F acumulado en lib/adaboost. — *Verificación:* Con M = 1 hay solo dos valores, ±α₁ (verificado en Python).
- **eps_despues** (ts-vivo): Error ponderado del último clasificador evaluado con los pesos actualizados: 0.5 en todas las rondas. — *Cálculo:* Σ de pesos nuevos sobre los mal clasificados por hₖ. — *Verificación:* Python: 0.5 exacto en las rondas 1, 2, 10 y 100 (verificado).

### Fórmulas

- `L(y,F) = e^{-yF},\qquad y\in\{-1,+1\}`
- `(\alpha_m, h_m) = \arg\min_{\alpha,h} \sum_{i} e^{-y_i\left[F_{m-1}(x_i) + \alpha\, h(x_i)\right]}`
- `= \sum_i {\color{#e5383b} w_i^{(m)}}\, e^{-\alpha\, y_i h(x_i)},\qquad w_i^{(m)} = e^{-y_i F_{m-1}(x_i)}`
- `= \Big(\sum_i w_i\Big)\left[e^{-\alpha}(1-\varepsilon) + e^{\alpha}\varepsilon\right],\qquad \varepsilon = \frac{\sum_i w_i\,\mathbb{1}[y_i\ne h(x_i)]}{\sum_i w_i}`
- `\frac{\partial}{\partial\alpha} = 0 \;\Rightarrow\; e^{2\alpha} = \frac{1-\varepsilon}{\varepsilon} \;\Rightarrow\; {\color{#e5383b}\alpha_m = \tfrac12 \ln\frac{1-\varepsilon_m}{\varepsilon_m}}`
- `w_i^{(m+1)} = w_i^{(m)}\, e^{-\alpha_m y_i h_m(x_i)}`
- `\frac{1}{N}\sum_{i} \mathbb{1}[y_i F_M(x_i) < 0] \;\le\; \frac{1}{N}\sum_{i} e^{-y_i F_M(x_i)} \;=\; \prod_{k=1}^{M} 2\sqrt{\varepsilon_k(1-\varepsilon_k)}`
- `F^{*}(x) = \tfrac12 \ln\frac{P(y=1\mid x)}{P(y=-1\mid x)}`
- `\alpha^{\text{SAMME}} = \ln\frac{1-\varepsilon}{\varepsilon} + \ln(K-1) \overset{K=2}{=} 2\,\alpha`

### Rigor

- La versión binaria (y ∈ {−1, +1}, α = ½ ln((1−ε)/ε)) es el AdaBoost discreto de Freund y Schapire. sklearn usa SAMME, con α = ln((1−ε)/ε) + ln(K−1), que con K = 2 es el doble: F queda multiplicada por 2, con el mismo signo y los mismos pesos normalizados (corrección acordada).
- La equivalencia viene de Friedman, Hastie y Tibshirani (2000) y ESL §10.4. Para α > 0, minimizar e^{−α}(1−ε) + e^{α}ε sobre h es exactamente minimizar ε.
- (1/N)Σe^{−yF_M} = ∏Zₖ con Zₖ = 2√(εₖ(1−εₖ)) cuando cada α es el óptimo. Como e^{−m} ≥ 1[m < 0], el error de entrenamiento queda acotado por ∏Zₖ (Freund y Schapire 1997).
- Después de actualizar, el último clasificador tiene error ponderado exactamente ½; es la condición de primer orden reescrita (verificado: 0.5).
- En Adult-3D hay stumps que predicen la misma clase a ambos lados del corte (ronda 1: todos 'no', ε₁ = 0.24, la tasa de positivos). Así se comporta sklearn al cortar por Gini ponderado; no es un error y no se esconde.
- Robustez: para márgenes negativos, la exponencial crece como e^{|m|} y la log-loss como ~2|m|/ln 2 (ESL §10.6). No se afirma que AdaBoost sea siempre peor.
- F*(x) es el minimizador poblacional de E[e^{−yF} | x] (ESL ec. 10.16).

### Riesgos

- Álgebra de 5 renglones: como es respaldo se puede ir rápido, pero a 28 px y con color solo en wᵢ y α para no saturar.
- El stump ponderado de TS tiene que usar Gini ponderado y el mismo orden de desempate que sklearn. Si alguna ronda difiere por un empate, la verificación lo marca y se documenta como en el README.
- Escala: e^{−m} vale 7.4 en m = −2. Se recorta el eje y en 4.5 con una flecha 'sigue subiendo'; el margen más negativo en M = 100 es −1.37 (e^{1.37} = 3.95), así que cabe.
- Puntos encimados con el mismo margen: no se separan en vertical porque la altura es el valor; se usa opacidad 0.6.
- Depende de lib/adaboost.ts de la sección D. Si D define otra API, R2 se adapta; no se duplica el algoritmo.

## R3 · KPSS: la contraprueba de ADF

- **Objetivo:** Que se entienda que ADF y KPSS tienen hipótesis nulas opuestas, cómo mide KPSS que una serie se aleja de su media, y que se concluye con confianza solo cuando las dos pruebas coinciden.
- **Estado:** nueva · **Duración:** 90 s

### Pasos

**Paso 0 (concepto).** SlideFrame con sección ['Respaldo', 'F. Fundamentos de series'] y número 'R3 · respaldo'. Título 'KPSS: la contraprueba de ADF'. Lede: 'No rechazar una hipótesis no es confirmarla. Por eso conviene una segunda prueba que parta del lado contrario.' Dos columnas de 800 px. ADF: 'H₀: tiene raíz unitaria (no es estacionaria)' y 'si p < 0.05 → hay evidencia de que es estacionaria'. KPSS: 'H₀: es estacionaria alrededor de un nivel' y 'si p < 0.05 → hay evidencia de que no lo es'. Entre las dos, una flecha doble roja con 'nulas opuestas'. Debajo, un Recap de una línea: 'p < 0.05 → se rechaza H₀; p ≥ 0.05 → no se rechaza, que no es lo mismo que demostrarla'.

- Animación: Las columnas entran desde los lados (x ±30 px) y al final se dibuja la flecha.
- Interacción: ninguna
- Frase clave: ADF parte de 'no es estacionaria'; KPSS parte de 'es estacionaria'.

**Paso 1 (concepto).** Etiqueta 'Esquema · simulado (semilla 42)'. Dos paneles de 800×420 lado a lado: a la izquierda, ruido blanco de 144 datos; a la derecha, caminata aleatoria de 144 datos. Arriba de cada panel va la serie en gris claro con su media como línea fina. Abajo, uₜ = Sₜ/(√T σ̂_∞), la suma acumulada de desviaciones ya normalizada, como área roja tenue. Debajo de cada panel, η = promedio de uₜ² en mono de 26 px, sobre una regla horizontal con la marca crítica 0.463 (5 %). A la izquierda de la fila inferior, las fórmulas de Sₜ y η en KaTeX.

- Animación: Las series se dibujan (0.8 s). Luego el área de uₜ crece de izquierda a derecha y el marcador de η avanza por la regla hasta su valor.
- Interacción: ninguna
- Frase clave: KPSS acumula cuánto se aleja la serie de su media: si la suma se va muy lejos, no es estacionaria.

**Paso 2 (concepto).** Al centro, MatrizADFKPSS 2×2 con celdas de 380×190 px: renglones 'ADF rechaza' y 'ADF no rechaza', columnas 'KPSS rechaza' y 'KPSS no rechaza'. Rótulos de celda: 'estacionaria (coinciden)', 'no estacionaria (coinciden)' y dos 'discrepan'. Cada celda muestra dos porcentajes de 2 000 simulaciones con 144 datos: en gris, ruidos blancos; en rojo, caminatas aleatorias. Leyenda fija arriba. A la derecha, la lectura: 'KPSS detecta la caminata en X % de los casos y con ruido blanco da falsa alarma en Y %', con valores del JSON.

- Animación: Las barras horizontales de cada celda crecen hasta su porcentaje en 0.8 s.
- Interacción: ninguna
- Frase clave: Ninguna prueba acierta siempre; cuando las dos coinciden, la conclusión es mucho más segura.

**Paso 3 (caso).** En el encabezado aparece 'Caso · Pasajeros'. La misma matriz, sin porcentajes. Abajo, 4 fichas de 360×120: 'log y', 'Δ log y', 'Δ₁₂ log y' y 'Δ Δ₁₂ log y'. Cada una con mini sparkline y sus p-valores de ADF y de KPSS en mono; el de KPSS se muestra '< 0.01' o '> 0.10' cuando statsmodels solo da una cota. Nota mono: 'ADF: constante, rezagos por AIC · KPSS: nivel, rezagos auto · α = 0.05'.

- Animación: Cada ficha vuela a su celda según sus p-valores (layout, 0.6 s), una tras otra con 0.8 s de separación.
- Interacción: ninguna
- Frase clave: La serie se declara estacionaria cuando las dos pruebas coinciden.

**Paso 4 (cierre).** Las celdas de discrepancia muestran su texto: 'revisar: ¿hay tendencia determinista?, ¿falta diferenciar?, ¿son pocos datos?'. Nota gris: 'guía de statsmodels: si ADF no rechaza y KPSS no rechaza, puede ser estacionaria alrededor de una tendencia; si ADF rechaza y KPSS rechaza, puede ser estacionaria en diferencias'. Takeaway: 'Se diferencia hasta que las dos coinciden, y no más: sobrediferenciar crea autocorrelación artificial.' Chips IrA 'volver a 37', 'ir a 36' y 'volver a 64'.

- Animación: Reveal.
- Interacción: chips IrA
- Frase clave: Si discrepan, no se decide con una sola prueba.

### Visuales

- **Nulas opuestas** (texto, dentro de la diapositiva + Recap (existente)): Dos columnas con H₀ y lo que significa rechazar, más la flecha doble.
- **Mecanismo de KPSS** (svg, nuevo: SumaAcumulada): Serie arriba, uₜ normalizada como área abajo, y η sobre una regla con el valor crítico.
- **Matriz de decisión ADF × KPSS** (diagrama, nuevo: MatrizADFKPSS): Matriz 2×2 con porcentajes de simulación (paso 2) y fichas de pasajeros que se mueven a su celda (paso 3).
- **Fichas de transformaciones** (mixto, nuevo: Lineas (sin ejes) dentro de MatrizADFKPSS): Mini sparkline más los p-valores de ADF y de KPSS.
- **Fórmulas de KPSS** (formula, TeX (existente)): Sₜ, η, uₜ y σ̂²_∞.

### Datos

- **esquema_series** (python-json): Ruido blanco N(0,1) y caminata aleatoria (suma acumulada de N(0,1)), T = 144, numpy default_rng(42). Para cada una: KPSS de statsmodels (regression='c', nlags='auto') con estadístico, p, lags y críticos, y ADF (regression='c', autolag='AIC') con estadístico y p. — *Cálculo:* scripts/exportar_respaldo.py → respaldo_kpss.json. En TS, lib/kpss.ts recalcula Sₜ, uₜ, σ̂²_∞ y η con los lags exportados. — *Verificación:* |η_TS − stat_statsmodels| < 1e−10. Antes de entregar se emuló en numpy: con esta semilla, η ≈ 0.115 para el ruido y ≈ 0.348 para la caminata (8 rezagos). Si statsmodels confirma que la caminata no cruza 0.463, el texto lo dice tal cual.
- **simulacion_celdas** (python-json): 2 000 ruidos blancos y 2 000 caminatas de T = 144 (semilla 42). Para cada grupo, la fracción en cada una de las 4 celdas (α = 0.05) y las tasas de rechazo de KPSS y de ADF. — *Cálculo:* statsmodels adfuller y kpss en exportar_respaldo.py (unos segundos). — *Verificación:* En una emulación previa con numpy, KPSS rechazó la caminata en ≈ 78 % de los casos y el ruido en ≈ 4 %. El script reporta además el error estándar √(p(1−p)/2000) ≈ 0.009 y compara su η con una implementación numpy propia en 10 series.
- **pasajeros_pruebas** (python-json): ADF (estadístico, p, rezagos usados) y KPSS (estadístico, p, cota '<'/'>' o null, lags) de log y, Δ log y, Δ₁₂ log y y Δ Δ₁₂ log y de los pasajeros. — *Cálculo:* statsmodels sobre los datos de pasajeros.json, con el mismo cargador de la sección F. — *Verificación:* Los p de ADF deben ser los mismos que muestra la 37: misma función, mismo regression y autolag. Si la 37 usa otro ajuste, las dos leen el mismo JSON.
- **criticos_kpss** (constante-de-libro): Valores críticos de KPSS en nivel: 0.347 (10 %), 0.463 (5 %), 0.574 (2.5 %) y 0.739 (1 %). — *Cálculo:* Tabla 1 de Kwiatkowski et al. (1992), caso η_μ. — *Verificación:* Igual al dict crit que devuelve statsmodels.tsa.stattools.kpss (se guarda en el JSON y se compara).

### Fórmulas

- `\text{ADF: } H_0:\ \text{raíz unitaria}\qquad\qquad \text{KPSS: } H_0:\ \text{estacionaria en nivel}`
- `e_t = y_t - \bar y,\qquad S_t = \sum_{s=1}^{t} e_s`
- `\eta = \frac{1}{T^{2}\,\hat\sigma^{2}_{\infty}}\sum_{t=1}^{T} S_t^{2} = \frac{1}{T}\sum_{t=1}^{T} u_t^{2},\qquad u_t = \frac{S_t}{\sqrt{T}\,\hat\sigma_{\infty}}`
- `\hat\sigma^{2}_{\infty} = \frac{1}{T}\sum_{t=1}^{T} e_t^{2} + \frac{2}{T}\sum_{s=1}^{\ell}\Big(1-\frac{s}{\ell+1}\Big)\sum_{t=s+1}^{T} e_t\,e_{t-s}`
- `\text{se rechaza } H_0^{\text{KPSS}} \text{ al 5 \% si } \eta > 0.463`

### Rigor

- ADF: H₀ = raíz unitaria. KPSS: H₀ = estacionaria (corrección acordada). Cuando no se rechaza, nunca se dice 'se acepta'.
- statsmodels interpola el p-valor de KPSS en una tabla y, fuera de [0.01, 0.10], solo reporta la cota (con InterpolationWarning). Por eso se muestra '< 0.01' o '> 0.10', nunca como valor exacto.
- σ̂²_∞ usa kernel de Bartlett con ℓ igual a los lags que eligió statsmodels (nlags='auto', Hobijn et al. 1998). TS usa ese mismo ℓ y no lo recalcula.
- ADF y KPSS prueban raíz unitaria no estacional. Para la estacional (Δ₁₂) hay pruebas específicas, como OCSB o Canova-Hansen, que no se ven aquí; se menciona solo si alguien pregunta.
- La interpretación de las celdas que discrepan sigue la guía de statsmodels ('Stationarity and detrending (ADF/KPSS)'). Se presenta como guía, no como teorema.
- Si con la semilla 42 KPSS no detecta la caminata del esquema (con 144 datos pasa ~1 de cada 5 veces), el texto lo dice: es justo el argumento de la contraprueba. La semilla no se cambia para que salga bonito.
- Sobrediferenciar ruido blanco da autocorrelación de −0.5 en el rezago 1 (un MA(1) no invertible): por eso 'y no más'.

### Riesgos

- Hay que instalar statsmodels en .venv y la sección F tiene que generar pasajeros.json.
- La matriz con dos porcentajes por celda puede saturar: barra más número, solo 2 colores y leyenda fija.
- Las conclusiones dependen de regression ('c' o 'ct') y del número de rezagos; por eso la nota mono declara los ajustes.
- 5 pasos en un respaldo: si queda poco tiempo de preguntas, se salta del paso 0 al 3.

## R4 · Forward sin llegar a cero

- **Objetivo:** Que se vea por qué Forward sin protección da P(O) = 0 en secuencias largas (el float64 se queda sin números tan chicos) y cómo lo resuelven el escalamiento de Rabiner y el cálculo en logaritmos, con el mismo resultado.
- **Estado:** nueva · **Duración:** 85 s

### Pasos

**Paso 0 (concepto).** SlideFrame con sección ['Respaldo', 'H. HMM'] y número 'R4 · respaldo'. Título 'Forward sin llegar a cero'. Lede: 'Cada paso de Forward multiplica por probabilidades menores que 1. Después de cientos de pasos el número es tan chico que la computadora lo redondea a cero.' Izquierda (520 px): Recap 'Recordatorio · números en la computadora', con el texto 'un float64 guarda ~16 dígitos; el positivo normal más chico es 2.2 × 10⁻³⁰⁸ y el más chico de todos 4.9 × 10⁻³²⁴; debajo de eso, 0'. Derecha (1100×520): Lineas con x = t (1 a 1000) y y = log₁₀ P(o₁…oₜ) de 0 a −480. Rótulo del eje 'potencias de 10', con marcas en 10⁻¹⁰⁰, 10⁻²⁰⁰, 10⁻³⁰⁰ y 10⁻⁴⁰⁰. Dos líneas horizontales finas: 'mínimo normal' en −307.7 y 'mínimo absoluto' en −323.3; la franja entre ellas va sombreada con el rótulo 'subnormal: se pierde precisión'. Línea gris: Forward ingenuo en float64. Etiqueta: 'secuencia de 1 000 días simulada con el λ del clima'.

- Animación: La línea gris se dibuja desde t = 1 (3 s). En t = 686 cae vertical fuera de la gráfica con el rótulo rojo 't = 686: la computadora ya dice 0'.
- Interacción: ninguna
- Frase clave: El algoritmo es correcto; el problema es que el número no cabe en la máquina.

**Paso 1 (concepto).** Izquierda: Trellis con T = 3 (el ejemplo de la 60) y dos números por nodo: α arriba en gris de 18 px y α̂ abajo en blanco de 24 px. Bajo cada columna, su suma y c_t = 1/suma. Columna 1: (0.06, 0.24) → (0.2, 0.8), con suma 0.30. Columna 2: (0.184, 0.162) → (0.532, 0.468), con suma 0.346. Columna 3: (0.280, 0.0440) → (0.864, 0.136), con suma 0.3238. Derecha: las fórmulas de Rabiner en KaTeX de 28 px y 'P(O|λ) = 0.30 · 0.346 · 0.3238 = 0.03361, igual que en la 60'. Nota: 'α̂ₜ(j) = P(clima j hoy | lo visto hasta hoy)'.

- Animación: Columna por columna: se calcula α, se suma, se divide (los números se 'encogen' a α̂) y la suma vuela al producto de la derecha.
- Interacción: ninguna
- Frase clave: Se normaliza cada columna para que sume 1 y se guarda lo que se dividió: el producto de esas sumas es P(O).

**Paso 2 (concepto).** Izquierda: Forward en logaritmos y la función logsumexp, en KaTeX. Derecha: ejemplo en mono de 24 px. Ingenuo: 'ln(e⁻¹⁰⁰⁰ + e⁻¹⁰⁰¹) → e⁻¹⁰⁰⁰ = 0 → ln 0 = −∞'. Con logsumexp: '−1000 + ln(1 + e⁻¹) = −999.6867'. Abajo: 'Viterbi en logaritmos no necesita logsumexp: solo sumas y máximos.'

- Animación: Primero aparece el renglón ingenuo, con el 0 y el −∞ en rojo; después el de logsumexp.
- Interacción: ninguna
- Frase clave: Se resta el máximo antes de exponenciar: así nunca se exponencia algo diminuto.

**Paso 3 (caso).** En el encabezado aparece 'Caso · Clima · 1 000 días'. Vuelve la gráfica del paso 0 a todo lo ancho (1500×420): sobre la línea gris cortada aparece la roja, la del escalamiento, que llega hasta t = 1000 con log₁₀ P = −473.1. Debajo, una tabla de 5 renglones en mono de 22 px. Forward ingenuo: 0 (log = −∞). Escalamiento (Rabiner): ln P = −1089.355. Logaritmos (logsumexp): −1089.355. hmmlearn score: −1089.355. Viterbi en logaritmos: −1330.585, igual que hmmlearn decode.

- Animación: La línea roja se dibuja siguiendo a la gris y sigue sola después de t = 686 (2 s); los renglones de la tabla aparecen escalonados.
- Interacción: ninguna
- Frase clave: El mismo resultado, sin ceros: por eso las librerías reportan log-verosimilitud.

**Paso 4 (cierre).** Takeaway: 'hmmlearn hace Forward en logaritmos por omisión (o con escalamiento). Por eso su score es ln P(O|λ), un número negativo grande, y no P(O).' Chips IrA 'volver a 60', 'ir a 61' y 'volver a 64'.

- Animación: Reveal.
- Interacción: chips IrA
- Frase clave: En la práctica siempre se trabaja en logaritmos.

### Visuales

- **Recordatorio de float64** (texto, Recap (existente)): Límites de representación y desbordamiento por abajo.
- **Caída de P(o₁…oₜ) en escala log** (svg, nuevo: Lineas (eje y en log₁₀, líneas de referencia y bandas)): Línea ingenua que se corta en t = 686, línea escalada que llega a t = 1000 y franjas de los límites del float64.
- **Trellis con α y α̂** (diagrama, nuevo: Trellis (extraído de 60-forward-vs-viterbi.tsx)): El ejemplo T = 3 de la 60 con valores crudos y normalizados por nodo, y sumas por columna.
- **Fórmulas de escalamiento y logsumexp** (formula, TeX (existente)): Rabiner §V-A y Forward/Viterbi en logaritmos.
- **Tabla de resultados** (tabla, dentro de la diapositiva): Cuatro maneras de calcular ln P y Viterbi, frente a hmmlearn.

### Datos

- **secuencia_1000** (python-json): 1 000 observaciones muestreadas del λ del clima con numpy default_rng(42): 320 caminar, 356 comprar y 324 limpiar. También los estados reales, 558 L y 442 S. — *Cálculo:* exportar_respaldo.py → respaldo_hmm.json. — *Verificación:* TS recalcula los conteos y los compara con el JSON (console.assert).
- **forward_ingenuo** (ts-vivo): Σⱼ αₜ(j) en float64 sin protección. Primer subnormal en t = 653 y primer cero en t = 686. — *Cálculo:* lib/hmm.ts → forwardIngenuo(m, obs) devuelve la suma por t. — *Verificación:* Python con el mismo orden de operaciones dio 653 y 686 (verificado). Se guardan en el JSON y TS los compara.
- **logP_escalado** (ts-vivo): ln P(O|λ) con escalamiento de Rabiner para T = 1000: −1089.3552. — *Cálculo:* lib/hmm.ts → forwardScaled(m, obs).logP. — *Verificación:* hmmlearn CategoricalHMM con startprob_, transmat_ y emissionprob_ fijos: .score(obs) en el JSON, diferencia relativa < 1e−9. En numpy ya dio −1089.35519.
- **logP_log** (ts-vivo): ln P(O|λ) con logsumexp: el mismo valor. — *Cálculo:* lib/hmm.ts → forwardLog(m, obs).logP. — *Verificación:* Igual al escalado: diferencia de ~3e−12 en numpy.
- **viterbi_log** (ts-vivo): Log-probabilidad del mejor camino para T = 1000: −1330.5854. — *Cálculo:* lib/hmm.ts → viterbiLog(m, obs). — *Verificación:* hmmlearn .decode(obs, algorithm='viterbi'): logprob y camino guardados en el JSON.
- **t3_escalado** (ts-vivo): Para O = caminar, comprar, limpiar: α̂₁ = (0.2, 0.8), α̂₂ = (0.5318, 0.4682) y α̂₃ = (0.8640, 0.1360); sumas 0.30, 0.346 y 0.32381; producto 0.033612. — *Cálculo:* forwardScaled sobre el λ de la 60. — *Verificación:* El producto es igual a Σⱼα₃(j) de forward() (existente) a 1e−15, y ln 0.033612 = −3.39287 es el score de hmmlearn para T = 3 (en el JSON).
- **limites_float** (constante-de-libro): Mínimo normal 2⁻¹⁰²² ≈ 2.2251 × 10⁻³⁰⁸ y mínimo subnormal 2⁻¹⁰⁷⁴ ≈ 4.94 × 10⁻³²⁴ (IEEE 754). — *Cálculo:* 2 ** −1022 y Number.MIN_VALUE en TS; sus log₁₀ dan −307.65 y −323.31. — *Verificación:* sys.float_info.min = 2.2250738585072014e−308 y 5e−324 en Python (verificado).
- **lse_ejemplo** (ts-vivo): LSE(−1000, −1001) = −999.68674, mientras que exp(−1000) = 0 en float64. — *Cálculo:* −1000 + Math.log1p(Math.exp(−1)) y Math.exp(−1000). — *Verificación:* Python: −999.6867383 y 0.0 (verificado).

### Fórmulas

- `\alpha_t(j) = \Big[\sum_i \alpha_{t-1}(i)\,a_{ij}\Big]\, b_j(o_t)`
- `\tilde\alpha_t(j) = \Big[\sum_i \hat\alpha_{t-1}(i)\,a_{ij}\Big]\, b_j(o_t),\qquad c_t = \frac{1}{\sum_j \tilde\alpha_t(j)},\qquad \hat\alpha_t(j) = c_t\,\tilde\alpha_t(j)`
- `\log P(O\mid\lambda) = -\sum_{t=1}^{T} \log c_t`
- `\hat\alpha_t(j) = P(q_t = j \mid o_1,\ldots,o_t,\lambda)`
- `\log\alpha_t(j) = \log b_j(o_t) + \operatorname{LSE}_i\big(\log\alpha_{t-1}(i) + \log a_{ij}\big)`
- `\operatorname{LSE}(x_1,\ldots,x_N) = m + \log\sum_{i} e^{x_i - m},\qquad m = \max_i x_i`
- `\log\delta_t(j) = \log b_j(o_t) + \max_i\big(\log\delta_{t-1}(i) + \log a_{ij}\big)`

### Rigor

- Se usa la notación de Rabiner (1989, §V-A): c_t es el inverso de la suma, por eso log P = −Σ log c_t. En pantalla se usa solo esta convención.
- α̂ₜ(j) es la probabilidad filtrada P(qₜ = j | o₁…oₜ), y el producto de las sumas es P(O|λ) exacto, no una aproximación.
- Límites del float64: mínimo normal 2⁻¹⁰²² ≈ 2.2251 × 10⁻³⁰⁸ y mínimo subnormal 2⁻¹⁰⁷⁴ ≈ 4.94 × 10⁻³²⁴.
- El t de desbordamiento depende de la secuencia: se calcula en vivo y se compara con Python, no se escribe a mano.
- hmmlearn tiene el parámetro implementation, con 'log' por omisión y 'scaling' como opción; score devuelve ln P(O|λ).
- Viterbi en logaritmos da el mismo camino que en probabilidades porque log es creciente.

### Riesgos

- Un eje y de 0 a −480 en log₁₀ puede leerse como probabilidad negativa. Por eso se rotula 'potencias de 10' con marcas 10⁻¹⁰⁰ … 10⁻⁴⁰⁰.
- Trellis con dos números por nodo: α a 18 px como mínimo. Si no cabe, α se muestra solo mientras se calcula y luego queda α̂.
- hmmlearn solo se necesita para generar el JSON de verificación; en ejecución la diapositiva no depende de él.
- Tolerancia de la comparación entre TS y hmmlearn: relativa de 1e−9, porque el orden de las sumas cambia.
- Para reusar Trellis hay que extraerlo de la 60, que es de la sección H. Si H no lo extrae, se extrae aquí sin cambiar cómo se ve la 60.

## Componentes nuevos propuestos

- **Receta** — La receta Datos → Modelo → Validación → Métrica en dos modos: completo (definiciones y dibujos de líneas) y franja de 64 px con bloques activos. Así la 3 y la 62 se ven iguales y el cierre se reconoce. · API: { modo: 'completo' | 'franja'; activo?: ('datos'|'modelo'|'validacion'|'metrica')[]; contenido?: Partial<Record<Bloque, ReactNode>>; paso?: number } · usado en: 3, 62, 26 (opcional), 30 (opcional), 48 (opcional)
- **Particiones** — Dibujo SVG de cómo se separan los datos: k-fold, estratificado o no, con barajado, pliegues y rondas animadas; partición temporal; secuencias completas. Sirve para el esquema de 20 elementos y para los tamaños reales. · API: { tipo: 'kfold' | 'temporal' | 'secuencias'; k: number; elementos?: number; marcados?: number[]; tamanos?: number[]; positivos?: number[]; fase?: 'lista' | 'barajada' | 'pliegues' | 'rondas'; ronda?: number; prueba?: { desde: string; hasta: string }; semilla?: number; ancho: number; alto: number; compacto?: boolean } · usado en: 3, 62, 12, 30
- **FichaPersona** — Muestra una fila real de Adult como ficha vertical: nombres en español, valores originales, faltantes resaltados, opción de ver los códigos enteros y la y al final. · API: { columnas: { clave: string; nombre: string; tipo: 'num' | 'cat' }[]; ejemplos: { crudo: Record<string, string | number | null>; codificado: Record<string, number>; y: 0 | 1 }[]; actual: number; onCambiar: (i: number) => void; codificada: boolean; onCodificada: (v: boolean) => void } · usado en: 3
- **BarraClases** — Barra apilada de la proporción de clases (76.1 % / 23.9 %) con conteos y crecimiento animado. · API: { positivos: number; total: number; etiquetas?: [string, string]; ancho: number; alto?: number; conteos?: boolean; animar?: boolean } · usado en: 2, 3, 62, 26
- **MapaExposicion + src/deck/estructura.ts** — Fuente única de la estructura: partes, secciones con rangos y palabras clave, y títulos cortos por diapositiva. Tiene dos modos: línea de metro (la 2) e índice navegable (la 64). Solo cuenta las diapositivas registradas, así que funciona igual en la versión corta. · API: MapaExposicion { modo: 'linea' | 'indice'; paso?: number; resaltar?: string[]; hilo?: boolean }. estructura.ts exporta partes: { id, nombre }[]; secciones: { id: string; nombre: string; parte: 'U7' | 'U8' | null; desde: number; hasta: number; claves: string[] }[]; cortos: Record<number | string, string> · usado en: 2, 64
- **IrA + DeckContext (cambios en Deck, SlideFrame y types)** — Saltar a una diapositiva con un clic durante las preguntas, y mantener las de respaldo fuera del flujo normal. SlideDef gana etiqueta?: string ('R1') y respaldo?: boolean; las de respaldo usan num 101–104. Deck da un contexto con irA y existe, escucha hashchange, no entra a respaldo con →/Espacio, Fin va a la 64 y la barra de progreso se limita a 100 %. SlideFrame acepta num: number | string y muestra 'R1 · respaldo'. · API: IrA { num: number; paso?: number | 'fin'; variante?: 'chip' | 'fila'; children: ReactNode } → <a href='#/num/paso'> con blur() al hacer clic. useDeck(): { irA(num: number, paso?: number | 'fin'): void; existe(num: number): boolean } · usado en: 62, 63, 64, R1, R2, R3, R4
- **Lineas** — Gráfica SVG de líneas genérica con el estilo del tema: ejes lineales o logarítmicos, varias series, bandas, líneas de referencia, puntos resaltados con rótulo y trazo animado. Se usa en lugar de escribir una gráfica distinta en cada diapositiva. · API: { ancho: number; alto: number; x: Eje; y: Eje; series: { id: string; puntos: [number, number][]; tono: 'rojo' | 'dato' | 'tenue'; grosor?: number; discontinua?: boolean; marcadores?: boolean }[]; bandas?: { inferior: [number, number][]; superior: [number, number][]; tono: 'rojo' | 'tenue' }[]; referencias?: { eje: 'x' | 'y'; valor: number; texto: string }[]; resaltar?: { x: number; y: number; texto: string }[]; hasta?: number; sinEjes?: boolean }, con Eje = { dominio: [number, number]; escala?: 'lin' | 'log'; ticks?: number[]; formato?: (v: number) => string; titulo?: string } · usado en: 2, 62, R1, R2, R3, R4
- **PuntosIntervalo** — Gráfica de puntos con bigotes (media ± desv) por modelo, con línea de referencia y modo barras. Muestra el F1-macro de los 7 modelos y los errores del pronóstico. · API: { filas: { etiqueta: string; media: number; desv?: number; resaltar?: boolean }[]; dominio: [number, number]; referencia?: { valor: number; texto: string }; modo?: 'puntos' | 'barras'; ancho: number; alto: number; animar?: boolean } · usado en: 62, 27 (opcional)
- **PerdidasMargen** — Curvas de pérdida contra margen (0–1, exponencial y log-loss escalada) con marcador arrastrable y, opcionalmente, puntos de personas reales sobre la curva con tamaño proporcional a su peso. · API: { curvas: ('01' | 'exp' | 'log')[]; dominio?: [number, number]; yMax?: number; margen?: number; onMargen?: (m: number) => void; puntos?: { m: number; y01: 0 | 1; peso: number }[]; resaltarNegativos?: boolean; ancho: number; alto: number } · usado en: R2, 21 (opcional, para contrastar exponencial y log-loss)
- **SumaAcumulada** — Mecanismo de KPSS: la serie con su media, uₜ = Sₜ/(√T σ̂_∞) como área y η sobre una regla con el valor crítico. · API: { serie: number[]; nlags: number; critico: number; titulo: string; tono: 'dato' | 'rojo'; paso: number; ancho: number; alto: number } · usado en: R3, 37 (opcional)
- **MatrizADFKPSS** — Matriz de decisión 2×2 (ADF rechaza o no × KPSS rechaza o no). Muestra porcentajes de simulación y fichas de transformaciones que se mueven a su celda. · API: { alfa: number; porcentajes?: { ruido: [number, number, number, number]; caminata: [number, number, number, number] }; fichas?: { id: string; nombre: string; serie: number[]; adf_p: number; kpss_p: number; kpss_cota: '<' | '>' | null }[]; visibles?: number; mostrarTextos?: boolean } · usado en: R3
- **Trellis (extraído de 60-forward-vs-viterbi.tsx)** — La rejilla estados × tiempo de Forward y Viterbi como componente, con valores por nodo (uno o dos números), aristas (todas o solo las ganadoras), camino resaltado y columnas visibles. · API: { estados: string[]; obs: string[]; valores: number[][]; secundarios?: number[][]; columnas: number; aristas?: 'todas' | { ganadoras: number[][] }; camino?: number[]; pieColumna?: string[]; formato?: (v: number) => string; ancho?: number; alto?: number } · usado en: 58, 59, 60, R4
- **TableroSorteos** — Cuadrícula de n×n (pelotas × sorteos) con una pelota resaltada y la probabilidad de no salir por columna. Muestra por qué (1 − 1/n)ⁿ es un producto. · API: { n: number; resaltada: number; columnasVisibles: number; ancho: number; alto: number } · usado en: R1, 10 (opcional)
- **lib/hmm.ts (ampliación)** — Forward con escalamiento de Rabiner, Forward y Viterbi en logaritmos, logsumexp y Forward ingenuo con traza, para mostrar el desbordamiento. · API: forwardScaled(m, obs): { alphaHat: number[][]; c: number[]; logP: number }; forwardLog(m, obs): { logAlpha: number[][]; logP: number }; viterbiLog(m, obs): { logDelta: number[][]; psi: number[][]; path: number[]; logBest: number }; logSumExp(xs: number[]): number; forwardIngenuo(m, obs): number[] (suma de α por t, en float64 sin protección) · usado en: R4, 61, 62
- **lib/kpss.ts** — Estadístico KPSS en nivel con varianza de largo plazo de Bartlett, para recalcular en vivo lo que da statsmodels y dibujar Sₜ. · API: kpss(x: number[], nlags: number): { e: number[]; S: number[]; u: number[]; sigma2: number; eta: number } · usado en: R3
- **lib/adaboost.ts + stump ponderado en lib/tree.ts (compartido con la sección D)** — AdaBoost discreto binario con stumps elegidos por Gini ponderado, como sklearn. Expone por ronda todo lo que necesitan las diapositivas 18, 19 y R2. · API: fitStumpPonderado(X, y01, w, idx?): { feature: number; threshold: number; izquierda: -1 | 1; derecha: -1 | 1 }; adaboost(X, y01, M, idx?): { feature: number; threshold: number; eps: number; alpha: number; pesos: number[]; F: number[]; errorEntrenamiento: number; perdidaExp: number }[] · usado en: 18, 19, R2
- **src/deck/meta.ts y src/lib/formato.ts** — meta.ts guarda los datos reales de la portada y de la 64 (equipo, grupo, profesor, fecha) que escribe el usuario. formato.ts es un formateador común: miles con espacio fino ('48 842') y punto decimal. La 20 hoy usa toLocaleString('es-MX') y escribe '48,842'. · API: meta: { equipo: string[]; grupo?: string; profesor?: string; fecha?: string }; entero(n: number): string; pct(v: number, d?: number): string; num(v: number, d?: number): string · usado en: 1, 2, 3, 62, 64, R1, R2, R3, R4

## Datos nuevos propuestos

- **src/data/adult_muestra.json** — { n: 48842, positivos: 11687, columnas: [{ clave, nombre (español), tipo: 'num' | 'cat' }] ×14, faltantes: { workclass: 2799, occupation: 2809, 'native-country': 857 }, filas_con_faltante: 3620, ejemplos: [{ indice: 0 | 2 | 4, y, crudo: { 14 valores, faltante = null }, codificado: { 14 valores tras preprocesador() } }], pliegues: [{ n_prueba, n_entrenamiento, positivos_prueba }] ×5 }. Los ejemplos se eligen así: la primera fila con y=0, la primera con y=1 y la primera con workclass faltante. Los pliegues salen de StratifiedKFold(5, shuffle=True, random_state=42): pruebas de 9769, 9769, 9768, 9768 y 9768 con 2338, 2338, 2337, 2337 y 2337 positivos. · script: scripts/exportar_apertura.py (nuevo; ~60 líneas; lo corre el usuario: .venv/Scripts/python scripts/exportar_apertura.py) · dependencias: scripts/adult_comun.py (cargar_adult, preprocesador, SEED) y la caché de OpenML en scripts/cache. No hace falta instalar nada.
- **src/data/respaldo_adaboost.json** — { M: 100, n: 400, rondas: [{ feature, threshold, eps, alpha_samme, error_entrenamiento }] ×100 } de sklearn AdaBoostClassifier(DecisionTreeClassifier(max_depth=1), n_estimators=100, random_state=42) sobre las 400 personas de adult3d.json → vista. Solo sirve para verificar lib/adaboost.ts: α_TS = alpha_samme/2. Si la sección D genera un archivo equivalente para 18–19, se reusa y este no se crea. · script: scripts/exportar_respaldo.py (nuevo), función adaboost() · dependencias: src/data/adult3d.json (existente) y scikit-learn 1.9.1 (ya instalado).
- **src/data/respaldo_kpss.json** — { esquema: { semilla: 42, T: 144, ruido: number[144], caminata: number[144], kpss: { ruido: { stat, p, lags }, caminata: { stat, p, lags } }, adf: { ruido: { stat, p }, caminata: { stat, p } } }, simulacion: { T: 144, reps: 2000, semilla: 42, alfa: 0.05, celdas_ruido: [4], celdas_caminata: [4], kpss_rechaza: { ruido, caminata }, adf_rechaza: { ruido, caminata } }, pasajeros: [{ id: 'log' | 'dlog' | 'd12log' | 'dd12log', nombre, serie: number[], adf: { stat, p, usedlag }, kpss: { stat, p, cota: '<' | '>' | null, lags } }], criticos_kpss: { '10%': 0.347, '5%': 0.463, '2.5%': 0.574, '1%': 0.739 }, ajustes: { adf: "regression='c', autolag='AIC'", kpss: "regression='c', nlags='auto'" } } · script: scripts/exportar_respaldo.py (nuevo), función estacionariedad() · dependencias: statsmodels, que hay que agregar con .venv/Scripts/pip install statsmodels, y los datos de pasajeros con el mismo cargador o pasajeros.json de la sección F. numpy (instalado).
- **src/data/respaldo_hmm.json** — { lambda: { pi, A, B } (el del clima), semilla: 42, T: 1000, obs: number[1000], estados: number[1000], hmmlearn: { score_T3: -3.39287, decode_T3: { logprob: -4.30952, path: [1, 0, 0] }, score_T1000: -1089.355, decode_T1000: { logprob: -1330.585, path: number[1000] } }, python_ingenuo: { primer_subnormal: 653, primer_cero: 686 } }. Los valores son los esperados según numpy; el script guarda los de hmmlearn. · script: scripts/exportar_respaldo.py (nuevo), función hmm_largo() · dependencias: hmmlearn, que hay que agregar con .venv/Scripts/pip install hmmlearn (CategoricalHMM con init_params='' y parámetros fijos). numpy (instalado).
- **src/data/series_resultados.json (contrato; lo genera la sección G)** — Lo mínimo que lee la 62: { modelo_final: string (p. ej. 'SARIMA(p,d,q)(P,D,Q)₁₂'), prueba: { desde: 'AAAA-MM', hasta: 'AAAA-MM', meses: number }, metricas: [{ modelo: 'SARIMA' | 'Ingenua estacional', mae, rmse, mape }], ljung_box: { lags: number, p: number }, criterio: 'AIC' }. Junto con src/data/pasajeros.json ({ fechas: string[144], valores: number[144] }, de la sección F), que usan la 2, la 62 y la R3. · script: scripts de las secciones F y G (no son de esta sección) · dependencias: statsmodels. Esta sección solo lee estos archivos: si no existen, sus celdas muestran texto sin números.
