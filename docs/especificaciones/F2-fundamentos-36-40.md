# Especificación detallada — F. Fundamentos de series (parte 2) · diapositivas 36 a 40 · caso: pasajeros aéreos 1949–19

> Borrador de diseño generado por un agente. Sirve de referencia al construir; el plan vigente es `docs/PLAN-DIAPOSITIVAS.md`. Los números son los esperados y se recalculan al construir.

**Notas de la sección:** F. Fundamentos de series (parte 2) · diapositivas 36 a 40 · caso: pasajeros aéreos 1949–1960. Encabezado común: section={["U8 · Datos secuenciales", "F. Fundamentos de series"]}, caso="Pasajeros aéreos" desde el primer paso de caso. Archivos: src/slides/36-diferenciacion.tsx (6 pasos), 37-adf.tsx (6), 38-promedio-movil.tsx (4), 39-rezagos-acf.tsx (5), 40-pacf.tsx (5). Cuerpo útil del lienzo: 1696 × ≈630 px (con lede de 2 líneas). Todos los números que se citan abajo ya los calculé en modo solo lectura (numpy/scipy del .venv, con una réplica de adfuller que reproduce exactamente la salida clásica de statsmodels: 0.815369 / p 0.991880 / 13 rezagos / 130 obs). Se citan para verificar; en las diapositivas nunca se escriben a mano.


## 36 · Diferenciar: volver estacionaria una serie

- **Objetivo:** Entender que AR y MA estiman constantes, por eso necesitan una serie estacionaria, y que restar el valor anterior (∇) quita la tendencia y restar el mismo mes del año anterior (∇₁₂) quita la estacionalidad.
- **Estado:** nueva · **Duración:** 90 s

### Pasos

**Paso 0 (concepto).** Dos columnas (720 px | 900 px, separación 76). Izquierda: tres enunciados con filete izquierdo (mismo estilo que las definiciones de la 5): (1) 'Un AR o un MA estima números fijos: una media μ, un peso φ, una varianza σ².' (2) 'Esos números solo describen el futuro si la serie se comporta igual en cualquier tramo: es estacionaria (recordatorio en la 35).' (3) 'Si no lo es, se transforma hasta que lo sea. Al pronosticar, la transformación se deshace.' Derecha: etiqueta 'Esquema · no son datos'. Panel 900×250 con la serie de juguete de 12 valores (puntos y línea gris, cada valor escrito encima) y dos tramos sombreados, t = 1–4 y t = 9–12, cada uno con su media como segmento rojo y rótulo mono 'media 4.75' y 'media 13.25'.

- Animación: Serie con Reveal; los dos tramos y sus medias aparecen con fundido de 0.45 s.
- Interacción: ninguna
- Frase clave: Si la media cambia de un tramo a otro, no hay un solo μ que aprender.

**Paso 1 (concepto).** Izquierda: los enunciados se sustituyen por la fórmula grande ∇x_t = x_t − x_{t−1} y debajo x_t = a + b·t + e_t ⇒ ∇x_t = b + (e_t − e_{t−1}). Derecha: bajo la serie aparece un segundo panel de 900×220 con eje en 0 y rótulo '∇x'.

- Animación: Para t = 2…12, cada 300 ms: en la serie se dibuja el segmento vertical del salto x_{t−1} → x_t (rojo si sube, gris si baja). Una copia del segmento baja al panel inferior y queda como barra de altura ∇x_t con su número. Al final aparece una línea discontinua en la media de ∇x (1) con el rótulo 'media 1 en cualquier tramo'. Total ≈ 3.5 s.
- Interacción: ninguna
- Frase clave: Restar el valor anterior convierte una subida constante en un nivel constante.

**Paso 2 (concepto).** Derecha: la serie cambia, con fundido, a la de juguete trimestral (12 valores: 3 años × 4 trimestres, eje T1…T4 con separadores de año). Izquierda: ∇_s x_t = x_t − x_{t−s} y s_t = s_{t−s} ⇒ ∇_s s_t = 0, y una línea mono 'trimestral: s = 4 · mensual: s = 12'.

- Animación: Para t = 5…12: un arco une x_{t−4} con x_t (el mismo trimestre del año anterior) y la diferencia cae al panel inferior como barra. Las 8 barras miden lo mismo (1).
- Interacción: ninguna
- Frase clave: Restar el mismo trimestre del año anterior cancela el patrón que se repite. Solo queda lo que creció de un año a otro.

**Paso 3 (caso).** Aparece 'Caso · Pasajeros aéreos'. Lede: 'Pasajeros internacionales por mes (miles), en logaritmo (diapositiva 34). Filas = años, columnas = meses.' Izquierda 1000×560: superficie 3D año × mes de log(pasajeros). Eje X = meses (E F M A M J J A S O N D), profundidad = años (1949 … 1960, rótulo cada 2 años), altura = valor. Líneas por año (perfil estacional, gris claro) y por mes (tendencia, gris oscuro). Derecha 640 px: chips [log · ∇ log · ∇₁₂ log · ∇∇₁₂ log], con 'log' activo. Debajo, la fórmula y_t = log x_t y una lectura generada con los datos: 'Sube año con año: tendencia. Todos los años el pico cae en julio o agosto: estacionalidad.' Al fondo, un SeriesChart de 640×200 con los 144 meses y, como en el esquema, la media de los primeros 24 valores y de los últimos 24 (4.88 vs 6.10).

- Animación: La superficie crece desde el piso (altura 0 → valor, 0.8 s).
- Interacción: Arrastrar para girar. Los chips permiten saltar a cualquier transformación, incluida '∇₁₂ log' sola, que no tiene clic propio.
- Frase clave: A lo largo de los años hay tendencia, y cada año se repite el mismo pico de verano.

**Paso 4 (caso).** Chip '∇ log' activo. Altura = cambio contra el mes anterior, con un plano translúcido en 0 y la escala fija en ±0.35 (la misma para las tres diferencias). Fórmula ∇log x_t = log(x_t/x_{t−1}). Lectura generada: 'La inclinación entre años desaparece: en promedio +0.95 % por mes. La ondulación por mes sigue: marzo, junio, julio y diciembre suben todos los años; septiembre, octubre y noviembre bajan todos los años.' El SeriesChart muestra ∇log con las medias de los tramos (0.011 vs 0.010).

- Animación: La superficie se transforma (los vértices interpolan durante 0.7 s). La etiqueta del eje vertical cambia con un fundido cruzado.
- Interacción: chips y arrastrar para girar
- Frase clave: Una diferencia quita la tendencia, pero no la estacionalidad: la media todavía depende del mes.

**Paso 5 (cierre).** Chip '∇∇₁₂ log' activo. La superficie queda casi plana alrededor de 0. Fórmula ∇∇₁₂log x_t = ∇₁₂log x_t − ∇₁₂log x_{t−1}. Lectura: 'Sin tendencia ni patrón por mes. Se pierden 13 meses: quedan 131.' SeriesChart con medias de los tramos 0.006 vs 0.003. Al pie, a todo lo ancho, el takeaway.

- Animación: Morph de 0.7 s; el takeaway entra con Reveal.
- Interacción: chips y arrastrar para girar
- Frase clave: Logaritmo, una diferencia y una diferencia estacional (d = 1, D = 1). ¿Ya es estacionaria? Lo decide una prueba: ADF.

### Visuales

- **Serie de juguete con la operación animada** (svg, OperacionAnimada (nuevo)): Puntos con su valor, saltos o arcos que caen como barras a un panel inferior con eje en 0. Lleva la etiqueta 'Esquema · no son datos'.
- **Superficie año × mes** (3d, MatrixSurface3D (nuevo) + Scene3D/Label3D (existentes)): Malla de 12×12 vértices exactos (sin interpolar), con líneas por fila y por columna, plano en 0 para las diferencias, celdas faltantes (ene 1949, todo 1949 en ∇₁₂) dibujadas en 0 y sin líneas, y morph entre matrices. Va dentro de Scene3D y los rótulos usan Label3D.
- **Serie transformada con medias de tramos** (svg, SeriesChart (nuevo)): Línea de la transformación activa con eje de tiempo en años, línea en 0 y dos segmentos con la media de los primeros y de los últimos 24 valores.
- **Fórmulas y chips** (formula, TeX (existente), .chip (existente)): TeX para las fórmulas y clase .chip para los botones de transformación (patrón de RateChips de la 20, con blur al hacer clic).

### Datos

- **esq36_tendencia** (esquema-didactico): Serie de juguete x = [3, 5, 4, 7, 8, 7, 10, 12, 11, 13, 15, 14]. ∇x = [2, −1, 3, 1, −1, 3, 2, −1, 2, 2, −1], de media 1. Medias de tramo: t = 1–4 → 4.75 y t = 9–12 → 13.25. — *Cálculo:* diff(x, 1), mean() y medias de tramo con src/lib/series.ts, en vivo. — *Verificación:* A mano: la suma de diferencias es x₁₂ − x₁ = 11, entre 11 diferencias da 1. Un test de node comprueba los arreglos.
- **esq36_estacional** (esquema-didactico): Serie trimestral de juguete x = [10, 14, 8, 12, 11, 15, 9, 13, 12, 16, 10, 14] (patrón +2, +6, 0, +4 sobre un nivel que sube 1 por año). ∇₄x = [1, 1, 1, 1, 1, 1, 1, 1]. — *Cálculo:* diff(x, 4) en TS. — *Verificación:* A mano, y con un test de node.
- **pas_valores** (python-json): 144 totales mensuales de pasajeros internacionales (miles), ene 1949 – dic 1960. Box, Jenkins & Reinsel, Serie G (R datasets::AirPassengers). — *Cálculo:* scripts/exportar_series.py → src/data/pasajeros.json; se lee con src/lib/pasajeros.ts. — *Verificación:* El script valida n = 144, suma = 40 363, media 280.2986, desviación estándar 119.9663, mín. 104 (nov 1949) y máx. 622 (jul 1960).
- **pas_matrices** (ts-vivo): Matrices 12×12 (año × mes) de log x, ∇log x, ∇₁₂log x y ∇∇₁₂log x. Faltan ene 1949 en ∇; todo 1949 en ∇₁₂; todo 1949 y ene 1950 en ∇∇₁₂. — *Cálculo:* log, diff(·,1) y diff(·,12) de series.ts, y toYearMonth(serie, desplazamiento). — *Verificación:* Se comparan contra pandas .diff(1) y .diff(12) guardados en referencia_statsmodels de pasajeros.json (tolerancia 1e-12). Rangos esperados: ∇log ±0.223; ∇₁₂log de −0.042 a 0.319; ∇∇₁₂log ±0.141.
- **pas_pico_anual** (ts-vivo): El mes del máximo de cada año es julio o agosto en los 12 años (1949–1951 empatan jul = ago). — *Cálculo:* argmax por fila de la matriz; la lectura se genera con el resultado. — *Verificación:* numpy argmax: Jul, Jul, Jul, Ago, Ago, Jul, Jul, Jul, Ago, Ago, Ago, Jul.
- **pas_signos_mes** (ts-vivo): Meses en los que ∇log tiene el mismo signo todos los años disponibles: suben siempre mar, jun, jul y dic (12/12); bajan siempre sep, oct y nov (0/12). — *Cálculo:* Conteo de signos por columna de la matriz de ∇log; el texto se arma con la lista resultante. — *Verificación:* Calculado con numpy. Ene 10/11 (falta ene 1949), feb 4/12, abr 2/12, may 9/12, ago 5/12.
- **pas_crecimiento** (ts-vivo): Crecimiento geométrico mensual promedio = exp(media de ∇log) − 1 = (432/112)^{1/143} − 1 = 0.948 %. — *Cálculo:* mean(∇log) en TS y luego Math.expm1. — *Verificación:* numpy: 0.0094847 por las dos vías.
- **pas_medias_tramo** (ts-vivo): Media de los primeros 24 y de los últimos 24 valores disponibles de cada transformación: log 4.884 / 6.101; ∇log 0.0108 / 0.0103; ∇₁₂log 0.148 / 0.112; ∇∇₁₂log 0.0058 / 0.0026. — *Cálculo:* mean de slice en TS. — *Verificación:* numpy (valores de esta tabla).

### Fórmulas

- `\nabla x_t = x_t - x_{t-1}`
- `x_t = a + b\,t + e_t \;\Rightarrow\; \nabla x_t = b + (e_t - e_{t-1})`
- `\nabla_s x_t = x_t - x_{t-s}`
- `s_t = s_{t-s} \;\Rightarrow\; \nabla_s s_t = 0`
- `y_t = \log x_t`
- `\nabla \log x_t = \log \frac{x_t}{x_{t-1}}`
- `\nabla_{12} \log x_t = \log \frac{x_t}{x_{t-12}}`
- `\nabla\nabla_{12} \log x_t = \nabla_{12}\log x_t - \nabla_{12}\log x_{t-1}`

### Rigor

- AR, MA y ARMA suponen estacionariedad débil: media y varianza constantes, y una covarianza que solo depende de la distancia k (Box, Jenkins & Reinsel; Hyndman & Athanasopoulos, FPP3 cap. 9).
- ARIMA no exige que la serie original sea estacionaria: la diferencia d veces (la I de 'integrada'), modela la serie diferenciada y al pronosticar integra de regreso. Por eso el tercer enunciado dice que 'la transformación se deshace'.
- Si x_t = a + bt + e_t con e_t estacionaria, ∇x_t = b + e_t − e_{t−1} es estacionaria con media b. En el esquema la media de ∇x es exactamente (x₁₂ − x₁)/11 = 1.
- Si s_t es periódica de periodo s, ∇_s s_t = 0 exactamente. En el esquema trimestral las 8 diferencias valen 1.
- ∇ y ∇₁₂ conmutan, (1−B)(1−B¹²) = (1−B¹²)(1−B): el orden en que se aplican no cambia el resultado.
- ∇log x_t = log(x_t/x_{t−1}) es el cambio relativo. exp(media) − 1 = 0.948 % por mes es el crecimiento geométrico promedio, no un promedio aritmético de porcentajes.
- ∇∇₁₂ consume 13 observaciones: de 144 quedan 131.
- 'Todos los años' en los signos por mes se refiere a los años disponibles: enero tiene 11 diferencias porque no existe dic 1948.
- No hay que diferenciar 'por si acaso': diferenciar una serie que ya es estacionaria crea autocorrelación negativa artificial (∇ de ruido blanco tiene ρ₁ = −0.5).

### Riesgos

- Al pasar de log a ∇log la altura cambia de significado (nivel → cambio). Para que no confunda: el rótulo del eje vertical cambia con fundido cruzado, aparece el plano en 0 y las tres diferencias usan la misma escala ±0.35, así se ve cómo se aplana.
- Legibilidad en proyector: meses con una sola letra en mono de 15 px y años cada 2. Hay que probar la cámara por defecto (oblicua, meses de izquierda a derecha y años hacia el fondo) en el proyector real.
- Seis pasos se acercan a 90 s. Si hace falta recortar, el paso 2 (∇₄) puede decirse sobre el paso 1 sin animación propia.
- El concepto usa s = 4 y el caso s = 12: hay que decirlo explícitamente (la línea mono 'trimestral: s = 4 · mensual: s = 12').
- Que el esquema ∇₄ salga 'demasiado perfecto' (todo 1) es intencional. Se aclara de palabra que en datos reales queda ruido, y el paso 5 lo muestra.
- Coordinación con la sección F parte 1: si la 32 o la 34 ya usan una vista año × mes, se reutiliza el mismo MatrixSurface3D con la misma cámara para no volver a explicar los ejes.

## 37 · Prueba ADF: ¿la serie tiene raíz unitaria?

- **Objetivo:** Entender que ADF mide si la serie tiende a regresar a su media (γ < 0) contra la hipótesis de raíz unitaria (γ = 0), saber leer un p-valor, y ver que en los pasajeros solo logaritmo + ∇ + ∇₁₂ hacen que se rechace H0.
- **Estado:** nueva · **Duración:** 90 s

### Pasos

**Paso 0 (concepto).** Lede: 'Mismos choques, dos reglas distintas: una serie regresa a su media y la otra acumula cada choque para siempre.' Izquierda 1000 px: etiqueta 'Esquema · simulado con los mismos 150 choques' y dos SeriesChart apiladas (1000×200 cada una) con eje común t = 1…150. Arriba φ = 0.5 (gris), abajo φ = 1, la caminata aleatoria (rojo), ambas con línea discontinua en 0. Derecha 620 px: x_t = φx_{t−1} + ε_t; 'ε_t: choque aleatorio de media 0, independiente de los demás'; dos renglones: '|φ| < 1 → el choque se desvanece y la serie regresa a su media' y 'φ = 1 → raíz unitaria: cada choque se queda para siempre'. Recuadro de 620×170 'efecto de un choque de +1 después de k pasos': barras φ^k para k = 0…10 (gris φ = 0.5: 1, 0.5, 0.25, …; rojo φ = 1: todas 1). Nota al pie en mono: 'raíz unitaria: 1 − φz = 0 tiene raíz z = 1'.

- Animación: Las dos series se trazan de izquierda a derecha al mismo tiempo (pathLength 0 → 1, 2 s), así se ve que reciben los mismos choques. Las barras φ^k crecen en cascada.
- Interacción: ninguna
- Frase clave: Con φ = 1 nada jala la serie de regreso: vaga sin rumbo.

**Paso 1 (concepto).** Izquierda: las series se sustituyen por dos dispersiones de 480×380 lado a lado, con x_{t−1} en el eje horizontal, Δx_t en el vertical y la recta de mínimos cuadrados. Bajo cada una, en mono: AR 'γ̂ = −0.43 · τ = −6.34 · si está arriba, baja'; caminata 'γ̂ = −0.01 · τ = −0.87 · el nivel no dice a dónde va'. Derecha: Δx_t = α + γx_{t−1} + ε_t con γ = φ − 1; H0: γ = 0 (raíz unitaria, no estacionaria); H1: γ < 0 (estacionaria); τ = γ̂ / EE(γ̂).

- Animación: Los 149 puntos aparecen en orden temporal (1.5 s) y después la recta se traza desde el centro (0.5 s).
- Interacción: ninguna
- Frase clave: ADF pregunta: si la serie está arriba, ¿tiende a bajar? Eso es γ < 0.

**Paso 2 (concepto).** Izquierda 1000×400: histograma de τ cuando H0 es cierta (20 000 caminatas aleatorias simuladas) con rótulo 'si hubiera raíz unitaria'. Encima, la curva N(0,1) discontinua gris con rótulo 'normal, para comparar'. Línea vertical en el crítico del 5 % (−2.88). Marcadores de los dos τ del esquema: −0.87, con su cola sombreada en rojo y 'p = 0.80'; −6.34, fuera del eje, con flecha y 'p < 0.001'. Derecha: Recap 'p-valor' (texto en riesgos/rigor) y una línea: 'τ no sigue una normal: su 5 % está en −2.88, no en −1.64'.

- Animación: El histograma crece de abajo hacia arriba (0.6 s). Después la cola se sombrea barra por barra de izquierda a derecha hasta el marcador (0.8 s).
- Interacción: ninguna
- Frase clave: El p-valor es el área de la cola: qué tan raro sería un τ así si de verdad hubiera raíz unitaria.

**Paso 3 (caso).** Caso · Pasajeros aéreos. Lede: 'ADF (statsmodels, con constante, rezagos elegidos por AIC) aplicada a cada transformación. H0: hay raíz unitaria.' Izquierda: el mismo histograma. Derecha 640: fórmula de ADF con la suma de rezagos y la nota 'la A de aumentada: agrega Δx pasados para absorber la autocorrelación; aquí hasta 14 rezagos'. Tabla con columnas [serie · mini serie · τ · p · rezagos · ¿se rechaza H0 a 5 %?] y dos filas visibles: 'pasajeros' 0.82 · 0.99 · 13 · no; 'log' −1.72 · 0.42 · 13 · no.

- Animación: Cada marcador cae sobre el eje del histograma (0.4 s) y se sombrea su cola. La fila nueva queda resaltada.
- Interacción: Clic en una fila para sombrear su cola en el histograma.
- Frase clave: Con tendencia, ADF ni se acerca: p = 0.99 y 0.42.

**Paso 4 (caso).** Se agregan las filas '∇ log' (−2.72 · 0.071 · 14 · no) y '∇₁₂ log' (−2.71 · 0.072 · 12 · no). Sus marcadores quedan justo a la derecha de la línea del 5 %.

- Animación: Caen los dos marcadores. La cola de ∇log se sombrea y llega casi hasta la línea crítica.
- Interacción: clic en filas
- Frase clave: Una sola diferencia no alcanza a 5 % (sí a 10 %).

**Paso 5 (cierre).** Fila '∇∇₁₂ log' (−4.44 · 0.00025 · 12 · sí) con 'sí' en rojo. Su marcador queda muy a la izquierda y el área es casi nula. Takeaway: 'Para los pasajeros: logaritmo, d = 1 y D = 1. Esos órdenes de diferenciación entran al SARIMA (diapositiva 47).' Nota pequeña: 'No rechazar no prueba que haya raíz unitaria: ADF tiene poca potencia cerca de φ = 1. Se complementa con la gráfica, la ACF y KPSS (respaldo R3).'

- Animación: Marcador y takeaway con Reveal.
- Interacción: clic en filas
- Frase clave: Con las dos diferencias, p = 0.00025: se rechaza la raíz unitaria.

### Visuales

- **Dos series con los mismos choques** (svg, SeriesChart (nuevo)): AR(1) φ = 0.5 y caminata aleatoria, apiladas, con trazo animado.
- **Efecto de un choque** (svg, ImpulsoChoque (local de la diapositiva)): Barras φ^k para k = 0…10, en dos colores.
- **Regresión de Dickey-Fuller** (svg, ScatterFit (nuevo)): Dispersión x_{t−1} vs Δx_t con la recta de mínimos cuadrados y γ̂, τ.
- **Distribución de τ bajo H0** (svg, NullDistribution (nuevo)): Histograma de Monte Carlo normalizado a densidad, curva N(0,1), línea del crítico al 5 %, marcadores y cola sombreada del marcador activo.
- **Tabla ADF de los pasajeros** (tabla, TablaADF (local) + SeriesChart en tamaño mini): Filas que se revelan por paso, cada una con una mini serie de 120×32 y la conclusión.
- **Recordatorio p-valor** (texto, Recap (existente)): 'Supón que H0 es cierta. El p-valor es la probabilidad de obtener un estadístico al menos tan extremo como el que salió. Si p < 0.05, lo observado sería muy raro bajo H0 y se rechaza H0. Si no, no se rechaza, lo cual no prueba que H0 sea cierta.'

### Datos

- **esq37_series** (python-json): 150 choques N(0,1) con numpy default_rng(42). AR: x₀ = ε₀, x_t = 0.5x_{t−1} + ε_t. Caminata: x_t = Σ ε (cumsum). Rango de la caminata: −10.45 a 5.48. — *Cálculo:* scripts/exportar_series.py → adf_pasajeros.json.esquema {choques, ar1, caminata}. — *Verificación:* El script hace un assert para que la narrativa se cumpla con esa semilla: p(caminata) > 0.10 y p(AR) < 0.01. Si falla, no se cambia la semilla en silencio: se documenta.
- **esq37_df** (python-json): Dickey-Fuller sin rezagos con constante (adfuller(maxlag=0, autolag=None, regression='c')). AR: γ̂ = −0.4301, τ = −6.340, p = 2.8e-8. Caminata: γ̂ = −0.0144, τ = −0.868, p = 0.798. — *Cálculo:* statsmodels en el script. En TS, ols() de series.ts recalcula la recta de la dispersión. — *Verificación:* La pendiente TS debe ser igual al gamma del JSON (|dif| < 1e-9). Además lo comprobé con una réplica en numpy.
- **impulso** (ts-vivo): Efecto de un choque de +1 tras k pasos: φ^k para φ = 0.5 y φ = 1, con k = 0…10. — *Cálculo:* Math.pow en TS. — *Verificación:* Exacto: 0.5³ = 0.125.
- **nulo_df** (python-json): Distribución de τ bajo H0: R = 20 000 caminatas aleatorias de 131 valores (130 regresiones con constante), numpy default_rng(42). Histograma con bordes de −7 a 3 cada 0.1. Se guardan el percentil 5 % y la mediana. — *Cálculo:* Monte Carlo vectorizado en numpy (0.12 s) → adf_pasajeros.json.nulo. — *Verificación:* Percentil 5 % = −2.889 contra el crítico de MacKinnon −2.884; mediana −1.58. La fracción ≤ τ coincide con el p de MacKinnon a ±0.01: 0.428 vs 0.422 (log), 0.074 vs 0.071 (∇log), 0.075 vs 0.072 (∇₁₂log), 0.0003 vs 0.00025 (∇∇₁₂log). El script hace un assert de esa tolerancia.
- **normal_pdf** (ts-vivo): Densidad N(0,1) para comparar. — *Cálculo:* exp(−z²/2)/√(2π) en TS. — *Verificación:* Fórmula exacta.
- **adf_pasajeros** (python-json): adfuller por defecto (regression='c', autolag='AIC', maxlag = ⌈12(n/100)^{1/4}⌉ = 14) sobre: pasajeros τ = 0.8154, p = 0.99188, 13 rezagos, nobs 130; log −1.7170, 0.42237, 13, 130; ∇log −2.7171, 0.07112, 14, 128; ∇₁₂log −2.7096, 0.07240, 12, 119; ∇∇₁₂log −4.4433, 0.000249, 12, 118. Críticos al 5 % entre −2.884 y −2.886, al 1 % entre −3.482 y −3.487. — *Cálculo:* scripts/exportar_series.py → adf_pasajeros.json.filas. — *Verificación:* Mi réplica en numpy (lagmat, autolag por AIC sobre la muestra fija, regresión final, p-valor de MacKinnon) da exactamente estos números, y coinciden con la salida clásica publicada de statsmodels (0.815369 / 0.991880). Con statsmodels instalado, el script compara ambas con tolerancia 1e-6.

### Fórmulas

- `x_t = \phi\,x_{t-1} + \varepsilon_t`
- `\Delta x_t = \alpha + \gamma\,x_{t-1} + \varepsilon_t,\qquad \gamma = \phi - 1`
- `H_0:\ \gamma = 0\ \text{(raíz unitaria)}\qquad H_1:\ \gamma < 0\ \text{(estacionaria)}`
- `\tau = \dfrac{\hat\gamma}{\operatorname{EE}(\hat\gamma)}`
- `\Delta x_t = \alpha + \gamma\,x_{t-1} + \sum_{i=1}^{p} \phi_i\,\Delta x_{t-i} + \varepsilon_t`
- `p\text{-valor} = P\big(\tau \le \tau_{\text{obs}} \mid H_0\big)`
- `1 - \phi z = 0 \;\Rightarrow\; z = 1/\phi`

### Rigor

- Regresión de ADF con constante: Δx_t = α + γx_{t−1} + Σφ_iΔx_{t−i} + ε_t; τ = γ̂/EE(γ̂). H0: γ = 0 (raíz unitaria, no estacionaria); H1: γ < 0 (estacionaria) (Dickey & Fuller 1979; Said & Dickey 1984).
- Bajo H0, τ no sigue una t de Student ni una normal, sino la distribución de Dickey-Fuller. Por eso el crítico al 5 % es −2.88 y no −1.64. La Monte Carlo lo muestra: percentil 5 % = −2.89 y mediana −1.58.
- Los rezagos aumentados no cambian la distribución asintótica de τ (Said & Dickey), así que un solo histograma vale para todas las filas, aunque nobs vaya de 118 a 130.
- statsmodels.adfuller por defecto usa regression='c', autolag='AIC' y maxlag = ⌈12(144/100)^{1/4}⌉ = 14. Los p-valores son las aproximaciones de MacKinnon (1994) y los críticos los de MacKinnon (2010).
- p = 0.071 y 0.072: no se rechaza a 5 %, sí a 10 %. La frase correcta es 'no hay evidencia suficiente de estacionariedad', no 'es no estacionaria'.
- No rechazar H0 no prueba la raíz unitaria: ADF tiene poca potencia cerca de φ = 1. KPSS (H0 = estacionaria, respaldo R3) es el complemento.
- En el esquema, con los mismos choques, γ̂ = −0.43 (el verdadero es −0.5) y γ̂ = −0.014 (el verdadero es 0). Se presentan como estimaciones, no como valores exactos.
- Se llama 'raíz unitaria' porque el polinomio 1 − φz tiene su raíz en z = 1 cuando φ = 1.

### Riesgos

- statsmodels no está instalado y hay que agregarlo a un .venv con Python 3.14, pandas 3.0 y numpy 2.5, que quizá todavía no tenga una versión compatible. Respaldo: la réplica en numpy (lagmat + AIC + MacKinnon) que ya reproduce exactamente sus números. El script puede pasar arreglos de numpy para no depender de pandas.
- Confundir 'p grande' con 'demostrado no estacionaria'. Por eso la nota del paso 5 y la última frase del Recap.
- Pregunta probable: '¿por qué no regression="ct"?'. Todas las filas usan la misma especificación (la de por defecto) para poder compararlas. Conviene tener preparado el resultado con 'ct' como respuesta, sin mostrarlo.
- Pregunta probable: 'sin logaritmo, ∇₁₂x da p = 0.012 y sí se rechaza'. El resultado de ADF depende de la transformación y del número de rezagos. No se muestra para no confundir, pero conviene tener la respuesta lista.
- τ = −6.34 del esquema cae fuera del dominio del histograma (−7 a 3 queda muy comprimido). Se dibuja con una flecha en el borde.
- Seis pasos en 90 s. Si falta tiempo, los pasos 3 y 4 se fusionan (las cuatro filas a la vez).

## 38 · Promedio móvil como suavizado

- **Objetivo:** Saber que el promedio móvil reemplaza cada punto por el promedio de sus vecinos para ver la tendencia, que con una ventana de un año completo (2×12) se cancela la estacionalidad, que el centrado usa el futuro, y que no es lo mismo que un modelo MA(q).
- **Estado:** nueva · **Duración:** 75 s

### Pasos

**Paso 0 (concepto).** Lede: 'Cada punto se reemplaza por el promedio de sus vecinos: lo que sube y baja rápido se cancela, lo lento se queda.' Izquierda 620: m_t = (1/k)Σ_{j=−h}^{h} x_{t+j} con k = 2h + 1, y la línea 'centrado: h vecinos antes y h después'. Derecha 1000×420 con la etiqueta 'Esquema · no son datos': 9 valores de juguete, una tendencia de 4 a 12 más un patrón (+3, −2, −1) que se repite cada 3. Puntos grises con su valor encima.

- Animación: Un corchete de 3 puntos recorre la serie (450 ms por posición). Sobre el corchete aparece la cuenta, p. ej. '(7 + 3 + 5)/3 = 5', y el promedio cae como punto rojo en el centro. Al terminar, la línea roja queda recta: 5, 6, 7, …, 11.
- Interacción: ninguna
- Frase clave: Si la ventana cubre exactamente un ciclo, el patrón se cancela y queda la tendencia.

**Paso 1 (caso).** Caso · Pasajeros aéreos. Izquierda: SeriesChart de 1100×430 con los pasajeros en miles (gris), 1949–1960, y encima el promedio móvil en rojo. Debajo, chips k = 3 · 5 · 7 · 2×12 y una tira de pesos de 1100×60 (una barra por coeficiente: 1/k, o ½/12 en los extremos y 1/12 en el centro). Derecha 520: un texto que cambia con k. Para 2×12 se muestra su fórmula y 'Con meses, el ciclo dura 12, que es par: una ventana de 12 no tiene centro. Se promedian dos ventanas de 12 seguidas: 13 meses, con peso ½ en los extremos.' y la línea mono 'faltan 6 meses al inicio y 6 al final'.

- Animación: Al entrar, el promedio pasa por k = 3 → 5 → 7 → 2×12 (1.2 s cada uno) y la curva roja se transforma de una a otra (morph del path).
- Interacción: chips, y ↑ ↓ para cambiar k (patrón de la 5)
- Frase clave: Con una ventana de un año completo la estacionalidad se cancela y queda la tendencia.

**Paso 2 (caso).** La gráfica se acerca a 1958–1960. Se dibujan el centrado 2×12 (rojo) y el atrasado de 12 meses (gris claro discontinuo). Rótulos: 'centrado: termina en jun 1960, necesita 6 meses del futuro' y 'atrasado: llega a dic 1960, pero va 5.5 meses detrás'. A la derecha, la fórmula del atrasado a_t = (1/12)Σ_{j=0}^{11} x_{t−j}.

- Animación: El dominio del eje x se anima (0.8 s) y después entra la curva atrasada.
- Interacción: ninguna
- Frase clave: El centrado sirve para describir. Para pronosticar no, porque usa datos que todavía no existen.

**Paso 3 (cierre).** Reemplaza la gráfica: dos diagramas de 800×260 lado a lado. Izquierda, 'Promedio móvil · suavizado': cajas sólidas x_{t−1}, x_t, x_{t+1} → flechas con peso 1/3 → m_t, y tres etiquetas mono: 'promedia observaciones', 'se aplica, no se estima', 'no pronostica'. Derecha, 'MA(q) · modelo (diapositiva 43)': círculos discontinuos ε_{t−2}, ε_{t−1}, ε_t ('no se observan') → flechas θ₂, θ₁, 1 → x_t, la fórmula, y las etiquetas 'combina choques no observados', 'θ se estima de los datos', 'es un modelo: sirve para pronosticar'. Takeaway debajo.

- Animación: Los dos diagramas entran con Reveal escalonado (0.2 s). Un pulso recorre las flechas de cada uno.
- Interacción: ninguna
- Frase clave: Mismo nombre, otra cosa: el suavizado promedia lo que vemos; MA(q) combina choques que no vemos.

### Visuales

- **Ventana que se desliza** (svg, OperacionAnimada (nuevo, modo 'ventana')): Corchete animado con la cuenta escrita y el punto promedio que cae.
- **Pasajeros con su promedio móvil** (svg, SeriesChart (nuevo)): Serie original y curva suavizada con morph entre valores de k; zoom animado en el paso 2.
- **Tira de pesos** (svg, PesosVentana (local)): Una barra por coeficiente de la ventana activa.
- **Suavizado vs MA(q)** (diagrama, DiagramaMAvsMAq (local) + TeX): Dos diagramas de flechas: observaciones (sólidas) contra choques no observados (discontinuos).

### Datos

- **esq38** (esquema-didactico): x = [7, 3, 5, 10, 6, 8, 13, 9, 11] = tendencia [4…12] + patrón (+3, −2, −1). Promedio centrado con k = 3 → [5, 6, 7, 8, 9, 10, 11], exactamente la tendencia en t = 2…8. — *Cálculo:* movingAverage(x, 3, 'centrada') en TS. — *Verificación:* A mano: cada ventana de 3 suma el patrón (+3 − 2 − 1 = 0).
- **pas_mm_k** (ts-vivo): Promedio centrado con k = 3, 5, 7. Validos desde feb, mar y abr 1949 respectivamente (k=3: 120.667 en feb 1949). — *Cálculo:* movingAverage en series.ts. — *Verificación:* Contra pandas rolling(k, center=True).mean() guardado en referencia_statsmodels (tolerancia 1e-9).
- **pas_mm_2x12** (ts-vivo): Promedio centrado 2×12 con pesos [½, 1×11, ½]/12. Válido de jul 1949 (126.79) a jun 1960 (475.04): 132 valores. — *Cálculo:* weightedMA(x, pesos) en series.ts. — *Verificación:* Comprobé que es igual a rolling(12).mean().rolling(2).mean().shift(−6). El script lo compara además con statsmodels seasonal_decompose(x, period=12).trend.
- **pas_mm_atrasado** (ts-vivo): Promedio atrasado de 12 meses. Primer valor en dic 1949 (126.67). Su centro está 5.5 meses atrás. — *Cálculo:* movingAverage(x, 12, 'atrasada'). — *Verificación:* Contra pandas rolling(12).mean(). El desfase (12 − 1)/2 = 5.5 es exacto.

### Fórmulas

- `m_t = \frac{1}{k}\sum_{j=-h}^{h} x_{t+j},\qquad k = 2h+1`
- `m_t^{2\times 12} = \tfrac{1}{24}x_{t-6} + \tfrac{1}{12}\sum_{j=-5}^{5} x_{t+j} + \tfrac{1}{24}x_{t+6}`
- `a_t = \frac{1}{12}\sum_{j=0}^{11} x_{t-j}`
- `x_t = \mu + \varepsilon_t + \theta_1\varepsilon_{t-1} + \dots + \theta_q\varepsilon_{t-q}`

### Rigor

- Si s_t tiene periodo 12 y suma 0 en un año, el 2×12 de s_t es exactamente 0, porque s_{t−6} = s_{t+6} y los 13 pesos cubren 12 meses distintos. Con estacionalidad multiplicativa (pasajeros sin logaritmo) la cancelación es aproximada; el texto dice 'se cancela' refiriéndose a lo que se ve.
- El 2×12 es el filtro de tendencia de la descomposición clásica: statsmodels seasonal_decompose usa exactamente esos pesos para period = 12. Si la 34 usó seasonal_decompose, es la misma curva.
- El centrado 2×12 no existe en los primeros ni en los últimos 6 meses. El atrasado de 12 estima el nivel de t − 5.5.
- MA(q): ε_t es ruido blanco no observado. θ se estima, normalmente por máxima verosimilitud, y no tiene por qué sumar 1. Un MA(q) finito siempre es estacionario. A más de q pasos su pronóstico es la media μ.
- El nombre MA(q) viene de que x_t es un promedio ponderado de los choques ε, no de las observaciones.

### Riesgos

- Es la confusión clásica: el paso 3 es todo el punto de la diapositiva y no se debe recortar.
- El barrido automático de k dura ≈ 5 s. Si el expositor habla encima, se puede omitir y usar los chips.
- La curva atrasada gris discontinua puede perderse en el proyector: usar trazo de 2.5 px y color --data, no --data-dim.
- El paso 2 conecta con la 30 (fuga de información). Decirlo en una frase, sin abrir otro tema.

## 39 · Rezagos y autocorrelación (ACF)

- **Objetivo:** Entender que un rezago es la serie recorrida k lugares y que la ACF mide, para cada k, cuánto se parece la serie a su copia recorrida, y saber leer en el correlograma la tendencia, la estacionalidad y lo que queda tras diferenciar.
- **Estado:** nueva · **Duración:** 85 s

### Pasos

**Paso 0 (concepto).** Lede: '¿El valor de hoy se parece al de hace k pasos? Para medirlo se compara la serie con una copia de sí misma recorrida k lugares.' Izquierda 760: tabla de 8 filas t = 1…8 con columnas x_t | x_{t−1} | x_{t−2}, con el esquema 'una ola' 2, 3, 5, 7, 8, 7, 5, 3 y la etiqueta 'Esquema · no son datos'. Debajo, la definición 'rezago k: el valor de hace k pasos, x_{t−k}'. Derecha 860: Recap 'correlación' ('mide si dos listas suben y bajan juntas: +1 juntas, −1 al revés, 0 sin relación') y la línea 'autocorrelación: correlación de la serie con su propia copia recorrida'.

- Animación: La columna x_t se copia y se desliza una fila hacia abajo (0.6 s) para formar x_{t−1}; la celda que queda vacía muestra '—'. Luego lo mismo otra vez para x_{t−2}.
- Interacción: ninguna
- Frase clave: Un rezago es la misma serie recorrida k lugares: cada fila junta el valor de hoy con el de hace k.

**Paso 1 (concepto).** La tabla agrega la columna (x_t − x̄)(x_{t−k} − x̄) con x̄ = 5, y abajo, en mono, 'Σ productos = 18 · Σ cuadrados = 34 · r₁ = 0.53'. Derecha: la fórmula de r_k grande y un mini correlograma de 4 barras (k = 1…4) del esquema: 0.53, −0.12, −0.53, −0.50. Chips k = 1 · 2 · 3 · 4.

- Animación: Al cambiar k, la columna recorrida se desliza, los productos se recalculan con fundido y la barra k se ilumina.
- Interacción: chips k, y ↑ ↓
- Frase clave: Un producto positivo significa que los dos valores están del mismo lado de la media. r_k suma esos acuerdos y los divide entre la variación total.

**Paso 2 (caso).** Caso · Pasajeros aéreos. Izquierda 1060: arriba, SeriesChart de 1060×230 con los pasajeros (gris), su media x̄ = 280.3 (discontinua) y la copia recorrida k meses (roja), que se desliza. Abajo, un panel de 1060×200 con las barras de los productos (x_t − x̄)(x_{t−k} − x̄), rojas si son positivas y grises si son negativas. Derecha 560×450: correlograma k = 0…36 que se va llenando, con la barra k resaltada y su r_k escrito. Rótulo: 'r_k = Σ productos / Σ cuadrados'.

- Animación: Al entrar, k recorre 1 → 36 a 180 ms por paso (6.5 s): la copia se desliza, cambian las barras de productos y el correlograma se construye barra por barra. Se detiene en k = 12.
- Interacción: ↑ ↓ cambian k (0…36)
- Frase clave: Cada barra de la ACF es la suma de esos productos para un k.

**Paso 3 (caso).** Sobre el correlograma: la banda ±1.96/√144 = ±0.163 sombreada, con el rótulo 'si no hubiera ninguna correlación (ruido blanco, diapositiva 41), el 95 % de las barras caería aquí'. Anotación 1: 'decae muy lento: tendencia'. Anotación 2, marcando 12 y 24: 'picos cada 12: estacionalidad'. A la izquierda, bajo las gráficas: 'Con tendencia, los primeros años están todos bajo la media y los últimos todos arriba: casi todos los productos son positivos, para cualquier k.'

- Animación: Banda y anotaciones con Reveal; los picos 12 y 24 se encienden en rojo uno tras otro.
- Interacción: ↑ ↓
- Frase clave: Una ACF que baja lento indica tendencia; picos cada 12 indican estacionalidad.

**Paso 4 (cierre).** El correlograma cambia a ∇∇₁₂ log (n = 131, banda ±0.171). Barras dentro de la banda en gris, fuera en rojo con su número. Las dos más grandes son r₁ = −0.34 y r₁₂ = −0.39; también salen, apenas, 3, 9, 23 y 32. Nota pequeña: 'con 36 barras, unas 2 saldrían por azar aun sin ninguna correlación (5 %)'. Takeaway: 'Lo que queda en 1 y 12 es la estructura que un modelo puede aprender (diapositivas 46 y 47).' El panel de productos de la izquierda pasa a la serie ∇∇₁₂ log con k = 12.

- Animación: Las barras se transforman de una serie a la otra (0.6 s).
- Interacción: ↑ ↓
- Frase clave: Después de diferenciar casi todo cae dentro de la banda. Quedan dos huellas: los rezagos 1 y 12.

### Visuales

- **Tabla de rezagos** (tabla, LagTable (nuevo)): Tabla HTML con la columna copiada que se desliza k filas y la columna de productos.
- **Serie, copia recorrida y productos** (svg, AcfProductos (local) usando SeriesChart): Serie con su media, copia roja desplazada k meses y barras de productos debajo. Es el mecanismo exacto de la fórmula.
- **Correlograma** (svg, Correlogram (nuevo)): Barras de r_k para k = 0…36 con banda ±1.96/√n, la barra k resaltada, las barras fuera de la banda en rojo y anotaciones.
- **Recordatorio correlación** (texto, Recap (existente)): Qué mide la correlación, en dos líneas.

### Datos

- **esq39** (esquema-didactico): x = [2, 3, 5, 7, 8, 7, 5, 3], x̄ = 5, desviaciones [−3, −2, 0, 2, 3, 2, 0, −2], Σd² = 34. Σ productos para k = 1…4: 18, −4, −18, −17. r₁ = 0.529, r₂ = −0.118, r₃ = −0.529, r₄ = −0.500. — *Cálculo:* acf(x, 4) y acfProducts(x, k) de series.ts. — *Verificación:* A mano (fracciones exactas sobre 34) y contra statsmodels acf.
- **pas_acf** (ts-vivo): ACF de los pasajeros sin transformar, k = 0…36, con media global y denominador Σ(x − x̄)². r₁ = 0.948, r₁₁ = 0.743, r₁₂ = 0.760, r₁₃ = 0.713, r₂₃ = 0.517, r₂₄ = 0.532, r₂₅ = 0.494, r₃₆ = 0.337. Las 36 barras quedan fuera de la banda. — *Cálculo:* acf(x, 36) en TS. Las anotaciones de los picos salen de detectar máximos locales en múltiplos de 12. — *Verificación:* Contra statsmodels acf(x, nlags=36, adjusted=False) guardado en referencia_statsmodels (tolerancia 1e-12).
- **pas_productos** (ts-vivo): (x_t − x̄)(x_{t−k} − x̄) para t = k+1…n. Su suma entre Σ(x − x̄)² es r_k. — *Cálculo:* acfProducts en TS. — *Verificación:* La suma reproduce acf(x)[k] (assert de desarrollo).
- **banda** (constante-de-libro): ±1.96/√n: cuantil 97.5 % de la normal entre √n. n = 144 → 0.163; n = 131 → 0.171. — *Cálculo:* TS. — *Verificación:* Fórmula asintótica de r_k bajo ruido blanco (Box, Jenkins & Reinsel).
- **pas_acf_dd** (ts-vivo): ACF de ∇∇₁₂ log (n = 131): r₁ = −0.341, r₃ = −0.202, r₉ = 0.176, r₁₂ = −0.387, r₂₃ = 0.223, r₃₂ = 0.196. Fuera de ±0.171: {1, 3, 9, 12, 23, 32}. — *Cálculo:* acf(dd12log, 36) en TS. — *Verificación:* Contra statsmodels acf. Con la banda de Bartlett (la de plot_acf por defecto) solo salen 1, 3 y 12.
- **falsas_alarmas** (ts-vivo): Barras que se esperaría ver fuera de la banda por azar: 36 × 0.05 = 1.8. — *Cálculo:* TS. — *Verificación:* Aritmética; supone independencia aproximada entre rezagos.

### Fórmulas

- `x_{t-k}\ \text{(rezago } k)`
- `r_k = \dfrac{\sum_{t=k+1}^{n}(x_t-\bar x)(x_{t-k}-\bar x)}{\sum_{t=1}^{n}(x_t-\bar x)^2}`
- `r_0 = 1,\qquad |r_k| \le 1`
- `\pm\,1.96/\sqrt{n}`

### Rigor

- La ACF usa la media de toda la serie y divide entre la variación total con n términos, igual que statsmodels acf(adjusted=False). Así r₀ = 1 y |r_k| ≤ 1.
- r_k NO es la correlación de Pearson de los pares (x_t, x_{t−k}). En los pasajeros sin transformar, con k = 12, Pearson da 0.991 y la ACF 0.760. Por eso no se dibuja la nube de pares con el rótulo r_k: confundiría. El mecanismo que se muestra es la fórmula misma, la suma de productos.
- La banda ±1.96/√n es la de ruido blanco, rezago por rezago. plot_acf de statsmodels dibuja por defecto la de Bartlett, que se ensancha. Hay que coordinarlo con la 46, donde la de Bartlett es la apropiada para identificar MA(q).
- Picos en múltiplos de 12: r₁₂ = 0.760 es mayor que r₁₁ = 0.743 y que r₁₃ = 0.713; r₂₄ = 0.532 es mayor que r₂₃ = 0.517 y que r₂₅ = 0.494. r₃₆ = 0.337 es mayor que r₃₅ = 0.326, pero r₃₇ no se calcula, así que el texto solo afirma los picos en 12 y 24.
- En ∇∇₁₂ log, los dos valores de mayor magnitud son r₁ y r₁₂, muy por encima del resto. 3, 9, 23 y 32 salen apenas.
- 'Ruido blanco' se usa antes de definirse en la 41: el rótulo de la banda lo define en una frase y remite a la 41.

### Riesgos

- La tentación de dibujar el diagrama de dispersión de rezagos: con tendencia contradice la barra (0.99 vs 0.76). Está descartado a propósito.
- El barrido de 6.5 s debe poder interrumpirse con ↑ ↓ y no reiniciarse al volver al paso.
- Cinco paneles en el caso (serie, productos, correlograma, banda, anotaciones): las anotaciones solo entran en el paso 3 para no saturar.
- Coordinar con la 41 y la 46 qué banda se usa, para que el público no vea dos bandas distintas sin explicación.

## 40 · Autocorrelación parcial (PACF)

- **Objetivo:** Entender que la PACF mide la relación directa entre x_t y x_{t−k} después de quitar lo que explican los valores intermedios, verlo en 3D como la diferencia entre la sombra (ACF) y el plano (PACF), y leer la ACF y la PACF de los pasajeros diferenciados.
- **Estado:** nueva · **Duración:** 85 s

### Pasos

**Paso 0 (concepto).** Lede: 'La ACF cuenta todo el parecido con el valor de hace k pasos, incluso el que llega a través de los valores de en medio. La PACF solo cuenta el directo.' Izquierda 760: diagrama de cadena de 760×220: cajas x_{t−2} → x_{t−1} → x_t con flechas 'φ'; una flecha larga discontinua de x_{t−2} a x_t con '¿efecto directo?'; el camino indirecto resaltado, 'φ · φ = φ²'. Abajo: φ_kk en palabras y sus dos fórmulas (correlación de residuos y último coeficiente de la regresión). Derecha 860: Recap 'regresión' ('una recta, o un plano, que predice y a partir de x; el residuo es lo que la recta no explica').

- Animación: Un pulso rojo recorre x_{t−2} → x_{t−1} → x_t (1.2 s) y luego aparece la flecha directa con '?'.
- Interacción: ninguna
- Frase clave: La ACF cuenta el parecido que llega a través de los intermedios; la PACF solo el directo.

**Paso 1 (concepto).** Izquierda 1100×560: nube 3D (x_{t−2} en X, x_{t−1} en profundidad, x_t hacia arriba) con 300 puntos de un AR(1) simulado con φ = 0.8. Etiqueta 'Esquema · simulado: se ajusta con 1 000 valores, se dibujan 300'. Cámara de frente al plano (x_{t−2}, x_t). En la pared del fondo, la sombra de la nube (proyección gris) con su recta. Derecha 520: 'Si se ignora x_{t−1}: pendiente de la sombra = 0.63 ≈ ρ(2) = φ² = 0.64 (teórico)', y el botón 'otra muestra'.

- Animación: Los puntos aparecen en 0.8 s y la recta de la sombra se traza en 0.6 s.
- Interacción: Arrastrar para girar. El botón 'otra muestra' vuelve a simular con la siguiente semilla y recalcula todo.
- Frase clave: Si solo se miran x_{t−2} y x_t, parecen muy relacionados.

**Paso 2 (concepto).** La cámara gira 90° hasta mirar a lo largo del eje x_{t−2}. Aparece el plano de regresión x̂_t = c + b₁x_{t−1} + b₂x_{t−2} en rojo translúcido. Visto así queda de canto, y la nube se alinea con x_{t−1}. Derecha: 'Con x_{t−1} en el modelo: b₁ = 0.79 · b₂ = 0.01. b₂ es la PACF(2): ≈ 0 (teórico: 0)'.

- Animación: Interpolación de la cámara entre dos posiciones fijas (1.2 s) y fundido del plano.
- Interacción: arrastrar, 'otra muestra' (b₂ oscila cerca de 0 y la sombra cerca de 0.64)
- Frase clave: Una vez que se conoce x_{t−1}, x_{t−2} ya no agrega nada: PACF(2) ≈ 0.

**Paso 3 (concepto).** La escena 3D se reduce a la izquierda (760×420) y a la derecha entran dos correlogramas de 420×300, 'AR(1), φ = 0.8 · valores teóricos': ACF 0.80, 0.64, 0.51, 0.41, … (decae) y PACF 0.80, 0, 0, … (se corta). Texto: 'En un AR(1) la PACF se corta después de 1; en un AR(p), después de p. Lo usaremos en la 46.'

- Animación: Las barras crecen en cascada; las de la PACF a partir de k = 2 se quedan en 0.
- Interacción: ninguna
- Frase clave: La ACF decae y la PACF se corta: así se ve un AR(1).

**Paso 4 (caso).** Caso · Pasajeros aéreos. Dos correlogramas de 820×430 lado a lado para ∇∇₁₂ log (n = 131, banda ±0.171): ACF y PACF, con las barras fuera de la banda en rojo (ACF: 1, 3, 9, 12, 23, 32; PACF: 1, 3, 9, 12) y los rezagos 1 y 12 etiquetados (r₁ = −0.34, r₁₂ = −0.39; φ₁₁ = −0.34, φ₁₂,₁₂ = −0.34). Línea mono: 'φ₁₁ = r₁ siempre'. Chip opcional 'log sin diferenciar': muestra PACF(1) = 0.95 ≈ 1, la huella de la raíz unitaria de la 37. Takeaway: 'La ACF y la PACF juntas son la huella para elegir p y q (diapositiva 46).'

- Animación: Las barras crecen; las de 1 y 12 se encienden al final.
- Interacción: chip 'log sin diferenciar' / '∇∇₁₂ log'
- Frase clave: En los pasajeros diferenciados destacan 1 y 12 en las dos gráficas: corto plazo y estación.

### Visuales

- **Cadena AR(1)** (diagrama, CadenaAR (local)): Tres cajas con flechas, el camino indirecto resaltado y la flecha directa en duda.
- **Nube de rezagos 3D con sombra y plano** (3d, LagCloud3D (nuevo) + Scene3D/Label3D (existentes)): InstancedMesh de 300 esferas, sombra proyectada en la pared x_{t−1} = mín. con su recta, plano de regresión translúcido y dos posiciones de cámara con interpolación. Dentro de Scene3D, con rótulos en Label3D.
- **Correlogramas teóricos y del caso** (svg, Correlogram (nuevo)): ACF y PACF con banda, barras fuera de la banda en rojo y etiquetas.
- **Recordatorio regresión** (texto, Recap (existente)): Recta o plano que predice; residuo = lo que no explica.

### Datos

- **teo_ar1** (ts-vivo): AR(1) con φ = 0.8: ρ_k = 0.8^k (0.80, 0.64, 0.512, …) y φ_kk por Durbin-Levinson sobre esos ρ: [0.8, 0, 0, …]. — *Cálculo:* Math.pow y pacfFromAcf de series.ts. — *Verificación:* Exacto: φ₂₂ = (ρ₂ − ρ₁²)/(1 − ρ₁²) = 0. Se muestra con 2 decimales, así el error de punto flotante (~1e-17) no se ve.
- **sim_ar1** (ts-vivo): AR(1) φ = 0.8 simulado con mulberry32(semilla) + gaussian (Box-Muller): 100 valores de calentamiento y 1 000 útiles; se dibujan 300 (los primeros). Se ajustan por mínimos cuadrados el plano x_t ~ 1 + x_{t−1} + x_{t−2} y la recta de la sombra x_t ~ 1 + x_{t−2}. — *Cálculo:* simulateAR1 y ols (ecuaciones normales 3×3) de series.ts. 'otra muestra' suma 1 a la semilla. — *Verificación:* Un script de node vuelca la serie para varias semillas y numpy lstsq debe dar los mismos coeficientes (|dif| < 1e-10). Referencia con numpy y n = 1 000: b₂ va de −0.09 a +0.02 según la semilla y la sombra de 0.63 a 0.67. La semilla inicial se fija y se documenta, y el botón deja ver la variación.
- **pas_pacf_dd** (ts-vivo): PACF de ∇∇₁₂ log por Durbin-Levinson sobre la ACF muestral (método 'ywm'): φ₁₁ = −0.341, φ₃₃ = −0.193, φ₉₉ = 0.226, φ₁₂,₁₂ = −0.339. Fuera de ±0.171: {1, 3, 9, 12}. — *Cálculo:* pacfFromAcf(acf(dd12log, 36)) en TS. — *Verificación:* Contra statsmodels pacf(x, nlags=36, method='ywm') guardado en referencia_statsmodels (tolerancia 1e-10).
- **pas_pacf_log** (ts-vivo): PACF de log pasajeros: φ₁₁ = 0.954 (= r₁); fuera de la banda: 1, 9, 13, 25. — *Cálculo:* Igual que el anterior, sobre log x. — *Verificación:* statsmodels pacf method='ywm'.

### Fórmulas

- `\phi_{kk} = \operatorname{Corr}\!\big(x_t - \hat x_t,\; x_{t-k} - \hat x_{t-k}\big),\quad \hat{\ }\ \text{= predicción lineal con } x_{t-1},\dots,x_{t-k+1}`
- `x_t = c + \phi_{k1}x_{t-1} + \dots + \phi_{kk}x_{t-k} + e_t`
- `\rho_k = \phi^k,\qquad \phi_{11} = \phi,\qquad \phi_{kk} = 0\ \ (k \ge 2)`
- `\hat x_t = c + b_1 x_{t-1} + b_2 x_{t-2}`
- `\phi_{11} = r_1`
- `\phi_{kk} = \dfrac{r_k - \sum_{j=1}^{k-1}\phi_{k-1,j}\,r_{k-j}}{1 - \sum_{j=1}^{k-1}\phi_{k-1,j}\,r_j}\quad\text{(Durbin-Levinson; va en el código, no se proyecta)}`

### Rigor

- La autocorrelación parcial de orden k es la correlación entre x_t y x_{t−k} una vez descontada la predicción lineal a partir de x_{t−1}, …, x_{t−k+1}. Es igual al último coeficiente φ_kk del mejor predictor lineal AR(k) (Box, Jenkins & Reinsel).
- φ₁₁ = r₁ siempre, por definición.
- AR(1): ρ_k = φ^k y φ_kk = 0 para k ≥ 2, exactamente. En un AR(p) la PACF teórica es 0 después de p, y bajo esa hipótesis la muestral cae dentro de ±1.96/√n (Quenouille).
- El coeficiente b₂ del plano 3D es la PACF(2) muestral por regresión (método 'ols'). En el caso se usa Durbin-Levinson sobre la ACF muestral ('ywm', el que dibuja plot_pacf por defecto desde statsmodels 0.14). Los dos métodos dan números parecidos pero no idénticos: con numpy, semilla 42 y n = 300, −0.117 contra −0.106. Por eso cada número dice de dónde sale.
- La pendiente de la sombra se aproxima a ρ(2), pero no es idéntica a la ACF(2) muestral (cambian las medias y los denominadores). Por eso se escribe '≈' y se compara con el valor teórico φ² = 0.64.
- La vista de canto es exacta: si b₂ = 0, el plano visto a lo largo del eje x_{t−2} es una línea de pendiente b₁.
- En los pasajeros diferenciados, las dos gráficas tienen sus valores más grandes en 1 y 12. No se afirma qué modelo implican: eso es la 46.

### Riesgos

- Girar la cámara 3D puede desorientar. Por eso se usan dos posiciones fijas con interpolación, rótulos de ejes siempre visibles y la nota 'arrastra para girar'.
- Variación por muestra: con numpy, semilla 42 y n = 1 000, b₂ = −0.089 sale por azar de la banda. El botón 'otra muestra' convierte esa variación en parte de la explicación, en vez de elegir semillas a escondidas. La semilla inicial se documenta en el código.
- Que el público espere 'cortes' perfectos en datos reales. La PACF del caso tiene 1, 3, 9 y 12 fuera: se dice 'destacan', no 'se corta'.
- No adelantar la 46: aquí solo se muestra el patrón del AR(1) teórico.
- 300 esferas: usar InstancedMesh para que la escena vaya fluida a 60 fps.

## Componentes nuevos propuestos

- **SeriesChart** — Gráfica SVG de series de tiempo con eje en años (índice de mes desde ene 1949) o en índice t. Hace morph animado del path, trazo progresivo, línea en 0, línea de media, medias de tramo y dominio x animable (zoom). Es la gráfica base de toda la parte de series. · API: { width, height, series: { id, values: (number|null)[], offset?: number, color: string, width?: number, dash?: string, dots?: boolean }[], xDomain?: [number, number], yDomain?: [number, number], timeAxis?: 'meses1949' | 'indice', zero?: boolean, mean?: { value: number, label?: string }, windows?: { from: number, to: number, value: number, label: string }[], yLabel?: string, draw?: boolean, mini?: boolean } · usado en: 36, 37, 38, 39
- **OperacionAnimada** — Esquema de una serie corta hecha a mano (puntos con su valor) donde la operación ocurre paso a paso: diferencia (salto o arco que cae como barra a un panel inferior) o ventana (corchete con la cuenta escrita y el promedio que cae). Calcula el resultado con series.ts. · API: { x: number[], op: { tipo: 'diferencia'; lag: number } | { tipo: 'ventana'; k: number }, play: boolean, msPorPaso?: number, etiquetasX?: string[], width: number, height: number, ventanasMedia?: { from: number, to: number }[] } · usado en: 36, 38
- **MatrixSurface3D** — Superficie 3D de una matriz año × mes con vértices exactos, líneas por fila (perfil estacional) y por columna (tendencia), plano en 0 opcional, celdas faltantes y morph entre matrices con useFrame. · API: { Z: (number|null)[][] /* filas = años, columnas = meses */, range: [number, number], rowLabels: string[], colLabels: string[], heightLabel: string, zeroPlane?: boolean, morphMs?: number } (se usa dentro de Scene3D) · usado en: 36
- **ScatterFit** — Dispersión SVG con la recta de mínimos cuadrados (ols de series.ts), aparición de puntos en orden temporal y pie con pendiente y τ. · API: { x: number[], y: number[], width, height, xLabel: string, yLabel: string, color: string, fit?: boolean, drawMs?: number, footer?: ReactNode } · usado en: 37
- **NullDistribution** — Histograma de la distribución de un estadístico bajo H0 (Monte Carlo precalculado), con curva normal de comparación, línea crítica, marcadores que caen sobre el eje y cola sombreada del marcador activo (el p-valor como área). · API: { bordes: number[], conteos: number[], domain: [number, number], critico?: { value: number, label: string }, normal?: boolean, markers: { id: string, tau: number, label: string, p: number, active?: boolean }[], width, height, onSelect?: (id: string) => void } · usado en: 37
- **Correlogram** — Barras ACF/PACF por rezago con banda ±1.96/√n, llenado progresivo (upTo), barra resaltada, barras fuera de la banda en rojo con su valor y anotaciones. Sirve también para la 41, la 46 y la 48. · API: { values: number[] /* índice = rezago */, from?: 0 | 1, band?: number, upTo?: number, highlight?: number, labelOutside?: boolean | number[], annotations?: { lags: number[], text: string }[], width, height, title?: string } · usado en: 39, 40
- **LagTable** — Tabla HTML del esquema con la columna x_t copiada y deslizada k filas (motion layout), celdas vacías '—' y columna opcional de productos (x_t − x̄)(x_{t−k} − x̄) con sus sumas. · API: { x: number[], k: number, columnas?: number /* cuántos rezagos mostrar */, productos?: boolean } · usado en: 39
- **LagCloud3D** — Nube 3D (x_{t−2}, x_{t−1}, x_t) con InstancedMesh, sombra proyectada en la pared del fondo con su recta, plano de regresión translúcido y posiciones de cámara con interpolación ('sombra', 'canto', 'libre'). · API: { a: number[], show: number, plano?: { c: number, b1: number, b2: number }, sombra?: { c: number, b: number }, vista: 'sombra' | 'canto' | 'libre' } (dentro de Scene3D) · usado en: 40
- **src/lib/series.ts (librería)** — Cálculos exactos de series en el navegador. Todos se verifican contra statsmodels o pandas. · API: diff(x, lag=1); log(x); acf(x, nlags) /* media global, denominador n */; acfProducts(x, k); pacfFromAcf(r) /* Durbin-Levinson = 'ywm' */; movingAverage(x, k, 'centrada' | 'atrasada'); weightedMA(x, w) /* 2×12 */; ols(X, y) → { beta, se, t }; band95(n); toYearMonth(values, offset, period=12); simulateAR1(phi, n, seed, burn=100) /* mulberry32 + gaussian */; normalPdf(z); mesTexto(i) → 'jul 1960' · usado en: 36, 37, 38, 39, 40
- **src/lib/pasajeros.ts (librería)** — Lee pasajeros.json y adf_pasajeros.json (como src/lib/adult.ts) y construye las transformaciones con su TeX y su desplazamiento de inicio. · API: pasajeros.valores; TRANSFORMACIONES: Record<'original' | 'log' | 'dlog' | 'd12log' | 'dd12log', { valores: number[], offset: number, tex: string, etiqueta: string }>; adf.filas; adf.esquema; adf.nulo · usado en: 36, 37, 38, 39, 40

## Datos nuevos propuestos

- **src/data/pasajeros.json** — { fuente: 'Box, Jenkins & Reinsel, Serie G · R datasets::AirPassengers', unidades: 'miles de pasajeros', inicio: '1949-01', valores: [144 enteros], verificacion: { n: 144, suma: 40363, min: 104, max: 622 }, referencia_statsmodels: { acf_original_36, acf_dd12log_36, pacf_ywm_dd12log_36, pacf_ywm_log_36, tendencia_2x12 (seasonal_decompose period=12, 132 valores), mm_centrada: { 3, 5, 7 }, mm_atrasada_12, diff1_log, diff12_log } }. La referencia solo la usa el test que compara series.ts, igual que referencia_sklearn en adult3d.json. Es compartido con la sección F parte 1 y con la G: si ya existe, solo se agregan las claves que falten. · script: scripts/exportar_series.py: carga con statsmodels.datasets.get_rdataset('AirPassengers', 'datasets', cache=scripts/cache) (internet solo la primera vez, como el caché de OpenML de Adult) y hace un assert de n, suma, mín. y máx. antes de guardar. Verificación TS: scripts/verificar_series.ts (node --experimental-strip-types) corre series.ts sobre el JSON y compara con referencia_statsmodels. · dependencias: statsmodels (nuevo en .venv; probar compatibilidad con Python 3.14 / pandas 3.0 / numpy 2.5), numpy, pandas
- **src/data/adf_pasajeros.json** — { config: { regression: 'c', autolag: 'AIC', maxlag: 14 }, filas: [{ id: 'original' | 'log' | 'dlog' | 'd12log' | 'dd12log', estadistico, p, rezagos, nobs, criticos: { '1%', '5%', '10%' }, fraccion_simulada }], esquema: { semilla: 42, n: 150, phi: 0.5, choques: [150], ar1: [150], caminata: [150], df: { ar1: { estadistico, p, gamma, criticos }, caminata: { … } } }, nulo: { R: 20000, n: 131, semilla: 42, bordes: [101 valores de −7 a 3], conteos: [100], percentil5, mediana } }. Valores esperados: ver la diapositiva 37. · script: scripts/exportar_series.py, función adf(): adfuller por defecto para las 5 transformaciones; adfuller(maxlag=0, autolag=None) para el esquema; Monte Carlo vectorizado en numpy para la distribución nula. Asserts: la fracción simulada coincide con el p de MacKinnon a ±0.01; p(caminata) > 0.10 y p(AR) < 0.01 en el esquema; y una réplica en numpy de adfuller coincide con statsmodels a 1e-6. · dependencias: statsmodels.tsa.stattools.adfuller, numpy, scipy (ya instalado)
