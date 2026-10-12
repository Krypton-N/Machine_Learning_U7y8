// Comprueba los cálculos de src/lib contra las referencias de Python guardadas en src/data.
// Uso: npm run verify
import { readFileSync } from "node:fs";
import { adaboost, errorPorRonda } from "../src/lib/adaboost.ts";
import { accuracyPorTamano, arbolBootstrap } from "../src/lib/bagging.ts";
import { logLossDe, puntajeInicial, rondaLogLoss, valorArbol } from "../src/lib/gboost.ts";
import { forward, viterbi } from "../src/lib/hmm.ts";
import { logLoss, logLossGrad, type Grupo } from "../src/lib/logistic.ts";
import { contar, desdeSklearn, desviacion, exactitud, f1Macro, media, sumar, total } from "../src/lib/metricas.ts";
import { mulberry32 } from "../src/lib/rng.ts";
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

console.log(fallos ? `\n${fallos} comprobación(es) fallaron` : "\nTodo coincide");
process.exit(fallos ? 1 : 0);
