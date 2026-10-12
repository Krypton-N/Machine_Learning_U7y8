import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, type ComponentRef, type ReactNode, type RefObject } from "react";
import * as THREE from "three";

/** Texto anclado a un punto de la escena. Se dibuja en HTML encima del lienzo, con las fuentes del tema. */
export type Etiqueta = { pos: [number, number, number]; contenido: ReactNode };

// Proyecta cada etiqueta a la pantalla en cada cuadro, para que siga al punto cuando se gira la escena.
function Proyector({ etiquetas, nodos }: { etiquetas: Etiqueta[]; nodos: RefObject<(HTMLDivElement | null)[]> }) {
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, size }) => {
    etiquetas.forEach((e, i) => {
      const nodo = nodos.current[i];
      if (!nodo) return;
      v.set(...e.pos).project(camera);
      const x = (v.x * 0.5 + 0.5) * size.width;
      const y = (-v.y * 0.5 + 0.5) * size.height;
      nodo.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      nodo.style.opacity = v.z < 1 ? "1" : "0";
    });
  });
  return null;
}

// Lienzo 3D común a todas las diapositivas: mide con offsetSize (el escenario está escalado con CSS) y tiene
// fondo transparente. Se gira arrastrando y se acerca con la rueda, dentro de un rango para no perder la escena;
// con doble clic regresa a la vista inicial. No se desplaza.
export function Scene3D({
  children,
  camera = [4.4, 4.6, 6.2],
  target = [0, 0.7, 0],
  fov = 38,
  etiquetas = [],
}: {
  children: ReactNode;
  camera?: [number, number, number];
  target?: [number, number, number];
  fov?: number;
  etiquetas?: Etiqueta[];
}) {
  const nodos = useRef<(HTMLDivElement | null)[]>([]);
  const controles = useRef<ComponentRef<typeof OrbitControls>>(null);
  const distancia = Math.hypot(camera[0] - target[0], camera[1] - target[1], camera[2] - target[2]);
  const vistaInicial = () => {
    const c = controles.current;
    if (!c) return;
    c.object.position.set(...camera);
    c.target.set(...target);
    c.update();
  };
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }} onDoubleClick={vistaInicial}>
      <Canvas resize={{ offsetSize: true }} dpr={[1, 2]} camera={{ position: camera, fov }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 8, 3]} intensity={1.1} />
        {children}
        <Proyector etiquetas={etiquetas} nodos={nodos} />
        <OrbitControls ref={controles} enablePan={false} zoomSpeed={0.7} minDistance={distancia * 0.35} maxDistance={distancia * 1.15} target={target} />
      </Canvas>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        {etiquetas.map((e, i) => (
          <div
            key={i}
            ref={(n) => {
              nodos.current[i] = n;
            }}
            className="axis3d"
            style={{ position: "absolute", left: 0, top: 0, opacity: 0 }}
          >
            {e.contenido}
          </div>
        ))}
        <span className="label" style={{ position: "absolute", right: 0, bottom: 0, fontSize: 14, opacity: 0.75 }}>
          rueda: acercar · doble clic: vista inicial
        </span>
      </div>
    </div>
  );
}
