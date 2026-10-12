import { Line } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import type { Etiqueta } from "./Scene3D";

// Superficie z = f(u, v) dentro de una caja fija del mundo 3D: u → eje X, v → eje Z, f → altura.
// Sirve para cualquier función de pérdida de dos parámetros.

const BOX = { x: 3, z: 2, h: 2.6 };

export type SurfaceSpec = {
  f: (u: number, v: number) => number;
  u: [number, number];
  v: [number, number];
  /** Valores de f que van al piso y al techo de la caja. */
  fRange: [number, number];
  /** Curvas de nivel f = c que se dibujan sobre la superficie. */
  levels: number[];
  labels: { u: string; v: string; f: string };
};

/** Convierte (u, v) del espacio de parámetros a coordenadas del mundo, sobre la superficie. */
export function toWorld(s: SurfaceSpec, u: number, v: number, lift = 0.05): [number, number, number] {
  const x = -BOX.x + ((u - s.u[0]) / (s.u[1] - s.u[0])) * 2 * BOX.x;
  const z = -BOX.z + ((v - s.v[0]) / (s.v[1] - s.v[0])) * 2 * BOX.z;
  const y = ((s.f(u, v) - s.fRange[0]) / (s.fRange[1] - s.fRange[0])) * BOX.h;
  return [x, y + lift, z];
}

export const inDomain = (s: SurfaceSpec, u: number, v: number) => u >= s.u[0] && u <= s.u[1] && v >= s.v[0] && v <= s.v[1];

/** Etiquetas de los dos ejes (nombre del parámetro y su rango), para pasarlas a Scene3D. */
export function etiquetasSuperficie(spec: SurfaceSpec): Etiqueta[] {
  const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
  return [
    {
      pos: [0, -0.25, BOX.z + 0.45],
      contenido: (
        <>
          {fmt(spec.u[0])} ← <b>{spec.labels.u}</b> → {fmt(spec.u[1])}
        </>
      ),
    },
    {
      pos: [BOX.x + 0.55, -0.25, 0],
      contenido: (
        <>
          {fmt(spec.v[0])} ← <b>{spec.labels.v}</b> → {fmt(spec.v[1])}
        </>
      ),
    },
  ];
}

const RES_U = 72;
const RES_V = 48;

export function Surface3D({ spec }: { spec: SurfaceSpec }) {
  const { geom, grid, contours } = useMemo(() => build(spec), [spec]);

  return (
    <group>
      <mesh geometry={geom}>
        <meshStandardMaterial color="#2a2a31" roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
      {grid.map((pts, i) => (
        <Line key={`g${i}`} points={pts} color="#55555e" lineWidth={1} />
      ))}
      {contours.length > 0 && <Line points={contours} segments color="#b8b8c0" lineWidth={1.6} />}

    </group>
  );
}

function build(s: SurfaceSpec) {
  // Malla de la superficie
  const geom = new THREE.PlaneGeometry(2 * BOX.x, 2 * BOX.z, RES_U, RES_V);
  geom.rotateX(-Math.PI / 2);
  const p = geom.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const u = s.u[0] + ((p.getX(i) + BOX.x) / (2 * BOX.x)) * (s.u[1] - s.u[0]);
    const v = s.v[0] + ((p.getZ(i) + BOX.z) / (2 * BOX.z)) * (s.v[1] - s.v[0]);
    p.setY(i, toWorld(s, u, v, 0)[1]);
  }
  geom.computeVertexNormals();

  // Retícula: líneas con u constante y con v constante
  const lerp = (a: [number, number], t: number) => a[0] + t * (a[1] - a[0]);
  const grid = [
    ...Array.from({ length: 13 }, (_, k) => k / 12).map((tu) =>
      Array.from({ length: 41 }, (_, i) => toWorld(s, lerp(s.u, tu), lerp(s.v, i / 40), 0.004)),
    ),
    ...Array.from({ length: 9 }, (_, k) => k / 8).map((tv) =>
      Array.from({ length: 61 }, (_, i) => toWorld(s, lerp(s.u, i / 60), lerp(s.v, tv), 0.004)),
    ),
  ];

  return { geom, grid, contours: marchingSquares(s) };
}

// Curvas de nivel por marching squares: en cada celda de la malla se ubica dónde f cruza el nivel c
// (interpolando sobre las aristas) y se une con un segmento. Devuelve pares de puntos.
function marchingSquares(s: SurfaceSpec): [number, number, number][] {
  const NU = 120;
  const NV = 80;
  const us = Array.from({ length: NU + 1 }, (_, i) => s.u[0] + (i / NU) * (s.u[1] - s.u[0]));
  const vs = Array.from({ length: NV + 1 }, (_, j) => s.v[0] + (j / NV) * (s.v[1] - s.v[0]));
  const F = us.map((u) => vs.map((v) => s.f(u, v)));
  const out: [number, number, number][] = [];

  for (const c of s.levels) {
    for (let i = 0; i < NU; i++) {
      for (let j = 0; j < NV; j++) {
        const corners: [number, number, number][] = [
          [us[i], vs[j], F[i][j]],
          [us[i + 1], vs[j], F[i + 1][j]],
          [us[i + 1], vs[j + 1], F[i + 1][j + 1]],
          [us[i], vs[j + 1], F[i][j + 1]],
        ];
        const cross: [number, number][] = [];
        for (let k = 0; k < 4; k++) {
          const [u1, v1, f1] = corners[k];
          const [u2, v2, f2] = corners[(k + 1) % 4];
          if (f1 < c !== f2 < c) {
            const t = (c - f1) / (f2 - f1);
            cross.push([u1 + t * (u2 - u1), v1 + t * (v2 - v1)]);
          }
        }
        for (let k = 0; k + 1 < cross.length; k += 2) {
          out.push(toWorld(s, cross[k][0], cross[k][1], 0.012), toWorld(s, cross[k + 1][0], cross[k + 1][1], 0.012));
        }
      }
    }
  }
  return out;
}
