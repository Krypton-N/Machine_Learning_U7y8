// Comprueba los cálculos de src/lib contra las referencias de Python guardadas en src/data.
// Uso: npm run verify
import { readFileSync } from "node:fs";
import { adaboost, errorPorRonda } from "../src/lib/adaboost.ts";
import { accuracyPorTamano, arbolBootstrap } from "../src/lib/bagging.ts";
import { logLossDe, puntajeInicial, rondaLogLoss, valorArbol } from "../src/lib/gboost.ts";
import { CLIMA, CLIMA_PERSISTENTE, OBS_EJEMPLO, fmtP } from "../src/lib/clima.ts";
import {
  casillaMasAlta,
  conteoMultiplicaciones,
  diaUnderflow,
  enumerarCaminos,
  forward,
  forwardEscalado,
  pasosForward,
  probConjunta,
  rachas,
  simular,
  suavizado,
  viterbi,
  viterbiLog,
  type HMM,
} from "../src/lib/hmm.ts";
import { logLoss, logLossGrad, type Grupo } from "../src/lib/logistic.ts";
import { contar, desdeSklearn, desviacion, exactitud, f1Macro, media, sumar, total } from "../src/lib/metricas.ts";
import { mulberry32 } from "../src/lib/rng.ts";
import {
  acf,
  acfTeorica,
  acumular,
  ajustarAR,
  banda95,
  bandaBartlett,
  barajar,
  caminata,
  choques,
  colaChi2,
  descomponer,
  desviacionMuestral,
  diferencia,
  filtroMA1,
  ingenuoEstacional,
  kfoldBarajado,
  ljungBox,
  mae,
  mape,
  minimosCuadrados,
  pacf,
  particionTemporal,
  pearson,
  pesosPi,
  pesosPsi,
  porPeriodo,
  productosRezago,
  promedioMovil,
  pronosticarAR,
  rmse,
  simularAR,
  simularARMA,
} from "../src/lib/series.ts";
import { accuracy, fitClassifier, predictProba, type ClassNode } from "../src/lib/tree.ts";

const leer = (nombre: string) => JSON.parse(readFileSync(new URL(`../src/data/${nombre}`, import.meta.url), "utf-8"));
let fallos = 0;
function comprobar(nombre: string, ok: boolean, detalle: string) {
  console.log(`${ok ? "  ok " : "FALLA"}  ${nombre} — ${detalle}`);
  if (!ok) fallos++;
}

// ---------- Árbol CART contra DecisionTreeClassifier ----------
const a3 = leer("adult3d.json");
const E = a3.entrenamiento;
const P = a3.prueba;
let maxDif = 0;
for (const r of a3.referencia_sklearn) {
  const t = fitClassifier(E.X, E.y, r.profundidad);
  maxDif = Math.max(maxDif, Math.abs(accuracy(t, E.X, E.y) - r.acc_entrenamiento), Math.abs(accuracy(t, P.X, P.y) - r.acc_prueba));
}
// Con cortes empatados sklearn desempata al azar: se tolera hasta 0.002 (10 de 5 000 personas).
comprobar("árbol vs sklearn, profundidades 1–15", maxDif <= 0.002, `diferencia máxima de accuracy ${maxDif.toFixed(4)}`);

const ref1 = leer("referencias_hito1.json");
type Plano = { variable: number | null; umbral: number | null; n: number; positivos: number };
function aplanar(n: ClassNode, out: Plano[] = []) {
  out.push({ variable: n.leaf ? null : n.feature, umbral: n.leaf ? null : n.threshold, n: n.n, positivos: n.pos });
  if (!n.leaf) {
    aplanar(n.left, out);
    aplanar(n.right, out);
  }
  return out;
}
const mio = aplanar(fitClassifier(E.X, E.y, 2));
const suyo: Plano[] = ref1.arbol_profundidad_2;
const igual =
  mio.length === suyo.length &&
  mio.every((m, i) => m.variable === suyo[i].variable && m.umbral === suyo[i].umbral && m.n === suyo[i].n && m.positivos === suyo[i].positivos);
comprobar("árbol de profundidad 2, nodo por nodo", igual, `${mio.length} nodos`);

// ---------- Bagging contra BaggingClassifier (el azar es distinto: se compara contra su rango) ----------
const rand = mulberry32(11);
const todos = E.X.map((_: unknown, i: number) => i);
const t0 = performance.now();
const trees = Array.from({ length: 100 }, () => arbolBootstrap(E.X, E.y, todos, rand).tree);
const ms = performance.now() - t0;
const accB = accuracyPorTamano(trees, P.X, P.y);
for (const B of [1, 10, 100]) {
  const r = ref1.bagging_adult3d[String(B)];
  const margen = B === 1 ? 0.01 : 0.006;
  comprobar(
    `bagging Adult-3D con ${B} árboles`,
    accB[B - 1] >= r.min - margen && accB[B - 1] <= r.max + margen,
    `TS ${accB[B - 1].toFixed(4)} · sklearn ${r.media.toFixed(4)} [${r.min.toFixed(4)}, ${r.max.toFixed(4)}]`,
  );
}
console.log(`       (100 árboles sin límite sobre 10 000 personas: ${ms.toFixed(0)} ms)`);

// ---------- Identidad de la diapositiva 7: error medio de los árboles = error del promedio + varianza ----------
{
  const r = mulberry32(7);
  const orden = [...todos].sort(() => r() - 0.5);
  const grupos = Array.from({ length: 25 }, (_, g) => orden.slice(g * 400, (g + 1) * 400));
  const arboles = grupos.map((g) => fitClassifier(E.X, E.y, Infinity, g));
  let errMedio = 0;
  let errProm = 0;
  let varianza = 0;
  for (let i = 0; i < P.X.length; i++) {
    const ps = arboles.map((t) => predictProba(t, P.X[i]));
    const m = ps.reduce((s, p) => s + p, 0) / ps.length;
    errMedio += ps.reduce((s, p) => s + (p - P.y[i]) ** 2, 0) / ps.length;
    errProm += (m - P.y[i]) ** 2;
    varianza += ps.reduce((s, p) => s + (p - m) ** 2, 0) / ps.length;
  }
  const n = P.X.length;
  comprobar(
    "identidad error medio = error del promedio + varianza",
    Math.abs(errMedio / n - errProm / n - varianza / n) < 1e-12,
    `${(errMedio / n).toFixed(4)} = ${(errProm / n).toFixed(4)} + ${(varianza / n).toFixed(4)}`,
  );
}

// ---------- AdaBoost contra AdaBoostClassifier (400 personas visibles, stumps) ----------
{
  const ref = leer("referencias_hito2.json").adaboost_400;
  const vX = a3.vista.map((i: number) => E.X[i]);
  const vY = a3.vista.map((i: number) => E.y[i]);
  const rondas = adaboost(vX, vY, 50);
  // sklearn guarda ln((1−ε)/ε), que es el doble del α binario.
  const difEps = Math.max(...rondas.map((r, m) => Math.abs(r.eps - ref.error_ponderado[m])));
  const difAlfa = Math.max(...rondas.map((r, m) => Math.abs(2 * r.alpha - ref.peso_sklearn[m])));
  const errP = errorPorRonda(rondas, P.X, P.y);
  const difErr = Math.max(...errP.map((e, m) => Math.abs(e - ref.error_prueba[m])));
  comprobar(
    "AdaBoost vs sklearn, 50 rondas",
    rondas.length === 50 && difEps < 1e-9 && difAlfa < 1e-9 && difErr < 1e-12,
    `ε₁ = ${rondas[0].eps.toFixed(4)} · diferencias máximas: ε ${difEps.toExponential(1)}, α ${difAlfa.toExponential(1)}, error de prueba ${difErr.toExponential(1)}`,
  );
  // Tras actualizar los pesos, los mal clasificados suman exactamente la mitad.
  const mitad = Math.max(
    ...rondas.map((r) => Math.abs(r.pesos.reduce((s, w, i) => ((r.stump.feature < 0 || vX[i][r.stump.feature] <= r.stump.threshold ? r.stump.left : r.stump.right) === (vY[i] ? 1 : -1) ? s : s + w), 0) - 0.5)),
  );
  comprobar("AdaBoost: los errores pesan la mitad tras actualizar", mitad < 1e-12, `desviación máxima ${mitad.toExponential(1)}`);
}

// ---------- Gradient Boosting con log-loss contra GradientBoostingClassifier ----------
{
  const ref = leer("referencias_hito2.json").gboost_adult3d;
  const F = new Float64Array(E.X.length).fill(puntajeInicial(E.y));
  const Fp = new Float64Array(P.X.length).fill(puntajeInicial(E.y));
  let difE = 0;
  let difP = 0;
  for (let m = 0; m < 50; m++) {
    const arbol = rondaLogLoss(E.X, E.y, F, ref.tasa, ref.profundidad);
    for (let i = 0; i < P.X.length; i++) Fp[i] += valorArbol(arbol, P.X[i]);
    difE = Math.max(difE, Math.abs(logLossDe(F, E.y) - ref.logloss_entrenamiento[m]));
    difP = Math.max(difP, Math.abs(logLossDe(Fp, P.y) - ref.logloss_prueba[m]));
  }
  comprobar(
    "Gradient Boosting vs sklearn, 50 rondas",
    difE < 1e-6 && difP < 1e-6,
    `log-loss de prueba final ${logLossDe(Fp, P.y).toFixed(4)} · diferencias máximas: entrenamiento ${difE.toExponential(1)}, prueba ${difP.toExponential(1)}`,
  );
}

// ---------- Métricas contra accuracy_score y f1_score(average="macro"), pliegue por pliegue ----------
{
  const mat = leer("matrices_adult.json");
  const comp = leer("comparacion_adult.json");
  type Fila = { modelo: string; pliegues: number[][]; accuracy: number[]; f1_macro: number[] };
  const filas: Fila[] = [...mat.modelos, { modelo: "Árbol podado", ...mat.arbol_podado }];
  let dif = 0;
  for (const f of filas) {
    f.pliegues.forEach((p, k) => {
      const m = desdeSklearn(p);
      dif = Math.max(dif, Math.abs(exactitud(m) - f.accuracy[k]), Math.abs(f1Macro(m) - f.f1_macro[k]));
    });
  }
  comprobar("accuracy y F1-macro vs sklearn, 8 modelos × 5 pliegues", dif < 1e-12, `diferencia máxima ${dif.toExponential(1)}`);

  // La media ± desviación que se muestra sale de los mismos 5 valores, y cada persona cae en un solo pliegue.
  let difResumen = 0;
  for (const c of comp) {
    for (const k of ["accuracy", "f1_macro", "auc"]) {
      difResumen = Math.max(difResumen, Math.abs(media(c[k].pliegues) - c[k].media), Math.abs(desviacion(c[k].pliegues) - c[k].desv));
    }
  }
  const n = leer("adult_muestra.json").n;
  const completas = filas.every((f) => total(sumar(f.pliegues.map(desdeSklearn))) === n);
  comprobar("media ± desviación de los pliegues y matrices completas", difResumen < 1e-12 && completas, `diferencia máxima ${difResumen.toExponential(1)} · cada matriz suma ${n} personas`);

  // Los dos modelos de esquema de la diapositiva 26 empatan en accuracy y se separan en F1-macro.
  const real = [0, 1, 0, 0, 1, 0, 0, 1, 0, 0];
  const a = contar(real, [0, 1, 1, 0, 0, 0, 1, 1, 0, 0]);
  const no = contar(real, real.map(() => 0));
  comprobar(
    "esquema de la 26: mismo accuracy, distinto F1-macro",
    exactitud(a) === exactitud(no) && Math.abs(f1Macro(a) - (4 / 7 + 10 / 13) / 2) < 1e-15 && Math.abs(f1Macro(no) - 7 / 17) < 1e-15,
    `accuracy ${exactitud(a)} y ${exactitud(no)} · F1-macro ${f1Macro(a).toFixed(4)} y ${f1Macro(no).toFixed(4)}`,
  );

  // Con 300 árboles, la curva de error debe terminar donde la comparación.
  const cur = leer("curvas_n_estimators.json");
  const i300 = cur.arboles.indexOf(cur.usados_en_la_comparacion);
  let difCurva = 0;
  for (const [nombre, c] of Object.entries(cur.modelos) as [string, { validacion: number[] }][]) {
    const acc = comp.find((x: { modelo: string }) => x.modelo === nombre).accuracy.media;
    difCurva = Math.max(difCurva, Math.abs(c.validacion[i300] - (1 - acc)));
  }
  comprobar("curvas por número de árboles vs comparación (300 árboles)", difCurva < 1e-6, `diferencia máxima ${difCurva.toExponential(1)}`);

  // Sin voltear etiquetas, el experimento de ruido repite la comparación.
  const ruido = leer("ruido_etiquetas.json");
  let difRuido = 0;
  let comparados = 0;
  for (const r of ruido.modelos) {
    // Los dos controles (bosque podado, boosting profundo) no están en la comparación: no tienen contra qué cotejarse.
    const ref = r.modelo === "Árbol podado" ? mat.arbol_podado.f1_macro : comp.find((x: { modelo: string }) => x.modelo === r.modelo)?.f1_macro.pliegues;
    if (!ref) continue;
    comparados++;
    r.f1_macro[0].forEach((v: number, k: number) => (difRuido = Math.max(difRuido, Math.abs(v - ref[k]))));
  }
  comprobar("ruido en etiquetas: con 0 % repite la comparación", difRuido < 1e-12 && comparados === 7, `${comparados} modelos · diferencia máxima ${difRuido.toExponential(1)}`);
}

// ---------- Regresión logística contra LogisticRegression ----------
const edu = leer("educacion_logloss.json");
const G: Grupo[] = edu.conteos.map((c: { educacion: number; positivos: number; negativos: number }) => ({
  z: (c.educacion - edu.media) / edu.desv,
  positivos: c.positivos,
  negativos: c.negativos,
}));
let w = 0;
let b = 0;
for (let t = 0; t < 5000; t++) {
  const [gw, gb] = logLossGrad(G, w, b);
  w -= 3 * gw;
  b -= 3 * gb;
}
comprobar(
  "descenso de gradiente vs sklearn",
  Math.abs(w - edu.sklearn.w) < 1e-3 && Math.abs(b - edu.sklearn.b) < 1e-3 && Math.abs(logLoss(G, w, b) - edu.sklearn.logloss) < 1e-6,
  `w ${w.toFixed(4)}, b ${b.toFixed(4)}, log-loss ${logLoss(G, w, b).toFixed(6)}`,
);

// ---------- HMM del clima (valores de libro) ----------
const clima = {
  states: ["L", "S"],
  symbols: ["caminar", "comprar", "limpiar"],
  pi: [0.6, 0.4],
  A: [
    [0.7, 0.3],
    [0.4, 0.6],
  ],
  B: [
    [0.1, 0.4, 0.5],
    [0.6, 0.3, 0.1],
  ],
};
const alpha = forward(clima, [0, 1, 2]);
const v = viterbi(clima, [0, 1, 2]);
comprobar(
  "Forward y Viterbi del clima",
  Math.abs(alpha[2][0] + alpha[2][1] - 0.033612) < 1e-12 && Math.abs(v.best - 0.01344) < 1e-12 && v.path.join("") === "100",
  `P(O) = ${(alpha[2][0] + alpha[2][1]).toFixed(6)}, mejor camino ${v.path.join("")} con ${v.best.toFixed(5)}`,
);

// ---------- Series de tiempo (pasajeros aéreos) contra numpy, pandas, statsmodels y sklearn ----------
{
  const y: number[] = leer("pasajeros.json").valores;
  const ref = leer("referencias_hito4.json");
  const ly = y.map(Math.log);
  // Diferencia máxima entre dos listas; donde la referencia no tiene valor (null), el cálculo debe dar NaN.
  const dif = (mio: number[], suyo: (number | null)[]) =>
    mio.length !== suyo.length ? Infinity : Math.max(...mio.map((v, i) => (suyo[i] === null ? (Number.isNaN(v) ? 0 : Infinity) : Math.abs(v - (suyo[i] as number)))));

  const dlog = diferencia(ly, 1);
  const d12 = diferencia(ly, 12);
  const dd12 = diferencia(d12, 1);
  const dDif = Math.max(dif(dlog, ref.dlog), dif(d12, ref.d12log), dif(dd12, ref.dd12log));
  comprobar("diferencias vs numpy (∇, ∇₁₂ y ∇∇₁₂ del logaritmo)", dDif < 1e-12, `${dlog.length}, ${d12.length} y ${dd12.length} valores · diferencia máxima ${dDif.toExponential(1)}`);

  const M = porPeriodo(y, 12);
  const dAnio = Math.max(
    dif(M.map(media), ref.por_anio.media),
    dif(M.map(desviacionMuestral), ref.por_anio.desv),
    dif(M.map((f) => media(f.map(Math.log))), ref.por_anio.log_media),
    dif(M.map((f) => desviacionMuestral(f.map(Math.log))), ref.por_anio.log_desv),
    Math.abs(pearson(y.slice(0, -1), y.slice(1)) - ref.pearson_r1),
  );
  comprobar("media y desviación por año, y correlación de pares, vs numpy", dAnio < 1e-12, `r de este mes contra el siguiente ${pearson(y.slice(0, -1), y.slice(1)).toFixed(4)} · diferencia máxima ${dAnio.toExponential(1)}`);

  const pm = ref.promedio_movil;
  const dos12 = promedioMovil(y, 12);
  const dPM = Math.max(
    ...[3, 5, 7].map((k) => dif(promedioMovil(y, k), pm.centrado[String(k)])),
    dif(promedioMovil(y, 12, "atrasado"), pm.atrasado_12),
    dif(dos12, pm.dos_por_12),
    dif(dos12, ref.descomposicion.aditiva.tendencia),
  );
  const validos = dos12.filter((v) => !Number.isNaN(v)).length;
  comprobar("promedio móvil vs pandas (3, 5, 7, 2×12 y atrasado de 12)", dPM < 1e-9, `el 2×12 tiene ${validos} meses · diferencia máxima ${dPM.toExponential(1)}`);

  let dDesc = 0;
  for (const modo of ["aditiva", "multiplicativa"] as const) {
    const d = descomponer(y, 12, modo);
    const r = ref.descomposicion[modo];
    dDesc = Math.max(dDesc, dif(d.tendencia, r.tendencia), dif(d.indices, r.indices), dif(d.residuo, r.residuo));
  }
  comprobar("descomposición clásica vs seasonal_decompose (aditiva y multiplicativa)", dDesc < 1e-9, `diferencia máxima ${dDesc.toExponential(1)}`);

  const aY = acf(y, 36);
  const aDD = acf(dd12, 36);
  const dAcf = Math.max(dif(aY, ref.acf.original), dif(aDD, ref.acf.dd12log));
  const sumaProductos = Math.abs(productosRezago(y, 12).reduce((s, v) => s + v, 0) / y.reduce((s, v) => s + (v - media(y)) ** 2, 0) - aY[12]);
  comprobar("ACF vs statsmodels (pasajeros y ∇∇₁₂ log, 36 rezagos)", dAcf < 1e-12 && sumaProductos < 1e-15, `r₁ = ${aY[1].toFixed(4)} · diferencia máxima ${dAcf.toExponential(1)}`);

  const pDD = pacf(aDD);
  const dPacf = Math.max(dif(pacf(acf(ly, 36)), ref.pacf.log), dif(pDD, ref.pacf.dd12log));
  comprobar('PACF por Durbin-Levinson vs statsmodels (method="ywm")', dPacf < 1e-10 && pDD[1] === aDD[1], `φ₁₁ = r₁ = ${pDD[1].toFixed(4)} · diferencia máxima ${dPacf.toExponential(1)}`);

  // Mínimos cuadrados: el logaritmo de un mes contra el de los dos anteriores.
  const ols = minimosCuadrados(
    ly.slice(2).map((_, i) => [ly[i + 1], ly[i]]),
    ly.slice(2),
  );
  const dOls = Math.max(dif(ols.beta, ref.ols_log.beta), dif(ols.ee, ref.ols_log.ee), ...ols.t.map((v, j) => Math.abs(v - ref.ols_log.t[j]) / Math.abs(ref.ols_log.t[j])));
  comprobar("mínimos cuadrados vs statsmodels OLS (coeficientes, error estándar y t)", dOls < 1e-9, `diferencia máxima ${dOls.toExponential(1)}`);

  // El τ de Dickey-Fuller del esquema de la 37 es el t de la pendiente de "cambio de hoy contra valor de ayer".
  const esq = leer("adf_pasajeros.json").esquema;
  let dDF = 0;
  for (const k of ["ar1", "caminata"]) {
    const x: number[] = esq[k];
    const r = minimosCuadrados(
      x.slice(0, -1).map((v) => [v]),
      diferencia(x, 1),
    );
    dDF = Math.max(dDF, Math.abs(r.beta[1] - esq.df[k].gamma), Math.abs(r.t[1] - esq.df[k].estadistico));
  }
  // Las series del esquema se guardan con 6 decimales: de ahí la tolerancia.
  comprobar("Dickey-Fuller del esquema vs adfuller sin rezagos (pendiente y τ)", dDF < 1e-4, `diferencia máxima ${dDF.toExponential(1)}`);

  const iguales = [20, 144].every((n) => {
    const suyas: { entrenamiento: number; prueba_desde: number; prueba_hasta: number }[] = ref.particion_temporal[String(n)];
    return particionTemporal(n, 5).every((c, i) => c.entrenamiento === suyas[i].entrenamiento && c.pruebaDesde === suyas[i].prueba_desde && c.pruebaHasta === suyas[i].prueba_hasta);
  });
  comprobar("ventana creciente vs TimeSeriesSplit de sklearn (20 y 144 momentos)", iguales, `con 144: entrena ${particionTemporal(144, 5).map((c) => c.entrenamiento).join(", ")}`);

  // Diapositiva 30: el MAE se recalcula de las predicciones guardadas.
  const vt = leer("validacion_temporal.json");
  const real = y.slice(vt.corte);
  let dMae = 0;
  for (const m of vt.modelos) {
    dMae = Math.max(dMae, Math.abs(mae(real, m.pred_barajado.slice(vt.corte)) - m.mae_barajado), Math.abs(mae(real, m.pronostico) - m.mae_pronostico));
  }
  const bosque = vt.modelos[0];
  const techo = Math.max(...y.slice(0, vt.corte));
  comprobar(
    "MAE vs sklearn, y el bosque no pasa de su máximo de entrenamiento",
    dMae < 1e-12 && Math.max(...bosque.pronostico) <= techo && bosque.mae_barajados.every((v: number) => v < bosque.mae_pronostico),
    `barajado ${bosque.mae_barajado.toFixed(1)} · pronóstico ${bosque.mae_pronostico.toFixed(1)} · máximo pronosticado ${Math.max(...bosque.pronostico).toFixed(0)} de ${techo}`,
  );

  // Afirmaciones que sostienen un texto en pantalla.
  const picoEnVerano = M.every((f) => f.every((v, mes) => v < Math.max(...f) || mes === 6 || mes === 7));
  const picos12 = aY[12] > aY[11] && aY[12] > aY[13] && aY[24] > aY[23] && aY[24] > aY[25];
  const mayores = aDD
    .map((v, k) => ({ k, v: Math.abs(v) }))
    .slice(1)
    .sort((a, b) => b.v - a.v)
    .slice(0, 2)
    .map((o) => o.k)
    .sort((a, b) => a - b);
  comprobar(
    "pasajeros: pico en julio o agosto, picos de la ACF en 12 y 24, y huellas en 1 y 12 tras diferenciar",
    picoEnVerano && picos12 && mayores.join() === "1,12",
    `rezagos mayores de ∇∇₁₂ log: ${mayores.join(" y ")} · fuera de ±${banda95(dd12.length).toFixed(3)}: ${aDD.map((v, k) => (k > 0 && Math.abs(v) > banda95(dd12.length) ? k : -1)).filter((k) => k > 0).join(", ")}`,
  );

  // Lo que usa azar propio no tiene referencia externa: se comprueban sus propiedades.
  const r29 = mulberry32(29);
  const perm = barajar(144, r29);
  const pliegues = kfoldBarajado(20, 5, r29);
  const ar = simularAR(0.7, 500, mulberry32(35));
  const reconstruye = Math.max(...ar.x.slice(1).map((v, t) => Math.abs(v - 0.7 * ar.x[t] - ar.choques[t + 1])));
  // 200 historias de 100 pasos: la varianza entre historias debe quedar cerca de la teórica en cualquier instante.
  const rh = mulberry32(35);
  const historias = Array.from({ length: 200 }, () => simularAR(0.7, 100, rh).x);
  const paseos = Array.from({ length: 200 }, () => caminata(100, rh));
  const varEn = (hs: number[][], t: number) => desviacionMuestral(hs.map((h) => h[t])) ** 2;
  const margen = 3 * Math.sqrt(2 / 199); // tres errores estándar de una varianza muestral con 200 datos
  const dentro = [4, 49, 94].every((t) => Math.abs(varEn(historias, t) / (1 / (1 - 0.49)) - 1) < margen && Math.abs(varEn(paseos, t) / (t + 1) - 1) < margen);
  comprobar(
    "azar propio: permutación, pliegues completos, serie con memoria y varianza de las 200 historias",
    [...perm].sort((a, b) => a - b).every((v, i) => v === i) && [0, 1, 2, 3, 4].every((f) => pliegues.filter((p) => p === f).length === 4) && reconstruye < 1e-12 && dentro,
    `varianza en t = 50: estacionaria ${varEn(historias, 49).toFixed(2)} (teórica ${(1 / 0.51).toFixed(2)}) · paseo ${varEn(paseos, 49).toFixed(1)} (teórica 50)`,
  );
}

// ---------- Modelos de series (41–50, con 1949–1959) contra statsmodels, scipy y sklearn ----------
{
  const y: number[] = leer("pasajeros.json").valores;
  const n: number = leer("pasajeros.json").n_entrenamiento;
  const ref = leer("referencias_hito5.json");
  const mod = leer("series_modelos.json");
  const ent = y.slice(0, n);
  const real = y.slice(n);
  const dif = (mio: number[], suyo: (number | null)[]) =>
    mio.length !== suyo.length ? Infinity : Math.max(...mio.map((v, i) => (suyo[i] === null ? (Number.isNaN(v) ? 0 : Infinity) : Math.abs(v - (suyo[i] as number)))));
  const exp = (v: number[]) => v.map(Math.exp);

  const le = ent.map(Math.log);
  const d12 = diferencia(le, 12);
  const tr: Record<string, number[]> = { original: ent, log: le, dlog: diferencia(le, 1), d12log: d12, dd12log: diferencia(d12, 1) };
  const acfs = Object.fromEntries(Object.entries(tr).map(([k, v]) => [k, acf(v, 36)]));
  const dAcf = Math.max(...Object.keys(tr).map((k) => Math.max(dif(acfs[k], ref.acf[k]), dif(pacf(acfs[k]), ref.pacf[k]))));
  comprobar("ACF y PACF de las cinco transformaciones con 132 meses vs statsmodels", dAcf < 1e-10, `diferencia máxima ${dAcf.toExponential(1)}`);

  const w = tr.dd12log;
  const aW = acfs.dd12log;
  const pW = pacf(aW);
  const bart = bandaBartlett(aW, w.length);
  const dBart = dif(bart, ref.bartlett_dd12log);
  const fuera = (v: number[], banda: (k: number) => number) => v.flatMap((x, k) => (k > 0 && Math.abs(x) > banda(k) ? [k] : []));
  comprobar(
    "banda de Bartlett vs statsmodels (acf con bartlett_confint)",
    dBart < 1e-10,
    `fuera con ruido blanco: ${fuera(aW, () => banda95(w.length)).join(", ")} · con Bartlett: ${fuera(aW, (k) => bart[k]).join(", ")} · diferencia máxima ${dBart.toExponential(1)}`,
  );

  let dTeo = 0;
  for (const t of ref.teoricas) {
    const rho = acfTeorica(t.ar, t.ma, 20);
    dTeo = Math.max(dTeo, dif(pesosPsi(t.ar, t.ma, 20), t.psi), dif(pesosPi(t.ar, t.ma, 20), t.pi), dif(rho, t.acf), dif(pacf(rho), t.pacf));
  }
  comprobar(`eco, forma AR, ACF y PACF teóricas de ${ref.teoricas.length} modelos vs ArmaProcess`, dTeo < 1e-10, `diferencia máxima ${dTeo.toExponential(1)}`);

  let dAR = 0;
  for (const p of [1, 2]) {
    const a = ajustarAR(d12, p);
    dAR = Math.max(dAR, dif([a.c, ...a.phis], ref.autoreg[p].params), dif(pronosticarAR(a, d12, 12), ref.autoreg[p].pronostico));
  }
  const ar2 = ajustarAR(d12, 2);
  comprobar("AR(1) y AR(2) del crecimiento anual, con su pronóstico, vs AutoReg", dAR < 1e-10, `AR(2): ${ar2.phis.map((v) => v.toFixed(4)).join(" y ")} · diferencia máxima ${dAR.toExponential(1)}`);

  // statsmodels no arranca la recursión del MA(1) en 0: las dos predicciones se juntan después de unos meses.
  const f = filtroMA1(w, mod.ma1.theta);
  const dMA = Math.max(...f.prediccion.slice(20).map((v, i) => Math.abs(v - mod.ma1.ajustados[i + 20])));
  // El pronóstico: el primer mes, θ por el último error; después, la media (0).
  const pronMA = [mod.ma1.theta * f.choques[w.length - 1], ...new Array(11).fill(0)];
  const dPronMA = Math.max(...pronMA.map((v, i) => Math.abs(v - mod.ma1.pronostico[i])));
  comprobar(
    "predicción a un paso y pronóstico de 1960 del MA(1) vs statsmodels",
    dMA < 1e-6 && dPronMA < 1e-6 && Math.abs(mod.ma1.theta) < 1,
    `θ = ${mod.ma1.theta.toFixed(4)} · pronóstico del primer mes ${pronMA[0].toFixed(4)} · diferencias máximas ${dMA.toExponential(1)} y ${dPronMA.toExponential(1)}`,
  );

  const pronosticos: Record<string, number[]> = {
    ingenuo: ingenuoEstacional(ent, 12),
    crec: ingenuoEstacional(ent, 12).map((v) => (v * ent.slice(n - 12).reduce((s, x) => s + x, 0)) / ent.slice(n - 24, n - 12).reduce((s, x) => s + x, 0)),
    bosque: mod.linea_base.bosque.pronostico,
    arima: exp(mod.arima.pronostico_log),
    sarima: exp(mod.elegido.pronostico_log),
  };
  let dMet = 0;
  for (const [k, pred] of Object.entries(pronosticos)) {
    const r = ref.metricas_1960[k];
    dMet = Math.max(dMet, Math.abs(mae(real, pred) - r.mae), Math.abs(rmse(real, pred) - r.rmse), Math.abs(mape(real, pred) - r.mape));
  }
  const crecio = real.filter((v, i) => v > pronosticos.ingenuo[i]).length;
  comprobar(
    "MAE, RMSE y MAPE de 1960 vs sklearn (ingenuo, ingenuo con crecimiento, bosque, ARIMA y SARIMA)",
    dMet < 1e-9 && crecio === 12 && mae(real, pronosticos.sarima) < mae(real, pronosticos.ingenuo),
    `MAE: ingenuo ${mae(real, pronosticos.ingenuo).toFixed(1)}, bosque ${mae(real, pronosticos.bosque).toFixed(1)}, ARIMA ${mae(real, pronosticos.arima).toFixed(1)}, SARIMA ${mae(real, pronosticos.sarima).toFixed(1)} · diferencia máxima ${dMet.toExponential(1)}`,
  );

  const dChi = Math.max(...ref.chi2.map(([x, k, sf]: number[]) => Math.abs(colaChi2(x, k) - sf)));
  let dLB = 0;
  ref.ljungbox.rezagos.forEach((h: number, i: number) => {
    const lb = ljungBox(mod.elegido.residuos, h, 2);
    dLB = Math.max(dLB, Math.abs(lb.Q - ref.ljungbox.Q[i]), Math.abs(lb.p - ref.ljungbox.p[i]), Math.abs(lb.gl - ref.ljungbox.gl[i]));
  });
  const lb24 = ljungBox(mod.elegido.residuos, 24, 2);
  comprobar("cola de la χ² vs scipy y Ljung-Box vs acorr_ljungbox", dChi < 1e-10 && dLB < 1e-8, `Q(24) = ${lb24.Q.toFixed(2)}, p = ${lb24.p.toFixed(3)} · diferencias máximas ${dChi.toExponential(1)} y ${dLB.toExponential(1)}`);

  const d = descomponer(ent, 12, "multiplicativa");
  const rd = ref.descomposicion_multiplicativa;
  const dDesc = Math.max(dif(d.tendencia, rd.tendencia), dif(d.indices, rd.indices), dif(d.residuo, rd.residuo));
  comprobar("descomposición multiplicativa de 1949–1959 vs seasonal_decompose", dDesc < 1e-9, `diferencia máxima ${dDesc.toExponential(1)}`);

  // Origen móvil (50): las métricas de cada año se recalculan de los pronósticos guardados.
  let dMovil = 0;
  let gana = 0;
  let pierde: number[] = [];
  let pMin = 1;
  mod.origen_movil.forEach((o: { anio: number; n_entrenamiento: number; sarima: { pronostico_log: number[]; residuos: number[] }; arima: { pronostico_log: number[] } }, i: number) => {
    const r = ref.origen_movil[i];
    const obs = y.slice(o.n_entrenamiento, o.n_entrenamiento + 12);
    const preds = { ingenuo: ingenuoEstacional(y.slice(0, o.n_entrenamiento), 12), arima: exp(o.arima.pronostico_log), sarima: exp(o.sarima.pronostico_log) };
    for (const k of ["ingenuo", "arima", "sarima"] as const) {
      dMovil = Math.max(dMovil, Math.abs(mae(obs, preds[k]) - r[k].mae), Math.abs(rmse(obs, preds[k]) - r[k].rmse), Math.abs(mape(obs, preds[k]) - r[k].mape));
    }
    const lb = ljungBox(o.sarima.residuos, 24, 2);
    dMovil = Math.max(dMovil, Math.abs(lb.p - r.ljungbox.p[1]));
    pMin = Math.min(pMin, lb.p);
    if (mape(obs, preds.sarima) < mape(obs, preds.ingenuo)) gana++;
    else pierde.push(o.anio);
  });
  comprobar(
    "origen móvil: métricas vs sklearn y Ljung-Box de cada ajuste",
    dMovil < 1e-8 && gana === 5 && pierde.join() === "1958" && pMin > 0.05,
    `SARIMA le gana al ingenuo en ${gana} de ${mod.origen_movil.length} años (pierde ${pierde.join(", ")}) · p mínimo de Ljung-Box ${pMin.toFixed(2)} · diferencia máxima ${dMovil.toExponential(1)}`,
  );

  // Afirmaciones que sostienen un texto en pantalla.
  const aY = acfs.original;
  const todasFuera = aY.slice(1, 25).every((v) => Math.abs(v) > banda95(n));
  const b = banda95(w.length);
  const mayores = aW
    .map((v, k) => ({ k, v: Math.abs(v) }))
    .slice(1)
    .sort((p, q) => q.v - p.v)
    .slice(0, 2)
    .map((o) => o.k)
    .sort((p, q) => p - q);
  const cortes = Math.abs(aW[2]) < b && Math.abs(pW[2]) < b && Math.abs(aW[24]) < b && Math.abs(aW[36]) < b;
  const porAic = [...mod.sarima_rejilla].sort((p, q) => p.aic - q.aic);
  const porBic = [...mod.sarima_rejilla].sort((p, q) => p.bic - q.bic);
  const esAerolinea = (m: { orden: number[]; estacional: number[] }) => m.orden.join() === "0,1,1" && m.estacional.join() === "0,1,1,12";
  const mejores = mod.sarima_rejilla.filter((m: { pronostico_log: number[] }) => mae(real, exp(m.pronostico_log)) < mae(real, pronosticos.sarima)).length;
  comprobar(
    "pasajeros 1949–1959: 24 barras fuera, huellas en 1 y 12, cortes en 2, 24 y 36, y la aerolínea como mínimo de AIC y BIC",
    todasFuera && mayores.join() === "1,12" && cortes && esAerolinea(porAic[0]) && esAerolinea(porBic[0]),
    `segundo por AIC a ${(porAic[1].aic - porAic[0].aic).toFixed(2)} · ${mod.sarima_rejilla.filter((m: { aic: number }) => m.aic - porAic[0].aic < 2).length} modelos a menos de 2 · ${mejores} de 15 con menor MAE en 1960`,
  );

  // Sin referencia externa: propiedades de lo que se simula o se arma aquí.
  const eps = choques(132, mulberry32(41));
  const x = simularARMA([0.5, 0.3], [0.4], eps);
  const reconstruye = Math.max(...x.map((v, t) => Math.abs(v - 0.5 * (x[t - 1] ?? 0) - 0.3 * (x[t - 2] ?? 0) - 0.4 * (eps[t - 1] ?? 0) - eps[t])));
  const ida = Math.max(...acumular(diferencia(le, 1), le[0]).map((v, i) => Math.abs(v - le[i + 1])));
  const copia = ingenuoEstacional(ent, 12).every((v, i) => v === ent[n - 12 + i]);
  comprobar(
    "simulación ARMA, suma acumulada e ingenuo estacional",
    reconstruye < 1e-12 && ida < 1e-12 && copia && simularARMA([], [], eps).every((v, i) => v === eps[i]),
    `la serie reproduce sus choques (${reconstruye.toExponential(1)}) · sumar las diferencias devuelve la serie (${ida.toExponential(1)})`,
  );
}

// ---------- Modelos ocultos de Markov (51–61) contra numpy y hmmlearn ----------
{
  const ref = leer("referencias_hito6.json");
  const pag = leer("hmm_clima.json");
  const E6 = ref.ejemplo;
  const maxDifM = (a: number[][], b: number[][]) => Math.max(...a.flatMap((r, i) => r.map((v, j) => Math.abs(v - b[i][j]))));
  const lam = pag.lambda;
  comprobar(
    "el λ de lib/clima.ts es el del script",
    JSON.stringify([CLIMA.pi, CLIMA.A, CLIMA.B]) === JSON.stringify([lam.pi, lam.A, lam.B]) &&
      JSON.stringify(CLIMA_PERSISTENTE.A) === JSON.stringify(pag.escenarios.persistente.A),
    "π, A, B y el A persistente",
  );

  const pf = pasosForward(CLIMA, OBS_EJEMPLO);
  const dA = Math.max(maxDifM(pf.alpha, E6.alpha), maxDifM(pf.predicho.slice(1), E6.predicho));
  comprobar("α y predicho del ejemplo vs numpy", dA < 1e-15, `diferencia máxima ${dA.toExponential(1)}`);
  const prodC = pf.c.reduce((a, b) => a * b, 1);
  comprobar("Π c_t = P(O) = Σ α₃", Math.abs(prodC - E6.P) < 1e-15, `${fmtP(prodC)} contra ${fmtP(E6.P)}`);

  const v6 = viterbi(CLIMA, OBS_EJEMPLO);
  comprobar(
    "δ, ψ y camino de Viterbi vs numpy y hmmlearn",
    maxDifM(v6.delta, E6.delta) < 1e-15 &&
      JSON.stringify(v6.psi.slice(1)) === JSON.stringify(E6.psi) &&
      v6.path.join() === E6.decode_hmmlearn.camino.join() &&
      Math.abs(Math.log(v6.best) - E6.decode_hmmlearn.logprob) < 1e-12,
    `camino ${v6.path.join("")}, ln P* = ${Math.log(v6.best).toFixed(6)} (hmmlearn ${E6.decode_hmmlearn.logprob.toFixed(6)})`,
  );

  const cam = enumerarCaminos(CLIMA, OBS_EJEMPLO);
  const dCam = Math.max(...cam.map((c, i) => Math.max(Math.abs(c.pQ - E6.caminos[i].pQ), Math.abs(c.pOdadoQ - E6.caminos[i].pOdadoQ), Math.abs(c.conjunta - E6.caminos[i].conjunta))));
  const sumaCam = cam.reduce((s, c) => s + c.conjunta, 0);
  comprobar("los 8 caminos vs numpy y su suma = Forward", dCam < 1e-15 && Math.abs(sumaCam - E6.P) < 1e-15, `diferencia ${dCam.toExponential(1)}, Σ = ${fmtP(sumaCam)}`);
  comprobar("probConjunta(S, L, L) = δ₃(L)", Math.abs(probConjunta(CLIMA, [1, 0, 0], OBS_EJEMPLO).conjunta - v6.best) < 1e-15, fmtP(v6.best));

  const g = suavizado(CLIMA, OBS_EJEMPLO);
  comprobar(
    "suavizado vs numpy y predict_proba de hmmlearn",
    maxDifM(g, E6.suavizado) < 1e-12 && maxDifM(g, E6.suavizado_hmmlearn) < 1e-12 && casillaMasAlta(g).join() === v6.path.join(),
    `clima más probable de cada día: ${casillaMasAlta(g).join("")} (igual que Viterbi)`,
  );
  const codicioso = casillaMasAlta(v6.delta);
  comprobar("casilla más alta de cada columna de δ", codicioso.join("") === "110" && Math.abs(probConjunta(CLIMA, codicioso, OBS_EJEMPLO).conjunta - 0.00864) < 1e-15, "S → S → L, 0.00864");
  comprobar("ln P(O) escalado vs score de hmmlearn", Math.abs(forwardEscalado(CLIMA, OBS_EJEMPLO).logP - E6.score_hmmlearn) < 1e-12, E6.score_hmmlearn.toFixed(6));

  const cm3 = conteoMultiplicaciones(2, 3);
  const cm100 = conteoMultiplicaciones(2, 100);
  comprobar(
    "conteo de multiplicaciones",
    cm3.forward === 14 && cm3.bruta === 40n && cm100.forward === 596 && cm100.bruta === 199n * 2n ** 100n,
    "14 y 40 con T = 3; 596 y 199·2¹⁰⁰ con T = 100",
  );

  // Simulación en el navegador (mulberry32): frecuencias y rachas cerca de lo teórico
  const sim = simular(CLIMA, 10000, mulberry32(52));
  const frecA = [0, 1].map((i) => {
    const desde = sim.estados.slice(0, -1).map((q, t) => [q, sim.estados[t + 1]]).filter(([q]) => q === i);
    return [0, 1].map((j) => desde.filter(([, r]) => r === j).length / desde.length);
  });
  const frecB = [0, 1].map((i) => {
    const en = sim.obs.filter((_, t) => sim.estados[t] === i);
    return [0, 1, 2].map((k) => en.filter((o) => o === k).length / en.length);
  });
  const ra = rachas(sim.estados).map((r) => r.reduce((a, b) => a + b, 0) / r.length);
  comprobar(
    "simular(): 10 000 días de mulberry32",
    maxDifM(frecA, CLIMA.A) < 0.02 && maxDifM(frecB, CLIMA.B) < 0.02 && Math.abs(ra[0] - 1 / 0.3) < 0.15 && Math.abs(ra[1] - 1 / 0.4) < 0.15,
    `transición ±${maxDifM(frecA, CLIMA.A).toFixed(3)}, emisión ±${maxDifM(frecB, CLIMA.B).toFixed(3)}, rachas ${ra.map((r) => r.toFixed(2)).join(" y ")}`,
  );

  // Las dos secuencias de prueba de 1 000 días y el λ aprendido
  const digitos = (s: string) => [...s].map(Number);
  for (const [nombre, base] of [
    ["base", CLIMA],
    ["persistente", CLIMA_PERSISTENTE],
  ] as [string, HMM][]) {
    const esc = pag.escenarios[nombre];
    const r = ref.escenarios[nombre];
    const op = digitos(esc.prueba.obs);
    const qp = digitos(esc.prueba.estados);
    const bw = esc.baum_welch;
    const aprendido: HMM = { ...base, pi: bw.pi, A: bw.A, B: bw.B };
    const lpR = forwardEscalado(base, op).logP;
    const vR = viterbiLog(base, op);
    const vA = viterbiLog(aprendido, op);
    comprobar(
      `${nombre}: Forward escalado y Viterbi en 1 000 días vs hmmlearn`,
      Math.abs(lpR - r.score_prueba_real) < 1e-9 &&
        Math.abs(vR.logMejor - r.decode_prueba_real.logprob) < 1e-9 &&
        vR.camino.join("") === r.decode_prueba_real.camino &&
        vA.camino.join("") === r.decode_prueba_aprendido.camino,
      `ln P = ${lpR.toFixed(4)} (hmmlearn ${r.score_prueba_real.toFixed(4)}); caminos idénticos`,
    );
    const lpE = forwardEscalado(aprendido, digitos(r.entrenamiento_obs)).logP;
    comprobar(`${nombre}: λ aprendido sobre el entrenamiento vs score de hmmlearn`, Math.abs(lpE - r.score_entrenamiento_aprendido) < 1e-6, `${lpE.toFixed(4)}`);
    const acierto = (c: number[]) => c.filter((q, t) => q === qp[t]).length / qp.length;
    const regla = [0, 1, 2].map((k) => (bw.B[0][k] >= bw.B[1][k] ? 0 : 1));
    const pr = r.prueba_ref;
    const sinMem = op.reduce((s, o) => s + Math.log(esc.entrenamiento.frecuencias[o]), 0) / op.length;
    comprobar(
      `${nombre}: aciertos y log-verosimilitud por día vs hmmlearn`,
      Math.abs(acierto(vR.camino) - pr.acierto_viterbi_real) < 1e-12 &&
        Math.abs(acierto(vA.camino) - pr.acierto_viterbi_aprendido) < 1e-12 &&
        Math.abs(acierto(op.map((o) => regla[o])) - pr.acierto_actividad) < 1e-12 &&
        Math.abs(acierto(qp.map(() => esc.entrenamiento.mas_comun)) - pr.acierto_mas_comun) < 1e-12 &&
        Math.abs(forwardEscalado(aprendido, op).logP / op.length - pr.logP_dia_aprendido) < 1e-9 &&
        Math.abs(sinMem - pr.logP_dia_sin_memoria) < 1e-12,
      `Viterbi ${(100 * acierto(vA.camino)).toFixed(1)} %, actividad ${(100 * pr.acierto_actividad).toFixed(1)} %, más común ${(100 * pr.acierto_mas_comun).toFixed(1)} %`,
    );
    const dia = diaUnderflow(base, op);
    comprobar(`${nombre}: día en que Forward sin escalar da 0`, dia !== null && Math.abs(dia - r.underflow_dia) <= 1, `día ${dia} (numpy ${r.underflow_dia})`);
    comprobar(
      `${nombre}: Baum-Welch de hmmlearn contra el propio en numpy`,
      r.numpy_contra_hmmlearn.final < 1e-6,
      `mismo λ inicial: diferencia final ${r.numpy_contra_hmmlearn.final.toExponential(1)}`,
    );
  }
}

console.log(fallos ? `\n${fallos} comprobación(es) fallaron` : "\nTodo coincide");
process.exit(fallos ? 1 : 0);
