import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { bounds3d } from "../lib/adult";
import { aEscena } from "./Adult3DScene";

// Región del espacio (edad, educación, horas) donde un ensamble responde "sí".
// El espacio se parte en una rejilla de celdas y se dibuja la cáscara de las celdas con más de la mitad de los votos.

const PASO = [3, 1, 5]; // años de edad, años de educación y horas por celda
export const REJILLA = (() => {
  const ejes = PASO.map((p, f) => {
    const vals: number[] = [];
    for (let v = bounds3d.min[f]; v <= bounds3d.max[f]; v += p) vals.push(v);
    return vals;
  });
  const celdas: { centro: number[]; min: number[]; max: number[]; ijk: [number, number, number] }[] = [];
  ejes[0].forEach((a, i) =>
    ejes[1].forEach((b, j) =>
      ejes[2].forEach((c, k) => {
        const min = [a, b - 0.5, c];
        const max = [Math.min(a + PASO[0], bounds3d.max[0]), b + 0.5, Math.min(c + PASO[2], bounds3d.max[2])];
        // El punto que se evalúa es un valor entero dentro de la celda (los datos son enteros).
        celdas.push({ centro: [Math.min(a + 1, bounds3d.max[0]), b, Math.min(c + 2, bounds3d.max[2])], min, max, ijk: [i, j, k] });
      }),
    ),
  );
  return { celdas, dims: ejes.map((e) => e.length) as [number, number, number] };
})();

const caja = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: "#e5383b", transparent: true, opacity: 0.2, depthWrite: false });

/** `fraccion[c]` = fracción de votos "sí" (o probabilidad promedio) en la celda c de REJILLA. */
export function VoteVolume3D({ fraccion }: { fraccion: Float32Array | number[] | null }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const matrices = useMemo(() => {
    if (!fraccion) return [];
    const [, nj, nk] = REJILLA.dims;
    const si = (i: number, j: number, k: number) => {
      const [ni] = REJILLA.dims;
      if (i < 0 || j < 0 || k < 0 || i >= ni || j >= nj || k >= nk) return false;
      return fraccion[(i * nj + j) * nk + k] > 0.5;
    };
    const out: THREE.Matrix4[] = [];
    REJILLA.celdas.forEach((c, n) => {
      if (!(fraccion[n] > 0.5)) return;
      const [i, j, k] = c.ijk;
      // Solo la cáscara: celdas "sí" con alguna vecina "no".
      if (si(i - 1, j, k) && si(i + 1, j, k) && si(i, j - 1, k) && si(i, j + 1, k) && si(i, j, k - 1) && si(i, j, k + 1)) return;
      const a = aEscena(c.min.map((v, f) => Math.max(v, bounds3d.min[f])));
      const b = aEscena(c.max.map((v, f) => Math.min(v, bounds3d.max[f])));
      out.push(
        new THREE.Matrix4().compose(
          new THREE.Vector3((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2),
          new THREE.Quaternion(),
          new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]),
        ),
      );
    });
    return out;
  }, [fraccion]);

  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    matrices.forEach((mat, i) => m.setMatrixAt(i, mat));
    m.count = matrices.length;
    m.instanceMatrix.needsUpdate = true;
  }, [matrices]);

  return <instancedMesh ref={ref} args={[caja, material, REJILLA.celdas.length]} frustumCulled={false} />;
}
