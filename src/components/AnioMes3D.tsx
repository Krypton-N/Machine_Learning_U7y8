import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { Scene3D, type Etiqueta, type Vista } from "./Scene3D";

// Una serie mensual vista como año × mes: los meses van de izquierda a derecha, los años hacia el fondo y la
// altura es el valor. De frente se ve la forma del año (estacionalidad); de lado, el cambio entre años (tendencia).

const LX = 4.8; // ancho que ocupan los 12 meses
const LZ = 4.8; // fondo que ocupan los años
const ALTO = 2.5; // altura del valor más grande

/** Vistas con nombre: de frente (por meses), de lado (por años) y en diagonal. */
export const VISTAS_ANIO_MES: Record<"meses" | "anios" | "libre", Vista> = {
  meses: { camera: [0, 2.3, 7.8], target: [0, 0.95, 0] },
  anios: { camera: [7.8, 2.3, 0], target: [0, 0.95, 0] },
  libre: { camera: [6.4, 4.7, 7.4], target: [0, 0.4, 0] },
};

type Matriz = (number | null)[][];

function Barras3D({ matriz, rango, resaltar }: { matriz: Matriz; rango: [number, number]; resaltar?: (fila: number, col: number) => boolean }) {
  const filas = matriz.length;
  const cols = matriz[0].length;
  const dx = LX / cols;
  const dz = LZ / filas;
  return (
    <>
      {matriz.flatMap((fila, f) =>
        fila.map((v, c) => {
          if (v === null) return null;
          const h = Math.max(0.01, ((v - rango[0]) / (rango[1] - rango[0])) * ALTO);
          const rojo = resaltar?.(f, c);
          return (
            <mesh key={`${f}-${c}`} position={[-LX / 2 + (c + 0.5) * dx, h / 2, LZ / 2 - (f + 0.5) * dz]}>
              <boxGeometry args={[dx * 0.72, h, dz * 0.72]} />
              <meshStandardMaterial color={rojo ? "#e5383b" : "#8e8e96"} roughness={0.85} />
            </mesh>
          );
        }),
      )}
    </>
  );
}

// Superficie con un vértice por dato (sin interpolar). Al cambiar de matriz, las alturas viajan a su nuevo valor.
// Las celdas sin dato no se dibujan: un hueco no es un cero.
function Superficie({ matriz, rango }: { matriz: Matriz; rango: [number, number] }) {
  const filas = matriz.length;
  const cols = matriz[0].length;
  const alturaDe = (v: number) => ((v - rango[0]) / (rango[1] - rango[0])) * ALTO;
  const { posiciones, malla, porFila, porColumna } = useMemo(() => {
    const pos = new Float32Array(filas * cols * 3);
    for (let f = 0; f < filas; f++)
      for (let c = 0; c < cols; c++) {
        pos[(f * cols + c) * 3] = -LX / 2 + (c / (cols - 1)) * LX;
        pos[(f * cols + c) * 3 + 2] = LZ / 2 - (f / (filas - 1)) * LZ;
      }
    const atributo = new THREE.BufferAttribute(pos, 3);
    const hacer = () => {
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", atributo);
      return g;
    };
    return { posiciones: atributo, malla: hacer(), porFila: hacer(), porColumna: hacer() };
  }, [filas, cols]);
  const objetivo = useRef(new Float32Array(filas * cols));
  const moviendo = useRef(true);

  useEffect(() => {
    const ok = (f: number, c: number) => matriz[f][c] !== null;
    const tri: number[] = [];
    const lf: number[] = [];
    const lc: number[] = [];
    for (let f = 0; f < filas; f++)
      for (let c = 0; c < cols; c++) {
        const i = f * cols + c;
        objetivo.current[i] = ok(f, c) ? alturaDe(matriz[f][c] as number) : alturaDe(Math.max(rango[0], Math.min(rango[1], 0)));
        if (c + 1 < cols && ok(f, c) && ok(f, c + 1)) lf.push(i, i + 1);
        if (f + 1 < filas && ok(f, c) && ok(f + 1, c)) lc.push(i, i + cols);
        if (c + 1 < cols && f + 1 < filas && ok(f, c) && ok(f, c + 1) && ok(f + 1, c) && ok(f + 1, c + 1)) tri.push(i, i + 1, i + cols, i + 1, i + cols + 1, i + cols);
      }
    malla.setIndex(tri);
    porFila.setIndex(lf);
    porColumna.setIndex(lc);
    moviendo.current = true;
    // `alturaDe` depende solo de `rango`.
  }, [matriz, rango[0], rango[1]]);

  useFrame((_, dt) => {
    if (!moviendo.current) return;
    const p = posiciones.array as Float32Array;
    const k = Math.min(1, dt * 5);
    let falta = 0;
    for (let i = 0; i < objetivo.current.length; i++) {
      const d = objetivo.current[i] - p[i * 3 + 1];
      p[i * 3 + 1] += d * k;
      falta = Math.max(falta, Math.abs(d));
    }
    posiciones.needsUpdate = true;
    if (falta < 1e-4) moviendo.current = false;
  });

  return (
    <>
      <mesh geometry={malla}>
        <meshBasicMaterial color="#8e8e96" transparent opacity={0.16} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <lineSegments geometry={porFila}>
        <lineBasicMaterial color="#d6d6dc" />
      </lineSegments>
      <lineSegments geometry={porColumna}>
        <lineBasicMaterial color="#6e6e77" />
      </lineSegments>
    </>
  );
}

// Cintas: una por año, con su perfil de 12 meses arriba y una cortina translúcida hasta el piso (o hasta el 0).
// De frente se enciman los años; de lado se ve cuánto sube cada uno. Las alturas viajan al cambiar de matriz.
function Cintas({ matriz, rango }: { matriz: Matriz; rango: [number, number] }) {
  const filas = matriz.length;
  const cols = matriz[0].length;
  const alturaDe = (v: number) => ((v - rango[0]) / (rango[1] - rango[0])) * ALTO;
  const base = alturaDe(Math.max(rango[0], Math.min(rango[1], 0)));
  // Dos vértices por dato: el de arriba (se mueve) y el de abajo (fijo en la base).
  const { posiciones, cortina, perfil } = useMemo(() => {
    const pos = new Float32Array(filas * cols * 2 * 3);
    for (let f = 0; f < filas; f++)
      for (let c = 0; c < cols; c++) {
        const i = (f * cols + c) * 2;
        for (const j of [i, i + 1]) {
          pos[j * 3] = -LX / 2 + (c / (cols - 1)) * LX;
          pos[j * 3 + 2] = LZ / 2 - (f / (filas - 1)) * LZ;
        }
      }
    const atributo = new THREE.BufferAttribute(pos, 3);
    const hacer = () => {
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", atributo);
      return g;
    };
    return { posiciones: atributo, cortina: hacer(), perfil: hacer() };
  }, [filas, cols]);
  const objetivo = useRef(new Float32Array(filas * cols * 2));
  const moviendo = useRef(true);

  useEffect(() => {
    const ok = (f: number, c: number) => matriz[f][c] !== null;
    const tri: number[] = [];
    const lin: number[] = [];
    for (let f = 0; f < filas; f++)
      for (let c = 0; c < cols; c++) {
        const i = (f * cols + c) * 2;
        objetivo.current[i] = ok(f, c) ? alturaDe(matriz[f][c] as number) : base;
        objetivo.current[i + 1] = base;
        if (c + 1 < cols && ok(f, c) && ok(f, c + 1)) {
          tri.push(i, i + 2, i + 3, i, i + 3, i + 1);
          lin.push(i, i + 2);
        }
      }
    cortina.setIndex(tri);
    perfil.setIndex(lin);
    moviendo.current = true;
    // `alturaDe` y `base` dependen solo de `rango`.
  }, [matriz, rango[0], rango[1]]);

  useFrame((_, dt) => {
    if (!moviendo.current) return;
    const p = posiciones.array as Float32Array;
    const k = Math.min(1, dt * 5);
    let falta = 0;
    for (let i = 0; i < objetivo.current.length; i++) {
      const d = objetivo.current[i] - p[i * 3 + 1];
      p[i * 3 + 1] += d * k;
      falta = Math.max(falta, Math.abs(d));
    }
    posiciones.needsUpdate = true;
    if (falta < 1e-4) moviendo.current = false;
  });

  return (
    <>
      <mesh geometry={cortina}>
        <meshBasicMaterial color="#8e8e96" transparent opacity={0.13} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <lineSegments geometry={perfil}>
        <lineBasicMaterial color="#e2e2e8" />
      </lineSegments>
    </>
  );
}

/** Un tubo delgado entre dos puntos, para que las flechas se vean más que una línea de un pixel. */
function Tubo({ a, b, radio = 0.025, color = "#e5383b" }: { a: THREE.Vector3; b: THREE.Vector3; radio?: number; color?: string }) {
  const medio = a.clone().add(b).multiplyScalar(0.5);
  const dir = b.clone().sub(a);
  const giro = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  return (
    <mesh position={medio} quaternion={giro}>
      <cylinderGeometry args={[radio, radio, dir.length(), 10]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

export function AnioMes3D({
  matriz,
  forma,
  rango,
  resaltar,
  planoCero = false,
  etiquetasFilas,
  etiquetasCols,
  cadaFilas = 2,
  rotuloAltura,
  vista,
  flechas,
}: {
  /** matriz[año][mes]; `null` donde no hay dato. */
  matriz: Matriz;
  forma: "barras" | "superficie" | "cintas";
  /** Valores que corresponden al piso y a la altura máxima. */
  rango: [number, number];
  /** Solo en barras: cuáles se pintan de rojo. */
  resaltar?: (fila: number, col: number) => boolean;
  /** Dibuja el plano del valor 0 (para las diferencias). */
  planoCero?: boolean;
  etiquetasFilas: string[];
  etiquetasCols: string[];
  cadaFilas?: number;
  rotuloAltura: ReactNode;
  vista?: Vista;
  /** Una celda [año, mes] con dos flechas: al mes anterior (rezago 1) y al mismo mes del año anterior (rezago 12). */
  flechas?: { fila: number; col: number };
}) {
  const filas = matriz.length;
  const cols = matriz[0].length;
  const enBarras = forma === "barras";
  // En barras cada dato ocupa una casilla; en superficie, un cruce de la rejilla.
  const xDe = (c: number) => (enBarras ? -LX / 2 + ((c + 0.5) * LX) / cols : -LX / 2 + (c / (cols - 1)) * LX);
  const zDe = (f: number) => (enBarras ? LZ / 2 - ((f + 0.5) * LZ) / filas : LZ / 2 - (f / (filas - 1)) * LZ);
  const etiquetas: Etiqueta[] = [
    ...etiquetasCols.map((t, c): Etiqueta => ({ pos: [xDe(c), -0.12, LZ / 2 + 0.38], contenido: t })),
    ...etiquetasFilas.flatMap((t, f): Etiqueta[] => (f % cadaFilas === 0 ? [{ pos: [LX / 2 + 0.42, -0.12, zDe(f)], contenido: t }] : [])),
    { pos: [-LX / 2 - 0.25, ALTO + 0.28, -LZ / 2], contenido: <b>{rotuloAltura}</b> },
  ];
  const y0 = ((0 - rango[0]) / (rango[1] - rango[0])) * ALTO;
  return (
    <Scene3D camera={VISTAS_ANIO_MES.libre.camera} target={VISTAS_ANIO_MES.libre.target} fov={36} etiquetas={etiquetas} vista={vista}>
      {/* Piso y marco de referencia */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[LX + 0.3, LZ + 0.3]} />
        <meshBasicMaterial color="#17171a" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, ALTO / 2, 0]}>
        <boxGeometry args={[LX + 0.3, ALTO, LZ + 0.3]} />
        <meshBasicMaterial color="#3a3a41" wireframe transparent opacity={0.3} />
      </mesh>
      {planoCero && (
        <mesh position={[0, y0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[LX + 0.3, LZ + 0.3]} />
          <meshBasicMaterial color="#e5383b" transparent opacity={0.13} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      )}
      {enBarras ? <Barras3D matriz={matriz} rango={rango} resaltar={resaltar} /> : forma === "cintas" ? <Cintas matriz={matriz} rango={rango} /> : <Superficie matriz={matriz} rango={rango} />}
      {flechas && <Flechas matriz={matriz} rango={rango} {...flechas} xDe={xDe} zDe={zDe} />}
    </Scene3D>
  );
}

// Las dos memorias de un SARIMA sobre una celda: el mes anterior (a lo ancho) y el mismo mes un año antes (hacia el
// frente). Si alguna de las celdas no tiene dato, esa flecha no se dibuja.
function Flechas({ matriz, rango, fila, col, xDe, zDe }: { matriz: Matriz; rango: [number, number]; fila: number; col: number; xDe: (c: number) => number; zDe: (f: number) => number }) {
  const h = (v: number) => ((v - rango[0]) / (rango[1] - rango[0])) * ALTO;
  const punto = (f: number, c: number) => (matriz[f]?.[c] == null ? null : new THREE.Vector3(xDe(c), h(matriz[f][c] as number), zDe(f)));
  const aqui = punto(fila, col);
  if (!aqui) return null;
  // Gris: el mes anterior (la parte de meses). Rojo: el mismo mes del año anterior (la parte de años).
  const otros = [
    { p: punto(fila, col - 1), color: "#bdbdc4" },
    { p: punto(fila - 1, col), color: "#e5383b" },
  ].filter((o): o is { p: THREE.Vector3; color: string } => o.p !== null);
  return (
    <>
      <mesh position={aqui}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#f2f2f5" />
      </mesh>
      {otros.map((o, i) => (
        <group key={i}>
          <Tubo a={aqui} b={o.p} color={o.color} />
          <mesh position={o.p}>
            <sphereGeometry args={[0.055, 12, 12]} />
            <meshBasicMaterial color={o.color} />
          </mesh>
        </group>
      ))}
    </>
  );
}
