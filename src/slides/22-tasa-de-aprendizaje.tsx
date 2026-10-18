import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Lineas } from "../components/Lineas";
import { Chips, Dato, Def, pct } from "../components/Piezas";
import { Reveal } from "../components/Reveal";
import { TeX } from "../components/TeX";
import { SlideFrame } from "../deck/SlideFrame";
import type { SlideProps } from "../deck/types";
import { gbShrinkage } from "../lib/adult";

const G = gbShrinkage;
const N_MAX = G.arboles[G.arboles.length - 1];
// El eje de árboles va en escala logarítmica: con ν = 1 todo pasa en los primeros 30 y con ν = 0.03, después de 1 000.
const lx = (n: number) => Math.log10(n);
const TICKS_X = [1, 3, 10, 30, 100, 300, 1000].map((n) => ({ v: lx(n), texto: n.toLocaleString("es-MX") }));
const OPCIONES = G.tasas.map((t) => ({ valor: t.tasa, texto: `ν = ${t.tasa}` }));

// Reparto de los datos: con validación se decide cuándo parar; con prueba se reporta.
function Particion() {
  const total = G.n_entrenamiento + G.n_validacion + G.n_prueba;
  const partes = [
    { n: G.n_entrenamiento, nombre: "entrenamiento", uso: "aquí aprenden los árboles", color: "var(--data-dim)" },
    { n: G.n_validacion, nombre: "validación", uso: "decide cuándo parar", color: "var(--red)" },
    { n: G.n_prueba, nombre: "prueba", uso: "solo para el resultado final", color: "var(--data)" },
  ];
  return (
    <div style={{ display: "flex", gap: 6, width: 760 }}>
      {partes.map((p) => (
        <div key={p.nombre} style={{ width: `${(p.n / total) * 100}%` }}>
          <div style={{ height: 22, background: p.color }} />
          <div style={{ fontSize: 26, marginTop: 8 }}>{p.nombre}</div>
          <div className="mono" style={{ fontSize: 20, color: "var(--text-3)" }}>
            {Math.round((p.n / total) * 100)} % · {p.uso}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TasaDeAprendizaje({ step }: SlideProps) {
  const [tasa, setTasa] = useState(0.3);
  const t = G.tasas.find((x) => x.tasa === tasa)!;
  const caso = step >= 1;
  const serie = (ys: number[]) => G.arboles.map((n, i): [number, number] => [lx(n), ys[i]]);

  return (
    <SlideFrame
      section={["U7 · Ensambles", "D. Boosting"]}
      num={22}
      caso={caso ? "Adult" : null}
      title="Tasa de aprendizaje y cuándo parar"
      lede={
        caso
          ? `Gradient Boosting en Adult completo, hasta ${N_MAX.toLocaleString("es-MX")} árboles. La línea roja es la log-loss con datos de validación; menor es mejor.`
          : "Cada árbol se suma multiplicado por ν. Es el tamaño del paso de la diapositiva 20, ahora al sumar árboles."
      }
    >
      <AnimatePresence mode="wait">
        {!caso ? (
          <motion.div key="concepto" style={{ display: "grid", gridTemplateColumns: "1fr 760px", gap: 90 }} exit={{ opacity: 0, transition: { duration: 0.2 } }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 32, paddingTop: 10 }}>
              <div style={{ fontSize: 32 }}>
                <TeX>{"F_m = F_{m-1} + {\\color{#e5383b}\\nu}\\, h_m"}</TeX>
              </div>
              <Def termino="ν grande">Pocos árboles bastan, pero cada uno corrige de más y el modelo se pasa.</Def>
              <Def termino="ν chica">Cada árbol corrige poco. Hacen falta muchos más, pero es más difícil pasarse.</Def>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 30, paddingTop: 10 }}>
              <Def termino="Paro temprano (early stopping)">
                A diferencia de Random Forest, aquí agregar árboles sí puede empeorar el modelo. Se vigila el error con datos de validación y
                se deja de agregar cuando lleva un rato sin mejorar.
              </Def>
              <div>
                <span className="label">Cómo se reparten los datos</span>
                <div style={{ marginTop: 14 }}>
                  <Particion />
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="caso"
            style={{ display: "grid", gridTemplateColumns: "1000px 1fr", gap: 70 }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Chips opciones={OPCIONES} valor={tasa} onChange={setTasa} />
                <span className="label">
                  <span style={{ color: "var(--red-2)" }}>— validación</span>&nbsp;&nbsp;— entrenamiento
                </span>
              </div>
              <div style={{ marginTop: 12 }}>
                <Lineas
                  ancho={1000}
                  alto={450}
                  x={[0, lx(N_MAX)]}
                  y={[0.12, 0.5]}
                  ticksX={TICKS_X}
                  ticksY={[0.2, 0.3, 0.4, 0.5]}
                  fmtY={(v) => v.toFixed(1)}
                  rotuloX="árboles (escala logarítmica)"
                  recortar
                  series={[
                    ...G.tasas.filter((x) => x.tasa !== tasa).map((x) => ({ id: `v${x.tasa}`, pts: serie(x.logloss_validacion), color: "var(--red)", opacidad: 0.22, grosor: 2 })),
                    { id: "tr", pts: serie(t.logloss_entrenamiento) },
                    { id: "va", pts: serie(t.logloss_validacion), color: "var(--red)", grosor: 3.5 },
                  ]}
                  marcas={[{ x: lx(t.mejor_n), y: t.mejor_logloss_validacion, texto: `mínimo: ${t.mejor_n.toLocaleString("es-MX")} árboles`, abajo: true }]}
                  lineaV={lx(t.paro_n)}
                />
              </div>
              <div className="label" style={{ fontSize: 20 }}>
                línea vertical = donde se habría detenido el paro temprano (20 árboles sin mejorar)
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 26, paddingTop: 50 }}>
              <Dato valor={t.paro_n.toLocaleString("es-MX")} rotulo="árboles al parar a tiempo" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                <Dato rojo valor={pct(t.prueba_en_paro.error, 2)} rotulo="error de prueba parando a tiempo" />
                <Dato valor={pct(t.prueba_al_final.error, 2)} rotulo={`error de prueba con los ${N_MAX.toLocaleString("es-MX")}`} />
              </div>
              <p style={{ fontSize: 26, color: "var(--text-3)", margin: 0, lineHeight: 1.45 }}>
                {tasa >= 1
                  ? `Pasos tan grandes que su mejor punto llega con solo ${t.mejor_n} árboles, y es el peor de las cuatro tasas. Después la validación sube de golpe.`
                  : tasa >= 0.3
                    ? "El entrenamiento sigue bajando, pero la validación ya va de subida: está memorizando."
                    : tasa >= 0.1
                      ? "Llega a un mínimo tan bueno como el de ν = 0.3, pero después sube mucho más despacio: es más difícil pasarse."
                      : t.mejor_n >= N_MAX - 5
                        ? `Tan lento que con ${N_MAX.toLocaleString("es-MX")} árboles todavía sigue bajando: no alcanzó su mínimo.`
                        : `Tan lento que necesita ${t.mejor_n.toLocaleString("es-MX")} árboles para llegar a su mínimo.`}
              </p>
              <Reveal step={step} at={2} style={{ marginTop: "auto" }}>
                <p className="takeaway" style={{ margin: 0, fontSize: 26 }}>
                  Boosting <em>sí se sobreajusta</em> con demasiados árboles. El mejor punto es casi igual con ν = 0.3, 0.1 o 0.03; lo que cambia es qué tan fácil es pasarse. Por eso: ν chica y parar a tiempo.
                </p>
              </Reveal>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SlideFrame>
  );
}
