# Exposición ML — U7 Ensambles y U8 Datos secuenciales

App web de diapositivas (Vite + React 19 + TypeScript) para una exposición de Aprendizaje Máquina en ESCOM-IPN.
Solo la editamos el usuario y Claude. Responder siempre en español.

**Antes de trabajar, leer `docs/HANDOFF.md`** (estado actual y qué sigue) y, para la diapositiva que toque, su entrada en
`docs/PLAN-DIAPOSITIVAS.md`.

## Reglas del usuario (no negociables)

1. **Todo se explica desde cero.** El público son compañeros que no tienen claras métricas, validación ni algoritmos.
   No se citan las prácticas de la materia ni sus resultados (cada quien las hizo distinto); sí se usan los mismos temas.
2. **El foco son los ensambles, las series de tiempo y HMM**, no los conceptos súper básicos. Los fundamentos van como
   recuadro `Recap` dentro de la diapositiva del tema (máximo un tercio). Solo 3, 5, 20 y 26 son diapositivas de fundamentos.
3. **Concepto → caso.** Cada diapositiva explica primero el concepto (definición + esquema o ejemplo mínimo, marcado
   "Esquema" si es ilustrativo) y, en los últimos clics, lo aplica al caso de estudio. Al entrar al caso se pasa la prop
   `caso` a `SlideFrame` y aparece la etiqueta "Caso · …" en el encabezado.
4. **Rigor: ningún número se escribe a mano.** Lo exacto se calcula en el navegador (`src/lib/`); lo demás se precalcula con
   Python a `src/data/*.json`. Todo cálculo en TypeScript se compara contra sklearn / statsmodels / hmmlearn en
   `scripts/verificar.ts`. Si un dato contradice lo planeado, se muestra el dato y se reescribe el texto.
5. **Sin recortes por tiempo.** Hay hasta 3 clases de 1.5 h (máximo 4 h). Reparto: clase 1 = 1–19, clase 2 = 20–40,
   clase 3 = 41–64. No proponer versiones cortas.
6. **Estilo:** negro/gris oscuro con acento rojo, sobrio y editorial. Prohibido el estilo genérico "AI slop": nada de
   degradados de colores, tarjetas con íconos, emojis ni glassmorphism. 3D solo cuando ayuda a entender.
7. **Commits solo cuando el usuario los pida.** El repo git es la carpeta abuela (`Ingenieria-en-Inteligencia-Artificial-IIA-`).
8. **El dataset se enseña crudo antes de usarlo.** La primera vez que un tema usa un dataset se muestran sus primeras 5
   filas tal como llegan (como `df.head()`, con `TablaCruda`), explicando ese dataset en concreto: de dónde sale, qué es
   cada columna y qué se quiere predecir. Luego, qué se le cambia. Solo después va el método. Ya está en la 3 (Adult) y
   en la 4 (Adult con 3 columnas); falta en pasajeros aéreos (29–31) y en cualquier dato que use HMM.

## Casos de estudio

| Parte | Caso |
|---|---|
| U7 Ensambles | **Adult / Census Income**: ¿la persona gana > 50K? 48 842 personas, 23.9 % positivos. El archivo trae 14 columnas y se usan 13: se quita `fnlwgt` (peso censal, es del muestreo y no de la persona). Se conservan raza y sexo |
| U7, dibujos | **Adult con 3 variables** (edad, años de educación, horas por semana): entrena 10 000, prueba 5 000, se dibujan 400. Bootstrap, AdaBoost e inestabilidad entrenan con las 400 visibles |
| U8 Series | **Pasajeros aéreos** 1949–1960. Las 29–40 describen la serie completa; desde la 41 se aparta 1960 como prueba |
| U8 HMM | **Clima oculto**: π = (0.6, 0.4), A = [[0.7, 0.3], [0.4, 0.6]], B = [[0.1, 0.4, 0.5], [0.6, 0.3, 0.1]] |

## Comandos

```bash
npm run dev      # http://localhost:5180 (preview: configuración "exposicion" en .claude/launch.json)
npm run build    # tsc + un solo dist/index.html que funciona sin internet
npm run verify   # compara src/lib contra las referencias de Python; debe decir "Todo coincide"
.venv/Scripts/python scripts/exportar_hitoN.py   # regenera los JSON de src/data
```

## Convenciones del código

- **Una diapositiva = un archivo** `src/slides/NN-nombre.tsx` que recibe `{ step, active }`. Se registra en
  `src/slides/index.ts` con su `num` (el de la estructura de 64) y su número de `steps` (clics).
- **Lienzo fijo de 1920×1080** escalado. El cuerpo útil mide ≈ 1696 × 640 px. Texto de lectura ≥ 22 px; etiquetas ≥ 14 px.
- **Color con significado fijo:** rojo = clase positiva, datos de prueba o lo que se resalta; gris claro (`--data`) = contra
  qué se compara. Tokens en `src/theme.css`.
- **`.label` pasa el texto a mayúsculas.** Si lleva letras griegas hay que usar `className="label natural"`
  (λ en mayúscula es Λ, otra letra).
- **Miles con `toLocaleString("es-MX")`** (48,842). Porcentajes con `pct()` de `Piezas`.
- **Etiquetas 3D:** se pasan a `Scene3D` por la prop `etiquetas`. No usar `Html` de drei (se pierde con React 19).
- **Toda escena 3D va dentro de `Scene3D`:** así hereda el giro, el zoom con la rueda (acotado) y el doble clic que
  regresa a la vista inicial.
- **Los archivos de `src/lib/` son puros** (no importan JSON) y se importan entre sí con extensión `.ts`, para que
  `node scripts/verificar.ts` los pueda ejecutar. Solo `lib/adult.ts` lee los JSON.
- **Cálculo pesado al montar:** dentro de `useEffect` con `setTimeout`, o por tandas (ver `11-agregacion.tsx`). No usar
  guardas con `useRef` que rompan en StrictMode.
- **Semillas fijas** (`mulberry32`) en todo lo aleatorio: la exposición debe ser repetible.
- Comentarios en español, breves, explicando el porqué. Nombres de dominio en español.

## Piezas disponibles

- `deck/`: `SlideFrame` (encabezado con la unidad y el tema en rojo, título, lede, `caso`), `useFlechas` (↑ ↓ propios de una diapositiva).
- `components/`: `Reveal`, `Recap`, `TeX`, `Piezas` (`Def`, `BarraClases`, `Chips`, `Boton`, `Dato`, `pct`), `Lineas`
  (gráfica de líneas con marcas, líneas horizontales y recorte), `PuntosIntervalo` (un renglón por modelo: puntos por
  pliegue y media ± desviación; se desliza si cambia la escala), `TablaCruda` (un dataset tal como llega, por bloques de
  columnas, con la opción de marcar lo que se quita, lo que se predice y los faltantes), `Receta`, `TreeDiagram` (+ `diagramaDe`),
  `FlujoEnsamble` (`FlujoParalelo`, `FlujoSecuencial`, `ArbolGlifo`), `TableroSorteos`, `RejillaRaices`, `JugueteAdaBoost`,
  `Scene3D`, `Adult3DScene` (personas, cajas, planos, `vista`, `vistaX/Y`), `VoteVolume3D` (+ `REJILLA`), `Surface3D`.
- `lib/`: `tree` (CART Gini), `bagging`, `adaboost`, `gboost`, `logistic`, `metricas` (matriz de confusión, accuracy,
  precision, recall, F1, F1-macro, media y desviación), `hmm`, `rng`, `scale`, `adult` (todos los JSON).

## Cómo se da por terminada una diapositiva

1. `npm run build` sin errores y `npm run verify` con "Todo coincide".
2. Revisada en el navegador clic por clic, sin errores en consola ni textos encimados.
3. Lo que cambió respecto al plan se anota en `docs/PLAN-DIAPOSITIVAS.md` ("Lo que cambió al construir…").
