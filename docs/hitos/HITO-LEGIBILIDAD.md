# Hito de legibilidad — regla 9 en las diapositivas que ya existen (1, 3–50 y 60)

**Estado:** En construcción · *(Borrador → Aprobado el 2026-10-14 → En construcción → Cerrado el AAAA-MM-DD)*
**Última actualización:** 2026-10-14

## 1. Alcance

- **Entran las 50 diapositivas construidas:** 1, 3–50 y 60. No se agrega contenido nuevo ni se cambian datos: se agranda,
  se reacomoda y se parte en más clics para cumplir la regla 9 de `CLAUDE.md` ("Se proyecta en un cañón, en un salón"),
  que el usuario pidió el 2026-10-14 al revisar la 48.
- **Lo que pide la regla, medido sobre el lienzo de 1920 × 1080:** texto de lectura ≥ 26 px; etiquetas, números de ejes,
  leyendas y rótulos ≥ 20 px; nada debajo de 18 px; fórmulas ≥ 28 px. Una idea por clic (una gráfica principal o dos
  hermanas, un bloque de unas 40 palabras, a lo más dos fórmulas). Sin notas al pie diminutas.
- **Restricción del usuario, la más importante:** las 1–19 (clase 1) ya las estudia el equipo con la guía de estudio. **No se
  elimina información importante de ninguna diapositiva, y menos de 1–19.** Ahí se agranda, se redistribuye y se parte en
  más clics; lo que se dice y las cifras se conservan. Si algo de 1–19 tuviera que salir de la pantalla, se le pregunta al
  usuario antes.
- **Relación con el hito 5:** las 41–50 están construidas y esperan la revisión del usuario. Este hito las toca, así que
  conviene que esa revisión sea después de ajustarlas (decisión 9).
- **Fuera a propósito:** contenido nuevo, cambios de datos o de cálculo, diapositivas que no existen todavía (2, 51–59,
  61–64) — esas ya nacen con la regla 9.

## 2. Lo que se revisó para planear

**Leído:** `CLAUDE.md`, `docs/HANDOFF.md`, `docs/hitos/PLANTILLA.md`, el índice del plan maestro, la bitácora del hito 5,
`theme.css`, `deck/`, las piezas compartidas (`Piezas`, `Receta`, `Recap`, `Reveal`, `Scene3D`, `Lineas` y los tamaños de
letra de todas las demás) y el código completo de la 3, la 5 y la 48.

**La guía de estudio** es el artifact "Guía de estudio U7 y U8" (`https://claude.ai/artifact/YEyweL2V3ozZDBPdsVZy8N`,
compartido por liga). Cubre 1, 3–40 y 60: por diapositiva, *Qué se ve* (en orden de clics), *Qué decir*, *Datos* y
*Estudiar*, más un glosario y preguntas probables. **Es el contrato de contenido de este hito:** todo lo que la guía dice que
"se ve" y todas sus cifras siguen en pantalla después del ajuste. No describe clics numerados, solo el orden, así que partir
un clic en dos no la contradice.

**Cómo se midió.** Con el preview, la app cargada en un iframe de 1920 × 1080 (el panel oculto congela las animaciones:
se sustituyó `requestAnimationFrame` por temporizadores, se quitó `Element.prototype.animate` para que motion no use WAAPI y
se activó `MotionGlobalConfig.skipAnimations`). Se recorrieron con → las 254 posiciones (diapositiva × clic) y en cada una
se midió todo texto visible (opacidad acumulada ≥ 0.15): su tamaño efectivo sobre el lienzo (en SVG, el `font-size` por la
escala de `getScreenCTM`), si se sale del cuerpo de la diapositiva y si su renglón se cruza con el de otro texto.
"Lectura" = texto HTML que no es monoespaciado, ni `.label`, ni fórmula, ni del encabezado. El medidor queda para
revisar cada diapositiva al terminarla (decisión 10).

**Lo que salió:**

- **Ninguna diapositiva cumple.** Todas tienen texto debajo de 18 px. El encabezado (`03 / 64`, "Caso · Adult") está en
  17 px en las 50; `.label` ("Esquema · …", títulos de gráfica) en 16 px; los ejes de las gráficas en 14–15 px; las
  etiquetas 3D en 15 px y la pista "rueda: acercar…" en 14 px. Lo más chico: 10.5 px (fórmula de la 48) y 12 px (tabla
  de la 50).
- **Texto de lectura entre 16 y 25 px** en casi todas: párrafos a 21–24 px, `Def` y `Recap` a 24 px, conclusiones bajadas
  a 23–25 px.
- **Se salen del cuerpo:** 9, 19, 20, 39, 42, 47, 48 y 50 (en 20, en los 5 clics).
- **Textos encimados (renglón contra renglón):** solo 11 (un rótulo del corte 2D), 47 y 49 (uno cada una).
- **Saturación:** 19 diapositivas pasan de 70 palabras de lectura en algún clic; las peores, 28 (192), 25 (184), 48
  (149), 30 (117). En rótulos chicos por clic: 33 (174, la rejilla año × mes), 48 (122), 50 (98), 46 (91), 44 (82).

**Tabla completa, ordenada por gravedad** (puntaje = palabras de lectura del clic más cargado + rótulos menores a 20 px del
clic más cargado + 60 si algo se sale del cuerpo + 10 por cada encimado):

| Diap. | Clics | Palabras máx. por clic | Rótulos < 20 px máx. por clic | Textos distintos < 18 px | Mínimo (px) | Lectura más chica (px) | Se sale | Puntaje |
|---|---|---|---|---|---|---|---|---|
| 48 | 7 | 149 | 122 | 87 | 10.5 | 17 | sí | 331 |
| 33 | 4 | 58 | 174 | 48 | 15 | 19 | | 232 |
| 28 | 6 | 192 | 35 | 21 | 14 | 21 | | 227 |
| 50 | 7 | 58 | 98 | 126 | 12 | 16 | sí | 216 |
| 25 | 8 | 184 | 13 | 15 | 14 | 17 | | 197 |
| 20 | 5 | 77 | 45 | 17 | 14 | 21.9 | sí | 182 |
| 39 | 5 | 75 | 42 | 63 | 13.1 | 18 | sí | 177 |
| 47 | 6 | 71 | 31 | 46 | 14 | 19 | sí | 172 |
| 44 | 4 | 82 | 82 | 60 | 14 | 21.9 | | 164 |
| 46 | 5 | 73 | 91 | 46 | 14 | 18 | | 164 |
| 30 | 7 | 117 | 44 | 53 | 14 | 16 | | 161 |
| 27 | 8 | 98 | 62 | 43 | 14 | 20 | | 160 |
| 42 | 5 | 70 | 29 | 55 | 14 | 21 | sí | 159 |
| 43 | 5 | 98 | 47 | 52 | 14 | 19 | | 145 |
| 45 | 5 | 81 | 61 | 90 | 14 | 20 | | 142 |
| 19 | 5 | 48 | 33 | 47 | 14 | 19 | sí | 141 |
| 23 | 4 | 71 | 69 | 43 | 14 | 16.2 | | 140 |
| 26 | 10 | 88 | 48 | 42 | 14 | 20 | | 136 |
| 9 | 3 | 25 | 45 | 26 | 14 | 22 | sí | 130 |
| 41 | 5 | 79 | 49 | 59 | 14 | 19 | | 128 |
| 12 | 4 | 61 | 64 | 31 | 14 | 20 | | 125 |
| 49 | 4 | 95 | 17 | 30 | 14 | 17.1 | | 122 |
| 37 | 7 | 79 | 39 | 56 | 15 | 18 | | 118 |
| 38 | 4 | 60 | 52 | 59 | 14.9 | 20.1 | | 112 |
| 3 | 8 | 70 | 41 | 37 | 15.9 | 19.8 | | 111 |
| 29 | 7 | 73 | 38 | 42 | 14 | 20 | | 111 |
| 16 | 3 | 63 | 44 | 32 | 15 | 21 | | 107 |
| 40 | 5 | 65 | 42 | 44 | 14 | 23.9 | | 107 |
| 35 | 5 | 56 | 49 | 47 | 15 | 22 | | 105 |
| 31 | 4 | 68 | 36 | 56 | 15 | 21.9 | | 104 |
| 11 | 5 | 52 | 41 | 43 | 14 | 18 | | 103 |
| 32 | 4 | 64 | 39 | 35 | 14 | 21 | | 103 |
| 14 | 5 | 78 | 21 | 25 | 15 | 19 | | 99 |
| 24 | 5 | 67 | 29 | 32 | 14.9 | 21 | | 96 |
| 21 | 4 | 66 | 28 | 32 | 14 | 20 | | 94 |
| 17 | 4 | 68 | 18 | 21 | 15 | 20 | | 86 |
| 34 | 6 | 46 | 40 | 64 | 15 | 21 | | 86 |
| 36 | 7 | 48 | 34 | 48 | 14 | 22 | | 82 |
| 5 | 4 | 43 | 38 | 41 | 13 | 24 | | 81 |
| 8 | 4 | 55 | 23 | 46 | 14 | 20 | | 78 |
| 15 | 4 | 43 | 35 | 36 | 15 | 22 | | 78 |
| 18 | 4 | 48 | 30 | 33 | 14 | 21 | | 78 |
| 60 | 6 | 53 | 25 | 10 | 15 | 20 | | 78 |
| 4 | 6 | 50 | 23 | 25 | 14 | 22 | | 73 |
| 22 | 3 | 44 | 25 | 29 | 14 | 20 | | 69 |
| 13 | 4 | 44 | 21 | 21 | 15.9 | 21 | | 65 |
| 7 | 5 | 51 | 13 | 16 | 14 | 20 | | 64 |
| 6 | 4 | 45 | 14 | 13 | 14 | 20 | | 59 |
| 10 | 4 | 40 | 17 | 25 | 14 | 20 | | 57 |
| 1 | 1 | 0 | 1 | 1 | 17 | — | | 11 |

**Lo que dice el conteo, más allá del puntaje:**

- Arreglar las piezas compartidas resuelve la mayoría de los textos de 14–17 px de golpe (encabezado, `.label`, ejes,
  etiquetas 3D). Lo que queda por diapositiva son los `fontSize` escritos a mano (553 en `src/slides/`, 161 de ellos menores a 20) y el espacio:
  al crecer la letra, casi todas las disposiciones de dos columnas dejan de caber y hay que partir clics.
- El cuerpo útil mide ≈ 1696 × 640 px. A 26 px con interlineado 1.4, un bloque de 40 palabras en una columna de 800 px
  ocupa ≈ 5 renglones (≈ 180 px). Dos columnas de definiciones de 60 palabras cada una ya no caben junto a una gráfica.
- **Estimado: de 254 clics a ≈ 310–320.** No cambia el tiempo de exposición de forma apreciable: se dice lo mismo, en más
  pasos (regla 5: los clics no están limitados).

## 3. Decisiones que necesita el usuario

**Respondidas el 2026-10-14:** el usuario aprobó el plan con las diez recomendaciones. La 8 (tocar la guía, que es un
artifact compartido) se le confirma otra vez antes de republicarla.

| # | Decisión | Opciones | Recomendación y por qué |
|---|---|---|---|
| 1 | Escala de tamaños | **A:** lectura 26, rótulos 20, fórmulas 28; 18 solo para ayudas del expositor (la pista "rueda: acercar…" de las escenas 3D), que además se esconde con el cursor quieto, como la ayuda de las flechas. **B:** todo ≥ 20, sin excepciones | **A.** Es la regla tal cual; la pista no es para el público y a 20 px estorba encima de la escena |
| 2 | Cómo se tocan **1–19** | **A:** textos y cifras literales; solo se agranda, se reacomoda y se parte en clics. **B:** se permite acortar frases si no se pierde ningún dato | **A.** El equipo ya estudia esas palabras. Si algo no cabe ni partiendo, se pregunta antes (lo pidió el usuario) |
| 3 | Cómo se tocan **20–40 y 60** (también están en la guía) | **A:** como 1–19. **B:** se permite acortar la redacción, pero cada cifra y cada "Qué decir" de la guía siguen en pantalla; las aclaraciones secundarias pasan a la sección "Para decir de palabra" de este plan | **B.** Hay párrafos de 70–190 palabras que literales no caben ni en tres clics. Lo que la guía pide estudiar se queda |
| 4 | Cómo se tocan **41–50** (no están en la guía; el hito 5 no está cerrado) | **A:** como 20–40 (opción B de la 3), con libertad para cambiar la disposición. **B:** literal | **A.** La 48 tiene que dejar de ser de tres columnas; no hay guía que las cite todavía |
| 5 | ¿Una escena 3D y la gráfica que lee lo mismo cuentan como "dos hermanas"? (5, 6, 7, 10, 11, 18: el árbol en 3D junto a su curva de error o sus barras) | **A:** sí, se quedan juntas en el mismo clic, más grandes. **B:** se separan en clics distintos | **A.** Muestran el mismo modelo en el mismo momento; separarlas cambia lo que el equipo estudió. Una tercera gráfica (la curva de error de la 11) sí pasa a su clic |
| 6 | Tablas que se llenan renglón por renglón (25: 8 renglones × 5 ensambles; 28: 5 renglones con evidencia) | **A:** en cada clic, el renglón nuevo completo a 26 px; los anteriores quedan arriba reducidos a su palabra clave (por ejemplo "varianza / sesgo"); al final, la tabla de palabras clave entera. **B:** la tabla completa se queda, a 26 px, partida en dos mitades con su propio clic | **A.** La tabla completa a 26 px no cabe ni en dos mitades (184 palabras); con A cada clic dice una idea y el final sirve de resumen. Las frases completas siguen en pantalla en su clic |
| 7 | Orden de trabajo | **A:** por clase: piezas compartidas → 1–19 → 20–28 → 29–40 → 41–50 y 60. **B:** por gravedad (48, 33, 28, 50, 25…) | **A.** La clase 1 es la que el equipo estudia ahora: que tenga su versión final cuanto antes. Además así cada tanda se puede revisar como una clase |
| 8 | La guía de estudio | **A:** al terminar cada clase, actualizarla con los clics nuevos (el contenido no cambia). **B:** no tocarla | **A**, si el usuario lo aprueba: es un artifact compartido por liga, y quien lo abra verá el cambio al instante. Solo se tocaría la parte "Qué se ve" |
| 9 | Revisión del hito 5 | **A:** el usuario revisa 41–50 ya ajustadas, y el hito 5 se cierra con esa revisión. **B:** revisa antes, y después otra vez | **A.** Una sola revisión de la misma versión |
| 10 | El medidor | **A:** guardarlo en el repo como `scripts/legibilidad.js` (se pega en la consola del preview; imprime, por diapositiva y clic, lo menor a 18 y a 20 px, lo que se sale y lo encimado) y documentarlo en `HANDOFF.md`. **B:** dejarlo fuera del repo | **A.** Es lo que permite comprobar la regla 9 en las diapositivas que faltan (51–64). No contiene nada privado |

## 4. Datos

- **No hay datos nuevos ni cambios de cálculo.** Ningún JSON se regenera y `src/lib/` no se toca, salvo que al reacomodar
  aparezca un error. Las cifras en pantalla siguen saliendo de `src/lib` o `src/data` (regla 4).
- **Verificación:** `npm run verify` debe seguir diciendo "Todo coincide" tras cada tanda; no se agregan comprobaciones.
- **Lo que sí se mide:** cada diapositiva terminada pasa por el medidor (sección 8).

## 5. Piezas

Tanda 0 cambia lo compartido; después de eso se vuelve a medir y cada diapositiva solo arregla lo suyo.

| Pieza | Cambio | Afecta |
|---|---|---|
| `src/deck/tipografia.ts` (nueva) | `TIPO = { lectura: 26, rotulo: 20, formula: 28, ayuda: 18 }`, para que las piezas en SVG calculen sus márgenes con el tamaño real | Todas |
| `theme.css` | Variables `--fs-lectura`, `--fs-rotulo`. Encabezado (`.slide-head`, número y "Caso · …") 17 → 20. `.label` 16 → 20 (con menos espaciado entre letras, 0.14 → 0.1 em, para que no crezca tanto a lo ancho). `.axis3d` 15 → 20. `.chip` 18 → 20. `.recap p` 24 → 26. `.help` 15 → 18 | Todas |
| `Piezas` | `Def`: explicación 24 → 26. `BarraClases`: rótulos 16 → 20 | 3, 5 y las que usan `Def` |
| `Receta` | Completa: texto 24 → 26. Franja: número 16 → 20, texto 20 se queda (es rótulo) | 3, 26, 30, 48 |
| `Scene3D` | Pista "rueda: acercar · doble clic" 14 → 18 y solo visible con el cursor en movimiento (`body:not(.idle)`) | Todas las 3D |
| `Lineas`, `SeriesChart`, `Barras`, `Dispersion`, `Correlogram`, `SplitDiagram`, `CalendarGrid`, `PValueScale`, `PuntosIntervalo` | Números de ejes, rótulos de ejes, textos de bandas, marcas y leyendas 13–16 → 20. Los márgenes (`m.l`, `m.b`, `m.t`) se calculan del tamaño para que los números no se corten. Los ticks se espacian para que no se encimen a 20 px (`pasoRedondo` ya existe) | 8, 11, 12, 14, 16, 18, 19, 22, 27–50 |
| `AicGrid`, `MetricTable`, `TablaCruda` | Encabezados 12–14 → 20; celdas ≥ 20 (la tabla cruda ya usa 20 en la 3) | 3, 4, 29, 48–50 |
| `TreeDiagram`, `FlujoEnsamble`, `TableroSorteos`, `JugueteAdaBoost`, `OperacionAnimada`, `RejillaRaices` | Rótulos 14–19 → 20; textos de lectura dentro del SVG → 26 | 4, 6, 9, 10, 13, 14, 18, 36, 38 |
| `Adult3DScene`, `AnioMes3D`, `LagCloud3D`, `VoteVolume3D`, `Surface3D` | Etiquetas de ejes por `.axis3d` (20 px); leyendas por `.label` | 4–7, 10, 11, 17, 18, 20, 33, 39, 41, 42, 47 |

Después de la tanda 0 casi todas las gráficas van a necesitar más alto o ancho: eso se arregla en la diapositiva que las usa.

## 6. Diapositiva por diapositiva

**Reglas comunes a todas** (no se repiten abajo):

- Todo texto de lectura a ≥ 26 px (párrafos, `Def`, `Recap`, conclusiones; las conclusiones `takeaway` se quedan en 30 px y
  ya no se bajan a 23–25). Todo rótulo a ≥ 20 px. Fórmulas a ≥ 28 px.
- Si un clic pasa de ≈ 40 palabras de lectura o de una gráfica principal (o dos hermanas, decisión 5), se parte. Lo usual:
  el concepto en un clic y su esquema en el siguiente; la conclusión en su propio clic cuando no cabe bajo la gráfica.
- Si cambian los clics: `steps` en `src/slides/index.ts` y la entrada de la diapositiva en `docs/PLAN-DIAPOSITIVAS.md`.
- La partición exacta se decide al construir, mirando la diapositiva, y se anota en la bitácora.
- En 1–19, la columna "Se conserva" es lo que la guía de estudio dice que se ve y sus cifras; nada de eso sale.

### Clase 1 · 1–19 (decisión 2: literal)

| Diap. | Lo que está mal (medido) | Qué se hace | Se conserva (guía) | Clics |
|---|---|---|---|---|
| 1 | "ESCOM · IPN" a 17 px | Subir a 20 | Todo | 1 → 1 |
| 3 | Rótulos de 16 px (tablas, pliegues, `.label`); notas del dataset a 21–22 px; clics 4 y 5 con 66–70 palabras | Tablas del memorión con encabezados a 20. El clic del dataset crudo se parte: la tabla `adult.head()` y luego "de dónde sale / qué es cada fila / qué se predice". "Lo que se le cambia" (4 notas) en dos clics de dos notas. La ficha de una persona y, en otro clic, desbalance, faltantes y la nota de sexo y raza (hoy a 20 px) | Memorión, receta, K-Fold de 20 cuadros, Adult crudo, qué se quita (`fnlwgt`), 48,842 / 23.9 %, la ficha, la barra de 5 pliegues | 8 → 11 |
| 4 | Diagrama del árbol y escena 3D con rótulos de 14–17 px; recordatorio de Gini a 22–24 px | Rótulos a 20; el recordatorio de Gini (tres urnas) en su clic si no cabe junto a las partes del árbol | 20 preguntas, partes del árbol, Gini 0.5 / 0.18 / 0, Adult de 3 columnas crudo, árbol de profundidad 2 con su escena | 6 → 7 |
| 5 | Ejes de la curva a 15 px, rótulos de 13–14 px; conclusión bajada a 25 | Gráfica de error con ejes a 20 y más alta; la lectura del deslizador a 20; conclusión a 30 | Definiciones, esquema, árbol 3D con deslizador, curva real, 97.4 % / 81.9 % / 85.7 % | 4 → 4 o 5 |
| 6 | Rótulos 14–18 px | Agrandar; el contador de cambios a 26 | 6 puntos, "quitar otras 5", contador sobre 5,000, botones de profundidad | 4 → 4 |
| 7 | Diana y fórmula con rótulos de 14–18 px; 51 palabras en el último clic | Fórmula a 28; la conclusión en su clic | Diana 2 × 2, error = sesgo² + varianza + ruido, 25 árboles en 3D, barras para profundidad 1, 3 y sin límite | 5 → 6 |
| 8 | Ejes del jurado y de la varianza a 15 px; 55 palabras en el último clic | Ejes a 20; la conclusión en su clic | Jurado de 60 %: 11 → 75 %, 101 → 98 %; fórmula con ρ; 84 %; 0.145 / 0.122 | 4 → 5 |
| 9 | Los diagramas de flujo se salen del cuerpo; rótulos de 14–17 px | Diagramas más altos con rótulos a 20, uno sobre otro si no caben lado a lado; el adelanto de resultados en su clic | Los dos caminos y el adelanto con los seis F1-macro | 3 → 4 |
| 10 | Tablero de sorteos con rótulos de 15 px | Agrandar | 5 pelotas, (1 − 1/n)ⁿ, 32.8 %, 36.8 %, ≈ 147 fuera, 200 sorteos con histograma | 4 → 4 |
| 11 | Tres gráficas a la vez (región 3D, corte 2D, error contra árboles); rótulos de 14–18 px; un rótulo encimado en el corte 2D | La región 3D y el corte 2D juntos (hermanas); la curva de error en su clic; la conclusión en su clic | Tres árboles votan; 1, 10 y 100 árboles; 22.4 % contra 19.9 % y su frase | 5 → 6 o 7 |
| 12 | Matriz 8 × 6 con 64 rótulos chicos; 61 palabras al final | Matriz con letra a 20 (celdas más grandes); la conclusión en su clic | Matriz "la vio / no la vio", OOB contra CV de 25 a 300 árboles, 84.85 / 84.80, 83.7 / 84.3, 1 contra 5 entrenamientos | 4 → 5 |
| 13 | Rótulos de 16 px | Agrandar | Consejeros, rejilla de 100 raíces, 100 de 100 `relationship` | 4 → 4 |
| 14 | 78 palabras en el clic de las tarjetas; 66 en el último | Tarjetas y recordatorio en clics distintos; comparación con bagging y la curva de variables sorteadas en clics distintos | Tarjetas de variables, raíces repartidas (27), √p, 0.783 → 0.785 | 5 → 7 |
| 15 | Barras con 35 rótulos chicos | Barras más altas con nombres a 20; si no caben las dos medidas lado a lado, una sobre otra | MDI contra permutación, ruido 1.º de 14 (0.176) y 0 | 4 → 4 o 5 |
| 16 | Tres gráficas chicas a la vez (540 px cada una); 63 palabras | Las cuatro perillas en un clic; cada gráfica en su clic, grande; la conclusión en su clic | Cuatro perillas, las tres gráficas, 85.0 % / 86.6 %, 0.23 puntos | 3 → 6 |
| 17 | 68 palabras en el último clic | La conclusión en su clic | Repasar lo fallado, modelo débil, stump de Adult 76.1 %, stump 3D | 4 → 5 |
| 18 | Juguete de 8 puntos con números de 14 px | Agrandar | Esquema de 8 puntos, rondas con ↑ ↓, tamaño = peso | 4 → 4 |
| 19 | Se sale del cuerpo en los clics 0 y 1; tabla de dos rondas con 33 rótulos chicos; fórmulas de 14 px | Una fórmula por clic a 28; la tabla de las dos rondas en dos clics (una ronda cada uno); barras de ε y α con ejes a 20 | Las tres fórmulas, las dos rondas a mano, ε → 0.5 y α → 0, "la mitad del peso", el doble de sklearn | 5 → 7 |

### Clase 2 · 20–28 (decisión 3)

| Diap. | Lo que está mal (medido) | Qué se hace | Clics |
|---|---|---|---|
| 20 | Se sale del cuerpo en los 5 clics; 77 palabras; fórmulas de 16 px | Superficie 3D y texto en clics separados; fórmulas a 28; η crítico (≈ 9.5) en el texto | 5 → 7 |
| 21 | 66 palabras en un clic; ejes de 14–15 px | Partir el clic de los residuos; ejes a 20 | 4 → 5 |
| 22 | Ejes y botones chicos | Agrandar; la regla "se decide con validación, se reporta con prueba" a 26 | 3 → 3 o 4 |
| 23 | 71 palabras; rejilla λ × γ con 69 rótulos chicos | Objetivo con su árbol de 3 hojas en un clic; la rejilla sola y grande en otro; la conclusión aparte | 4 → 6 |
| 24 | 67 palabras; muchas fórmulas a la vez | Máximo dos fórmulas por clic (g y h; luego w*); ejemplo de 4 personas en su clic; faltantes y tiempos en clics distintos | 5 → 7 |
| 25 | 184 palabras al final (tabla de 8 × 5) | Decisión 6 | 8 → 9 |
| 26 | 88 palabras; matriz con 48 rótulos chicos | Métricas una por clic a 26; la matriz real y los 5 pliegues en clics distintos | 10 → 12 |
| 27 | 98 palabras en el clic de advertencias; 62 rótulos chicos en los pliegues | Advertencias en dos clics; renglones de `PuntosIntervalo` más altos con nombres a 26 | 8 → 10 |
| 28 | 192 palabras (guía de 5 renglones con su evidencia) | Decisión 6: un renglón por clic con su evidencia; la dispersión tiempo contra F1-macro en su clic | 6 → 8 |

### Clase 2 · 29–40 (decisión 3)

| Diap. | Lo que está mal (medido) | Qué se hace | Clics |
|---|---|---|---|
| 29 | 73 palabras; tiras de 24 barras con rótulos chicos; tabla cruda | Recordatorio de i.i.d. en su clic; "qué se le cambia" aparte de la tabla cruda | 7 → 8 |
| 30 | 117 palabras en el último clic | Fuga y particiones en clics distintos; resultados (26.2 contra 67.2, 23.1 contra 43.0) en uno y el tope de 505 / 622 en otro | 7 → 9 |
| 31 | 68 palabras (definición y tabla contra serie) | Definición y comparación en clics distintos | 4 → 5 |
| 32 | 64 palabras | Partir definiciones | 4 → 5 |
| 33 | Rejilla año × mes con 174 números de 15–16 px | Rejilla más grande con números a 20 | 4 → 4 |
| 34 | 40 rótulos chicos por clic | Ejes a 20; descomposición en paneles más altos | 6 → 6 o 7 |
| 35 | 56 palabras; recordatorio | Recordatorio en su clic | 5 → 6 |
| 36 | 34 rótulos chicos (`OperacionAnimada`) | Agrandar | 7 → 7 |
| 37 | 79 palabras; escala de p y tabla | Esquema del estadístico y la tabla de ADF en clics distintos | 7 → 9 |
| 38 | 60 palabras; 52 rótulos chicos | Agrandar; conclusión aparte | 4 → 5 |
| 39 | Se sale del cuerpo; 75 palabras; fórmula de 13 px | Definiciones y fórmula a 28 en un clic; correlograma grande en otro | 5 → 7 |
| 40 | 65 palabras | Definición de la PACF aparte del correlograma | 5 → 6 |

### Clase 3 · 41–50 y 60 (decisión 4)

| Diap. | Lo que está mal (medido) | Qué se hace | Clics |
|---|---|---|---|
| 41 | 79 palabras; 49 rótulos chicos | Nube 3D y correlograma en clics distintos o como hermanas a buen tamaño; texto partido | 5 → 6 |
| 42 | Una gráfica se sale; 70 palabras | Ecos y nube en clics distintos | 5 → 6 |
| 43 | 98 palabras; 47 rótulos chicos | Definición, ecos, ACF teórica y pronóstico en clics separados | 5 → 7 |
| 44 | 82 palabras y 82 rótulos chicos | Dos correlogramas hermanos grandes; parsimonia en su clic | 4 → 6 |
| 45 | 81 palabras; 61 rótulos chicos | Integrar, ARIMA en el caso y la tabla de MAE en clics distintos | 5 → 7 |
| 46 | 91 rótulos chicos (ACF y PACF + tabla) | ACF y PACF hermanas a todo lo ancho; la lectura de órdenes en su clic | 5 → 7 |
| 47 | Se sale; 71 palabras | Dos relojes en un clic; cintas 3D en otro; la fórmula aparte | 6 → 8 |
| 48 | Tres columnas a 536 px; 149 palabras; fórmulas de 10.5 px; se sale | Una pregunta a la vez, a todo lo ancho: (1) AIC/BIC y la rejilla; (2) MAE, RMSE, MAPE con su tira de errores; (3) Ljung-Box con la escala de p y la ACF de residuos; al final un resumen de tres renglones. La advertencia de los 6 de 15 en su clic | 7 → 12 |
| 49 | 95 palabras; tabla | Tabla de métricas y gráfica en clics distintos | 4 → 6 |
| 50 | 98 rótulos chicos; tabla de 12 px; se sale | Tabla de ADF con letra a 20 en su clic; origen móvil grande en otro | 7 → 10 |
| 60 | 53 palabras; rótulos de 15 px | Agrandar; conclusión aparte | 6 → 6 o 7 |

### Para decir de palabra

*Se llena al construir (20–50 y 60): cada aclaración secundaria que sale de la pantalla, con la diapositiva y el clic donde
se dice. Nada de 1–19 entra aquí sin permiso del usuario.*

## 7. Orden de construcción

Son unas 50 diapositivas: no cabe en una sola sesión. Cada tanda termina con build, verify, medidor y bitácora, para que
otra sesión siga desde ahí.

- [x] **Tanda 0 · Piezas compartidas:** `tipografia.ts`, `theme.css`, `Piezas`, `Receta`, `Scene3D` y las piezas de la
      sección 5; `scripts/legibilidad.js` (decisión 10). Se vuelve a medir todo: lo que quede es por diapositiva.
- [x] **Tanda 1 · Clase 1:** 1, 3–9; luego 10–14; luego 15–19. *(La guía, decisión 8, espera la confirmación del usuario.)*
- [x] **Tanda 2 · Clase 2, primera parte:** 20–28.
- [ ] **Tanda 3 · Clase 2, segunda parte:** 29–40. Al terminar, la guía (decisión 8).
- [ ] **Tanda 4 · Clase 3:** 41–50 y 60.
- [ ] **Cierre del hito** (sección 8).

## 8. Cómo se da por terminado

1. `npm run build` sin errores y `npm run verify` con "Todo coincide".
2. **El medidor sobre las 50 diapositivas:** ningún texto visible menor a 18 px; ningún rótulo menor a 20 px (salvo la
   pista 3D de la decisión 1); ningún texto de lectura menor a 26 px; nada que se salga del cuerpo; ningún encimado.
3. Cada diapositiva tocada, vista en el navegador clic por clic (capturas cuando el panel lo permita), sin errores en
   consola.
4. **Contenido de 1–19 conservado:** se repasa la guía ficha por ficha contra la pantalla.
5. `steps` de `index.ts` y `docs/PLAN-DIAPOSITIVAS.md` al día con los clics nuevos.
6. Bitácora al día, con lo que no se revisó. `docs/HANDOFF.md` dice qué quedó. En `CLAUDE.md` se quita "Las diapositivas
   1–50 … todavía no se ajustan" y se agrega `tipografia.ts` a las piezas.
7. Al usuario: nada se publica hasta que él haga commit y push.

## 9. Bitácora

### 2026-10-14 · Antes de construir (medición para escribir el plan)

- Guía de estudio encontrada como artifact (sección 2). Medición completa con el iframe (≈ 6 min por pasada, 254
  posiciones). El primer intento, en la página misma, salió vacío: con el panel oculto, motion deja todo a opacidad 0.
- No se tocó ningún archivo de `src/`.

### 2026-10-14 · Tanda 0 (piezas compartidas)

- **Hecho:** `src/deck/tipografia.ts` (`TIPO`, `R`, `anchoMono`, `margenIzq`); en `theme.css`, las variables
  `--fs-lectura`, `--fs-rotulo` y `--fs-ayuda`, el encabezado, `.label`, `.chip`, `.axis3d`, `.recap p` y `.help` a sus
  tamaños, `.katex` a 1.1 em (junto a texto de 26 px da ≈ 29 px) y la clase `.pista3d` (la pista de las escenas 3D, a 18 px,
  solo con el cursor en movimiento). `Piezas` (`Def` 26, `BarraClases` 20, el rótulo de `Dato` marcado como rótulo),
  `Receta`, `Scene3D`. Todas las piezas en SVG llevan sus números y rótulos a 20 px y calculan el margen con el ancho real
  de los números (`Lineas`, `Barras`, `Dispersion`, `CalendarGrid`, `PValueScale`, `SplitDiagram`, `PuntosIntervalo`),
  `SeriesChart` espacia las marcas de años para que no se encimen, `TreeDiagram` parte el detalle en dos renglones cuando
  no cabe, `TablaCruda` es más compacta (padding 2 px), `AicGrid` y `MetricTable` sin texto menor a 20, `Lineas` acepta
  `ancla` en las marcas (para las del borde derecho).
- **El medidor** quedó en `scripts/legibilidad.js` (decisión 10). Clasifica cada texto en lectura, rótulo o fórmula; los
  subíndices, exponentes y fracciones chicas de KaTeX solo cuentan para el mínimo de 18. **`data-rotulo`** marca un
  contenedor cuyo texto es rótulo aunque no sea monoespaciado (los datos de una ficha o una tabla, la leyenda de
  `RejillaRaices`). Para usarlo sin que el HMR lo borre, se carga desde `http://localhost:5180/README.md`; trae `irA("3/4")`
  para capturas y `medirOtraVez(desde, hasta)`.
- **Efecto medido:** sin tocar ninguna diapositiva, la 4 pasó de 25 textos < 18 px a 0, y casi todas bajaron a la mitad.

### 2026-10-14 · Tanda 1 (clase 1: 1, 3–19)

- **Pasada mecánica** (`fontSize` < 20 → 20 en todas; lectura de 21–25 px → 26) y luego, diapositiva por diapositiva, lo
  que no cupo. **Ningún texto ni cifra salió de pantalla** (decisión 2): lo que no cabía se partió en clics.
- **Clics que cambiaron** (también en `index.ts` y en el plan maestro): 3 (8 → 10), 11 (5 → 6), 12 (4 → 5), 14 (5 → 6),
  16 (3 → 5), 17 (4 → 5), 19 (5 → 6). En total, de 77 a 86 clics en la clase 1.
- **Otros cambios de disposición, sin cambiar clics:** 4 (escena 3D más baja para que quepa la conclusión), 5 (más margen
  abajo en la curva de error: sus números chocaban con "profundidad máxima"), 6 (el juguete de 6 puntos más chico), 7 (los
  botones de profundidad a la izquierda del rótulo; la escena 3D más baja; columnas de 900 y 720), 9 (en el adelanto se
  pliegan los dos diagramas y los puntos de F1-macro son más grandes), 15 (el título de la permutación en dos renglones,
  renglones más altos), 19 (cada caso de la actualización de pesos en su renglón; `\dfrac` y `\exp` en lugar de una
  fracción y un exponente dentro de otro, que dejaban subíndices de 16 px; tabla a 22 px).
- **Medición final de 1–19:** 0 textos < 18 px, 0 rótulos < 20, 0 lectura < 26, 0 fórmulas < 28, nada se sale, sin
  encimados (el único que marca es el título de la portada, de 132 px con interlineado apretado a propósito).
- **Más de 45 palabras en un clic (se dejó así):** 3 (receta: 4 columnas cortas, 67), 3 (receta con Adult, 62), 4 (Gini,
  50), 7 (cierre, 51), 11 (cierre, 52), 14 (concepto, 55), 16 (las 4 perillas, 54; las tres gráficas con sus pies, 63),
  17 (60), 18 (48). Son columnas o pies de gráfica cortos, legibles a 26 px; partirlos más separaría lo que se compara.
- **Capturas vistas:** 3 (3, 4, 6, 1), 4 (5), 7 (4), 9 (2), 11 (3), 14 (4), 15 (3), 16 (4), 19 (1, 3). Las escenas 3D a veces
  salen en blanco en la captura del iframe (el lienzo no alcanza a pintar); su disposición sí se ve.
- **Pendiente de la clase 1:** la guía de estudio (decisión 8) necesita la confirmación del usuario antes de tocarla.

### 2026-10-14 · Tanda 2 (20–28)

- **Misma pasada mecánica y luego una por una.** Decisión 3: la redacción se pudo acortar, pero **no hizo falta quitar
  nada de pantalla**: todo lo que había sigue visible en algún clic. "Para decir de palabra" sigue vacía.
- **Clics que cambiaron:** 23 (4 → 5), 24 (5 → 7), 25 (8 → 9), 26 (10 → 11), 27 (8 → 10). Siguen igual 20, 21, 22 y 28.
- **Disposición:** 20 (la escena ocupa el alto del cuerpo; el recordatorio del gradiente solo en el clic 0; en el caso, un
  bloque por clic bajo la fórmula del modelo), 21 (la receta de 4 pasos y la fórmula en clics distintos; escena y curva más
  bajas), 23 (rejilla con celdas más compactas; su lectura en tres clics), 24 (faltantes en tres clics), 25 (decisión 6:
  renglón nuevo completo, los anteriores en una o dos palabras; el renglón de etiquetas equivocadas con su párrafo en un
  clic aparte), 26 (el modelo que siempre dice "no" en dos clics; la conclusión dentro de la columna derecha), 27 (los tres
  avisos, uno por clic), 28 (renglón con su evidencia y los anteriores en una línea; la conclusión en la columna izquierda;
  la dispersión con más margen para que el título del eje no choque con los números).
- **Hallazgo de método:** un `Reveal` oculto ocupa lugar. En la 20 empujaba la escena 3D fuera del cuerpo aunque no se
  viera. Donde estorba, el bloque se monta solo en su clic.
- **Más de 45 palabras en un clic (se dejó así):** 24 (53 y 67: la tabla de la hoja y el texto de velocidad), 25 (49 a 88:
  los renglones resumidos son una o dos palabras por celda), 26 (54), 28 (47 a 73, la misma razón que en la 25).
- **Capturas vistas:** 25 (4 y 8), 28 (3 y 5). Medición de 20–28: sin texto < 18, rótulos < 20, lectura < 26 ni fórmulas
  < 28, y nada se sale salvo lo corregido después de esa medición en 20 y 28 (falta medirlo otra vez: ver la medición final).
- **Pendiente anotado, fuera de este hito:** la 23 escribe a mano "λ = 100 y γ = 5" en el texto (regla 4). No se tocó
  porque es contenido, no tamaño.
