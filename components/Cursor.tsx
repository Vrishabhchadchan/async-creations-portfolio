'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

/**
 * Pointer-device only. Purely decorative: the native cursor is kept
 * visible underneath so nothing depends on this rendering.
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const d = dot.current;
    const r = ring.current;
    if (!d || !r) return;

    gsap.set([d, r], { xPercent: -50, yPercent: -50, opacity: 0 });

    const dx = gsap.quickTo(d, 'x', { duration: 0.12, ease: 'power3.out' });
    const dy = gsap.quickTo(d, 'y', { duration: 0.12, ease: 'power3.out' });
    const rx = gsap.quickTo(r, 'x', { duration: 0.5, ease: 'power3.out' });
    const ry = gsap.quickTo(r, 'y', { duration: 0.5, ease: 'power3.out' });

    let shown = false;
    const move = (e: MouseEvent) => {
      if (!shown) {
        shown = true;
        gsap.to([d, r], { opacity: 1, duration: 0.3 });
      }
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    };

    const grow = () => gsap.to(r, { scale: 2.1, duration: 0.35, ease: 'power3.out' });
    const shrink = () => gsap.to(r, { scale: 1, duration: 0.35, ease: 'power3.out' });

    window.addEventListener('mousemove', move);

    const targets = document.querySelectorAll('a, button, summary, input, select, textarea');
    targets.forEach((t) => {
      t.addEventListener('mouseenter', grow);
      t.addEventListener('mouseleave', shrink);
    });

    return () => {
      window.removeEventListener('mousemove', move);
      targets.forEach((t) => {
        t.removeEventListener('mouseenter', grow);
        t.removeEventListener('mouseleave', shrink);
      });
    };
  }, []);

  return (
    <div aria-hidden="true">
      <div ref={ring} className="cursor-ring" />
      <div ref={dot} className="cursor-dot" />
    </div>
  );
}
