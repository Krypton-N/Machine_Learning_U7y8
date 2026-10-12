# Exposición ML — U7 Ensambles y U8 Datos secuenciales

Presentación como aplicación web (Vite + React + TypeScript). Cada diapositiva es un archivo en `src/slides/`.
La estructura completa (64 diapositivas) está en `docs/PLAN-DIAPOSITIVAS.md`.

**Publicada en:** https://krypton-n.github.io/Machine_Learning_U7y8/

## Correr

```bash
npm install
npm run dev
```

Para presentar sin internet: `npm run build` genera **un solo archivo** `dist/index.html` con todo adentro, incluidas las fuentes.
Se abre con doble clic en cualquier navegador.

## Publicar en GitHub Pages

La página se actualiza sola: **cada push a la rama `main`** dispara el workflow `.github/workflows/pages.yml`, que en
GitHub instala las dependencias, corre `npm run build` y publica `dist/index.html`. No hay rama `gh-pages` ni hay que subir
el archivo compilado (`dist/` está en `.gitignore`).

Para actualizar la página:

```bash
git add .
git commit -m "Lo que cambió"
git push
```

Un commit sin `push` no publica nada: lo que cuenta es que llegue a `main` en GitHub. Tarda cerca de un minuto.

- **Antes de subir**, comprobar en local que compila: `npm run build` y `npm run verify`. Si el build falla en GitHub, la
  página se queda con la versión anterior.
- **Para ver si se publicó:** pestaña *Actions* del repo → "Publicar en GitHub Pages". Deben quedar en verde `build` y
  `deploy`. Si alguno falla, al abrirlo se ve el paso y el mensaje de error; se corrige y se vuelve a hacer push, o se
  repite con *Re-run all jobs*.
- **Para publicar sin cambios** (por ejemplo, si un despliegue se quedó a medias): *Actions* → "Publicar en GitHub Pages" →
  *Run workflow*.
- **Configuración que ya está hecha y no hay que repetir:** en *Settings → Pages*, *Source* = **GitHub Actions**. El repo
  tiene que ser público para que Pages funcione con cuenta gratuita.
- **Enlaces directos:** la posición va en la URL, así que se puede compartir una diapositiva concreta:
  `https://krypton-n.github.io/Machine_Learning_U7y8/#/26/3` abre la 26 en su paso 3.
- Los avisos amarillos de "Node.js 20 is deprecated" en *Actions* no son errores.

No hace falta Python para publicar: los JSON de `src/data/` van en el repo. Solo se regeneran a mano cuando cambian los datos.

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
