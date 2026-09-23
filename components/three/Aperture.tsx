'use client';

import { useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer, Float } from '@react-three/drei';
import * as THREE from 'three';

const BLADES = 9;
const HINGE_RADIUS = 1.28;

const BODY = '#1b1917';
const BODY_LIGHT = '#33302c';
const CHROME = '#9d968c';
const ACCENT = '#c2612f';
const BLADE = '#3b322a';

/** Scroll progress through the hero, 0 → 1. Written by HeroCanvas. */
export const scrollState = { p: 0, v: 0 };

/**
 * Aperture blade: origin is the hinge pin, body sweeps inward along -X,
 * so rotating the mesh about its own origin opens and closes the iris.
 */
function bladeGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.quadraticCurveTo(-0.55, 0.02, -0.96, 0.22);
  shape.lineTo(-0.88, 0.62);
  shape.quadraticCurveTo(-0.44, 0.82, 0.05, 1.05);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.03,
    bevelEnabled: true,
    bevelSize: 0.008,
    bevelThickness: 0.006,
    bevelSegments: 2,
    curveSegments: 12,
  });
  geo.translate(0, 0, -0.015);
  return geo;
}

/** Fine milled grip on the focus ring. */
function Knurl({ radius, z, count = 72 }: { radius: number; z: number; count?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      dummy.position.set(Math.cos(a) * radius, Math.sin(a) * radius, z);
      dummy.rotation.set(0, 0, a);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  }, [radius, z, count]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <boxGeometry args={[0.05, 0.022, 0.52]} />
      <meshStandardMaterial color={BODY_LIGHT} metalness={0.85} roughness={0.45} />
    </instancedMesh>
  );
}

function Dust() {
  const pts = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const n = 80;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 9;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);

  useFrame((s) => {
    if (pts.current) pts.current.rotation.y = s.clock.elapsedTime * 0.03;
  });

  return (
    <points ref={pts} geometry={geo}>
      <pointsMaterial size={0.03} color="#e8b98c" transparent opacity={0.45} sizeAttenuation />
    </points>
  );
}

function Lens() {
  const group = useRef<THREE.Group>(null);
  const focusRing = useRef<THREE.Group>(null);
  const blades = useRef<THREE.Mesh[]>([]);
  const geo = useMemo(() => bladeGeometry(), []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const p = scrollState.p;

    if (group.current) {
      // Held near enough to front-on that the glass reads as glass. The
      // previous steep three-quarter angle turned the barrel into a rim
      // and the whole thing looked like a wheel.
      group.current.rotation.x = THREE.MathUtils.lerp(
        group.current.rotation.x,
        -0.1 - state.pointer.y * 0.13 + p * 0.22,
        0.05
      );
      group.current.rotation.y = THREE.MathUtils.lerp(
        group.current.rotation.y,
        0.16 + state.pointer.x * 0.16 - p * 0.3,
        0.05
      );
      // A slight settle rather than a spin: a lens body does not rotate,
      // only its rings do.
      group.current.rotation.z = Math.sin(t * 0.22) * 0.035 + p * 0.28;
      group.current.position.z = p * 2.6;
    }

    // Only the focus ring turns, the way one does when it is racked.
    if (focusRing.current) {
      focusRing.current.rotation.z = -t * 0.13 - p * Math.PI * 0.9;
    }

    const breathe = (Math.sin(t * 0.32) + 1) / 2;
    const swing = 0.34 + breathe * 0.2 + p * 0.78;
    blades.current.forEach((b) => {
      if (b) b.rotation.z = THREE.MathUtils.lerp(b.rotation.z, swing, Math.min(1, delta * 6));
    });
  });

  return (
    <group ref={group} scale={1.02}>
      {/* ---- Barrel: stepped sections receding from the front ---- */}
      <mesh position={[0, 0, -0.55]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.72, 1.72, 0.7, 56, 1, true]} />
        <meshStandardMaterial color="#141210" metalness={0.45} roughness={0.72} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, -1.28]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.56, 1.46, 0.8, 56, 1, true]} />
        <meshStandardMaterial color={BODY} metalness={0.7} roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
      {/* Lens mount */}
      <mesh position={[0, 0, -1.74]}>
        <torusGeometry args={[1.46, 0.07, 12, 56]} />
        <meshStandardMaterial color={CHROME} metalness={1} roughness={0.28} />
      </mesh>

      {/* ---- Front barrel ring, with the signature accent band ---- */}
      <mesh position={[0, 0, -0.16]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.78, 1.74, 0.34, 56, 1, true]} />
        <meshStandardMaterial color={BODY} metalness={0.72} roughness={0.32} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, -0.03]}>
        <torusGeometry args={[1.8, 0.055, 12, 64]} />
        <meshStandardMaterial color={ACCENT} metalness={0.5} roughness={0.35} />
      </mesh>

      {/* Filter thread lip catching the key light */}
      <mesh position={[0, 0, 0.12]}>
        <torusGeometry args={[1.74, 0.05, 14, 64]} />
        <meshStandardMaterial color="#6f6665" metalness={1} roughness={0.34} />
      </mesh>

      {/* ---- Focus ring: the only part that turns ---- */}
      <group ref={focusRing}>
        <Knurl radius={1.8} z={-0.62} />
        <mesh position={[0, 0, -0.62]}>
          <torusGeometry args={[1.86, 0.012, 8, 64]} />
          <meshStandardMaterial color={CHROME} metalness={0.9} roughness={0.4} />
        </mesh>
      </group>

      {/* ---- Iris, set back inside the barrel ---- */}
      <group position={[0, 0, -0.62]}>
        {Array.from({ length: BLADES }).map((_, i) => (
          <group key={i} rotation={[0, 0, (i / BLADES) * Math.PI * 2]}>
            <mesh
              ref={(el) => {
                if (el) blades.current[i] = el;
              }}
              geometry={geo}
              position={[HINGE_RADIUS, 0, i * 0.01]}
              rotation={[0, 0, 0.5]}
            >
              <meshStandardMaterial color={BLADE} metalness={0.78} roughness={0.34} side={THREE.DoubleSide} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Dark cavity behind the iris so the opening reads as depth */}
      <mesh position={[0, 0, -1.2]}>
        <circleGeometry args={[1.5, 48]} />
        <meshBasicMaterial color="#080706" />
      </mesh>

      {/* ---- Front element ----
           A flat coated disc sized to the opening. The previous sphere
           cap was narrower than the barrel, so what read as "glass" was
           actually its bright rim sitting inside the bore. */}
      <mesh position={[0, 0, 0.04]}>
        <circleGeometry args={[1.71, 64]} />
        <meshPhysicalMaterial
          color="#0b1119"
          metalness={0}
          roughness={0.14}
          ior={1.6}
          iridescence={0.65}
          iridescenceIOR={1.9}
          iridescenceThicknessRange={[300, 820]}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transparent
          opacity={0.55}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner coating glint, offset so it never sits dead centre */}
      <mesh position={[-0.42, 0.46, 0.06]} rotation={[0, 0, -0.5]}>
        <planeGeometry args={[1.2, 0.07]} />
        <meshBasicMaterial
          color="#bcd4ff"
          transparent
          opacity={0.06}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

    </group>
  );
}

function Rig() {
  useFrame((state) => {
    const target = 6.6 - scrollState.p * 2.4;
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, target, 0.08);
  });
  return null;
}

export default function Aperture({ reduced = false, paused = false }: { reduced?: boolean; paused?: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6.6], fov: 38 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      frameloop={reduced || paused ? 'demand' : 'always'}
      style={{ pointerEvents: 'none' }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 5, 7]} intensity={2} color="#fff0dc" />
      <directionalLight position={[-6, -2, 3]} intensity={0.8} color="#c2612f" />

      {!reduced && <Rig />}
      {!reduced && <Dust />}

      <Float speed={reduced ? 0 : 0.8} rotationIntensity={reduced ? 0 : 0.06} floatIntensity={reduced ? 0 : 0.28}>
        <Lens />
      </Float>

      {/* Built in-scene: drei's presets fetch an HDRI from a third-party
          CDN and suspend the scene behind that request. The ring form is
          what the front element reflects — the highlight that sells it. */}
      <Environment resolution={128}>
        <Lightformer form="ring" intensity={2.4} position={[0, 0.4, 6]} scale={[5, 5, 1]} color="#ffe9d2" />
        <Lightformer intensity={3} position={[0, 4, -3]} scale={[12, 3, 1]} color="#fff3e2" />
        <Lightformer intensity={2} position={[-5, 1, 2]} scale={[5, 8, 1]} color="#8fb6ff" />
        <Lightformer intensity={1.6} position={[5, -1, 2]} scale={[5, 8, 1]} color="#e08a4f" />
        <Lightformer intensity={0.8} position={[0, -4, 2]} scale={[12, 3, 1]} color="#f5f0e8" />
      </Environment>
    </Canvas>
  );
}
