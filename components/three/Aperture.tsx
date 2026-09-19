'use client';

import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer, Float } from '@react-three/drei';
import * as THREE from 'three';

const BLADES = 8;
const HINGE_RADIUS = 1.62;
const CLAY = '#c2612f';
const BRONZE = '#7d5130';

/** Scroll progress through the hero, 0 → 1. Written by HeroCanvas. */
export const scrollState = { p: 0, v: 0 };

/**
 * One aperture blade. The shape's origin is the hinge pin and the body
 * extends inward along -X, so rotating the mesh about its own origin
 * opens and closes the iris the way a real one works.
 */
function bladeGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(-1.08, 0.2);
  shape.lineTo(-0.98, 0.78);
  shape.lineTo(0.06, 1.34);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.06,
    bevelEnabled: true,
    bevelSize: 0.012,
    bevelThickness: 0.012,
    bevelSegments: 2,
  });
  geo.translate(0, 0, -0.03);
  return geo;
}

/** Slow drifting dust, lit from the key light — gives the lens air around it. */
function Dust() {
  const pts = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const n = 140;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 11;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);

  useFrame((state) => {
    if (pts.current) {
      pts.current.rotation.y = state.clock.elapsedTime * 0.03;
      pts.current.rotation.x = state.clock.elapsedTime * 0.014;
    }
  });

  return (
    <points ref={pts} geometry={geo}>
      <pointsMaterial size={0.035} color="#e0a878" transparent opacity={0.55} sizeAttenuation />
    </points>
  );
}

function Iris() {
  const group = useRef<THREE.Group>(null);
  const blades = useRef<THREE.Mesh[]>([]);
  const geo = useMemo(() => bladeGeometry(), []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const p = scrollState.p;

    if (group.current) {
      // Scroll drives a quarter turn and a push toward the viewer, so the
      // lens reads as a mechanism being operated rather than a spinning prop.
      group.current.rotation.z = t * 0.06 + p * Math.PI * 0.7;
      group.current.position.z = p * 3.4;
      group.current.rotation.x = THREE.MathUtils.lerp(
        group.current.rotation.x,
        -state.pointer.y * 0.22 + p * 0.25,
        0.05
      );
      group.current.rotation.y = THREE.MathUtils.lerp(
        group.current.rotation.y,
        state.pointer.x * 0.22,
        0.05
      );
      const s = 0.94 + p * 0.5;
      group.current.scale.setScalar(THREE.MathUtils.lerp(group.current.scale.x, s, 0.1));
    }

    // Idle breathing, overridden by scroll: the iris opens as you descend.
    const breathe = (Math.sin(t * 0.3) + 1) / 2;
    const swing = 0.28 + breathe * 0.22 + p * 0.85;
    blades.current.forEach((b, i) => {
      if (!b) return;
      b.rotation.z = THREE.MathUtils.lerp(b.rotation.z, swing, Math.min(1, delta * 6));
      b.position.z = i * 0.014;
    });
  });

  return (
    <group ref={group} scale={0.94}>
      {Array.from({ length: BLADES }).map((_, i) => (
        <group key={i} rotation={[0, 0, (i / BLADES) * Math.PI * 2]}>
          <mesh
            ref={(el) => {
              if (el) blades.current[i] = el;
            }}
            geometry={geo}
            position={[HINGE_RADIUS, 0, i * 0.014]}
            rotation={[0, 0, 0.5]}
          >
            <meshPhysicalMaterial
              color={CLAY}
              metalness={0.55}
              roughness={0.28}
              iridescence={0.9}
              iridescenceIOR={1.6}
              iridescenceThicknessRange={[100, 560]}
              clearcoat={0.6}
              clearcoatRoughness={0.25}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}

      {/* Lens barrel rings */}
      <mesh>
        <torusGeometry args={[2.05, 0.055, 16, 96]} />
        <meshStandardMaterial color={BRONZE} metalness={0.9} roughness={0.25} />
      </mesh>
      <mesh>
        <torusGeometry args={[2.28, 0.024, 12, 96]} />
        <meshStandardMaterial color={BRONZE} metalness={0.9} roughness={0.38} />
      </mesh>
      <mesh rotation={[0, 0, 0.4]}>
        <torusGeometry args={[2.52, 0.012, 8, 96]} />
        <meshStandardMaterial color={CLAY} metalness={0.8} roughness={0.5} />
      </mesh>

      {/* Glass element behind the blades */}
      <mesh position={[0, 0, -0.2]}>
        <circleGeometry args={[2.0, 64]} />
        <meshPhysicalMaterial
          color="#5c3722"
          metalness={0.5}
          roughness={0.28}
          iridescence={1}
          iridescenceIOR={1.9}
          iridescenceThicknessRange={[200, 900]}
        />
      </mesh>
    </group>
  );
}

function Rig() {
  useFrame((state) => {
    // Camera eases toward the lens as the hero scrolls away, so the
    // section exits by travelling into the aperture.
    const target = 7 - scrollState.p * 2.6;
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, target, 0.08);
  });
  return null;
}

export default function Aperture({ reduced = false }: { reduced?: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 40 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
      frameloop={reduced ? 'demand' : 'always'}
      style={{ pointerEvents: 'none' }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 5, 6]} intensity={2.2} color="#ffd9b0" />
      <directionalLight position={[-5, -2, 3]} intensity={0.9} color="#c2612f" />
      <pointLight position={[0, 0, 3]} intensity={12} distance={9} color="#ffb877" />

      {!reduced && <Rig />}
      {!reduced && <Dust />}

      <Float speed={reduced ? 0 : 1} rotationIntensity={reduced ? 0 : 0.1} floatIntensity={reduced ? 0 : 0.35}>
        <Iris />
      </Float>

      {/* Built in-scene: drei's presets fetch an HDRI from a third-party
          CDN and suspend the scene behind that request. */}
      <Environment resolution={128}>
        <Lightformer intensity={3.2} position={[0, 3, -4]} scale={[10, 3, 1]} color="#fff0dc" />
        <Lightformer intensity={1.8} position={[-4, 0, -2]} scale={[6, 6, 1]} color="#e08a4f" />
        <Lightformer intensity={1.2} position={[4, -1, -2]} scale={[6, 6, 1]} color="#c2612f" />
        <Lightformer intensity={0.8} position={[0, -4, 2]} scale={[10, 3, 1]} color="#f5f0e8" />
      </Environment>
    </Canvas>
  );
}
