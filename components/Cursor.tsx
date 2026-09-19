'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

/**
 * A camera viewfinder reticle: four corner brackets that lock tighter
 * over anything interactive, the way autofocus snaps onto a subject.
 *
 * Pointer devices only, and purely decorative — the native cursor stays
 * visible underneath, so nothing depends on this rendering.
 */
export default function Cursor() {
  const wrap = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const w = wrap.current;
    const b = box.current;
    const d = dot.current;
    const l = label.current;
    if (!w || !b || !d || !l) return;

    gsap.set([w, d], { xPercent: -50, yPercent: -50, opacity: 0 });

    // Short enough to feel attached to the hand. Above ~0.2s the reticle
    // reads as lag rather than smoothing.
    const wx = gsap.quickTo(w, 'x', { duration: 0.16, ease: 'power2.out' });
    const wy = gsap.quickTo(w, 'y', { duration: 0.16, ease: 'power2.out' });
    const dx = gsap.quickTo(d, 'x', { duration: 0.05, ease: 'none' });
    const dy = gsap.quickTo(d, 'y', { duration: 0.05, ease: 'none' });

    let shown = false;
    const move = (e: MouseEvent) => {
      if (!shown) {
        shown = true;
        gsap.to([w, d], { opacity: 1, duration: 0.35 });
      }
      wx(e.clientX);
      wy(e.clientY);
      dx(e.clientX);
      dy(e.clientY);
    };

    const lock = (e: Event) => {
      const el = e.currentTarget as HTMLElement;
      const kind = el.tagName === 'A' ? 'OPEN' : el.tagName === 'SUMMARY' ? 'MORE' : 'FOCUS';
      l.textContent = kind;
      gsap.to(b, { scale: 0.62, rotate: 0, borderColor: 'var(--color-clay)', duration: 0.4, ease: 'power3.out' });
      gsap.to('.reticle-corner', { padding: 0, duration: 0.4, ease: 'power3.out' });
      gsap.to(l, { opacity: 1, y: 0, duration: 0.3 });
    };

    const release = () => {
      gsap.to(b, { scale: 1, rotate: 0, borderColor: 'transparent', duration: 0.45, ease: 'power3.out' });
      gsap.to(l, { opacity: 0, y: 4, duration: 0.25 });
    };

    // A quick shutter blink on click.
    const press = () => {
      gsap.fromTo(b, { scale: 0.62 }, { scale: 0.45, duration: 0.1, yoyo: true, repeat: 1, ease: 'power2.inOut' });
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mousedown', press);

    const targets = document.querySelectorAll('a, button, summary, input, select, textarea');
    targets.forEach((t) => {
      t.addEventListener('mouseenter', lock);
      t.addEventListener('mouseleave', release);
    });

    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mousedown', press);
      targets.forEach((t) => {
        t.removeEventListener('mouseenter', lock);
        t.removeEventListener('mouseleave', release);
      });
    };
  }, []);

  return (
    <div aria-hidden="true">
      <div ref={wrap} className="reticle">
        <div ref={box} className="reticle-box">
          <i className="reticle-corner tl" />
          <i className="reticle-corner tr" />
          <i className="reticle-corner bl" />
          <i className="reticle-corner br" />
        </div>
        <span ref={label} className="reticle-label" />
      </div>
      <div ref={dot} className="reticle-dot" />
    </div>
  );
}
