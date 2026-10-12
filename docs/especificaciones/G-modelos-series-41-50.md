# Especificación detallada — G. Modelos de series de tiempo (41–50) · Caso: pasajeros aéreos mensuales 1949–1960 (Serie

> Borrador de diseño generado por un agente. Sirve de referencia al construir; el plan vigente es `docs/PLAN-DIAPOSITIVAS.md`. Los números son los esperados y se recalculan al construir.

**Notas de la sección:** G. Modelos de series de tiempo (41–50) · Caso: pasajeros aéreos mensuales 1949–1960 (Serie G de Box–Jenkins, miles de pasajeros). Regla común de la sección: todo ajuste e identificación usa solo 1949–1959 (132 meses); 1960 (12 meses) es la prueba y aparece tapada con un bloque rayado 'PRUEBA · 1960' hasta que se evalúa. Encabezado: section=['U8 · Datos secuenciales','G. Modelos'], caso='Pasajeros aéreos'. Duración total ≈ 820 s (13.7 min). En la versión corta se recorta la 44; por eso el operador B se presenta en la 45, no en la 44. Valores 'aprox.' citados abajo salen de réplicas numpy/scipy hechas al diseñar (ADF idéntico a los valores publicados de statsmodels; SARIMA/ARIMA por CSS o verosimilitud exacta propia). La diapositiva NUNCA los escribe: los toma del JSON o los calcula en TS.


## 41 · Ruido blanco: lo que ya no se puede predecir

- **Objetivo:** Entender que el ruido blanco es una secuencia sin memoria (media cero, varianza constante, sin autocorrelación), que los pasajeros no lo son, y que la meta de todo modelo es que lo que sobra (los residuos) sí lo sea.
- **Estado:** nueva · **Duración:** 70 s

### Pasos

**Paso 0 (concepto).** Columna izquierda de 1040 px: arriba, serie simulada de 132 valores (línea gris --data, 1040×250, etiqueta mono 'ESQUEMA · SIMULADO · 132 VALORES'); abajo, su ACF de los rezagos 1 a 24 (1040×220) con la banda ±1.96/√132 punteada, las barras dentro de la banda en gris y las de fuera en rojo, y el contador mono 'k de 24 fuera de la banda'. Columna derecha de 600 px: las tres condiciones en TeX, una debajo de otra, y un Recap 'banda de confianza' (si la serie fuera ruido blanco, ~95 % de las barras caería dentro de ±1.96/√n).

- Animación: La serie se dibuja de izquierda a derecha (pathLength 0→1, 1.2 s). Después las barras de la ACF crecen desde 0, escalonadas cada 30 ms.
- Interacción: Chip 'otra muestra' (o tecla R): sortea una semilla nueva y recalcula la serie, la ACF y el contador.
- Frase clave: Ruido blanco: cada valor es una sorpresa nueva. Lo que pasó antes no ayuda a predecir lo que sigue.

**Paso 1 (concepto).** Las condiciones se compactan arriba a la derecha y aparece una dispersión de 340×340: ε_{t−1} en el eje x contra ε_t en el eje y, una nube redonda con r₁ impreso en mono. Sobre la serie se prolonga 12 pasos al futuro una línea roja horizontal en 0 con la banda ±1.96σ.

- Animación: Los puntos de la dispersión aparecen en orden temporal (8 ms cada uno). La línea del pronóstico se extiende hacia la derecha.
- Interacción: El chip 'otra muestra' sigue activo.
- Frase clave: Si el pasado no dice nada, el mejor pronóstico es la media, a cualquier horizonte.

**Paso 2 (caso).** Aparece 'Caso · Pasajeros aéreos'. La serie de arriba se reemplaza (crossfade) por los pasajeros mensuales 1949–1959 en miles, en gris; 1960 queda tapado por el bloque rayado 'PRUEBA · 1960 · GUARDADO'. La ACF de abajo se recalcula con esos 132 meses: las barras salen de la banda y el contador dice 'N de 24 fuera de la banda'. La dispersión de rezago 1 se vuelve una diagonal casi perfecta.

- Animación: Cada barra pasa de su altura con ruido a su altura con pasajeros (0.6 s, spring). Los puntos de la dispersión se reacomodan.
- Interacción: ninguna
- Frase clave: Los pasajeros tienen mucha memoria: cada mes se parece a los anteriores. Esa memoria es lo que un modelo aprovecha.

**Paso 3 (cierre).** La dispersión se sustituye por una segunda ACF de 600×220: la serie en log, sin tendencia (diferencia mensual) ni estacionalidad (diferencia de 12 meses), 1949–1959, 119 valores, escrita en palabras y no con símbolos. Solo salen de la banda unos pocos rezagos; r₁ y r₁₂ van rotulados en mono. Al pie, la frase de cierre (takeaway).

- Animación: Las barras crecen. Los rezagos 1 y 12 pulsan una vez en rojo.
- Interacción: ninguna
- Frase clave: Quitar tendencia y estacionalidad no basta: queda estructura en los rezagos 1 y 12. AR y MA la modelan, y lo que sobre al final debe parecer ruido blanco (se comprueba en la 48).

### Visuales

- **Serie (ruido simulado → pasajeros)** (svg, SeriesChart (nuevo)): Línea temporal con un eje de años y un bloque rayado de prueba en 1960.
- **ACF con banda y contador** (svg, Correlogram (nuevo)): Barras de los rezagos 1 a 24, banda ±1.96/√n, las barras de fuera en rojo y el contador 'k de K fuera'.
- **Dispersión de rezago 1** (svg, LagScatter (nuevo, pequeño)): Nube de x_{t−1} contra x_t con r₁ impreso.
- **Condiciones del ruido blanco** (formula, TeX): Tres condiciones en TeX.
- **Recordatorio · banda de confianza** (texto, Recap): Qué significa la banda ±1.96/√n.

### Datos

- **choques_41** (esquema-didactico): 132 valores N(0,1) independientes con semilla 41. 'Otra muestra' usa las semillas 42, 43, … La 42, la 43 y la 45 reutilizan SIEMPRE la semilla 41, nunca la que haya quedado al presionar el botón. — *Cálculo:* series.ts shocks(n, seed) = gaussian(mulberry32(seed)) de rng.ts. — *Verificación:* En desarrollo, verificarSeries.ts imprime la media y la desviación muestrales (deben dar ≈0 y ≈1). Prueba estructural: shocks(132,41) es idéntico en la 41, la 42 y la 45.
- **acf_muestral** (ts-vivo): r_k con denominador n (sesgado), rezagos 1–24, sobre la serie que esté en pantalla. — *Cálculo:* series.ts acf(x, K). — *Verificación:* Contra statsmodels acf(x, nlags=36, adjusted=False, fft=False) en las 5 transformaciones de 1949–1959 guardadas en series_referencias.json. Tolerancia: |dif| < 1e-12.
- **banda** (ts-vivo): ±1.96/√n con n = largo de la serie (132 → 0.171; 119 → 0.180). — *Cálculo:* series.ts band95(n). — *Verificación:* Fórmula cerrada.
- **pasajeros** (python-json): 144 totales mensuales en miles, de ene-1949 a dic-1960 (Box–Jenkins, Serie G; R datasets::AirPassengers). — *Cálculo:* scripts/exportar_series.py → src/data/pasajeros.json; lo lee src/lib/pasajeros.ts. — *Verificación:* El script exige n = 144, suma = 40363, primer valor 112, último 432, mínimo 104 y máximo 622. Los valores de suma y media (280.30) ya se comprobaron al diseñar.
- **acf_pasajeros_entrenamiento** (ts-vivo): ACF de los pasajeros 1949–1959 (r₁ ≈ 0.94; las 24 barras quedan fuera de la banda 0.171). — *Cálculo:* acf(y[0..131], 24). — *Verificación:* Igual que acf_muestral.
- **acf_dd12** (ts-vivo): ACF de w_t = (ln y_t − ln y_{t−12}) − (ln y_{t−1} − ln y_{t−13}), 1949–1959, n = 119. Valores aproximados: r₁ ≈ −0.317, r₁₂ ≈ −0.410, y además salen los rezagos 3 y 23. — *Cálculo:* series.ts diff(diff(log(y),12),1) seguido de acf. — *Verificación:* Contra series_referencias.json → transformaciones.dd12log.acf.
- **conteo_fuera_banda** (ts-vivo): Número de rezagos 1..K con |r_k| > 1.96/√n. — *Cálculo:* Filtro sobre la ACF. — *Verificación:* Recuento directo.

### Fórmulas

- `\varepsilon_t \text{ es ruido blanco si } E[\varepsilon_t]=0,\quad \operatorname{Var}(\varepsilon_t)=\sigma^2,\quad \operatorname{Cov}(\varepsilon_t,\varepsilon_{t-k})=0\ \ (k\neq 0)`
- `r_k=\dfrac{\sum_{t=k+1}^{n}(x_t-\bar x)(x_{t-k}-\bar x)}{\sum_{t=1}^{n}(x_t-\bar x)^2}`
- `\text{banda: } \pm\,\dfrac{1.96}{\sqrt{n}}`
- `\hat\varepsilon_{T+h}=E[\varepsilon]=0\quad (h=1,2,\dots)`

### Rigor

- Ruido blanco (débil) significa media 0, varianza constante y ninguna correlación. El simulado es normal e i.i.d., un caso particular ('ruido blanco gaussiano'); en pantalla se rotula 'simulado con ruido normal'.
- La banda ±1.96/√n es la aproximación para n grande bajo H0 de ruido blanco. plot_acf de statsmodels dibuja por defecto la banda de Bartlett, que se ensancha con el rezago; aquí se usa la constante de ruido blanco y se dice así.
- Con 24 rezagos se espera que ≈1.2 barras salgan de la banda por puro azar (5 %). Nunca se dice que deban salir 0.
- 'El mejor pronóstico es la media' es exacto para error cuadrático con ruido i.i.d.; para ruido blanco débil es el mejor pronóstico lineal.
- Los pasajeros están en miles (Serie G); ningún eje dice 'pasajeros' a secas.
- Desde esta diapositiva, toda ACF del caso se calcula solo con 1949–1959.

### Riesgos

- 'Otra muestra' puede dar 0 o 3 barras fuera de la banda: el expositor dice 'en promedio 5 %', nunca un número fijo.
- ΔΔ12 log todavía no tiene notación formal (llega en la 47): en pantalla se escribe en palabras.
- El rojo de 'fuera de banda' debe distinguirse de la banda: la banda va en gris claro punteado y el relleno es casi transparente.
- Recalcular con el botón es instantáneo (132 × 24 operaciones): no hay riesgo de tiempo.

## 42 · AR(p): la serie se explica con su propio pasado

- **Objetivo:** Entender que un AR(p) es una regresión lineal del valor actual sobre sus p valores anteriores, que φ decide cuánto dura el efecto de un choque y que |φ| < 1 es necesario para que la serie sea estacionaria.
- **Estado:** nueva · **Duración:** 90 s

### Pasos

**Paso 0 (concepto).** Izquierda, 1060 px: serie AR(1) simulada con los mismos 132 choques de la 41, en gris, con la etiqueta 'ESQUEMA · SIMULADO · MISMOS CHOQUES QUE LA 41'; debajo, la fila de chips φ = 0 · 0.5 · 0.9 · −0.6 · 1. Derecha, 560 px: la fórmula AR(p) grande, la AR(1) debajo y un Recap 'regresión lineal' (la recta que minimiza la suma de errores al cuadrado; aquí la variable explicativa es la propia serie un paso atrás).

- Animación: Al cambiar φ, la línea se transforma punto por punto (interpolación de 0.5 s) y el eje y se reescala suavemente. Con φ = 1 aparece la etiqueta 'caminata aleatoria · no estacionaria'. Con φ = 0 la serie es idéntica a la de la 41.
- Interacción: Chips de φ (clic) o ↑/↓ para recorrerlos.
- Frase clave: Hoy = una fracción φ de ayer + un choque nuevo. Con los mismos choques, φ decide cuánto se recuerda.

**Paso 1 (concepto).** Bajo la serie aparece 'Eco de un choque' (1060×200): barras ψ_k = φ^k para k = 0…20 del φ elegido. A la derecha, la condición |φ| < 1, la media μ = c/(1 − φ) y ρ_k = φ^k.

- Animación: Las barras crecen una por una (40 ms). Al cambiar φ se transforman: con φ = 1 quedan todas en 1 y con φ = −0.6 alternan de signo.
- Interacción: Los mismos chips de φ.
- Frase clave: Si |φ| < 1 el eco se apaga y la serie vuelve a su media; con φ = 1 el choque se queda para siempre.

**Paso 2 (caso).** Etiqueta del caso. Izquierda, 900 px: crecimiento anual z_t = ln y_t − ln y_{t−12} de 1950 a 1959, en gris, con una línea en su media; el eje y está rotulado en % exacto (e^z − 1) y 1960 va rayado como 'prueba'. Derecha, 760×520: LagCloud3D vista de lado (la cámara mira perpendicular al plano z_{t−1}–z_t), con los pares (z_{t−1}, z_t) como puntos, la recta de mínimos cuadrados en rojo y φ̂ impreso en mono.

- Animación: Los puntos caen de la serie a la nube en orden temporal (0.8 s en total). La recta se dibuja al final.
- Interacción: Arrastrar para girar (OrbitControls).
- Frase clave: Si este mes el crecimiento anual fue alto, el siguiente también tiende a serlo: φ̂ = {φ̂, calculado en vivo}.

**Paso 3 (caso).** La cámara gira hasta mostrar el tercer eje z_{t−2}. Aparece el plano AR(2) de mínimos cuadrados (rojo translúcido) y un segmento vertical de cada punto al plano (los residuos). φ̂₁ y φ̂₂ en mono.

- Animación: CameraTween de 1.2 s de la vista lateral a la isométrica. El plano pasa de opacidad 0 a 0.22 y los segmentos de residuo crecen.
- Interacción: Arrastrar para girar.
- Frase clave: AR(2): un plano en vez de una recta. Cada rezago es una variable más de la regresión.

**Paso 4 (cierre).** En la serie de la izquierda aparece en rojo el pronóstico AR(2) de los 12 meses de 1960, hecho desde dic-1959, que se acerca a la media μ̂ (línea punteada). Al pie, la frase de cierre.

- Animación: El pronóstico se dibuja punto por punto (80 ms).
- Interacción: ninguna
- Frase clave: Un AR pronostica volviendo a la media: el pasado reciente pesa, pero su efecto se apaga.

### Visuales

- **AR(1) simulado con chips de φ** (svg, SeriesChart (nuevo) + chips (.chip)): La misma serie de choques con distinto φ, transformándose en el lugar.
- **Eco de un choque** (svg, ImpulseResponse (nuevo)): Barras ψ_k = φ^k.
- **Nube de rezagos con recta y plano** (3d, LagCloud3D (nuevo) + CameraTween (nuevo) dentro de Scene3D): Puntos (z_{t−1}, z_{t−2}, z_t), la recta AR(1) en la vista lateral y el plano AR(2) en la vista 3D. El giro de cámara revela que AR(1) es la 'sombra' de AR(2).
- **Crecimiento anual con pronóstico** (svg, SeriesChart): z_t de 1950 a 1959, su media y el pronóstico de 1960.
- **Recordatorio · regresión lineal** (texto, Recap): Mínimos cuadrados en una línea.

### Datos

- **ar1_simulado** (esquema-didactico): y_t = φ y_{t−1} + ε_t con y_0 = ε_0, los choques shocks(132, 41) y φ ∈ {0, 0.5, 0.9, −0.6, 1}. — *Cálculo:* series.ts simulateArma([φ], [], choques). — *Verificación:* Prueba estructural en verificarSeries.ts: y_t − φ y_{t−1} == ε_t exacto en todos los t.
- **eco_ar1** (esquema-didactico): ψ_k = φ^k, k = 0..20. — *Cálculo:* series.ts psiWeights([φ], []). — *Verificación:* Contra statsmodels ArmaProcess(ar=[1,−φ]).arma2ma(21) en series_referencias.json.
- **crecimiento_anual** (ts-vivo): z_t = ln y_t − ln y_{t−12} para ene-1950…dic-1959 (120 valores); el eje se muestra como e^z − 1. La media es ≈0.121, que equivale a un crecimiento anual de ≈12.9 %. — *Cálculo:* series.ts diff(log(y.slice(0,132)), 12). — *Verificación:* Contra series_referencias.json → transformaciones.d12log.serie.
- **ar1_ols** (ts-vivo): (ĉ, φ̂) por mínimos cuadrados de z_t sobre [1, z_{t−1}] con t = 2..120; aprox. ĉ = 0.0323, φ̂ = 0.743. — *Cálculo:* series.ts olsAR(z, 1), por ecuaciones normales. — *Verificación:* Contra statsmodels AutoReg(z, lags=1, trend='c').fit().params en series_referencias.json. Tolerancia: |dif| < 1e-10.
- **ar2_ols** (ts-vivo): (ĉ, φ̂₁, φ̂₂) por mínimos cuadrados con t = 3..120; aprox. (0.0254, 0.579, 0.222). — *Cálculo:* series.ts olsAR(z, 2). — *Verificación:* Contra AutoReg(z, lags=2, trend='c'). Tolerancia: 1e-10.
- **pronostico_ar2** (ts-vivo): Pronóstico de 12 pasos desde dic-1959 con la recursión AR(2) y μ̂ = ĉ/(1 − φ̂₁ − φ̂₂). — *Cálculo:* series.ts forecastAR(params, z, 12). — *Verificación:* Contra AutoReg(...).predict(start=120, end=131) en series_referencias.json. Tolerancia: 1e-10.

### Fórmulas

- `y_t = c + \phi_1 y_{t-1} + \phi_2 y_{t-2} + \dots + \phi_p y_{t-p} + \varepsilon_t`
- `\text{AR}(1):\ y_t = c + \phi\,y_{t-1} + \varepsilon_t`
- `\psi_k=\phi^k\quad\text{(efecto de un choque después de } k \text{ pasos)}`
- `|\phi|<1\ \Rightarrow\ \text{estacionaria},\qquad \mu=\dfrac{c}{1-\phi},\qquad \rho_k=\phi^k`
- `z_t=\ln y_t-\ln y_{t-12},\qquad \text{crecimiento anual}=e^{z_t}-1`
- `(\hat c,\hat\phi_1,\hat\phi_2)=\arg\min\sum_t\big(z_t-c-\phi_1 z_{t-1}-\phi_2 z_{t-2}\big)^2`
- `\hat z_{T+h}-\hat\mu=\hat\phi_1(\hat z_{T+h-1}-\hat\mu)+\hat\phi_2(\hat z_{T+h-2}-\hat\mu),\qquad \hat\mu=\dfrac{\hat c}{1-\hat\phi_1-\hat\phi_2}`

### Rigor

- AR(1) es estacionario si y solo si |φ| < 1. En AR(p) la condición es que las raíces de 1 − φ₁z − … − φ_p z^p queden fuera del círculo unitario. Para AR(2): φ₁ + φ₂ < 1, φ₂ − φ₁ < 1 y |φ₂| < 1. Las estimaciones (≈0.579, 0.222) la cumplen.
- φ = 1 es la caminata aleatoria: su varianza crece como tσ², así que no es estacionaria.
- La simulación arranca en y_0 = ε_0 sin calentamiento, para que los choques sean literalmente los mismos que en la 41; se dice 'arranca en 0'.
- Los coeficientes del caso son de mínimos cuadrados condicionales (AutoReg) y se rotulan así. Máxima verosimilitud da valores un poco distintos (p. ej., AR(1) por MV ≈ 0.73 en la serie completa).
- z_t es un logaritmo de cociente: el crecimiento exacto es e^z − 1, no z. El eje muestra el % exacto.
- Se usan dos rezagos porque la PACF de z (1949–1959) en el rezago 2 vale ≈0.219, por encima de la banda de 0.179; eso se explica en la 46, aquí basta con 'dos rezagos'.

### Riesgos

- El ADF de ∇₁₂ ln y está en la frontera (p ≈ 0.07 con la serie completa). No se afirma en pantalla que z sea estacionaria; si alguien pregunta, se reconoce que es un caso límite y que el modelo final usa ∇∇₁₂.
- El giro de cámara puede desorientar. La vista lateral debe alinearse exactamente para que la recta 2D se reconozca, con etiquetas Label3D en los tres ejes. Al volver al paso 3 se vuelve a la vista isométrica.
- Con φ = 1 la serie se aleja mucho: hay que animar el dominio del eje y para que no 'salte'.
- Son 5 pasos en 90 s: el paso 3 (plano) debe durar 20 s o menos.

## 43 · MA(q): el eco de los errores recientes

- **Objetivo:** Entender que un MA(q) explica el valor actual con los choques de los últimos q periodos, que su memoria se corta exactamente después de q pasos, y que no es el promedio móvil de suavizado de la 38.
- **Estado:** nueva · **Duración:** 80 s

### Pasos

**Paso 0 (concepto).** Izquierda, 1100 px, la 'cinta de choques': abajo, 24 tallos ε_t (los mismos choques de la 41) en gris. Arriba, barras y_t = ε_t + θ ε_{t−1} apiladas en dos tonos (gris = ε_t, rojo = θ ε_{t−1}). Un corchete rojo abarca [t−1, t] y recorre la cinta. Etiqueta 'ESQUEMA · SIMULADO' y chips θ = 0.8 · −0.6. Derecha: las fórmulas MA(q) y MA(1).

- Animación: El corchete avanza un mes cada 350 ms. En cada paso la barra y_t se arma: primero el tramo gris y luego el rojo, que 'baja' desde el choque anterior.
- Interacción: Chips de θ; al cambiar θ, la animación reinicia.
- Frase clave: Hoy = el choque de hoy + θ veces el choque de ayer. Un choque solo dura q + 1 periodos.

**Paso 1 (concepto).** Abajo a la izquierda, dos ecos lado a lado (520×180 cada uno): AR(1) con φ = 0.6 (se apaga poco a poco) y MA(1) con θ = 0.6 (dos barras y luego cero). A la derecha, la tabla 'No confundir' de 4 renglones × 2 columnas, Promedio móvil (suavizado, 38) | MA(q) (modelo): ¿qué promedia? valores observados y | choques no observados ε; ¿usa el futuro? sí, es centrado | no; ¿para qué? describir la tendencia | pronosticar; ¿pesos? fijos (1/12) | estimados (θ).

- Animación: La tabla aparece renglón por renglón (120 ms). Los ecos crecen barra por barra.
- Interacción: ninguna
- Frase clave: Mismo nombre, otra cosa: el promedio móvil suaviza datos; el MA modela errores.

**Paso 2 (caso).** Etiqueta del caso. Arriba (1696×190): pasajeros 1949–1959 en gris con el promedio móvil 2×12 en rojo; los 6 primeros y 6 últimos meses no tienen valor y llevan la marca 'necesita 6 meses del futuro'. Abajo a la izquierda (1100×300): w_t (log sin tendencia ni estacionalidad, 119 meses) en gris y la predicción a un paso del MA(1), ŵ_t = θ̂ ε̂_{t−1}, en rojo; θ̂ en mono.

- Animación: Un cursor recorre w_t durante 6 s. En cada mes, una flecha va del error del mes anterior (segmento vertical entre w y ŵ) a la predicción actual, escalada por θ̂. Al final queda la curva completa.
- Interacción: ninguna
- Frase clave: Si el mes pasado la serie quedó arriba de lo esperado, este mes se espera una corrección hacia abajo (θ̂ < 0).

**Paso 3 (cierre).** Abajo a la derecha (560×300): ACF de w_t en los rezagos 1–11 con su banda, y una marca roja en el ρ₁ teórico del MA(1) ajustado, θ̂/(1 + θ̂²), junto a la barra r₁ observada. Frase de cierre al pie.

- Animación: Las barras crecen y la marca teórica aparece sobre el rezago 1.
- Interacción: ninguna
- Frase clave: La ACF corta después del rezago 1: la huella de un MA(1). Promedio móvil y MA comparten nombre, no idea.

### Visuales

- **Cinta de choques con ventana deslizante** (svg, ShockTape (nuevo, dentro del archivo de la 43)): Tallos ε_t y barras y_t apiladas que se arman con una ventana [t−1, t].
- **Ecos AR vs MA** (svg, ImpulseResponse (nuevo)): Dos respuestas al impulso lado a lado.
- **Tabla 'No confundir'** (tabla, HTML con estilos del tema): Promedio móvil contra MA(q), 4 renglones.
- **Pasajeros + promedio móvil 2×12** (svg, SeriesChart): Tendencia suavizada con los 6 meses finales vacíos marcados.
- **w_t con predicción MA(1)** (svg, SeriesChart + capa de flechas propia): Serie, predicción a un paso y flechas del error al siguiente mes.
- **ACF de w_t con ρ₁ teórico** (svg, Correlogram (prop theory)): Rezagos 1–11 con una marca de la teórica.

### Datos

- **ma1_simulado** (esquema-didactico): y_t = ε_t + θ ε_{t−1} con los choques shocks(132,41) (primeros 24) y θ ∈ {0.8, −0.6}. — *Cálculo:* series.ts simulateArma([], [θ], choques). — *Verificación:* Prueba estructural: y_t − ε_t − θ ε_{t−1} == 0.
- **ecos_ar_ma** (esquema-didactico): AR(1) φ = 0.6: ψ_k = 0.6^k. MA(1) θ = 0.6: ψ = (1, 0.6, 0, 0, …). — *Cálculo:* series.ts psiWeights. — *Verificación:* Contra ArmaProcess.arma2ma en series_referencias.json.
- **media_movil_2x12** (ts-vivo): Promedio móvil centrado 2×12 de y (1949–1959) con pesos 1/24, 1/12 (×11), 1/24. Deja indefinidos los 6 primeros y los 6 últimos meses. — *Cálculo:* series.ts centeredMA2x12(y). — *Verificación:* Contra statsmodels seasonal_decompose(y, model='multiplicative', period=12).trend en series_referencias.json. Tolerancia: |dif| < 1e-9; los NaN deben coincidir en posición.
- **w_dd12** (ts-vivo): w_t = ∇∇₁₂ ln y_t con 1949–1959, 119 valores. — *Cálculo:* series.ts. — *Verificación:* Contra series_referencias.json → dd12log.serie.
- **theta_ma1** (python-json): θ̂ de máxima verosimilitud de ARIMA(w, order=(0,0,1), trend='n'), con w de 1949–1959. Aprox. −0.36 a −0.39; por CSS en la serie completa, −0.387. — *Cálculo:* scripts/modelos_series.py → series_modelos.json.ma1 {theta, se, sigma2, fitted}. — *Verificación:* El script exige convergencia (mle_retvals['converged']) y |θ̂| < 1 (invertible).
- **prediccion_ma1** (ts-vivo): Recursión condicional ε̂_t = w_t − θ̂ ε̂_{t−1}, ŵ_t = θ̂ ε̂_{t−1}, con ε̂_0 = 0. — *Cálculo:* series.ts maFilter(w, θ̂). — *Verificación:* Contra fittedvalues de statsmodels (filtro de Kalman) en series_modelos.json.ma1.fitted, desde t ≥ 10. Tolerancia: |dif| < 1e-3; difiere al inicio por la inicialización y converge como |θ̂|^t.
- **rho1_teorico** (ts-vivo): θ̂/(1 + θ̂²), que se compara con el r₁ observado (≈ −0.317). — *Cálculo:* Fórmula cerrada. — *Verificación:* Contra ArmaProcess(ma=[1, θ̂]).acf(2)[1] en el script.

### Fórmulas

- `y_t=\mu+\varepsilon_t+\theta_1\varepsilon_{t-1}+\dots+\theta_q\varepsilon_{t-q}`
- `\text{MA}(1):\ y_t=\mu+\varepsilon_t+\theta\,\varepsilon_{t-1},\qquad \rho_1=\dfrac{\theta}{1+\theta^2},\ \ \rho_k=0\ (k\ge 2)`
- `\text{promedio móvil }2\times12:\ \hat T_t=\tfrac{1}{12}\Big(\tfrac12 y_{t-6}+y_{t-5}+\dots+y_{t+5}+\tfrac12 y_{t+6}\Big)`
- `w_t=z_t-z_{t-1},\qquad z_t=\ln y_t-\ln y_{t-12}`
- `\hat\varepsilon_t=w_t-\hat\theta\,\hat\varepsilon_{t-1},\qquad \hat w_t=\hat\theta\,\hat\varepsilon_{t-1},\qquad \hat\varepsilon_0=0`

### Rigor

- Un MA(q) finito siempre es estacionario. La invertibilidad (|θ| < 1 en MA(1)) es la que permite recuperar ε a partir de los datos; sin ella, la recursión ε̂ explota.
- En un MA(1), |ρ₁| ≤ 1/2 para cualquier θ, con el máximo en |θ| = 1.
- Convención de signo: aquí y en statsmodels se escribe y_t = ε_t + θ ε_{t−1}. Box y Jenkins escriben (1 − θB), así que su θ = 0.4 equivale a nuestro θ = −0.4.
- El promedio 2×12 usa y_{t+1}…y_{t+6}: por construcción no existe en los últimos 6 meses y no sirve para pronosticar.
- La ACF de w (1949–1959) también deja salir apenas el rezago 3 (≈ −0.216 contra la banda de 0.180). Se dice: 'con 11 barras, ~0.5 saldrían por azar'.
- La predicción mostrada es la recursión condicional, no la del filtro de Kalman; se rotula 'predicción a un paso'.

### Riesgos

- La ventana deslizante necesita ritmo lento: a 350 ms por mes, 24 meses tardan 8.4 s. Conviene permitir saltarla con el siguiente clic.
- Dos gráficas del caso más una tabla del concepto es mucho: la tabla y los ecos se desvanecen al pasar al caso (AnimatePresence).
- w_t es poco intuitivo: se nombra 'log de pasajeros sin tendencia ni estacionalidad' y el símbolo queda pequeño.

## 44 · ARMA(p,q): memoria larga y rebote corto con pocos coeficientes

- **Objetivo:** Entender que un ARMA combina AR y MA, y que con pocos coeficientes reproduce patrones de autocorrelación que un AR o un MA puro no alcanzan con la misma cantidad (parsimonia).
- **Estado:** nueva · **Duración:** 60 s

### Pasos

**Paso 0 (concepto).** Arriba, la fórmula ARMA(p,q) en forma explícita, con sumas y sin operador B (por si se recorta la 44). Abajo, tres ecos lado a lado (540×240 cada uno): AR(1) φ = 0.7; MA(1) θ = 0.5; ARMA(1,1) φ = 0.7, θ = 0.5, con ψ₁ = φ + θ rotulado. Etiqueta 'ESQUEMA · TEÓRICO'.

- Animación: Las tres respuestas crecen en paralelo, barra por barra (50 ms). En el ARMA, la barra 1 se destaca y la cola toma el color de la del AR.
- Interacción: ninguna
- Frase clave: El MA ajusta el primer rebote; el AR, cómo se apaga después.

**Paso 1 (caso).** Etiqueta del caso. ACF muestral del crecimiento anual z_t (1950–1959, rezagos 1–20) en barras grises con su banda, en 1200×460. Encima, las líneas con marcadores de la ACF teórica de MA(1) y AR(1) ajustados por máxima verosimilitud, cada una con su rótulo directo al final. A la derecha (440 px), un recuadro chico con los coeficientes estimados.

- Animación: Primero aparece la línea del MA(1): cae a 0 después del rezago 1 y su ρ₁ queda por debajo de la barra. Después, la del AR(1): baja más rápido que las barras.
- Interacción: Chips para encender o apagar cada modelo: MA(1) · AR(1) · ARMA(1,1).
- Frase clave: Un MA(1) no alcanza: su ρ₁ nunca pasa de 0.5. Un AR(1) se apaga demasiado rápido.

**Paso 2 (cierre).** Se agrega en rojo la ACF teórica del ARMA(1,1) ajustado, que sigue a las barras. Nota al pie: 'un AR(2) también lo logra con 2 coeficientes; cómo elegir entre candidatos: 48'. Frase de cierre.

- Animación: La línea del ARMA se dibuja de izquierda a derecha (0.8 s) y las otras dos bajan su opacidad a 0.35.
- Interacción: Chips.
- Frase clave: Parsimonia: con dos coeficientes, el ARMA(1,1) reproduce una forma que un AR(1) o un MA(1) no pueden.

### Visuales

- **Tres ecos** (svg, ImpulseResponse ×3): ψ_k de AR(1), MA(1) y ARMA(1,1).
- **ACF muestral con ACF teóricas superpuestas** (svg, Correlogram (prop theory: lista de curvas)): Barras grises y líneas de cada modelo con rótulo directo.
- **Coeficientes** (texto, HTML): Valores estimados en mono.

### Datos

- **ecos_esquema** (esquema-didactico): ψ_k de AR(1) φ = 0.7, de MA(1) θ = 0.5 y de ARMA(1,1) (0.7, 0.5), k = 0..15. — *Cálculo:* series.ts psiWeights. — *Verificación:* Contra ArmaProcess.arma2ma en series_referencias.json.
- **acf_crecimiento** (ts-vivo): ACF de z_t (1950–1959, n = 120), rezagos 1–20; aprox. 0.737, 0.644, 0.500, 0.457, … — *Cálculo:* acf(z, 20). — *Verificación:* Contra series_referencias.json → d12log.acf.
- **arma_crecimiento** (python-json): Parámetros de máxima verosimilitud de ARIMA(z, order=(p,0,q), trend='c') para AR(1), MA(1), ARMA(1,1) y AR(2), con z de 1950–1959. Referencia con la serie completa (MV exacta propia): ARMA(1,1) φ ≈ 0.857, θ ≈ −0.284; AR(1) φ ≈ 0.726; MA(1) θ ≈ 0.477. — *Cálculo:* scripts/modelos_series.py → series_modelos.json.arma_crecimiento. — *Verificación:* El script exige convergencia, raíces fuera del círculo unitario e invertibilidad.
- **acf_teoricas** (ts-vivo): ACF teórica de cada modelo con sus parámetros estimados: AR(1) φ^k; MA(1) θ/(1 + θ²) y luego 0; ARMA(1,1) por fórmula cerrada. — *Cálculo:* series.ts armaAcf(phi, theta, K). — *Verificación:* Contra ArmaProcess(...).acf(21) guardado por el script. Tolerancia: 1e-10.

### Fórmulas

- `y_t=c+\phi_1y_{t-1}+\dots+\phi_py_{t-p}+\varepsilon_t+\theta_1\varepsilon_{t-1}+\dots+\theta_q\varepsilon_{t-q}`
- `\text{ARMA}(1,1):\ y_t=c+\phi\,y_{t-1}+\varepsilon_t+\theta\,\varepsilon_{t-1}`
- `\psi_0=1,\qquad \psi_k=\phi^{k-1}(\phi+\theta)\ \ (k\ge1)`
- `\rho_1=\dfrac{(1+\phi\theta)(\phi+\theta)}{1+2\phi\theta+\theta^2},\qquad \rho_k=\phi\,\rho_{k-1}\ \ (k\ge2)`
- `\text{MA}(1):\ |\rho_1|=\dfrac{|\theta|}{1+\theta^2}\le\tfrac12`

### Rigor

- Las fórmulas de ψ y de ρ del ARMA(1,1) son exactas.
- Las curvas son la ACF teórica en los parámetros de máxima verosimilitud; no son un ajuste a la ACF. El parecido de formas es un diagnóstico, no el criterio de estimación.
- Con los parámetros de la serie completa, la ACF del ARMA(1,1) da ρ ≈ 0.73, 0.63, 0.54, 0.46, …, cerca de las barras; la del AR(1) da 0.73, 0.53, 0.38, … (demasiado rápida).
- Factor común: si θ = −φ, el ARMA(1,1) se reduce a ruido blanco. Los parámetros del esquema (0.7, 0.5) lo evitan.
- La AIC de estos modelos existe (con verosimilitud exacta: AR(2) ≈ −458, ARMA(1,1) ≈ −457, AR(1) ≈ −453, MA(1) ≈ −406 en la serie completa), pero NO se muestra aquí porque AIC se presenta en la 48.

### Riesgos

- Diapositiva recortable: nada de la 45 en adelante depende de ella, y el operador B se presenta en la 45.
- Tres líneas sobre barras saturan la vista: se encienden por pasos y las anteriores se atenúan.
- El φ̂ del AR(1) por máxima verosimilitud (aquí) difiere un poco del de mínimos cuadrados de la 42: no se imprime en grande; si se muestra, se rotula 'máx. verosimilitud'.

## 45 · ARIMA(p,d,q): diferenciar, modelar y volver a sumar

- **Objetivo:** Entender que la I de ARIMA es la diferenciación: se modela con un ARMA la serie diferenciada y el pronóstico se integra (suma acumulada) para volver al nivel original, con una incertidumbre que crece con el horizonte.
- **Estado:** nueva · **Duración:** 75 s

### Pasos

**Paso 0 (concepto).** Izquierda, 1080 px: los mismos 132 choques de la 41 como barras (Δy) y, arriba, la caminata aleatoria y_t = y_{t−1} + ε_t en gris; etiqueta 'ESQUEMA · SIMULADO'. Derecha, 560 px: Recap 'operador de rezago B' (B y_t = y_{t−1}) y la fórmula ARIMA(p,d,q).

- Animación: Cada barra Δy sube y se apila sobre el valor anterior (suma acumulada) hasta formar la caminata en 2 s. Después, al revés: la caminata se diferencia y regresan las barras.
- Interacción: ninguna
- Frase clave: Diferenciar quita la tendencia; integrar (sumar acumulado) la devuelve. Esa es la I de ARIMA.

**Paso 1 (concepto).** Sobre la caminata, el pronóstico plano ŷ_{T+h} = y_T de 24 pasos con un abanico del 95 %, ±1.96σ√h, en relleno rojo tenue.

- Animación: El abanico se abre paso a paso (60 ms por h).
- Interacción: ninguna
- Frase clave: Al sumar errores, la incertidumbre crece con la raíz del horizonte.

**Paso 2 (caso).** Etiqueta del caso. Arriba a la izquierda (1000×220): Δ ln y (cambio mensual, 1949–1959), sin tendencia pero con un patrón que se repite cada año. A la derecha (560×200), una mini ACF con el rezago 12 destacado (r₁₂ en mono) y el p del ADF de Δ ln y. Abajo (1000×280): los 12 Δ̂ que pronostica el mejor ARIMA(p,1,q) con deriva, en barras rojas, con su orden en mono y la nota 'elegido con AIC, ver 48'.

- Animación: Las barras Δ̂ se apilan (suma acumulada desde ln y de dic-1959) y se transforman en la curva de nivel ŷ en miles, con su banda del 95 %.
- Interacción: ninguna
- Frase clave: Se pronostica el cambio y luego se suma para volver al nivel.

**Paso 3 (cierre).** Gráfica de nivel 1957–1960 a todo el ancho (1696×420): pronóstico ARIMA en rojo con su banda y, encima, los valores reales de 1960 en blanco, que se revelan. Frase de cierre.

- Animación: Los valores reales de 1960 aparecen punto por punto (80 ms).
- Interacción: ninguna
- Frase clave: La I resolvió la tendencia, pero el ARIMA no ve que cada verano sube: falta modelar el rezago 12.

### Visuales

- **Integración de la caminata aleatoria** (svg, CumsumStack (nuevo, dentro del archivo de la 45)): Barras que se apilan para formar la serie, y luego el proceso inverso.
- **Abanico √h** (svg, SeriesChart (prop bands)): Pronóstico plano con su intervalo creciente.
- **Δ ln y y su ACF** (svg, SeriesChart + Correlogram): Serie diferenciada y correlograma con el rezago 12 destacado.
- **De Δ̂ a ŷ** (svg, CumsumStack + SeriesChart): Barras de cambio pronosticado que se integran en la curva de nivel.
- **Recordatorio · operador de rezago B** (texto, Recap): B y_t = y_{t−1}, (1 − B) y_t = y_t − y_{t−1}.

### Datos

- **caminata** (esquema-didactico): y_t = Σ_{j≤t} ε_j con shocks(132,41); pronóstico plano con σ = 1. — *Cálculo:* series.ts cumsum(choques); abanico y_T ± 1.96√h. — *Verificación:* Prueba estructural: diff(cumsum(ε)) == ε.
- **dlog** (ts-vivo): Δ ln y_t con 1949–1959 (131 valores); r₁₂ ≈ 0.833. — *Cálculo:* series.ts. — *Verificación:* Contra series_referencias.json → dlog.acf.
- **adf_dlog** (python-json): Estadístico y p de adfuller(Δ ln y, regression='c', autolag='AIC') con 1949–1959. Con la serie completa, el valor publicado es −2.717 (p 0.071), que la réplica numpy reproduce. — *Cálculo:* scripts/modelos_series.py → series_modelos.json.adf. — *Verificación:* El script imprime el valor con la serie completa y exige |est + 2.717| < 0.001 como prueba de que la configuración es la estándar.
- **arima_no_estacional** (python-json): Rejilla ARIMA(ln y, order=(p,1,q), trend='t') con p, q ∈ {0,1,2} y 1949–1959. Se elige la de menor AIC. Para la elegida se guardan los parámetros, get_forecast(12).predicted_mean (log), conf_int(alpha=0.05) (log), los Δ̂ = diferencias del pronóstico, si convergió y el módulo mínimo de las raíces MA. Con la réplica de MV exacta propia salió ARIMA(2,1,1) con deriva, con una raíz MA en ≈ −0.999 (frontera de invertibilidad) y MAPE de 1960 ≈ 12.3 %. — *Cálculo:* scripts/modelos_series.py → series_modelos.json.arima. — *Verificación:* El script exige ŷ_log[0] = ln y_dic1959 + Δ̂[0] y la suma acumulada (|dif| < 1e-9). Registra las advertencias de convergencia; si la elegida tiene una raíz MA de módulo < 1.01, toma la siguiente de la rejilla y lo deja escrito en 'regla'.
- **nivel_pronosticado** (ts-vivo): ŷ = exp(pronóstico en log) en miles; la banda es exp de los límites en log. — *Cálculo:* Math.exp sobre el JSON. — *Verificación:* Monotonía: la banda contiene al pronóstico en los 12 meses.

### Fórmulas

- `B\,y_t=y_{t-1},\qquad (1-B)\,y_t=y_t-y_{t-1}=\nabla y_t`
- `\text{ARIMA}(p,d,q):\ \ \phi(B)\,(1-B)^d\,y_t=c+\theta(B)\,\varepsilon_t`
- `\phi(B)=1-\phi_1B-\dots-\phi_pB^p,\qquad \theta(B)=1+\theta_1B+\dots+\theta_qB^q`
- `\text{ARIMA}(0,1,0):\ y_t=y_{t-1}+\varepsilon_t\ \Rightarrow\ y_t=y_0+\sum_{j=1}^{t}\varepsilon_j`
- `\hat y_{T+h}=y_T+\sum_{j=1}^{h}\hat w_{T+j}`
- `\text{caminata aleatoria: }\ \hat y_{T+h}=y_T,\qquad \text{IC}_{95\%}=y_T\pm1.96\,\sigma\sqrt{h}`
- `\ln y_t-\ln y_{t-1}=\ln\dfrac{y_t}{y_{t-1}}\approx\dfrac{y_t-y_{t-1}}{y_{t-1}}`

### Rigor

- El abanico ±1.96σ√h es exacto solo para la caminata aleatoria con choques normales. En el caso, las bandas salen de statsmodels (varianza σ² Σψ_j² del proceso integrado).
- Deriva en statsmodels: con d = 1 hay que usar trend='t' (la constante de la serie diferenciada); trend='c' no está permitido con d > 0.
- exp del pronóstico en log da la mediana, no la media, en la escala original. La banda sí se transforma exacta porque exp es monótona. Se rotula 'pronóstico (mediana)'.
- Δ ln y es aproximadamente la tasa de cambio mensual; el valor exacto es e^{Δ ln y} − 1.
- Hacer referencia a AIC antes de la 48 está permitido como 'criterio que veremos en la 48'.

### Riesgos

- La rejilla puede elegir un modelo con raíz MA casi unitaria (señal de mala especificación): la regla del script lo evita y la diapositiva muestra el orden que venga en el JSON.
- La animación de apilar 132 barras debe durar 2 s o menos; se puede apilar por grupos de 12.
- Si se recorta la 44, esta diapositiva es la primera en usar φ(B) y θ(B): el Recap de B es obligatorio aquí.

## 46 · Identificación: leer la ACF y la PACF

- **Objetivo:** Proponer p y q mirando dónde se cortan la ACF y la PACF (AR: la PACF corta en p; MA: la ACF corta en q; ARMA: ambas decaen) y aplicarlo a los pasajeros, en rezagos cortos y estacionales.
- **Estado:** nueva · **Duración:** 85 s

### Pasos

**Paso 0 (concepto).** Izquierda: rejilla 3 × 2 de correlogramas teóricos de 540×150 cada uno. Renglones: AR(2) φ = (0.5, 0.3) · MA(1) θ = −0.6 · ARMA(1,1) φ = 0.7, θ = 0.4. Columnas: ACF | PACF. Derecha, 520 px: tabla de reglas con 'corta en p' y 'corta en q' en rojo y 'decae' en gris, más un Recap breve 'PACF' (correlación con y_{t−k} quitando el efecto de los rezagos intermedios). Etiqueta 'ESQUEMA · TEÓRICO'.

- Animación: Renglón por renglón (0.5 s cada uno): las barras crecen y se subraya en rojo la columna que corta.
- Interacción: ninguna
- Frase clave: La que corta dice el orden: si corta la PACF → AR(p); si corta la ACF → MA(q); si ninguna corta → ARMA.

**Paso 1 (concepto).** Las mismas seis gráficas, ahora con una muestra simulada de 132 valores de cada modelo (en barras), la teórica como marca fina y la banda ±1.96/√132.

- Animación: Las barras pasan de la altura teórica a la muestral (0.6 s).
- Interacción: Chip 'teórica / muestra' y chip 'otra muestra' (semilla nueva).
- Frase clave: Con datos reales las barras tiemblan: esto propone candidatos, no decide.

**Paso 2 (caso).** Etiqueta del caso. La rejilla se reemplaza por dos correlogramas anchos (1696×230 cada uno, rezagos 1–36) de la serie en log sin tendencia ni estacionalidad (1949–1959, n = 119): ACF arriba, PACF abajo, banda ±1.96/√119. Los rezagos 1–11 en primer plano; del 12 al 36, atenuados.

- Animación: Las barras crecen. Luego el rezago 1 de la ACF pulsa y aparece la anotación 'corta en 1 → q = 1'. En la PACF aparece 'también podría leerse AR(1)'.
- Interacción: ninguna
- Frase clave: En los rezagos cortos la ACF corta en 1: candidato MA(1). La PACF deja abierta la puerta a un AR(1).

**Paso 3 (cierre).** Se iluminan los rezagos 12, 24 y 36 (marca en el eje) y se atenúan los demás. La ACF tiene un pico en 12 y nada en 24 ni en 36; aparece la anotación 'corta en 12 → Q = 1'. Al pie: candidato SARIMA(0,1,1)(0,1,1)₁₂ y la pregunta '¿qué es la parte estacional? → 47'.

- Animación: Atenuado y realce en 0.4 s; el candidato se escribe al pie.
- Interacción: ninguna
- Frase clave: En los rezagos 12, 24 y 36 se lee igual, pero en años: la ACF corta en 12, un MA estacional.

### Visuales

- **Rejilla 3×2 teórica/muestral** (svg, Correlogram ×6): Seis correlogramas pequeños.
- **Tabla de reglas** (tabla, HTML): AR/MA/ARMA × ACF/PACF con 'corta' o 'decae'.
- **ACF y PACF del caso con rezagos estacionales** (svg, Correlogram (props highlight, seasonal=12)): Rezagos 1–36 con marcas en 12, 24 y 36.
- **Recordatorio · PACF** (texto, Recap): Definición en una línea.

### Datos

- **teoricas_46** (esquema-didactico): ACF y PACF teóricas, rezagos 1–20, de AR(2) (0.5, 0.3): ρ₁ = 0.714, φ₂₂ = 0.3; de MA(1) θ = −0.6: ρ₁ = −0.441; y de ARMA(1,1) (0.7, 0.4). — *Cálculo:* series.ts armaAcf + pacfFromAcf (Durbin–Levinson). — *Verificación:* Contra ArmaProcess(ar, ma).acf(21) y .pacf(21) en series_referencias.json. Tolerancia: 1e-10.
- **muestras_46** (esquema-didactico): Una serie simulada de 132 valores por modelo (semillas fijas; el botón las cambia), con 100 valores de calentamiento descartados. — *Cálculo:* series.ts simulateArma con burn = 100. — *Verificación:* Estructural: los residuos de la recursión reproducen los choques.
- **acf_pacf_w** (ts-vivo): ACF y PACF de ∇∇₁₂ ln y con 1949–1959 (n = 119), rezagos 1–36. Aprox.: ACF r₁ −0.317, r₃ −0.216, r₁₂ −0.410, r₂₄ −0.030, r₃₆ 0.011; PACF φ₁₁ −0.317, φ₂₂ 0.009, φ₃₃ −0.199, φ₁₂,₁₂ −0.355. — *Cálculo:* series.ts acf + pacfFromAcf. — *Verificación:* Contra statsmodels acf(adjusted=False) y pacf(method='ldb') en series_referencias.json. Tolerancia: 1e-10.

### Fórmulas

- `\phi_{kk}=\operatorname{Corr}\big(y_t,\,y_{t-k}\mid y_{t-1},\dots,y_{t-k+1}\big)`
- `\text{AR}(p):\ \phi_{kk}=0\ (k>p),\ \ \rho_k\text{ decae}\qquad \text{MA}(q):\ \rho_k=0\ (k>q),\ \ \phi_{kk}\text{ decae}`
- `\text{AR}(2):\ \rho_1=\dfrac{\phi_1}{1-\phi_2},\qquad \rho_k=\phi_1\rho_{k-1}+\phi_2\rho_{k-2}`
- `\pm\,1.96/\sqrt{119}`

### Rigor

- Reglas exactas en teoría: en AR(p), φ_kk = 0 para k > p; en MA(q), ρ_k = 0 para k > q; en un ARMA ninguna se anula de golpe y ambas decaen (exponencialmente o como senoide amortiguada).
- La PACF muestral que se usa es Levinson–Durbin con autocovarianza sesgada, que equivale a statsmodels pacf(method='ldb') o 'ywm'. El default de statsmodels pacf ('ywadjusted') da valores ligeramente distintos: se fija el método.
- En el caso, los rezagos 3 (≈ −0.216) y 23 salen un poco de la banda. Con 36 rezagos se esperan ≈1.8 por azar; se dice explícitamente.
- La lectura de la PACF es ambigua (AR(1) también es candidato). Por eso la conclusión es 'candidatos', y la 48 decide con AIC, donde (1,1,0)(0,1,1) y (0,1,1)(0,1,1) quedan casi empatados.
- Ningún orden se 'demuestra' con la ACF: es heurística (Box–Jenkins, etapa de identificación).

### Riesgos

- Seis gráficas pequeñas en un proyector: mínimo 15 px en las etiquetas mono, barras de 18 px o más y un solo eje rotulado por columna.
- 36 rezagos en 1696 px dan ~40 px por barra: legible.
- Que el rojo signifique dos cosas (fuera de banda y rezago estacional) confunde: el estacional se marca con un triángulo y la etiqueta '12' en el eje, no con color.

## 47 · SARIMA: un ARIMA para los meses y otro para los años

- **Objetivo:** Entender que SARIMA(p,d,q)(P,D,Q)ₛ agrega a ARIMA una parte que trabaja con rezagos de s periodos (aquí 12 meses), incluida la diferencia estacional, y verlo sobre los pasajeros hasta pronosticar 1960.
- **Estado:** nueva · **Duración:** 90 s

### Pasos

**Paso 0 (concepto).** Izquierda (760×520): rejilla esquema de 12 columnas (meses E…D) × 5 renglones (años 1, 2, …). La celda 't' va en rojo, con una flecha a la celda de la izquierda, 't − 1', y otra a la de arriba, 't − 12'; en enero, la flecha t − 1 da la vuelta a diciembre del renglón anterior. Etiqueta 'ESQUEMA'. Derecha: la notación SARIMA(p,d,q)(P,D,Q)ₛ con la parte de meses en gris y la de años en rojo, ∇ₛ y_t = y_t − y_{t−s} y la fórmula multiplicativa general.

- Animación: Las dos flechas se dibujan una tras otra (0.5 s).
- Interacción: ninguna
- Frase clave: Dos relojes: el rezago 1 compara con el mes anterior; el rezago 12, con el mismo mes del año pasado.

**Paso 1 (caso).** Etiqueta del caso. Izquierda (1060×600): MonthYear3D con 11 cintas (1949–1959) de ln y. Mes en el eje X, año en profundidad, valor hacia arriba; flechas rojas de rezago 1 y de rezago 12 en julio de 1955; Label3D en E, A, J (meses) y en 1949, 1954, 1959. Derecha (560 px): las fases 'ln y → ∇₁₂ → ∇' como lista, con la actual en rojo.

- Animación: Las cintas suben desde el piso año por año (80 ms).
- Interacción: Arrastrar para girar.
- Frase clave: Cada año repite la forma y sube un escalón.

**Paso 2 (caso).** La misma escena: cada celda pasa a ∇₁₂ ln y (ella menos la de atrás). La cinta de 1949 se desvanece con la etiqueta 'sin año anterior' y el eje vertical cambia de rótulo a 'crecimiento anual (log)'.

- Animación: Interpolación de alturas en 1.2 s: el patrón de verano desaparece y las cintas quedan casi planas, cada una a su altura.
- Interacción: Arrastrar para girar.
- Frase clave: La diferencia estacional compara cada mes con el mismo mes del año anterior, y el patrón que se repite desaparece.

**Paso 3 (caso).** Ahora ∇∇₁₂ ln y (diferencia a lo largo de los meses): se pierde enero de 1950 y las cintas quedan como ruido alrededor de 0. A la derecha, el modelo de aerolínea con los coeficientes estimados θ̂ y Θ̂ (del JSON) y su forma expandida, con θ̂Θ̂ en el rezago 13 calculado en vivo.

- Animación: Interpolación de 1.2 s; la fórmula expandida aparece término por término.
- Interacción: Arrastrar para girar.
- Frase clave: Lo que queda se modela con un MA(1) de meses y un MA(1) de años: el 'modelo de aerolínea' de Box y Jenkins.

**Paso 4 (cierre).** La escena 3D se reduce a la izquierda (700 px). A la derecha aparece una gráfica 2D (980×480) de 1957–1960 en miles: entrenamiento en gris, pronóstico de 1960 en rojo con su banda del 95 % y, después, los reales de 1960 en blanco. Frase de cierre.

- Animación: El pronóstico se dibuja en 0.8 s y los reales se revelan punto por punto.
- Interacción: ninguna
- Frase clave: Con dos coeficientes (más la varianza), el pronóstico sigue los picos de julio y agosto de 1960.

### Visuales

- **Rejilla mes × año (esquema)** (diagrama, LagGrid (nuevo, pequeño)): Celdas y flechas de rezago 1 y 12, con la vuelta de enero a diciembre.
- **Cintas mes × año en 3D** (3d, MonthYear3D (nuevo) en Scene3D): 12 meses × 11 años. Las alturas se transforman de ln y a ∇₁₂ y a ∇∇₁₂; las flechas muestran que el rezago 12 recorre el eje de años. Es el uso de 3D que más ayuda en la sección: muestra los dos relojes a la vez.
- **Modelo de aerolínea** (formula, TeX): La forma de operadores y la expandida, con coeficientes del JSON.
- **Pronóstico 1960 vs real** (svg, SeriesChart): 1957–1960, banda del 95 %, reales revelados al final.

### Datos

- **cintas** (ts-vivo): ln y, ∇₁₂ ln y y ∇∇₁₂ ln y organizados como [año][mes] con 1949–1959; las celdas sin valor son null (1949 completo tras ∇₁₂, más ene-1950 tras ∇). — *Cálculo:* series.ts toMonthYearGrid + diff. — *Verificación:* Las celdas válidas suman 132, 120 y 119; los valores coinciden con series_referencias.json.
- **airline_params** (python-json): θ̂ = ma.L1, Θ̂ = ma.S.L12, σ̂² y errores estándar de SARIMAX(ln y_1949–1959, order=(0,1,1), seasonal_order=(0,1,1,12), trend='n').fit(disp=False). Aprox. por CSS: θ ≈ −0.33, Θ ≈ −0.58; con 1949–1960, Box–Jenkins reportan θ ≈ −0.40, Θ ≈ −0.61 en nuestra convención. — *Cálculo:* scripts/modelos_series.py → series_modelos.json.elegido (si la regla elige la aerolínea; ver 48). — *Verificación:* El script exige convergencia y |θ̂|, |Θ̂| < 1. También compara con el modelo ajustado a 1949–1960 contra los valores de libro (−0.40, −0.61) con tolerancia de 0.02, solo como prueba de configuración; ese ajuste no se usa en la diapositiva.
- **theta_producto** (ts-vivo): θ̂·Θ̂, el coeficiente implícito del rezago 13. — *Cálculo:* Producto en TS. — *Verificación:* Exacto.
- **pronostico_1960** (python-json): get_forecast(12) del modelo elegido: predicted_mean y conf_int(alpha=0.05) en log; en la diapositiva se aplica exp(). Aprox. por CSS: ŷ ≈ 419, 399, 467, 455, 473, 547, 622, 629, 527, 462, 407, 452. — *Cálculo:* series_modelos.json.elegido.pronostico_log / ic95_log; TS exp. — *Verificación:* El script compara get_forecast con la recursión manual ŵ_{T+h} = θ̂ε̂_{T+h−1} + Θ̂ε̂_{T+h−12} + θ̂Θ̂ε̂_{T+h−13}, integrada (|dif| < 1e-3 en log).
- **reales_1960** (python-json): y de ene a dic de 1960. — *Cálculo:* pasajeros.json. — *Verificación:* Suma de control del archivo.
- **nombre_modelo** (constante-de-libro): 'Modelo de aerolínea' = SARIMA(0,1,1)(0,1,1)₁₂ sobre ln y, propuesto por Box y Jenkins (1970) para esta misma serie. — *Cálculo:* — — *Verificación:* Box, Jenkins, Reinsel y Ljung, Time Series Analysis, cap. 9 (Serie G).

### Fórmulas

- `\text{SARIMA}(p,d,q)(P,D,Q)_s`
- `\nabla_s y_t=(1-B^s)\,y_t=y_t-y_{t-s}`
- `\phi(B)\,\Phi(B^{s})\,(1-B)^d\,(1-B^{s})^D\,y_t=\theta(B)\,\Theta(B^{s})\,\varepsilon_t`
- `(1-B)(1-B^{12})\ln y_t=(1+\theta B)(1+\Theta B^{12})\,\varepsilon_t`
- `w_t=\varepsilon_t+\theta\,\varepsilon_{t-1}+\Theta\,\varepsilon_{t-12}+\theta\Theta\,\varepsilon_{t-13}`
- `\hat y_{T+h}=\exp\big(\widehat{\ln y}_{T+h}\big)`

### Rigor

- La forma multiplicativa implica un término en el rezago 13 con coeficiente θΘ, que no es un parámetro libre.
- Con d = D = 1 y s = 12 se pierden d + D·s = 13 observaciones: de 132 quedan 119. Lo mismo vale para los residuos 'quemados' de statsmodels.
- Convención de signos: +θ (statsmodels). Los coeficientes negativos equivalen a los positivos del libro.
- El pronóstico se entrenó solo con datos hasta dic-1959. exp da la mediana; la banda del 95 % es exp de la banda en log.
- Si la regla de la 48 elige otro modelo, esta diapositiva muestra el elegido. La forma expandida se genera desde los órdenes del JSON y la palabra 'aerolínea' solo aparece si el elegido es (0,1,1)(0,1,1).

### Riesgos

- Legibilidad del 3D en proyector: 11 cintas de 2 px con Label3D solo en 3 años y 3 meses, cámara inicial que deje ver los dos ejes y fondo sin malla densa.
- El cambio de escala entre fases necesita que el rótulo del eje vertical cambie junto con la animación, y una escala propia por fase con sus marcas.
- Son 5 pasos en 90 s: el expositor no debe girar la escena más de 5 s.
- Si los reales de 1960 ya se revelaron en la 45, aquí no hay sorpresa; se compensa con el contraste visual (curva suave del ARIMA contra los picos del SARIMA).

## 48 · Elegir y evaluar: tres preguntas, tres herramientas

- **Objetivo:** Saber elegir órdenes con AIC/BIC, medir el pronóstico con MAE/RMSE/MAPE en un tramo de prueba, y revisar con Ljung-Box que los residuos ya no tengan autocorrelación (al revés que ADF).
- **Estado:** nueva · **Duración:** 110 s

### Pasos

**Paso 0 (concepto).** Tres columnas de 540 px separadas por reglas finas, con encabezados grandes: '¿Qué órdenes?' · '¿Pronostica bien?' · '¿Dejó algo sin explicar?'. Cada columna tiene una fila superior de concepto (≈260 px) y una inferior de caso (≈330 px). En la fila superior de la columna 1 van AIC y BIC en TeX, 'menor es mejor', la regla 'solo con la misma serie y los mismos d, D' y un Recap compacto 'verosimilitud'. Las columnas 2 y 3 solo muestran el encabezado en gris tenue.

- Animación: Fade de la columna 1.
- Interacción: ninguna
- Frase clave: AIC premia ajustar bien y castiga cada parámetro de más; BIC castiga más. Solo se comparan modelos con la misma serie y las mismas diferencias.

**Paso 1 (concepto).** Columna 2, fila superior: MAE, RMSE y MAPE en TeX y un esquema hecho a mano de 4 meses (real contra pronóstico, etiqueta 'ESQUEMA') con barras de error, y debajo los tres valores calculados.

- Animación: Las barras de error se transforman: |e| → promedio (MAE); e² → promedio → raíz (RMSE); |e|/y → promedio × 100 (MAPE). El error grande del mes 4 se ilumina cuando el RMSE supera al MAE.
- Interacción: ninguna
- Frase clave: RMSE castiga más los errores grandes; MAPE se lee en porcentaje, pero falla si y está cerca de 0.

**Paso 2 (concepto).** Columna 3, fila superior: la fórmula de Ljung-Box, H₀, y dos escalas de p apiladas (PValueScale): ADF ('quieres p < 0.05') y Ljung-Box ('quieres p > 0.05'), con la zona deseada en rojo.

- Animación: Las zonas deseadas se iluminan en lados opuestos de 0.05.
- Interacción: ninguna
- Frase clave: En ADF quieres rechazar; en Ljung-Box quieres no rechazar. Mismo 0.05, preguntas opuestas.

**Paso 3 (caso).** Etiqueta del caso. Columna 1, fila inferior (540×330): AicGrid 4×4 de los 16 SARIMA(p,1,q)(P,1,Q)₁₂ con p, q, P, Q ∈ {0,1}, ajustados a ln y de 1949–1959. Cada celda muestra ΔAIC respecto al mínimo; el mínimo lleva borde rojo y las celdas con Δ < 2, relleno rojo tenue. Debajo, el modelo elegido y la regla.

- Animación: Las celdas se llenan de la peor a la mejor (40 ms).
- Interacción: Chips AIC / BIC.
- Frase clave: Frase generada desde el JSON: si el mínimo es la aerolínea, 'AIC confirma lo que propuso la ACF'; si queda a Δ < 2, 'empate: diferencias menores a 2 no distinguen modelos; nos quedamos con el que propuso la identificación'.

**Paso 4 (caso).** Columna 2, fila inferior: ErrorStrip con los 12 errores del SARIMA elegido en 1960 (en miles) y los tres valores MAE, RMSE y MAPE calculados en vivo.

- Animación: El mismo mecanismo del esquema de arriba, ahora con 12 meses.
- Interacción: ninguna
- Frase clave: En 1960 el modelo se equivoca en promedio por {MAE} mil pasajeros, un {MAPE} %.

**Paso 5 (cierre).** Columna 3, fila inferior: ACF de los residuos de entrenamiento (rezagos 1–24, sin los 13 primeros) con su banda, y Q(12), Q(24) con su p en la PValueScale de Ljung-Box. Frase de cierre a todo el ancho.

- Animación: Las barras crecen y el marcador de p se desliza a su lugar.
- Interacción: ninguna
- Frase clave: AIC elige, la prueba mide y Ljung-Box revisa. Un modelo sirve si pasa las tres.

### Visuales

- **Estructura de 3 columnas × 2 filas** (mixto, CSS grid en el archivo de la 48): La propia distribución enseña las tres preguntas: el concepto arriba y el caso abajo, en la misma columna.
- **Rejilla AIC/BIC** (tabla, AicGrid (nuevo)): 4×4 con ΔAIC, el mínimo marcado y los empates (Δ < 2) sombreados.
- **Construcción de las métricas** (svg, ErrorStrip (nuevo)): Barras de error que se transforman en |e|, e² y |e|/y y se promedian.
- **Escalas de p opuestas** (svg, PValueScale (nuevo)): ADF contra Ljung-Box, con la zona deseada a cada lado de 0.05.
- **ACF de residuos** (svg, Correlogram): Rezagos 1–24 con su banda.
- **Recordatorio · verosimilitud** (texto, Recap): L̂ = qué tan probables son los datos con los parámetros estimados.

### Datos

- **esquema_metricas** (esquema-didactico): Entradas ilustrativas: y = (100, 120, 110, 130), ŷ = (104, 114, 112, 110), con la etiqueta 'ESQUEMA'. Las métricas se calculan en TS (deben dar MAE 8, RMSE ≈ 10.68, MAPE ≈ 6.55 %). — *Cálculo:* series.ts mae, rmse, mape. — *Verificación:* Las mismas funciones se verifican contra sklearn (ver métricas del caso).
- **sarima_grid** (python-json): 16 modelos SARIMAX(ln y_1949–1959, order=(p,1,q), seasonal_order=(P,1,Q,12), trend='n') con aic, bic, llf, k (incluye σ²), nobs, nobs_effective y converged. Réplica CSS: (1,1,0)(0,1,1) y (0,1,1)(0,1,1) separados por ≈1 unidad de AIC; el resto, más lejos. — *Cálculo:* scripts/modelos_series.py → series_modelos.json.sarima_grid. — *Verificación:* El script exige aic == −2·llf + 2k y registra qué n usa statsmodels en BIC (nobs_effective = nobs − 13), comprobando bic == −2·llf + k·ln(n).
- **regla_eleccion** (python-json): elegido = aerolínea (0,1,1)(0,1,1)₁₂, salvo que otro modelo tenga una AIC menor por más de 2 unidades; en ese caso se elige el de menor AIC. Se guarda el texto de la regla y el ΔAIC. — *Cálculo:* series_modelos.json.elegido.regla. — *Verificación:* El script imprime la decisión y la diapositiva solo la lee.
- **metricas_1960** (ts-vivo): MAE, RMSE y MAPE en la escala original (miles), con ŷ = exp(pronóstico en log) y y = reales de 1960. Aprox. por CSS: MAE ≈ 13.2, RMSE ≈ 18.5, MAPE ≈ 2.9 %. — *Cálculo:* series.ts mae/rmse/mape. — *Verificación:* Contra sklearn mean_absolute_error, root_mean_squared_error y mean_absolute_percentage_error × 100 calculados por el script sobre los mismos vectores (series_modelos.json.elegido.metricas_ref). Tolerancia: 1e-9.
- **residuos_ljungbox** (ts-vivo): Residuos de entrenamiento res.resid[13:] (119 valores, del JSON); su ACF de 1 a 24; Q(12) y Q(24) con gl = h − 2 y su p por χ². Aprox. por CSS: p ≈ 0.55 con h = 12 y p ≈ 0.69 con h = 24. — *Cálculo:* series.ts ljungBox(e, h, 2) con chi2Sf (gamma incompleta regularizada). — *Verificación:* Contra statsmodels acorr_ljungbox(resid[13:], lags=[12,24], model_df=2) guardado en el JSON. Tolerancia: 1e-8. chi2Sf se verifica contra scipy.stats.chi2.sf en 20 pares (x, gl) de series_referencias.json.

### Fórmulas

- `\text{AIC}=2k-2\ln\hat L`
- `\text{BIC}=k\ln n-2\ln\hat L`
- `\text{MAE}=\frac1n\sum_{t}|y_t-\hat y_t|`
- `\text{RMSE}=\sqrt{\frac1n\sum_{t}(y_t-\hat y_t)^2}`
- `\text{MAPE}=\frac{100\%}{n}\sum_{t}\left|\frac{y_t-\hat y_t}{y_t}\right|`
- `Q=n(n+2)\sum_{k=1}^{h}\frac{r_k^2}{n-k}\ \sim\ \chi^2_{h-m}\quad\text{bajo } H_0:\ \rho_1=\dots=\rho_h=0`
- `\text{ADF: } H_0=\text{raíz unitaria (quieres } p<0.05)\qquad \text{Ljung-Box: } H_0=\text{sin autocorrelación (quieres } p>0.05)`

### Rigor

- AIC y BIC solo son comparables con la misma serie transformada (ln y), el mismo tramo y los mismos d y D. Toda la rejilla usa d = D = 1. No se compara la AIC del ARIMA (D = 0) con la del SARIMA, ni la de modelos sobre y contra los de ln y.
- k incluye σ² (convención de statsmodels).
- ΔAIC < 2 se presenta como 'regla práctica' (Burnham y Anderson, 2002), no como prueba.
- p > 0.05 en Ljung-Box significa 'no hay evidencia de autocorrelación', no 'es ruido blanco'.
- Los grados de libertad son h − m con m = p + q + P + Q (= 2 en la aerolínea); el ajuste es el de Box y Pierce / Ljung y Box para residuos de un ARMA ajustado.
- Se excluyen los primeros d + D·s = 13 residuos porque reflejan la inicialización difusa.
- RMSE ≥ MAE siempre (la media cuadrática es mayor o igual que la aritmética). MAPE exige y ≠ 0; aquí y ≥ 104 mil. Las métricas se calculan en miles, no en log.
- ADF: H0 = raíz unitaria, se quiere rechazar. Ljung-Box: H0 = sin autocorrelación, se quiere no rechazar.

### Riesgos

- Es la diapositiva más densa: 110 s, por encima de la meta de 90 s, justificado porque es fundamento clave y no se recorta. Cada columna se enciende sola para no saturar.
- Tamaño mínimo de letra: 20 px en celdas y valores, 15 px en etiquetas mono.
- La frase del paso 3 depende del resultado real de la rejilla; debe generarse desde el JSON, no escribirse a mano.
- Confusión entre la escala log (AIC) y la escala en miles (métricas): cada fila lleva su unidad en la etiqueta.

## 49 · La línea base: copiar el año pasado

- **Objetivo:** Entender que todo modelo se compara con un pronóstico ingenuo (para datos mensuales estacionales, repetir el mismo mes del año anterior) y que un modelo que no le gana no aporta.
- **Estado:** nueva · **Duración:** 60 s

### Pasos

**Paso 0 (concepto).** Izquierda (1000×380): esquema de 3 años de barras mensuales con tendencia y estacionalidad (generadas por fórmula, etiqueta 'ESQUEMA'), donde el último año se copia como pronóstico del siguiente. Derecha: la fórmula del ingenuo estacional, la definición de mejora (skill) y un Recap 'línea base' que recuerda la clase mayoritaria de Adult: su accuracy sin aprender nada.

- Animación: El bloque del último año se desliza 12 posiciones a la derecha (0.8 s) y queda como pronóstico punteado.
- Interacción: ninguna
- Frase clave: La regla más simple que funciona: el mismo mes del año pasado. Un modelo que no le gana no aporta.

**Paso 1 (caso).** Etiqueta del caso. Izquierda (1060×420): 1958–1960 en miles, con los reales en blanco, el ingenuo de 1960 (1959 copiado) en gris discontinuo y el SARIMA elegido en rojo. Derecha: MetricTable de 2 renglones × 4 columnas (MAE, RMSE, MAPE, mejora) y el conteo 'en {k} de 12 meses, 1960 superó a 1959'.

- Animación: La copia de 1959 se desliza a 1960, luego se dibuja el SARIMA y la tabla se llena cifra por cifra.
- Interacción: ninguna
- Frase clave: El ingenuo se queda corto todos los meses: no sabe que el tráfico crece.

**Paso 2 (cierre).** La mejora del SARIMA se destaca en rojo y aparece la frase de cierre con la pregunta '¿siempre?'.

- Animación: Realce.
- Interacción: ninguna
- Frase clave: En 1960 el SARIMA mejora en {mejora} % el RMSE del ingenuo. ¿Pasa lo mismo en otros años? Siguiente diapositiva.

### Visuales

- **Copia de la última temporada** (svg, SeasonCopy (nuevo, dentro del archivo de la 49)): Bloque de 12 barras que se desliza un año adelante.
- **Real vs ingenuo vs SARIMA, 1960** (svg, SeriesChart): Tres líneas con rótulo directo.
- **Tabla de métricas** (tabla, MetricTable (nuevo)): MAE, RMSE, MAPE y mejora, con el mejor de cada columna en rojo.
- **Recordatorio · línea base** (texto, Recap): La clase mayoritaria de Adult como el 'ingenuo' de clasificación.

### Datos

- **esquema_temporadas** (esquema-didactico): 3 años de barras = tendencia lineal + seno de periodo 12 (fórmula en el código, sin datos). — *Cálculo:* TS. — *Verificación:* Etiquetado como esquema.
- **ingenuo_1960** (ts-vivo): ŷ_{1960,m} = y_{1959,m}. — *Cálculo:* series.ts seasonalNaive(entrenamiento, 12). — *Verificación:* Igual elemento por elemento a y[120..131].
- **metricas_ingenuo_sarima** (ts-vivo): MAE, RMSE y MAPE de ambos en 1960, en miles. Valores aproximados: ingenuo MAE 47.8, RMSE 50.7, MAPE 9.99 %; SARIMA aprox. en la 48. — *Cálculo:* series.ts. — *Verificación:* Contra las referencias de sklearn en series_modelos.json. Tolerancia: 1e-9.
- **mejora** (ts-vivo): 1 − RMSE_SARIMA/RMSE_ingenuo (aprox. 0.63 con la réplica CSS). — *Cálculo:* TS. — *Verificación:* Derivado de valores ya verificados.
- **conteo_crecio** (ts-vivo): Número de meses m con y_{1960,m} > y_{1959,m}; con los datos da 12 de 12. — *Cálculo:* TS. — *Verificación:* Recuento directo.
- **clase_mayoritaria_adult** (python-json): Accuracy de la clase mayoritaria en Adult (0.761). — *Cálculo:* src/data/comparacion_adult.json (ya existe). — *Verificación:* Ya verificado en la U7.

### Fórmulas

- `\hat y_{T+h}=y_{T+h-12},\qquad h=1,\dots,12`
- `\text{en general: }\ \hat y_{T+h}=y_{T+h-12\lceil h/12\rceil}`
- `\text{mejora}=1-\dfrac{\text{RMSE}_{\text{modelo}}}{\text{RMSE}_{\text{ingenuo}}}`

### Rigor

- ŷ_t = y_{t−12} es un pronóstico legítimo solo para horizontes de hasta 12 meses desde el origen; para más, se usa y_{T+h−12⌈h/12⌉}. La prueba es de 12 meses, así que la fórmula es exacta.
- La 'mejora' es la reducción relativa del RMSE frente al ingenuo; es una de varias medidas de skill (MASE de Hyndman escala el MAE con el ingenuo dentro de la muestra). Se rotula 'mejora relativa en RMSE'.
- El ingenuo no tiene parámetros: no tiene AIC.
- Que 1960 supere a 1959 en 12 de 12 meses es un hecho de los datos y se calcula, no se afirma.

### Riesgos

- El paralelo con la clase mayoritaria de la U7 depende de que la 25/26 la haya mostrado: el Recap se queda en una frase.
- Las líneas gris discontinuo y rojo en el proyector: grosor de 3 px o más, con rótulo directo al final de cada línea y sin leyenda separada.

## 50 · Demo: de la serie al pronóstico, evaluado en tres años

- **Objetivo:** Ver el proceso completo sobre los pasajeros (transformar, comprobar estacionariedad, identificar, elegir, pronosticar contra la línea base y diagnosticar) y comprobar con validación de origen móvil que la ventaja de SARIMA no depende de un solo año.
- **Estado:** nueva · **Duración:** 100 s

### Pasos

**Paso 0 (concepto).** Arriba (1696×70): una línea con 6 estaciones en mono: 1 TRANSFORMAR · 2 ¿ESTACIONARIA? · 3 IDENTIFICAR · 4 ELEGIR · 5 PRONOSTICAR Y COMPARAR · 6 DIAGNOSTICAR, cada una con el número de la diapositiva donde se vio (34, 37, 46, 48, 49 y 30, 48). Debajo, un recordatorio de una línea por estación. Etiqueta 'RECETA'.

- Animación: Las estaciones aparecen de izquierda a derecha (100 ms); la línea que las une se dibuja.
- Interacción: ninguna
- Frase clave: La receta completa, de la serie cruda al pronóstico evaluado.

**Paso 1 (caso).** Etiqueta del caso; las estaciones 1 y 2 en rojo. Izquierda (820 px): la descomposición multiplicativa de 1949–1959 en tres franjas (tendencia, estacional, residuo), calculada en vivo. Derecha (820 px): la tabla ADF (serie, estadístico, p, ¿estacionaria al 5 %?) para nivel, ln, ∇ ln, ∇₁₂ ln y ∇∇₁₂ ln, con el renglón ∇∇₁₂ en rojo.

- Animación: Las franjas se dibujan; la tabla se llena renglón por renglón.
- Interacción: ninguna
- Frase clave: La estacionalidad crece con el nivel (multiplicativa → log). Δ log todavía no pasa ADF; con la diferencia estacional sí: d = 1, D = 1.

**Paso 2 (caso).** Estaciones 3 y 4. Izquierda: mini ACF y PACF de ∇∇₁₂ ln y (820×170 cada una) con los rezagos 1 y 12 anotados. Derecha: mini AicGrid de la 48 y, en grande, el modelo elegido.

- Animación: Crossfade desde el panel anterior.
- Interacción: ninguna
- Frase clave: La ACF propone, la AIC confirma: SARIMA({orden elegido}).

**Paso 3 (caso).** Estación 5. Arriba (1696×140): WalkForward con tres renglones de entrenamiento gris y prueba roja: 1949–1957 → 1958, 1949–1958 → 1959 y 1949–1959 → 1960. Abajo (1696×360): SeriesChart de 1956–1960 con el pliegue activo: reales en blanco, SARIMA en rojo, ARIMA en gris punteado e ingenuo en gris discontinuo, con rótulo directo.

- Animación: Los renglones del WalkForward se dibujan uno por uno; al cambiar de pliegue, las líneas se redibujan (0.5 s).
- Interacción: Chips 1958 · 1959 · 1960 o ↑/↓ para cambiar de pliegue (empieza en 1960).
- Frase clave: En cada origen todo se vuelve a estimar solo con el pasado: órdenes, coeficientes y la copia del ingenuo.

**Paso 4 (caso).** MetricTable con renglones Ingenuo estacional, ARIMA(p,1,q) con deriva y SARIMA. Columnas: MAPE de 1958, de 1959 y de 1960, y media ± desv de MAE, RMSE y MAPE; el mejor de cada columna en rojo. Nota calculada: 'crecimiento del total anual: 1957 {a} %, 1958 {b} %, 1959 {c} %'.

- Animación: La columna de 1958 se ilumina y la gráfica salta a ese pliegue.
- Interacción: Los mismos chips.
- Frase clave: En 1958 el tráfico casi no creció y copiar el año anterior ganó. En promedio, SARIMA gana.

**Paso 5 (cierre).** Estación 6: una fila de 3 PValueScale (Ljung-Box Q(24) de los residuos del SARIMA en cada pliegue) y la frase de cierre a todo el ancho.

- Animación: Los marcadores de p se deslizan a su lugar.
- Interacción: ninguna
- Frase clave: SARIMA gana en promedio, pero no todos los años: por eso se evalúa en varios orígenes y siempre contra una línea base.

### Visuales

- **Receta en 6 estaciones** (diagrama, PipelineSteps (nuevo, dentro del archivo de la 50)): Línea con estaciones numeradas; la activa en rojo.
- **Descomposición multiplicativa** (svg, SeriesChart ×3): Tendencia, estacional y residuo en tres franjas finas.
- **Tabla ADF** (tabla, MetricTable (modo genérico)): 5 transformaciones con estadístico, p y decisión.
- **Validación de origen móvil** (diagrama, WalkForward (nuevo, compartible con la 30)): Tres pliegues de entrenamiento y prueba sobre el eje de tiempo.
- **Pronósticos por pliegue** (svg, SeriesChart): 4 líneas con rótulo directo.
- **Tabla por pliegue y media ± desv** (tabla, MetricTable): El mejor de cada columna en rojo y la columna 1958 destacada.
- **Ljung-Box por pliegue** (svg, PValueScale): 3 escalas de p.

### Datos

- **descomposicion** (ts-vivo): Descomposición clásica multiplicativa de 1949–1959: T = promedio móvil 2×12; S = promedio por mes de y/T, normalizado para que los 12 factores promedien 1; R = y/(T·S). — *Cálculo:* series.ts decomposeMultiplicative(y, 12). — *Verificación:* Contra statsmodels seasonal_decompose(model='multiplicative', period=12) en series_referencias.json. Tolerancia: 1e-9.
- **adf_tabla** (python-json): adfuller(x, regression='c', autolag='AIC') sobre 1949–1959 para nivel, ln, ∇ ln, ∇₁₂ ln y ∇∇₁₂ ln: estadístico, p, rezagos, nobs y valores críticos. Con la serie completa, la réplica numpy reproduce los valores publicados: 0.815, −1.717, −2.717, −2.71 y −4.443. — *Cálculo:* scripts/modelos_series.py → series_modelos.json.adf. — *Verificación:* El script también corre la serie completa y exige coincidencia con 0.815 / −1.717 / −2.717 / −4.443 (±0.001) como prueba de configuración.
- **walk_forward** (python-json): Orígenes dic-1957, dic-1958 y dic-1959 (T = 108, 120, 132), horizonte de 12. En cada pliegue y solo con y_1..y_T: SARIMA con la regla de la 48 sobre la rejilla de 16; ARIMA(p,1,q) con deriva por AIC (p, q ≤ 2, con la regla de raíces); se guardan los pronósticos en log, los órdenes y resid[13:]. Réplica CSS, MAPE por pliegue: ingenuo 3.1 / 11.1 / 10.0; SARIMA 7.3 / 6.7 / 2.9; ARIMA 11.5 / 12.9 / 12.5. — *Cálculo:* scripts/modelos_series.py → series_modelos.json.walk_forward. — *Verificación:* El script verifica que ningún ajuste ve datos posteriores a su origen (assert sobre los índices) y guarda las métricas de sklearn por pliegue como referencia.
- **metricas_pliegues** (ts-vivo): MAE, RMSE y MAPE por modelo y por pliegue, en miles; media y desviación poblacional (ddof = 0, igual que en la U7) sobre los 3 pliegues. — *Cálculo:* series.ts sobre exp(pronóstico) y los reales; el ingenuo se calcula en TS. — *Verificación:* Contra las referencias de sklearn del JSON. Tolerancia: 1e-9.
- **crecimiento_anual_total** (ts-vivo): Σ y del año a / Σ y del año a−1 − 1 para 1957, 1958 y 1959 (≈12.2 %, 3.4 % y 12.4 %). — *Cálculo:* TS sobre pasajeros.json. — *Verificación:* Recuento directo.
- **ljungbox_pliegues** (ts-vivo): Q(24) con gl = 24 − m sobre resid[13:] de cada pliegue. — *Cálculo:* series.ts ljungBox. — *Verificación:* Contra acorr_ljungbox guardado por el script.

### Fórmulas

- `T_k\in\{\text{dic }1957,\ \text{dic }1958,\ \text{dic }1959\}:\ \text{entrena con } y_1,\dots,y_{T_k};\ \text{pronostica } y_{T_k+1},\dots,y_{T_k+12}`
- `\bar m=\frac13\sum_{k=1}^{3}m_k,\qquad s=\sqrt{\frac13\sum_{k=1}^{3}(m_k-\bar m)^2}`
- `\text{crecimiento del año } a=\dfrac{\sum_{m}y_{a,m}}{\sum_{m}y_{a-1,m}}-1`
- `y_t=T_t\times S_t\times R_t`

### Rigor

- En cada pliegue, la elección de órdenes, la estimación y la copia del ingenuo usan solo datos hasta su origen.
- Con 3 pliegues la desviación es una estimación tosca; se dice 'solo tres años'.
- Lo de 1958 se presenta como hecho de los datos (el total anual creció ≈3.4 % contra ≈12 % los años vecinos). No se atribuye a una causa (por ejemplo, una recesión) sin una referencia.
- 'ARIMA' en la tabla significa ARIMA(p,1,q) no estacional con deriva, p, q ≤ 2, elegido por AIC en cada pliegue.
- Los ADF de esta diapositiva son con 1949–1959; pueden diferir un poco de los publicados con la serie completa.
- Los resultados de la réplica CSS (SARIMA gana en promedio, el ingenuo gana en 1958) deben confirmarse con statsmodels; todo el texto de la diapositiva se genera desde el JSON.

### Riesgos

- Es la diapositiva más larga (100 s): cada estación reemplaza a la anterior (AnimatePresence) para no amontonar.
- El giro narrativo (1958) es el momento clave; si statsmodels cambiara el ganador de 1958, la frase se adapta sola.
- Cálculo en Python: 3 pliegues × (16 SARIMA + 9 ARIMA) = 75 ajustes, menos de 1 min. En el navegador no hay cálculo pesado.
- Cuatro líneas en gris, blanco y rojo: hay que comprobar el contraste del gris punteado contra el discontinuo en un proyector real.

## Componentes nuevos propuestos

- **src/lib/series.ts (librería)** — Cálculos exactos de series de tiempo en el navegador, verificables contra statsmodels/sklearn. · API: diff(x, lag=1); log(x); acf(x, K) (denominador n); pacfFromAcf(r) (Durbin–Levinson, = statsmodels pacf method='ldb'); band95(n); psiWeights(phi[], theta[], K); armaAcf(phi[], theta[], K) (forma cerrada para AR(1), MA(1), ARMA(1,1) y AR(2); general por ψ truncado a 400 términos); shocks(n, seed); simulateArma(phi[], theta[], eps[], burn=0); olsAR(x, p) → {c, phi[], fitted}; forecastAR(params, x, H); maFilter(w, theta) → {eps, pred}; centeredMA2x12(y); decomposeMultiplicative(y, s); seasonalNaive(train, H, s=12); toMonthYearGrid(x, startMonth); mae/rmse/mape(y, yhat); chi2Sf(x, k) (gamma incompleta regularizada superior); ljungBox(e, h, modelDf) → {Q, df, p}. · usado en: 41, 42, 43, 44, 45, 46, 47, 48, 49, 50
- **src/lib/pasajeros.ts** — Carga tipada de pasajeros.json, series_referencias.json y series_modelos.json. Constantes: N_ENT = 132, años y meses, etiquetas de mes (E…D). · API: pasajeros: { y: number[]; inicio: '1949-01'; unidades }; entrenamiento = y.slice(0,132); prueba = y.slice(132); modelos (tipado de series_modelos.json); referencias. · usado en: 41, 42, 43, 44, 45, 46, 47, 48, 49, 50
- **src/lib/verificarSeries.ts** — Corre solo en desarrollo (import.meta.env.DEV) y compara cada función de series.ts contra series_referencias.json / series_modelos.json. Imprime en consola una tabla con la diferencia máxima, igual que la verificación del árbol contra sklearn descrita en el README. · API: verificarSeries(): void, llamado desde main.tsx en desarrollo. · usado en: 41, 42, 43, 44, 45, 46, 47, 48, 49, 50
- **SeriesChart** — Gráfica de líneas temporal en SVG con el estilo del tema (como ErrorChart de la 05). Incluye bloque rayado de prueba, bandas de pronóstico, líneas verticales de origen, rótulo directo, animación de dibujo (pathLength) e interpolación de valores al cambiar de serie. · API: { width; height; t0: number; t1: number /* índices de mes, 0 = ene-1949 */; yDomain: [n,n]; yTicks?: number[]; yFormat?: (v)=>string; lines: { id; start: number; values: (number|null)[]; tone: 'data'|'red'|'text'|'dashed'|'dotted'; label?: string; draw?: boolean }[]; bands?: { start; lo: number[]; hi: number[] }[]; mask?: { from; to; label }; vlines?: { at; label? }[]; hlines?: { y; label? }[]; xLabel?: string } · usado en: 41, 42, 43, 45, 47, 49, 50
- **Correlogram** — Barras de ACF o PACF con banda ±1.96/√n, barras fuera de la banda en rojo, curvas teóricas superpuestas con rótulo, marcas de rezagos estacionales (triángulo, no color), atenuado de rangos, rótulo de valores, contador 'k de K fuera' y crecimiento escalonado. · API: { values: number[] /* rezagos 1..K */; n?: number; band?: number; kind: 'ACF'|'PACF'; width; height; theory?: { values: number[]; label: string; tone: 'red'|'data'; opacity?: number }[]; highlight?: number[]; seasonal?: number; dim?: [number, number][]; valueLabels?: number[]; showCount?: boolean; grow?: boolean } · usado en: 41, 43, 44, 45, 46, 48, 50
- **ImpulseResponse** — Tallos o barras ψ_k ('eco de un choque') con animación escalonada e interpolación al cambiar parámetros. · API: { psi: number[]; width; height; label?: string; tone?: 'red'|'data'; highlight?: number[] } · usado en: 42, 43, 44
- **LagCloud3D** — Nube 3D (x_{t−1}, x_{t−2}, x_t) con la recta AR(1) y el plano AR(2) de mínimos cuadrados y segmentos de residuo. Pasa de la vista lateral (se ve como dispersión 2D, AR(1)) a la vista 3D (AR(2)). · API: { pts: [number,number,number][]; domain: [number,number]; labels: [string,string,string]; ar1?: { c; phi }; ar2?: { c; phi1; phi2 }; view: 'ar1'|'ar2'; residuals?: boolean }. Va dentro de Scene3D y usa CameraTween y Label3D. · usado en: 42
- **CameraTween** — Mueve la cámara y el objetivo de OrbitControls hacia una posición nueva con easing (useFrame). Requiere un ajuste mínimo en Scene3D: agregar makeDefault a <OrbitControls> para leer los controles con useThree. · API: { position: [n,n,n]; target: [n,n,n]; duration?: number /* s, por defecto 1.2 */ } · usado en: 42, 47
- **MonthYear3D** — Cintas 3D de 12 meses (eje X) × N años (eje Z, profundidad) con el valor en altura. Las alturas se interpolan al cambiar de transformación (ln → ∇₁₂ → ∇∇₁₂); las celdas null se desvanecen; hay flechas rojas de rezago 1 (a lo largo de los meses, con la vuelta de enero a diciembre) y de rezago 12 (a lo largo de los años), y Label3D en algunos años y meses. · API: { grid: (number|null)[][] /* [año][mes] */; years: number[]; yRange: [n,n]; yLabel: string; arrows?: { lag1?: boolean; lag12?: boolean; at: [year, month] }; transitionKey: string } · usado en: 47
- **LagGrid** — Esquema SVG de una rejilla mes × año con la celda t y flechas a t − 1 (con la vuelta de enero a diciembre) y a t − 12. · API: { years: number; at: [row, col]; show: { lag1: boolean; lag12: boolean } } · usado en: 47
- **LagScatter** — Dispersión 2D pequeña de x_{t−k} contra x_t con r_k impreso. Sirve también para la 39 de la sección F. · API: { x: number[]; lag: number; width; height; showR?: boolean } · usado en: 41
- **MetricTable** — Tabla HTML con números mono tabulares: el mejor de cada columna en rojo, formato media ± desv, columna destacada y notas por renglón. También sirve para la tabla ADF. · API: { columns: { key; label; format: (v)=>string; better?: 'min'|'max' }[]; rows: { name; values: Record<string, number|string|null>; sd?: Record<string, number>; note?: string }[]; highlightCol?: string; caption?: string } · usado en: 49, 50
- **AicGrid** — Rejilla 4×4 de los 16 SARIMA (renglones (p,q), columnas (P,Q)) con ΔAIC o ΔBIC respecto al mínimo, el mínimo con borde rojo, los empates Δ < 2 sombreados y el elegido marcado. · API: { cells: { p; q; P; Q; aic; bic; converged }[]; metric: 'aic'|'bic'; chosen: { p; q; P; Q }; tie?: number /* 2 */; compact?: boolean } · usado en: 48, 50
- **PValueScale** — Eje de p en escala logarítmica (1e-4 a 1) con α = 0.05, la zona 'lo que quieres' en rojo según la prueba, el marcador del p observado y el texto 'rechaza H0' o 'no rechaza H0'. · API: { p: number; alpha?: number; want: 'small'|'large'; label: string; h0: string; width } · usado en: 48, 50
- **ErrorStrip** — Barras de error por periodo que se transforman en |e|, e² y |e|/y, se promedian y muestran cómo se construyen MAE, RMSE y MAPE, destacando los errores grandes. · API: { actual: number[]; forecast: number[]; labels: string[]; mode: 'error'|'abs'|'sq'|'pct'; width; height; showResult?: boolean } · usado en: 48
- **WalkForward** — Renglones de entrenamiento y prueba sobre el eje temporal para la validación de origen móvil; el pliegue activo se resalta y se puede seleccionar. Pensado para compartirse con la 30. · API: { folds: { trainEnd: number; testEnd: number; label: string }[]; t0; t1; active?: number; onSelect?: (i)=>void; width; height } · usado en: 50

## Datos nuevos propuestos

- **src/data/pasajeros.json** — { fuente: 'Box, Jenkins y Reinsel, Serie G (R datasets::AirPassengers)', unidades: 'miles de pasajeros', inicio: '1949-01', y: [144 enteros], n_entrenamiento: 132 }. Pesa menos de 2 KB. · script: scripts/exportar_series.py. Descarga con statsmodels.datasets.get_rdataset('AirPassengers','datasets', cache=scripts/cache), así que solo necesita internet la primera vez. Exige n = 144, suma 40363, y[0] = 112, y[-1] = 432, mínimo 104 y máximo 622; si algo no coincide, se detiene. · dependencias: statsmodels (agregar a .venv con pip install statsmodels, ≥ 0.14; confirmar que hay rueda para cp314), pandas y numpy (ya instalados).
- **src/data/series_referencias.json** — Valores de referencia para verificar el TS, todos con 1949–1959. (1) transformaciones {nivel, log, dlog, d12log, dd12log}: serie, acf (statsmodels acf, nlags=36, adjusted=False, fft=False), pacf (method='ldb'), ljungbox {lags: [12,24], Q, p}. (2) arma_teoricas: para cada modelo de esquema (AR(1) φ ∈ {0.5, 0.9, −0.6, 0.6, 0.7}; MA(1) θ ∈ {0.8, −0.6, 0.6, 0.5}; ARMA(1,1) (0.7, 0.5) y (0.7, 0.4); AR(2) (0.5, 0.3)): arma2ma(21), acf(21), pacf(21) de ArmaProcess. (3) autoreg: AR(1) y AR(2) sobre d12log con AutoReg(trend='c'), params y predict(120..131). (4) media_movil_2x12 = seasonal_decompose(...).trend. (5) descomposicion_mult {tendencia, estacional, residuo}. (6) chi2_sf: 20 pares (x, gl) con scipy.stats.chi2.sf. (7) versiones de statsmodels, scipy y numpy. · script: scripts/exportar_series.py (el mismo que escribe pasajeros.json). · dependencias: statsmodels, scipy, numpy y pandas.
- **src/data/series_modelos.json** — Modelos que no se pueden calcular exactos en el navegador; todo se ajusta solo con 1949–1959 salvo donde se indica. Claves: (1) adf: lista de 5 {serie, estadistico, p, lags, nobs, criticos} con adfuller(regression='c', autolag='AIC'). (2) ma1 {theta, se, sigma2, fitted}: ARIMA(dd12log, (0,0,1), trend='n'). (3) arma_crecimiento: [{modelo, ar, ma, const, sigma2, aic, convergio}] para AR(1), MA(1), ARMA(1,1) y AR(2) sobre d12log, con trend='c'. (4) arima {grid: [{orden, aic, convergio, modulo_min_raiz_ma}], elegido: {orden, params, pronostico_log[12], ic95_log[12][2], regla}}: ARIMA(ln y, (p,1,q), trend='t'), p, q ≤ 2. (5) sarima_grid: 16 × {orden, estacional, aic, bic, llf, k, nobs, nobs_effective, convergio}. (6) elegido {orden, estacional, regla, delta_aic, params, se, sigma2, pronostico_log[12], ic95_log[12][2], residuos (resid[13:], 119 valores), ljungbox {lags: [12,24], model_df, Q, p}, metricas_ref {mae, rmse, mape}}. (7) walk_forward: 3 × {origen, prueba, sarima {orden, estacional, pronostico_log, residuos}, arima {orden, pronostico_log}, metricas_ref {ingenuo, arima, sarima}}. (8) comprobaciones_libro: ADF de la serie completa y aerolínea de 1949–1960, solo para registrar la configuración. (9) versiones. · script: scripts/modelos_series.py (nuevo). SARIMAX(..., trend='n').fit(disp=False) con enforce_stationarity y enforce_invertibility por defecto; ARIMA de statsmodels.tsa.arima.model; acorr_ljungbox; métricas de referencia con sklearn.metrics. Regla del elegido: aerolínea salvo que otro modelo tenga una AIC menor por más de 2. Regla del ARIMA: si la raíz MA mínima es menor que 1.01, se toma el siguiente por AIC. Exige que ningún ajuste use datos posteriores a su origen. Tiempo estimado: menos de 1 min (≈90 ajustes). · dependencias: statsmodels (nuevo en .venv), scikit-learn 1.9.1 (métricas), numpy y pandas. Lee pasajeros.json o el CSV en caché. No necesita hmmlearn.
