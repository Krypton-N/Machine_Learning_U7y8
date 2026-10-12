# Exposición ML — U7 Ensambles y U8 Datos secuenciales

Presentación como aplicación web (Vite + React + TypeScript). Cada diapositiva es un archivo en `src/slides/`.
La estructura completa (64 diapositivas) está en la nota de ListKeeper "Handoff — Estructura exposición ML U7 y U8".

## Correr

```bash
npm install
npm run dev
```

Para presentar sin internet: `npm run build` genera **un solo archivo** `dist/index.html` con todo adentro, incluidas las fuentes.
Se abre con doble clic en cualquier navegador.

## Controles

| Tecla | Acción |
|---|---|
| → · Espacio · PageDown | siguiente paso o diapositiva (funciona con presentador inalámbrico) |
| ← · PageUp | paso anterior |
| F | pantalla completa |
| Inicio / Fin | primera / última |
| ↑ ↓ | controles propios de algunas diapositivas (p. ej. la profundidad del árbol en la 5) |

La URL guarda la posición (`#/20/2` = diapositiva 20, paso 2).

## Cómo agregar una diapositiva

1. Crear `src/slides/NN-nombre.tsx` con un componente que reciba `{ step, active }` y use `SlideFrame`.
2. Registrarla en `src/slides/index.ts` con su `num` (el de la estructura) y cuántos `steps` tiene.

Piezas disponibles: `SlideFrame` (encabezado, título y lede), `Reveal` (aparece en el paso `at`),
`Recap` (recuadro de fundamentos), `TeX` (fórmulas con KaTeX). Colores y tipografía en `src/theme.css`.

## Caso de estudio y datos

Cada diapositiva explica primero el **concepto** y después lo aplica al **caso** (aparece la etiqueta "Caso · …" en el encabezado).

| Parte | Caso |
|---|---|
| U7 Ensambles | Adult / Census Income (UCI): ¿la persona gana más de 50K al año? 48 842 personas, 14 variables |
| U8 Series de tiempo | Pasajeros aéreos 1949–1960 |
| U8 HMM | Clima oculto y lo que hace el amigo (ejemplo clásico) |

Los dibujos usan **Adult con 3 variables** (edad, años de educación, horas por semana): se entrena con 10 000 personas,
se prueba con 5 000 y se dibujan 400. Los resultados finales salen del Adult completo.

Antes de usar un dataset se muestra tal como llega (sus primeras 5 filas, con `TablaCruda`) y qué se le cambia. De Adult se
quita `fnlwgt`, el peso censal, porque describe el muestreo y no a la persona: los modelos usan 13 variables.

Los JSON de `src/data/` se generan con Python (entorno propio en `.venv`):

```bash
.venv/Scripts/python scripts/exportar_datos.py
.venv/Scripts/python scripts/exportar_hito1.py
.venv/Scripts/python scripts/exportar_hito2.py
.venv/Scripts/python scripts/exportar_hito3.py      # comparación de los 7 modelos, matrices, curvas y ruido (≈ 15 min)
.venv/Scripts/python scripts/comparar_ensambles.py  # solo imprime la comparación; no escribe JSON
```

Para comprobar que los cálculos del navegador coinciden con los de Python:

```bash
npm run verify
```

El plan de cada diapositiva está en `docs/PLAN-DIAPOSITIVAS.md`.

Verificaciones hechas: el árbol de `src/lib/tree.ts` da el mismo accuracy que `DecisionTreeClassifier` de sklearn hasta
profundidad 5; a partir de ahí difiere como máximo 0.0014 (7 de 5 000 personas), porque sklearn desempata cortes iguales con
un orden aleatorio de variables. El descenso de gradiente de `src/lib/logistic.ts` llega al mismo (w*, b*) y a la misma
log-loss (0.489074) que `LogisticRegression` sin regularización.

## Regla de rigor

Ningún número se escribe a mano. Lo que se puede calcular exacto en el navegador se calcula en `src/lib/`
(árbol CART, Forward, Viterbi, descenso de gradiente). Lo que no (CV con XGBoost, ARIMA, ADF, Ljung-Box) se va a
calcular con un script de Python que exporte JSON, y la diapositiva solo lo anima.
