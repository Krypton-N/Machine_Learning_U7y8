# Guía de estudio: fundamentos de series de tiempo y modelos de series (diapositivas 31 a 50)

Exposición de Aprendizaje Máquina, ESCOM-IPN. Unidad 7 (ensambles) y unidad 8 (datos secuenciales).
Este documento cubre la parte F, "Fundamentos de series" (diapositivas 31 a 40), y la parte G, "Modelos de series"
(diapositivas 41 a 50). Está escrito para estudiarse solo, de corrido, y para servir de fuente a resúmenes en audio.

---

## Cómo está organizado este documento

El documento tiene seis partes:

1. **Contexto previo.** Qué vio el público antes de la diapositiva 31: la parte de ensambles y el "puente" (29 y 30), donde
   se presenta el dataset de pasajeros aéreos y se explica por qué una serie no se valida igual que una tabla.
2. **El caso de estudio.** El dataset de pasajeros aéreos en detalle: de dónde sale, cómo llega, qué se le cambia y los
   números que hay que saberse.
3. **Bloque 1: diapositivas 31 a 35.** Qué es una serie, tendencia, estacionalidad, ciclo, ruido, descomposición aditiva o
   multiplicativa, y estacionariedad.
4. **Bloque 2: diapositivas 36 a 40.** Diferenciar, la prueba ADF, el promedio móvil, la autocorrelación (ACF) y la
   autocorrelación parcial (PACF).
5. **Bloque 3: diapositivas 41 a 45.** Ruido blanco y los modelos AR, MA, ARMA y ARIMA.
6. **Bloque 4: diapositivas 46 a 50.** Identificar el modelo con la ACF y la PACF, SARIMA, cómo elegir y evaluar (AIC,
   MAE, RMSE, MAPE, Ljung-Box), la línea base y la demostración completa.

Al final hay un hilo conductor que une todo, un glosario, las preguntas que probablemente hará el público con su
respuesta, y una tabla con los números clave.

De cada diapositiva se dice: la **idea central**, **qué aparece en pantalla en cada clic**, la **explicación desde cero**
de los conceptos, **lo que pasa en el caso de estudio** con sus números, y la **frase de cierre** que el público se tiene
que llevar.

Todos los números de este documento son los que salen en pantalla. La presentación no tiene números escritos a mano: los
calcula en el navegador a partir de los datos, y esos cálculos se comprobaron contra las bibliotecas de Python statsmodels,
numpy, scipy y scikit-learn. Si algún número de aquí no coincide con lo que se ve en la diapositiva, manda la diapositiva.

---

## Cómo funcionan las diapositivas (lo que hay que saber para presentarlas)

- **Cada diapositiva avanza por clics.** Cada clic agrega una sola idea. Primero se explica el concepto con un ejemplo
  pequeño, inventado y marcado en pantalla con la palabra **"Esquema"** (quiere decir: "esto es ilustrativo, no son datos
  reales"). En los últimos clics el concepto se aplica al caso de estudio y en el encabezado aparece la etiqueta
  **"Caso · Pasajeros aéreos"**.
- **Recuadros "Recordatorio".** Cuando un tema necesita un fundamento (qué es un p-valor, qué es una regresión, qué es una
  correlación), aparece un recuadro con borde rojo que lo explica en dos o tres líneas. Es para el público que no lo tiene
  claro.
- **El color tiene significado fijo.** El rojo marca lo que se quiere resaltar, los datos de prueba o lo que "sale" de lo
  normal (por ejemplo, las barras que salen de la banda en un correlograma). El gris claro es aquello contra lo que se
  compara.
- **Controles.** Algunas diapositivas tienen botones (por ejemplo "barajar", "otra muestra", "lineal / log") y otras usan
  las flechas ↑ y ↓ del teclado para mover un cursor o cambiar un valor sin pasar de clic. Las escenas en 3D se giran
  arrastrando, se acercan con la rueda del ratón y regresan a la vista inicial con doble clic.
- **Desde la diapositiva 41, el año 1960 está tapado** con un bloque gris que dice "PRUEBA · 1960". Se destapa solo cuando
  toca evaluar un pronóstico.

---

# Parte 1. Contexto previo: lo que el público ya vio

## La parte de ensambles (diapositivas 1 a 28)

La exposición tiene dos grandes partes. La primera, la unidad 7, trata de **ensambles**: cómo combinar muchos modelos para
obtener uno mejor que cualquiera de ellos. Su caso de estudio fue el dataset **Adult** (también llamado Census Income): 48,842
personas del censo de Estados Unidos, y se quería predecir si una persona gana más de 50 mil dólares al año. Solo el 23.9 %
gana más de 50K.

De esa parte importan, para lo que sigue, cuatro ideas que el público ya conoce:

1. **Un modelo se juzga con datos que no vio.** Se separan datos de entrenamiento (con los que el modelo aprende) y de
   prueba (con los que se le califica). La forma usada en Adult fue la **validación cruzada de 5 pliegues** (K-Fold): se
   parten los datos en 5 bloques, cada uno toma turno como prueba y se promedian los 5 resultados. Antes de partir, **las
   filas se barajan**.
2. **Sobreajuste.** Un modelo que memoriza el entrenamiento le va muy bien con lo visto y peor con lo nuevo.
3. **La línea base.** En Adult, decir siempre "no gana más de 50K" acierta el 76.1 % sin aprender nada. Esa regla tonta
   sirve de vara: un modelo solo aporta lo que le gane a ella. La misma idea regresa en la diapositiva 49 con pasajeros.
4. **Los resultados se reportan con media ± desviación entre pliegues**, y una diferencia más chica que la desviación no es
   concluyente.

La diapositiva 28 cierra la parte 1 con una pregunta: todo lo anterior supuso que las filas se pueden barajar. ¿Y si el
orden importa? De ahí sale la segunda parte, la unidad 8: **datos secuenciales**.

## El puente (diapositivas 29 y 30)

### Diapositiva 29 · El orden importa

**Idea central:** en una serie de tiempo el orden de los datos también es información, y barajarlos la destruye.

Empieza con un recordatorio de **i.i.d.**, que es lo que se supone en una tabla como Adult: los datos son
**independientes** (saber uno no cambia lo que esperas de otro) e **idénticamente distribuidos** (todos salen de la misma
urna). Si los datos son i.i.d., cualquier orden es igual de probable y barajarlos no quita nada.

Luego hay dos tiras de 24 barras, de esquema: 24 tiros de un dado, y una serie "con memoria" en la que cada valor es 0.9
veces el anterior más un empujón al azar. Con el botón **"barajar"**, el dado se ve igual de desordenado que antes (no había
nada que perder), pero la serie con memoria pierde sus subidas y bajadas: el orden era la información.

Después se presenta **el dataset de pasajeros tal como llega** (como el `head()` de pandas): dos columnas, `time` y
`value`, y 144 filas. Se explica de dónde sale, qué es cada columna y qué se le cambia (todo esto se detalla en la Parte 2
de este documento).

Al final, la serie de pasajeros completa con el mismo botón de barajar, y a su lado una gráfica de dispersión de "un mes
contra el mes siguiente". En el orden real, los puntos caen casi sobre una diagonal: la **correlación es 0.960** (cada mes
se parece mucho al anterior). Al barajar, la nube se deshace y la correlación queda cerca de cero.

**Frase de cierre:** "Barajar y K-Fold suponen que el orden no dice nada. En pasajeros el orden es parte del dato: los meses
cercanos se parecen y el nivel cambia con los años. Hay que validar de otra forma."

### Diapositiva 30 · Validación temporal

**Idea central:** en una serie, la prueba siempre tiene que ir después del entrenamiento, igual que cuando se pronostica de
verdad. Si no, hay **fuga de datos**.

Se define **fuga de datos**: información que no existiría al momento de predecir y que se cuela al entrenamiento.

Con 20 momentos de esquema se muestra un K-Fold barajado de 5 rondas. Una flecha roja señala el problema: para predecir el
momento 2, el modelo ya vio el 3. No es un caso raro: 14 de los 19 momentos tienen al siguiente en el entrenamiento de su
ronda. Barajar es entrenar con el futuro, y el error medido sale mejor de lo que será al pronosticar.

El diagrama se transforma en dos alternativas correctas:
- **Ventana creciente:** se entrena con todo lo anterior y se prueba con el bloque que sigue. Lo de después todavía no
  existe.
- **Origen móvil** (en inglés *walk-forward*): la ventana avanza un paso y se prueba solo el momento siguiente. Es lo más
  parecido a pronosticar de verdad. Esta idea regresa en la diapositiva 50.

**En el caso:** con los 144 meses, en un K-Fold barajado 117 de 143 meses tienen al mes siguiente en el entrenamiento. Con
la ventana creciente, ninguno. Luego, el mismo modelo se evalúa de las dos formas. Para esta demostración se entrena hasta
1958 y se pronostican 1959 y 1960 (24 meses). La métrica es el **MAE**: en promedio, por cuántos miles de pasajeros se
equivoca cada mes.

| Modelo | MAE barajado | MAE pronosticando |
|---|---|---|
| Random Forest (300 árboles; variables: número de mes y mes del año) | 26.2 (entre 23.6 y 38.1 en 20 barajados) | 67.2 |
| Regresión lineal (sobre el logaritmo: una recta para la tendencia y un ajuste fijo por mes) | 23.1 | 43.0 |

Barajado parece mucho mejor de lo que es. Además, un bosque nunca pronostica más alto que lo que ya vio: lo más que
pronostica es 469 mil, cuando 1960 llegó a 622. Y su pronóstico de 1960 es idéntico al de 1959.

**Frase de cierre:** "Barajado, el modelo solo rellena huecos entre meses que ya vio; pronosticar es ir más allá. La prueba
siempre va después. Describir la serie no es evaluar un modelo: desde la 41, 1960 se guarda como prueba y todo se decide con
1949–1959."

Esta última frase es importante para todo lo que sigue: **de la 31 a la 40 se usa la serie completa (144 meses) porque solo
se describe; desde la 41 se ajusta con 1949–1959 (132 meses) y 1960 queda guardado como prueba.**

---

# Parte 2. El caso de estudio: pasajeros aéreos 1949–1960

## De dónde sale

Es una de las series de tiempo más famosas de la estadística. Viene del libro clásico de series de tiempo de **Box y
Jenkins**, donde aparece como la **"serie G"**. También viene incluida en el lenguaje R con el nombre **AirPassengers**. Box
y Jenkins la usaron para proponer el modelo que en la diapositiva 47 se llama **"modelo de aerolínea"**.

## Qué es cada fila y cada columna

Cada fila es un **mes**, de enero de 1949 a diciembre de 1960: **144 filas**, 12 años completos. El archivo trae **dos
columnas**:

- **`time`**: el mes, escrito como año en decimal. Es el año más (mes − 1) / 12. Por ejemplo, 1949.000000 es enero de 1949 y
  1949.083333 es febrero de 1949.
- **`value`**: cuántos pasajeros volaron ese mes en aerolíneas internacionales, **en miles**. 112 quiere decir 112,000
  pasajeros.

Las primeras 5 filas, tal como llegan:

| time | value |
|---|---|
| 1949.000000 | 112 |
| 1949.083333 | 118 |
| 1949.166667 | 132 |
| 1949.250000 | 129 |
| 1949.333333 | 121 |

## Qué se quiere predecir

La misma columna `value`, pero de los meses que todavía no llegan. A diferencia de Adult, donde se predecía una columna a
partir de otras, aquí la variable se predice **a partir de su propio pasado**.

## Qué se le cambia

- `time` se cambia por un contador **t = 1, 2, …, 144** (y por año y mes cuando hace falta).
- `value` no se toca: se queda en miles.
- No hay nada que quitar: 144 filas, 12 años completos, ningún dato faltante.

## Los números que hay que saberse

- Mínimo: **104 mil** (noviembre de 1949). Máximo: **622 mil** (julio de 1960).
- Ejemplo de lectura: t = 79 es julio de 1955, con 364 mil pasajeros.
- El promedio de cada año sube de **126.7 mil (1949)** a **476.2 mil (1960)**: se multiplica por 3.8.
- El mes más alto de cada año es **siempre julio o agosto**, los 12 años.
- La "onda" del año (del mes más bajo al más alto) mide **44 mil en 1949** y **232 mil en 1960**: crece por 5.3, más que el
  nivel.
- **Desde la diapositiva 41**: se ajusta con 1949–1959 (**132 meses**) y **1960 (12 meses) es la prueba**.

---

# Parte 3. Bloque 1: diapositivas 31 a 35

Este bloque construye el vocabulario para hablar de una serie: qué es, qué patrones puede tener y qué quiere decir que una
serie sea "estable" (estacionaria). Al terminar, el público debe saber que pasajeros tiene tendencia, estacionalidad, una
onda que crece con el nivel, y que no es estacionaria.

## Diapositiva 31 · ¿Qué es una serie de tiempo?

**Idea central:** una sola variable vista a lo largo del tiempo. El lugar de cada medición es parte del dato.

**Clic 1 (concepto).** La definición: mediciones de **una misma variable**, ordenadas en el tiempo y, normalmente, tomadas a
intervalos regulares. Se escriben y₁, y₂, …, y_T. Tres términos:
- **Índice t:** el lugar de la medición (la primera, la segunda…). El dato no es solo "y": es el par (t, y).
- **Frecuencia:** cada cuánto se mide (cada hora, cada día, cada mes).
- **Horizonte h:** cuántos pasos adelante se quiere pronosticar.

A la derecha, un esquema de 8 puntos con una línea punteada roja que marca "hoy · T = 8" y tres casillas con signos de
interrogación: los 3 pasos que se quieren pronosticar (h = 3). Abajo, el contraste con la parte 1: en una **tabla** como
Adult cada fila es una persona y se pueden barajar; en una **serie** cada fila es un momento y el orden es dato.

**Clic 2 (caso).** La columna `value` de la diapositiva 29, acomodada en una tabla de 12 renglones (años) por 12 columnas
(meses). Así viene impresa en el libro de Box y Jenkins.

**Clic 3.** La tabla "vuela" y se desdobla en una línea de tiempo: la serie es esa tabla leída renglón por renglón, 144
meses en fila. La fórmula que convierte año y mes en t: t = 12 × (año − 1949) + mes.

**Clic 4.** Un cursor rojo sobre la línea (se mueve con ↑ ↓) que lee, por ejemplo, "t = 79 · jul 1955 · 364 mil". Se ven
T = 144, 12 mediciones por año, el mínimo 104 (noviembre de 1949) y el máximo 622 (julio de 1960). Al final de la línea
aparecen 12 casillas punteadas con la leyenda "1961 ?": lo que se quiere pronosticar.

**Frase de cierre:** "El dato es el par (t, y). Pronosticar es estimar lo que sigue usando solo lo que ya pasó."

## Diapositiva 32 · Tendencia y estacionalidad

**Idea central:** una serie puede hacer dos cosas a la vez: cambiar de nivel poco a poco (tendencia) y repetir un patrón
cada cierto tiempo (estacionalidad).

**Clic 1 (concepto).** Tres gráficas de esquema apiladas: una recta que sube (la tendencia), una onda que se repite cada 12
pasos (la estacionalidad) y su suma (la serie, en rojo). Las definiciones:
- **Tendencia:** hacia dónde va el nivel a largo plazo: sube, baja o se queda.
- **Estacionalidad:** un patrón que se repite cada periodo fijo, ligado al calendario. En fórmula, S en t + m es igual a S
  en t: lo que pasa en un mes se repite m pasos después. El periodo m puede ser 12 meses, 7 días o 24 horas.

Se aclara que aquí se sumaron, y que si se suman o se multiplican se decide en la 34.

**Clic 2 (caso).** Pasajeros con el promedio de cada año dibujado como un escalón rojo. **Tendencia:** el promedio sube de
126.7 a 476.2 mil, se multiplica por 3.8. **Estacionalidad:** cada año está marcado su mes más alto, y en los 12 años es
julio o agosto.

**Clic 3 (caso en 3D).** Barras en 3D: un eje es el mes, otro el año y la altura son los pasajeros. Es la tabla de la 31 con
alturas. Hay tres vistas con botones:
- **"Por meses"** (de frente): cada año es una silueta que sube hacia julio y agosto y vuelve a bajar. Es la misma forma
  cada vez más alta.
- **"Por años"** (de lado): cada mes es una rampa. Comparado con el mismo mes del año anterior, sube 127 de 132 veces.
- **"Libre"**: se gira arrastrando. Las barras rojas son el mes más alto de cada año.

**Clic 4.** El cierre y un aviso para la 34: la onda no mide siempre lo mismo. En 1949, del mes más bajo al más alto hay 44
mil pasajeros; en 1960, 232 mil.

**Frase de cierre:** "Tendencia: cómo cambia el nivel de un año a otro. Estacionalidad: la forma dentro del año, siempre en
los mismos meses."

## Diapositiva 33 · Ciclo, estacionalidad y ruido

**Idea central:** no todo lo que sube y baja es estacionalidad. Lo que la distingue es que se repite con el calendario.

**Clic 1 (concepto).** Tres definiciones:
- **Estacionalidad:** se repite cada periodo fijo y conocido (cada 12 meses, cada 7 días).
- **Ciclo:** sube y baja, pero cada vuelta dura distinto, por lo común más de dos años. Ejemplo típico: los ciclos
  económicos de auge y recesión.
- **Ruido:** lo que queda cuando se quitó todo lo que tiene patrón.

Abajo, dos series de esquema: A, estacional (cada vuelta dura 12 pasos), y B, cíclica (sus vueltas duran 14, 21, 10, 17 y
10 pasos).

**Clic 2.** Cada serie se "dobla" en renglones de 12, como un calendario. En la estacional, **los picos caen todos en una
sola columna**. En la cíclica, caen en columnas distintas. Esa es la prueba visual: si el pico cae siempre en el mismo lugar
del calendario, es estacionalidad.

**Clic 3 (caso).** Un mapa de calor de 12 × 12 de pasajeros: cada celda dice qué porcentaje queda ese mes por arriba (rojo)
o por abajo (gris) del promedio de su año. Los picos, con contorno, forman una franja vertical en julio y agosto. Junio,
julio, agosto y septiembre quedan por arriba del promedio de su año los 12 años (julio, entre 17 % y 31 % arriba;
noviembre, entre 13 % y 20 % abajo). Eso es estacionalidad.

¿Y un ciclo? Con 12 años de datos **no se puede distinguir de la tendencia**. Por eso los métodos clásicos los estiman
juntos, como una sola "tendencia-ciclo". (Punto fino: no hay que decir que pasajeros "no tiene ciclo"; hay que decir que con
12 años no se puede separar.) La tabla solo describe; todavía no separa nada.

**Clic 4 (cierre).** La fórmula **y = T + S + R** (tendencia, que incluye al ciclo; estacionalidad; ruido, la R de
"residuo"). O un producto en lugar de una suma: eso se decide en la 34. Al lado, ruido simulado: si de verdad no tiene
patrón, lo mejor que se puede pronosticar de él es su promedio. La 41 lo define con cuidado.

**Frase de cierre:** "Estacionalidad: el pico cae siempre en la misma columna del calendario. Ciclo: ninguna columna
funciona. Ruido: lo que sobra."

## Diapositiva 34 · Descomposición: aditiva o multiplicativa

**Idea central:** tendencia y estacionalidad se pueden combinar sumando o multiplicando. Se distingue viendo si la onda crece
con el nivel. En pasajeros es multiplicativa, y por eso se trabaja con el logaritmo.

**Clic 1 (concepto).** Dos esquemas lado a lado, con la misma tendencia:
- **Aditiva:** y = T + S. La onda mide siempre lo mismo; sus bordes son dos líneas paralelas.
- **Multiplicativa:** y = T × S. La onda crece en proporción al nivel: sus bordes se abren y forman un **embudo**.

**Clic 2 (caso).** Pasajeros con dos líneas punteadas rojas que unen el máximo y el mínimo de cada año: se ve el embudo. Al
lado, barras con el ancho de la onda de cada año. La onda pasa de 44 a 232 mil: se multiplica por **5.3**, mientras el
nivel se multiplica por **3.8**. Crece con el nivel (y un poco más): como en la multiplicativa.

**Clic 3.** Con el botón **"lineal / log"** la gráfica pasa a escala logarítmica y el embudo se vuelve casi una banda pareja.
En logaritmo, el ancho de la onda va de 0.35 a 0.47: se multiplica por 1.3 en lugar de 5.3. Aparece un recordatorio del
**logaritmo**: convierte multiplicaciones en sumas, log(T × S) = log T + log S. Crecer 10 % suma siempre lo mismo, sea de 100
a 110 o de 500 a 550. Por eso, en logaritmo, una onda que crece en proporción al nivel se vuelve una onda de tamaño fijo.

**Clic 4.** Cuatro paneles apilados, la descomposición clásica: la **observada**; la **tendencia** (el promedio de los 12
meses de alrededor, que se explica en la 38); la **estacional** (lo que se le suma a cada mes); y **lo que sobra**
(observada menos tendencia menos estacional). Primero en modo **aditivo**: a julio le suma siempre 63.8 mil, sea el año que
sea. En julio de 1949 eso da 190.6 contra 148 reales (se pasa); en julio de 1959 da 494.5 contra 548 reales (se queda corta).
Por eso, en lo que sobra quedó la onda: al revés al principio y al derecho al final. La tendencia no existe en los primeros
ni en los últimos 6 meses (hace falta medio año de cada lado para promediar).

**Clic 5.** Modo **multiplicativo**: a julio lo multiplica siempre por **1.227** (es decir, julio queda 22.7 % arriba de la
tendencia). En julio de 1949 da 155.5 y en julio de 1959 da 528.3, mucho más cerca de lo real. El error medio en los 132
meses donde hay tendencia: **aditiva 14.4 mil, multiplicativa 6.6 mil**.

**Clic 6 (cierre).** "En pasajeros la onda crece con el nivel: es multiplicativa. Para modelarla se usa el logaritmo (36, 37
y la sección G), que la vuelve casi aditiva. Casi: en logaritmo el ancho todavía pasa de 0.35 a 0.47."

## Diapositiva 35 · Estacionariedad

**Idea central:** una serie es estacionaria si su comportamiento promedio no depende de cuándo la mires. Pasajeros no lo es.

**Clic 1.** Recordatorio de **media** (el centro de los datos), **varianza** (qué tanto se alejan del centro; su raíz es la
desviación) y **covarianza** (si dos cosas suben y bajan juntas; dividida entre las dos desviaciones es la correlación,
entre −1 y 1). Y la definición: estacionaria, en sentido débil, quiere decir tres cosas para cualquier momento t:
1. La misma media: E[y_t] = μ.
2. La misma dispersión: Var(y_t) = σ².
3. El parecido entre dos momentos solo depende de cuánto están separados, no de dónde están: Cov(y_t, y_{t+k}) = γ(k).

**Clic 2 (esquema).** Aquí está el truco conceptual: la media y la dispersión de una serie, en teoría, se miden **a través
de muchas historias posibles**, no a lo largo de una sola. Se simula el mismo experimento 200 veces (se dibujan 40, una
resaltada) para dos procesos:
- **Estacionario:** cada valor = 0.7 × el anterior + un choque.
- **No estacionario:** un **paseo aleatorio** (o caminata aleatoria), que acumula todos los choques.

Un corte vertical rojo, que se mueve con ↑ ↓, toma los 200 valores de un mismo instante y dibuja su histograma. En la
estacionaria, el histograma no cambia al mover el corte (su desviación teórica es siempre 1.40). En el paseo, se abre cada
vez más (su desviación teórica es √t: crece con el tiempo).

**Clic 3.** Dos cortes separados 5 pasos, y una dispersión donde cada punto es una historia. En la estacionaria, el parecido
entre los dos cortes es el mismo en cualquier lugar (teórico 0.7⁵ ≈ 0.17). En el paseo, depende de dónde se corte.

**Clic 4 (caso).** "Solo tenemos una historia": de pasajeros solo existe un 1949–1960, así que se comparan ventanas de 12
meses. Es un diagnóstico, no una prueba. Barras con la media y la desviación de cada año, con botón original / log:
- Original: la media sube de 126.7 a 476.2 (×3.8) y la desviación de 13.7 a 77.7 (×5.7).
- En logaritmo: la desviación va de 0.108 a 0.157 (×1.4): casi se empareja. Pero la media del logaritmo sigue subiendo (de
  4.84 a 6.15).

**Clic 5 (cierre).** "Pasajeros no es estacionaria: la media sube cada año y, además, depende del mes. El logaritmo frena el
crecimiento de la dispersión (se multiplica por 1.4 en vez de por 5.7); para la media hace falta diferenciar (36)."

---

# Parte 4. Bloque 2: diapositivas 36 a 40

Este bloque da las herramientas para volver estacionaria la serie y para "leerla": diferenciar, comprobar con una prueba
estadística, suavizar, y medir cuánto se parece la serie a sí misma en el pasado. Al terminar, el público debe saber que
pasajeros se trabaja como logaritmo con dos diferencias (∇∇₁₂ log), y que lo que queda tiene dos "huellas", en el rezago 1 y
en el 12.

## Diapositiva 36 · Diferenciar: volver estacionaria una serie

**Idea central:** si la serie no es estacionaria, se transforma hasta que lo sea. La herramienta es una resta.

**Clic 1 (por qué).** Tres ideas en secuencia:
1. Los modelos de la sección G aprenden **números fijos**: una media, un peso para el valor anterior.
2. Esos números solo describen el futuro si la serie se comporta igual en cualquier tramo: si es estacionaria.
3. Si no lo es, se transforma hasta que lo sea. Al pronosticar, la transformación se deshace.

Una serie de juguete de 12 valores con la media de dos tramos marcada: la media cambia de un tramo a otro, no hay una sola
que aprender.

**Clic 2.** La **diferencia**: ∇x_t = x_t − x_{t−1}. El símbolo ∇ (nabla) se lee "diferencia": el valor de hoy menos el de
ayer. Si la serie sube lo mismo en cada paso más unos altibajos, x_t = a + b·t + e_t, entonces ∇x_t = b + (e_t − e_{t−1}):
la diferencia se queda con la subida b y con los altibajos. **Una subida constante se vuelve un nivel constante.** La
animación muestra la resta paso a paso sobre la serie de juguete.

**Clic 3.** La **diferencia estacional**: ∇_s x_t = x_t − x_{t−s}. El valor de hoy menos el del mismo momento del periodo
anterior. Lo que se repite igual cada periodo se cancela y queda solo lo que cambió de un periodo al siguiente. Se ilustra
con 3 años de 4 trimestres (s = 4). Para datos mensuales, s = 12.

**Clics 4 a 7 (caso, en 3D).** Una superficie año × mes del logaritmo de pasajeros. Con botones (y un clic cada uno) se le
aplican las transformaciones y la superficie se va aplanando:
- **log:** sube año con año (tendencia) y cada año repite el mismo pico, en julio y agosto (estacionalidad).
- **∇ log** (cambio contra el mes anterior): la inclinación entre años desaparece; en promedio se crece **+0.95 % por mes**.
  Pero la ondulación sigue: marzo, junio, julio y diciembre suben todos los años; septiembre, octubre y noviembre bajan
  todos los años.
- **∇₁₂ log** (cambio contra el mismo mes del año anterior): el patrón por mes se va. Queda el **crecimiento anual**, que no
  es parejo: alrededor de 16 % al año al principio y 12 % al final.
- **∇∇₁₂ log** (las dos diferencias): sin tendencia y sin patrón por mes, queda algo parecido a ruido alrededor de cero. Se
  pierden 13 meses (12 por la diferencia estacional y 1 por la normal): **quedan 131**.

Una nota útil: la diferencia en logaritmo es casi un porcentaje. log(hoy) − log(ayer) = log(hoy / ayer), y para cambios
chicos eso es aproximadamente el porcentaje de crecimiento.

**Frase de cierre:** "Logaritmo, una diferencia y una diferencia estacional. ¿Ya es estacionaria? Eso se pone a prueba en la
37."

## Diapositiva 37 · Prueba ADF: ¿la serie tiene raíz unitaria?

**Idea central:** una serie puede regresar a su media o acumular cada choque para siempre. La prueba ADF (Dickey-Fuller
aumentada) mide cuál de las dos cosas hace.

**Clic 1 (concepto).** Dos series simuladas con los mismos 150 choques:
- "Regresa a su media": cada valor = 0.5 × el anterior + un choque.
- "Raíz unitaria": cada valor = 1 × el anterior + un choque (una caminata aleatoria).

La fórmula general es x_t = φ·x_{t−1} + ε_t, donde ε (épsilon) es el choque de cada paso, al azar y con media 0, y φ (fi)
dice cuánto del valor anterior se conserva. Abajo, el efecto de un choque de +1 después de k pasos: con φ = 0.5 se
desvanece (0.5, 0.25, 0.125…); con **φ = 1 se queda para siempre**: nada jala a la serie de regreso. A eso se le llama
**raíz unitaria** (el nombre viene de que la raíz de la ecuación del modelo vale 1).

**Clic 2.** Dos dispersiones de "valor de ayer" contra "cambio de hoy". En la que regresa, la recta tiene pendiente −0.43:
si ayer estuvo arriba, hoy baja. En la de raíz unitaria, la pendiente es −0.01: el nivel de ayer no dice a dónde va. ADF hace
justo esta regresión y pregunta si la pendiente es negativa:

Δx_t = α + γ·x_{t−1} + ε_t, con γ = φ − 1.

- **H₀ (hipótesis nula):** γ = 0. Hay raíz unitaria: **no es estacionaria**.
- **H₁ (alternativa):** γ < 0. Regresa a su media: **es estacionaria**.
- El estadístico **τ (tau)** es la pendiente dividida entre su incertidumbre: entre más negativo, más evidencia contra H₀.
  En los esquemas: τ = −6.34 la que regresa y −0.87 la de raíz unitaria.

**Clic 3.** El histograma de lo que saldría si hubiera raíz unitaria: τ de **20,000 caminatas simuladas**. El 5 % queda a la
izquierda de **−2.89**. Un detalle importante: τ **no sigue una normal**; si la siguiera, el 5 % estaría en −1.64. Por eso
ADF tiene sus propias tablas. Recordatorio del **p-valor**: supón que H₀ es cierta; el p-valor es qué tan raro sería un
resultado como el que salió (aquí, el área a la izquierda de τ). Si p < 0.05 sería muy raro y se rechaza H₀. Si no, no se
rechaza, **que no es lo mismo que probarla**. En los esquemas: la que regresa tiene p < 0.00001; la de raíz unitaria,
p = 0.798.

**Clics 4 a 6 (caso).** La tabla de ADF para cada transformación de pasajeros, que se llena fila por fila. Cada fila pone su
marcador en el histograma y su cola se pinta de rojo:

| Serie | τ | p | ¿Se rechaza H₀? |
|---|---|---|---|
| pasajeros | 0.82 | 0.992 | no |
| log | −1.72 | 0.422 | no |
| ∇ log | −2.72 | 0.071 | no |
| ∇₁₂ log | −2.71 | 0.072 | no |
| ∇∇₁₂ log | −4.44 | 0.00025 | sí |

Se calculó con statsmodels y sus valores por omisión. La "A" de "aumentada" quiere decir que la regresión agrega cambios
pasados (aquí, hasta 14) para limpiar la memoria de corto plazo.

**Clic 7 (advertencia).** Ojo: ∇ log y ∇₁₂ log están en la frontera. Si los cambios pasados se eligen con otro criterio
(BIC), dan p = 0.030 y 0.013 y cambiarían de veredicto. Y no rechazar no prueba que haya raíz unitaria.

**Clic 8 (cierre).** "Con logaritmo y las dos diferencias, ADF descarta la raíz unitaria. Que haga falta la diferencia
estacional no lo dice ADF: lo dicen el patrón por mes de la 36 y los picos cada 12 de la 39. Para pasajeros: **d = 1 y
D = 1**." (d es el número de diferencias normales y D el de diferencias estacionales; regresan en la 45 y la 47.)

## Diapositiva 38 · Promedio móvil como suavizado

**Idea central:** cada punto se cambia por el promedio de sus vecinos. Lo que sube y baja rápido se cancela; lo lento se
queda. Y **no hay que confundirlo con el modelo MA(q)** de la 43.

**Clic 1 (concepto).** La fórmula del promedio móvil centrado: m_t = (1/k) × la suma de x_{t+j} para j de −h a h, con
k = 2h + 1. Es decir: h vecinos antes, el punto y h vecinos después. Una serie de juguete de 9 valores que sube 1 en cada paso
y además repite el patrón (+3, −2, −1) cada 3. Con una ventana de 3, el patrón completo cabe dentro: se cancela y queda la
recta. La animación muestra la ventana deslizándose.

**Clic 2 (caso).** Pasajeros con su promedio móvil centrado en rojo y botones de ventana 3, 5, 7 y 2×12 (también con ↑ ↓).
Abajo, una tira con el peso que recibe cada vecino. Con ventanas de 3, 5 o 7 meses la curva se alisa, pero la onda del año
sigue ahí porque la ventana no cubre el año entero. Con **2×12**, la ventana cubre un año completo: **la estacionalidad se
cancela y queda la tendencia**. Como 12 es par y no tiene centro, se promedian dos ventanas de 12 seguidas: son **13 meses,
con medio peso en los extremos** (1/24 en el primero y el último, 1/12 en los demás). Sin promedio quedan 6 meses al inicio y
6 al final. Esta es justo la tendencia de la descomposición de la 34.

**Clic 3.** Acercamiento a 1958–1960, centrado contra **atrasado**:
- El **centrado** termina en junio de 1960: para seguir necesita 6 meses que todavía no existen.
- El **atrasado** usa solo los últimos 12 meses (a_t = promedio de x_t a x_{t−11}) y llega a diciembre de 1960, pero va
  **5.5 meses detrás**.

El centrado sirve para describir. Para pronosticar no: usa el futuro, la misma trampa que la fuga de la diapositiva 30.

**Clic 4 (cierre).** Dos diagramas lado a lado:
- **Promedio móvil (suavizado):** promedia observaciones, que sí se ven (x_{t−1}, x_t, x_{t+1} con pesos 1/3). Se aplica, no
  hay nada que estimar. No pronostica.
- **MA(q) (modelo, diapositiva 43):** combina **choques**, que no se ven (ε_{t−2}, ε_{t−1}, ε_t, con pesos θ₂, θ₁ y 1). Los
  pesos θ se estiman de los datos. Es un modelo: sirve para pronosticar.

**Frase de cierre:** "Mismo nombre, otra cosa: el suavizado promedia lo que vemos; MA(q) combina choques que no vemos."

## Diapositiva 39 · Rezagos y autocorrelación (ACF)

**Idea central:** ¿el valor de hoy se parece al de hace k pasos? Se compara la serie con una copia de sí misma recorrida k
lugares. Eso es la autocorrelación, y su gráfica (el correlograma) es la herramienta principal para leer una serie.

**Clic 1 (concepto).** Una tabla de 8 valores de esquema que forman una ola: 2, 3, 5, 7, 8, 7, 5, 3. Junto a la columna x_t
aparecen dos columnas más, la misma serie recorrida 1 y 2 lugares (x_{t−1} y x_{t−2}). El **rezago k** es el valor de hace k
pasos: cada renglón junta el valor de hoy con el de ayer y el de antier. Recordatorio de **correlación**: mide si dos listas
suben y bajan juntas, +1 si van juntas, −1 si van al revés, 0 si no tienen relación. **Autocorrelación** es la correlación
de la serie con su propia copia recorrida.

**Clic 2 (el cálculo a mano).** La fórmula:

r_k = Σ (x_t − x̄)(x_{t−k} − x̄) / Σ (x_t − x̄)²

Se resta la media a cada valor (aquí x̄ = 5). Un producto positivo quiere decir que los dos valores están del mismo lado de
la media: "están de acuerdo". r_k suma esos acuerdos y los divide entre la variación total. Con botones de k = 1 a 4 se ve
el resultado: r₁ = 0.53, r₂ = −0.12, r₃ = −0.53, r₄ = −0.50. Tiene sentido: un valor se parece al de al lado, pero el de
media ola después está del otro lado de la media.

**Clic 3 (caso).** Arriba, pasajeros en gris y su copia recorrida k meses en rojo, con su media punteada. En medio, las barras
de los productos (rojas las positivas). A la derecha, el correlograma: **una barra por rezago**. Con el botón "recorrer" se
llena barra por barra y con ↑ ↓ se cambia k. Con k = 1 da **0.948**. (En la 29 salió 0.960 porque allá cada lista tenía su
propia media; aquí se usa una sola media y un solo denominador para toda la serie. Miden casi lo mismo pero no son la misma
fórmula.)

**Clic 4.** Dos lecturas del correlograma de pasajeros:
- **Baja muy lento:** tendencia. Con tendencia, los primeros años quedan bajo la media y los últimos arriba, y casi todos los
  productos coinciden en signo, para cualquier k.
- **Picos en 12 y en 24** (0.76 y 0.53): estacionalidad. Un mes se parece al mismo mes del año anterior.

Aparece la **banda**: ±1.96/√n, que con 144 meses es ±0.163. Si no hubiera relación alguna entre los meses (ruido blanco,
diapositiva 41), 95 de cada 100 barras caerían ahí dentro. Las que salen, en rojo, no se explican por azar.

**Clic 5.** El correlograma de **∇∇₁₂ log** (la serie con las dos diferencias, 131 valores). Casi todo queda dentro de la
banda. Las dos mayores: **el rezago 12 (−0.39) y el 1 (−0.34)**. Salen apenas el 3, el 9, el 23 y el 32. Con 36 barras,
unas 2 saldrían por puro azar.

**Frase de cierre:** "Una ACF que baja lento indica tendencia; picos cada 12, estacionalidad. Después de diferenciar quedan
dos huellas, en 1 y en 12: es lo que un modelo puede aprender (46 y 47)."

Por qué las dos barras son negativas: diferenciar tiende a crear un "rebote". Si un mes subió de más, el siguiente cambio
tiende a compensar. Esa correlación negativa en 1 y en 12 es lo que el modelo de aerolínea va a aprovechar.

## Diapositiva 40 · Autocorrelación parcial (PACF)

**Idea central:** la ACF cuenta todo el parecido con el valor de hace k pasos, también el que llega "de rebote" pasando por
los valores intermedios. La PACF solo cuenta el **directo**. Juntas son las huellas para elegir el modelo.

**Clic 1 (concepto).** Una cadena de tres cajas: antier (x_{t−2}) → ayer (x_{t−1}) → hoy (x_t), con flechas rojas marcadas
φ. Si cada valor depende solo del anterior, antier se parece a hoy **aunque no lo toque**: su efecto llega pasando por ayer,
de rebote, con fuerza φ × φ = φ². La ACF en 2 cuenta ese parecido completo. La **PACF en k** es el coeficiente del valor de
hace k pasos cuando la regresión también incluye a todos los de en medio: lo que antier aporta además de lo que ya dijo ayer.
Recordatorio de **regresión**: una recta (o un plano) que predice una cosa a partir de otras; cada coeficiente dice cuánto
aporta su variable cuando las demás ya están en la cuenta; el residuo es lo que la recta no explica.

**Clic 2 (3D).** Una nube de puntos de una serie simulada (cada valor = 0.8 × el anterior + un choque; se ajusta con 1,000
valores y se dibujan 300). Los tres ejes son antier, ayer y hoy. De frente solo se ven antier y hoy: la nube y su sombra en
la pared suben juntas, con pendiente **0.64**, cerca de φ² = 0.64. Si se ignora ayer, antier y hoy parecen muy relacionados.
Eso es la ACF en 2.

**Clic 3.** La escena gira y se mira a lo largo del eje de antier. Aparece el plano que predice hoy con ayer y antier:
**hoy ≈ 0.80 × ayer + 0.00 × antier**. El plano se ve casi como una línea: con ayer en la cuenta, antier ya no aporta. Eso
es la PACF en 2: cerca de 0. El botón "otra muestra" enseña que el número varía un poco con cada simulación.

**Clic 4.** Los valores teóricos de esa serie: la **ACF se apaga poco a poco** (0.8, 0.64, 0.51…) y la **PACF se corta
después de 1** (0.8 y luego ceros). Así se reconoce una serie con memoria de un paso. Si la memoria fuera de p pasos, la
PACF se cortaría después de p. Esto se usa en la 46.

**Clic 5 (caso).** ACF y PACF de ∇∇₁₂ log lado a lado (131 valores), con un botón para comparar contra el logaritmo sin
diferenciar. La PACF se calcula con el algoritmo de **Durbin-Levinson**, a partir de la ACF. Su primer valor siempre coincide
con el de la ACF (−0.34). En la PACF salen de la banda el 1, el 3, el 9 y el 12 (en 12 vale −0.34). Sin diferenciar, la PACF
empieza en 0.95.

**Frase de cierre:** "ACF y PACF juntas son las huellas para elegir el modelo: se leen en la 46. En pasajeros, ya
diferenciados, destacan 1 y 12 en las dos: corto plazo y estación."

---

# Parte 5. Bloque 3: diapositivas 41 a 45

Aquí empiezan los modelos. Desde la 41 cambia una regla: **todo se ajusta con 1949–1959 (132 meses) y 1960 se guarda como
prueba**. Por eso algunos números cambian un poco respecto a la 36–40, que usaban los 144. El bloque va de lo más simple
(ruido blanco, donde ya no hay nada que aprender) a ARIMA, que resuelve la tendencia pero todavía no la estacionalidad.

## Diapositiva 41 · Ruido blanco: lo que ya no se puede predecir

**Idea central:** el ruido blanco es una serie en la que ya no queda nada que aprender. Es la meta: un modelo sirve si lo que
le sobra parece ruido blanco.

(El subtítulo en pantalla dice: "La clase pasada quedaron dos huellas, en 1 y en 12. Antes de modelarlas: ¿cómo se ve una
serie en la que ya no queda nada que aprender?")

**Clic 1.** 132 valores de ruido simulado (con distribución normal) y un botón "otra muestra". Una serie ε es ruido blanco
si cumple tres condiciones:
1. En promedio, cero.
2. La misma dispersión siempre.
3. Ningún parecido entre momentos distintos: Corr(ε_t, ε_{t−k}) = 0.

**Clic 2.** La ACF del ruido, con un contador de barras fuera de la banda. Recordatorio: si la serie fuera ruido blanco, 95
de cada 100 barras caerían dentro de ±1.96/√n. Con 24 barras, por puro azar sale una en promedio (con esta muestra sale
exactamente una, la 14). **No tienen que salir cero.**

**Clic 3.** La dispersión de cada valor contra el anterior: una **nube redonda**, r₁ = −0.03. Saber cómo fue ayer no dice
nada de hoy.

**Clic 4.** El pronóstico del ruido para 12 pasos: una **línea plana en la media**, con una franja que marca dónde caería el
95 % de los valores. Si el pasado no dice nada, lo mejor que se puede pronosticar es la media, a cualquier distancia.

**Clic 5 (caso).** Pasajeros 1949–1959 con 1960 tapado ("PRUEBA · 1960"). Desde aquí todo se ajusta con 132 meses.

**Clic 6.** La misma nube de "este mes contra el mes anterior" con pasajeros: casi una recta, r₁ = 0.94. Cada mes se parece
mucho al anterior. Eso es **memoria**, y es lo que un modelo aprovecha.

**Clic 7.** Dos correlogramas lado a lado. **Pasajeros:** las 24 barras fuera de la banda. **∇∇₁₂ log** (119 valores, que es
lo que queda de 132 meses tras las dos diferencias): casi todo cae dentro. Salen 1, 3, 12 y 23; las mayores siguen siendo 1
(−0.32) y 12 (−0.41). (Con los 144 meses de la 39 eran −0.34 y −0.39.)

**Clic 8 (cierre).** "Pasajeros está muy lejos del ruido blanco; transformada, casi. Un modelo sirve si lo que le sobra
parece ruido blanco. Se revisa en la 48."

## Diapositiva 42 · AR(p): la serie se explica con su propio pasado

**Idea central:** un modelo autorregresivo (AR) es una regresión del valor de hoy sobre los valores anteriores de la misma
serie. Su pronóstico regresa a la media.

**Clic 1 (concepto).** "Hoy = una fracción φ de ayer + un choque nuevo": x_t = φ·x_{t−1} + ε_t. Es el AR(1). Se simula con
**los mismos choques de la 41** y botones de φ (también con ↑ ↓), cada uno con su lectura:
- φ = 0: no recuerda nada; es el ruido de la 41.
- φ = 0.5: recuerda la mitad de ayer.
- φ = 0.9: recuerda casi todo; sube y baja en rachas largas.
- φ = −0.6: lo que subió ayer tiende a bajar hoy; zigzaguea.
- φ = 1: caminata aleatoria (35 y 37); ya no es estacionaria.

Recordatorio de regresión: aquí las "otras variables" son la misma serie, uno o más pasos atrás. De ahí "auto"-regresivo.

**Clic 2.** El **eco de un choque**: cuánto queda de un choque k pasos después es φᵏ. Si |φ| < 1, el eco se apaga y la serie
**siempre vuelve a su media**, que vale μ = c / (1 − φ) (c es la constante del modelo). Con φ = 1 el choque se queda para
siempre: la serie no tiene a dónde regresar.

**Clic 3 (caso).** Se usa el **crecimiento anual** (∇₁₂ log, en porcentaje): cada mes contra el mismo mes del año anterior,
de 1950 a 1959 (120 valores; 1949 no tiene año anterior). En promedio se creció **12.9 % al año**. La pregunta: ¿ayuda saber
cuánto se creció el mes anterior?

**Clic 4 (3D).** La nube de rezagos de la 40, ahora con datos reales y vista de canto: cada punto es un mes; a lo ancho,
cuánto se creció el mes anterior ("ayer"); hacia arriba, este mes ("hoy"). La pendiente de la recta: **φ̂ = 0.74** (el
gorrito quiere decir "estimado"). Si un mes creció mucho, el siguiente también.

**Clic 5.** Con dos meses atrás ya no es una recta, es un plano: AR(2). En general, el AR(p) es
x_t = c + φ₁·x_{t−1} + … + φ_p·x_{t−p} + ε_t. Aquí **φ̂₁ = 0.58 y φ̂₂ = 0.22**: antier aporta un poco. En rojo, los
residuos: lo que el plano no explica. (Los coeficientes se estimaron por mínimos cuadrados y se compararon contra `AutoReg`
de statsmodels.)

**Clic 6.** El pronóstico del AR(2) para 1960: empieza en **18.1 %** (porque diciembre de 1959 había crecido 20.2 %) y baja
mes a mes hacia la media del modelo, **13.6 %**. 1960 sigue guardado.

**Clic 7 (cierre).** "Un AR es una regresión de la serie sobre su propio pasado. Su pronóstico regresa a la media: el pasado
reciente pesa, pero cada vez menos."

## Diapositiva 43 · MA(q): el eco de los errores recientes

**Idea central:** un modelo de promedio móvil (MA, de *moving average*) explica el valor de hoy con los **choques** de los
últimos q periodos. Su memoria se corta de golpe.

Antes que nada: un **choque** (también llamado innovación o sorpresa) es la parte de cada valor que no se podía predecir con
el pasado. En la realidad no se ve directamente; se estima.

**Clic 1 (la cinta de choques).** Abajo, 24 choques de los mismos de la 41 ("en la realidad no se ven"). Arriba, lo que se
observa: el choque de hoy (barra gris) más θ veces el choque de ayer (pedazo rojo) da la raya blanca. Un corchete rojo
recorre la cinta con ↑ ↓ y muestra la cuenta, por ejemplo en t = 5: 1.02 + 0.8 × (−1.19) = 0.07. Botones θ = 0.8 y θ = −0.6.
Las fórmulas:
- MA(1): x_t = μ + ε_t + θ·ε_{t−1}.
- MA(q): x_t = μ + ε_t + θ₁·ε_{t−1} + … + θ_q·ε_{t−q}.

**Clic 2 (los dos ecos).** Cuánto queda de un choque k pasos después, teórico. AR(1) con φ = 0.6: se apaga poco a poco
(0.6, 0.36, 0.22…). MA(1) con θ = 0.6: dos barras y después, cero. En un MA(q), un choque dura **q + 1 periodos y
desaparece**. En un AR nunca desaparece del todo.

**Clic 3 ("No confundir").** Una tabla contra el promedio móvil de la 38:

| | Promedio móvil (38) | MA(q), este modelo |
|---|---|---|
| ¿Qué promedia? | lo que se observa | choques que no se ven |
| ¿Usa el futuro? | sí, si es centrado | no |
| ¿Para qué sirve? | describir la tendencia | pronosticar |
| ¿Sus pesos? | fijos (1/12, …) | se estiman (θ) |

Mismo nombre, otra cosa.

**Clic 4 (caso).** ∇∇₁₂ log (el logaritmo sin tendencia ni estación) en gris y, en rojo, la predicción a un paso del MA(1).
**θ̂ = −0.35** (con error estándar 0.08), estimado con statsmodels. Como θ es negativo: si el mes pasado quedó arriba de lo
esperado, este mes se espera una corrección hacia abajo. Un cursor (↑ ↓) muestra la cuenta de cada mes: la predicción es θ̂
por el error del mes anterior.

**Clic 5.** Esa predicción explica solo el **10 %** de la variación; el resto es choque nuevo, sorpresa pura. Para 1960
corrige un mes (−0.013) y después se queda en 0: ya no le queda memoria.

**Clic 6.** La ACF de ∇∇₁₂ log con la ACF teórica del MA(1) ajustado en guiones. La teoría del MA(1) dice ρ₁ = −0.31; los
datos dicen r₁ = −0.32. Del 2 en adelante la teoría dice 0; en los datos sale además el 3 (−0.22).

**Clic 7 (cierre).** "Un MA recuerda choques, no valores, y solo los últimos q. Su huella: una ACF que se corta."

## Diapositiva 44 · ARMA(p,q): memoria larga y rebote corto

**Idea central:** un ARMA junta las dos ideas: el valor de hoy depende de valores pasados (AR) y de choques recientes (MA).
Mezclarlas da formas que cada una sola solo imita con muchos coeficientes.

**Clic 1.** La fórmula: x_t = c + Σ φ_j·x_{t−j} + ε_t + Σ θ_j·ε_{t−j}. Tres ecos teóricos lado a lado: AR(1) con φ = 0.7 (se
apaga poco a poco), MA(1) con θ = 0.5 (dos barras y cero) y ARMA(1,1) con los dos. En el ARMA, el primer rebote vale
ψ₁ = φ + θ = 1.2, y después se apaga al ritmo del AR (0.84, 0.59, 0.41…). **El MA ajusta el primer rebote; el AR decide cómo
se apaga después.**

**Clic 2 (parsimonia).** El mismo ARMA(1,1) escrito como un AR puro: los pesos de cada valor anterior son 1.2, −0.6, 0.3,
−0.15, 0.075, −0.0375… Para imitar ese eco con un AR puro hacen falta **5 coeficientes** antes de que el siguiente pese menos
de 0.05. El ARMA usa 2. **Parsimonia** quiere decir: explicar lo mismo con menos parámetros.

**Clic 3 (caso).** La ACF del crecimiento anual (∇₁₂ log, 1950–1959) con líneas que dibujan la ACF teórica de cada modelo
ajustado. Se prenden y apagan con botones. Primero MA(1) y AR(1):
- **MA(1):** su ρ₁ teórico es 0.40, contra 0.74 observado. Un MA(1) nunca pasa de 0.5 en el rezago 1: no alcanza.
- **AR(1):** empieza bien, pero baja más rápido que las barras.

**Clic 4.** ARMA(1,1) y AR(2): **siguen a las barras hasta el rezago 8**. Distancia media entre la curva y las barras: 0.035 y
0.029, contra 0.113 del AR(1). Dos coeficientes bastan, de una forma o de otra. (Sus AIC: AR(2) −417.2 y ARMA(1,1) −416.2;
prácticamente empatan.)

**Clic 5.** Después del rezago 8, ninguno: las barras se vuelven negativas y la del 12 sale de la banda (−0.24). Eso no es de
corto plazo: **es del año**. Lo resuelve la diapositiva 47.

**Clic 6 (cierre).** "Mezclar AR y MA da formas que cada uno solo imita con muchos coeficientes. En pasajeros, dos bastan para
el corto plazo. Cómo elegir: 48."

## Diapositiva 45 · ARIMA(p,d,q): diferenciar, modelar y volver a sumar

**Idea central:** la I de ARIMA es de **integrar**: se modela la serie diferenciada y, para pronosticar, se vuelve a sumar.
ARIMA resuelve la tendencia, pero no la estacionalidad.

**Clic 1 (concepto).** Los mismos choques de la 41, sumados uno tras otro: el resultado es una caminata aleatoria,
y_t = y_{t−1} + ε_t. Con ↑ ↓ se avanza y se ve la suma paso a paso (botón "sumar todos"). Sumar los cambios uno tras otro
devuelve la serie: **diferenciar quita la tendencia (36); integrar la devuelve.**

**Clic 2.** La definición: **ARIMA(p,d,q)**: se diferencia **d** veces, lo que queda se modela con un ARMA(p,q) y, al
pronosticar, se vuelve a sumar. La caminata es el ARIMA(0,1,0): diferenciada una vez, es puro ruido.

**Clic 3.** El pronóstico de la caminata a 24 pasos: si los cambios son ruido, el mejor pronóstico del próximo cambio es 0, así
que **la línea se queda plana** en el último valor. Pero cada paso suma un error más, y la incertidumbre crece como un
**abanico**: ŷ_{T+h} = y_T ± 1.96·σ·√h.

**Clic 4 (caso).** ∇ log (el cambio de cada mes respecto al anterior, 1949–1959) y su ACF. Ya no sube, pero repite un dibujo
cada año: **r₁₂ = 0.83**. Avisa lo que este modelo no va a poder ver.

**Clic 5.** El modelo: **ARIMA(0,1,1) con deriva sobre el logaritmo**, es decir, ∇ ln y_t = c + ε_t + θ·ε_{t−1}. Es la
"aerolínea" sin su parte estacional. θ̂ = 0.26 y la **deriva** c (el cambio promedio por mes) es **+1.01 %**. Barras con los
12 cambios que pronostica para 1960: el primero (0.043) trae la corrección del MA; los demás son la deriva (0.010 cada uno).

**Clic 6.** Se pronostica el cambio y luego se suma. Enero: el logaritmo de diciembre de 1959 (405 mil) más 0.043 da **423
mil**. La banda del 95 % se abre cada mes, porque cada paso suma un error más (en diciembre llega hasta 1,128 mil; en pantalla
está recortada).

**Clic 7 (se destapa 1960).** La curva pronosticada es casi una recta que pasa por en medio de la onda: **se queda corta de
abril a septiembre** (en julio, por 173 mil) y se pasa el resto. **MAE: 58.0 mil** (MAPE 11.3 %).

**Clic 8 (cierre).** "La I resolvió la tendencia. Lo que este modelo no puede ver es que cada verano sube: le falta el rezago
12."

Datos para preguntas: el ARIMA de menor AIC sin parte estacional es el ARIMA(2,1,1), pero tiene la raíz de su parte MA en
1.002 (justo en el límite de lo permitido) y pronostica peor. Además, los nueve ARIMA sin estación que se probaron pierden
contra copiar 1959 (MAE de 58 a 72, contra 47.8).

---

# Parte 6. Bloque 4: diapositivas 46 a 50

Este bloque cierra la sección G. Primero se aprende a leer la ACF y la PACF para proponer los órdenes, luego se agrega la
parte estacional (SARIMA) y se llega al modelo de aerolínea. Después se responden tres preguntas para confiar en un modelo,
se compara contra la regla más simple y se hace la receta completa evaluada en seis años.

## Diapositiva 46 · Identificación: leer la ACF y la PACF

**Idea central:** cada modelo deja una huella en la ACF y en la PACF. Leerla propone los órdenes p y q. **La que se corta dice
el orden.**

**Clic 1 (la regla, teórica).** Una rejilla de 3 × 2 con correlogramas teóricos de tres modelos de esquema (AR(2) con
φ = 0.5 y 0.3; MA(1) con θ = −0.6; ARMA(1,1) con φ = 0.7 y θ = 0.4), con su ACF y su PACF. Al lado, la regla:

| Modelo | ACF | PACF |
|---|---|---|
| AR(p) | decae | se corta en p |
| MA(q) | se corta en q | decae |
| ARMA | decae | decae |

"Se corta" quiere decir que después de cierto rezago las barras valen cero de golpe; "decae" quiere decir que se van
haciendo chicas poco a poco. Recordatorio de PACF: lo que aporta el valor de hace k pasos cuando ya se cuentan los de en medio
(40).

Por qué la regla tiene sentido: un AR(p) solo depende directamente de los últimos p valores, así que su PACF (el parecido
directo) se corta en p, aunque su ACF (que también cuenta el parecido de rebote) decae. Un MA(q) solo recuerda q choques, así
que su ACF se corta en q.

**Clic 2 (con una muestra).** Lo mismo, pero con una muestra simulada de 132 valores (el mismo tamaño que pasajeros), con la
teoría en guiones. Botones "teórica / muestra" y "otra muestra". La que se corta dice el orden, pero **con datos las barras
tiemblan**: esta lectura propone candidatos, no decide. Si ninguna se corta, es un ARMA y el orden se decide de otra forma
(48). (Dato para preguntas: entre 300 muestras simuladas, la huella "de libro" se reconoce en 161 del AR(2), 100 del MA(1) y
122 del ARMA(1,1). No siempre se ve limpio.)

**Clic 3 (caso, corto plazo).** ACF y PACF de ∇∇₁₂ log, 1949–1959 (119 valores). Se atenúan los rezagos que no se están
leyendo. **Corto plazo** (1 a 11): la ACF sale en 1 (−0.32) y en 2 ya está dentro (0.11): **q = 1**. La PACF hace lo mismo
(−0.32 y 0.01): también podría ser **p = 1**.

**Clic 4.** El 3 sale en las dos (−0.22 y −0.20). Con 36 barras, unas 2 salen por puro azar: no basta para pedir un orden 3.

**Clic 5 (años).** Los rezagos 12, 24 y 36 se leen igual, pero contando en años. La ACF se corta en 12 (−0.41; en 24 vale
−0.03 y en 36, 0.01): **un MA(1) de años, Q = 1**. La PACF va bajando (−0.35, −0.10, −0.18), como espera la regla para un MA.

**Clic 6 (Bartlett).** La **banda de Bartlett** se ensancha con el rezago: supone que las barras anteriores son reales y por
eso exige más a las siguientes. Es la que dibuja por omisión `plot_acf` de Python. Con ella quedan fuera solo 1, 3 y 12.
Candidatos:
- **SARIMA(0,1,1)(0,1,1)₁₂**
- **SARIMA(1,1,0)(0,1,1)₁₂**

**Clic 7 (cierre).** "La que se corta dice el orden. En pasajeros: un MA(1) de meses, o un AR(1), y un MA(1) de años. Qué es
lo de años: 47. Cuál de los dos: 48."

## Diapositiva 47 · SARIMA: un ARIMA para los meses y otro para los años

**Idea central:** un SARIMA agrega a ARIMA una parte que trabaja con rezagos de s periodos (aquí, el mismo mes del año
anterior). Con dos coeficientes, el pronóstico ya tiene la onda del verano.

**Clic 1 (dos relojes).** Una rejilla de meses (columnas) por años (renglones). Sobre una celda t hay dos flechas: la gris
va al mes anterior (**rezago 1**) y la roja va al mismo mes del año pasado (**rezago 12**). En enero, el mes anterior es
diciembre del año previo. Son dos relojes: uno que cuenta meses y otro que cuenta años.

**Clic 2 (la notación).** SARIMA(p,d,q)(P,D,Q)ₛ. La parte (p,d,q) es la de meses, como en la 45. La parte (P,D,Q)ₛ es lo
mismo pero contando de s en s. D es la diferencia estacional de la 36: ∇ₛ y_t = y_t − y_{t−s}, con s = 12.

**Clics 3 a 5 (cintas 3D).** El logaritmo de pasajeros 1949–1959 como cintas en 3D, una por año, con las dos flechas sobre
julio de 1955. Se aplican las diferencias una por una:
- **log y:** cada año repite la forma y sube un escalón.
- **∇₁₂:** cada celda menos la del año anterior: el dibujo del verano se va y cada cinta queda casi plana, a su altura. 1949
  no tiene año anterior.
- **∇:** además, cada mes menos el anterior: queda ruido alrededor de 0. Se pierde también enero de 1950.

**Clic 6 (el modelo de aerolínea).** Lo que queda se modela con un MA(1) de meses y uno de años: el **modelo de aerolínea**,
SARIMA(0,1,1)(0,1,1)₁₂, que Box y Jenkins propusieron para esta misma serie. En palabras: "choque de hoy + θ por el del mes
pasado + Θ por el de hace un año + θΘ por el de hace 13 meses". Con los coeficientes estimados:

w_t = ε_t − 0.35·ε_{t−1} − 0.56·ε_{t−12} + 0.20·ε_{t−13}

donde w_t es ∇∇₁₂ log. **θ̂ = −0.35** (el MA de meses) y **Θ̂ = −0.56** (el MA de años; theta mayúscula). El término de 13
meses no es un coeficiente nuevo: sale del producto θ̂Θ̂ = (−0.35)(−0.56) = 0.20. Así, el modelo tiene solo 2 coeficientes.

**Clic 7 (forma corta).** La misma ecuación en la forma con que la escriben los libros y statsmodels:

(1 − B)(1 − B¹²) ln y_t = (1 + θB)(1 + ΘB¹²) ε_t

Recordatorio del **operador B** (de *backshift*, "hacia atrás"): B quiere decir "el valor anterior", B·y_t = y_{t−1}. Por eso
(1 − B) es restar el anterior, ∇, y (1 − B¹²) es restar el del año pasado, ∇₁₂. Al multiplicar los paréntesis de la derecha
sale el término θΘB¹³, el de 13 meses.

**Clic 8 (pronóstico).** El modelo de aerolínea, entrenado solo con 1949–1959, pronostica 1960 con su banda del 95 %. Con dos
coeficientes, el pronóstico ya tiene la onda que al ARIMA de la 45 le faltaba. 1960 sigue tapado.

**Clic 9 (se destapa 1960).** Julio: **622.2 pronosticado, 622 real**. Pero se pasó en **11 de 12 meses**: supuso crecer
14.0 % y se creció 11.2 % (el año completo quedó 2.6 % arriba). Marzo quedó fuera de la banda del 95 % (los otros 11 meses
caen dentro).

**Clic 10 (cierre).** "Un reloj de meses y otro de años. Con dos coeficientes, el pronóstico tiene la onda del verano. ¿Es el
mejor? ¿Qué tan bueno? 48."

## Diapositiva 48 · Elegir y evaluar: tres preguntas, tres herramientas

**Idea central:** antes de confiar en un modelo hay que contestar tres cosas, cada una con su herramienta:
1. **¿Qué órdenes?** → AIC y BIC, sin tocar la prueba.
2. **¿Pronostica bien?** → MAE, RMSE y MAPE, sobre la prueba.
3. **¿Dejó algo sin explicar?** → Ljung-Box, sobre los residuos.

Arriba de la diapositiva hay una línea con las tres preguntas que marca en cuál se va. Es una diapositiva de fundamentos.

**Clic 1 (AIC y BIC).**
- AIC = 2k − 2 ln L̂
- BIC = k ln n − 2 ln L̂

L̂ es la **verosimilitud**: qué tan creíbles resultan los datos con unos coeficientes. Estimar es buscar los coeficientes que
la hacen máxima (así salieron los coeficientes de la 43 a la 47). k es el número de coeficientes y n el número de datos. Los
dos criterios premian que los datos resulten creíbles y cobran por cada coeficiente; BIC cobra más. **Menor es mejor.** Por
qué cobrar: con más coeficientes siempre se ajusta mejor el entrenamiento, pero eso es el sobreajuste de la parte 1.

**Clic 2 (caso: la rejilla).** Los **16 SARIMA** que salen de probar p, q, P y Q en 0 o 1, todos con d = D = 1 y la misma
serie (así sí se comparan; si se cambiara d, cambiarían los datos y los AIC no serían comparables). Cada celda muestra la
diferencia de AIC (o BIC, con un botón) contra el mejor. **El mínimo con AIC y con BIC es la aerolínea**,
SARIMA(0,1,1)(0,1,1)₁₂. El otro candidato de la 46, (1,1,0)(0,1,1)₁₂, queda a +0.4. Hay 4 modelos (contando a la aerolínea)
a menos de 2 puntos del mejor: no se distinguen (una regla práctica dice que diferencias de AIC menores que 2 no son importantes).

**Clic 3 (MAE y RMSE).** Esquema de 4 meses: real 100, 120, 110, 130; pronóstico 104, 114, 112, 110. Los errores (real menos
pronóstico): −4, +6, −2, +20.
- **MAE** (error absoluto medio) = el promedio de los errores sin signo = 8.0.
- **RMSE** (raíz del error cuadrático medio) = la raíz del promedio de los errores al cuadrado = 10.7.

El error grande del mes 4 es lo que separa al RMSE del MAE: **al cuadrado pesa más**.

**Clic 4 (MAPE).** MAPE = el promedio de |error / real|, en porcentaje. En el esquema, 6.6 %. Cada error se divide entre el
valor real: el error queda en por ciento y se puede comparar entre series de distinto tamaño.

**Clic 5 (caso: los errores de 1960).** Los 12 errores de la aerolínea en 1960, en miles: −2, −8, −48, +7, −1, −12, 0, −24,
−19, −1, −17, −20. El mayor (en rojo) es marzo, −48. **MAE 13.3 mil, RMSE 18.6 mil, MAPE 2.9 %.** En promedio se equivoca por
13.3 mil pasajeros al mes.

**Clic 6 (Ljung-Box).** Si el modelo aprovechó todo, lo que sobra (los **residuos**) debe parecer ruido blanco (41). La prueba
de **Ljung-Box** junta las primeras h barras de la ACF de los residuos en un solo número:

Q = n(n + 2) Σ r_k² / (n − k)

Si fueran ruido blanco, Q sería chico. Su hipótesis nula es "no queda parecido entre los residuos".

**Clic 7 (dos escalas de p).** Dos escalas de p-valor, una sobre otra. En **ADF** (37), H₀ es "hay raíz unitaria" y **se
quiere p chico** (rechazar). En **Ljung-Box**, H₀ es "no queda parecido" y **se quiere p grande** (no rechazar: que no haya
evidencia de que sobre algo). Mismo 0.05, preguntas opuestas.

**Clic 8 (caso: los residuos).** La ACF de los 119 residuos de la aerolínea: solo sale el rezago 23, lo esperable por azar con
24 barras. Ljung-Box con 24 rezagos: **Q = 18.6, p = 0.67**. Con 12 rezagos, p = 0.74. No hay evidencia de que quede parecido
entre los residuos (que no es lo mismo que probar que son ruido blanco).

**Clic 9 (advertencia).** Ojo: **6 de los otros 15 SARIMA tuvieron menor error en 1960** (MAE de 11.0 a 12.4, contra 13.3).
Escoger entre ellos mirando 1960 sería usar la prueba para elegir: **la fuga de la 30**. Además es un solo año y las
diferencias son chicas.

**Clic 10 (resumen).** Las tres preguntas con su respuesta: ¿qué órdenes? AIC, sin tocar la prueba: la aerolínea. ¿Pronostica
bien? La prueba mide: MAE 13.3 mil. ¿Dejó algo? Ljung-Box revisa lo que sobró: p = 0.67. Y la pregunta que lleva a la
siguiente: **"¿13.3 mil es poco o mucho? Depende de contra qué se compare: 49."**

## Diapositiva 49 · La línea base: copiar el año pasado

**Idea central:** un modelo se mide contra la regla más simple que funcione. Si no le gana, no aporta. Y la vara debe ser la
más alta que salga gratis.

**Clic 1 (concepto).** El **ingenuo estacional**: el pronóstico de cada mes es el mismo mes del año pasado,
ŷ_{T+h} = y_{T+h−12}. Un esquema de tres años con tendencia y estación donde el último año se copia hacia adelante. No
aprende nada y no tiene coeficientes.

**Clic 2.** Por eso sirve de vara: lo que un modelo le gane es lo que de verdad aporta. Recordatorio de **línea base**: en
Adult, decir siempre "no gana más de 50K" acertaba 76.1 % sin aprender nada (26). Es la misma idea.

**Clic 3 (caso).** 1959 copiado sobre 1960 se queda corto en **12 de 12 meses**: no sabe que el tráfico crece. MAE 47.8 mil,
MAPE 9.99 %.

**Clic 4 (la tabla).** Cinco pronósticos de 1960, ninguno vio 1960. El mejor de cada columna, en rojo:

| Pronóstico | MAE | RMSE | MAPE % |
|---|---|---|---|
| Ingenuo estacional: copiar 1959 | 47.8 | 50.7 | 9.99 |
| Ingenuo con crecimiento: 1959 × 1.124 | 13.4 | 16.8 | 2.95 |
| Random Forest de la 30 | 44.1 | 56.9 | 8.46 |
| ARIMA(0,1,1) con deriva (45) | 58.0 | 78.7 | 11.26 |
| SARIMA, modelo de aerolínea (47) | 13.3 | 18.6 | 2.90 |

El "ingenuo con crecimiento" copia 1959 y lo multiplica por lo que creció el total de 1958 a 1959 (1.124, es decir, 12.4 %).
El bosque apenas le gana a copiar 1959; el ARIMA sin estación pierde. La regla que además sube lo que venía creciendo es otra
cosa.

**Clic 5 (gráfica).** 1958–1960 con 1960 real, SARIMA en rojo y, con botones, cada línea base. Contra copiar 1959, SARIMA baja
el MAE un 72 %. Contra copiarlo y subirlo lo que venía creciendo, **empatan**: MAE 13.3 contra 13.4; RMSE 18.6 contra 16.8 (en
RMSE gana el ingenuo con crecimiento).

**Clic 6 (cierre).** "Un modelo que no le gana a la regla más simple no aporta. Y la vara debe ser la más alta que salga
gratis. ¿Fue suerte de 1960? 50."

## Diapositiva 50 · Demo: de la serie al pronóstico, evaluado en seis años

**Idea central:** la receta completa sobre pasajeros, de la serie cruda al pronóstico, comparado contra una línea base y en
varios orígenes. SARIMA gana en promedio, no todos los años.

**Clic 1 (la receta en 6 estaciones).** Seis tarjetas, cada una con la diapositiva donde se vio:
1. **Transformar** (34 y 36): logaritmo, una diferencia y una estacional.
2. **¿Estacionaria?** (37): ADF sobre cada transformación.
3. **Identificar** (46): ACF y PACF proponen candidatos.
4. **Elegir** (48): AIC entre los 16 SARIMA.
5. **Pronosticar y comparar** (47 y 49): contra la línea base, en varios años.
6. **Diagnosticar** (48): Ljung-Box sobre los residuos.

En los clics siguientes, una línea arriba marca en qué estación se va.

**Clic 2 (transformar).** La descomposición multiplicativa de 1949–1959: una tendencia que sube y una onda anual que crece con
ella. Por eso: logaritmo, una diferencia y una estacional.

**Clic 3 (¿estacionaria?).** ADF con los 132 meses de entrenamiento, junto a lo que dio con 144 en la 37:

| Serie | p (132 meses) | p (144 meses) | ¿Estacionaria? (132) |
|---|---|---|---|
| pasajeros | 0.993 | 0.992 | no |
| log | 0.621 | 0.422 | no |
| ∇ log | 0.029 | 0.071 | sí |
| ∇₁₂ log | 0.096 | 0.072 | no |
| ∇∇₁₂ log | 0.001 | 0.00025 | sí |

Las filas firmes no cambian: sin diferencias, no; con las dos, sí. Las de en medio **cambiaron de lado** al quitar 1960, como
avisó la 37. La diferencia estacional la pide el patrón por mes (r₁₂ = 0.83 en ∇ log), no ADF.

**Clic 4 (identificar).** ACF y PACF de ∇∇₁₂ log, 1949–1959. Las huellas en 1 y en 12: un MA(1) de meses (o un AR(1)) y un
MA(1) de años. Dos candidatos (46).

**Clic 5 (elegir).** La rejilla de AIC de los 16 SARIMA. La ACF propone, AIC elige: **SARIMA(0,1,1)(0,1,1)₁₂**. Y fue el mínimo
en los 6 orígenes que siguen (el segundo, a entre 0.37 y 1.22 puntos).

**Clic 6 (origen móvil).** Un diagrama con seis renglones, uno por año que se pronostica, de 1955 a 1960. Para cada año se
entrena solo con lo anterior (para 1955, con 1949–1954, 72 meses; para 1960, con 132) y **todo se vuelve a estimar solo con el
pasado**. Abajo, la gráfica del año elegido (botones o ↑ ↓) con el real, el SARIMA, el ingenuo y el ARIMA, y el MAPE de cada
uno. (Se empieza en 1955 porque con menos de 72 meses los ajustes no convergen.)

**Clic 7 (la tabla por año).** MAPE de cada año, en porcentaje:

| Modelo | 1955 | 1956 | 1957 | 1958 | 1959 | 1960 | Media ± desv |
|---|---|---|---|---|---|---|---|
| Ingenuo estacional | 15.84 | 13.49 | 10.76 | **3.14** | 11.06 | 9.99 | 10.71 ± 3.92 |
| ARIMA(0,1,1) con deriva | 12.33 | 10.90 | 11.69 | 11.60 | 13.62 | 11.26 | 11.90 ± 0.88 |
| SARIMA (aerolínea) | 4.77 | 1.73 | 1.66 | 7.61 | 6.75 | 2.90 | **4.24 ± 2.33** |

SARIMA gana **5 de 6** años. Pierde en **1958**: ese año el total creció solo 3.4 %, contra 12.2 % el anterior, y copiar el año
pasado acertó (casi no hubo crecimiento que perderse). El modelo, que esperaba seguir creciendo, se pasó.

**Clic 8 (diagnóstico).** Ljung-Box (24 rezagos) de los residuos de cada uno de los seis ajustes del SARIMA: los p-valores van
de 0.67 a 0.93. En los seis, p > 0.05: no hay evidencia de que quede parecido entre los residuos.

**Clic 9 (cierre).** "La receta completa, de la serie cruda al pronóstico evaluado. SARIMA gana en promedio, no todos los años:
por eso se evalúa en varios orígenes y siempre contra una línea base."

---

# El hilo conductor de las diapositivas 31 a 50

Si hay que contar todo en un minuto, es esta historia:

1. Una serie es una variable medida en orden (31). Pasajeros tiene **tendencia** y **estacionalidad** (32), que no es un ciclo
   porque el pico cae siempre en julio o agosto (33).
2. Su onda crece con el nivel: es **multiplicativa**, y el **logaritmo** la vuelve casi aditiva (34).
3. No es **estacionaria**: su media cambia con el tiempo (35). Los modelos aprenden números fijos, así que hay que volverla
   estacionaria **diferenciando**: ∇ quita la tendencia y ∇₁₂ quita la estación (36). La prueba **ADF** lo confirma para ∇∇₁₂
   log, con la advertencia de que las filas de en medio son frágiles (37).
4. El **promedio móvil** sirve para describir la tendencia, pero usa el futuro y no es el modelo MA (38).
5. La **ACF** mide cuánto se parece la serie a sí misma k pasos atrás; la **PACF**, solo el parecido directo (39 y 40). En
   ∇∇₁₂ log quedan dos huellas: rezago 1 y rezago 12.
6. Desde la 41 se guarda 1960 como prueba. El **ruido blanco** es lo que ya no se puede predecir: la meta es que lo que sobre
   se le parezca (41).
7. **AR** recuerda valores (42); **MA** recuerda choques (43); **ARMA** junta las dos con pocos coeficientes (44); **ARIMA**
   diferencia, modela y vuelve a sumar, pero no ve el verano (45).
8. Leyendo la ACF y la PACF salen dos candidatos (46). **SARIMA** agrega un reloj de años y llega al **modelo de aerolínea**,
   que con dos coeficientes ya tiene la onda (47).
9. Para confiar en él: **AIC** elige sin tocar la prueba, **MAE/RMSE/MAPE** miden en la prueba y **Ljung-Box** revisa los
   residuos (48). Se compara contra la **línea base** (49) y se evalúa en **seis años con origen móvil**: 4.24 % de error medio
   contra 10.71 % de copiar el año anterior (50).

La misma receta que en la parte 1 (datos → modelo → validación → métrica), adaptada a datos donde el orden importa: la
validación es temporal y la línea base es copiar el año pasado.

Después de la 50 viene la sección H, **modelos ocultos de Markov** (51 a 61), con el caso del "clima oculto". Allí cambia la
pregunta: ya no se pronostica un número a partir de su pasado, sino que se deduce un estado que no se ve (el clima) a partir
de lo que sí se ve (lo que hizo un amigo).

---

# Glosario

- **Serie de tiempo:** una sola variable medida en momentos ordenados y regulares. El dato es el par (t, y).
- **Horizonte (h):** cuántos pasos adelante se pronostica.
- **Tendencia:** cómo cambia el nivel a largo plazo.
- **Estacionalidad:** un patrón que se repite cada periodo fijo del calendario (aquí, 12 meses).
- **Ciclo:** subidas y bajadas de duración variable, por lo común de más de dos años. Con 12 años no se separa de la
  tendencia.
- **Ruido / residuo:** lo que queda cuando se quita todo lo que tiene patrón.
- **Aditiva / multiplicativa:** si la estacionalidad se suma (onda de tamaño fijo) o se multiplica (onda que crece con el
  nivel, en forma de embudo).
- **Logaritmo:** convierte multiplicaciones en sumas. Vuelve casi aditiva una serie multiplicativa.
- **Estacionaria:** misma media, misma dispersión y un parecido entre momentos que solo depende de la distancia, no de dónde
  se mire.
- **Paseo aleatorio / caminata aleatoria:** cada valor es el anterior más un choque. Acumula todos los choques y no es
  estacionaria.
- **Diferenciar (∇):** restar el valor anterior. ∇₁₂: restar el del mismo mes del año anterior.
- **Raíz unitaria:** cuando φ = 1 en x_t = φx_{t−1} + ε_t: los choques se quedan para siempre.
- **ADF (Dickey-Fuller aumentada):** prueba cuya H₀ es "hay raíz unitaria". Se quiere p < 0.05.
- **p-valor:** suponiendo que H₀ es cierta, qué tan raro sería un resultado como el obtenido. Si es menor que 0.05 se rechaza
  H₀; si no, no se rechaza, que no es lo mismo que probarla.
- **Promedio móvil (suavizado):** promedio de valores vecinos observados. Describe la tendencia; el centrado usa el futuro.
- **Rezago k:** el valor de hace k pasos.
- **ACF (autocorrelación):** la correlación de la serie con su copia recorrida k pasos. Su gráfica es el correlograma.
- **Banda:** ±1.96/√n. Si la serie fuera ruido blanco, 95 de cada 100 barras caerían dentro.
- **Banda de Bartlett:** una banda que se ensancha con el rezago; la que dibuja `plot_acf` por omisión.
- **PACF (autocorrelación parcial):** el parecido directo con el valor de hace k pasos, contando ya los de en medio.
- **Ruido blanco:** media cero, misma dispersión y ningún parecido entre momentos distintos. Su mejor pronóstico es la media.
- **Choque (ε, innovación):** la parte de cada valor que no se podía predecir con el pasado.
- **AR(p):** el valor de hoy se explica con los p valores anteriores. Su PACF se corta en p.
- **MA(q):** el valor de hoy se explica con los choques de los últimos q periodos. Su ACF se corta en q.
- **ARMA(p,q):** las dos cosas juntas. Su ACF y su PACF decaen.
- **Parsimonia:** explicar lo mismo con menos parámetros.
- **ARIMA(p,d,q):** diferenciar d veces, modelar con un ARMA(p,q) y volver a sumar (integrar).
- **Deriva:** el cambio promedio por paso en un ARIMA con d = 1 (aquí, +1.01 % por mes).
- **SARIMA(p,d,q)(P,D,Q)ₛ:** ARIMA con una segunda parte que trabaja con rezagos de s periodos.
- **Modelo de aerolínea:** SARIMA(0,1,1)(0,1,1)₁₂, propuesto por Box y Jenkins para esta serie. θ̂ = −0.35, Θ̂ = −0.56.
- **Operador B:** B·y_t = y_{t−1}. (1 − B) = ∇ y (1 − B¹²) = ∇₁₂.
- **Verosimilitud:** qué tan creíbles resultan los datos con unos coeficientes.
- **AIC y BIC:** califican un modelo por su verosimilitud, con una multa por cada coeficiente. Menor es mejor. Se calculan solo
  con el entrenamiento.
- **MAE:** promedio del error absoluto. **RMSE:** raíz del promedio del error al cuadrado (castiga más los errores grandes).
  **MAPE:** promedio del error en porcentaje del valor real.
- **Ljung-Box:** prueba si queda parecido entre los residuos. H₀: no queda. Se quiere p > 0.05.
- **Ingenuo estacional:** pronosticar cada mes con el mismo mes del año pasado. Es la línea base.
- **Fuga de datos:** información del futuro que se cuela al entrenamiento o a la elección del modelo.
- **Origen móvil:** pronosticar varios años, cada uno entrenando solo con lo anterior.

---

# Preguntas probables y cómo contestarlas

**¿Por qué no se puede usar K-Fold en una serie de tiempo?**
Porque barajado, para predecir un mes el modelo ya vio el siguiente: es fuga de datos. Rellenar huecos es más fácil que
pronosticar, así que el error sale más optimista que el real. En la 30, el bosque tenía MAE 26.2 barajado contra 67.2
pronosticando.

**¿Por qué en las diapositivas 31 a 40 se usa 1960 si dijeron que no se entrena con el futuro?**
Esas diapositivas describen la serie, no evalúan un modelo. Desde la 41 se aparta 1960 como prueba y todo se decide con
1949–1959. La 30 lo avisa en su cierre.

**¿Pasajeros no tiene ciclo?**
No se puede saber. Con 12 años, un ciclo de varios años no se distingue de la tendencia, y por eso los métodos clásicos los
estiman juntos como "tendencia-ciclo". Lo que sí se ve es estacionalidad: el pico cae en julio o agosto los 12 años.

**¿Por qué el logaritmo y no la serie tal cual?**
Porque la onda del año crece con el nivel (de 44 a 232 mil, ×5.3). En logaritmo, crecer un porcentaje suma siempre lo mismo,
así que la onda queda de tamaño casi fijo (su ancho pasa de 0.35 a 0.47) y la serie se vuelve casi aditiva. La descomposición
multiplicativa tuvo la mitad de error que la aditiva (6.6 contra 14.4 mil).

**¿Por qué la correlación da 0.960 en la 29 y 0.948 en la 39?**
En la 29 es la correlación de Pearson de dos listas, cada una con su propia media. La ACF de la 39 usa una sola media y un solo
denominador para toda la serie. Miden casi lo mismo, pero no son la misma fórmula.

**Si corro ADF con otros argumentos, ¿me sale lo mismo?**
La primera y la última fila no cambian con nada. Las de ∇ log y ∇₁₂ log están en la frontera: con rezagos elegidos por BIC dan
0.030 y 0.013, y sin 1960 dan 0.029 y 0.096. Por eso la 37 lo advierte, y la decisión de D = 1 se apoya en el patrón por mes,
no en ADF.

**¿ADF prueba que la serie es estacionaria?**
No exactamente. Rechazar H₀ dice que hay evidencia contra la raíz unitaria. Y no rechazarla no prueba que la haya. Existe una
contraprueba, KPSS, con la hipótesis nula al revés ("es estacionaria"), que se puede usar junto con ADF.

**¿Promedio móvil y MA(q) no son lo mismo?**
No. El promedio móvil promedia valores observados, el centrado usa el futuro y sirve para describir la tendencia. MA(q) es un
modelo que combina choques que no se ven, con pesos que se estiman, y sirve para pronosticar (38 y 43).

**¿Por qué tienen que salir barras fuera de la banda si es ruido blanco?**
Porque la banda es del 95 %: por puro azar, 5 de cada 100 barras salen. Con 24 barras sale una en promedio; con 36, unas 2.

**¿Por qué el coeficiente del MA es negativo?**
Porque al diferenciar se crea un rebote: si un mes subió de más, el cambio siguiente tiende a compensar. θ̂ = −0.35 quiere decir
que, si el mes pasado quedó arriba de lo esperado, este mes se espera una corrección hacia abajo.

**¿Por qué el MA(1) explica solo el 10 % de la variación?**
Porque en ∇∇₁₂ log casi todo es sorpresa: lo predecible ya se quitó con el logaritmo y las diferencias. Lo poco que queda es el
rebote de un mes (y el de un año, que agrega el SARIMA).

**¿Por qué el ARIMA de la 45 pronostica tan mal?**
Porque no tiene parte estacional: su pronóstico es casi una recta que sube 1.01 % por mes y pasa por en medio de la onda. Se
queda corto de abril a septiembre (por 173 mil en julio) y se pasa el resto. Pierde incluso contra copiar 1959 (58.0 contra
47.8 de MAE).

**¿Qué es el término de 13 meses del modelo de aerolínea?**
No es un coeficiente nuevo: sale de multiplicar la parte de meses por la de años, (1 + θB)(1 + ΘB¹²), que da un término θΘB¹³.
Vale (−0.35)(−0.56) = 0.20. El modelo tiene solo 2 coeficientes.

**¿Por qué no eligieron el SARIMA que tuvo menos error en 1960?**
Porque elegir mirando 1960 sería usar la prueba para decidir, la misma fuga de la 30. AIC elige solo con 1949–1959. Seis de
los otros 15 tuvieron menor error en 1960 (MAE de 11.0 a 12.4 contra 13.3), pero es un solo año y las diferencias son chicas.

**¿Por qué el pronóstico de SARIMA se pasa en casi todos los meses de 1960?**
Sigue bien la forma del año (julio: 622.2 contra 622), pero el nivel de 1960 creció menos que la tendencia de los años
anteriores: el modelo supuso 14.0 % y se creció 11.2 %. Se pasa en 11 de 12 meses y el año queda 2.6 % arriba; 11 de los 12
reales caen dentro de su banda del 95 % (marzo queda fuera).

**Si copiar 1959 con su crecimiento empata con SARIMA, ¿para qué SARIMA?**
En 1960 empatan (MAE 13.4 contra 13.3; en RMSE gana el ingenuo, 16.8 contra 18.6). Un año no basta para decidir: por eso la 50
evalúa seis años con origen móvil, y ahí SARIMA tiene en promedio 4.24 % de error contra 10.71 % de copiar el año anterior.

**¿Por qué SARIMA pierde en 1958?**
Porque en 1958 el tráfico casi no creció (3.4 %, contra 12.2 % el año anterior). Copiar 1957 acertó (3.14 % de error), y SARIMA,
que esperaba seguir creciendo, se pasó (7.61 %).

**¿Por qué Ljung-Box quiere p grande y ADF p chico?**
Porque sus hipótesis nulas son opuestas en lo que se desea. En ADF, H₀ es "hay raíz unitaria" y se quiere rechazarla. En
Ljung-Box, H₀ es "no queda parecido entre los residuos" y se quiere no rechazarla.

**¿Qué diferencia hay entre AIC y BIC?**
Los dos premian la verosimilitud y cobran por cada coeficiente. AIC cobra 2 por coeficiente; BIC cobra ln n (con más de 7
datos, más que 2), así que prefiere modelos más chicos. En pasajeros los dos eligen la aerolínea.

---

# Números clave en una sola tabla

| Qué | Valor | Dónde |
|---|---|---|
| Meses en la serie | 144 (1949–1960); se ajusta con 132 desde la 41 | 29, 41 |
| Mínimo y máximo | 104 (nov 1949) y 622 (jul 1960) | 31 |
| Media anual | 126.7 → 476.2 (×3.8) | 32 |
| Ancho de la onda | 44 → 232 (×5.3); en log 0.35 → 0.47 | 32, 34 |
| Índice de julio | aditiva +63.8 mil; multiplicativa ×1.227 | 34 |
| Error de la descomposición | aditiva 14.4; multiplicativa 6.6 mil | 34 |
| Desviación anual | 13.7 → 77.7 (×5.7); en log 0.108 → 0.157 (×1.4) | 35 |
| Crecimiento medio en ∇ log | +0.95 % por mes | 36 |
| Meses que quedan con ∇∇₁₂ | 131 (de 144); 119 (de 132) | 36, 41 |
| ADF, ∇∇₁₂ log | τ = −4.44, p = 0.00025 | 37 |
| Valor crítico de τ al 5 % | −2.89 (no −1.64) | 37 |
| r₁ de pasajeros | 0.948 (ACF); 0.960 (Pearson) | 39, 29 |
| ACF de ∇∇₁₂ log | r₁ = −0.34, r₁₂ = −0.39 (144 meses); −0.32 y −0.41 (132) | 39, 41 |
| AR(1) del crecimiento anual | φ̂ = 0.74; AR(2): 0.58 y 0.22 | 42 |
| MA(1) de ∇∇₁₂ log | θ̂ = −0.35; explica el 10 % | 43 |
| ARIMA(0,1,1) con deriva | deriva +1.01 %/mes; MAE 1960 = 58.0 | 45 |
| Modelo de aerolínea | θ̂ = −0.35, Θ̂ = −0.56, θ̂Θ̂ = 0.20 | 47 |
| Aerolínea en 1960 | MAE 13.3, RMSE 18.6, MAPE 2.9 % | 48 |
| Ljung-Box, aerolínea | Q = 18.6, p = 0.67 (24 rezagos) | 48 |
| Copiar 1959 | MAE 47.8, MAPE 9.99 % | 49 |
| Copiar 1959 × 1.124 | MAE 13.4, RMSE 16.8 | 49 |
| Origen móvil 1955–1960 (MAPE medio) | SARIMA 4.24 %; ingenuo 10.71 %; ARIMA 11.90 % | 50 |
| SARIMA gana | 5 de 6 años; pierde 1958 | 50 |
