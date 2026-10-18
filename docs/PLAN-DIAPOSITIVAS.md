# Plan de las diapositivas — Ensambles y datos secuenciales (U7 y U8)

Estado al 2026-10-13: **40 de 64 construidas** (1, 3–40 y 60). Hitos 0 a 3 terminados: toda la parte 1 (ensambles) está completa, salvo el mapa de la 2. El hito 4 (29–40) se cerró el 2026-10-13 (ver `docs/hitos/HITO-4.md`). Sigue el hito 5 (41–50). Después del hito 3 hubo una ronda de correcciones que quitó `fnlwgt` y regeneró todos los datos de Adult (ver "Lo que cambió en la ronda de correcciones"). Este documento fija qué lleva cada diapositiva **antes** de construirla; al construir, cada sección anota aquí lo que cambió.

## Cómo leer este plan

- **Este es el plan maestro**: dice qué lleva cada diapositiva. Desde el hito 4, **cómo y en qué orden se construye cada hito está en su propio plan**, `docs/hitos/HITO-N.md` (flujo en `CLAUDE.md`). Los cambios al construir se anotan en la bitácora de ese archivo, no aquí; aquí solo se corrige la entrada de una diapositiva si cambia lo que lleva.

- Cada diapositiva tiene: **Concepto** (se explica desde cero, con un esquema o ejemplo mínimo), **Caso** (lo mismo sobre el caso de estudio; aparece la etiqueta "Caso · …"), **Cierre** (la frase que se lleva el público), **Gráficos** y **Datos**.
- En **Datos**: *vivo* = se calcula en el navegador (TypeScript); *JSON* = se precalcula con Python y la diapositiva lo lee; *esquema* = ilustrativo y marcado como tal en pantalla.
- Los números que aparecen aquí son los esperados. Al construir se recalculan y se muestra lo que salga.
- De las secciones Apertura/Cierre, F, G y H existe además una especificación larga (medidas, animaciones y fórmulas) en `docs/especificaciones/`. Son borradores de diseño: solo la de Apertura/Cierre pasó por revisión (sus correcciones ya están incorporadas aquí). Las demás se revisan al construir cada hito.

## Reglas que aplican a todas

1. **Desde cero.** No se citan las prácticas de la materia.
2. **Concepto → caso**, con clics dentro de la misma diapositiva.
3. **Fundamentos como recuadro** "Recordatorio" (máximo un tercio de la diapositiva). Solo 3, 5, 20 y 26 son diapositivas puramente de fundamentos.
4. **Ningún número a mano.** Todo cálculo en TypeScript se compara contra scikit-learn, statsmodels o hmmlearn.
5. **Color con significado fijo:** rojo = clase positiva (gana > 50K), datos de prueba o lo que se quiere resaltar; gris claro = lo que se compara contra el rojo.
6. **Legibilidad:** texto de lectura de 22 px o más en el lienzo de 1920×1080; etiquetas de 14 px o más.
7. **3D solo cuando ayuda** a entender: regiones de un árbol, superficies de pérdida, año × mes, nube de rezagos. Toda escena 3D permite girar y acercar.
8. **El dataset se enseña crudo antes de usarlo** (pedido del usuario, 2026-10-11): sus primeras 5 filas tal como llegan, la explicación de ese dataset y qué se le cambia; después, el método. Hecho en la 3 y la 4 para Adult y en la 29 para pasajeros aéreos (llega con `time` en decimal y `value`). **Pendiente:** lo mismo si el HMM usa datos (61, R4).

## Casos de estudio

| Parte | Caso | Datos |
|---|---|---|
| U7 Ensambles | **Adult / Census Income**: ¿la persona gana más de 50K al año? | 48 842 personas, 23.9 % positivos. El archivo trae 14 columnas; se usan 13 (se quita `fnlwgt`, el peso censal). Se conservan raza y sexo |
| U7, dibujos | **Adult con 3 variables** (edad, años de educación, horas por semana) | Se entrena con 10 000, se prueba con 5 000 y se dibujan 400. Bootstrap, AdaBoost e inestabilidad entrenan con las 400 visibles |
| U8 Series | **Pasajeros aéreos** mensuales 1949–1960 (Box-Jenkins) | 144 meses. Las diapositivas 29–40 describen la serie completa; desde la 41 se aparta 1960 como prueba y todo se ajusta con 1949–1959 |
| U8 HMM | **Clima oculto**: Lluvioso/Soleado y lo que hace el amigo (caminar, comprar, limpiar) | Ejemplo de libro: π = (0.6, 0.4), A = [[0.7, 0.3], [0.4, 0.6]], B = [[0.1, 0.4, 0.5], [0.6, 0.3, 0.1]] |

## Duración y reparto en clases

El profesor no fijó un tiempo: se pueden usar las clases que hagan falta mientras el tema quede bien explicado. La meta es **no pasar de 3 clases de hora y media, con 4 horas de exposición como máximo**.

Las duraciones anotadas en cada diapositiva suman ≈ 82 minutos de explicación corrida. Con 4 horas hay casi el triple, así que **no se recorta nada**: el tiempo extra es para operar las demos con calma y responder preguntas. Las marcas "recortable" quedan solo como reserva por si una clase se alarga.

| Clase | Diapositivas | Contenido | Explicación corrida |
|---|---|---|---|
| 1 | 1–19 | Apertura, bases, bagging, Random Forest y AdaBoost | ≈ 23 min |
| 2 | 20–40 | Descenso de gradiente, Gradient Boosting, XGBoost, comparación, puente y fundamentos de series | ≈ 29 min |
| 3 | 41–64 | Modelos de series, HMM y cierre | ≈ 30 min |

- El corte entre las clases 1 y 2 cae donde la 19 dice "hay otra forma de corregir: seguir el gradiente", y la clase 2 arranca con el fundamento de descenso de gradiente.
- El corte entre las clases 2 y 3 cae al terminar los fundamentos de series: la clase 3 empieza ya con los modelos.
- **Al iniciar las clases 2 y 3** se muestra el mapa de la diapositiva 2 con una marca "vamos aquí" y un repaso de un minuto. No cuenta como diapositiva nueva.

---

# Apertura (1–3)

### 1 · Portada (20 s) — hecha, con un ajuste
- **Ajuste:** una línea con equipo, grupo, profesor y fecha, que sale de `src/deck/meta.ts`. Si está vacío, no aparece.

### 2 · Mapa de la exposición (55 s)
- **Concepto:** una línea de recorrido tipo metro con las 11 paradas (Apertura, A–E, Puente, F–H, Cierre). Cada tramo mide lo que dura su sección y lleva 3 palabras clave. Dos corchetes: U7 y U8.
- **Caso:** bajo la línea aparecen los tres casos, cada uno con una miniatura real: barra 76 % / 24 % de Adult, la curva de pasajeros y el esquema de dos estados del clima.
- **Cierre:** se enciende en rojo el tramo Puente ("aquí cambia la validación") y un hilo "modelo → validación → métrica" que termina en la 62.
- **Gráficos:** `MapaExposicion`, `BarraClases`, minicurva de `SeriesChart`.
- **Datos:** conteo de diapositivas por sección (vivo); totales de Adult y serie de pasajeros (JSON).

### 3 · ¿Cómo sabemos si un modelo sirve? (100 s) — fundamento
- **Concepto 1:** el "modelo memorión". Una tabla de 6 alumnos inventados que el modelo se aprende de memoria: 6/6 con ellos, pero falla con 4 alumnos nuevos. Analogía: un examen con las mismas preguntas de la guía.
- **Concepto 2:** la receta en 4 columnas: **Datos → Modelo → Validación → Métrica**, con una frase cada una.
- **Concepto 3:** validación cruzada con 20 cuadros (5 positivos): se barajan, se parten en 5 pliegues y cada pliegue toma turno como prueba. Queda claro qué es "estratificado".
- **Caso:** ficha de una persona real de Adult con sus 14 variables y su respuesta. Luego la barra de las 48 842 personas partida en 5 pliegues, cada uno con su 24 % de positivos. Nota en una línea: incluye sexo y raza, y un modelo real exigiría revisar sesgos.
- **Cierre:** "un modelo se juzga con datos que no vio". La receta queda como franja que reaparece en 26, 30, 48 y 62.
- **Gráficos:** `Receta`, `Particiones`, `FichaPersona`, `BarraClases`.
- **Datos:** alumnos y 20 cuadros (esquema); filas y conteos de Adult (JSON).
- **Corrección de la revisión:** solo se animan las 4 filas nuevas; la parte del K-fold no depende de clics con mouse.
- **Clics tras la regla 9 (2026-10-14): 10.** Memorión, receta, K-Fold, Adult crudo con sus tres notas, los cuatro cambios en dos clics de dos, la ficha, la receta con Adult y la conclusión.

---

# PARTE 1 — Ensambles

## A. Bases (4–9)

### 4 · Árbol de decisión (75 s)
- **Concepto:** el juego de las 20 preguntas. Un árbol es una cadena de preguntas de sí o no. Se nombran sus partes sobre un árbol de esquema: raíz, nodo, hoja y profundidad.
- **Recordatorio · Gini:** "qué tan revuelta está la hoja". Tres urnas: 5 y 5 → 0.5; 9 y 1 → 0.18; 10 y 0 → 0. El árbol elige la pregunta que deja las hojas menos revueltas.
- **Caso:** el árbol real de profundidad 2 sobre Adult con 3 variables. A la izquierda, el diagrama del árbol con cada pregunta, cuántas personas caen y qué porcentaje gana > 50K. A la derecha, la escena 3D: cada pregunta aparece como un plano que corta la caja, sincronizado con el diagrama.
- **Cierre:** "un árbol parte el espacio en cajas, y cada caja predice lo que es mayoría adentro".
- **Gráficos:** `TreeDiagram` (nuevo), `Adult3DScene` (se extrae de la 5) con planos de corte, urnas en SVG.
- **Datos:** árbol de profundidad 2 (vivo, `fitClassifier`); se compara con el árbol de sklearn.

### 5 · Error de entrenamiento vs error de prueba (90 s) — hecha
- Concepto: definiciones y esquema. Caso: árbol 3D con deslizador de profundidad; luego la curva real de Adult completo. Cierre: 99.99 % en entrenamiento contra 81.1 % con personas nuevas; con profundidad 8, 85.6 %.
- **Ajuste:** usar `Adult3DScene` compartido.

### 6 · El árbol solo es inestable (70 s)
- **Concepto:** 6 puntos dibujados a mano. Se quita uno y la primera pregunta del árbol cambia por completo. Se calcula en vivo, no es un dibujo fijo.
- **Caso:** un árbol entrenado con las 400 personas visibles. El botón "quitar otras 5" elimina 5 personas al azar y el árbol se vuelve a entrenar: se ve cómo cambian las cajas. Un contador dice a cuántas de las 5 000 personas de prueba les cambió la predicción. Botones de profundidad (2, 4, sin límite): mientras más profundo, más cambia.
- **Cierre:** "cambiar 5 de 400 personas cambia el modelo: eso es alta varianza".
- **Gráficos:** `Adult3DScene` con cajas "antes" (contorno gris) y "después" (rojo); contador.
- **Datos:** todo vivo, con semilla fija.
- **Riesgo:** si con profundidad 4 cambia menos del 1 %, se sube la profundidad por omisión.

### 7 · Sesgo y varianza (90 s)
- **Concepto:** la diana de 2 × 2: tiros juntos y lejos del centro (sesgo), tiros dispersos alrededor del centro (varianza). Fórmula con cada término en palabras: error = sesgo² + varianza + ruido irreducible. Se aclara que es exacta para el error cuadrático.
- **Caso:** 25 árboles, cada uno entrenado con un grupo distinto de 400 personas (25 × 400 = las 10 000). En 3D se sobreponen las cajas de 5 de ellos: con un stump coinciden casi todas; con árboles sin límite, cada uno dibuja otra cosa. Abajo, barras apiladas para profundidad 1, 3 y sin límite: **error del promedio de los 25** (gris: sesgo² + ruido) y **varianza entre árboles** (rojo). Es una identidad exacta: el error promedio de los árboles = error del promedio + varianza.
- **Cierre:** "el árbol profundo casi no tiene sesgo; su problema es la varianza. Si pudiéramos promediar muchos, la varianza se iría." Eso prepara la 8.
- **Gráficos:** `Diana` (nuevo), `Adult3DScene` con varias capas, `BarrasApiladas`.
- **Datos:** vivo, sobre la probabilidad que da cada árbol; se comprueba que la identidad cierra a 1e-12.

### 8 · La sabiduría de las multitudes (90 s)
- **Concepto 1:** un jurado donde cada miembro acierta el 60 % de las veces y se equivoca por su cuenta. La mayoría de 11 acierta 75 %; la de 101, 98 % (fórmula binomial exacta). Dos condiciones: mejores que el azar y errores no copiados.
- **Concepto 2:** si se copian, promediar ayuda menos. Var(promedio) = ρσ² + (1 − ρ)σ²/B, con botones de ρ (0, 0.3, 0.6): la curva baja con B pero se queda en el piso ρσ².
- **Caso:** la varianza del promedio de B árboles de bagging en Adult, medida repitiendo el entrenamiento con 30 muestras distintas, junto a la curva de la fórmula con el ρ medido. Se ve el piso.
- **Cierre:** "promediar funciona mientras los árboles no se parezcan demasiado". El piso es lo que Random Forest intenta bajar (13–14).
- **Gráficos:** `Lineas` (curvas de mayoría y de varianza), puntos de un jurado votando.
- **Datos:** binomial y fórmula (vivo); `varianza_ensamble.json` (JSON: 30 repeticiones × 50 árboles; ρ = covarianza media entre árboles ÷ varianza media).
- **Rigor:** ρ se define exactamente así en pantalla. No se usa la correlación descriptiva entre predicciones (0.51 en bagging), que mide otra cosa.

### 9 · Dos caminos: en paralelo o en secuencia (45 s)
- **Concepto:** dos diagramas animados. **Paralelo:** los datos se remuestrean B veces, salen B árboles profundos e independientes y votan. Ataca la varianza. **Secuencial:** un árbol pequeño, sus errores, otro árbol que los corrige, y así. Ataca el sesgo.
- **Caso:** un adelanto con los números reales de Adult: árbol 0.743 → bagging 0.788 y RF 0.795 (paralelos); AdaBoost 0.789, GB 0.815 y XGBoost 0.817 (secuenciales), en F1-macro.
- **Gráficos:** `FlujoEnsamble` (nuevo; se reutiliza como miniatura en la 25), `PuntosIntervalo`.
- **Datos:** `comparacion_adult.json`.
- **Regla 9 (2026-10-14):** siguen 3 clics; en el del adelanto los dos diagramas se pliegan y los puntos de F1-macro se ven grandes.

## B. Bagging (10–12)

### 10 · Bootstrap (80 s)
- **Recordatorio · muestreo con reemplazo:** 5 pelotas numeradas. Se saca una, se anota y se regresa, 5 veces. Animado: unas salen dos veces y otras nunca. Botón "otro sorteo".
- **Concepto:** la probabilidad de no salir nunca es (1 − 1/n)ⁿ. Con 5 pelotas, 32.8 %; con muchas, e⁻¹ ≈ 36.8 %. La derivación está en R1.
- **Caso:** las 400 personas en 3D. Cada sorteo ilumina a las elegidas (más grandes si salieron 2 o 3 veces) y deja huecas a las que quedaron fuera. Contador de este sorteo: "distintas 253 · fuera 147". Un botón lanza 200 sorteos y arma el histograma del porcentaje que queda fuera, centrado en 36.7 %.
- **Cierre:** "cada muestra es un conjunto parecido pero distinto: un árbol por muestra".
- **Gráficos:** `TableroSorteos` (compartido con R1), `Adult3DScene` con tamaño por repeticiones, histograma.
- **Datos:** vivo; el valor esperado para 400 es 146.97.

### 11 · Agregación: muchos árboles, una respuesta (85 s)
- **Concepto:** tres árboles opinan sobre una persona: sí, sí, no → gana el sí. En clasificación se vota o se promedian probabilidades; en regresión se promedia. Nota: sklearn promedia probabilidades.
- **Caso:** bagging entrenándose en vivo sobre Adult con 3 variables. Botones 1, 10 y 100 árboles. A la izquierda, el volumen 3D donde más de la mitad vota "sí"; a la derecha, un corte 2D (edad × educación, a 40 horas) pintado con la fracción de votos: con 1 árbol son escalones bruscos; con 100, una frontera suave. Abajo, el error de prueba contra el número de árboles.
- **Cierre:** "es el promedio de la 7 hecho realidad: mismo sesgo, menos varianza".
- **Gráficos:** `VoteVolume3D` (nuevo), `Corte2D` (nuevo, mapa de calor), `Lineas`.
- **Datos:** `lib/bagging.ts` (vivo, entrena por tandas para no congelar la pantalla); su accuracy se compara con `BaggingClassifier`.
- **Clics tras la regla 9 (2026-10-14): 6.** Concepto; 1, 10 y 100 árboles con el 3D y el corte 2D; la curva de error sola; la conclusión con la nota de las 3 variables.

### 12 · OOB: validación gratis (70 s)
- **Concepto:** cada árbol no vio a ≈ 37 % de las personas. A cada persona la califican solo los árboles que no la vieron. Esquema: matriz de 8 personas × 6 árboles con celdas "la vio / no la vio"; se resalta una fila y solo votan los que no la vieron.
- **Caso:** en Adult completo, accuracy OOB contra validación cruzada, con 25 a 300 árboles. Las dos curvas van juntas (ya medido con 100 árboles: OOB 0.850, prueba 0.857). Al lado, el costo: OOB = 1 entrenamiento, CV = 5.
- **Cierre:** "una estimación del error de prueba sin apartar datos". Solo existe en bagging y Random Forest, y con pocos árboles es algo pesimista.
- **Gráficos:** `MatrizOOB` (nuevo), `Lineas`.
- **Datos:** `oob_vs_cv.json` (JSON).
- **Clics tras la regla 9 (2026-10-14): 5.** La advertencia de pocos árboles y la conclusión van en clics distintos.

## C. Random Forest (13–16)

### 13 · Por qué el bagging no basta (60 s)
- **Concepto:** consejeros que leen todos el mismo periódico opinan igual y se equivocan igual. Tres árboles de esquema con la misma primera pregunta.
- **Caso:** una rejilla de 100 celdas, una por cada árbol de bagging en Adult, con la variable de su raíz. **Las 100 son `relationship`** (ya comprobado). Se muestra qué pregunta es: "¿es esposo?". Se liga con el piso ρσ² de la 8.
- **Cierre:** "si una variable manda, todos los árboles empiezan igual".
- **Gráficos:** `RejillaRaices` (nuevo; se reutiliza en la 14).
- **Datos:** `raices.json` (JSON: variable de la raíz y del segundo nivel de 100 árboles de bagging y 100 de RF).

### 14 · Random Forest: sortear las variables (85 s)
- **Concepto:** en cada pregunta el árbol solo puede elegir entre unas cuantas variables sorteadas. Animación: 14 tarjetas, se sortean 3, se elige la mejor de esas, y en el siguiente corte se sortean otras.
- **Recordatorio:** Breiman sugiere √p en clasificación y p/3 en regresión. En sklearn el clasificador usa √p (aquí, 3 de 14) y el regresor usa todas.
- **Caso:** la rejilla de raíces ahora con RF: ya no es una sola (capital-gain 22, relationship 17, marital-status 15, education-num 11…). Tres números lado a lado, bagging contra RF: la correlación entre árboles, el accuracy de un árbol suelto (baja) y el del bosque (sube). Curva de accuracy contra variables sorteadas (1 a 14): con 14 es bagging.
- **Cierre:** "cada árbol es un poco peor, pero juntos son mejores". En Adult la ganancia es modesta (F1 0.788 → 0.795) y así se dice.
- **Gráficos:** `SorteoVariables` (nuevo), `RejillaRaices`, `Lineas`.
- **Datos:** `raices.json`, `varianza_ensamble.json`, `rf_hiperparametros.json` (JSON).
- **Clics tras la regla 9 (2026-10-14): 6.** El recordatorio de √p en su clic; la tabla contra bagging y la curva de variables sorteadas en clics distintos; la conclusión al final.

### 15 · ¿Qué variables importan? (80 s)
- **Concepto:** dos formas de medirlo. **MDI:** cuánto baja la impureza cada vez que el bosque usa esa variable (se mide al entrenar). **Permutación:** se baraja una columna en datos no vistos y se mide cuánto empeora el modelo. Animación de una columna barajándose en una tabla pequeña.
- **Caso:** dos gráficas de barras lado a lado para el RF de Adult. Se agrega una columna de **ruido aleatorio** como control: en MDI aparece con importancia (igual que `fnlwgt`); en permutación vale cero.
- **Cierre:** "MDI favorece a las variables con muchos valores distintos; la permutación en datos no vistos es más confiable". Aviso: las variables parecidas (relationship, marital-status, sexo) se reparten la importancia.
- **Gráficos:** `BarrasH` con barras de error, `ColumnaBarajada` (local).
- **Datos:** `importancias.json` (JSON; permutación con 10 repeticiones sobre datos de prueba).

### 16 · Hiperparámetros de Random Forest (60 s) — recortable
- **Concepto:** cuatro perillas, cada una con una frase: número de árboles (más es mejor hasta que se estabiliza), variables por corte (diversidad contra fuerza), tamaño mínimo de hoja (suaviza) y tamaño de la muestra.
- **Caso:** tres gráficas pequeñas de Adult: accuracy contra número de árboles (se aplana y no empeora), contra variables por corte y contra tamaño mínimo de hoja.
- **Cierre:** "los valores por omisión ya son buenos; lo que más conviene ajustar es el tamaño de hoja y las variables por corte".
- **Gráficos:** `Lineas` × 3.
- **Datos:** `rf_hiperparametros.json` (JSON).
- **Clics tras la regla 9 (2026-10-14): 5.** Las tres gráficas aparecen una por clic y se quedan juntas; la conclusión al final.

## D. Boosting (17–24)

### 17 · Boosting: repasar lo que salió mal (60 s)
- **Concepto:** estudiar para un examen repasando solo lo que fallaste. Cadena animada: modelo 1 → sus errores → modelo 2 → …
- **Recordatorio · learner débil:** un modelo apenas mejor que adivinar. Un *stump* es un árbol de una sola pregunta.
- **Caso:** el mejor stump de Adult completo: "¿es esposo?". Separa a las personas en dos grupos con proporciones muy distintas de quienes ganan > 50K, pero **su accuracy es 76.1 %, igual que decir siempre "no"**, porque en los dos lados gana el "no" (ya comprobado). En 3D, el mejor stump de las 3 variables es un solo plano.
- **Cierre:** "un stump solo casi no sirve. La pregunta es cómo sumar muchos."
- **Gráficos:** `FlujoEnsamble` (secuencial), `BarraClases` × 2 (los dos lados del stump), `Adult3DScene` con un plano.
- **Datos:** `stump_adult.json` (JSON); stump de 3 variables (vivo).
- **Clics tras la regla 9 (2026-10-14): 5.** La conclusión va en su propio clic.

### 18 · AdaBoost (1): darle más peso a los errores (85 s)
- **Concepto:** 8 puntos de esquema. Ronda 1: un stump los separa y se equivoca en algunos. Esos puntos crecen. Ronda 2: el nuevo stump se fija en los grandes.
- **Caso:** AdaBoost sobre las 400 personas visibles. Con ↑ ↓ se avanza de ronda (1 a 50). El tamaño de cada punto es su peso; se ve el plano del stump de esa ronda y la región que el comité completo clasifica como "sí". Al lado, el error del comité en entrenamiento y en prueba por ronda.
- **Cierre:** "cada stump se especializa en lo que el comité todavía falla".
- **Gráficos:** `PuntosPonderados` (esquema), `Adult3DScene` con tamaño por peso, `VoteVolume3D`, `Lineas`.
- **Datos:** `lib/adaboost.ts` (vivo); debe dar las mismas predicciones que `AdaBoostClassifier` con stumps.

### 19 · AdaBoost (2): cuánto vale el voto de cada stump (90 s)
- **Concepto:** tres fórmulas, una a la vez. Error ponderado ε. Peso del voto α = ½·ln((1 − ε)/ε), con su curva: si ε = 0.5 el voto vale 0; mientras menos se equivoca, más vale. Actualización de pesos y voto final.
- **Dos rondas a mano** con los 8 puntos del esquema, en una tabla que se llena: ε, α, pesos nuevos. Un dato que ayuda: después de actualizar, los puntos mal clasificados suman exactamente la mitad del peso.
- **Nota al pie:** sklearn usa SAMME, α = ln((1 − ε)/ε) + ln(K − 1). Con 2 clases es el doble y clasifica igual.
- **Caso:** barras de ε y α por ronda en las 400 personas: ε se acerca a 0.5 y α se achica.
- **Cierre:** "AdaBoost corrige cambiando pesos. Hay otra forma de corregir: seguir el gradiente." Eso lleva a la 20.
- **Gráficos:** curva α(ε), `TablaAMano` (compartida con 58 y 59), barras.
- **Datos:** vivo. Enlace a R2.
- **Clics tras la regla 9 (2026-10-14): 6.** Fórmulas 1 y 2 con la curva; fórmulas 3 y 4; la tabla con la ronda 1 y luego con las dos; el caso (ε y α); la nota de SAMME y la conclusión.

### 20 · Descenso de gradiente (100 s) — hecha, fundamento
- Concepto: montaña con niebla, superficie de juguete y botones de η. Caso: la log-loss real de σ(w·educación + b) en Adult, con el límite η < 2/λmax ≈ 9.5 cerca del mínimo. Cierre: en Gradient Boosting el paso agrega un árbol; con log-loss el árbol aprende y − p.
- **Regla 9 (2026-10-14):** siguen 5 clics; la escena ocupa el alto del cuerpo, el recordatorio del gradiente solo en el primer clic y en el caso un bloque de texto por clic.

### 21 · Gradient Boosting (90 s)
- **Concepto:** regresión de esquema con 10 puntos de una curva. Se empieza con el promedio. Se calculan los residuos (lo que falta). Un árbol pequeño aprende los residuos. Se suma una fracción de ese árbol. Arriba, la predicción acercándose a los puntos; abajo, los residuos encogiéndose. Con ↑ ↓ se avanza de ronda.
- **Fórmula:** F_m = F_{m−1} + ν·h_m, donde h_m aprende −∂L/∂F. Con error cuadrático son los residuos; con log-loss, y − p.
- **Caso:** Adult con 3 variables. Al inicio todos tienen p = 0.239, así que a quien gana > 50K le falta 0.761 y a quien no, −0.239. El tamaño de cada punto es cuánto le falta. Al avanzar las rondas los puntos se achican. Histograma de lo que falta y log-loss de entrenamiento y prueba por ronda.
- **Cierre:** "cada árbol aprende lo que le falta al modelo anterior".
- **Gráficos:** `BoostingPasoAPaso` (nuevo, 2 paneles), `Adult3DScene` con tamaño por residuo, histograma, `Lineas`.
- **Datos:** `lib/gboost.ts` (vivo; requiere árbol de regresión en `tree.ts`); las probabilidades por ronda se comparan con `GradientBoostingClassifier`.

### 22 · Tasa de aprendizaje y cuándo parar (80 s)
- **Concepto:** ν es el tamaño del paso de la 20, ahora al sumar árboles. Pasos chicos piden más árboles pero llegan mejor.
- **Caso:** en Adult completo, log-loss de validación contra número de árboles (1 a 2 000) para ν = 1, 0.3, 0.1 y 0.03. La de entrenamiento siempre baja; la de validación baja y **vuelve a subir** cuando ν es grande. Se marca el mínimo de cada curva y dónde habría parado el *early stopping*. En gris, Random Forest: plano, no empeora.
- **Cierre:** "boosting sí se sobreajusta con demasiados árboles: ν chico, muchos árboles y parar a tiempo".
- **Gráficos:** `Lineas` con marcadores, botones de ν.
- **Datos:** `gb_shrinkage.json` (JSON). Partición 60/20/20: el paro se decide con validación y el resultado final se reporta con prueba.

### 23 · XGBoost (1): un objetivo que cobra por la complejidad (80 s)
- **Recordatorio · regularizar:** cobrarle un "impuesto" al modelo por ser complejo. L1 suma |w|; L2 suma w².
- **Concepto:** objetivo = pérdida + γ·T + ½·λ·‖w‖². Sobre un árbol de esquema con 3 hojas se señala T (cuántas hojas) y w (el valor de cada hoja) y se calcula el impuesto. γ cobra por cada hoja; λ cobra por valores grandes.
- **Caso:** XGBoost en Adult con λ = 0, 1, 10, 100 y γ = 0, 1, 5: cuántas hojas tiene el modelo y la distancia entre la log-loss de entrenamiento y la de validación. Más impuesto → árboles más chicos y menos distancia.
- **Cierre:** "XGBoost es Gradient Boosting con el freno incluido en la fórmula".
- **Gráficos:** `TreeDiagram` con valores de hoja, rejilla λ × γ.
- **Datos:** `xgb_regularizacion.json` (JSON).
- **Clics tras la regla 9 (2026-10-14): 5.** En el caso, la rejilla se lee en tres clics: sin cobros, qué hace cada cobro y la conclusión.

### 24 · XGBoost (2): segundo orden, faltantes y velocidad (110 s)
- **Recordatorio · curvatura:** la segunda derivada dice qué tan rápido cambia la pendiente. Se liga con la 20: allí la curvatura limitaba el tamaño del paso.
- **Concepto 1:** XGBoost usa pendiente (g) y curvatura (h). Con log-loss, g = p − y y h = p(1 − p). El valor de cada hoja sale directo: w* = −G/(H + λ). Ejemplo a mano con 4 personas de esquema.
- **Concepto 2 · faltantes:** en cada pregunta hay una tercera flecha: "si falta el dato, ve por la rama que más conviene", aprendida de los datos.
- **Caso 1:** en Adult faltan `workclass` (2 799) y `occupation` (2 809). Se compara XGBoost con los faltantes tal cual contra tratarlos como una categoría más. Se muestra lo que salga.
- **Concepto 3 · paralelismo:** los árboles van uno tras otro; lo que se reparte entre núcleos es la búsqueda del mejor corte dentro de cada árbol.
- **Caso 2:** tiempos medidos: Gradient Boosting de sklearn 44 s, XGBoost 4 s, y XGBoost con 1 núcleo.
- **Gráficos:** parábola local (pendiente y curvatura), `TablaAMano`, `TreeDiagram` con la tercera flecha, barras de tiempo.
- **Datos:** `xgb_faltantes_tiempos.json` (JSON).
- **Riesgo:** es la más cargada de la parte 1. Si no cabe en 110 s, el paralelismo pasa a la 25.
- **Clics tras la regla 9 (2026-10-14): 7.** Curvatura (2 clics); faltantes en tres (el esquema, la tabla de Adult, a dónde manda a quien le falta); velocidad y conclusión.

## E. Cierre de la parte 1 (25–28)

### 25 · Los cinco, lado a lado (60 s)
- **Concepto:** una tabla que se revela renglón por renglón. Columnas: Bagging, Random Forest, AdaBoost, Gradient Boosting, XGBoost. Renglones: cómo se construye, modelo base, qué ataca, cómo combina, de dónde sale la diversidad, si se sobreajusta con más árboles, sensibilidad al ruido y qué ajustar.
- **Caso:** el último renglón, con F1-macro y tiempo de cada uno en Adult.
- **Gráficos:** tabla editorial con miniaturas de `FlujoEnsamble`.
- **Datos:** `comparacion_adult.json`.
- **Clics tras la regla 9 (2026-10-14): 9.** Cada renglón entra completo y los anteriores quedan resumidos en una o dos palabras; lo medido en Adult en un clic y el renglón de etiquetas equivocadas con su explicación en otro.

### 26 · Cómo se comparan los modelos (110 s) — fundamento
- **Concepto 1:** 10 personas de esquema (3 ganan > 50K). El modelo predice y cada persona se mueve a su casilla de la **matriz de confusión**. De ahí salen, una a una: accuracy, precision ("de los que dije sí, cuántos eran"), recall ("de los que eran, cuántos encontré") y F1.
- **Concepto 2:** el modelo que dice siempre "no": accuracy alto, pero no encuentra a nadie. F1-macro promedia el F1 de cada clase y lo delata.
- **Caso:** la matriz de confusión real de Adult con botones para cambiar de modelo. Con "clase mayoritaria": accuracy 0.761, F1-macro 0.432. Luego, qué significa "media ± desviación": los 5 puntos de los 5 pliegues y su promedio.
- **Cierre:** "con clases desbalanceadas, accuracy sola engaña".
- **Gráficos:** `MatrizConfusion` (nuevo, animada), `PuntosIntervalo`, franja `Receta`.
- **Datos:** 10 personas (esquema, calculado en vivo); `matrices_adult.json` (JSON, con el valor de cada pliegue).
- **Clics tras la regla 9 (2026-10-14): 11.** El modelo que siempre dice "no" en dos clics (definición y tabla; la lectura); la matriz real, los pliegues y la conclusión, cada uno en su clic.

### 27 · Demo: los siete modelos en Adult (100 s)
- **Caso (todo):** gráfica de F1-macro con los 5 pliegues de cada modelo, que se revela en orden:
  1. Clase mayoritaria: el piso.
  2. Árbol sin límite: 99.99 % en entrenamiento, 81 % en validación.
  3. Bagging: el salto grande.
  4. Random Forest: mejora poco.
  5. AdaBoost, Gradient Boosting y XGBoost.
  6. Error contra número de árboles para los cuatro ensambles.
- **Advertencias en pantalla:** sin ajustar hiperparámetros; las diferencias del tamaño de una desviación no son concluyentes (se muestra la diferencia pliegue a pliegue entre GB y XGBoost); un árbol podado a profundidad 8 llega a 0.856.
- **Gráficos:** `PuntosIntervalo`, `Lineas`, tabla de métricas.
- **Datos:** `comparacion_adult.json` (se vuelve a exportar con el valor por pliegue), `curvas_n_estimators.json`.
- **Clics tras la regla 9 (2026-10-14): 10.** Los tres avisos (sin ajustar, GB contra XGBoost, el árbol podado) van uno por clic, a todo lo ancho.

### 28 · Cuándo usar cada uno (60 s)
- **Caso:** una guía de 5 renglones, cada uno con su evidencia de Adult:
  - Hay que explicar la decisión → árbol podado (85.6 %).
  - Buen resultado sin ajustar → Random Forest.
  - Máximo desempeño en datos tabulares → Gradient Boosting o XGBoost.
  - Muchos datos, faltantes o poco tiempo → XGBoost (≈ 11 veces más rápido aquí).
  - Etiquetas con errores → evitar AdaBoost.
- **Gráfico:** dispersión de tiempo de entrenamiento (escala log) contra F1-macro, un punto por modelo.
- **Cierre:** puente a la parte 2: "todo esto supuso que las filas se pueden barajar".
- **Datos:** `comparacion_adult.json`.
- **Regla 9 (2026-10-14):** siguen 6 clics; cada renglón entra con su evidencia y los anteriores quedan en una línea (situación → modelo).

---

# PARTE 2 — Datos secuenciales

Especificaciones detalladas: `docs/especificaciones/F1-…`, `F2-…`, `G-…` y `H-…`.

## Puente (29–30)

### 29 · El orden importa (70 s)
- **Recordatorio · i.i.d.:** independientes (saber un dato no cambia lo que esperas del siguiente) e idénticamente distribuidos.
- **Concepto:** dos tiras de 24 valores: tiradas de un dado y una serie con memoria. Botón "barajar": el dado se ve igual; la serie pierde sus subidas y bajadas.
- **Caso:** primero el dataset crudo (`pasajeros.head()`: `time` en decimal y `value`) y qué se le cambia (regla 8). Después, los pasajeros 1949–1960 con el mismo botón. Al lado, la dispersión "este mes contra el siguiente" con su correlación; al barajar, la nube se deshace. 7 clics.
- **Cierre:** "en una serie, el orden también es dato".
- **Gráficos:** tiras locales, `TablaCruda`, `SeriesChart`, `Dispersion`. **Datos:** dado y serie con memoria (esquema); pasajeros (JSON); correlación (vivo).

### 30 · Validación temporal (90 s) — no recortar
- **Recordatorio · validación cruzada** (liga con la 3).
- **Concepto:** K-Fold barajado sobre 20 momentos: una flecha roja señala una celda de prueba cuyo vecino del futuro está en entrenamiento. Es fuga de datos. El diagrama se transforma en `TimeSeriesSplit` (el entrenamiento siempre antes que la prueba) y en *walk-forward*.
- **Caso:** las dos particiones sobre los 144 meses y el mismo modelo evaluado de las dos formas en los mismos 24 meses (1959–1960; para esta demostración se entrena hasta 1958): barajado parece mucho mejor de lo que es (Random Forest 26.2 contra 67.2; regresión lineal 23.1 contra 43.0), y se muestra con 20 barajados porque con uno solo, o probando solo 1960, el resultado no es estable.
- **Cierre:** "siempre se prueba con fechas posteriores a las de entrenamiento"; y que describir la serie no es evaluar un modelo: desde la 41, 1960 se guarda como prueba.
- **Gráficos:** `SplitDiagram` (se reutiliza en 50 y 62), `SeriesChart`. **Datos:** `validacion_temporal.json` (JSON).

## F. Fundamentos de series (31–40)

### 31 · ¿Qué es una serie de tiempo? (60 s)
- **Concepto:** una misma variable medida en momentos ordenados y regulares; índice t, frecuencia y horizonte.
- **Caso:** la tabla de 12 años × 12 meses de pasajeros se "desdobla" en una línea de tiempo. Un cursor lee "t = 79 · jul 1955 · 364 mil". Al final, 12 casillas punteadas: "1961 ?".
- **Gráficos:** `TablaASerie`, `SeriesChart` con cursor. **Datos:** `pasajeros.json`.

### 32 · Tendencia y estacionalidad (75 s)
- **Concepto:** tres esquemas apilados: una recta (tendencia), una onda de periodo 12 (estacionalidad) y su suma.
- **Caso 1:** pasajeros con la media de cada año como escalón (126.7 → 476.2) y el pico de cada año marcado (julio o agosto).
- **Caso 2 (3D):** barras con mes en un eje y año en el otro. Vista "por meses" muestra la joroba del verano; vista "por años" muestra la subida.
- **Gráficos:** `SeriesChart`, `AnioMes3D` (nuevo; se reutiliza en 36 y 47). **Datos:** vivo sobre `pasajeros.json`.

### 33 · Ciclo, estacionalidad y ruido (55 s) — recortable
- **Concepto:** estacionalidad = periodo fijo de calendario; ciclo = vueltas de duración variable; ruido = lo que queda sin patrón. Dos series de esquema que se "doblan" en renglones de 12: en la estacional los picos caen en la misma columna; en la cíclica, dispersos.
- **Caso:** mapa de calor de 12 × 12 de pasajeros (porcentaje arriba o abajo de la media de su año): la columna de julio y agosto siempre en rojo.
- **Gráficos:** `CalendarGrid`. **Datos:** vivo.

### 34 · Descomposición: aditiva o multiplicativa (90 s)
- **Concepto:** dos esquemas. Aditiva: la onda mide siempre lo mismo. Multiplicativa: la onda crece con el nivel y forma un embudo.
- **Caso:** pasajeros con su embudo (la onda pasa de 44 a 232). Botón "lineal / log": con logaritmo el embudo se vuelve una banda pareja. Luego los 4 paneles (observada, tendencia, estacional, residuo), con botones aditiva y multiplicativa y el error de cada una.
- **Cierre:** "en pasajeros es multiplicativa: para modelarla se usa el logaritmo" (36, 37 y la sección G; la 38 y la 39 siguen con pasajeros sin transformar). El logaritmo la vuelve casi aditiva, no del todo. 6 clics: aditiva y multiplicativa en pasos separados.
- **Gráficos:** `SeriesChart` (escala log), `MiniBars`, `DecompositionPanels`. **Datos:** descomposición clásica (vivo; se compara con `seasonal_decompose`).

### 35 · Estacionariedad (90 s)
- **Recordatorio · media, varianza y covarianza.**
- **Concepto:** 200 historias simuladas de una serie estacionaria y 200 de un paseo aleatorio. Un corte vertical que se mueve con ↑ ↓: en la estacionaria la media y la dispersión no cambian con t; en el paseo, la dispersión crece.
- **Caso:** "solo tenemos una historia": media y desviación de cada año de pasajeros. Ambas crecen. Con logaritmo la desviación se empareja, pero la media sigue subiendo.
- **Cierre:** "pasajeros no es estacionaria; hay que transformarla".
- **Gráficos:** `EnsembleCut`, `MiniBars`. **Datos:** historias (esquema con semilla); ventanas anuales (vivo).

### 36 · Diferenciar (90 s)
- **Concepto:** los modelos estiman números fijos (una media, un peso), y eso solo tiene sentido si la serie no cambia de comportamiento. Con una serie de juguete de 12 valores: restar el anterior quita la tendencia; restar el mismo trimestre del año pasado quita la estacionalidad.
- **Caso (3D):** superficie año × mes del logaritmo de pasajeros. Botones: log → ∇ log → ∇₁₂ log → ∇∇₁₂ log, cada uno con su clic (7 en total). La superficie se va aplanando hasta quedar como ruido alrededor de cero.
- **Cierre:** "logaritmo, una diferencia y una diferencia estacional: se pierden 13 meses y quedan 131".
- **Gráficos:** `OperacionAnimada`, `AnioMes3D` (superficie). **Datos:** vivo.

### 37 · Prueba ADF (90 s)
- **Concepto:** dos series con los mismos choques: una regresa a su media; la otra acumula cada choque para siempre (raíz unitaria). ADF mide si la serie "tira" hacia su media.
- **Recordatorio · p-valor.** El histograma del estadístico cuando sí hay raíz unitaria (20 000 simulaciones) con la línea del 5 %.
- **Caso:** la tabla de ADF para cada transformación de pasajeros, fila por fila: log (no), ∇ log (no, p ≈ 0.07), ∇₁₂ log (no), ∇∇₁₂ log (sí, p ≈ 0.0003). Cada fila pone su marcador en el histograma.
- **Advertencia (clic propio):** las filas de ∇ log y ∇₁₂ log están en la frontera: con rezagos elegidos por BIC dan p = 0.030 y 0.013.
- **Cierre:** "ADF descarta la raíz unitaria con las dos diferencias. Que haga falta la diferencia estacional no lo dice ADF: lo dicen el patrón por mes de la 36 y los picos cada 12 de la 39. Para pasajeros: d = 1 y D = 1."
- **Gráficos:** `SeriesChart`, `ScatterFit`, `NullDistribution`. **Datos:** `adf_pasajeros.json` (JSON, statsmodels).

### 38 · Promedio móvil como suavizado (75 s)
- **Concepto:** una ventana que se desliza sobre 9 puntos de esquema y promedia a los vecinos.
- **Caso:** pasajeros con su promedio móvil y botones de ventana (3, 5, 7, 2×12): con 2×12 la estacionalidad se cancela y queda la tendencia. Centrado contra atrasado: el centrado necesita 6 meses del futuro.
- **Cierre:** un diagrama de dos columnas, "promedio móvil (suaviza observaciones; no pronostica)" contra "MA(q) (modelo de choques; diapositiva 43)". **No son lo mismo.**
- **Gráficos:** `OperacionAnimada`, `SeriesChart`. **Datos:** vivo.

### 39 · Rezagos y autocorrelación (ACF) (85 s)
- **Concepto:** una tabla de 8 valores con sus columnas recorridas 1 y 2 lugares. Se calcula r₁ a mano: suma de productos entre suma de cuadrados.
- **Caso:** la serie y su copia recorrida k meses, que se desliza con ↑ ↓. Abajo se construye el correlograma barra por barra. Se anota: "decae muy lento: tendencia" y "picos en 12 y 24: estacionalidad". Banda de ±1.96/√n.
- **Cierre:** el correlograma de ∇∇₁₂ log: casi todo dentro de la banda, salvo los rezagos 1 y 12.
- **Gráficos:** `LagTable`, `SeriesChart`, `Correlogram` (se reutiliza en 40–50). **Datos:** `lib/series.ts` (vivo; se compara con `acf` de statsmodels).

### 40 · Autocorrelación parcial (PACF) (85 s)
- **Concepto:** la ACF cuenta todo el parecido, incluso el que llega "de rebote" por los valores intermedios; la PACF solo el directo. Diagrama de cadena x(t−2) → x(t−1) → x(t).
- **3D:** nube de un AR(1) simulado con ejes x(t−2), x(t−1) y x(t). De frente se ve relación (eso es la ACF en 2). Al girar aparece el plano de regresión: con x(t−1) presente, x(t−2) ya no aporta (eso es la PACF en 2 ≈ 0).
- **Caso:** ACF y PACF de ∇∇₁₂ log lado a lado, con los rezagos 1 y 12 marcados.
- **Cierre:** "ACF y PACF son las huellas para elegir el modelo" (46).
- **Gráficos:** `LagCloud3D` (se reutiliza en 42), `Correlogram`. **Datos:** PACF por Durbin-Levinson (vivo; se compara con statsmodels).

## G. Modelos de series (41–50)

Regla de la sección: todo se ajusta con 1949–1959 (132 meses). 1960 aparece tapado con un bloque "PRUEBA · 1960" hasta que se evalúa. Los números cambian un poco respecto a 36–40 (144 meses) y la 41 lo dice. Plan y bitácora: `docs/hitos/HITO-5.md`.

### 41 · Ruido blanco (70 s)
- **Concepto:** una serie simulada sin memoria: media cero, varianza constante, sin autocorrelación. Su ACF queda dentro de la banda (sale 1 de 24, y se dice que no tienen que salir 0); la dispersión "hoy contra ayer" es una nube redonda; su mejor pronóstico es una línea plana. Botón "otra muestra".
- **Caso:** los pasajeros no son ruido blanco (24 de 24 barras fuera). Desde aquí se ajusta con 132 meses. Tras transformar, casi lo son: quedan 1 y 12 (y salen 3 y 23).
- **Cierre:** "un modelo sirve si lo que le sobra parece ruido blanco".
- **Gráficos:** `SeriesChart`, `Correlogram` (con contador), `Dispersion`. **Datos:** 132 choques con semilla 170 (`src/slides/choquesG.ts`), que se reutilizan en 42–45.

### 42 · AR(p) (90 s)
- **Concepto:** el valor de hoy = una fracción del de ayer + un choque nuevo. Botones de φ (0, 0.5, 0.9, −0.6, 1) sobre los mismos choques de la 41. "Eco de un choque": barras φᵏ que se apagan. Condición |φ| < 1.
- **Caso (3D):** crecimiento anual de pasajeros. La nube de la 40 de canto con la recta AR(1); al girar aparece el plano AR(2) con sus residuos.
- **Cierre:** pronóstico AR(2) del crecimiento de 1960, que regresa hacia la media (1960 sigue tapado).
- **Gráficos:** `SeriesChart`, `Barras`, `LagCloud3D` (`centro`, `recta`, `residuos`). **Datos:** mínimos cuadrados (vivo, comparado con `AutoReg`).

### 43 · MA(q) (80 s)
- **Concepto:** "cinta de choques": el valor de hoy = el choque de hoy + una fracción del de ayer (corchete con ↑ ↓). Ecos lado a lado: AR se apaga poco a poco; MA da dos barras y luego cero.
- **Tabla "No confundir":** promedio móvil de la 38 contra MA(q). (La gráfica del 2×12 de la especificación no va: la 38 ya la enseñó.)
- **Caso:** un MA(1) ajustado a ∇∇₁₂ log; su predicción a un paso explica el 10 % de la variación; su ρ₁ teórico (−0.31) coincide con el observado (−0.32). Su pronóstico de 1960: corrige un mes y después se queda en 0.
- **Gráficos:** cinta (local), `Barras`, `SeriesChart`, `Correlogram` con `teorica`. **Datos:** `series_modelos.json` (θ̂ y pronóstico); la recursión, viva.

### 44 · ARMA(p,q) (60 s)
- **Concepto:** tres ecos lado a lado: AR(1), MA(1) y ARMA(1,1). Parsimonia exacta: para imitar ese ARMA(1,1) un AR puro necesita 5 coeficientes.
- **Caso:** ACF del crecimiento anual con las ACF teóricas de MA(1), AR(1), ARMA(1,1) y AR(2) (botones). MA(1) y AR(1) no alcanzan; ARMA(1,1) y AR(2) empatan hasta el rezago 8; después ninguno: la barra del 12 sale de la banda (puente a la 47). **Cambió respecto a la especificación**, que decía que el ARMA "es el que sigue a las barras".
- **Gráficos:** `Barras`, `Correlogram` con `teorica` (curvas en blanco y gris, continuas o punteadas). **Datos:** `series_modelos.json`; teóricas, vivas.

### 45 · ARIMA(p,d,q) (75 s)
- **Concepto:** la "I" es integrar. Un paseo aleatorio es la suma acumulada de choques (↑ ↓). Su pronóstico es plano y su incertidumbre crece como √h (abanico).
- **Caso:** ARIMA(0,1,1) con deriva sobre el logaritmo (la aerolínea sin su parte estacional): se pronostica el cambio mensual y se "vuelve a sumar". Se revela 1960 real: la curva pasa por en medio de la onda, corta de abril a septiembre y pasada el resto. **Cambió:** el de menor AIC, ARIMA(2,1,1), tiene la raíz MA en 1.002 y pronostica peor; queda como respuesta preparada.
- **Cierre:** "diferenciar, modelar y volver a sumar; falta el rezago 12".
- **Gráficos:** `SeriesChart` con `franjas`, `Barras`, `Correlogram`. **Datos:** `series_modelos.json`.

### 46 · Identificación con ACF y PACF (85 s)
- **Concepto:** rejilla de 3 × 2 con las huellas teóricas: AR(2) (la PACF se corta en 2), MA(1) (la ACF se corta en 1) y ARMA(1,1) (las dos decaen). Luego las mismas con muestras simuladas ("otra muestra"), para ver que en datos reales es menos limpio.
- **Caso:** ACF y PACF de pasajeros transformados. Rezagos cortos: q = 1, o también p = 1 (el 3 sale en las dos). Rezagos estacionales: pico en 12 y nada en 24 ni 36 → Q = 1. Con la banda de Bartlett solo quedan fuera 1, 3 y 12. Candidatos: SARIMA(0,1,1)(0,1,1)₁₂ y SARIMA(1,1,0)(0,1,1)₁₂.
- **Gráficos:** `Correlogram` × 6 y × 2 (`teorica`, `marcar`, `atenuar`, `banda="bartlett"`), tabla de reglas. **Datos:** teóricas y caso, vivos; muestras, esquema con semilla 3.

### 47 · SARIMA (90 s)
- **Concepto:** rejilla de meses × años con t, t−1 y t−12: al mes anterior (parte normal) y al mismo mes del año anterior (parte estacional).
- **Caso (3D):** cintas año × mes del logaritmo, con las dos flechas sobre julio de 1955. Se aplican ∇₁₂ y luego ∇: las cintas quedan como ruido. Coeficientes estimados del "modelo de aerolínea" con su forma desarrollada (término de 13 meses).
- **Cierre:** pronóstico de 1960 con su banda del 95 % y, en clic propio, los valores reales: sigue los picos (julio 622.2 contra 622), pero se pasa en 11 de 12 meses y marzo queda fuera de la banda.
- **Gráficos:** rejilla (local), `AnioMes3D` (cintas y flechas), `SeriesChart` con `franjas`. **Datos:** `series_modelos.json` (SARIMAX).

### 48 · Elegir y evaluar (110 s) — fundamento
- Tres columnas, cada una con su concepto arriba (que se pliega cuando entra el caso) y su caso abajo; arriba, la franja `Receta`:
  1. **¿Qué órdenes?** AIC/BIC: menor es mejor; premian el ajuste y cobran por cada parámetro. Caso: rejilla de 16 SARIMA con su diferencia al mejor (botones AIC y BIC); la aerolínea es el mínimo de los dos.
  2. **¿Pronostica bien?** MAE, RMSE y MAPE desde cero, con 4 meses de esquema. Caso: los 12 errores de 1960 y las tres métricas.
  3. **¿Dejó algo sin explicar?** Los residuos deben ser ruido blanco: Ljung-Box. Dos escalas de p-valor, una sobre otra: ADF "quieres p < 0.05"; Ljung-Box "quieres p > 0.05".
- **Cierre:** con la nota de que 6 de los otros 15 SARIMA tuvieron menor error en 1960, y que elegirlos mirando 1960 sería la fuga de la 30.
- **Gráficos:** `Receta`, `AicGrid`, tira de errores (local), `PValueScale`, `Correlogram`. **Datos:** `series_modelos.json`; métricas y Ljung-Box, vivos.

### 49 · La línea base (60 s)
- **Concepto:** el pronóstico ingenuo estacional: copiar el mismo mes del año pasado.
- **Caso:** 1960 real contra cinco pronósticos en una tabla (con su línea al escoger el renglón): ingenuo estacional, ingenuo con crecimiento (1959 × lo que creció de 1958 a 1959), Random Forest de la 30, ARIMA de la 45 y SARIMA. **Cambió:** el ingenuo con crecimiento empata con SARIMA en 1960.
- **Cierre:** "un modelo que no le gana al ingenuo no aporta; y la vara debe ser la más alta que salga gratis".
- **Gráficos:** `SeriesChart`, `MetricTable`. **Datos:** vivo; bosque, ARIMA y SARIMA del JSON.

### 50 · Demo: de la serie al pronóstico (100 s)
- Una franja con 6 estaciones (transformar · ¿estacionaria? · identificar · elegir · pronosticar y comparar · diagnosticar), cada una con la diapositiva donde se vio. Se recorren sobre pasajeros. ADF con 132 meses: las dos filas frágiles cambiaron de lado respecto a la 37.
- **Validación de origen móvil:** se pronostican **1955 a 1960** (seis años; la especificación decía tres), cada año entrenando solo con lo anterior. Tabla ingenuo contra ARIMA contra SARIMA con media ± desviación: SARIMA gana 5 de 6 y pierde 1958. Ljung-Box de cada ajuste.
- **Gráficos:** estaciones (local), `SeriesChart`, `MetricTable`, `Correlogram`, `AicGrid`, `SplitDiagram`, `PValueScale`. **Datos:** JSON.

## H. Modelos ocultos de Markov (51–61)

Un solo λ en `src/lib/clima.ts` y un solo formato de números para toda la sección. **Construida en el hito 6 (2026-10-17)**: plan, decisiones, clics y bitácora en `docs/hitos/HITO-6.md`, que manda sobre lo de abajo (82 clics; nombres de las piezas en español: `RedTemporal`, `DiagramaClima`, `TiraDias`, `TablasLambda`, `ArbolCaminos`, `BarrasForward`, `TablaAMano`).

### 51 · Causas ocultas (60 s)
- **Concepto:** en las series modelamos lo que medimos; a veces lo que medimos es solo el efecto de algo que no vemos. Dos diagramas: AR (lo observado depende de lo observado) contra modelo oculto (lo observado depende de un estado que no se ve). Tabla "se ve → oculto": audio → palabras; palabras → categoría gramatical; actividad → clima.
- **Caso:** el amigo cuenta "caminar, comprar, limpiar". Arriba: "? ? ?".
- **Gráficos:** `GraphicalModel`. **Datos:** ninguno.

### 52 · Cadena de Markov (90 s)
- **Recordatorio · probabilidad condicional y regla del producto.**
- **Concepto:** propiedad de Markov: el mañana solo mira el hoy.
- **Caso:** diagrama del clima con sus flechas (0.7, 0.3, 0.4, 0.6) y la matriz A; cada fila suma 1. Ejemplo: P(L, L, S) = 0.6 · 0.7 · 0.3 = 0.126. Una tira de 60 días simulados para ver las rachas.
- **Gráficos:** `ClimaDiagram`, `LambdaTables`, `DayStrip`. **Datos:** A y π (de libro); cálculos (vivo).

### 53 · Estados ocultos (75 s)
- **Concepto:** una cortina tapa la fila de estados; solo se ve la fila de emisiones.
- **Caso:** matriz B con flechas de grosor proporcional a la probabilidad (si llueve, casi no camina). Una semana generada: clima arriba, actividad abajo. Regla de Bayes para un día: P(Soleado | caminar) = 0.24/0.30 = 0.80.
- **Gráficos:** `GraphicalModel` con cortina, `ClimaDiagram`, `DayStrip`. **Datos:** B (de libro); Bayes (vivo).

### 54 · λ = (π, A, B) (90 s)
- **Concepto:** tres tablas con nombre en palabras: cómo empieza (π), cómo cambia (A) y qué produce (B).
- **Caso:** las tablas con números y el diagrama completo. Los dos supuestos, cada uno con sus flechas resaltadas. La probabilidad conjunta de un camino, factor por factor.
- **Gráficos:** `LambdaTables`, `ClimaDiagram`, `GraphicalModel`. **Datos:** de libro y vivo.

### 55 · Las tres preguntas (60 s)
- Tres columnas: **Evaluación** (¿qué tan probable es lo que vi? → Forward), **Decodificación** (¿qué clima hubo? → Viterbi) y **Aprendizaje** (¿cuáles son π, A, B? → Baum-Welch). Cada una con su pregunta en palabras y dónde se resuelve.

### 56 · Fuerza bruta (75 s)
- **Caso:** el árbol de los 8 caminos posibles de 3 días. Cada hoja con su probabilidad y una barra. Las 8 barras se apilan: su suma es P(O) = 0.033612. La más alta, S-L-L, es el 40 % del total.
- **Cierre:** gráfica de 2ᵀ contra N²T: con 100 días, la fuerza bruta es imposible.
- **Gráficos:** `PathTree`, `GrowthChart`. **Datos:** vivo.

### 57 · Forward (90 s)
- **Concepto:** α es "la probabilidad de haber visto lo que vi hasta hoy y que hoy el estado sea j". Tres renglones: inicialización, recursión y terminación.
- **Caso:** barras por día en dos movimientos animados. **Predecir:** cada barra de ayer se reparte según A. **Corregir:** se multiplica por lo que tan probable era la actividad de hoy. Día 3: 0.02904 + 0.004572 = 0.033612, igual que las 8 barras de la 56.
- **Gráficos:** `ForwardBars`. **Datos:** vivo (`lib/hmm.ts`).

### 58 · La tabla α a mano (60 s)
- La tabla de 2 × 3 se llena columna por columna con cada operación escrita. Al final: 14 multiplicaciones contra 40 de la fuerza bruta.
- **Gráficos:** `TablaAMano`. **Datos:** vivo.

### 59 · Viterbi (90 s)
- **Concepto:** δ es "la probabilidad del mejor camino que termina hoy en j". Igual que Forward, pero con máximo, y guardando de dónde vino.
- **Caso:** la tabla con los dos candidatos de cada celda (el perdedor tachado) y su flecha hacia atrás. Al final un marcador recorre las flechas: S → L → L, P = 0.01344.
- **Cierre:** "¿y si sigo la casilla más alta de cada columna?" Da S → S → L, que es un camino peor: por eso hay que ir hacia atrás. (No se pregunta por "el clima más probable de cada día": con toda la secuencia también da S → L → L.)
- **Gráficos:** `TablaAMano` con flechas. **Datos:** vivo.

### 60 · Forward y Viterbi: suma contra máximo (50 s) — hecha, con ajustes
- **Ajustes:** etiqueta "Caso · Clima"; usar el λ compartido; corregir el texto del costo a "O(N²T) en vez de O(T·Nᵀ)".

### 61 · Del pizarrón a la práctica (90 s)
- **Dato crudo (regla 8):** las primeras 5 filas del diario simulado (`dia`, `actividad`, `clima`) y qué se le cambia (el clima se aparta). **Aprender λ:** curvas de Baum-Welch desde 10 arranques distintos en 10 000 días simulados; el λ aprendido junto al real.
- **Decimales que desaparecen:** la probabilidad de 1 000 días baja hasta que la computadora la redondea a cero. Con logaritmos no pasa (R4).
- **Comprobación:** tabla navegador contra hmmlearn.
- **Evaluación:** log-verosimilitud por día en días nuevos y porcentaje de días en que Viterbi acierta el clima, contra líneas base. Con el clima del libro el aprendido no le gana al modelo sin memoria; un clima persistente (simulado, a_ii = 0.95) muestra cuándo sí sirve.
- **Aplicaciones:** voz, etiquetado gramatical, bioinformática y economía.
- **Gráficos:** `EMCurves`, `UnderflowChart`, `LambdaTables` (comparar), `BarrasH`. **Datos:** `hmm_clima.json` (JSON, hmmlearn).

---

# Cierre (62–64)

### 62 · La misma receta en los tres casos (85 s)
- La rejilla de la receta con tres renglones (Adult, Pasajeros, Clima) que se llenan uno por clic: qué datos, qué modelo, cómo se validó y con qué se midió.
- **Cierre:** se enmarca en rojo la columna **Validación**: es lo que cambió entre los casos. Frase final: "antes de creer un número, pregunta: ¿con qué datos?, ¿cómo se validó?, ¿con qué métrica?"
- **Corrección de la revisión:** celdas de texto de 24 px o más, y una sola miniatura por renglón (la de validación).
- **Gráficos:** `Receta`, `Particiones`, `SplitDiagram`. **Datos:** los JSON de resultados.

### 63 · Referencias (35 s)
- Cinco fuentes principales, cada una con las diapositivas donde se usó: Breiman (2001), Hastie, Tibshirani y Friedman (*ESL*), Box y Jenkins, Rabiner (1989), Chen y Guestrin (2016). Un clic muestra las complementarias.

### 64 · Preguntas (15 s)
- El índice navegable por sección: un clic salta a cualquier diapositiva o a las de respaldo. Cuatro preguntas "para pensar", cada una con su enlace.

---

# Respaldo (no se presentan; son para preguntas)

- **R1 · ¿Por qué queda fuera el 36.8 %?** El tablero de 5 pelotas, los dos caminos al límite e⁻¹ y la curva de (1 − 1/n)ⁿ con n = 400 marcado.
- **R2 · AdaBoost y la pérdida exponencial.** Gráfica de las pérdidas contra el margen; el álgebra de donde salen los pesos y α; las 400 personas sobre la curva e^(−m). Texto corregido: "si la pérdida exponencial llega cerca de 0, el error también; mientras tanto, el error puede quedarse igual o subir un poco".
- **R3 · KPSS, la contraprueba de ADF.** Hipótesis nulas opuestas; la matriz de 2 × 2 "ADF rechaza / KPSS rechaza"; las cuatro transformaciones de pasajeros.
- **R4 · Forward sin llegar a cero.** La probabilidad cayendo hasta desaparecer (día 681 con la secuencia de prueba de la 61: se calcula en vivo, no se escribe); escalamiento y logaritmos; ambos dan el mismo resultado. Corrección: el valor intermedio se rotula α̃ (no α), porque se calcula desde la columna ya normalizada.

---

# Lo que hay que construir para sostener todo

## Componentes compartidos

| Componente | Para qué | Se usa en |
|---|---|---|
| `Adult3DScene` (sale de la 5) | Nube de personas, cajas, planos, tamaño por peso | 4–7, 10, 11, 17, 18, 21 |
| `TreeDiagram` | Árbol como diagrama con conteos y valores de hoja | 4, 23, 24 |
| `VoteVolume3D`, `Corte2D` | Región que predice un ensamble | 11, 18 |
| `FlujoEnsamble` | Diagramas paralelo y secuencial | 9, 17, 25 |
| `Lineas` / `SeriesChart` | Toda gráfica de líneas (ejes, bandas, marcadores, escala log, cursor). `SeriesChart` es un envoltorio de `Lineas` | casi todas |
| `PuntosIntervalo`, `BarrasH`, `Barras` | Comparaciones con media ± desviación y barras (`Barras` sustituye a `MiniBars` y a `ImpulseResponse`) | 9, 15, 26–28, 34, 35, 37, 38, 42–44, 61, 62 |
| `MatrizConfusion` | Matriz animada | 26 |
| `TablaAMano` | Tablas que se llenan con su operación | 19, 24, 58, 59 |
| `Receta`, `Particiones`, `SplitDiagram` | Receta y diagramas de validación | 3, 26, 30, 50, 62 |
| `Correlogram`, `Dispersion` | ACF/PACF; dispersión de rezagos o de una regresión (sustituye a `LagScatter` y `ScatterFit`) | 29, 35, 37, 39–48 |
| `AicGrid`, `MetricTable`, `PValueScale` | Rejilla de AIC/BIC de los 16 SARIMA; tabla de métricas con el mejor en rojo; escala de p-valores con la zona que se quiere | 48–50, 62 |
| `CalendarGrid`, `OperacionAnimada` | Rejilla año × mes que vuela a la línea de tiempo; diferencia o ventana paso a paso | 31, 33, 36, 38 |
| `AnioMes3D` (barras, superficie, cintas) | Pasajeros como año × mes | 32, 36, 47 |
| `LagCloud3D` | Nube de rezagos con plano de regresión | 40, 42 |
| `ClimaDiagram`, `GraphicalModel`, `LambdaTables`, `DayStrip`, `Trellis` | Piezas del HMM | 51–61, R4 |
| `MapaExposicion`, `IrA` + cambios al deck | Mapa, índice navegable y saltos entre diapositivas | 2, 62–64, respaldo |

## Librerías de cálculo (TypeScript, cada una verificada)

| Archivo | Contenido | Se compara con |
|---|---|---|
| `lib/tree.ts` (ampliar) | Árbol de regresión, stump con pesos, sorteo de variables | sklearn |
| `lib/bagging.ts` | Bootstrap, bagging, OOB | `BaggingClassifier` |
| `lib/adaboost.ts` | AdaBoost binario con stumps | `AdaBoostClassifier` |
| `lib/gboost.ts` | Gradient Boosting con log-loss | `GradientBoostingClassifier` |
| `lib/metricas.ts` | Matriz de confusión, accuracy, precision, recall, F1, F1-macro | `accuracy_score`, `f1_score` |
| `lib/series.ts` | Diferencias, promedio móvil, descomposición, ACF, PACF, mínimos cuadrados, métricas | statsmodels |
| `lib/hmm.ts` (ampliar) | Escalamiento, logaritmos, enumeración de caminos, simulación | hmmlearn |

## Datos (Python → `src/data/`)

- **Dependencias nuevas:** `statsmodels` y `hmmlearn` en `.venv`. Hay que confirmar que instalan en Python 3.14; si no, se crea el entorno con 3.12.
- **U7:** `varianza_ensamble`, `oob_vs_cv`, `raices`, `rf_hiperparametros`, `importancias`, `stump_adult`, `gb_shrinkage`, `xgb_regularizacion`, `xgb_faltantes_tiempos`, `matrices_adult`, `curvas_n_estimators`, `ruido_etiquetas`, `adult_muestra`, y `comparacion_adult` exportado de nuevo con el valor por pliegue.
- **U8:** `pasajeros`, `validacion_temporal`, `adf_pasajeros`, `series_modelos`, `hmm_clima`, y los de respaldo (KPSS, AdaBoost, HMM de 1 000 días).
- **Protocolo fijo:** semilla 42; en Adult, 5 pliegues estratificados; en pasajeros, 1960 como prueba y origen móvil 1955–1960 (desde 72 meses de entrenamiento; con menos, los ajustes no convergen).

## Orden de construcción

| Hito | Qué incluye | Diapositivas |
|---|---|---|
| 0 · Base ✅ | Gráficas compartidas, `Adult3DScene`, etiquetas 3D propias y `npm run verify`. Los saltos entre diapositivas se pasan al hito 7, que es donde se usan | — |
| 1 · Bases y bagging ✅ | A y B | 3, 4, 6–12 |
| 2 · Random Forest y boosting ✅ | C y D | 13–19, 21–24 |
| 3 · Cierre de la parte 1 ✅ | E | 25–28 |
| 4 · Puente y fundamentos ✅ | Puente y F | 29–40 |
| 5 · Modelos de series (construido; falta la revisión del usuario) | G | 41–50 |
| 6 · HMM | H | 51–59, 61 y ajustes de la 60 |
| 7 · Apertura, cierre y respaldo | Incluye el mapa con la marca "vamos aquí" para abrir las clases 2 y 3 | 2, 62–64, R1–R4 y ajuste de la 1 |
| 8 · Ensayo | Cronometrar cada clase (meta: 80 min con preguntas) y exportar a PDF | todas |

## Cómo se da por terminada cada diapositiva

1. `npm run build` compila sin errores.
2. `npm run verify` pasa: los cálculos en TypeScript coinciden con las referencias de Python.
3. Se recorre en la vista previa, clic por clic, sin errores en consola y sin textos encimados.
4. Se lee desde lejos: nada de lectura por debajo de 22 px.
5. Al cerrar cada hito, una revisión de rigor y otra de claridad de las diapositivas nuevas antes de pasar al siguiente.

## Lo que cambió al construir los hitos 0 y 1

- **Correlación entre árboles (8 y 14):** medida con 30 repeticiones, ρ = 0.081 en bagging y 0.059 en Random Forest. Promediar 50 árboles quita el 90 % de la varianza de un árbol.
- **Bagging con 3 variables (11):** 100 árboles fallan 22.4 %, mejor que un árbol sin límite (24.5 %) pero peor que un árbol de profundidad 3 (19.9 %). La diapositiva lo dice y remite a Adult completo, donde bagging sí gana (81.1 % → 85.4 %).
- **OOB (12):** con 300 árboles, OOB 85.63 % y validación cruzada 85.59 %. Con 10 árboles el OOB es pesimista (83.8 % contra 84.8 %).
- **Sesgo y varianza (7):** con un stump los cortes sí cambian de lugar entre árboles (3 cortan por educación y 2 por edad); lo que casi no cambia es la respuesta. El texto se ajustó a eso.
- **Inestabilidad (6):** con profundidad 2 el árbol no cambia nunca al quitar 5 personas; con profundidad 4 cambian entre 0 y 623 de 5 000 respuestas según a quién se quite.
- **Etiquetas 3D:** las de drei se perdían con React 19 (faltaba la del eje "edad"). Se reemplazaron por etiquetas propias en `Scene3D`; ya no hay errores en consola.
- **Árbol más rápido:** `lib/tree.ts` agrupa por valor en lugar de ordenar; da exactamente los mismos árboles y permite entrenar 100 en vivo.

## Lo que cambió al construir el hito 2

- **Importancia (15):** la columna de ruido puro queda en 3.er lugar de 15 según MDI (0.120, pegada a edad y a peso censal) y vale 0.001 con permutación. Es la evidencia central de la diapositiva.
- **Sorteo de variables (14):** la curva de aciertos contra variables sorteadas es casi plana (85.4 % a 85.8 %); las diferencias son del tamaño de la variación entre pliegues y así se dice. Lo que sí se ve es que las raíces dejan de ser todas iguales y que ρ baja de 0.081 a 0.059.
- **Hiperparámetros (16):** el que más mueve es el tamaño mínimo de hoja: de 85.77 % con hojas de 1 a 86.52 % con hojas de 5.
- **Stump (17):** "¿es esposo?" separa 44.9 % contra 9.8 %, pero responde "no" en los dos lados: 76.1 % de aciertos, igual que la clase mayoritaria.
- **AdaBoost (18–19):** el ejemplo a mano es de 8 puntos y 3 rondas, elegido por búsqueda. En las 400 personas el error ponderado sube de 0.24 a 0.49 y α baja de 0.58 a 0.02.
- **Tasa de aprendizaje (22):** el mejor punto es casi el mismo con ν = 0.3, 0.1 y 0.03 (log-loss ≈ 0.277); lo que cambia es qué tan fácil es pasarse. Con ν = 1 el mínimo llega a los 21 árboles y después hasta el entrenamiento se descompone. El cierre se reescribió con eso.
- **Regularización (23):** sin cobros, 11,332 hojas y brecha de 0.072; con λ = 100 y γ = 5, 1,358 hojas y brecha de 0.004, pero peor validación.
- **Faltantes (24):** tratarlos tal cual o como categoría da lo mismo en Adult (87.51 % contra 87.39 %, dentro del ruido). La diapositiva lo dice: la ventaja es no tener que decidir cómo rellenar.
- **Velocidad (24):** en un solo ajuste, sklearn tarda 30.7 s, XGBoost con 1 núcleo 0.99 s y con 20 núcleos 0.37 s. La mayor parte de la ganancia viene de agrupar los valores en intervalos, no del paralelismo. La diapositiva 28 debe usar estos números y no el "≈ 11 veces" anterior.
- **Etiquetas con letras griegas:** las etiquetas en mayúsculas convertían λ en Λ y γ en Γ. Ahora existe la clase `label natural` para esos casos.
- **Verificación:** AdaBoost y Gradient Boosting en TypeScript coinciden con sklearn con diferencias de 1e-14.

## Lo que cambió al construir el hito 3

- **Datos nuevos (`scripts/exportar_hito3.py`):** `comparacion_adult.json` se exporta de nuevo con el valor de cada pliegue y los segundos de un solo ajuste (con 20 núcleos y con 1); los promedios quedaron idénticos a los anteriores. `matrices_adult.json` trae la matriz de confusión de cada modelo en cada pliegue y la del árbol podado. `curvas_n_estimators.json` llega hasta 1,000 árboles. `ruido_etiquetas.json` es un experimento que no estaba en el plan. `comparar_ensambles.py` ya solo imprime.
- **Etiquetas con errores (25 y 28): el dato contradijo el plan.** El plan decía "evitar AdaBoost". Con 20 % de las etiquetas de entrenamiento volteadas al azar (examen intacto), de F1-macro pierden: árbol sin límite 0.130, bagging 0.037, Random Forest 0.035, AdaBoost 0.017, Gradient Boosting 0.017, XGBoost 0.015 y el árbol podado 0.001. Pesa más el tamaño de cada árbol que la forma de combinarlos. La 28 recomienda "árboles chicos: boosting o uno podado" y la 25 lo dice con las cifras.
- **Número de árboles (27):** Random Forest se estabiliza (14.13 % de error con 300, 14.16 % con 1,000). AdaBoost con stumps sigue bajando hasta el final (13.84 % con 1,000) y casi sin brecha con entrenamiento: en la comparación se le detuvo antes de tiempo. Gradient Boosting queda plano de 300 a 1,000. XGBoost tiene su mínimo en 154 árboles y después sube (12.45 % → 12.97 %) mientras el entrenamiento baja a 6.9 %. La 25 ya no dice que AdaBoost "se sobreajusta poco" sino "puede, pero con stumps tarda mucho".
- **GB contra XGBoost (27):** XGBoost gana en 4 de 5 pliegues, por 0.002 en promedio y con ±0.003 entre pliegues: no alcanza para decir cuál es mejor. Gradient Boosting vale 0.814 de F1-macro (0.8145 redondeado a tres decimales), no 0.815.
- **Árbol podado (27 y 28):** con 8 niveles acierta 85.6 % contra 85.9 % de Random Forest, pero su F1-macro es 0.778 contra 0.795: encuentra a 55 % de quienes ganan más de 50K y Random Forest a 63 %. Es el ejemplo real de "accuracy sola engaña". La profundidad se eligió con la misma validación; se dice en pantalla.
- **La 25 se parte en dos vistas:** siete renglones de concepto (uno por clic) y, en el último clic, las mismas cinco columnas con lo medido en Adult (F1-macro, tiempo de un ajuste y pérdida con ruido). Los diez renglones juntos no cabían. Las miniaturas de `FlujoEnsamble` a ese tamaño no se leían: quedaron como tres árboles sueltos o encadenados en el encabezado.
- **La 26:** los dos modelos de esquema aciertan lo mismo (7 de 10) y se separan en F1-macro (0.67 contra 0.41), igual que pasa en Adult con la clase mayoritaria. Juntar los 5 pliegues o promediarlos da lo mismo a tres decimales en los 7 modelos.
- **La 27:** la escala de la gráfica se acerca al llegar a bagging (de 0.40–0.85 a 0.73–0.83) y lo avisa; la clase mayoritaria queda fuera con una flecha. Las advertencias son un clic propio y las curvas, otra vista.
- **La 28:** la dispersión usa el tiempo de un ajuste de cada modelo como se usó en la comparación, con botón para 20 núcleos o 1. La comparación de velocidad "mismo modelo" (30.7 s contra 0.99 s) sale de `xgb_faltantes_tiempos.json`.
- **Verificación:** `lib/metricas.ts` coincide con `accuracy_score` y `f1_score(average="macro")` en los 8 modelos × 5 pliegues (diferencia 0); las curvas con 300 árboles terminan exactamente en el valor de la comparación; el experimento de ruido con 0 % repite la comparación.

## Lo que cambió en la ronda de correcciones (después del hito 3)

**Las cifras de las tres secciones anteriores quedaron viejas:** son de cuando `fnlwgt` entraba como variable. Las vigentes
están en `docs/HANDOFF.md` ("Hallazgos") y, sobre todo, en pantalla, que las lee de los JSON.

- **Se quitó `fnlwgt`.** Es el peso censal: a cuántas personas representa la fila. Es del muestreo, no de la persona. Quedan 13 variables.
- **Lo que se movió con eso.** El árbol sin límite sube de 81.1 % a 81.9 % en validación y baja de 99.99 % a 97.4 % en entrenamiento. Los bosques bajan (bagging 85.6 % → 84.8 %, Random Forest 85.9 % → 85.1 %) y sus árboles se parecen más (ρ de 0.081 y 0.059 a 0.145 y 0.122). Los tres de boosting casi no cambian. La columna de ruido pasa del 3.er al 1.er lugar de importancia MDI.
- **La 16 cambió de conclusión.** Decía que los valores por omisión "ya dan un buen bosque". Ahora: con hojas de una persona el bosque acierta 85.0 % y con hojas de al menos 5, 86.6 %. Es lo primero que hay que ajustar.
- **La 27 y la 28 cambiaron de argumento.** Un árbol podado a 8 niveles acierta más (85.7 %) que Random Forest sin ajustar (85.1 %), aunque encuentra a menos personas que ganan más de 50K. La 28 ya no recomienda Random Forest por "buen resultado sin ajustar" sino por "poco que vigilar": agregar árboles no lo empeora y una sola perilla lo sube 1.6 puntos.
- **Bagging con 300 árboles**, como los demás. Con eso Random Forest le gana por 0.003 de F1-macro en 4 de 5 pliegues: menos que su ±. La 27 dice que aquí el sorteo ayuda poco.
- **GB contra XGBoost:** ahora XGBoost gana en los 5 pliegues, por 0.003 ± 0.001. La 27 lo presenta como ventaja chica pero constante, y como ejemplo de por qué conviene comparar pliegue a pliegue.
- **Ruido en etiquetas, con controles.** Random Forest pierde 0.056 de F1-macro y XGBoost 0.015; pero Random Forest con árboles podados a 8 niveles pierde 0.000 y XGBoost con árboles de 20 niveles pierde 0.062. La 25 y la 28 lo dicen así: es el tamaño del árbol, no la forma de combinar.
- **La 22:** con ν = 1 el mínimo llega a los 24 árboles y es el peor de las cuatro tasas (ya no se "descompone el entrenamiento"); con ν = 0.03 todavía baja a los 1,500.
- **Dataset crudo primero (regla 8).** La 3 pasa de 6 a 8 clics: `adult.head()` con las 15 columnas y, en el siguiente, lo que se le cambia (la clase pasa a y, se quita `fnlwgt`, los `NaN` son una categoría, el texto pasa a códigos). La 4 pasa de 5 a 6: las 3 columnas que se dibujan, junto a la escena ya con los puntos.
- **Encabezado y 3D:** unidad y tema más grandes, tema en rojo; las escenas 3D se acercan con la rueda y regresan con doble clic.

## Decisiones pendientes

1. **Fecha y reparto** por expositor.
2. Nombres para la portada (`meta.ts`).
