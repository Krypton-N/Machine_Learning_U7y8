# Hito N — Nombre del hito (diapositivas X–Y)

> **Cómo usar esta plantilla.** Copiarla a `docs/hitos/HITO-N.md` y llenarla **antes** de construir. Las reglas del flujo
> están en `CLAUDE.md` ("Cómo se trabaja: un plan por hito"). Mientras el estado sea *Borrador* no se construye ninguna
> diapositiva. Borrar este recuadro y las indicaciones en cursiva al llenarla.

**Estado:** Borrador · *(Borrador → Aprobado el AAAA-MM-DD → En construcción → Cerrado el AAAA-MM-DD)*
**Última actualización:** AAAA-MM-DD

## 1. Alcance

*Qué diapositivas entran, a qué clase pertenecen, qué deben saber ya los asistentes al llegar (de qué diapositivas
anteriores depende) y qué deja listo para el hito siguiente. Qué queda fuera a propósito.*

## 2. Lo que se revisó para planear

*Qué se leyó (entradas del plan maestro, especificación, código existente) y qué se encontró. La especificación de
`docs/especificaciones/` es un borrador sin revisar: aquí se anota, diapositiva por diapositiva, lo que tiene mal o no se
puede sostener: errores de rigor, afirmaciones sin dato, cosas que no caben en 1696 × 640 px, términos sin definir, choques
con las reglas de `CLAUDE.md`. También lo que sí se toma tal cual.*

| Diapositiva | Se toma de la especificación | Se corrige o se descarta, y por qué |
|---|---|---|
| | | |

## 3. Decisiones que necesita el usuario

*Preguntas concretas, cada una con la opción que se recomienda y por qué. El plan se aprueba cuando estas quedan
respondidas. Si no hay ninguna, decirlo.*

1. …

## 4. Datos

- **Dataset crudo (regla 8):** *de dónde sale, cómo se guarda en caché, cuáles son sus columnas tal como llegan, en qué
  diapositiva y en qué clic se enseña crudo, y qué se le cambia antes de usarlo.*
- **Dependencias de Python:** *qué hay que instalar y si ya se comprobó que instala en el `.venv`.*
- **Script:** `scripts/exportar_hitoN.py`. *Qué JSON escribe, con qué protocolo (semillas, particiones) y cuánto tarda.*

| JSON | Qué trae | Lo usan |
|---|---|---|
| | | |

- **Vivo, esquema o JSON:** *para cada cifra o gráfica: se calcula en el navegador, es un esquema ilustrativo (marcado
  "Esquema") o viene precalculada.*
- **Verificación:** *qué funciones nuevas de `src/lib/` se comparan contra qué función de qué librería, con qué tolerancia,
  y qué comprobaciones se agregan a `scripts/verificar.ts`.*
- **Números "esperados" del plan maestro:** *cuáles hay que recalcular; si el dato sale distinto, se muestra el dato y se
  reescribe el texto.*

## 5. Piezas

*Componentes y funciones nuevas, con su nombre definitivo y su API en una línea. Qué se reutiliza de lo que ya existe
(`CLAUDE.md`, "Piezas disponibles"). Cambios al deck, si hacen falta.*

| Pieza | Nueva o existente | Para qué | La usan |
|---|---|---|---|
| | | | |

## 6. Diapositiva por diapositiva

*Una subsección por diapositiva. Tiene que bastar para construirla sin volver a la especificación.*

### NN · Título

- **Encabezado:** `section`, etiqueta de caso.
- **Clics:** *lista numerada desde 0: qué aparece en cada uno. Concepto primero; el caso, en los últimos.*
- **Recordatorio:** *si lleva recuadro de fundamentos, cuál (máximo un tercio de la diapositiva).*
- **Visuales:** *qué se dibuja, con qué pieza, y qué controla el expositor (botones, ↑ ↓).*
- **Datos:** *vivo, esquema o JSON, y de dónde.*
- **Cierre:** *la frase que se lleva el público.*
- **Riesgos:** *lo que puede no caber, no salir como se espera o tardar.*

## 7. Orden de construcción

*Por tandas que se puedan terminar y revisar por separado. Se marca cada casilla al terminarla, para que otra sesión sepa
por dónde seguir.*

- [ ] **Tanda 0 · Base:** dependencias, script de datos, librería de cálculo, verificación, piezas compartidas.
- [ ] **Tanda 1:** diapositivas …
- [ ] **Cierre del hito** (ver sección 8).

## 8. Cómo se da por terminado

1. `npm run build` sin errores y `npm run verify` con "Todo coincide".
2. Cada diapositiva vista en el navegador clic por clic, sin errores en consola ni textos encimados.
3. Revisión de rigor (cada afirmación en pantalla tiene su dato) y de claridad (se entiende desde cero).
4. Bitácora de abajo al día, con lo que **no** se revisó.
5. `docs/HANDOFF.md`, `CLAUDE.md` ("Piezas disponibles") y la subtarea 195 de ListKeeper actualizados. Si cambió lo que
   lleva una diapositiva, se corrige su entrada en `docs/PLAN-DIAPOSITIVAS.md`.

## 9. Bitácora

*Se llena al construir, con fecha. Es el registro del hito: sustituye a las secciones "Lo que cambió al construir…" del
plan maestro.*

- **Lo que cambió respecto a este plan, y por qué.**
- **Hallazgos:** *lo que dijeron los datos, sobre todo si contradijo lo planeado.*
- **Lo que no se revisó o quedó pendiente.**
