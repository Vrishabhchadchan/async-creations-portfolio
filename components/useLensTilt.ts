'use client';

import { useEffect, useRef, useState } from 'react';

type Emit = (nx: number, ny: number) => void;

type OrientationPermission = 'unsupported' | 'granted' | 'denied' | 'needs-gesture';

interface DeviceOrientationEventiOS {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

/** iOS gates the gyroscope behind an explicit, gesture-triggered prompt. */
function iosGate() {
  const ctor = window.DeviceOrientationEvent as unknown as DeviceOrientationEventiOS | undefined;
  return typeof ctor?.requestPermission === 'function' ? ctor : null;
}

/**
 * Feeds the lens a single normalised −1..1 tilt, from whichever input the
 * device actually has.
 *
 * Pointer and gyroscope are deliberately the same channel: the scene only
 * ever sees "lean this far", so it needs no knowledge of the input type.
 *
 * Returns the orientation permission state so the caller can show a prompt
 * only when iOS genuinely requires a gesture.
 */
export function useLensTilt(emit: Emit, enabled: boolean) {
  const [permission, setPermission] = useState<OrientationPermission>('unsupported');
  const emitRef = useRef(emit);
  emitRef.current = emit;

  useEffect(() => {
    if (!enabled) return;

    const fine = window.matchMedia('(pointer: fine)').matches;

    // ---- Pointer devices ----
    if (fine) {
      const onMove = (e: MouseEvent) => {
        emitRef.current(
          (e.clientX / window.innerWidth) * 2 - 1,
          (e.clientY / window.innerHeight) * 2 - 1,
        );
      };
      window.addEventListener('mousemove', onMove, { passive: true });
      return () => window.removeEventListener('mousemove', onMove);
    }

    // ---- Touch devices: gyroscope ----
    if (!('DeviceOrientationEvent' in window)) {
      setPermission('unsupported');
      return;
    }

    let detach: (() => void) | undefined;

    const listen = () => {
      // Zero against the first reading rather than flat-on-a-table: people
      // hold a phone tilted, and an absolute origin would peg the lens.
      let baseBeta: number | null = null;
      let baseGamma: number | null = null;

      const onOrient = (e: DeviceOrientationEvent) => {
        if (e.beta === null || e.gamma === null) return;
        if (baseBeta === null) {
          baseBeta = e.beta;
          baseGamma = e.gamma;
          return;
        }
        // ±26° of hand movement covers the full lean.
        const nx = Math.max(-1, Math.min(1, (e.gamma - (baseGamma as number)) / 26));
        const ny = Math.max(-1, Math.min(1, (e.beta - baseBeta) / 26));
        emitRef.current(nx, ny);
      };

      window.addEventListener('deviceorientation', onOrient, { passive: true });
      detach = () => window.removeEventListener('deviceorientation', onOrient);
    };

    const gate = iosGate();
    if (!gate) {
      // Android and desktop Safari expose the event without a prompt.
      setPermission('granted');
      listen();
      return () => detach?.();
    }

    setPermission('needs-gesture');

    const ask = async () => {
      try {
        const res = await gate.requestPermission!();
        if (res === 'granted') {
          setPermission('granted');
          listen();
        } else {
          // Denied: the caller falls back to the scene's idle float.
          setPermission('denied');
        }
      } catch {
        setPermission('denied');
      }
    };

    const onFirstTap = () => {
      window.removeEventListener('touchend', onFirstTap);
      window.removeEventListener('pointerdown', onFirstTap);
      void ask();
    };

    window.addEventListener('touchend', onFirstTap, { passive: true });
    window.addEventListener('pointerdown', onFirstTap, { passive: true });

    return () => {
      window.removeEventListener('touchend', onFirstTap);
      window.removeEventListener('pointerdown', onFirstTap);
      detach?.();
    };
  }, [enabled]);

  return permission;
}
