import { motion } from "motion/react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Dispersion } from "../components/Dispersion";
import { Boton, Dato } from "../components/Piezas";
import { Recap } from "../components/Recap";
import { Reveal } from "../components/Reveal";
import { SeriesChart } from "../components/SeriesChart";
import { TablaCruda } from "../components/TablaCruda";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { ANIOS, etiqueta, pasajeros } from "../lib/pasajeros";
import { mulberry32 } from "../lib/rng";
import { ejeQueCubre } from "../lib/scale";
import { barajar, pearson, simularAR } from "../lib/series";

// ---------- Concepto: dos tiras de esquema ----------
// Las semillas se eligieron por búsqueda para que el contraste se vea con solo 24 valores: en el dado, un valor
// no se parece al siguiente (correlación −0.05); en la serie con memoria, sí (0.86). El barajado inicial deja
// las dos cerca de 0.
const N_TIRA = 24;
const dado = (() => {
  const r = mulberry32(55);
  return Array.from({ length: N_TIRA }, () => Math.floor(r() * 6) + 1);
})();
const MEMORIA = 0.9;
const conMemoria = simularAR(MEMORIA, N_TIRA, mulberry32(155)).x;
const BARAJADO_INICIAL = 12;

const enOrden = (n: number) => Array.from({ length: n }, (_, i) => i);

function Tira({ titulo, valores, orden, piso, veredicto, visible }: { titulo: ReactNode; valores: number[]; orden: number[]; piso: number; veredicto: ReactNode; visible: boolean }) {
  const W = 1060;
  const H = 178;
  const paso = W / valores.length;
  const techo = Math.max(...valores);
  // En qué lugar queda cada barra: `orden[lugar]` dice qué valor va ahí.
  const lugar = new Array<number>(valores.length);
  orden.forEach((original, pos) => (lugar[original] = pos));
  return (
    <div>
      <div style={{ fontSize: 26, color: "var(--text-2)", marginBottom: 6 }}>{titulo}</div>
      <svg width={W} height={H} style={{ display: "block" }}>
        <line x1={0} x2={W} y1={H - 0.5} y2={H - 0.5} stroke="var(--line-2)" />
        {valores.map((v, i) => {
          const h = 8 + ((v - piso) / (techo - piso)) * (H - 12);
          return (
            <motion.rect
              key={i}
              y={H - h}
              width={paso - 8}
              height={h}
              fill="var(--data)"
              initial={false}
              animate={{ x: lugar[i] * paso + 4 }}
              transition={{ duration: 0.8, delay: i * 0.012, ease: [0.2, 0.7, 0.2, 1] }}
            />
          );
        })}
      </svg>
      <motion.div initial={false} animate={{ opacity: visible ? 1 : 0 }} style={{ fontSize: 26, marginTop: 8, minHeight: 32 }}>
        {veredicto}
      </motion.div>
    </div>
  );
}

// ---------- Caso: pasajeros aéreos ----------
const Y = pasajeros.valores;
const C = pasajeros.crudo;
const EJE = ejeQueCubre(Y, 100);
const SIN_DATO = Y.filter((v) => !Number.isFinite(v)).length;
const cod = { fontFamily: "var(--mono)", color: "var(--red-2)" } as const;

function Nota({ titulo, children }: { titulo: ReactNode; children: ReactNode }) {
  return (
    <div style={{ borderTop: "1px solid var(--line-2)", paddingTop: 10 }}>
      <div style={{ fontSize: 26, fontWeight: 600 }}>{titulo}</div>
      <div style={{ fontSize: 26, color: "var(--text-2)", lineHeight: 1.38, marginTop: 4 }}>{children}</div>
    </div>
  );
}

function Controles({ onBarajar, onOriginal }: { onBarajar: () => void; onOriginal: () => void }) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      <Boton onClick={onBarajar}>barajar</Boton>
      <Boton onClick={onOriginal}>orden original</Boton>
    </div>
  );
}

export default function ElOrdenImporta({ step }: SlideProps) {
  const [semilla, setSemilla] = useState(BARAJADO_INICIAL);
  const [original, setOriginal] = useState(true);
  // Al llegar a los pasos de "barajar" (1 y 4) se muestra ya barajado; en los demás, el orden en que llegó.
  useEffect(() => setOriginal(!(step === 1 || step === 4)), [step]);
  const barajada = !original && (step === 1 || step >= 4);
  const barajar_ = () => {
    setSemilla((s) => (original ? s : s + 1));
    setOriginal(false);
  };

  const ordenTira = useMemo(() => (barajada && step <= 1 ? barajar(N_TIRA, mulberry32(semilla)) : enOrden(N_TIRA)), [barajada, semilla, step]);
  const ordenSerie = useMemo(() => (barajada && step >= 4 ? barajar(Y.length, mulberry32(semilla)) : enOrden(Y.length)), [barajada, semilla, step]);
  const serie = ordenSerie.map((i) => Y[i]);
  const r = pearson(serie.slice(0, -1), serie.slice(1));

  return (
    <SlideFrame
      section={["U8 · Datos secuenciales", "Puente"]}
      num={29}
      caso={step >= 2 ? "Pasajeros aéreos" : null}
      title="El orden importa"
      lede="En la parte 1 cada fila era otra persona y se podían barajar. ¿Y si el orden también es dato?"
    >
      {step <= 1 && (
        <motion.div key="concepto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "grid", gridTemplateColumns: "540px 1fr", gap: 76 }}>
          <div>
            <Recap title="i.i.d.">
              <p>
                <b>Independientes:</b> saber un dato no cambia lo que esperas de otro.
              </p>
              <p style={{ marginTop: 12 }}>
                <b>Idénticamente distribuidos:</b> todos salen de la misma urna.
              </p>
            </Recap>
            <Reveal step={step} at={1} style={{ marginTop: 26, fontSize: 26, lineHeight: 1.42, color: "var(--text-2)" }}>
              Si los datos son i.i.d., cualquier orden es igual de probable: barajarlos no quita información. Así tratamos a las personas de Adult.
            </Reveal>
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: 46, marginBottom: 10 }}>
              <span className="label">Esquema · simulado, no son datos</span>
              {step >= 1 && <Controles onBarajar={barajar_} onOriginal={() => setOriginal(true)} />}
            </div>
            <Tira
              titulo={`A · ${N_TIRA} tiros de un dado`}
              valores={dado}
              orden={ordenTira}
              piso={0}
              visible={step >= 1 && barajada}
              veredicto="Se ve igual de desordenada: no había nada que perder."
            />
            <div style={{ height: 22 }} />
            <Tira
              titulo={`B · una serie con memoria: cada valor = ${MEMORIA} × el anterior + un empujón al azar`}
              valores={conMemoria}
              orden={ordenTira}
              piso={Math.min(...conMemoria)}
              visible={step >= 1 && barajada}
              veredicto={
                <>
                  Se perdieron las subidas y las bajadas: <em style={{ fontStyle: "normal", color: "var(--red-2)" }}>el orden era la información.</em>
                </>
              }
            />
          </div>
        </motion.div>
      )}

      {(step === 2 || step === 3) && (
        <motion.div key="crudo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "grid", gridTemplateColumns: "500px 1fr", gap: 80 }}>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginBottom: 8 }}>
              <span className="mono" style={{ fontSize: 24, color: "var(--red-2)" }}>
                pasajeros.head()
              </span>
            </div>
            <span className="label">las primeras 5 filas de {Y.length}, tal como llegan</span>
            <div style={{ marginTop: 14 }}>
              <TablaCruda datos={C} anotada={step >= 3} objetivo="value" tamano={27} />
            </div>
            <div className="mono" style={{ marginTop: 26 }}>
              <div style={{ fontSize: 26, color: "var(--red-2)" }}>pasajeros.shape</div>
              <div style={{ fontSize: 36, lineHeight: 1.2 }}>
                ({Y.length}, {C.columnas.length})
              </div>
              <div className="label">filas, columnas</div>
            </div>
          </div>
          {step === 2 ? (
            <motion.div key="que-es" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "grid", gap: 26, alignContent: "start", maxWidth: 900 }}>
              <Nota titulo="De dónde sale">
                De un libro clásico de series de tiempo (Box y Jenkins, «serie G»). Viene incluido en R con el nombre AirPassengers.
              </Nota>
              <Nota titulo="Qué es cada fila">
                Un mes, de {etiqueta(0)} a {etiqueta(Y.length - 1)}. <span style={cod}>time</span> dice cuál; <span style={cod}>value</span>, cuántos pasajeros
                volaron ese mes en aerolíneas internacionales.
              </Nota>
              <Nota titulo="Qué se quiere predecir">
                La misma columna <span style={cod}>value</span>, pero de los meses que todavía no llegan.
              </Nota>
            </motion.div>
          ) : (
            <motion.div key="cambios" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 34 }}>
                <Nota
                  titulo={
                    <>
                      <span style={cod}>time</span> pasa a año y mes
                    </>
                  }
                >
                  Es el año más (mes − 1) / 12: {C.filas[1][0]} es {etiqueta(1)}. Se cambia por un contador t = 1, 2, …, {Y.length}.
                </Nota>
                <Nota
                  titulo={
                    <>
                      <span style={cod}>value</span> está en miles
                    </>
                  }
                >
                  {Y[0]} quiere decir {(Y[0] * 1000).toLocaleString("es-MX")} pasajeros. No se le cambia nada.
                </Nota>
                <Nota titulo="Nada que quitar">
                  {Y.length} filas: {Y.length / 12} años completos y {SIN_DATO === 0 ? "ningún dato faltante" : `${SIN_DATO} datos faltantes`}.
                </Nota>
              </div>
              <div style={{ marginTop: 22 }}>
                <SeriesChart ancho={1110} alto={330} series={[{ id: "pasajeros", valores: Y, color: "var(--text)", grosor: 2 }]} y={EJE.dominio} ticksY={EJE.ticks} rotuloY="miles de pasajeros" />
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {step >= 4 && (
        <motion.div key="serie" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span className="label">
              Miles de pasajeros por mes · {ANIOS[0]}–{ANIOS[ANIOS.length - 1]} · {barajada ? "barajados" : "en el orden en que ocurrieron"}
            </span>
            <Controles onBarajar={barajar_} onOriginal={() => setOriginal(true)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: step >= 5 ? "1000px 1fr" : "1fr", gap: 40, alignItems: "start" }}>
            <SeriesChart
              ancho={step >= 5 ? 1000 : 1696}
              alto={430}
              series={[{ id: "pasajeros", valores: serie, color: "var(--text)", grosor: 2, puntos: true }]}
              y={EJE.dominio}
              ticksY={EJE.ticks}
              sinMarcasX={barajada}
              cadaAnios={step >= 5 ? 2 : 1}
              rotuloX={barajada ? "los mismos 144 meses, en un orden al azar" : undefined}
              transicion={0.8}
            />
            {step >= 5 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "grid", gridTemplateColumns: "430px 1fr", gap: 22, alignItems: "start" }}>
                <Dispersion
                  x={serie.slice(0, -1)}
                  y={serie.slice(1)}
                  ancho={430}
                  alto={430}
                  dominioX={EJE.dominio}
                  dominioY={EJE.dominio}
                  recta="diagonal"
                  rotuloX="un mes"
                  rotuloY="el mes siguiente"
                />
                <div style={{ paddingTop: 20 }}>
                  <Dato valor={r.toFixed(3)} rotulo="correlación r" rojo={!barajada} />
                  <div style={{ fontSize: 26, color: "var(--text-2)", lineHeight: 1.4, marginTop: 18 }}>
                    r = 1: los puntos caen sobre una recta que sube.
                    <br />r = 0: nube sin forma.
                  </div>
                </div>
              </motion.div>
            )}
          </div>
          {step < 6 ? (
            <div style={{ fontSize: 26, color: "var(--text-2)", marginTop: 16, minHeight: 36 }}>
              {step === 4 && barajada && "Barajados, desaparecen la subida de los años y la onda de cada verano."}
              {step === 5 && (barajada ? "Al barajar, la nube se deshace: lo que unía a un mes con el siguiente era el orden." : "Cada mes se parece al anterior: los puntos siguen la diagonal.")}
            </div>
          ) : (
            <Reveal step={step} at={6} style={{ marginTop: 16 }}>
              <p className="takeaway" style={{ margin: 0, fontSize: 27 }}>
                Barajar y K-Fold suponen que el orden no dice nada. En pasajeros <em>el orden es parte del dato</em>: los meses cercanos se parecen y el nivel
                cambia con los años. Hay que validar de otra forma.
              </p>
            </Reveal>
          )}
        </motion.div>
      )}
    </SlideFrame>
  );
}
