'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Three.js stays out of the initial bundle and off the server render —
// the hero copy paints and is crawlable long before the 3D arrives.
const Aperture = dynamic(() => import('./Aperture'), { ssr: false });

export default function HeroCanvas() {
  const [mounted, setMounted] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [visible, setVisible] = useState(true);
  const hostRef = useRef<HTMLDivElement>(null);

  // Once the hero has scrolled away the scene is still rendering every
  // frame behind the rest of the page. Stopping it there is the single
  // biggest win for scroll smoothness further down.
  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: '120px',
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);

    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);

    // Defer past first paint so the 3D never competes with LCP.
    const timer = window.setTimeout(() => setMounted(true), 500);

    return () => {
      mq.removeEventListener('change', onChange);
      window.clearTimeout(timer);
    };
  }, []);

  // Feed hero scroll progress to the scene so the lens is driven by the
  // wheel rather than running its own disconnected loop.
  useEffect(() => {
    if (!mounted) return;
    let trigger: ScrollTrigger | undefined;

    import('./Aperture').then(({ scrollState }) => {
      gsap.registerPlugin(ScrollTrigger);
      trigger = ScrollTrigger.create({
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          scrollState.p = self.progress;
          scrollState.v = self.getVelocity();
        },
      });
    });

    return () => trigger?.kill();
  }, [mounted]);

  return (
    <div className="hero-canvas" aria-hidden="true" ref={hostRef}>
      {/* Warm bloom sits behind the canvas and stands in while it loads */}
      <span className="hero-bloom" />
      {mounted && <Aperture reduced={reduced} paused={!visible} />}
    </div>
  );
}
