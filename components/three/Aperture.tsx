'use client';

import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer, Float } from '@react-three/drei';
import * as THREE from 'three';

const BLADES = 8;
const HINGE_RADIUS = 1.62;
const CLAY = '#c2612f';
const BRONZE = '#7d5130';

/**
 * One aperture blade, modelled the way a real iris works: the shape's
 * origin is the hinge pin, and the blade body extends inward from it
 * along -X. Swinging the mesh about that origin opens and closes the
 * iris, which is why the pivot has to live at (0,0) of the profile.
 */
function bladeGeometry() {
  const shape = new THREE.Shape();
  // Wide at the hinge end, tapering to the inner tip. The width has to
  // exceed the angular spacing between hinges or the blades separate
  // into loose petals instead of overlapping.
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

function Iris({ reduced }: { reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const blades = useRef<THREE.Mesh[]>([]);
  const geo = useMemo(() => bladeGeometry(), []);

  useFrame((state) => {
    if (reduced) return;
    const t = state.clock.elapsedTime;

    if (group.current) {
      group.current.rotation.z = t * 0.08;
      // A slight tilt toward the pointer, not a full follow.
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -state.pointer.y * 0.2, 0.04);
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, state.pointer.x * 0.2, 0.04);
    }

    // Breathing iris: every blade swings about its own hinge by the
    // same angle, so the opening stays concentric.
    const open = (Math.sin(t * 0.3) + 1) / 2;
    // Floor of 0.28 keeps the blades' outer corners inside the barrel
    // ring; below that they swing wide and clip through it.
    const swing = 0.28 + open * 0.42;
    blades.current.forEach((b) => {
      if (b) b.rotation.z = swing;
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
            // Each blade sits a fraction in front of the last, the way a
            // real iris stacks them — without it they merge into one flat
            // silhouette with no readable overlap.
            position={[HINGE_RADIUS, 0, i * 0.014]}
            rotation={[0, 0, 0.5]}
          >
            <meshStandardMaterial color={CLAY} metalness={0.45} roughness={0.34} side={THREE.DoubleSide} />
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

      {/* Glass element behind the blades — warm dark, not a black hole
          punched into a bone-coloured page. */}
      <mesh position={[0, 0, -0.2]}>
        <circleGeometry args={[2.0, 64]} />
        <meshStandardMaterial color="#6d4428" metalness={0.35} roughness={0.5} />
      </mesh>
    </group>
  );
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
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 5, 6]} intensity={2.2} color="#ffd9b0" />
      <directionalLight position={[-5, -2, 3]} intensity={0.9} color="#c2612f" />
      <Float speed={reduced ? 0 : 1} rotationIntensity={reduced ? 0 : 0.12} floatIntensity={reduced ? 0 : 0.4}>
        <Iris reduced={reduced} />
      </Float>

      {/* Built in-scene rather than from a preset: drei's presets fetch an
          HDRI from a third-party CDN, which blocks the whole scene behind a
          network request the hero should never depend on. */}
      <Environment resolution={128}>
        <Lightformer intensity={3} position={[0, 3, -4]} scale={[10, 3, 1]} color="#fff0dc" />
        <Lightformer intensity={1.6} position={[-4, 0, -2]} scale={[6, 6, 1]} color="#e08a4f" />
        <Lightformer intensity={1.1} position={[4, -1, -2]} scale={[6, 6, 1]} color="#c2612f" />
        <Lightformer intensity={0.7} position={[0, -4, 2]} scale={[10, 3, 1]} color="#f5f0e8" />
      </Environment>
    </Canvas>
  );
}
