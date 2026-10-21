import { AnioMes3D } from "../components/AnioMes3D";
import { Recap } from "../components/Recap";
import { Entra } from "../components/Reveal";
import { SeriesChart } from "../components/SeriesChart";
import { TeX } from "../components/TeX";
import { SlideFrame } from "../deck/SlideFrame";
import { R } from "../deck/tipografia";
import type { SlideProps } from "../deck/types";
import { ANIO_INICIAL, enMiles, entrenamiento, MESES, MESES_COMPLETOS, modelos, pasajeros, prueba, TRANSFORMACIONES_ENT, type Transformacion } from "../lib/pasajeros";

// ---------- Concepto: la rejilla de meses × años con sus dos flechas ----------
const INICIALES = ["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

function RejillaRezagos() {
  const lado = 64;
  const x0 = 96;
  const y0 = 40;
  const ancho = x0 + 12 * lado + 40;
  const cx = (c: number) => x0 + c * lado + lado / 2;
  const cy = (f: number) => y0 + f * lado + lado / 2;
  const AQUI = { f: 2, c: 6 };
  const ENERO = { f: 3, c: 0 };
  // Cada celda que importa lleva su nombre adentro; las flechas van de centro a centro.
  const marcadas: Record<string, { fill: string; stroke: string; texto: string; color: string }> = {
    [`${AQUI.f}-${AQUI.c}`]: { fill: "var(--red)", stroke: "var(--red)", texto: "t", color: "var(--text)" },
    [`${AQUI.f}-${AQUI.c - 1}`]: { fill: "var(--line-2)", stroke: "var(--text-2)", texto: "t−1", color: "var(--text)" },
    [`${AQUI.f - 1}-${AQUI.c}`]: { fill: "var(--red-dim)", stroke: "var(--red)", texto: "t−12", color: "var(--red-2)" },
    [`${ENERO.f}-${ENERO.c}`]: { fill: "none", stroke: "var(--text)", texto: "ene", color: "var(--text-2)" },
    [`${ENERO.f - 1}-11`]: { fill: "none", stroke: "var(--text-2)", texto: "dic", color: "var(--text-2)" },
  };
  return (
    <svg width={ancho} height={y0 + 5 * lado + 76} style={{ display: "block", overflow: "visible" }}>
      <defs>
        {[
          ["p-gris", "var(--text-2)"],
          ["p-roja", "var(--red)"],
        ].map(([id, color]) => (
          <marker key={id} id={id} viewBox="0 0 10 10" refX={9} refY={5} markerWidth={6} markerHeight={6} orient="auto">
            <path d="M0,0L10,5L0,10z" fill={color} />
          </marker>
        ))}
      </defs>
      {INICIALES.map((m, c) => (
        <text key={c} x={cx(c)} y={y0 - 12} textAnchor="middle" className="mono" fontSize={R} fill="var(--text-3)">
          {m}
        </text>
      ))}
      {Array.from({ length: 5 }, (_, f) => (
        <text key={f} x={x0 - 14} y={cy(f) + 7} textAnchor="end" className="mono" fontSize={R} fill="var(--text-3)">
          año {f + 1}
        </text>
      ))}
      {Array.from({ length: 5 }, (_, f) =>
        Array.from({ length: 12 }, (_, c) => {
          const m = marcadas[`${f}-${c}`];
          return (
            <g key={`${f}-${c}`}>
              <rect x={x0 + c * lado + 2} y={y0 + f * lado + 2} width={lado - 4} height={lado - 4} fill={m?.fill ?? "var(--bg-2)"} stroke={m?.stroke ?? "var(--line)"} strokeWidth={m ? 2 : 1} />
              {m && (
                <text x={cx(c)} y={cy(f) + 7} textAnchor="middle" className="mono" fontSize={m.texto === "t" ? 24 : R} fill={m.color}>
                  {m.texto}
                </text>
              )}
            </g>
          );
        }),
      )}
      {/* Rezago 1: al mes anterior. Rezago 12: al mismo mes del año anterior. */}
      <line x1={cx(AQUI.c) - lado / 2 + 2} x2={cx(AQUI.c - 1) + 24} y1={cy(AQUI.f) + 22} y2={cy(AQUI.f) + 22} stroke="var(--text-2)" strokeWidth={3} markerEnd="url(#p-gris)" />
      <line x1={cx(AQUI.c) + 22} x2={cx(AQUI.c) + 22} y1={cy(AQUI.f) - lado / 2 + 2} y2={cy(AQUI.f - 1) + 20} stroke="var(--red)" strokeWidth={3} markerEnd="url(#p-roja)" />
      {/* En enero, el mes anterior es diciembre del renglón de arriba: la flecha entra por la derecha (a la izquierda chocaría con "año 4"). */}
      <line x1={x0 + 12 * lado + 34} x2={cx(11) + lado / 2 + 2} y1={cy(ENERO.f - 1)} y2={cy(ENERO.f - 1)} stroke="var(--text-2)" strokeWidth={2} strokeDasharray="5 5" markerEnd="url(#p-gris)" />
      <text x={x0} y={y0 + 5 * lado + 32} className="mono" fontSize={R} fill="var(--text-2)">
        <tspan fill="var(--text)">gris: rezago 1</tspan> · <tspan fill="var(--red-2)">rojo: rezago 12</tspan>
      </text>
      <text x={x0} y={y0 + 5 * lado + 64} className="mono" fontSize={R} fill="var(--text-3)">
        en enero, el mes anterior es diciembre del año previo
      </text>
    </svg>
  );
}

// ---------- Caso ----------
const N = pasajeros.nEntrenamiento;
const ANIOS = N / 12;
const FASES: { t: Transformacion; nombre: string; rotulo: string; texto: string }[] = [
  { t: "log", nombre: "log y", rotulo: "log de pasajeros", texto: "Cada año repite la forma y sube un escalón." },
  { t: "d12log", nombre: "∇₁₂", rotulo: "crecimiento anual (log)", texto: "Cada celda menos la del año anterior: el dibujo del verano se va y cada cinta queda casi plana, a su altura. 1949 no tiene año anterior." },
  { t: "dd12log", nombre: "∇", rotulo: "∇∇₁₂ log", texto: "Además, cada mes menos el anterior: queda ruido alrededor de 0. Se pierde también enero de 1950." },
];
/** Una transformación del entrenamiento como [año][mes], con null donde la diferencia todavía no existe. */
const matrizDe = (t: Transformacion) => {
  const T = TRANSFORMACIONES_ENT[t];
  return Array.from({ length: ANIOS }, (_, f) => Array.from({ length: 12 }, (_, c) => (f * 12 + c >= T.desde ? T.valores[f * 12 + c - T.desde] : null)));
};
const MATRICES = FASES.map((f) => matrizDe(f.t));
const TOPE = 1.05 * Math.max(...[1, 2].flatMap((i) => MATRICES[i].flat().filter((v): v is number => v !== null).map(Math.abs)));
const LOG = MATRICES[0].flat() as number[];
const RANGOS: [number, number][] = [[Math.min(...LOG) - 0.15, Math.max(...LOG) + 0.05], [-TOPE, TOPE], [-TOPE, TOPE]];
const ETIQ_MESES = MESES.map((m, c) => (c % 3 === 0 ? m : ""));
const ETIQ_ANIOS = Array.from({ length: ANIOS }, (_, f) => String(ANIO_INICIAL + f));
const FLECHAS = { fila: 1955 - ANIO_INICIAL, col: 6 }; // julio de 1955

const E = modelos.elegido;
const NIVEL = enMiles(E.pronostico_log);
const BANDA = { abajo: E.ic95_log.map((f) => Math.exp(f[0])), arriba: E.ic95_log.map((f) => Math.exp(f[1])) };
const SE_PASA = NIVEL.filter((v, i) => v > prueba[i]).length;
const FUERA = prueba.flatMap((v, i) => (v < BANDA.abajo[i] || v > BANDA.arriba[i] ? [i] : []));
const suma = (v: number[]) => v.reduce((s, x) => s + x, 0);
const ANIO_PREVIO = entrenamiento.slice(N - 12);
const SUPUSO = suma(NIVEL) / suma(ANIO_PREVIO) - 1;
const CRECIO = suma(prueba) / suma(ANIO_PREVIO) - 1;
const PRUEBA = { desde: N - 0.5, hasta: N + 11, texto: "PRUEBA · 1960", color: "var(--line)" };
const f2 = (v: number) => v.toFixed(2).replace("-", "−");
const signo = (v: number) => (v < 0 ? `- ${(-v).toFixed(2)}` : `+ ${v.toFixed(2)}`);
const pct = (v: number) => `${(v * 100).toFixed(1)} %`;
const TXT = { fontSize: 26, lineHeight: 1.42, margin: 0 } as const;
const ROJO = { color: "var(--red-2)" };
const mayuscula = (s: string) => s.replace(/^./, (l) => l.toUpperCase());

// Un clic, una idea: 0–1 los dos relojes y la notación; 2–4 las cintas 3D (log, ∇₁₂, ∇); 5–6 el modelo de aerolínea
// (forma desarrollada y forma con B); 7–8 el pronóstico y el destape de 1960; 9 el cierre.
export default function SARIMA({ step }: SlideProps) {
  const fase = Math.min(Math.max(step - 2, 0), 2);
  const cintas = step >= 2 && step <= 4;
  const pronostico = step >= 7;

  return (
    <SlideFrame
      section={["U8 · Datos secuenciales", "G. Modelos de series"]}
      num={47}
      caso={step >= 2 ? "Pasajeros aéreos" : null}
      title="SARIMA: un ARIMA para los meses y otro para los años"
      lede="Un SARIMA agrega a ARIMA una parte que trabaja con rezagos de s periodos: aquí, el mismo mes del año anterior."
    >
      {step <= 1 && (
        <div style={{ display: "grid", gridTemplateColumns: "920px 1fr", gap: 60 }}>
          <div>
            <span className="label">Esquema · cada celda es un mes</span>
            <RejillaRezagos />
          </div>
          {step === 0 ? (
            <Entra style={{ paddingTop: 50 }}>
              <p style={TXT}>
                <b>Dos relojes.</b> El rezago 1 compara con el mes anterior; el rezago 12, <span style={ROJO}>con el mismo mes del año pasado</span>.
              </p>
            </Entra>
          ) : (
            <Entra style={{ paddingTop: 30 }}>
              <div style={{ fontSize: 30 }}>
                <TeX>{"\\text{SARIMA}(p,d,q)\\,\\textcolor{#e5383b}{(P,D,Q)_{s}}"}</TeX>
              </div>
              <p style={{ ...TXT, marginTop: 20 }}>
                (p, d, q): la parte de meses, como en la 43. <span style={ROJO}>(P, D, Q)ₛ</span>: lo mismo, contando de s en s. D es la diferencia estacional de la 36:
              </p>
              <div style={{ fontSize: 30, marginTop: 20 }}>
                <TeX>{"\\nabla_{s}\\, y_t = y_t - y_{t-s} \\qquad (s = 12)"}</TeX>
              </div>
            </Entra>
          )}
        </div>
      )}

      {cintas && (
        <div style={{ display: "grid", gridTemplateColumns: "1000px 1fr", gap: 60 }}>
          <div style={{ height: 600 }}>
            <AnioMes3D
              matriz={MATRICES[fase]}
              forma="cintas"
              rango={RANGOS[fase]}
              planoCero={fase > 0}
              etiquetasFilas={ETIQ_ANIOS}
              etiquetasCols={ETIQ_MESES}
              cadaFilas={5}
              rotuloAltura={FASES[fase].rotulo}
              flechas={FLECHAS}
            />
          </div>
          <div>
            <span className="label">1949–1959 · una cinta por año</span>
            <div className="mono" style={{ fontSize: 28, margin: "14px 0 22px" }}>
              {FASES.map((f, i) => (
                <span key={f.t} style={{ color: i === fase ? "var(--red-2)" : "var(--text-3)" }}>
                  {i > 0 && "  →  "}
                  {f.nombre}
                </span>
              ))}
            </div>
            <Entra key={fase}>
              <p style={TXT}>{FASES[fase].texto}</p>
              {fase === 0 && (
                <p style={{ ...TXT, marginTop: 18, color: "var(--text-2)" }}>
                  Sobre julio de 1955, la flecha gris va al mes anterior; la roja, al mismo mes del año anterior.
                </p>
              )}
            </Entra>
          </div>
        </div>
      )}

      {step === 5 && (
        <Entra style={{ maxWidth: 1300 }}>
          <p style={TXT}>
            Lo que queda se modela con un MA(1) de meses y uno de años: el <b style={ROJO}>modelo de aerolínea</b>, que Box y Jenkins propusieron para esta misma serie.
          </p>
          <span className="label natural" style={{ display: "block", marginTop: 36, letterSpacing: 0 }}>
            choque de hoy + θ por el del mes pasado + Θ por el de hace un año + θΘ por el de hace 13 meses
          </span>
          <div style={{ fontSize: 34, margin: "16px 0 36px" }}>
            <TeX>{`w_t = \\varepsilon_t ${signo(E.theta)}\\,\\varepsilon_{t-1} ${signo(E.Theta)}\\,\\varepsilon_{t-12} ${signo(E.theta * E.Theta)}\\,\\varepsilon_{t-13}`}</TeX>
          </div>
          <p style={TXT}>
            El término de 13 meses no es un coeficiente nuevo: sale del producto <TeX>{`\\hat\\theta\\,\\hat\\Theta = (${f2(E.theta)})(${f2(E.Theta)})`}</TeX>.
          </p>
        </Entra>
      )}

      {step === 6 && (
        <Entra style={{ display: "grid", gridTemplateColumns: "1000px 1fr", gap: 60 }}>
          <div>
            <p style={TXT}>La misma ecuación, en la forma corta con que la escriben los libros y statsmodels:</p>
            <div style={{ fontSize: 34, marginTop: 36 }}>
              <TeX>{"(1-B)(1-B^{12})\\ln y_t = (1+\\theta B)(1+\\Theta B^{12})\\,\\varepsilon_t"}</TeX>
            </div>
          </div>
          <Recap title="operador B">
            <p>
              B quiere decir «el valor anterior»: <TeX>{"B\\,y_t = y_{t-1}"}</TeX>.
            </p>
            <p style={{ marginTop: 12 }}>Por eso (1 − B) es restar el anterior, ∇, y (1 − B¹²), restar el del año pasado, ∇₁₂.</p>
          </Recap>
        </Entra>
      )}

      {pronostico && (
        <div style={{ display: "grid", gridTemplateColumns: "1040px 1fr", gap: 64 }}>
          <div>
            <div className="label" style={{ marginBottom: 6 }}>
              El modelo de aerolínea pronostica 1960 · franja: banda del 95 %
            </div>
            <SeriesChart
              ancho={1040}
              alto={480}
              series={[
                { id: "ent", valores: entrenamiento, grosor: 2 },
                { id: "pron", valores: NIVEL, desde: N, color: "var(--red)", grosor: 3, puntos: true },
                ...(step >= 8 ? [{ id: "real", valores: prueba, desde: N, color: "var(--text)", grosor: 2.5, puntos: true }] : []),
              ]}
              ventana={[96, N + 11]}
              y={[200, 800]}
              bandas={step >= 8 ? [] : [PRUEBA]}
              franjas={[{ id: "ic", desde: N, ...BANDA }]}
              rotuloY="miles de pasajeros"
              recortar
            />
          </div>
          {step === 7 && (
            <Entra style={{ paddingTop: 40 }}>
              <p style={TXT}>Entrenado solo con 1949–1959. Con dos coeficientes, el pronóstico ya tiene la onda que al ARIMA de la 43 le faltaba.</p>
              <p style={{ ...TXT, marginTop: 18, color: "var(--text-2)" }}>1960 sigue tapado.</p>
            </Entra>
          )}
          {step === 8 && (
            <Entra style={{ paddingTop: 40 }}>
              <p style={TXT}>
                Se destapa 1960 (blanco). Julio: <span className="mono">{NIVEL[6].toFixed(1)}</span> pronosticado, <span className="mono">{prueba[6]}</span> real.
              </p>
              <p style={{ ...TXT, marginTop: 18 }}>
                Pero se pasó en <span style={ROJO}>{SE_PASA} de 12 meses</span>: supuso crecer {pct(SUPUSO)} y se creció {pct(CRECIO)}.
                {FUERA.length > 0 && ` ${mayuscula(FUERA.map((i) => MESES_COMPLETOS[i]).join(" y "))} quedó fuera de la banda.`}
              </p>
            </Entra>
          )}
          {step >= 9 && (
            <Entra style={{ paddingTop: 40 }}>
              <p className="takeaway" style={{ margin: 0 }}>
                Un reloj de meses y otro de años. <em>Con dos coeficientes, el pronóstico tiene la onda del verano.</em> ¿Es el mejor? ¿Qué tan bueno? 46.
              </p>
            </Entra>
          )}
        </div>
      )}
    </SlideFrame>
  );
}
