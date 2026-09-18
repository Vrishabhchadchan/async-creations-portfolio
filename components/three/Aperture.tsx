'use client';

import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float } from '@react-three/drei';
import * as THREE from 'three';

const BLADES = 7;
const CLAY = '#c2612f';
const BRONZE = '#8a5a34';

/** One aperture blade: a thin, tapered wedge extruded from a 2D profile. */
function bladeGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(1.35, 0.1);
  shape.lineTo(1.5, 0.62);
  shape.lineTo(0.12, 0.42);
  shape.lineTo(0, 0);
  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.07,
    bevelEnabled: true,
    bevelSize: 0.015,
    bevelThickness: 0.015,
    bevelSegments: 2,
  });
}

function Iris({ reduced }: { reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const blades = useRef<THREE.Mesh[]>([]);
  const geo = useMemo(() => bladeGeometry(), []);

  useFrame((state) => {
    if (reduced) return;
    const t = state.clock.elapsedTime;

    if (group.current) {
      group.current.rotation.z = t * 0.12;
      // Mouse parallax — a slight tilt toward the pointer, not a full follow.
      group.current.rotation.x = THREE.MathUtils.lerp(
        group.current.rotation.x,
        -state.pointer.y * 0.28,
        0.04
      );
      group.current.rotation.y = THREE.MathUtils.lerp(
        group.current.rotation.y,
        state.pointer.x * 0.28,
        0.04
      );
    }

    // Breathing iris: blades open and close on a slow sine.
    const open = (Math.sin(t * 0.35) + 1) / 2;
    blades.current.forEach((b, i) => {
      if (!b) return;
      const base = (i / BLADES) * Math.PI * 2;
      b.rotation.z = base + open * 0.62;
      const r = 0.34 + open * 0.42;
      b.position.set(Math.cos(base) * r, Math.sin(base) * r, 0);
    });
  });

  return (
    <group ref={group} scale={1.05}>
      {Array.from({ length: BLADES }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) blades.current[i] = el;
          }}
          geometry={geo}
          castShadow
        >
          <meshStandardMaterial color={CLAY} metalness={0.82} roughness={0.28} />
        </mesh>
      ))}

      {/* Lens barrel rings */}
      <mesh rotation={[0, 0, 0]}>
        <torusGeometry args={[2.05, 0.055, 16, 96]} />
        <meshStandardMaterial color={BRONZE} metalness={0.9} roughness={0.22} />
      </mesh>
      <mesh>
        <torusGeometry args={[2.32, 0.03, 12, 96]} />
        <meshStandardMaterial color={BRONZE} metalness={0.9} roughness={0.35} />
      </mesh>

      {/* Inner glass element */}
      <mesh position={[0, 0, -0.12]}>
        <circleGeometry args={[1.85, 64]} />
        <meshStandardMaterial
          color="#2a1d12"
          metalness={1}
          roughness={0.08}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

export default function Aperture({ reduced = false }: { reduced?: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 7.4], fov: 42 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
      frameloop={reduced ? 'demand' : 'always'}
      style={{ pointerEvents: 'none' }}
    >
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 5, 6]} intensity={2.1} color="#ffd9b0" />
      <directionalLight position={[-5, -2, 3]} intensity={0.8} color="#c2612f" />
      <Float speed={reduced ? 0 : 1.1} rotationIntensity={reduced ? 0 : 0.18} floatIntensity={reduced ? 0 : 0.5}>
        <Iris reduced={reduced} />
      </Float>
      <Environment preset="sunset" />
    </Canvas>
  );
}
