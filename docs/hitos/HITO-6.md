# Hito 6 — H. Modelos ocultos de Markov (diapositivas 51–59, 61 y ajustes de la 60)

**Estado:** En construcción · *(Borrador → Aprobado el 2026-10-17 → En construcción → Cerrado el AAAA-MM-DD)*
**Última actualización:** 2026-10-17 (construido; falta la revisión del usuario)

## 1. Alcance

- **Entran 10 diapositivas nuevas y una existente:** 51 causas ocultas, 52 cadena de Markov, 53 estados ocultos, 54
  λ = (π, A, B), 55 las tres preguntas, 56 fuerza bruta, 57 Forward, 58 la tabla α a mano, 59 Viterbi, 61 del pizarrón a
  la práctica, y los ajustes de la 60 (Forward y Viterbi: suma contra máximo, ya construida).
- **Clase 3** (41–64), después de los modelos de series. El puente: en AR, ARIMA y SARIMA todo lo que se modela se mide; aquí
  lo que se mide es el efecto de algo que no se ve.
- **Caso:** el clima oculto, un ejemplo de libro (el de Wikipedia, "Hidden Markov model"): π = (0.6, 0.4),
  A = [[0.7, 0.3], [0.4, 0.6]], B = [[0.1, 0.4, 0.5], [0.6, 0.3, 0.1]], y lo que cuenta el amigo en tres días: caminar,
  comprar, limpiar. En la 61, además, días simulados con ese λ (sección 4).
- **Qué deben saber ya al llegar:** probabilidad en palabras (3, 26), qué es una serie y por qué el orden importa (29–31),
  AR(p) (42), validar con datos que el modelo no vio y sin barajar el orden (30), línea base (49). Probabilidad condicional,
  regla de Bayes, probabilidad total, verosimilitud, programación dinámica y logaritmos **no** se dan por sabidos: van como
  `Recap` donde se usan.
- **Requisito central de este hito (usuario, 2026-10-17): minimalismo.** Al revisar la 48 se vio sobrecargada: tres columnas
  a la vez, varias fórmulas y notas, una nota al pie diminuta encimada sobre la ayuda de navegación, la escala de p con
  "0.05" encimado sobre "0.1" y la frase final saliéndose del lienzo por abajo. Aquí cada clic lleva **una sola idea: a lo
  más una gráfica principal (o dos hermanas), un bloque de texto de 25–40 palabras y dos fórmulas**; nunca tres paneles a la
  vez; nada fuera del cuerpo útil (≈ 1696 × 640 px) ni encimado; nada de notas al pie. Lo que se quita de la pantalla va a
  "De palabra" de cada diapositiva (sección 6). La regla 9 de `CLAUDE.md` ya lo dice así.
- **Qué deja listo para después:** `TablasLambda` y `TablaAMano` para la 62 (receta) y R4 (Forward sin llegar a cero), que
  reutiliza la gráfica de la 61; `hmm_clima.json` para R4.
- **Fuera a propósito:** el algoritmo Backward y el suavizado (se nombran solo en la respuesta preparada de la 59 y en el
  ciclo E–M de la 61), las ecuaciones de reestimación de Baum-Welch, HMM con emisiones continuas, selección del número de
  estados, el álgebra del escalado (es de R4, hito 7).

## 2. Lo que se revisó para planear

**Leído:** `CLAUDE.md`, `docs/HANDOFF.md`, `docs/hitos/PLANTILLA.md`, `docs/hitos/HITO-5.md` y `HITO-LEGIBILIDAD.md`
(medidor y tamaños), la sección H y R4 de `docs/PLAN-DIAPOSITIVAS.md`, la especificación completa
`docs/especificaciones/H-hmm-51-61.md`, y el código que se reutiliza: `lib/hmm.ts`, `slides/60-forward-vs-viterbi.tsx`,
`deck/tipografia.ts`, `scripts/legibilidad.js` y las APIs de `Lineas`, `Barras`, `MetricTable`, `TablaCruda`, `Recap` y
`Piezas`.

**Comprobado antes de escribir** (un script temporal de Python fuera del repo, ≈ 55 s; no se tocó `src/`):

- **`hmmlearn` instala en el `.venv`.** No hay rueda para Python 3.14: pip la compiló sola (MSVC disponible) y quedó
  `hmmlearn 0.3.3` con numpy 2.5.3, scipy 1.18.1 y scikit-learn 1.9.1. `CategoricalHMM` funciona. No hace falta otro
  entorno.
- **Todos los números del ejemplo de tres días se reproducen** con numpy y con hmmlearn (fijado al λ, `init_params=""`,
  `params=""`):

  | Cantidad | Valor | Coincide con la especificación |
  |---|---|---|
  | α₁, α₂, α₃ | (0.06, 0.24) · (0.0552, 0.0486) · (0.02904, 0.004572) | sí |
  | Predicho antes de corregir | (0.138, 0.162) · (0.05808, 0.04572) | sí |
  | P(O \| λ) · ln P(O \| λ) | 0.033612 · −3.392872 (hmmlearn `score` igual) | sí |
  | c_t = P(o_t \| lo anterior) | 0.30 · 0.346 · 0.323815; su producto da 0.033612 | sí |
  | Creencia filtrada (α normalizado) | (0.20, 0.80) · (0.532, 0.468) · (0.864, 0.136) | sí |
  | δ · ψ | (0.06, 0.24) · (0.0384, 0.0432) · (0.01344, 0.002592); ψ₂ = (S, S), ψ₃ = (L, S) | sí |
  | Viterbi | S → L → L, P* = 0.01344, ln P* = −4.309520 (hmmlearn `decode`: −4.309520, [1, 0, 0]) | sí |
  | Los 8 caminos | SLL 0.01344 (39.99 %) · SSL 0.00864 · LLL 0.00588 · SSS 0.002592 · SLS 0.001152 · LSL 0.00108 · LLS 0.000504 · LSS 0.000324; suman P(O) (diferencia 7e-18) | sí |
  | LLL | el más probable sin ver nada (P(Q) = 0.294) y explica mal lo visto (P(O \| Q) = 0.02) | sí |
  | Casilla más alta de cada columna de δ | S → S → L, P = 0.00864 | sí, con un matiz (hallazgo 2) |
  | Bayes del primer día | P(S \| caminar) = 0.24 / 0.30 = 0.80 | sí |
  | Rachas | 1/(1 − 0.7) = 3.33 y 1/(1 − 0.6) = 2.5 días; medidas en 10 000 días: 3.305 y 2.532 | sí |
  | Distribución estacionaria | (4/7, 3/7) = (0.571, 0.429) | sí |
  | Parámetros libres | 1 + 2 + 4 = 7 | sí |
  | Multiplicaciones | Forward 14 contra fuerza bruta 40 (T = 3); 596 contra 2.52·10³² (T = 100) | sí |
  | 2¹⁰⁰ | 1 267 650 600 228 229 401 496 703 205 376; a 10⁹ caminos por segundo, 4.0·10¹³ años | sí |

- **Simulación de la 61** (`np.random.default_rng(42)`: 10 000 días de entrenamiento y después 1 000 de prueba, como
  propone la especificación). Baum-Welch con hmmlearn, 10 arranques (`random_state` 0–9), `tol = 1e-6`, hasta 1 000
  iteraciones, con un monitor que guarda la historia completa (más simple que el ciclo de `n_iter = 1` que propone la
  especificación). Tarda 28 s el clima del libro y 18 s el persistente. **En los 20 ajustes la verosimilitud nunca bajó.**

  | Escenario | Arranques que llegan al mejor (a < 1 de distancia) | Error máximo de λ aprendido | ln P por día en prueba: λ real / aprendido / sin memoria | % de días con el clima correcto: Viterbi / solo la actividad / el más común | Día en que Forward sin escalar da 0 |
  |---|---|---|---|---|---|
  | Clima del libro | 5 de 10 (los otros 5 se quedan 60 abajo); 6 de 10 llegan a 1 000 iteraciones sin cumplir la tolerancia | A 0.072, **B 0.112** | −1.0925 / **−1.0977** / −1.0968 | 76.2 / 75.6 / 56.6 | 681 |
  | Clima persistente (a_ii = 0.95) | 5 de 10 (convergen en 27–73 iteraciones; los otros se quedan 858 abajo) | 0.006 | −1.0071 / −1.0098 / −1.1040 | 91.7 / 77.0 / 42.7 | 730 |

- **Cuatro cosas no salieron como las cuenta la especificación** y cambian el plan:

  | # | Dónde | La especificación dice | Lo que salió | Qué se hace |
  |---|---|---|---|---|
  | 1 | 61 | El HMM aprendido "explica mejor datos nuevos" que el modelo sin memoria; λ se recupera "de forma aproximada" | Con el clima del libro, **el λ aprendido queda peor que el modelo sin memoria en prueba** (−1.0977 contra −1.0968 por día), aunque en entrenamiento explica *mejor* que el λ real (−10 918.8 contra −10 925.8). B se recupera mal: b_L(caminar) sale 0.003 (real 0.1) y b_S(limpiar) 0.005 (real 0.1). Viterbi le gana a "solo la actividad" por 0.6 puntos. Con el clima persistente todo funciona (error 0.006, Viterbi 91.7 % contra 77.0 %) | El clima del libro cambia casi al azar (su A está cerca de no tener memoria): con él, aprender cuesta y el contexto aporta poco. Se enseña así, y el persistente como contraste (decisión 4) |
  | 2 | 59 | Cierre: "¿y si tomo el máximo de cada día?" da S → S → L, peor | Cierto si "máximo de cada día" es la casilla más alta de cada columna de δ. Pero el **clima más probable de cada día** con toda la secuencia (suavizado, Forward-Backward) da (0.77 S, 0.62 L, 0.86 L) → **S → L → L, igual que Viterbi**; y con lo visto hasta cada día (α normalizado) también. La pregunta, dicha así, lleva a una respuesta falsa | La pregunta se formula sobre la tabla: "¿y si sigo la casilla más alta de cada columna?". La diferencia con el suavizado va a la respuesta preparada (decisión 6) |
  | 3 | 61 | Se muestra el λ aprendido completo | π̂ sale (0, 1) en los dos escenarios: con una sola secuencia, π se estima con un único día (el primero). No es un error de la librería | En pantalla solo A y B; π̂ y su porqué, de palabra |
  | 4 | 61, R4 | El Forward sin escalar se hace 0 "en el día 686" (y R4 del plan maestro dice ≈ 686) | Depende de la secuencia: con la de prueba de semilla 42, el día 681 (clima del libro) y 730 (persistente) | Se calcula en vivo y se lee; R4 se corrige al construirla |

**Problemas que atraviesan toda la especificación** (se corrigen en todas las diapositivas):

- **Densidad.** Casi todos sus pasos ponen a la vez definición, fórmula, `Recap`, diagrama y tabla, o tres columnas (51,
  52, 54, 55, 57, 61). Choca con el requisito de minimalismo: cada paso de la especificación se parte en 2 o 3 clics
  (sección 6). Pasa de 50 a 82 clics.
- **Tamaños.** Pide texto de 15, 20, 22 y 24 px, "mono pequeño" y "nota gris". Todo sube a la regla 9: lectura ≥ 26,
  rótulos ≥ 20, fórmulas ≥ 28, nada < 18.
- **Notas al pie y referencias en pantalla** (Rabiner 1989, Jurafsky & Martin, Durbin et al., Eddy, Hamilton, en mono de
  15 px). Salen de la pantalla: van a la 63 (referencias) y a "De palabra".
- **"Versión corta" y "recortable"** (56 y 58). No aplica (regla 5); decisión 2.
- **Interacciones que no existen en un salón:** el hover sobre la matriz A (52). Todo se controla con clic, botones o ↑ ↓.
- **Verificación en el navegador** (`hmm.check.ts` llamado desde `main.tsx`). Va en `scripts/verificar.ts`, como siempre.
- **Script y nombres.** `scripts/hmm_clima.py` pasa a `scripts/exportar_hito6.py`; las funciones nuevas de `lib/hmm.ts` van
  en español (sección 5).
- **Demasiadas piezas nuevas:** propone 13; quedan 7 (sección 5).
- **Regla 8.** No dice qué se enseña crudo (decisión 1).

| Diapositiva | Se toma de la especificación | Se corrige o se descarta, y por qué |
|---|---|---|
| 51 | AR contra modelo oculto; observada / oculta; la historia del amigo; las dos preguntas | Las definiciones y la tabla de aplicaciones van en clics propios; sin referencias en pantalla. 4 → 6 clics |
| 52 | Propiedad de Markov con la flecha larga tachada; diagrama y matriz A; P(L, L, S) = 0.126 con la ficha; rachas y 1/(1 − a_ii) | El `Recap` de tres fórmulas se reduce a dos y va solo en el primer clic. Sin hover. Las sumas por columna (1.1, 0.9) y la estacionaria, de palabra. 4 → 7 clics |
| 53 | Cortina sobre los estados; emisiones con grosor; la semana generada que se vuelve "?"; Bayes de un día con dos barras | Cada uno en su clic. 4 → 8 clics |
| 54 | Tres tablas con nombre en palabras; símbolos que se vuelven números; los dos supuestos con sus flechas; la conjunta de S, L, L | Un supuesto por clic (la especificación pone dos redes y dos fórmulas juntas). La homogeneidad y la "simplificación honesta", de palabra. 4 → 7 clics |
| 55 | Los tres problemas con su pregunta, su algoritmo y dónde se resuelve | **No en tres columnas:** una lista de tres renglones que se abren de uno en uno; el renglón activo con su fórmula y los demás reducidos a una línea. 3 → 5 clics |
| 56 | Árbol de 8 caminos; barras que se apilan en P(O); SLL con el 40 %; LLL; crecimiento 2ᵀ | Cada hoja lleva solo P(O, Q) (no las tres columnas). Gráfica de crecimiento con `Lineas`. 4 → 8 clics |
| 57 | α en palabras; nodo del trellis; predecir y corregir con barras que viajan; terminación | Sin las tres fórmulas juntas; la creencia normalizada y c_t, de palabra. 5 → 8 clics |
| 58 | Tabla de 2 × 3 que se llena por columna; 14 contra 40 multiplicaciones | Plantilla con un solo ejemplo simbólico, no seis. 5 → 6 clics |
| 59 | δ, ψ, candidatos con perdedor tachado, regreso por las flechas, S → L → L | La pregunta del cierre (hallazgo 2). 5 → 7 clics |
| 60 | λ compartido, "Caso · Clima" desde el clic 1, costo O(N²T) contra O(T·Nᵀ), números con `fmtP` | Se descarta el "ajuste 2" (mini barras junto a la conclusión): sería una tercera gráfica. Tamaños de la regla 9. 6 clics |
| 61 | Baum-Welch con 10 arranques; λ real contra aprendido; underflow; comprobación con hmmlearn; evaluación contra líneas base; aplicaciones | El dato crudo antes (decisión 1). El hallazgo 1 cambia la evaluación (decisión 4). Un tema por clic. 6 → 14 clics (decisión 5) |

## 3. Decisiones que necesita el usuario

> **Respondidas el 2026-10-17:** el usuario pidió "decide lo que sea más recomendable y empieza": quedan las opciones
> recomendadas (A) de las siete decisiones y los tres avisos.

| # | Decisión | Opciones | Recomendación y por qué |
|---|---|---|---|
| 1 | **Qué se enseña como dato crudo (regla 8)**, si el clima es un modelo de libro | A. En la 61, antes de aprender λ: `TablaCruda` con las primeras 5 filas del "diario del amigo" simulado (`dia`, `actividad` y `clima`, este último marcado "solo existe porque lo simulamos: no entra a aprender"), diciendo de dónde sale, qué es cada columna y qué se quiere saber; en el clic siguiente, qué se le cambia. En la 51, los tres días del relato se cuentan como historia · B. Además, una `TablaCruda` de 3 filas en la 51 · C. Cambiar a datos reales (lluvia diaria de una ciudad, por ejemplo) | **A.** El único dataset de verdad de la sección es el diario simulado de la 61; los tres días de la 51 son el relato, y ponerlos en tabla repite la historia. Primeras 5 filas con semilla 42: (S, caminar), (S, comprar), (L, limpiar), (S, comprar), (L, comprar). C cambiaría el caso y los números de libro que el público puede seguir a mano |
| 2 | **¿Se quedan la 56 y la tabla de la 58?** (el plan maestro y la especificación las marcan recortables) | A. Se quedan las dos completas · B. Se recorta la 58 (la 60 llena la tabla) · C. Se recortan las dos | **A.** La regla 5 dice sin recortes. La 56 es la única que muestra por qué hace falta Forward (2ᵀ caminos) y que P(O) es una suma de historias; la 58 es la cuenta que el público tendría que hacer en un examen, y con el minimalismo ya no repite la 57 (que enseña el mecanismo con barras, no la aritmética) |
| 3 | **Cómo se reparten las piezas** | A. 7 nuevas con nombre en español (`RedTemporal`, `DiagramaClima`, `TiraDias`, `TablasLambda`, `ArbolCaminos`, `BarrasForward`, `TablaAMano`); las curvas de EM, el underflow y el crecimiento con `Lineas`; las barras de aciertos con `Barras`; la comprobación con `MetricTable`; el dato crudo con `TablaCruda` · B. Las 13 de la especificación con sus nombres en inglés | **A.** `Lineas` ya hace todo lo que piden `EMCurves`, `UnderflowChart` y `GrowthChart` (líneas, puntos, líneas horizontales rotuladas, marcas); `Barras` hace `HBars`. Las 7 nuevas no tienen equivalente. Detalle en la sección 5 |
| 4 | **Qué escenario se usa para aprender y evaluar en la 61** (hallazgo 1) | A. Los dos: el clima del libro primero, con lo que sale (aprender cuesta y el contexto aporta poco: el aprendido no le gana al modelo sin memoria), y después un clima persistente (a_ii = 0.95, simulado y rotulado como otro clima) donde Viterbi pasa de 77.0 % a 91.7 % · B. Solo el persistente · C. Solo el del libro | **A.** Es el dato y deja la lección completa: un HMM sirve cuando los estados duran. B desconecta la 61 del caso de todo el bloque; C termina la sección con "no sirvió" sin explicar cuándo sí. Cuesta dos clics más |
| 5 | **La 61 tiene 14 clics** (cinco temas: dato crudo, aprender λ, underflow, comprobar, evaluar, más aplicaciones) | A. Una sola diapositiva con un rótulo por tema (01 Aprender · 02 Decimales · 03 Comprobar · 04 Evaluar) · B. Partirla en dos (61 aprender y comprobar; 62 evaluar y aplicaciones), lo que recorre el cierre a 63–65 | **A.** Los clics no están limitados (regla 5) y cada uno queda ligero. B obliga a renumerar el plan maestro, `CLAUDE.md` y el reparto por clases. Si al construirla se ve larga, se parte entonces |
| 6 | **La pregunta del cierre de la 59** (hallazgo 2) | A. "¿Y si sigo la casilla más alta de cada columna?" → S → S → L (0.00864), peor que 0.01344; la distinción con "el clima más probable de cada día" va preparada · B. La de la especificación, "¿y si tomo el máximo de cada día?" · C. Quitar el cierre | **A.** Mantiene la lección (hay que guardar de dónde vino cada máximo) sin una afirmación que el suavizado contradice: en este ejemplo el clima más probable de cada día sí es S → L → L |
| 7 | **Quién ajusta la 60** (también está en la tanda 4 de `HITO-LEGIBILIDAD.md`) | A. Este hito: λ compartido, `fmtP`, "Caso · Clima", costo y tamaños de la regla 9, todo junto; la tanda 4 de legibilidad la salta · B. Este hito solo el contenido; los tamaños, la tanda 4 | **A.** Un solo cambio al archivo, revisado una vez con el resto de la sección. Hay que avisarle a la sesión de legibilidad (bitácora de los dos hitos) |

Además, tres avisos que no necesitan respuesta salvo que no estés de acuerdo:

- **Clics:** 51: 6 · 52: 7 · 53: 8 · 54: 7 · 55: 5 · 56: 8 · 57: 8 · 58: 6 · 59: 7 · 60: 6 · 61: 14 (**82**; la
  especificación suma 50). Con el minimalismo, la sección dura unos 18 min de explicación corrida (la especificación
  calculaba 14); la clase 3 sigue cabiendo en hora y media.
- **Sin 3D en la sección**, como propone la especificación: los objetos son discretos (2 estados × 3 días) y un trellis o un
  grafo plano los muestran sin pérdida.
- **Color:** Lluvioso = cuadro relleno gris claro (`--data`) con "L" oscuro; Soleado = cuadro solo con borde y "S" claro;
  rojo = lo que se está calculando, el ganador o la prueba. Sin pictogramas de sol o lluvia (se leerían como emojis).

## 4. Datos

- **Dataset crudo (regla 8).** El "diario del amigo": 10 000 días simulados con el λ del libro (semilla 42) para aprender y
  los 1 000 siguientes, aparte, para probar (sin barajar, como en la 30). Llega como tres columnas: `dia`, `actividad`
  (caminar, comprar, limpiar) y `clima` (Lluvioso, Soleado). Se enseña en la 61, clics 1 y 2 (decisión 1). **Qué se le
  cambia:** `actividad` pasa a 0, 1, 2; `clima` se aparta (Baum-Welch no lo ve; solo sirve para medir aciertos, y eso solo
  se puede porque el dato es simulado). El escenario persistente se simula igual con A' = [[0.95, 0.05], [0.05, 0.95]].
- **Dependencias de Python:** `hmmlearn 0.3.3`, **ya instalado y probado** en el `.venv` (Python 3.14.2; pip lo compiló).
  En la tanda 0 se agrega al `README.md`, junto a la línea de `statsmodels`.
- **Script:** `scripts/exportar_hito6.py` (reutiliza `guardar` y la carpeta de datos de los scripts anteriores). Semilla 42.
  Tarda ≈ 1 min (Baum-Welch: 28 s + 18 s). Registro en `scripts/cache/hito6.log`. Protocolo:
  1. Escribe λ y calcula el ejemplo de tres días con numpy (Forward, Viterbi, los 8 caminos, suavizado).
  2. `CategoricalHMM(n_components=2, n_features=3, init_params="", params="")` fijado al λ: `score` y `decode` del ejemplo y
     de las dos secuencias de prueba.
  3. Por escenario: simula 10 000 + 1 000 días (q₁ ~ π, q_t ~ A, o_t ~ B); en prueba, aciertos de Viterbi, de "solo la
     actividad" (argmaxⱼ bⱼ(o)) y de "el más común en entrenamiento"; log-verosimilitud del modelo sin memoria (frecuencias
     de entrenamiento); día en que Forward sin escalar da 0.
  4. Baum-Welch: 10 arranques (`random_state` 0–9, `init_params="ste"`, `tol=1e-6`, `n_iter=1000`) con un
     `ConvergenceMonitor` que guarda la historia completa. `assert`: ninguna historia baja más de 1e-8. Elige el mejor,
     empareja estados con el λ real (la permutación que minimiza Σ|B̂ − B|) y lo evalúa en prueba.
  5. Una implementación propia en numpy de Baum-Welch, desde el mismo λ inicial del mejor arranque, debe llegar al mismo
     valor final (|Δ| < 1e-6); si no, se anota en la bitácora.
  6. Si un `assert` falla no se arregla en silencio: se anota en la bitácora.

| JSON | Qué trae | Lo usan |
|---|---|---|
| `hmm_clima.json` | `versiones` · `lambda` (π, A, B, nombres) · `crudo` (las primeras 5 filas del diario, tal como llegan) · por escenario (`base`, `persistente`): `A`, `prueba` (estados y actividades de los 1 000 días), `entrenamiento` (frecuencias de cada actividad, clima más común, ln P con el λ real), `baum_welch` (10 historias de ln P por día **submuestreadas a ≤ 150 puntos** y redondeadas a 6 decimales, cuáles llegan al mejor, permutación, A y B aprendidos, π̂), `prueba_ref` (ln P por día de λ real, aprendido y sin memoria; aciertos) | 61 (y R4) |
| `referencias_hito6.json` | Solo para `verificar.ts`: lo del ejemplo (α, δ, ψ, caminos, suavizado), `score` y `decode` de hmmlearn en el ejemplo y en las dos pruebas, día del underflow, y el ln P de entrenamiento del λ aprendido | `scripts/verificar.ts` |

- **Vivo, esquema o JSON:**
  - **Vivo** (`lib/hmm.ts`, verificado): todo el ejemplo de tres días (51–60), las sumas de A y B, P(L, L, S), Bayes del
    primer día, rachas teóricas, los 8 caminos, el crecimiento 2ᵀ (con `BigInt`), los conteos de multiplicaciones; en la
    61, Forward escalado y Viterbi sobre las secuencias de prueba del JSON, el underflow (Forward sin escalar contra
    escalado, día por día) y los aciertos.
  - **Esquema** (rotulado "Esquema · simulación"): las tiras de 60 días (52) y de 7 días (53), simuladas en el navegador
    con `mulberry32` y botón "otra simulación"; la medida de rachas en 10 000 días simulados en vivo.
  - **JSON:** Baum-Welch (historias, λ aprendido), el dato crudo y las referencias de hmmlearn.
- **Verificación** (`scripts/verificar.ts`, comprobaciones nuevas):
  - Forward, Viterbi, `enumerarCaminos`, `pasosForward` del ejemplo contra numpy (|Δ| < 1e-15); `forwardEscalado` y
    `viterbiLog` contra `score` y `decode` de hmmlearn en el ejemplo y en las dos secuencias de prueba (|Δ| < 1e-9 y
    caminos idénticos).
  - `forwardEscalado` con el λ aprendido sobre el entrenamiento contra el `score` final de hmmlearn (|Δ| < 1e-6).
  - Día del underflow contra numpy (±1).
  - `simular` (TypeScript, `mulberry32`) con 10 000 días: frecuencias de transición y emisión a ±0.02 de A y B, y rachas a
    ±0.15 de 1/(1 − a_ii).
  - `conteoMultiplicaciones`: 14 y 40 con T = 3; 596 y 199·2¹⁰⁰ con T = 100 (exacto, `BigInt`).
  - Que la suma de los 8 caminos coincida con Σ α₃ y que el suavizado dé S → L → L.
- **Números "esperados" que hay que recalcular al construir:** todos los de la 61 (salen del JSON; las frases se generan de
  los datos, no se fijan). Los del ejemplo ya están comprobados (sección 2).

## 5. Piezas

| Pieza | Nueva o existente | Para qué | La usan |
|---|---|---|---|
| `lib/hmm.ts` (ampliar) | existente | Además de `forward` y `viterbi`: `probCadena(m, q)`, `probConjunta(m, q, obs)` → `{pQ, pOdadoQ, conjunta, factores}`, `enumerarCaminos(m, obs)`, `pasosForward(m, obs)` → `{alpha, predicho, c}`, `forwardEscalado(m, obs)` → `{logP, logPrefijo}`, `viterbiLog(m, obs)`, `suavizado(m, obs)`, `casillaMasAlta(delta)`, `simular(m, T, rand)`, `conteoMultiplicaciones(N, T)` → `{forward, bruta: bigint}`, `estacionaria(A)` | 52–61 |
| `lib/clima.ts` | nueva, pura | `CLIMA` (el λ), `CLIMA_PERSISTENTE`, `OBS_EJEMPLO = [0, 1, 2]`, `CORTO = ["L", "S"]`, `fmtP(v)` (6 cifras sin ruido: 0.13799999999999998 → 0.138) y `fmtEntero(n: bigint)` con espacios finos | 51–61 |
| `lib/climaSimulado.ts` | nueva | Lee `hmm_clima.json` y lo tipa (como `lib/pasajeros.ts`) | 61 |
| `RedTemporal` | nueva (la `GraphicalModel` de la especificación) | Red desplegada en el tiempo: `{ T, variante: "ar" \| "hmm" \| "cadena", resaltar?: "markov" \| "emision", prohibidas?, cortina?, rotuloOculto?, rotuloVisto? }` | 51, 52, 53, 54 |
| `DiagramaClima` | nueva | Estados L y S con autolazos y cruces (A), entrada π y emisiones (B), grosor = probabilidad, ficha que recorre un camino por pasos: `{ modelo, mostrar: {pi?, A?, B?}, camino?, paso?, resaltar? }` | 52, 53, 54 |
| `TiraDias` | nueva | Franja de días (clima arriba, actividad abajo), con `ocultarEstados` y `visibles` | 52, 53 |
| `TablasLambda` | nueva | π, A y B simbólicas o con números, sumas por fila, una fila resaltada y comparación entre dos modelos | 52, 53, 54, 61 |
| `ArbolCaminos` | nueva (la `PathTree` de la especificación) | Árbol de los Nᵀ caminos con la barra de P(O, Q) de cada hoja; `etapa: "esquema" \| "arbol" \| "barras" \| "suma" \| "maximo" \| "apriori"` | 56 |
| `BarrasForward` | nueva (la `ForwardBars`) | Predecir (trozos que viajan según A) y corregir (se encogen por B), un día por etapa; al retroceder muestra la etapa terminada, sin animar | 57 |
| `TablaAMano` | nueva | Tabla de pizarrón estados × días con la aritmética de cada celda; en Viterbi, candidatos con el perdedor tachado, flechas ψ, el regreso y la casilla más alta por columna | 58, 59 (y 62, R4) |
| `Lineas` | existente | Curvas de EM (61), underflow con los umbrales como `lineasH` (61, R4), crecimiento 2ᵀ contra N²T (56) | 56, 61 |
| `Barras` | existente | Aciertos de Viterbi contra las líneas base (rojo el modelo) | 61 |
| `MetricTable` | existente | Navegador contra hmmlearn (con `textos` para el camino) | 61 |
| `TablaCruda` | existente | El diario crudo (`quitadas` para `clima`) | 61 |
| `Recap`, `Def`, `Dato`, `Reveal`, `TeX`, `Chips` | existentes | Fundamentos, definiciones, cifras grandes, botones | todas |
| Esquemas locales | en el archivo de la diapositiva | Nodo del trellis (57), rutas del principio de optimalidad (59), ciclo E–M (61) | 57, 59, 61 |

Se descartan de la especificación: `EMCurves`, `UnderflowChart`, `GrowthChart` (los hace `Lineas`), `HBars` (`Barras`),
`PathBars` (era para el ajuste de la 60 que se descarta), `hmm.check.ts` (`verificar.ts`) y `src/lib/fmt.ts` (`fmtP` vive
en `lib/clima.ts`). La 60 conserva su trellis local: cambiarlo por `TablaAMano` no aporta.

**Convenciones que aplican en todas:** sección `["U8 · Datos secuenciales", "H. HMM"]`, como la 60; `caso="Clima"` desde el
primer clic de caso; tamaños desde `deck/tipografia.ts` (`TIPO`, `R`, `anchoMono`); `className="label natural"` cuando hay
letras griegas (π, α, δ, ψ, λ); todo por clic, sin relojes ni barridos automáticos.

## 6. Diapositiva por diapositiva

Formato: por clic, **lo que hay en pantalla** (gráfica · texto con sus palabras aproximadas · fórmulas). Si un clic no
dice gráfica, la del clic anterior sigue igual. "De palabra" es lo que se dice sin escribirlo y las respuestas preparadas.

### 51 · Causas ocultas — 6 clics

| Clic | Gráfica | Texto (≈ palabras) | Fórmulas |
|---|---|---|---|
| 0 | `RedTemporal` "ar": cuatro cuadros y₁…y₄ con flechas, rotulado "Esquema" | "En una serie modelamos lo que medimos: el valor de hoy depende de los anteriores." (15) | — |
| 1 | La misma red gana una fila de círculos "?" arriba con flechas hacia abajo | "A veces lo que medimos es solo el efecto de algo que no vemos." (14) | — |
| 2 | igual | `Def` observada / oculta: "Observada: lo que se mide. Oculta: lo que la produce y no se mide. Objetivo: deducir lo oculto a partir de lo observado." (25) | — |
| 3 | La red sale; tres renglones con filete: audio → palabras · palabras → categoría gramatical · ADN → tramos que son genes | Solo los tres renglones (15) | — |
| 4 | **Caso · Clima.** Red de tres días: abajo caminar, comprar, limpiar; arriba "? ? ?" | "Tu amigo vive en otra ciudad. Cada día te cuenta qué hizo, pero nunca qué clima hubo. ¿Puedes deducirlo?" (20) | — |
| 5 | igual | Conclusión: "Dos preguntas: ¿qué tan probable es lo que me contó? y ¿qué clima lo explica mejor?" (16) | — |

- **Datos:** ninguno (relato). La secuencia es `OBS_EJEMPLO`.
- **De palabra:** las referencias de las aplicaciones (Rabiner 1989 para voz, en pasado: hoy dominan las redes neuronales;
  Jurafsky & Martin para etiquetado; Durbin et al. 1998 para genes). Que para responder hace falta saber cómo cambia el clima
  (52) y cómo influye en lo que hace el amigo (53).
- **Riesgos:** flechas del esquema de 2 px como mínimo y en `--text-2`, para que se vean en el cañón.

### 52 · Cadena de Markov — 7 clics

| Clic | Gráfica | Texto (≈ palabras) | Fórmulas |
|---|---|---|---|
| 0 | — | `Recap` probabilidad condicional: "P(B \| A): la probabilidad de B sabiendo que pasó A." (12) | P(B \| A) = P(A ∩ B) / P(A) · P(A ∩ B) = P(A) P(B \| A) |
| 1 | `RedTemporal` "cadena": q₁ → … → q₅ y una flecha larga q₁ → q₄ punteada y tachada | "Propiedad de Markov: para saber mañana basta con saber hoy. Como un juego de mesa: la siguiente casilla depende de dónde estás y del dado, no de cómo llegaste." (32) | P(q_{t+1} \| q_t, …, q₁) = P(q_{t+1} \| q_t) |
| 2 | **Caso · Clima.** `DiagramaClima` solo A: dos estados, autolazos 0.7 y 0.6, cruces 0.3 y 0.4, grosor por probabilidad | "Si hoy llueve, mañana llueve con 0.7 y sale el sol con 0.3." (13) | — |
| 3 | Junto al diagrama (hermanas), `TablasLambda` A con la columna "suma = 1" | "La matriz A guarda esas flechas: renglón = hoy, columna = mañana. Cada renglón suma 1: mañana algo tiene que pasar." (21) | — |
| 4 | Sale la tabla; una ficha roja recorre L → L → S en el diagrama | "π = (0.6, 0.4) dice cómo empieza el primer día. Una historia completa es un producto." (16) | P(L, L, S) = π_L a_LL a_LS = 0.6 · 0.7 · 0.3 = 0.126 |
| 5 | `TiraDias` de 60 días simulados solo con A, "Esquema · simulación", botón "otra simulación" | "Sesenta días generados así: el clima forma rachas." (8) | — |
| 6 | igual | Conclusión: "La diagonal dice cuánto dura cada clima: en promedio 3.3 días lluviosos seguidos y 2.5 soleados." (17) | E[días seguidos] = 1 / (1 − a_ii) |

- **Datos:** A y π de libro; sumas, 0.126 y rachas, vivos; la tira, esquema (semilla inicial elegida para que haya rachas
  de los dos climas).
- **De palabra:** las columnas no suman 1 (1.1 y 0.9) y no tienen por qué; en 10 000 días simulados las rachas miden 3.3 y
  2.5 (se calcula en vivo para responder); **π no es "cuánto llueve"**: a la larga llueve 4/7 ≈ 57 % de los días
  (distribución estacionaria), no 60 %. La regla de la cadena para tres variables.
- **Riesgos:** los números de los autolazos fuera del lazo, en mono ≥ 20 px. La tira: celdas de ≥ 24 px de ancho para que
  60 quepan en 1 696 px.

### 53 · Estados ocultos — 8 clics

| Clic | Gráfica | Texto (≈ palabras) | Fórmulas |
|---|---|---|---|
| 0 | `RedTemporal` "hmm", T = 5: estados arriba, emisiones abajo | `Def` "Modelo oculto de Markov: una cadena de Markov que no vemos, más una regla que en cada paso produce algo que sí vemos." (24) | — |
| 1 | Baja una cortina rotulada "NO SE VE" sobre los estados | "El estado sigue cambiando, pero detrás de una cortina: solo vemos lo que produce." (14) | — |
| 2 | **Caso · Clima.** `DiagramaClima` con B: de cada estado, tres flechas a caminar, comprar, limpiar | "Si llueve, casi no sale a caminar (0.1); si hace sol, camina en más de la mitad de los días (0.6)." (20) | — |
| 3 | Junto al diagrama, `TablasLambda` B con "suma = 1" | "La matriz B: renglón = clima, columna = actividad." (8) | b_j(k) = P(o_t = k \| q_t = j) |
| 4 | `TiraDias` de 7 días: clima arriba, actividad abajo, "Esquema · simulación", botón "otra semana" | "Así genera el modelo: primero el clima con A, luego la actividad con B." (14) | — |
| 5 | La fila del clima se vuelve "?" | "Tu vista: solo la fila de abajo." (7) | — |
| 6 | Dos barras: π·b(caminar) = 0.06 (L) y 0.24 (S) | `Recap` regla de Bayes: "es la regla del producto despejada." (7) | P(A \| B) = P(B \| A) P(A) / P(B) |
| 7 | Las barras se normalizan a 0.2 y 0.8 | Conclusión: "Un solo día ya dice algo: si caminó, 80 % de sol. Con varios días hay que combinar A y B." (19) | P(S \| caminar) = 0.24 / 0.30 = 0.80 |

- **Datos:** B de libro; 0.06, 0.24, 0.30 y 0.80 vivos (α₁ normalizado); la semana, esquema.
- **De palabra:** el 80 % vale para el primer día, con π de antes; otro día tendría otro "antes" (lo que dicen los días
  previos). Convención para no confundir: flechas de A horizontales entre estados, las de B hacia abajo.

### 54 · λ = (π, A, B) — 7 clics

| Clic | Gráfica | Texto (≈ palabras) | Fórmulas |
|---|---|---|---|
| 0 | `TablasLambda` simbólica: π "cómo empieza", A "cómo cambia", B "qué produce" | "Tres tablas definen todo el modelo." (6) | λ = (π, A, B) |
| 1 | **Caso · Clima.** Los símbolos se vuelven números, con las sumas por renglón | "En el ejemplo, todo el modelo son 7 números libres." (10) | — |
| 2 | `DiagramaClima` completo (π, A y B) en lugar de las tablas | "El mismo λ como diagrama: entrada, cambios y lo que se produce." (11) | — |
| 3 | `RedTemporal` con etiquetas del clima: flechas horizontales en rojo; las que no existen (actividad → actividad) punteadas y tachadas | "Supuesto 1: el clima de mañana depende solo del de hoy." (11) | P(q_t \| todo lo anterior) = P(q_t \| q_{t−1}) |
| 4 | La misma red: flechas verticales en rojo; la de clima de ayer → actividad de hoy, tachada | "Supuesto 2: lo que hace hoy depende solo del clima de hoy." (12) | P(o_t \| todo lo demás) = P(o_t \| q_t) |
| 5 | — | "Con λ y los dos supuestos, la probabilidad de una historia es una multiplicación." (14) | P(O, Q \| λ) = π_{q₁} b_{q₁}(o₁) ∏ a_{q_{t−1}q_t} b_{q_t}(o_t) |
| 6 | Los factores de Q = (S, L, L) alineados bajo cada día, iluminados por día | Conclusión: "Esta historia vale 0.01344. Todavía no sabemos si es la mejor." (11) | (0.4 · 0.6)(0.4 · 0.4)(0.7 · 0.5) = 0.01344 |

- **Datos:** λ de libro; 7 = (N − 1) + N(N − 1) + N(M − 1), vivo; 0.01344 con `probConjunta`.
- **De palabra:** la cuenta de los 7 (1 + 2 + 4); el tercer supuesto implícito (A y B iguales todos los días); que es una
  simplificación ("si ayer limpió, quizá hoy no limpie"), a cambio de que todo sea calculable; que la fórmula sale de la
  regla de la cadena de la 52 más los dos supuestos. Se eligió (S, L, L) a propósito: en la 56 es la barra más alta y en la
  59, el camino de Viterbi.

### 55 · Las tres preguntas — 5 clics

Una lista de tres renglones (no tres columnas). El renglón nuevo entra completo; los anteriores se reducen a una línea
(número, nombre y algoritmo).

| Clic | Gráfica | Texto (≈ palabras) | Fórmulas |
|---|---|---|---|
| 0 | Renglón 01 **Evaluación**: "dado λ y lo visto, ¿qué tan probable es?" → Forward | `Recap` verosimilitud: "P(O \| λ) leída como función de λ: qué tan bien explica λ lo que vimos." (14) | P(O \| λ) |
| 1 | Renglón 02 **Decodificación**: "dado λ y lo visto, ¿qué estados hubo?" → Viterbi | (12) | Q* = argmax_Q P(Q \| O, λ) |
| 2 | Renglón 03 **Aprendizaje**: "con solo lo visto, ¿cuál es λ?" → Baum-Welch | (10) | λ* = argmax_λ P(O \| λ) |
| 3 | **Caso · Clima.** Cada renglón cambia su fórmula por su pregunta en el caso: "¿qué tan probable es caminar, comprar, limpiar?" · "¿qué clima hubo esos tres días?" · "si no conocemos π, A ni B, ¿cómo los sacamos de meses de relatos?" | (35) | — |
| 4 | A la derecha de cada renglón, dónde se resuelve: 56–58 · 59 · 61 | Conclusión: "Las dos primeras las resolvemos a mano; la tercera es la que se usa con datos reales." (16) | — |

- **De palabra:** argmax de P(Q \| O, λ) = argmax de P(O, Q \| λ) porque P(O \| λ) no depende de Q; Baum-Welch encuentra un
  máximo local, no "el óptimo" (se verá en la 61); que la 60 junta las dos primeras (misma tabla, suma o máximo). Fuente:
  Rabiner (1989), sección III.

### 56 · Fuerza bruta — 8 clics

| Clic | Gráfica | Texto (≈ palabras) | Fórmulas |
|---|---|---|---|
| 0 | — | `Recap` probabilidad total: "si las historias no se enciman y cubren todo, la probabilidad es la suma." (15) | P(O \| λ) = Σ_Q P(O, Q \| λ) |
| 1 | `ArbolCaminos` "esquema": raíz → 2 → 4 → 8 hojas, con el contador "2 → 4 → 8 caminos" | "Si no sabemos el clima, sumamos sobre todas las historias posibles." (11) | — |
| 2 | **Caso · Clima.** Las hojas se rotulan LLL … SSS; a la derecha, la barra de P(O, Q) de cada una con su valor | "Cada historia, su probabilidad: la multiplicación de la 54." (9) | — |
| 3 | Las 8 barras se apilan en una sola | "Sumadas, responden la pregunta 1." (5) | P(O \| λ) = 0.033612 |
| 4 | Regresan; S L L en rojo, las demás atenuadas | "La más alta, S L L, explica el 40 % del total: ni la mejor historia es segura." (16) | — |
| 5 | L L L resaltada en gris claro | "L L L es la más probable sin ver nada (0.294), pero explica mal lo que se vio (0.02)." (17) | — |
| 6 | `Lineas`: caminos 2ᵀ (rojo) contra Forward N²T (gris), eje y en potencias de 10, T de 1 a 100; ↑ ↓ o botones T = 3 · 10 · 30 · 100 | Contador grande: "2ᵀ = …" (el entero completo) | — |
| 7 | igual, en T = 100 | Conclusión: "Con 100 días, más de 10³⁰ historias: a mil millones por segundo, 40 billones de años. Hay que sumar sin enumerar." (21) | — |

- **Datos:** todo vivo (`enumerarCaminos`, `BigInt`). La velocidad de 10⁹ por segundo es un supuesto y se dice así.
- **De palabra:** P(Q) y P(O \| Q) de cualquier hoja si alguien pregunta (desglose de SLL: 0.112 × 0.12); el costo de la
  fuerza bruta es del orden de T·Nᵀ (2T·Nᵀ en Rabiner); que el 40 % es P(Q \| O, λ).
- **Riesgos:** 8 renglones de árbol con barras caben en ≈ 560 px si no se agrega nada más. El entero de 31 dígitos en mono
  ≥ 26 px con separación por miles.

### 57 · Forward — 8 clics

| Clic | Gráfica | Texto (≈ palabras) | Fórmulas |
|---|---|---|---|
| 0 | — | "α_t(j): la probabilidad de haber visto lo que vimos hasta hoy y que hoy el estado sea j." (18) | α_t(j) = P(o₁, …, o_t, q_t = j \| λ) |
| 1 | Esquema del nodo (t, j): tres flechas que llegan desde t − 1, un Σ que las junta y "× b" | `Recap` programación dinámica: "guardar resultados parciales para no recalcularlos. Todos los caminos que llegan al mismo estado el mismo día se suman una vez." (24) | — |
| 2 | igual | — | α₁(j) = π_j b_j(o₁) · α_t(j) = [Σᵢ α_{t−1}(i) a_ij] b_j(o_t) |
| 3 | **Caso · Clima.** `BarrasForward` día 1: las barras π (0.6, 0.4) se encogen por b(caminar) | Renglón de cálculo: "0.6 · 0.1 = 0.06 · 0.4 · 0.6 = 0.24" | — |
| 4 | Día 2, **predecir**: cada barra se parte según su renglón de A y los trozos viajan y se apilan | "Predecir: repartir lo de ayer según cómo cambia el clima. El total no cambia: 0.30." (15) | — |
| 5 | Día 2, **corregir**: las barras se encogen por b(comprar) | "Corregir: multiplicar por qué tan probable era lo que vi." → 0.0552 y 0.0486 (11) | — |
| 6 | Día 3: predecir y corregir juntos → 0.02904 y 0.004572 | "Mismo procedimiento." (2) | — |
| 7 | La suma de las dos barras, en rojo | Conclusión: "Igual que las 8 barras de la 56, sin recorrer caminos: un número por estado y día. Costo N²T." (19) | P(O \| λ) = 0.02904 + 0.004572 = 0.033612 |

- **Datos:** vivo (`pasosForward`).
- **De palabra:** por qué el total no cambia al predecir (cada renglón de A suma 1) y sí baja al corregir (b ≤ 1): por eso
  con muchos días se llega a cero (61); la creencia normalizada (20 % / 80 %, 53 % / 47 %, 86 % / 14 %) es "con lo visto
  hasta ese día", no con toda la secuencia; P(O) = 0.30 × 0.346 × 0.324, el producto de lo que aporta cada día.
- **Riesgos:** es la animación más compleja: cada movimiento ≤ 0.9 s; al retroceder, la etapa se muestra terminada. Cada
  día a la escala de lo que trae, con su altura completa rotulada. Relleno contra borde para distinguir los trozos.

### 58 · La tabla α a mano — 6 clics

| Clic | Gráfica | Texto (≈ palabras) | Fórmulas |
|---|---|---|---|
| 0 | `TablaAMano` vacía: renglones L y S, columnas "t = 1 · caminar", "t = 2 · comprar", "t = 3 · limpiar" | "Así se ve Forward en el pizarrón: estados por días. Cada casilla, con su operación." (14) | α₂(L) = [α₁(L) a_LL + α₁(S) a_SL] b_L(comprar) |
| 1 | **Caso · Clima.** Columna t = 1: 0.6·0.1 = 0.06 y 0.4·0.6 = 0.24 | "Columna 1: π por b." (4) | — |
| 2 | Columna t = 2: (0.06·0.7 + 0.24·0.4)·0.4 = 0.0552 y (0.06·0.3 + 0.24·0.6)·0.3 = 0.0486; los valores de origen se subrayan en rojo | "Lo de ayer, repartido por A, por b de hoy." (9) | — |
| 3 | Columna t = 3: 0.02904 y 0.004572 | — | — |
| 4 | Renglón de terminación | "Igual que la suma de los 8 caminos." (7) | P(O \| λ) = 0.02904 + 0.004572 = 0.033612 |
| 5 | Dos `Dato`: 14 multiplicaciones (Forward) contra 40 (fuerza bruta) | Conclusión: "Con tres días el ahorro es chico; con cien, 596 contra 2.5·10³²." (12) | — |

- **Datos:** vivo (`pasosForward`, `conteoMultiplicaciones`), textos con `fmtP`.
- **De palabra:** cómo se cuentan (Forward: N + (T − 1)·N·(N + 1); fuerza bruta: Nᵀ·(2T − 1)); solo multiplicaciones.
- **Riesgos:** celdas de ≈ 30 caracteres en mono de 26 px ≈ 470 px: columnas de 500 px como mínimo.

### 59 · Viterbi — 7 clics

| Clic | Gráfica | Texto (≈ palabras) | Fórmulas |
|---|---|---|---|
| 0 | — | "δ_t(j): la probabilidad del mejor camino que termina hoy en j. Igual que Forward, pero con máximo, y anotando de dónde vino." (22) | δ_t(j) = [maxᵢ δ_{t−1}(i) a_ij] b_j(o_t) (max en rojo) · ψ_t(j) = argmaxᵢ δ_{t−1}(i) a_ij |
| 1 | Esquema de rutas A → {B₁, B₂} → C, sin números, la mejor resaltada | "Si la mejor ruta a C pasa por B₂, su tramo hasta B₂ es la mejor ruta a B₂." (17) | — |
| 2 | **Caso · Clima.** `TablaAMano` de Viterbi, t = 1: 0.06 y 0.24 | "El primer día, igual que Forward." (6) | — |
| 3 | t = 2: dos candidatos por casilla, el perdedor atenuado y tachado, el ganador en rojo, × b y la flecha ψ | "De dos formas de llegar, me quedo con la mejor y apunto de dónde vino." (15) | — |
| 4 | t = 3, igual | — | — |
| 5 | Un marcador recorre las flechas ψ de derecha a izquierda; las casillas del camino en rojo tenue | "El mejor camino se lee al revés: Soleado, Lluvioso, Lluvioso. P = 0.01344, la barra más alta de la 56." (18) | — |
| 6 | Sobre la tabla, punteado, el camino de la casilla más alta de cada columna: S → S → L | Conclusión: "¿Y si sigo la casilla más alta de cada columna? S → S → L vale 0.00864: peor. Hay que guardar de dónde vino cada máximo." (24) | — |

- **Datos:** vivo (`viterbi`, `casillaMasAlta`, `probConjunta`).
- **De palabra:** no hay empates en ningún máximo, así que el camino es único; Viterbi cuesta lo mismo que Forward y además
  guarda N·T flechas; el principio es el de Bellman (1957), Viterbi (1967). **Respuesta preparada (hallazgo 2):** "¿y el
  clima más probable de cada día?" es otra pregunta (suavizado, con Forward y su gemelo Backward); aquí da S, L, L (77 %,
  62 %, 86 %), igual que Viterbi. No siempre coinciden: Viterbi da la mejor historia completa; el suavizado, el mejor
  estado de cada día por separado, y su unión puede ser una historia imposible o poco probable.
- **Riesgos:** casillas con dos candidatos: renglones de ≥ 170 px y el perdedor al 35 %. Las flechas ψ se calculan con las
  mismas constantes de la tabla, no midiendo el DOM.

### 60 · Forward y Viterbi: suma contra máximo — ajustes (6 clics, igual)

- **Cambios:** λ y `OBS_EJEMPLO` desde `lib/clima.ts` (deja de definirlos); números con `fmtP` (0.033612, 0.0552);
  `caso="Clima"` desde el clic 1; conclusión "O(N²T) en vez de O(T·Nᵀ)"; regla 9 (los "t = 1" de 15 px a 20, rótulos ≥ 20,
  fórmulas ≥ 28) y medir que la conclusión no choque con el renglón de cálculo.
- **No se agrega** el "ajuste 2" de la especificación (mini barras de los 8 caminos): sería una tercera gráfica junto a los
  dos trellis. Se dice de palabra: "Forward suma las 8 barras de la 56; Viterbi se queda con la más alta".
- Coordinación con `HITO-LEGIBILIDAD.md` (decisión 7).

### 61 · Del pizarrón a la práctica — 14 clics

Un rótulo arriba indica el tema del bloque: 01 Aprender λ · 02 Decimales que desaparecen · 03 Comprobar · 04 Evaluar.

| Clic | Gráfica | Texto (≈ palabras) | Fórmulas |
|---|---|---|---|
| 0 | Lista 01–04 en mono rojo: aprender λ · decimales que desaparecen · comprobar · evaluar | "Con tres días todo cabe en una tabla. Con datos reales hay que aprender λ, cuidar los decimales y medir qué tan bien funciona." (24) | — |
| 1 | **Caso · Clima.** `TablaCruda`: las primeras 5 filas del diario (`dia`, `actividad`, `clima`) | "El diario del amigo: 10 000 días simulados con el λ del libro. El clima existe solo porque lo simulamos." (19) | — |
| 2 | La misma tabla con `clima` marcada como apartada | "Qué se le cambia: actividad a 0, 1, 2; el clima se aparta (solo sirve para medir). Prueba: los 1 000 días siguientes, sin barajar." (24) | — |
| 3 | Ciclo E ⇄ M (esquema local, dos bloques y flechas) | "E: con el λ actual, ¿qué tan probable es cada clima cada día? M: recalcular π, A y B con eso. Cada vuelta no empeora." (26) | P(O \| λ⁽ᵏ⁺¹⁾) ≥ P(O \| λ⁽ᵏ⁾) |
| 4 | `Lineas`: ln P contra iteración, 10 arranques en gris, el mejor en rojo | "Diez arranques: 5 llegan al mismo valor y 5 se quedan abajo. A dónde llegas depende de dónde arrancas." (18) *(cifras del JSON)* | — |
| 5 | `TablasLambda` comparar: A y B reales contra aprendidos | "El aprendido se parece, pero no es igual: error máximo 0.11. Los estados salen sin nombre: hay que emparejarlos." (19) | — |
| 6 | `Lineas`: log₁₀ P(o₁…o_T) contra T; línea gris del cálculo con escalado; puntos rojos de Forward sin escalar que caen al piso "= 0" en T* | "Cada día multiplica por un número menor que 1. En el día 681 ya no cabe en la computadora: vale 0." (20) *(T* vivo)* | — |
| 7 | igual | `Recap` logaritmos: "convierten productos en sumas; nada se vuelve cero." (8) | log(ab) = log a + log b · log P(O) = Σ_t log c_t |
| 8 | `MetricTable` de 4 renglones: navegador · hmmlearn · diferencia (ln P de los 3 días; camino de Viterbi y ln P*; ln P de los 1 000 días; días en que coinciden los dos Viterbi) | "Lo hecho a mano y en el navegador da lo mismo que una librería." (13) | — |
| 9 | Tres `Dato`: ln P por día en prueba con λ real, λ aprendido y sin memoria | "En días nuevos, el aprendido no le gana al modelo sin memoria: −1.098 contra −1.097." (14) *(del JSON)* | — |
| 10 | `Barras`: % de días con el clima correcto: el más común · solo la actividad · Viterbi (rojo) | "Viterbi acierta 76 %; la actividad sola, 76 %. Este clima cambia casi al azar: los días vecinos dicen poco." (19) | — |
| 11 | Las mismas barras con un clima persistente (a_ii = 0.95), rotulado "otro clima, simulado"; botones para ir y volver | "Si el clima dura, el contexto sí ayuda: 92 % contra 77 %. Un HMM sirve cuando los estados duran." (18) | — |
| 12 | Cuatro renglones: voz · etiquetado gramatical · proteínas · cambios de régimen en economía | — (10) | — |
| 13 | — | Conclusión: "Un HMM convierte lo que vemos en lo que probablemente pasó. Modelo: λ. Validación: secuencias que no vio. Métrica: log-verosimilitud y aciertos, contra una línea base." (27) | — |

- **Datos:** JSON (Baum-Welch, dato crudo, aprendido); vivo (Forward escalado, Viterbi, underflow, aciertos, sobre las
  secuencias del JSON). Todas las cifras de los textos se leen de ahí; las de esta tabla son las de la sección 2.
- **De palabra:** la garantía de EM y por qué solo es local (Baum et al. 1970; Dempster, Laird y Rubin 1977); π̂ = (0, 1)
  porque con una sola secuencia solo hay un primer día (hallazgo 3); que el aprendido explica el entrenamiento mejor que el
  λ real (−10 918.8 contra −10 925.8) y peor la prueba: con datos finitos varios λ explican casi igual, y este clima es
  difícil de identificar; los umbrales (menor double normal 2⁻¹⁰²² ≈ 2.2·10⁻³⁰⁸ y el menor 4.9·10⁻³²⁴); que con el clima
  persistente λ se recupera a 0.006; Viterbi en logaritmos (mismo camino porque log es creciente); el escalado de Rabiner
  es sumar log c_t, el mismo c_t de la 57 (detalle en R4); que el % de aciertos solo se puede medir con datos simulados o
  etiquetados; las referencias de las aplicaciones (Rabiner; Jurafsky & Martin; Eddy 1998 y Pfam/HMMER; Hamilton 1989).
- **Riesgos:** las curvas de EM: entre el mejor y los atorados hay 60 de ln P total, 0.006 por día; si el eje va de la
  primera iteración al final no se ve. Se grafica ln P total y con el eje acercado, o la x en escala logarítmica (decidir
  al construir, anotar). El underflow: marcar solo −100, −200, −300 en y.

## 7. Orden de construcción

- [x] **Tanda 0 · Base:** `scripts/exportar_hito6.py` y sus dos JSON; `lib/clima.ts`, `lib/climaSimulado.ts` y lo nuevo de
      `lib/hmm.ts`; comprobaciones en `scripts/verificar.ts` ("Todo coincide"); las 7 piezas nuevas probadas en una
      diapositiva de prueba que no se registra.
- [x] **Tanda 1 · El modelo:** 51, 52, 53, 54. Medidor y bitácora.
- [x] **Tanda 2 · Evaluar y decodificar:** 55, 56, 57, 58, 59 y los ajustes de la 60. Medidor y bitácora.
- [x] **Tanda 3 · La práctica:** 61. Medidor y bitácora.
- [ ] **Cierre del hito** (sección 8).

## 8. Cómo se da por terminado

1. `npm run build` sin errores y `npm run verify` con "Todo coincide".
2. Cada diapositiva vista en el navegador clic por clic, sin errores en consola.
3. **Sin desbordes ni encimados, comprobado por DOM.** `scripts/legibilidad.js` sobre 51–61 (`DESDE`/`HASTA`), en todas
   las posiciones diapositiva × clic, da: cero textos visibles menores a 18 px; cero rótulos menores a 20 px; cero textos de
   lectura menores a 26 px; fórmulas a ≥ 28 px; **cero textos fuera del cuerpo útil y cero renglones encimados**. Se pega la
   tabla del medidor en la bitácora.
4. **Minimalismo, contado por clic:** a lo más una gráfica principal (o dos hermanas), ≤ 40 palabras de lectura (el medidor
   las cuenta), ≤ 2 fórmulas, ningún clic con tres paneles. Lo que no cupo está en "De palabra".
5. Revisión de rigor (cada afirmación en pantalla tiene su dato) y de claridad (se entiende desde cero).
6. Bitácora al día, con lo que **no** se revisó.
7. `docs/HANDOFF.md`, `CLAUDE.md` ("Piezas disponibles" y la lista de archivos de `lib/` que leen JSON), la sección H del
   plan maestro (clics, piezas, R4 con el día del underflow calculado) y la subtarea 195 de ListKeeper actualizados.

## 9. Bitácora

### 2026-10-17 · Planeación

- `hmmlearn 0.3.3` instalado en el `.venv` (compilado por pip; no hay rueda para Python 3.14). Es lo único que se tocó
  fuera de `docs/` y `CLAUDE.md`.
- La comprobación se hizo con un script temporal (fuera del repo). Sus números están en la sección 2; los cuatro hallazgos
  cambian la 59 y la 61.
- La regla 9 de `CLAUDE.md` se amplió con el criterio de minimalismo (pedido del usuario, 2026-10-17).

### 2026-10-17 · Aprobación y construcción (tandas 0–3)

- **Aprobado** el mismo día: el usuario pidió "decide lo que sea más recomendable y empieza". Quedan las opciones A de las
  siete decisiones.
- **Tanda 0.** `scripts/exportar_hito6.py` (≈ 1 min 50 s; registro en `scripts/cache/hito6.log`) → `hmm_clima.json`
  (48 KB) y `referencias_hito6.json` (46 KB). Salió igual que en la planeación: día del underflow 681 y 730; error máximo de
  λ 0.112 (libro) y 0.006 (persistente); 5 de 10 arranques llegan al mejor en los dos. La implementación propia de
  Baum-Welch en numpy, desde el mismo λ inicial, llega al mismo valor que hmmlearn (diferencia 1.4e-9 y 6.7e-11). Ningún
  `assert` falló. `lib/hmm.ts` ganó `probCadena`, `probConjunta`, `enumerarCaminos`, `pasosForward`, `forwardEscalado`,
  `prefijosSinEscalar`, `diaUnderflow`, `viterbiLog`, `suavizado`, `casillaMasAlta`, `simular`, `rachas`,
  `conteoMultiplicaciones` y `estacionaria`; `lib/clima.ts` (λ, `fmtP`, `fmtEntero`) y `lib/climaSimulado.ts` (lee el
  JSON). `npm run verify`: **20 comprobaciones nuevas, "Todo coincide"**.
- **Cambios respecto al plan:**
  - El JSON de la página lleva además `hmmlearn_ejemplo` y, por escenario, `hmmlearn` (score y decode de la prueba con el λ
    real): la tabla de comprobación de la 61 los necesita en la página, no solo en `verificar.ts`.
  - La comprobación de la 61 es una tabla local, no `MetricTable` (esa marca "el mejor" de cada columna, que aquí no aplica).
  - Las curvas de EM grafican ln P **total** con el eje acercado a [−11 000, −10 900] y la vuelta en escala logarítmica:
    con ln P por día, los 60 puntos entre el mejor y los atorados no se verían (riesgo previsto).
  - La 61/9 compara el aprendido contra el sin memoria y escribe la frase según el dato (con el clima del libro: "no le
    gana"); en el 11 entra el persistente con botones para ir y volver.
  - Semillas elegidas por búsqueda (simulaciones rotuladas "Esquema"): la tira de 60 días de la 52 usa la 7 (rachas de 11
    días de lluvia y 10 de sol); la semana de la 53, la 8 (tres días de lluvia: limpiar, limpiar, comprar; cuatro de sol:
    caminar).
  - Se agregó la configuración `exposicion-2` (puerto 5181) en `.claude/launch.json`: el 5180 lo ocupaba la sesión que
    ajusta 41–50.
- **Hallazgos al construir:** `TablasLambda`, `TablaAMano` y las tablas se marcan `data-rotulo` (son datos, no lectura).
  Un subíndice dentro de texto de lectura siempre mide menos de 26: los símbolos con subíndice en párrafos van con `TeX`.
- **Revisado en el navegador:** 51 (0–5), 52 (0–6), 53 (1, 3, 5, 7), 54 (1, 2, 4, 6), 55 (1, 4), 56 (3, 5, 7), 57 (1, 4, 7),
  58 (2, 5), 59 (5, 6), 60 (5) y 61 (2–6, 8–11). Corregido por lo que se vio: el error de `fmtP` en `map` (52), puntas de
  flecha que crecían con el grosor, rótulos de las emisiones encimados (53), la tabla B que se salía a la derecha (53),
  el clima tapado que se transparentaba (53), subíndices (54), la barra Σ encima de un valor (57), "π" en mayúscula en
  rótulos (52, 53) y el 61/9, que mostraba el clima persistente en lugar del del libro.
- **Medidor (`scripts/legibilidad.js`, 51–61, 82 posiciones).** Primera pasada: 17 posiciones con algo (tablas contadas
  como lectura, subíndices de 16–18 px, la etiqueta "Σ = 0.033612" fuera del cuerpo en la 56/3, un encimado bajo la cortina
  de la 53/1 y cuatro clics con 42–61 palabras: 51/3, 54/0, 55/4, 60/5). Corregido todo; **segunda pasada: 0 textos < 18 px,
  0 rótulos < 20, 0 lecturas < 26, 0 fórmulas < 28, nada fuera del cuerpo, 0 encimados; el clic más cargado tiene 40
  palabras (60/5 y 61/3)**. Mínimo medido: 19.5 px (rótulos de 20).
- **De palabra (salió de la pantalla al medir):** en la 51/3, "detrás de lo que se ve hay una secuencia que no se ve"; en la
  61/8, "lo hecho a mano y en el navegador"; en la 55, la versión larga de las preguntas del caso.
- **No se revisó en captura:** 52/5, 53/0, 53/2, 53/4, 53/6, 54/0, 54/3, 54/5, 55/0, 55/2, 55/3, 56/0–2, 56/4, 56/6,
  57/0, 57/2, 57/3, 57/5, 57/6, 58/0, 58/1, 58/3, 58/4, 59/0–4, 60/0–4, 61/0, 61/1, 61/7, 61/12 y 61/13. Todas pasaron
  por el medidor de DOM. Tampoco se probaron los botones "otra simulación" y "otra semana" ni las flechas ↑ ↓ de la 56.
