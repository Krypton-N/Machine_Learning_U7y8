# Revisiones de la sección Apertura, cierre y respaldo


## Revisión 1

Revisé el diseño contra el código actual (Deck, SlideFrame, theme.css, 01, 05, 60, exportar_datos.py) y comprobé con Python (sin escribir archivos) los contrastes del tema, los valores del trellis de la R4, la curva de AdaBoost sobre las 400 personas y los anchos de la línea de metro.

Hay tres problemas graves:
1. La 3 es la base de toda la exposición y no cabe en 90 s. Tiene 5 pasos, más de 30 números y dos interacciones con mouse; en la práctica toma unos 150–180 s.
2. La 62 mete 12 celdas con minigráficas que no se leen desde el fondo del salón. Los bigotes de F1 miden unos 2 px y las etiquetas quedan en 18 px o menos.
3. La R2 dice en pantalla algo falso que su propia gráfica contradice. Afirma que bajar la pérdida exponencial "obliga a bajar el error", pero en las 400 personas el error de entrenamiento sube en 27 de 99 rondas.

Hay además problemas de lógica y de orden:
- En la 3 se pasa a K-fold sin decir por qué no basta una sola partición.
- En la 3 se estratifica antes de mostrar el desbalance 76/24, que es lo que lo justifica.
- La partición simple (hold-out) nunca se nombra, y la nota "la 5 usa exactamente esto" es falsa para el primer caso de la 5, que usa 10 000 / 5 000.
- En la 62, el renglón del HMM contradice la definición de métrica de la 3 y la pregunta final "¿acierta con datos que no vio?".
- La R4 rotula como α unos valores que en realidad son α̃, y no coinciden con los de la 60.
- La R3 abre con un ejemplo (semilla 42, η≈0.348 < 0.463) que contradice su propio mensaje.

En legibilidad, varias piezas de texto de lectura usan menos de 20 px o el gris --text-3, que da un contraste de 3.87:1. La más grave son los nombres de las 14 variables en la ficha, a 15 px.

La 2 tiene etiquetas que se enciman, siglas que el público todavía no conoce y una nota sobre "barajar" antes de que se explique qué es.

La 64 obliga a pasar el mouse por chips que solo muestran el número para encontrar una diapositiva.

Las animaciones de conteo (0 → 48 842 y otras) son decorativas.

No encontré estética genérica tipo "AI slop". La 1 y la 63 solo tienen detalles menores.

- **[alta] diapositiva 3:** Sobrecarga y duración. La diapositiva que sostiene la 5, la 12, la 26 y la 30 tiene 5 pasos densos y no cabe en los 90 s previstos. El paso 3 además depende de clics con mouse.
  - Evidencia: Paso 0: dos tablas (6 + 4 filas) animadas fila por fila, más su narración (~20 s).
Paso 1: 4 definiciones de ~20–25 palabras a 23 px (~100 palabras; ~25 s).
Paso 2: tres subfases (barajar, pliegues, 5 rondas) y una fórmula con Σ y √ (~30 s).
Paso 3: ficha de 14 renglones, chips A/B/C, botón 'ver como números' y 12 cifras (48 842, 14, 6, 8, 76.1 %, 37 155, 23.9 %, 11 687, 2 799, 2 809, 857, 3 620) (~30–40 s).
Paso 4: 10 cifras por pliegue casi idénticas (23.93/23.92 %), 5 renglones de rondas, nota mono, TeX, referencia a F1-macro, recuadro del piso y takeaway (~25 s).
Total realista: unos 150–180 s ante principiantes.
  - Propuesta: Dejarla en ~100 s sin quitar el K-fold.
(a) Paso 0: animar solo las 4 filas nuevas; el 6/6 de entrenamiento aparece de golpe. Marcar la columna '¿aprobó?' en rojo tenue para que el ícono 'y' del paso 1 la retome. Decir en pantalla 'con alumnos nuevos el memorión hace lo mismo que decir siempre no', que conecta con el piso del paso 4.
(b) Paso 3: una sola persona fija (la C, con faltantes). El cambio a códigos pasa con un clic de flecha, sin chips. Los faltantes se resumen en una línea calculada: '≈ 7.4 % de las personas tiene algún dato faltante' (3 620/48 842).
(c) Paso 4: cambiar las 10 cifras por pliegue por una línea, 'cada pliegue: ≈ 9 768 personas, 23.9 % gana > 50K'. Quitar la referencia a F1-macro de la pantalla y decirla en voz. El piso y el takeaway se quedan.
- **[alta] diapositiva 62:** El cierre es un tablero de 12 celdas con minigráficas que no se leen desde el fondo. Las gráficas no sostienen lo que dicen y el mensaje ('lo que cambia es la validación') se pierde.
  - Evidencia: Columna Métrica: 436 px de ancho y renglones de 170 px.
PuntosIntervalo de 7 modelos en esa celda: con unos 150 px de etiquetas quedan ~280 px para el rango 0.40–0.85, o sea ~620 px por unidad.
• Los bigotes de ±0.003 miden ~2 px.
• RF contra AdaBoost (0.795 contra 0.789) quedan a ~4 px.
• GB contra XGBoost (Δ = 0.0024) quedan a ~1.5 px.
• 7 etiquetas en 170 px dan ≤ 24 px por renglón, así que el texto queda en ≤ 18 px.
La celda de Pasajeros lleva 6 barras (3 métricas × 2 modelos), Ljung-Box y AIC. Las notas grises van a 18 px. Todo se presenta en 85 s y 5 pasos.
  - Propuesta: Celdas de texto de 1–2 líneas a ≥ 24 px. Una sola minigráfica por renglón y solo en la columna Validación, que es la que porta el mensaje.
• Métrica de Adult en texto calculado: 'mejor: XGBoost 0.817 ≈ GB 0.815 · piso 0.432 (F1-macro)'. Sin bigotes; la gráfica completa queda en la 27 (enlace IrA).
• Métrica de Pasajeros: una sola métrica (MAPE SARIMA contra ingenua) en texto.
• Ljung-Box va a una nota o se dice en voz: es un diagnóstico de residuos, no una métrica de acierto.
• Bajar a ~60 s.
- **[alta] diapositiva R2:** El paso 0 afirma algo falso que la gráfica del paso 3 de la misma diapositiva contradice. Dice 'e^{−m} siempre queda por encima del error 0–1: bajarla obliga a bajar el error'.
  - Evidencia: sklearn AdaBoostClassifier(stump, n_estimators=100, random_state=42) sobre las 400 personas de adult3d.json → vista (staged_score).
Error de entrenamiento: 0.24, 0.24, 0.22, 0.2075, 0.195 y luego 0.2075 (sube en la ronda 6).
Sube en 27 de 99 transiciones y se queda plano en 41. Llega a 0.18 y termina en 0.185.
La pérdida exponencial, en cambio, baja en todas las rondas.
El estudiante verá la curva gris subir justo después de leer 'obliga a bajar el error'.
  - Propuesta: Texto del paso 0: 'e^{−m} siempre queda por encima del error 0–1. Si la pérdida exponencial llega cerca de 0, el error también; mientras tanto, el error puede quedarse igual o subir un poco.'
En el paso 3, rotular el mínimo y el valor final del error, y una nota: 'la cota baja en cada ronda; el error no necesariamente'. El texto clave del paso 3 ('baja una cota… en cada ronda') sí es correcto y se queda.
- **[media] diapositiva 3:** Hay un salto lógico en el paso 2. Se pasa de una partición única a K-fold sin decir por qué, y 'estratificado' y 'positivos' aparecen antes de que se vea el desbalance que los justifica.
  - Evidencia: El paso 0 examina con una sola partición (4 alumnos nuevos). El paso 2 introduce K-fold sin decir que una sola partición depende de la suerte.
El rótulo 'estratificado: cada pliegue conserva 1 positivo de cada 4' llega en el paso 2, pero el 23.9 % de Adult, que es la razón para estratificar, aparece hasta el paso 3. El término 'positivo' no se define antes.
La fórmula s = √(1/K Σ(m_k − m̄)²) a 30 px supone que ya se entiende qué es una desviación estándar.
  - Propuesta: Abrir el paso 2 con dos barajados distintos de los 20 cuadros, cuyo resultado da distinto (calculado en TS), y el rótulo 'con una sola partición, el resultado depende de qué filas tocaron en prueba'. Después, K-fold.
Para estratificar, mostrar un barajado sin estratificar (mulberry32) donde algún pliegue quede con 0 o 2 puntos rojos: 'si un pliegue se queda sin positivos, no se puede medir si el modelo los detecta'.
Definir 'positivo = la clase que buscamos (aquí, aprobó)'.
La fórmula, en palabras: 'promedio de los 5 ± cuánto varían'. La versión con Σ, más pequeña o en voz.
- **[media] diapositiva 3:** La partición simple (entrenamiento/prueba) nunca se nombra, y la nota del paso 4 ('la 5 usa exactamente esto') es falsa para el primer caso de la 5. La siguiente diapositiva que usa validación queda desconectada.
  - Evidencia: 05-error-entrenamiento-prueba.tsx, paso 1: rótulo 'Adult · 3 variables · 5 000 personas de prueba'. exportar_datos.py → adult3d() usa train_test_split de 10 000 / 5 000, que es una sola partición, no K-fold.
Solo el paso 2 de la 5 usa 'CV de 5 pliegues' (curva_profundidad.json, StratifiedKFold).
En la 3, el ícono de Validación del paso 1 (8 celdas grises y 2 rojas) es justamente esa partición simple, pero sin nombre.
  - Propuesta: Paso 1: nombrar el ícono 'partición simple: entrenamiento / prueba'.
Nota del paso 4: 'la 5 usa las dos: partición simple en Adult con 3 variables (10 000 / 5 000) y K = 5 en Adult completo'. Que la 5 repita esos dos nombres en sus rótulos.
- **[media] diapositiva 62:** El renglón del Clima contradice las definiciones que la propia diapositiva retoma de la 3 y su pregunta final. Pone P(O|λ) en la columna Métrica y en ese caso no hay datos no vistos.
  - Evidencia: En la 3, Métrica = 'un número que resume qué tan bien acierta en esas filas'. P(O|λ) = 0.03361 no mide acierto; el propio rigor de la 62 lo dice.
La celda Validación dice 'λ es de libro: no se estimó con datos'.
El texto clave del paso 4 es '¿acierta con datos que no vio?', que no aplica a este renglón. Un principiante concluye que la receta no se cumple o que la verosimilitud es una métrica de acierto.
  - Propuesta: Renglón 'Clima (ejemplo de pizarrón)'.
• Métrica: 'aquí no hay examen: λ es de libro. P(O|λ) = 0.03361 dice qué tan probable es lo visto, no qué tan bien acierta'.
• Debajo, a ≥ 22 px en --text-2: 'con datos reales: log-verosimilitud y % de estados bien decodificados en secuencias apartadas (61)'.
• Takeaway del paso 4: '…¿acierta con datos que no vio? Y si no hay datos para examinarlo, dilo.'
- **[media] diapositiva R4:** El trellis del paso 1 rotula como α unos valores que son α̃. Contradice los números visibles de la 60, que la diapositiva cita como 'el mismo ejemplo'.
  - Evidencia: Calculado con numpy:
• Columnas 2 y 3 del diseño: (0.184, 0.162) y (0.2798, 0.0440). Son α̃ₜ = [Σ α̂ₜ₋₁ a_ij] b_j, que parte de la columna anterior ya normalizada.
• La 60 muestra α₂ = (0.0552, 0.0486) y α₃ = (0.02904, 0.00457).
El estudiante ve dos valores distintos con el mismo símbolo en el mismo ejemplo.
Además, el número de arriba va en gris a 18 px.
  - Propuesta: Rotular el número de arriba como α̃ ('antes de normalizar') y agregar la línea 'α̃ parte de la columna anterior ya normalizada; por eso no coincide con la α de la 60'.
Opción: mostrar al lado el α de la 60 en gris para que se vea que α = α̃ · (producto de las sumas anteriores).
Subir α̃ a 20 px en --text-2.
- **[media] diapositiva R3:** El ejemplo del paso 1 contradice su propio mensaje, y el paso trae fórmulas de más. El texto clave dice 'si la suma se va muy lejos, no es estacionaria', pero la caminata de la semilla 42 no cruza el valor crítico.
  - Evidencia: El diseño mismo reporta, con la emulación en numpy, η ≈ 0.348 para la caminata, por debajo de 0.463 (5 %). Con ADF, que normalmente no rechaza en una caminata, ese ejemplo caería en la celda 'discrepan'. Esa celda dice en el paso 4 'puede ser estacionaria alrededor de una tendencia', lo cual sería engañoso para una caminata aleatoria.
El paso 1 además muestra la fórmula de σ̂²_∞ con kernel de Bartlett.
Son 5 pasos en 90 s para un respaldo.
  - Propuesta: Reordenar sin cambiar la semilla.
Paso 1: solo el mecanismo (área de uₜ y η sobre la regla), sin veredicto.
Paso 2: las tasas de las 2 000 simulaciones.
Luego, el caso de la semilla 42 como 'un caso real en que KPSS no la detecta: por eso no se decide con una sola prueba'; ese es justo el argumento de la contraprueba. Decirlo explícitamente si cae en 'discrepan'.
Cambiar la fórmula de σ̂²_∞ por 'varianza corregida por autocorrelación (Bartlett)' en una nota mono.
Unir los pasos 3 y 4 para quedar en 4 pasos.
- **[media] diapositiva 2:** La línea de metro se sobrecarga y sus etiquetas chocan. Tiene unas 50 piezas de texto de 16–18 px, siglas que el público aún no conoce, y el hilo rojo se encima con las etiquetas de abajo.
  - Evidencia: Anchos calculados con la regla del diseño (mínimo de 96 px y luego normalización a 1696): Apertura, B, Puente y Cierre ≈ 91 px (el mínimo no se respeta tras normalizar); C y E ≈ 101; A 151; D 201.
Las palabras clave a 18 px miden ~330–380 px (p. ej., 'árbol · sobreajuste · sesgo y varianza').
Vecinos del mismo lado: A y C a 217 px entre centros, con semianchos que suman ~355 px (se enciman ~140 px); B y D, 247 px contra ~290 px.
El rango va a 16 px y las fechas del sparkline a 15 px.
'OOB' y 'ACF' no significan nada en el minuto 1.
El hilo, 'a 40 px debajo de la línea', cae justo donde van las etiquetas alternadas de abajo.
  - Propuesta: En la línea, solo la letra y el nombre de la sección a ≥ 22 px, sin rangos ni palabras clave. Alternativa: dos columnas verticales (U7 a la izquierda, U8 a la derecha) con nombre de 26 px y una frase en lenguaje llano.
Corregir la normalización: asignar primero los mínimos y repartir el resto proporcionalmente.
Poner el hilo 'modelo → validación → métrica' al pie del cuerpo, debajo de las tarjetas.
- **[media] diapositiva transversal:** Hay texto de lectura de menos de 20 px o en gris de bajo contraste (--text-3), que en proyector se lava. Incluye lo más importante de la 3: los nombres de las variables.
  - Evidencia: Contraste sobre #0c0c0d: --text-3 #6e6e77 = 3.87:1 (menor que 4.5 AA); --data-dim 2.65:1; --text-2 7.81:1.
Casos:
• 1: línea de autoría a 18 px en --text-3.
• 2: rangos a 16 px, palabras clave a 18 px, fechas a 15 px.
• 3 (paso 3): nombres de las 14 variables en mono de 15 px; es la pieza que enseña 'una columna es una variable'.
• 62: notas grises a 18 px.
• R4: α a 18 px en gris.
• 64: tamaño de la línea de estado sin definir.
• La etiqueta 'Caso ·' del encabezado (17 px, en una esquina) es la única señal del cambio de concepto a caso.
  - Propuesta: Regla para toda la sección: texto de lectura ≥ 20 px (≥ 22 px para etiquetas de datos) y en --text-2 o más claro. --text-3 solo para rótulos decorativos.
• Ficha: nombres a 20 px en --text-2, en dos columnas de 7 si no cabe.
• Autoría de la 1: 22 px en --text-2.
• Al entrar al caso, repetir 'Caso · Adult' como .label al inicio del cuerpo durante el paso en que aparece.
- **[media] diapositiva 64:** El índice no se puede operar con fluidez en las preguntas. Los chips solo muestran el número y el título aparece al pasar el mouse, así que hay que recorrer chip por chip con el público mirando el cursor. Con presentador inalámbrico no funciona.
  - Evidencia: El diseño muestra 11 renglones de chips de 40 px con 'solo el número de cada diapositiva registrada', y el título corto solo al pasar el mouse.
Ante una pregunta como '¿cómo era lo del bootstrap?', el expositor no sabe si es la 10, 11 o 12 sin pasar por cada una.
Para la sección H son 11 chips.
  - Propuesta: Mostrar el título corto visible: lista de dos columnas a 20 px agrupada por sección, o solo el nombre de la sección con un clic que despliegue sus títulos.
Agregar al Deck un salto por teclado: escribir dígitos (o 'R1') y Enter salta sin mouse y sin que el público lo note. Los chips quedan como respaldo.
- **[media] diapositiva R2:** Como respaldo para una pregunta, es demasiado largo y demasiado operado: 5 pasos en 90 s, dos deslizadores y botón 'reproducir', 5 renglones de álgebra y términos sin definir.
  - Evidencia: Paso 0: marcador arrastrable del margen.
Paso 2: deslizador M de 1 a 100 y chip 'reproducir'. El diseño no fija un M inicial, así que lo que se ve depende de que el expositor lo mueva.
La log-loss 'escalada' ln(1+e^{−2m})/ln 2 aparece sin explicar el factor.
En el paso 4 aparecen 'log-momio' y 'SAMME'.
  - Propuesta: Que los pasos fijen M, sin deslizadores: paso 2 con M = 1 (dos grupos en ±α₁), paso 3 con M = 100 y las curvas.
En el paso 0, tres marcadores fijos (m = −1, 0, 2) con sus valores.
La log-loss entra solo en el paso 4, con 'escalada para valer 1 en m = 0, como e^{−m}'.
'log-momio' → 'logaritmo de la razón P(sí)/P(no)'.
Objetivo: ≤ 70 s.
- **[baja] diapositiva 62:** La animación de 'k-fold de Adult → temporal' mezcla casos. Convierte pliegues de personas, que no tienen tiempo, en bloques temporales, y sugiere que los pliegues de Adult 'se alinean en el tiempo'.
  - Evidencia: Paso 2: 'una copia de los 5 bloques del k-fold de Adult baja y se reacomoda en orden temporal'.
Las filas de Adult son personas independientes y no tienen eje de tiempo. Lo que se quiere mostrar (que barajar una serie mete el futuro en el entrenamiento) no se ve con bloques de personas.
  - Propuesta: Animar dentro de la línea de tiempo de pasajeros. Primero, los 144 meses coloreados con una asignación K-fold barajada: los meses de prueba quedan intercalados entre meses de entrenamiento, con el rótulo 'el modelo vería el futuro'. Después, reacomodar a entrenamiento a la izquierda y prueba al final.
Es el mismo dibujo de la 30, así que funciona como recordatorio.
- **[baja] diapositiva 2:** Usa términos antes de definirlos y repite un dato que pierde su efecto. La nota del paso 2 habla de 'barajar' antes de que la 3 lo muestre, y la barra 76/24 aparece sin explicación y luego se repite en la 3.
  - Evidencia: Paso 2: 'aquí cambia la validación: en una serie no se puede barajar'. Validación y barajar se definen hasta los pasos 1–2 de la 3.
La tarjeta (a) muestra la BarraClases 76.1 / 23.9 % sin decir por qué importa. En el paso 3 de la 3, la misma barra con el texto 'solo 1 de cada 4 gana más' ya no sorprende.
  - Propuesta: Nota del paso 2: 'aquí cambia la forma de examinar al modelo: el orden importa'.
Tarjeta (a): solo la pregunta y '48 842 personas'. La barra 76/24 se reserva para la 3, donde se explica como piso.
- **[baja] diapositiva 3:** La vista 'ver como números' muestra códigos de OrdinalEncoder sin aclarar que el orden es arbitrario, y la interacción con chips obliga a usar el mouse.
  - Evidencia: workclass 'faltante' → 8 y Private → 3, por orden alfabético con mayúsculas primero. Un principiante lee '3 < 8' como una cantidad.
El propio diseño anticipa la pregunta '¿por qué 8?'.
Los chips A/B/C y el botón requieren clic y blur() en una diapositiva para principiantes.
  - Propuesta: Si se conserva, pasar a códigos con un paso de flecha en lugar de un chip, y agregar a ≥ 20 px: 'el número es solo una etiqueta (orden alfabético), no una cantidad'.
Con una sola persona fija (ver el primer hallazgo de la 3) se eliminan los chips A/B/C.
- **[baja] diapositiva transversal:** Hay animaciones de conteo decorativas que retrasan la lectura sin mostrar ningún mecanismo.
  - Evidencia: • 3 (paso 3): 'los conteos suben de 0 a su valor en 0.8 s' (0 → 48 842).
• R1 (paso 0): 'el resultado cuenta hasta 0.32768'; en el paso 2, 'los números cuentan hasta su valor'.
• 62: 'los dos números del HMM cuentan de 0 a su valor'; los puntos de F1 'se deslizan de 0.40 a su valor'.
  - Propuesta: Que los números aparezcan con un desvanecido simple. Dejar movimiento solo donde muestra el mecanismo, que en el diseño ya está bien resuelto: barajado y rondas del K-fold, factor 4/5 que vuela a la fórmula, columnas que se normalizan en la R4 y caída a 0 en t = 686.
- **[baja] diapositiva R4:** Hay jerga numérica de más y una doble inversión innecesaria. El recordatorio distingue mínimo normal y subnormal con dos líneas y una franja, y el escalamiento se presenta con c_t = 1/suma y log P = −Σ log c_t.
  - Evidencia: Paso 0: Recap con 2.2 × 10⁻³⁰⁸ y 4.9 × 10⁻³²⁴, dos líneas de referencia y una franja 'subnormal'. Para entender por qué Forward llega a 0 basta una sola cota.
Paso 1: bajo cada columna se muestra la suma; luego c_t = 1/suma; luego un signo menos en la fórmula. Son dos inversiones para llegar a 'P(O) = producto de las sumas'.
  - Propuesta: Una sola línea de referencia: 'por debajo de ~10⁻³²⁴ la computadora guarda 0'. La distinción normal/subnormal va en voz o en una nota.
En pantalla, sₜ = suma de la columna, P(O|λ) = ∏ sₜ y log P = Σ log sₜ. 'Rabiner llama cₜ = 1/sₜ' va en una nota mono.
- **[baja] diapositiva R1:** El paso 1 junta tres ideas para responder una pregunta que necesita una: dos caminos al límite, una desigualdad de cotas y una banda sombreada.
  - Evidencia: La pregunta del chip es '¿De dónde sale el 36.8 %?'. El camino A (definición de e) basta para responderla.
El camino B (serie de Taylor de ln), la cota e⁻¹(1 − 1/n) ≤ … ≤ e⁻¹ y la banda que se angosta son contenido adicional que el propio diseño reconoce como riesgo ('si el público no la conoce').
  - Propuesta: En pantalla, el camino A y la gráfica con puntos y asíntota.
El camino B y la cota van a una nota mono pequeña o en voz, y se quita la banda.
El dato 'a 0.00046 de e⁻¹ con n = 400' del paso 2 ya transmite qué tan cerca está.
- **[baja] diapositiva 63:** El segundo paso, con ~19 referencias complementarias en 3 columnas a 20 px (~40 líneas), no se puede leer en los ~10 s previstos y cuesta un clic más en el cierre.
  - Evidencia: El propio diseño dice 'Texto denso: no se lee en voz alta. Se deja ~10 s y se avanza'.
A 20 px y con interlineado de 1.35, 40 líneas no se leen desde el fondo ni en ese tiempo.
  - Propuesta: Dejar la 63 en un solo paso con las 5 principales y la línea '+ 19 referencias de detalle (pruebas, criterios y software) en el repositorio'. La lista completa va al README o a una diapositiva de respaldo, sin clic en el flujo normal.

## Revisión 2

Revisé el diseño y comprobé en Python (sin escribir archivos) los números que se pueden calcular.

**Lo que está bien:**
- Conteos de Adult: 48 842 personas, 11 687 positivos, 6 variables numéricas y 8 categóricas.
- Faltantes: 2 799 / 2 809 / 857, con 3 620 filas que tienen al menos uno.
- Filas 0, 2 y 4: la 2 es la primera con y=1 y la 4 es la primera con workclass faltante.
- education ↔ education-num: 16 pares, correspondencia uno a uno.
- Pliegues: 9 769/9 769/9 768/9 768/9 768 y positivos 2 338/2 338/2 337/2 337/2 337.
- Piso de la clase mayoritaria: 0.76072.
- R1: sucesión, cotas, 146.97 personas fuera y la diferencia de 0.00046.
- R2: ε1–3 = 0.2400 / 0.2887 / 0.3444, error de entrenamiento 0.185, pérdida 0.8542 → 0.6095, y la identidad ∏Zk.
- R3: η = 0.1146 (2 rezagos) y 0.3482 (8 rezagos); KPSS rechaza 77.1 % de las caminatas y 4.05 % del ruido.
- R4: conteos 320/356/324 y 558/442, primer subnormal en t = 653, primer cero en t = 686, ln P = −1089.3552, Viterbi = −1330.5854.
- HMM con T = 3: 0.033612 y 0.01344.
- Datos de pasajeros: 144 meses, suma 40 363, mínimo 104, máximo 622 en julio de 1960.
- Las citas bibliográficas que revisé de memoria son correctas.

**Errores que encontré:**
- **Notación en R4.** El paso 1 llama α a valores que en realidad son α̃. Contradice los α de la 60: para t = 2, la 60 muestra 0.0552 y 0.0486, y R4 pondría 0.184 y 0.162.
- **Atribución del ejemplo del clima.** No viene del artículo 'Viterbi algorithm' de Wikipedia, que hoy usa el ejemplo del médico (sano/fiebre). Viene del artículo 'Hidden Markov model'.
- **R2 no describe lo que hace la implementación.** La derivación dice que h minimiza ε, pero sklearn y TS eligen el stump por Gini ponderado. En 95 de 100 rondas existe un stump con menor ε.
- **R2, "bajarla obliga a bajar el error".** Es falso: el error de entrenamiento sube en 27 rondas y su mínimo (0.180) está en M = 39.
- **La 62 aplica la receta al clima sin métrica real.** Pone P(O|λ) en la columna Métrica cuando no es una métrica de desempeño, y dice que solo cambia la validación.
- **R3 con pasajeros.** En mi emulación, Δlog y Δ12log caen en la celda 'ADF no rechaza / KPSS no rechaza'. La guía de statsmodels lee esa celda como 'tendencia', y aquí sería falso: la causa es estacional.
- **Contrato de series para la 62 incompleto.** Falta exigir que el orden se elija solo con el entrenamiento, que Ljung-Box quite los residuos iniciales y ajuste los grados de libertad, y que las métricas se calculen en la escala original.
- **Ficha de la 3.** El ColumnTransformer cambia el orden de las columnas, y los códigos son alfabéticos: '11th' = 1, 'Preschool' = 13 y 'Doctorate' = 10.
- **Problemas menores:**
  - Con dos decimales, todos los pliegues muestran 23.93 %, no 23.92.
  - 'La 5 usa exactamente esto' es solo media verdad: el paso 1 de la 5 usa un holdout en Adult-3D.
  - La regla del empate en la 62 compara contra la desviación de cada modelo y no contra la diferencia por pliegue.
  - En R2 hay márgenes fuera del dominio de la gráfica.
  - Varias afirmaciones absolutas: 'no se puede barajar' y 'cada persona es independiente'.
  - El OOB descrito como examen de cada árbol.
  - Faltan referencias.
  - Las semillas de las simulaciones de R3 y R4 no fijan qué se sortea primero.

Archivos revisados (todos en la carpeta del proyecto): scripts/adult_comun.py, scripts/comparar_ensambles.py, scripts/exportar_datos.py, src/data/comparacion_adult.json, src/data/adult3d.json, src/data/curva_profundidad.json, src/lib/hmm.ts, src/slides/05-error-entrenamiento-prueba.tsx y src/slides/60-forward-vs-viterbi.tsx.

- **[alta] diapositiva 1:** R4, paso 1: el valor de arriba de cada nodo se rotula como α, pero en las columnas 2 y 3 no es α_t sino α̃_t, que se calcula a partir de α̂_{t−1} ya normalizado. Así, en pantalla el mismo símbolo α tendría valores distintos a los de la 60.
  - Evidencia: Con el λ del clima y O = caminar, comprar, limpiar, el α real (el que muestra la 60, src/slides/60-forward-vs-viterbi.tsx con forward()) es α₂ = (0.0552, 0.0486) y α₃ = (0.02904, 0.004572). Los valores que el diseño rotula como α son (0.184, 0.162) y (0.280, 0.0440). Esos son α̃₂ = [Σᵢ α̂₁(i)aᵢⱼ]bⱼ con α̂₁ = (0.2, 0.8): (0.2·0.7 + 0.8·0.4)·0.4 = 0.184. Solo en la columna 1 coinciden α y α̃. La fórmula del propio diseño ya usa la notación correcta (α̃_t = [Σ α̂_{t−1} a] b); el error está en el rótulo del Trellis.
  - Propuesta: Rotular el número de arriba como α̃ ('sin normalizar, calculada desde la columna normalizada anterior'). Otra opción es mostrar el α verdadero de la 60 junto con α̂ y agregar la identidad α_t(j) = α̂_t(j)·∏_{s≤t} sumas_s, por ejemplo 0.5318·0.30·0.346 = 0.0552. Agregar una aserción en TS: α̂_t·∏ sumas = forward()[t] a 1e−15.
- **[media] diapositiva 2:** La 63 y la regla de rigor de la 62 atribuyen el ejemplo del clima al artículo 'Viterbi algorithm' de Wikipedia. Ese artículo ya no lo contiene.
  - Evidencia: Consulté hoy los dos artículos. 'Viterbi algorithm' usa el ejemplo del médico: estados Healthy/Fever, observaciones normal/cold/dizzy, resultado Healthy→Healthy→Fever con 0.01512. El ejemplo con Rainy/Sunny, walk/shop/clean, π = (0.6, 0.4), A y B idénticos al de la exposición está en 'Hidden Markov model', subsección 'Weather guessing game' (dentro de 'Examples'). Ese artículo no trae la decodificación S→L→L con 0.01344: ese número sale de nuestro cálculo con viterbi().
  - Propuesta: Citar: Wikipedia, 'Hidden Markov model', sección Examples › Weather guessing game, con fecha de consulta. Aclarar que P(O|λ) = 0.033612 y el camino S→L→L (0.01344) se calcularon en lib/hmm.ts y se verificaron con hmmlearn. Corregir la regla de rigor de la 63, que dice 'Viterbi algorithm'.
- **[media] diapositiva 3:** R2, pasos 1 y 2: la derivación concluye que el mejor h es el de menor error ponderado ε, y el texto dice que 'los pesos y el α de AdaBoost son la solución de minimizar e^{−yF}'. Pero sklearn y lib/adaboost.ts eligen el stump por Gini ponderado, que no minimiza ε. Solo α es óptimo para el h elegido.
  - Evidencia: Corrí sklearn AdaBoostClassifier(stump, 100, random_state=42) sobre las 400 visibles de adult3d.json. Comparé cada ronda contra una búsqueda exhaustiva de stumps por ε mínimo con los mismos pesos. En 95 de 100 rondas el stump de Gini tiene mayor ε; la brecha máxima es 0.046. Ronda 1: Gini elige 'todos no' con ε = 0.2400, pero el stump 'educación ≤ 13 → no, > 13 → sí' tiene ε = 0.2325. Ronda 3: 0.3444 contra 0.3262. La identidad (1/N)Σe^{−yF} = ∏2√(ε(1−ε)) sí se cumple, porque solo requiere α óptimo dado h.
  - Propuesta: En el renglón (c) agregar en gris: 'en teoría, h es el de menor ε; sklearn (y nosotros) lo elige con Gini ponderado, una aproximación'. En el paso 2 mostrar el ejemplo real de la ronda 1 (ε = 0.240 contra 0.2325 posible). Cambiar el texto clave a 'el α y los pesos salen de minimizar e^{−yF}; el clasificador se elige con un criterio aproximado'.
- **[media] diapositiva 4:** R2, texto clave del paso 0: 'bajarla obliga a bajar el error'. Es falso: una cota superior que baja no obliga a que baje el error 0–1, solo le pone un techo. El paso 3 lo va a contradecir en pantalla.
  - Evidencia: En la misma corrida de 400 personas, la pérdida exponencial baja en las 100 rondas, pero el error de entrenamiento sube en 27 de las 99 transiciones. Su mínimo es 0.180 en M = 39 y termina en 0.185 en M = 100. Ejemplo: 0.195 en M = 5 y 0.2075 en M = 6.
  - Propuesta: Texto clave: 'e^{−m} siempre queda por encima del error 0–1: el error nunca puede superarla, y si la pérdida llega a 0, el error también'. En el paso 3 rotular el mínimo (0.180 en M = 39) y decir que la curva gris puede subir aunque la roja baje.
- **[media] diapositiva 5:** La 62 presenta la receta como si funcionara igual en los tres casos, pero el renglón Clima no tiene validación ni métrica. Además, enmarcar solo la columna Validación como 'lo que cambia' es exagerado.
  - Evidencia: El diseño pone 'P(O|λ) = 0.03361 … 0.01344' bajo el encabezado Métrica. La 3 define métrica como 'qué tan bien acierta en esas filas', y la propia regla de rigor de la 62 dice que 'P(O|λ) no es una métrica de desempeño'. El texto clave del paso 4 ('la pregunta es siempre la misma: ¿acierta con datos que no vio?') no se cumple para el clima: nada se evaluó con datos apartados. Entre casos también cambian la métrica (F1-macro / MAE·RMSE·MAPE / log-verosimilitud) y los datos, así que atenuar esas columnas sugiere que no cambian.
  - Propuesta: Celda Métrica del clima: '— (no se evaluó: λ dado)' y en gris 'con datos: log-verosimilitud en secuencias apartadas'. Mover P(O|λ) y el camino a la columna Modelo como 'qué calcula'. Paso 4: rótulo 'depende de los datos' en vez de 'lo que cambia', y texto 'la métrica cambia con la tarea; la validación cambia con la estructura de los datos'.
- **[media] diapositiva 6:** R3, pasos 3 y 4: con los pasajeros, dos de las cuatro transformaciones caen en la celda 'ADF no rechaza / KPSS no rechaza'. La guía de statsmodels lee esa celda como 'estacionaria alrededor de una tendencia', y en este caso eso es falso: la causa es la estacionalidad, que ninguna de las dos pruebas mide. El texto clave 'se declara estacionaria cuando las dos coinciden' también es exagerado.
  - Evidencia: Emulé adfuller (constante, autolag AIC, maxlag 14, valores críticos de MacKinnon) y kpss (nivel, rezagos automáticos de Hobijn) en numpy. La emulación reproduce los valores conocidos de statsmodels: y 0.815 con 13 rezagos; log −1.717 con 13; Δlog −2.717 con 14. Resultados: log y → ADF −1.717 no rechaza y KPSS η = 1.669 rechaza (coinciden: no estacionaria). Δlog y → ADF −2.717 contra −2.884 al 5 % (p ≈ 0.07), no rechaza; KPSS η = 0.038, no rechaza (discrepan). Δ₁₂ log y → ADF −2.71 contra −2.886, no rechaza; KPSS η = 0.292, no rechaza (discrepan). ΔΔ₁₂ log y → ADF −4.44 rechaza y KPSS η = 0.073 no rechaza (coinciden: estacionaria). Δlog y no tiene tendencia y sí un patrón de 12 meses evidente, pero KPSS da η = 0.038. Con α = 0.10, las dos pruebas 'coincidirían' en declarar estacionaria una serie estacional.
  - Propuesta: En el paso 3, hacer obligatoria (no solo 'si alguien pregunta') la nota: 'ADF y KPSS no detectan raíz unitaria estacional: Δlog sigue teniendo el patrón de 12 meses'. Paso 4: decir que la lectura de 'tendencia' de la guía solo aplica si KPSS se corre con regression='ct'; para pasajeros, la discrepancia se explica por estacionalidad y poca potencia. Texto clave: 'si coinciden, más confianza; antes, mira la gráfica y la ACF en el rezago 12'.
- **[media] diapositiva 7:** El contrato de series_resultados.json que lee la 62 no fija el protocolo, y eso puede meter fuga de datos o un Ljung-Box engañoso. Además, '(> 0.05: sin autocorrelación)' contradice la regla de 'nunca se acepta H0'.
  - Evidencia: (a) El contrato solo dice criterio 'AIC'. Si el orden SARIMA o la identificación por ACF/PACF se hacen con los 144 meses, el periodo de prueba influye en el modelo. (b) AIC solo es comparable entre modelos con los mismos d y D. (c) En statsmodels SARIMAX con d = 1 y D = 1 (s = 12), los primeros d + sD = 13 residuos son de arranque (loglikelihood_burn) y enormes. Correr acorr_ljungbox(res.resid) sin quitarlos, y sin model_df = p+q+P+Q, distorsiona el p. (d) Si se ajusta en log, MAE/RMSE/MAPE deben calcularse en miles de pasajeros tras exp(), igual que la ingenua estacional. (e) La animación que reacomoda los 5 bloques del k-fold sugiere una prueba del 20 % (~29 meses); debe usar el tamaño real del JSON. (f) El texto '(> 0.05: sin autocorrelación)' afirma H0, en contra de la regla de R3.
  - Propuesta: Agregar al contrato: { seleccion_con: 'solo entrenamiento', d, D fijos antes del AIC, ljung_box: { lags, model_df, burn: 13, sobre: 'residuos de entrenamiento' }, escala_metricas: 'original' }. Usar res.test_serial_correlation('ljungbox'), que ya descarta los residuos de arranque, o quitarlos a mano. Cambiar el texto a 'p > 0.05: no se detecta autocorrelación en los residuos'. Dibujar la partición con los meses reales del JSON.
- **[media] diapositiva 8:** FichaPersona ('ver como números', diapositiva 3): (a) el preprocesador cambia el orden de las columnas, así que el script puede asignar mal los códigos; (b) los códigos de OrdinalEncoder siguen orden alfabético, no un orden real, y el público puede leerlos como un orden con significado.
  - Evidencia: preprocesador(X).get_feature_names_out() devuelve las 8 categóricas primero (cat__workclass … cat__native-country) y luego las 6 numéricas (remainder__age …). Si se emparejan con X.columns en su orden original, age recibiría el código de workclass. Fila 0 codificada: [3, 1, 4, 6, 3, 2, 1, 38, 25, 226802, 7, 0, 0, 40]. Códigos de education: '11th' = 1, 'Assoc-acdm' = 7, 'Doctorate' = 10, 'Preschool' = 13, 'Some-college' = 15. Preschool queda arriba de Doctorate, y el árbol corta por umbral sobre ese orden.
  - Propuesta: En exportar_apertura.py, mapear por get_feature_names_out() (quitando los prefijos cat__/remainder__) y agregar una aserción: el código de workclass de la fila 0 es 3 y la edad de la fila 0 es 25. En la ficha, una nota gris: 'los códigos siguen orden alfabético, no significan más o menos; el orden real de escolaridad está en años de educación'.
- **[baja] diapositiva 9:** Diapositiva 3, paso 4: los porcentajes de positivos por pliegue están mal redondeados. Con dos decimales, los cinco pliegues dan 23.93 %, no 23.93 / 23.93 / 23.92 / 23.92 / 23.92.
  - Evidencia: Python con StratifiedKFold(5, shuffle=True, random_state=42): 2338/9769 = 23.9328 % y 2337/9768 = 23.9251 %. Como 23.9251 se redondea a 23.93, lo que calcule TS mostrará 23.93 en los cinco. La regla de rigor '23.92–23.93 %' también es incorrecta.
  - Propuesta: Mostrar tres decimales (23.933 / 23.925) o los conteos (2 338 de 9 769). Cambiar la regla a 'todos ≈ 23.93 %; difieren en una persona'.
- **[baja] diapositiva 10:** Diapositiva 3, paso 4: la nota 'la 5 usa exactamente esto' solo es cierta para la mitad de la 5.
  - Evidencia: En src/slides/05-error-entrenamiento-prueba.tsx, el paso 1 usa Adult-3D con una sola partición de 10 000 de entrenamiento y 5 000 de prueba ('Adult · 3 variables · 5 000 personas de prueba', línea 366). Solo el paso 2 ('Adult completo · CV de 5 pliegues') usa StratifiedKFold(5, 42), que es lo que exporta curva_profundidad.json.
  - Propuesta: Cambiar a: 'la curva de Adult completo (5) y la tabla de la 27 usan exactamente esto'. Si se quiere, mencionar que el árbol 3D de la 5 usa una sola partición de entrenamiento y prueba.
- **[baja] diapositiva 11:** La 62 declara el empate entre GB y XGBoost con la regla |Δ| < max(desv). Esa regla compara contra un parámetro equivocado, y el JSON no guarda los valores por pliegue que harían falta para la comparación correcta.
  - Evidencia: Recalculé los dos modelos con los mismos pliegues. Diferencias de F1-macro (XGB − GB) por pliegue: [0.0024, 0.0030, −0.0021, 0.0060, 0.0027]. XGBoost gana en 4 de 5, con media 0.0024 y desviación pareada 0.0029 (t = 1.84 con 4 g.l., no significativo; además los pliegues se traslapan en entrenamiento, así que t es optimista). En accuracy la diferencia media es −0.0001. La conclusión de empate se sostiene, pero la desviación de cada modelo incluye la dificultad de cada pliegue, que comparten ambos modelos. Con esa regla, diferencias consistentes, como RF vs AdaBoost en F1 (5 de 5 pliegues, +0.0058), podrían pasar por empate. comparacion_adult.json solo guarda media y desviación.
  - Propuesta: Exportar las métricas por pliegue en comparar_ensambles.py (campo 'por_pliegue'). Texto generado: 'XGBoost gana en 4 de 5 pliegues por 0.002 de F1 en promedio, del tamaño de la variación entre pliegues; en accuracy, igual'. Seguir aclarando que no es una prueba formal.
- **[baja] diapositiva 12:** R2: el rango de la gráfica de márgenes no cubre los datos, y el riesgo de escala se revisó solo en M = 100.
  - Evidencia: El paso 0 define el eje x de −2 a 4. En M = 100 el margen máximo es 4.38 y 48 de las 400 personas quedan arriba de 4. Con el deslizador, el margen más negativo de todo el recorrido es −1.48 en M = 6 (e^{1.48} = 4.40), no −1.37. Cabe en yMax = 4.5, pero con poco margen.
  - Propuesta: En el paso 2 usar un dominio x de −1.6 a 4.5, o calcular min y max sobre todas las M al montar. En el riesgo, documentar −1.48 en M = 6.
- **[baja] diapositiva 13:** Hay afirmaciones absolutas sobre el barajado. En las diapositivas 2 y 62: 'en una serie no se puede barajar' y 'barajar es hacer trampa'. En la 62: 'cada persona es independiente de las demás'.
  - Evidencia: Bergmeir, Hyndman y Koo (2018, Computational Statistics & Data Analysis 120:70–83) muestran que la K-fold estándar es válida para modelos autorregresivos puros con errores no correlacionados. Lo que falla es con tendencia o estacionalidad, o al ajustar ARIMA con diferenciación. En Adult, la independencia es un supuesto: hay 52 filas exactamente duplicadas (incluida y) y el censo de origen muestrea hogares.
  - Propuesta: Decir 'en general no se baraja: con tendencia y estacionalidad, el modelo vería el futuro' y 'suponemos personas independientes: por eso barajar está bien'.
- **[baja] diapositiva 14:** R1, paso 3: 'el ≈ 36.8 % que no vio es su examen gratis: el error OOB' describe el OOB como el examen de cada árbol. En realidad, el error OOB es del voto conjunto de los árboles que no vieron a cada persona.
  - Evidencia: El OOB de sklearn predice a cada persona solo con los árboles en cuya muestra no estuvo (≈ e⁻¹·B árboles) y mide el error de ese voto agregado. No es el error de cada árbol por separado. Además, con n = 400 la fracción esperada dentro es 253.03/400 = 63.26 %, no 63.2 %.
  - Propuesta: 'Cada persona queda fuera de ≈ 36.8 % de los árboles: esos árboles votan por ella sin haberla visto, y ese voto es el error OOB (12)'. Con n = 400, mostrar 63.3 % junto al límite de 63.2 %.
- **[baja] diapositiva 15:** R3, paso 1: la caminata del esquema no cruza el crítico del 5 %, pero el texto clave del paso dice 'si la suma se va muy lejos, no es estacionaria'. Además, el script no fija cómo se generan las dos series.
  - Evidencia: Con default_rng(42), ruido = standard_normal(144) y luego caminata = cumsum de 144 sorteos nuevos, da η = 0.1146 (2 rezagos) y 0.3482 (8 rezagos). Eso coincide con el diseño: 0.3482 queda arriba del crítico del 10 % (0.347) y abajo del de 5 % (0.463), con p ≈ 0.10. Si la caminata fuera cumsum(ruido), η = 0.99. La simulación sí reproduce los porcentajes: KPSS rechaza 77.1 % de las caminatas y 4.05 % del ruido.
  - Propuesta: Fijar en exportar_respaldo.py el orden de los sorteos (ruido primero, caminata con sorteos nuevos). En el paso 1, dibujar en la regla las marcas del 10 % y del 5 %, y cambiar el texto clave a 'KPSS mide qué tan lejos se va la suma; esta caminata se queda cerca del umbral: por eso hace falta la contraprueba'.
- **[baja] diapositiva 16:** R4: la secuencia de 1 000 días depende del orden de muestreo, y el diseño no lo especifica.
  - Evidencia: Muestrear estado y su emisión de forma alternada con default_rng(42) reproduce todo el diseño: 320/356/324, 558/442, t = 653 y 686, ln P = −1089.35519, Viterbi = −1330.58536. Muestrear primero los 1 000 estados y luego las emisiones da 313/352/335, 570/430, t = 649/682 y ln P = −1092.76.
  - Propuesta: Documentar en exportar_respaldo.py el orden 'estado → su emisión → siguiente estado' y guardarlo en el JSON junto a la semilla.
- **[baja] diapositiva 17:** R2, paso 0: la log-loss 'ln(1+e^{−2m})/ln 2 (la que usa GB)' está en la escala de AdaBoost, no en la de GB. Sin aclararlo, el factor 2 parece arbitrario.
  - Evidencia: ESL §10.5 y la figura 10.4 usan la devianza binomial log(1+e^{−2yf}) con f = medio log-momio, para que tenga el mismo minimizador que la exponencial. En sklearn GB la función cruda es el log-momio F = 2f y la pérdida es ln(1+e^{−yF}).
  - Propuesta: Rótulo: 'log-loss de GB, con el margen en la escala de AdaBoost (m = ½ log-momio), reescalada para valer 1 en m = 0'.
- **[baja] diapositiva 18:** A las referencias de la 63 les faltan fuentes de métodos que la exposición usa explícitamente.
  - Evidencia: R3 cita 'nlags=auto, Hobijn et al. 1998', pero no está en la lista. El ADF con rezagos y autolag es la versión aumentada de Said y Dickey (1984, Biometrika 71(3):599–607); Dickey y Fuller (1979) es la prueba sin aumentar. Los p de ADF en statsmodels vienen de MacKinnon (1994 y 2010).
  - Propuesta: Agregar a 'Series': Said y Dickey (1984), Hobijn, Franses y Ooms (1998, Statistica Neerlandica 58(4)), MacKinnon (2010, Queen's Economics Dept. WP 1227) y, si se usa el matiz del hallazgo 13, Bergmeir, Hyndman y Koo (2018). Verificar contra el DOI como en el resto.
