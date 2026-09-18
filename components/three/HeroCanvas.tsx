'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Three.js stays out of the initial bundle and off the server render —
// the hero copy paints and is crawlable long before the 3D arrives.
const Aperture = dynamic(() => import('./Aperture'), { ssr: false });

export default function HeroCanvas() {
  const [mounted, setMounted] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);

    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);

    // Defer past first paint so the 3D never competes with LCP.
    const timer = window.setTimeout(() => setMounted(true), 600);

    return () => {
      mq.removeEventListener('change', onChange);
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div className="hero-canvas" aria-hidden="true">
      {/* Warm bloom sits behind the canvas and stands in for it while loading */}
      <span className="hero-bloom" />
      {mounted && <Aperture reduced={reduced} />}
    </div>
  );
}
