import { useMemo, type ReactNode } from "react";
import * as THREE from "three";
import { adult3d, bounds3d } from "../lib/adult";
import { mulberry32 } from "../lib/rng";
import type { Box } from "../lib/tree";
import { Scene3D, type Etiqueta } from "./Scene3D";

// Escena 3D de Adult con 3 variables, común a toda la parte 1:
// edad → eje X, años de educación → altura, horas por semana → eje Z.

export const W3 = { x: 3, y: 3, z: 2.2 };

const ejes = [
  (v: number) => -W3.x + ((v - bounds3d.min[0]) / (bounds3d.max[0] - bounds3d.min[0])) * 2 * W3.x,
  (v: number) => ((v - bounds3d.min[1]) / (bounds3d.max[1] - bounds3d.min[1])) * W3.y,
  (v: number) => -W3.z + ((v - bounds3d.min[2]) / (bounds3d.max[2] - bounds3d.min[2])) * 2 * W3.z,
];

/** De (edad, educación, horas) a coordenadas de la escena. */
export const aEscena = (x: number[]): [number, number, number] => [ejes[0](x[0]), ejes[1](x[1]), ejes[2](x[2])];

const E = adult3d.entrenamiento;

/** Las 400 personas que se dibujan. `i` es su índice dentro del conjunto de entrenamiento. */
export const vista = (() => {
  // Las variables son enteras y muchas personas caen en el mismo punto: se desplazan un poco, solo al dibujar.
  const rand = mulberry32(7);
  return adult3d.vista.map((i) => {
    const x = E.X[i];
    const movido = [x[0] + (rand() - 0.5) * 0.8, x[1] + (rand() - 0.5) * 0.5, x[2] + (rand() - 0.5) * 1.6];
    return { i, x, y: E.y[i], pos: aEscena(movido) };
  });
})();

/** Datos de las 400 personas visibles como conjunto de entrenamiento propio (diapositivas 6, 10 y 18). */
export const vistaX = vista.map((p) => p.x);
export const vistaY = vista.map((p) => p.y);

export type EstiloPunto = { escala?: number; tenue?: boolean; oculto?: boolean };
export type Caja = Box & { estilo?: "relleno" | "contorno"; color?: string; opacidad?: number };
export type Plano = { variable: 0 | 1 | 2; valor: number; region?: { min: number[]; max: number[] }; color?: string };

const EJES: Etiqueta[] = [
  {
    pos: [0, -0.3, W3.z + 0.35],
    contenido: (
      <>
        {bounds3d.min[0]} ← <b>edad</b> → {bounds3d.max[0]}
      </>
    ),
  },
  {
    pos: [-W3.x - 0.2, W3.y + 0.25, W3.z],
    contenido: (
      <>
        <b>años de educación</b> ↑ {bounds3d.max[1]}
      </>
    ),
  },
  {
    pos: [W3.x + 0.5, -0.3, 0],
    contenido: (
      <>
        {bounds3d.min[2]} ← <b>horas / semana</b> → {bounds3d.max[2]}
      </>
    ),
  },
];

const esfera = new THREE.SphereGeometry(0.06, 10, 10);
const materiales = {
  pos: new THREE.MeshBasicMaterial({ color: "#ff5a52" }),
  neg: new THREE.MeshBasicMaterial({ color: "#8e8e96" }),
  posTenue: new THREE.MeshBasicMaterial({ color: "#ff5a52", transparent: true, opacity: 0.22 }),
  negTenue: new THREE.MeshBasicMaterial({ color: "#8e8e96", transparent: true, opacity: 0.18 }),
};

function CajaMalla({ caja }: { caja: Caja }) {
  const a = aEscena(caja.min);
  const c = aEscena(caja.max);
  const size: [number, number, number] = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  const centro: [number, number, number] = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];
  const color = caja.color ?? "#e5383b";
  const bordes = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(...size)), [size[0], size[1], size[2]]);
  return (
    <group position={centro}>
      {caja.estilo !== "contorno" && (
        <mesh>
          <boxGeometry args={size} />
          <meshBasicMaterial color={color} transparent opacity={caja.opacidad ?? 0.13} depthWrite={false} />
        </mesh>
      )}
      <lineSegments geometry={bordes}>
        <lineBasicMaterial color={color} transparent opacity={caja.estilo === "contorno" ? 0.7 : 0.55} />
      </lineSegments>
    </group>
  );
}

// Un corte del árbol: el plano "variable = valor", recortado a la región donde aplica.
function PlanoMalla({ plano }: { plano: Plano }) {
  const region = plano.region ?? bounds3d;
  const min = [...region.min];
  const max = [...region.max];
  min[plano.variable] = plano.valor;
  max[plano.variable] = plano.valor;
  const a = aEscena(min);
  const c = aEscena(max);
  const color = plano.color ?? "#e5383b";
  // Un prisma de grosor casi nulo evita calcular la orientación del plano a mano.
  const size: [number, number, number] = [Math.max(c[0] - a[0], 0.012), Math.max(c[1] - a[1], 0.012), Math.max(c[2] - a[2], 0.012)];
  const centro: [number, number, number] = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];
  const bordes = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(...size)), [size[0], size[1], size[2]]);
  return (
    <group position={centro}>
      <mesh>
        <boxGeometry args={size} />
        <meshBasicMaterial color={color} transparent opacity={0.22} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <lineSegments geometry={bordes}>
        <lineBasicMaterial color={color} transparent opacity={0.9} />
      </lineSegments>
    </group>
  );
}

export function Adult3DScene({
  estilo,
  cajas = [],
  planos = [],
  camera = [6.3, 4.5, 6.9],
  children,
}: {
  /** Estilo de cada una de las 400 personas (índice dentro de `vista`). */
  estilo?: (k: number) => EstiloPunto | undefined;
  cajas?: Caja[];
  planos?: Plano[];
  camera?: [number, number, number];
  children?: ReactNode;
}) {
  return (
    <Scene3D camera={camera} target={[0, 1.2, 0]} fov={40} etiquetas={EJES}>
      {/* Caja de referencia */}
      <mesh position={[0, W3.y / 2, 0]}>
        <boxGeometry args={[2 * W3.x, W3.y, 2 * W3.z]} />
        <meshBasicMaterial color="#3a3a41" wireframe transparent opacity={0.35} />
      </mesh>
      {vista.map((p, k) => {
        const e = estilo?.(k);
        if (e?.oculto) return null;
        const mat = e?.tenue ? (p.y ? materiales.posTenue : materiales.negTenue) : p.y ? materiales.pos : materiales.neg;
        return <mesh key={k} geometry={esfera} material={mat} position={p.pos} scale={e?.escala ?? 1} />;
      })}
      {cajas.map((c, i) => (
        <CajaMalla key={i} caja={c} />
      ))}
      {planos.map((p, i) => (
        <PlanoMalla key={i} plano={p} />
      ))}
      {children}
    </Scene3D>
  );
}

/** Leyenda de colores de las personas, para poner sobre la escena. */
export function LeyendaAdult() {
  return (
    <span className="label" style={{ display: "flex", gap: 20 }}>
      <span style={{ color: "var(--red-2)" }}>● gana &gt; 50K</span>
      <span>● no</span>
    </span>
  );
}
