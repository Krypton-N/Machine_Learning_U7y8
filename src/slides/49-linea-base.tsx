import { useEffect, useState } from "react";
import { MetricTable } from "../components/MetricTable";
import { Chips } from "../components/Piezas";
import { Recap } from "../components/Recap";
import { Entra } from "../components/Reveal";
import { SeriesChart } from "../components/SeriesChart";
import { TeX } from "../components/TeX";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { comparacion } from "../lib/adult";
import { enMiles, entrenamiento, modelos, pasajeros, prueba } from "../lib/pasajeros";
import { ingenuoEstacional, mae, mape, rmse } from "../lib/series";

// ---------- Concepto: tres años de esquema y la copia del último ----------
const ESQUEMA = Array.from({ length: 36 }, (_, t) => 100 + 2.5 * t + 18 * Math.sin((2 * Math.PI * (t - 3)) / 12));
const COPIA = ESQUEMA.slice(24);
const MAYORITARIA = comparacion.find((m) => m.modelo === "Clase mayoritaria")!.accuracy.media;

// ---------- Caso: cinco pronósticos de 1960, todos sin ver 1960 ----------
const N = pasajeros.nEntrenamiento;
const DESDE = N - 24; // enero de 1958
const suma = (v: number[]) => v.reduce((s, x) => s + x, 0);
const INGENUO = ingenuoEstacional(entrenamiento, 12);
/** Lo que creció el total de 1958 a 1959: la única información extra del ingenuo con crecimiento. */
const CRECIMIENTO = suma(entrenamiento.slice(N - 12)) / suma(entrenamiento.slice(N - 24, N - 12));
type Id = "ingenuo" | "crec" | "bosque" | "arima" | "sarima";
const PRONOSTICOS: Record<Id, { nombre: string; corto: string; valores: number[] }> = {
  ingenuo: { nombre: "Ingenuo estacional: copiar 1959", corto: "ingenuo", valores: INGENUO },
  crec: { nombre: `Ingenuo con crecimiento: 1959 × ${CRECIMIENTO.toFixed(3)}`, corto: "con crecimiento", valores: INGENUO.map((v) => v * CRECIMIENTO) },
  bosque: { nombre: "Random Forest de la 30", corto: "bosque", valores: modelos.linea_base.bosque.pronostico },
  arima: { nombre: "ARIMA(0,1,1) con deriva (43)", corto: "ARIMA", valores: enMiles(modelos.arima.pronostico_log) },
  sarima: { nombre: "SARIMA, modelo de aerolínea (45)", corto: "SARIMA", valores: enMiles(modelos.elegido.pronostico_log) },
};
const IDS = Object.keys(PRONOSTICOS) as Id[];
const M = Object.fromEntries(IDS.map((id) => [id, { mae: mae(prueba, PRONOSTICOS[id].valores), rmse: rmse(prueba, PRONOSTICOS[id].valores), mape: mape(prueba, PRONOSTICOS[id].valores) }])) as Record<
  Id,
  { mae: number; rmse: number; mape: number }
>;
const CRECIO_TODOS = prueba.filter((v, i) => v > INGENUO[i]).length;
const mejora = (a: number, b: number) => `${Math.round((1 - a / b) * 100)} %`;
const f1 = (v: number) => v.toFixed(1);
const TXT = { fontSize: 26, lineHeight: 1.42, margin: 0 } as const;
const ROJO = { color: "var(--red-2)" };

// Un clic, una idea: 0 el ingenuo estacional; 1 por qué sirve de vara; 2 el caso; 3 la tabla; 4 SARIMA contra cada
// línea base, en la gráfica; 5 el cierre.
export default function LineaBase({ step }: SlideProps) {
  const [sel, setSel] = useState<Id>("crec");
  useEffect(() => setSel("crec"), [step]);
  const linea: Id = step === 2 ? "ingenuo" : sel;
  const grafica = step === 2 || step >= 4;

  return (
    <SlideFrame
      section={["U8 · Datos secuenciales", "G. Modelos de series"]}
      num={49}
      caso={step >= 2 ? "Pasajeros aéreos" : null}
      title="La línea base: copiar el año pasado"
      lede="Un modelo se mide contra la regla más simple que funcione. Si no le gana, no aporta."
    >
      {step <= 1 && (
        <div style={{ display: "grid", gridTemplateColumns: "1000px 1fr", gap: 64 }}>
          <div>
            <span className="label">Esquema · tres años con tendencia y estación; el último se copia</span>
            <SeriesChart
              ancho={1000}
              alto={460}
              series={[
                { id: "esq", valores: ESQUEMA, grosor: 2.2 },
                { id: "copia", valores: COPIA, desde: 36, color: "var(--red)", grosor: 3, guion: "8 6" },
              ]}
              ventana={[0, 47]}
              eje="indice"
              sinMarcasX
              bandas={[{ desde: 23.5, hasta: 35.5, texto: "último año", color: "var(--line)" }]}
              rotuloX="meses →"
            />
          </div>
          {step === 0 ? (
            <Entra style={{ paddingTop: 30 }}>
              <p style={TXT}>
                <b>Ingenuo estacional:</b> el pronóstico de cada mes es <span style={ROJO}>el mismo mes del año pasado</span>.
              </p>
              <div style={{ fontSize: 30, margin: "24px 0" }}>
                <TeX>{"\\hat y_{T+h} = y_{T+h-12}"}</TeX>
              </div>
              <p style={TXT}>No aprende nada y no tiene coeficientes.</p>
            </Entra>
          ) : (
            <Entra style={{ paddingTop: 30 }}>
              <p style={TXT}>Por eso sirve de vara: lo que un modelo le gane es lo que de verdad aporta.</p>
              <div style={{ marginTop: 26 }}>
                <Recap title="línea base">
                  <p>En Adult, decir siempre «no gana más de 50K» acertaba {(MAYORITARIA * 100).toFixed(1)} % sin aprender nada (26).</p>
                </Recap>
              </div>
            </Entra>
          )}
        </div>
      )}

      {grafica && (
        <div style={{ display: "grid", gridTemplateColumns: "1000px 1fr", gap: 64 }}>
          <div>
            <span className="label natural" style={{ letterSpacing: 0 }}>
              1958–1960 en miles · <span style={{ color: "var(--text)" }}>━ 1960 real</span> · ╍ {PRONOSTICOS[linea].corto}
              {step >= 4 && <span style={{ color: "var(--red-2)" }}> · ━ SARIMA</span>}
            </span>
            <SeriesChart
              ancho={1000}
              alto={480}
              series={[
                // Solo 1958–1959: así no hace falta recortar, y los rótulos de las líneas quedan a la vista a la derecha.
                { id: "ent", valores: entrenamiento.slice(DESDE), desde: DESDE, grosor: 2 },
                ...(step >= 4 ? [{ id: "sarima", valores: PRONOSTICOS.sarima.valores, desde: N, color: "var(--red)", grosor: 3 }] : []),
                ...(linea !== "sarima" ? [{ id: linea, valores: PRONOSTICOS[linea].valores, desde: N, color: "var(--text-2)", grosor: 3, guion: "8 6" }] : []),
                { id: "real", valores: prueba, desde: N, color: "var(--text)", grosor: 2.5, puntos: true },
              ]}
              ventana={[DESDE, N + 11]}
              y={[300, 700]}
              margen={{ l: 64, r: 22, t: 16, b: 48 }}
            />
          </div>
          {step === 2 && (
            <Entra style={{ paddingTop: 40 }}>
              <p style={TXT}>
                1959 copiado sobre 1960 se queda corto <span style={ROJO}>en {CRECIO_TODOS} de 12 meses</span>: no sabe que el tráfico crece.
              </p>
              <p className="mono" style={{ margin: "22px 0 0", fontSize: 28 }}>
                MAE {f1(M.ingenuo.mae)} mil
                <br />
                MAPE {M.ingenuo.mape.toFixed(2)} %
              </p>
            </Entra>
          )}
          {step === 4 && (
            <Entra style={{ paddingTop: 10 }}>
              <Chips opciones={IDS.filter((id) => id !== "sarima").map((id) => ({ valor: id, texto: PRONOSTICOS[id].corto }))} valor={sel} onChange={setSel} />
              <p style={{ ...TXT, marginTop: 26 }}>
                Contra copiar 1959, SARIMA baja el MAE {mejora(M.sarima.mae, M.ingenuo.mae)}. Contra copiarlo y subirlo lo que venía creciendo,{" "}
                <span style={ROJO}>empatan</span>: MAE {f1(M.sarima.mae)} contra {f1(M.crec.mae)}; RMSE {f1(M.sarima.rmse)} contra {f1(M.crec.rmse)}.
              </p>
            </Entra>
          )}
          {step >= 5 && (
            <Entra style={{ paddingTop: 40 }}>
              <p className="takeaway" style={{ margin: 0 }}>
                Un modelo que no le gana a la regla más simple no aporta. <em>Y la vara debe ser la más alta que salga gratis.</em> ¿Fue suerte de 1960?
              </p>
            </Entra>
          )}
        </div>
      )}

      {step === 3 && (
        <Entra style={{ maxWidth: 1400 }}>
          <span className="label">1960 · cinco pronósticos, ninguno vio 1960</span>
          <div data-rotulo style={{ marginTop: 10 }}>
            <MetricTable
              tam={26}
              columnas={[
                { clave: "mae", rotulo: "MAE", fmt: f1, mejor: "min" },
                { clave: "rmse", rotulo: "RMSE", fmt: f1, mejor: "min" },
                { clave: "mape", rotulo: "MAPE %", fmt: (v) => v.toFixed(2), mejor: "min" },
              ]}
              filas={IDS.map((id) => ({ id, nombre: PRONOSTICOS[id].nombre, valores: M[id] }))}
            />
          </div>
          <p style={{ ...TXT, marginTop: 24 }}>
            El bosque apenas le gana a copiar 1959; el ARIMA sin estación pierde. La regla que además sube lo que venía creciendo <span style={ROJO}>es otra cosa</span>.
          </p>
        </Entra>
      )}
    </SlideFrame>
  );
}
