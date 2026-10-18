import { useMemo } from "react";
import * as THREE from "three";
import { Scene3D, type Etiqueta, type Vista } from "./Scene3D";

// Nube de rezagos: cada punto es (valor de antier, valor de ayer, valor de hoy) de una serie.
// - De frente solo se ven antier y hoy; en la pared del fondo queda la "sombra" de la nube con su recta:
//   todo el parecido entre antier y hoy, sin importar por dónde llegue (lo que mide la ACF en 2).
// - De canto se mira a lo largo del eje de antier: si el plano de regresión se ve como una línea, antier ya no
//   aporta nada una vez que se conoce ayer (lo que mide la PACF en 2).

const L = 2.3; // medio lado de la caja
const Y0 = 2.3; // altura del valor 0

// La cámara va lejos y con un ángulo de visión angosto: así la perspectiva casi no deforma y, de frente, la nube
// y su sombra se ven una sobre otra.
export const VISTAS_REZAGOS: Record<"sombra" | "canto" | "libre", Vista> = {
  sombra: { camera: [0, Y0 + 0.4, 22], target: [0, Y0, 0] },
  // Desde el lado negativo de "antier": así "ayer" crece hacia la derecha y la pendiente se lee como es.
  canto: { camera: [-22, Y0 + 0.4, 0], target: [0, Y0, 0] },
  libre: { camera: [18, Y0 + 8.5, 22], target: [0, Y0 - 0.3, 0] },
};

const esfera = new THREE.SphereGeometry(0.05, 8, 8);
const matPunto = new THREE.MeshBasicMaterial({ color: "#d6d6dc" });
const matSombra = new THREE.MeshBasicMaterial({ color: "#6e6e77" });

export function LagCloud3D({
  puntos,
  radio,
  sombra,
  plano,
  vista = "sombra",
  nombres = ["antier", "ayer", "hoy"],
  centro = 0,
  recta,
  residuos = false,
}: {
  /** [antier, ayer, hoy] de cada momento. */
  puntos: [number, number, number][];
  /** Distancia del centro al borde de la caja (los ejes van de centro − radio a centro + radio). */
  radio: number;
  /** Valor que queda en medio de la caja (para series que no giran alrededor del 0). */
  centro?: number;
  /** Recta de "hoy contra ayer": hoy ≈ a + b · ayer. Se dibuja en la cara que se ve en la vista "canto". */
  recta?: { a: number; b: number };
  /** Un segmento de cada punto al plano: lo que el plano no explica. */
  residuos?: boolean;
  /** Recta de "hoy contra antier", ignorando ayer: hoy ≈ a + b · antier. */
  sombra?: { a: number; b: number };
  /** Plano de regresión: hoy ≈ c + b1 · ayer + b2 · antier. */
  plano?: { c: number; b1: number; b2: number };
  vista?: keyof typeof VISTAS_REZAGOS;
  nombres?: [string, string, string];
}) {
  const e = (v: number) => ((v - centro) / radio) * L;
  const bajo = centro - radio;
  const alto = centro + radio;
  const etiquetas: Etiqueta[] = [
    { pos: [0, Y0 - L - 0.32, L], contenido: <b>{nombres[0]} →</b> },
    // La de "ayer" va un poco a la izquierda del centro: de canto queda abajo y no choca con el aviso de la rueda.
    { pos: [-L - 0.1, Y0 - L - 0.32, -0.45 * L], contenido: <b>{nombres[1]} →</b> },
    { pos: [-L - 0.1, Y0 + L + 0.28, -L], contenido: <b>{nombres[2]} ↑</b> },
  ];
  const lineaSombra = useMemo(() => {
    if (!sombra) return null;
    const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-L, Y0 + e(sombra.a + sombra.b * bajo), -L), new THREE.Vector3(L, Y0 + e(sombra.a + sombra.b * alto), -L)]);
    return g;
  }, [sombra?.a, sombra?.b, radio, centro]);
  const lineaRecta = useMemo(() => {
    if (!recta) return null;
    // En la cara de x = −L, que es la que mira a la cámara de la vista "canto": ahí "ayer" va a lo ancho.
    return new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-L - 0.02, Y0 + e(recta.a + recta.b * bajo), -L), new THREE.Vector3(-L - 0.02, Y0 + e(recta.a + recta.b * alto), L)]);
  }, [recta?.a, recta?.b, radio, centro]);
  const mallaPlano = useMemo(() => {
    if (!plano) return null;
    const y = (ayer: number, antier: number) => Y0 + e(plano.c + plano.b1 * ayer + plano.b2 * antier);
    const g = new THREE.BufferGeometry();
    // Esquinas: (antier, ayer) en (−, −), (+, −), (+, +), (−, +).
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array([-L, y(bajo, bajo), -L, L, y(bajo, alto), -L, L, y(alto, alto), L, -L, y(alto, bajo), L]), 3),
    );
    g.setIndex([0, 1, 2, 0, 2, 3]);
    return g;
  }, [plano?.c, plano?.b1, plano?.b2, radio, centro]);
  const segmentos = useMemo(() => {
    if (!plano || !residuos) return null;
    const v = puntos.flatMap(([antier, ayer, hoy]) => [
      new THREE.Vector3(e(antier), Y0 + e(hoy), e(ayer)),
      new THREE.Vector3(e(antier), Y0 + e(plano.c + plano.b1 * ayer + plano.b2 * antier), e(ayer)),
    ]);
    return new THREE.BufferGeometry().setFromPoints(v);
  }, [plano?.c, plano?.b1, plano?.b2, residuos, puntos, radio, centro]);

  return (
    <Scene3D camera={VISTAS_REZAGOS.libre.camera} target={VISTAS_REZAGOS.libre.target} fov={16} etiquetas={etiquetas} vista={VISTAS_REZAGOS[vista]}>
      <mesh position={[0, Y0, 0]}>
        <boxGeometry args={[2 * L, 2 * L, 2 * L]} />
        <meshBasicMaterial color="#3a3a41" wireframe transparent opacity={0.35} />
      </mesh>
      {/* Pared del fondo, donde cae la sombra */}
      <mesh position={[0, Y0, -L - 0.01]}>
        <planeGeometry args={[2 * L, 2 * L]} />
        <meshBasicMaterial color="#17171a" side={THREE.DoubleSide} />
      </mesh>
      {puntos.map((p, i) => (
        <mesh key={i} geometry={esfera} material={matPunto} position={[e(p[0]), Y0 + e(p[2]), e(p[1])]} />
      ))}
      {sombra && puntos.map((p, i) => <mesh key={`s${i}`} geometry={esfera} material={matSombra} position={[e(p[0]), Y0 + e(p[2]), -L]} scale={0.7} />)}
      {lineaSombra && (
        <lineSegments geometry={lineaSombra}>
          <lineBasicMaterial color="#bdbdc4" />
        </lineSegments>
      )}
      {mallaPlano && (
        <mesh geometry={mallaPlano}>
          <meshBasicMaterial color="#e5383b" transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      )}
      {segmentos && (
        <lineSegments geometry={segmentos}>
          <lineBasicMaterial color="#f07a7c" transparent opacity={0.7} />
        </lineSegments>
      )}
      {lineaRecta && (
        <lineSegments geometry={lineaRecta}>
          <lineBasicMaterial color="#e5383b" />
        </lineSegments>
      )}
    </Scene3D>
  );
}
