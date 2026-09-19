'use client';

import { useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer, Float } from '@react-three/drei';
import * as THREE from 'three';

const BLADES = 9;
const HINGE_RADIUS = 1.5;
const CLAY = '#c2612f';
const BRONZE = '#6f4526';
const STEEL = '#2a211b';

/** Scroll progress through the hero, 0 → 1. Written by HeroCanvas. */
export const scrollState = { p: 0, v: 0 };

/**
 * An aperture blade with a curved inner edge. The profile's origin is
 * the hinge pin and the body sweeps inward along -X, so rotating the
 * mesh about its own origin opens and closes the iris.
 */
function bladeGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  // Curved leading edge — a straight one reads as a paper cut-out.
  shape.quadraticCurveTo(-0.65, 0.02, -1.12, 0.26);
  shape.lineTo(-1.02, 0.72);
  shape.quadraticCurveTo(-0.5, 0.95, 0.06, 1.2);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.035,
    bevelEnabled: true,
    bevelSize: 0.01,
    bevelThickness: 0.008,
    bevelSegments: 3,
    curveSegments: 14,
  });
  geo.translate(0, 0, -0.018);
  return geo;
}

/** Knurled grip band — the detail that makes a barrel read as machined. */
function Knurl({ radius, z, count = 64 }: { radius: number; z: number; count?: number }) {
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
      <boxGeometry args={[0.07, 0.035, 0.46]} />
      <meshStandardMaterial color={BRONZE} metalness={0.95} roughness={0.32} />
    </instancedMesh>
  );
}

function Dust() {
  const pts = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const n = 90;
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

  useFrame((state) => {
    if (!pts.current) return;
    pts.current.rotation.y = state.clock.elapsedTime * 0.03;
    pts.current.rotation.x = state.clock.elapsedTime * 0.014;
  });

  return (
    <points ref={pts} geometry={geo}>
      <pointsMaterial size={0.032} color="#e8b98c" transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

/** Engraved distance-scale ticks around the focus ring. */
function Ticks({ radius, z, count = 48 }: { radius: number; z: number; count?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      // Every fourth tick is a long one, like a real distance scale.
      const long = i % 4 === 0;
      dummy.position.set(Math.cos(a) * radius, Math.sin(a) * radius, z);
      dummy.rotation.set(0, 0, a);
      dummy.scale.set(long ? 1.9 : 1, 1, 1);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  }, [radius, z, count]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <boxGeometry args={[0.1, 0.018, 0.02]} />
      <meshStandardMaterial color="#f2dcc2" metalness={0.5} roughness={0.4} />
    </instancedMesh>
  );
}

/** Additive streaks catching the key light across the front element. */
function Flare() {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.z = t * 0.16;
    const pulse = 0.5 + Math.sin(t * 0.8) * 0.25;
    ref.current.scale.setScalar(0.9 + pulse * 0.3);
  });

  return (
    <group ref={ref} position={[0, 0, 0.55]}>
      {[0, Math.PI / 2, Math.PI / 4, -Math.PI / 4].map((rot, i) => (
        <mesh key={i} rotation={[0, 0, rot]}>
          <planeGeometry args={[i < 2 ? 3.8 : 2.4, 0.04]} />
          <meshBasicMaterial
            color="#ffd9a3"
            transparent
            opacity={i < 2 ? 0.11 : 0.06}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function Lens() {
  const group = useRef<THREE.Group>(null);
  const focusRing = useRef<THREE.Group>(null);
  const blades = useRef<THREE.Mesh[]>([]);
  const glow = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => bladeGeometry(), []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const p = scrollState.p;

    if (group.current) {
      // Held at a three-quarter angle so the barrel's depth is visible —
      // dead-on it flattens into a disc no matter how detailed it is.
      group.current.rotation.x = THREE.MathUtils.lerp(
        group.current.rotation.x,
        -0.42 - state.pointer.y * 0.16 + p * 0.34,
        0.05
      );
      group.current.rotation.y = THREE.MathUtils.lerp(
        group.current.rotation.y,
        0.58 + state.pointer.x * 0.18 - p * 0.6,
        0.05
      );
      group.current.rotation.z = t * 0.045 + p * Math.PI * 0.4;
      group.current.position.z = p * 3;
    }

    const breathe = (Math.sin(t * 0.3) + 1) / 2;
    const swing = 0.3 + breathe * 0.2 + p * 0.8;
    blades.current.forEach((b) => {
      if (b) b.rotation.z = THREE.MathUtils.lerp(b.rotation.z, swing, Math.min(1, delta * 6));
    });

    if (focusRing.current) {
      // Counter-rotating against the barrel, plus a hard pull on scroll.
      focusRing.current.rotation.z = -t * 0.22 - p * Math.PI * 1.6;
    }

    if (glow.current) {
      const s = 0.85 + breathe * 0.2 + p * 0.9;
      glow.current.scale.setScalar(s);
    }
  });

  return (
    <group ref={group} scale={0.86}>
      {/* --- Barrel: an open cylinder running back in Z gives the whole
              object its depth and catches a long specular highlight. --- */}
      <mesh position={[0, 0, -0.95]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.98, 2.12, 1.9, 48, 1, true]} />
        <meshStandardMaterial color={STEEL} metalness={0.92} roughness={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* Front bezel */}
      <mesh position={[0, 0, 0.02]}>
        <torusGeometry args={[2.0, 0.085, 14, 64]} />
        <meshStandardMaterial color={BRONZE} metalness={0.96} roughness={0.18} />
      </mesh>

      {/* Engraved trim rings */}
      <mesh position={[0, 0, -0.12]}>
        <torusGeometry args={[2.16, 0.02, 8, 64]} />
        <meshStandardMaterial color={CLAY} metalness={0.9} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0, -1.85]}>
        <torusGeometry args={[2.1, 0.05, 10, 64]} />
        <meshStandardMaterial color={BRONZE} metalness={0.95} roughness={0.28} />
      </mesh>

      {/* Knurled zoom band, fixed to the barrel */}
      <Knurl radius={2.11} z={-1.34} />

      {/* Focus ring: turns against the barrel on its own axis, and the
          scroll drives it further — the detail that makes the lens read
          as being operated rather than just spun. */}
      <group ref={focusRing}>
        <Knurl radius={2.09} z={-0.62} />
        <Ticks radius={2.2} z={-0.62} />
        <mesh position={[0, 0, -0.62]}>
          <torusGeometry args={[2.17, 0.014, 8, 64]} />
          <meshStandardMaterial color="#f2dcc2" metalness={0.5} roughness={0.45} />
        </mesh>
      </group>

      {/* --- Aperture blades --- */}
      <group position={[0, 0, -0.1]}>
        {Array.from({ length: BLADES }).map((_, i) => (
          <group key={i} rotation={[0, 0, (i / BLADES) * Math.PI * 2]}>
            <mesh
              ref={(el) => {
                if (el) blades.current[i] = el;
              }}
              geometry={geo}
              position={[HINGE_RADIUS, 0, i * 0.012]}
              rotation={[0, 0, 0.5]}
            >
              <meshStandardMaterial
                color="#b4501d"
                metalness={0.45}
                roughness={0.3}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* --- Front glass: a shallow dome bends the reflection instead of
              mirroring it flat. The cap is built around +Y, so it has to
              be rotated to face the camera down +Z. --- */}
      <mesh position={[0, 0, 0.12]} rotation={[-Math.PI / 2, 0, 0]}>
        <sphereGeometry args={[3.4, 40, 16, 0, Math.PI * 2, 0, 0.36]} />
        <meshPhysicalMaterial
          color="#2a1a10"
          metalness={0.35}
          roughness={0.06}
          iridescence={1}
          iridescenceIOR={2.2}
          iridescenceThicknessRange={[200, 900]}
          clearcoat={1}
          clearcoatRoughness={0.04}
          transparent
          opacity={0.16}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Light coming up through the barrel */}
      <mesh ref={glow} position={[0, 0, -1.45]}>
        <circleGeometry args={[0.9, 48]} />
        <meshBasicMaterial
          color="#ffd9a3"
          transparent
          opacity={0.95}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <pointLight position={[0, 0, -1.1]} intensity={14} distance={8} color="#ffb877" />
    </group>
  );
}

function Rig() {
  useFrame((state) => {
    const target = 7.2 - scrollState.p * 2.8;
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, target, 0.08);
  });
  return null;
}

export default function Aperture({ reduced = false, paused = false }: { reduced?: boolean; paused?: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 7.2], fov: 38 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      frameloop={reduced || paused ? 'demand' : 'always'}
      style={{ pointerEvents: 'none' }}
    >
      <ambientLight intensity={0.42} />
      <directionalLight position={[5, 6, 7]} intensity={1.9} color="#ffe2bd" />
      <directionalLight position={[-6, -2, 4]} intensity={1.1} color="#c2612f" />

      {!reduced && <Rig />}
      {!reduced && <Dust />}

      <Float speed={reduced ? 0 : 0.9} rotationIntensity={reduced ? 0 : 0.08} floatIntensity={reduced ? 0 : 0.3}>
        <Lens />
        {!reduced && <Flare />}
      </Float>

      {/* Built in-scene: drei's presets fetch an HDRI from a third-party
          CDN and suspend the scene behind that request. */}
      <Environment resolution={96}>
        <Lightformer intensity={4} position={[0, 4, -3]} scale={[12, 3, 1]} color="#fff3e2" />
        <Lightformer intensity={2.2} position={[-5, 1, -2]} scale={[7, 7, 1]} color="#e08a4f" />
        <Lightformer intensity={1.4} position={[5, -1, -2]} scale={[7, 7, 1]} color="#c2612f" />
        <Lightformer intensity={2.6} form="ring" position={[0, 0, 5]} scale={[5, 5, 1]} color="#fff8ef" />
        <Lightformer intensity={0.9} position={[0, -4, 2]} scale={[12, 3, 1]} color="#f5f0e8" />
      </Environment>
    </Canvas>
  );
}
