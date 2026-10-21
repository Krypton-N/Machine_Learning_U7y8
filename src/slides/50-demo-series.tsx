import { useEffect, useState } from "react";
import { AicGrid } from "../components/AicGrid";
import { Correlogram } from "../components/Correlogram";
import { MetricTable } from "../components/MetricTable";
import { Chips } from "../components/Piezas";
import { PValueScale, formatoP } from "../components/PValueScale";
import { Entra } from "../components/Reveal";
import { SeriesChart } from "../components/SeriesChart";
import { SplitDiagram, type FilaParticion } from "../components/SplitDiagram";
import { useFlechas } from "../deck/hooks";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { desviacion, media } from "../lib/metricas";
import { adf, enMiles, entrenamiento, modelos, pasajeros, TRANSFORMACIONES_ENT, type Transformacion } from "../lib/pasajeros";
import { acf, descomponer, ingenuoEstacional, ljungBox, mape, pacf } from "../lib/series";

// ---------- La receta en 6 estaciones ----------
const ESTACIONES = [
  { nombre: "Transformar", donde: "34 y 36", texto: "logaritmo, una diferencia y una estacional" },
  { nombre: "¿Estacionaria?", donde: "37", texto: "ADF sobre cada transformación" },
  { nombre: "Identificar", donde: "44", texto: "ACF y PACF proponen candidatos" },
  { nombre: "Elegir", donde: "46", texto: "AIC entre los 16 SARIMA" },
  { nombre: "Pronosticar y comparar", donde: "45 y 47", texto: "contra la línea base, en varios años" },
  { nombre: "Diagnosticar", donde: "46", texto: "Ljung-Box sobre los residuos" },
];

/** La receta completa (clic 0): seis tarjetas de texto, tres por renglón. */
function RecetaCompleta() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", columnGap: 48, rowGap: 40 }}>
      {ESTACIONES.map((e, i) => (
        <div key={e.nombre} style={{ borderTop: "2px solid var(--red)", paddingTop: 14 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <span className="mono" style={{ color: "var(--red)", fontSize: 22 }}>
              {i + 1}
            </span>
            <span style={{ fontSize: 30, fontWeight: 600 }}>{e.nombre}</span>
            <span className="mono" style={{ marginLeft: "auto", fontSize: 20, color: "var(--text-3)" }}>
              {e.donde}
            </span>
          </div>
          <div style={{ fontSize: 26, color: "var(--text-2)", lineHeight: 1.4, marginTop: 10 }}>{e.texto}</div>
        </div>
      ))}
    </div>
  );
}

/** En los demás clics, una sola línea arriba que dice en qué estación vamos. */
function Estaciones({ activas }: { activas: number[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, auto)", justifyContent: "space-between", borderBottom: "1px solid var(--line-2)", paddingBottom: 10, marginBottom: 22 }}>
      {ESTACIONES.map((e, i) => {
        const on = activas.includes(i);
        return (
          <span key={e.nombre} className="mono" style={{ fontSize: 20, color: on ? "var(--text)" : "var(--text-3)", opacity: on ? 1 : 0.6 }}>
            <span style={{ color: on ? "var(--red)" : "var(--text-3)", marginRight: 8 }}>{i + 1}</span>
            {e.nombre}
          </span>
        );
      })}
    </div>
  );
}

// ---------- Estaciones 1 y 2 ----------
const DESC = descomponer(entrenamiento, 12, "multiplicativa");
const ADF_132 = adf.sensibilidad.sin_1960;
const ADF_144 = Object.fromEntries(adf.filas.map((f) => [f.id, f.p]));
const R12_DLOG = acf(TRANSFORMACIONES_ENT.dlog.valores, 12)[12];

// ---------- Estaciones 3 y 4 ----------
const W = TRANSFORMACIONES_ENT.dd12log.valores;
const ACF_W = acf(W, 36);
const PACF_W = pacf(ACF_W);

// ---------- Estación 5: origen móvil ----------
const Y = pasajeros.valores;
const ORIGENES = modelos.origen_movil.map((o) => {
  const real = Y.slice(o.n_entrenamiento, o.n_entrenamiento + 12);
  const ingenuo = ingenuoEstacional(Y.slice(0, o.n_entrenamiento), 12);
  const sarima = enMiles(o.sarima.pronostico_log);
  const arima = enMiles(o.arima.pronostico_log);
  return { ...o, real, ingenuo, sarima, arima, mape: { ingenuo: mape(real, ingenuo), arima: mape(real, arima), sarima: mape(real, sarima) }, lb: ljungBox(o.sarima.residuos, 24, 2) };
});
const ANIOS = ORIGENES.map((o) => o.anio);
const FILAS: FilaParticion[] = ORIGENES.map((o) => ({
  etiqueta: `→ ${o.anio}`,
  entrenamiento: Array.from({ length: o.n_entrenamiento }, (_, i) => i),
  prueba: Array.from({ length: 12 }, (_, i) => o.n_entrenamiento + i),
}));
// Un año sí y uno no, con el número centrado en su año (el texto empieza en la celda i): con los 12 a 20 px los números quedaban pegados.
const MARCAS = Array.from({ length: 6 }, (_, a) => ({ i: a * 24 + 14, texto: String(1950 + 2 * a) }));
type Modelo = "ingenuo" | "arima" | "sarima";
const NOMBRES: Record<Modelo, string> = { ingenuo: "Ingenuo estacional", arima: "ARIMA(0,1,1) con deriva", sarima: "SARIMA (aerolínea)" };
const GANA = ORIGENES.filter((o) => o.mape.sarima < o.mape.ingenuo).length;
const PIERDE = ORIGENES.filter((o) => o.mape.sarima >= o.mape.ingenuo).map((o) => o.anio);
const total = (anio: number) => Y.slice((anio - 1949) * 12, (anio - 1948) * 12).reduce((s, v) => s + v, 0);
const crecimiento = (anio: number) => total(anio) / total(anio - 1) - 1;
const pct = (v: number) => `${(v * 100).toFixed(1)} %`;
const f2 = (v: number) => v.toFixed(2);
const TXT = { fontSize: 26, lineHeight: 1.42, margin: 0 } as const;
const ROJO = { color: "var(--red-2)" };
const ACTIVAS = [[], [0], [1], [2], [3], [4], [4], [5], [0, 1, 2, 3, 4, 5]];

// Un clic, una idea: 0 la receta; 1 descomposición; 2 ADF; 3 ACF y PACF; 4 AIC; 5 el origen móvil; 6 la tabla por
// año; 7 Ljung-Box de los seis ajustes; 8 el cierre.
export default function DemoSeries({ step, active }: SlideProps) {
  const [anio, setAnio] = useState(1960);
  useEffect(() => setAnio(1960), [step]);
  const mover = (d: number) => setAnio((a) => ANIOS[Math.min(ANIOS.length - 1, Math.max(0, ANIOS.indexOf(a) + d))]);
  useFlechas(active && step === 5, () => mover(-1), () => mover(1));
  const o = ORIGENES.find((x) => x.anio === anio)!;
  const T = o.n_entrenamiento;

  return (
    <SlideFrame
      section={["U8 · Datos secuenciales", "G. Modelos de series"]}
      num={50}
      caso={step >= 1 ? "Pasajeros aéreos" : null}
      title="Demo: de la serie al pronóstico, evaluado en seis años"
      lede="La receta completa sobre pasajeros: de la serie cruda al pronóstico, comparado contra una línea base y en varios orígenes."
    >
      {step === 0 ? (
        <Entra>
          <RecetaCompleta />
        </Entra>
      ) : (
        <Estaciones activas={ACTIVAS[Math.min(step, 8)]} />
      )}

      {step === 1 && (
        <Entra style={{ display: "grid", gridTemplateColumns: "1040px 1fr", gap: 64 }}>
          <div>
            <span className="label">Descomposición multiplicativa, 1949–1959</span>
            {[
              { id: "tendencia", valores: DESC.tendencia, rotulo: "tendencia", paso: 200 },
              { id: "estacional", valores: DESC.estacional, rotulo: "estación", paso: 0.2 },
              { id: "residuo", valores: DESC.residuo, rotulo: "lo que sobra", paso: 0.1 },
            ].map((s) => (
              <SeriesChart key={s.id} ancho={1040} alto={160} series={[{ id: s.id, valores: s.valores.map((v) => (Number.isNaN(v) ? null : v)), grosor: 1.8 }]} cadaAnios={2} rotuloY={s.rotulo} pasoY={s.paso} />
            ))}
          </div>
          <div style={{ paddingTop: 40 }}>
            <p style={TXT}>
              Una tendencia que sube y una onda anual que crece con ella. Por eso: <span style={ROJO}>logaritmo, una diferencia y una estacional</span> (34 y 36).
            </p>
          </div>
        </Entra>
      )}

      {step === 2 && (
        <Entra style={{ display: "grid", gridTemplateColumns: "1080px 1fr", gap: 56 }}>
          <div>
            <span className="label">ADF con 132 meses (y con 144, en la 37)</span>
            <div data-rotulo style={{ marginTop: 8 }}>
              <MetricTable
                tam={24}
                columnas={[
                  { clave: "tau", rotulo: "τ", fmt: f2 },
                  { clave: "p", rotulo: "p (132)", fmt: formatoP },
                  { clave: "p144", rotulo: "p (144)", fmt: formatoP },
                  { clave: "rechaza", rotulo: "¿estacionaria?" },
                ]}
                filas={ADF_132.map((f) => ({
                  id: f.id,
                  nombre: TRANSFORMACIONES_ENT[f.id as Transformacion].nombre,
                  valores: { tau: f.estadistico, p: f.p, p144: ADF_144[f.id], rechaza: null },
                  textos: { rechaza: f.p < 0.05 ? "sí" : "no" },
                }))}
              />
            </div>
          </div>
          <div style={{ paddingTop: 20 }}>
            <p style={TXT}>
              Firmes: sin diferencias, no; con las dos, sí. Las de en medio <span style={ROJO}>cambiaron de lado</span> al quitar 1960, como avisó la 37.
            </p>
            <p style={{ ...TXT, marginTop: 18 }}>La diferencia estacional la pide el patrón por mes (r₁₂ = {f2(R12_DLOG)} en ∇ log), no ADF.</p>
          </div>
        </Entra>
      )}

      {step === 3 && (
        <Entra style={{ display: "grid", gridTemplateColumns: "1040px 1fr", gap: 64 }}>
          <div>
            <span className="label">∇∇₁₂ log · 1949–1959</span>
            <Correlogram valores={ACF_W} n={W.length} ancho={1040} alto={240} titulo="ACF" y={[-0.5, 0.5]} />
            <div style={{ marginTop: 8 }}>
              <Correlogram valores={PACF_W} n={W.length} ancho={1040} alto={240} titulo="PACF" y={[-0.5, 0.5]} />
            </div>
          </div>
          <div style={{ paddingTop: 40 }}>
            <p style={TXT}>
              Las huellas en <span style={ROJO}>1 y en 12</span>: un MA(1) de meses (o un AR(1)) y un MA(1) de años. Dos candidatos (44).
            </p>
          </div>
        </Entra>
      )}

      {step === 4 && (
        <Entra style={{ display: "grid", gridTemplateColumns: "1000px 1fr", gap: 64 }}>
          <div>
            <span className="label natural">AIC DE LOS 16 SARIMA (p,1,q)(P,1,Q)₁₂</span>
            <div style={{ marginTop: 12 }}>
              <AicGrid celdas={modelos.sarima_rejilla} criterio="aic" />
            </div>
          </div>
          <div style={{ paddingTop: 30 }}>
            <p style={TXT}>La ACF propone, AIC elige:</p>
            <p className="mono" style={{ fontSize: 30, margin: "14px 0 24px", color: "var(--red-2)" }}>
              SARIMA(0,1,1)(0,1,1)₁₂
            </p>
            <p style={TXT}>
              Y fue el mínimo en los {ORIGENES.length} orígenes que siguen (el segundo, a entre {Math.min(...ORIGENES.map((x) => x.segundo.delta_aic)).toFixed(2)} y{" "}
              {Math.max(...ORIGENES.map((x) => x.segundo.delta_aic)).toFixed(2)}).
            </p>
          </div>
        </Entra>
      )}

      {step === 5 && (
        <Entra style={{ display: "grid", gridTemplateColumns: "1040px 1fr", gap: 64 }}>
          <div>
            <SplitDiagram n={Y.length} filas={FILAS} ancho={1040} altoCelda={18} separacion={4} anchoEtiqueta={90} hueco={0} marcas={MARCAS} />
            <span className="label natural" style={{ display: "block", marginTop: 14, letterSpacing: 0 }}>
              <span style={{ color: "var(--text)" }}>━ real</span> · <span style={{ color: "var(--red-2)" }}>━ SARIMA</span> · ╍ ingenuo · ┈ ARIMA
            </span>
            <SeriesChart
              ancho={1040}
              alto={290}
              series={[
                { id: "ent", valores: Y.slice(T - 24, T), desde: T - 24, grosor: 2 },
                { id: "real", valores: o.real, desde: T, color: "var(--text)", grosor: 2.5, puntos: true },
                { id: "ingenuo", valores: o.ingenuo, desde: T, color: "var(--text-3)", grosor: 2.5, guion: "8 6" },
                { id: "arima", valores: o.arima, desde: T, color: "var(--text-3)", grosor: 2.5, guion: "2 5" },
                { id: "sarima", valores: o.sarima, desde: T, color: "var(--red)", grosor: 3 },
              ]}
              ventana={[T - 24, T + 11]}
              transicion={0.5}
            />
          </div>
          <div>
            <span className="label">Año que se pronostica · ↑ ↓</span>
            <div style={{ marginTop: 10 }}>
              <Chips opciones={ANIOS.map((a) => ({ valor: a, texto: String(a) }))} valor={anio} onChange={setAnio} />
            </div>
            <p style={{ ...TXT, marginTop: 24 }}>
              Para {anio} se entrena con 1949–{anio - 1} ({T} meses). <span style={ROJO}>Todo se vuelve a estimar solo con el pasado</span>.
            </p>
            <p className="mono" style={{ margin: "18px 0 0", fontSize: 22, color: "var(--text-2)", lineHeight: 1.5 }}>
              MAPE ingenuo {f2(o.mape.ingenuo)} %
              <br />
              MAPE ARIMA {f2(o.mape.arima)} %
              <br />
              MAPE SARIMA <span style={ROJO}>{f2(o.mape.sarima)} %</span>
            </p>
          </div>
        </Entra>
      )}

      {step === 6 && (
        <Entra>
          <span className="label">MAPE de cada año (%) y su media ± desviación</span>
          <div data-rotulo style={{ marginTop: 8 }}>
            <MetricTable
              tam={24}
              destacarColumna="1958"
              columnas={[
                ...ANIOS.map((a) => ({ clave: String(a), rotulo: String(a), fmt: f2, mejor: "min" as const })),
                { clave: "media", rotulo: "media ± desv", mejor: "min" as const },
              ]}
              filas={(["ingenuo", "arima", "sarima"] as Modelo[]).map((m) => {
                const vs = ORIGENES.map((x) => x.mape[m]);
                return {
                  id: m,
                  nombre: NOMBRES[m],
                  valores: { ...Object.fromEntries(ORIGENES.map((x) => [String(x.anio), x.mape[m]])), media: media(vs) },
                  textos: { media: `${f2(media(vs))} ± ${f2(desviacion(vs))}` },
                };
              })}
            />
          </div>
          <p style={{ ...TXT, marginTop: 26 }}>
            SARIMA gana <span style={ROJO}>{GANA} de {ORIGENES.length}</span>. Pierde en {PIERDE.join(", ")}: ese año el total creció {pct(crecimiento(1958))}, contra{" "}
            {pct(crecimiento(1957))} el anterior, y copiar el año pasado acertó.
          </p>
        </Entra>
      )}

      {step === 7 && (
        <Entra>
          <span className="label">Ljung-Box (24 rezagos) de los residuos de cada ajuste del SARIMA</span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 820px)", columnGap: 56, rowGap: 4, marginTop: 10 }}>
            {ORIGENES.map((x) => (
              <PValueScale key={x.anio} p={x.lb.p} quiere="grande" rotulo={`→ ${x.anio}`} ancho={820} alto={110} />
            ))}
          </div>
          <p style={{ ...TXT, marginTop: 14 }}>
            En los seis, p &gt; 0.05: <span style={ROJO}>no hay evidencia</span> de que quede parecido entre los residuos.
          </p>
        </Entra>
      )}

      {step >= 8 && (
        <Entra style={{ maxWidth: 1300, paddingTop: 30 }}>
          <p className="takeaway" style={{ margin: 0 }}>
            La receta completa, de la serie cruda al pronóstico evaluado. <em>SARIMA gana en promedio, no todos los años:</em> por eso se evalúa en varios orígenes y
            siempre contra una línea base.
          </p>
        </Entra>
      )}
    </SlideFrame>
  );
}
