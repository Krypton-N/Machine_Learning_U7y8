import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type ComponentRef, type ReactNode, type RefObject } from "react";
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

/** Desde dónde se mira la escena y hacia qué punto. */
export type Vista = { camera: [number, number, number]; target?: [number, number, number] };

// Lleva la cámara a una vista con un giro suave alrededor del punto que se mira. Después se puede seguir girando a mano.
function IrAVista({ vista, target, controles }: { vista?: Vista; target: [number, number, number]; controles: RefObject<ComponentRef<typeof OrbitControls> | null> }) {
  const camera = useThree((s) => s.camera);
  const viaje = useRef<{ desde: THREE.Vector3; hacia: THREE.Vector3; mDesde: THREE.Vector3; mHacia: THREE.Vector3; t: number } | null>(null);
  const clave = vista ? [...vista.camera, ...(vista.target ?? target)].join() : "";
  useEffect(() => {
    if (!vista) return;
    const mira = controles.current?.target.clone() ?? new THREE.Vector3(...target);
    const mHacia = new THREE.Vector3(...(vista.target ?? target));
    viaje.current = { desde: camera.position.clone().sub(mira), hacia: new THREE.Vector3(...vista.camera).sub(mHacia), mDesde: mira, mHacia, t: 0 };
  }, [clave]);
  useFrame((_, dt) => {
    const v = viaje.current;
    if (!v) return;
    v.t = Math.min(1, v.t + dt / 1.2);
    const k = v.t < 0.5 ? 2 * v.t * v.t : 1 - (-2 * v.t + 2) ** 2 / 2;
    const mira = v.mDesde.clone().lerp(v.mHacia, k);
    // Se interpola la dirección y, aparte, la distancia: así la cámara rodea la escena en vez de atravesarla.
    const brazo = v.desde.clone().lerp(v.hacia, k).setLength(v.desde.length() + (v.hacia.length() - v.desde.length()) * k);
    camera.position.copy(mira).add(brazo);
    const c = controles.current;
    if (c) {
      c.target.copy(mira);
      c.update();
    } else camera.lookAt(mira);
    if (v.t >= 1) viaje.current = null;
  });
  return null;
}

// Lienzo 3D común a todas las diapositivas: mide con offsetSize (el escenario está escalado con CSS) y tiene
// fondo transparente. Se gira arrastrando y se acerca con la rueda, dentro de un rango para no perder la escena;
// con doble clic regresa a la vista inicial. No se desplaza. Con `vista`, la cámara viaja a una posición dada.
export function Scene3D({
  children,
  camera = [4.4, 4.6, 6.2],
  target = [0, 0.7, 0],
  fov = 38,
  etiquetas = [],
  vista,
}: {
  children: ReactNode;
  camera?: [number, number, number];
  target?: [number, number, number];
  fov?: number;
  etiquetas?: Etiqueta[];
  /** Al cambiar, la cámara se desliza a esta vista (debe quedar a una distancia parecida a la inicial). */
  vista?: Vista;
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
        <IrAVista vista={vista} target={target} controles={controles} />
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
        <span className="label pista3d">
          rueda: acercar · doble clic: vista inicial
        </span>
      </div>
    </div>
  );
}
