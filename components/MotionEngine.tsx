'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Scans server-rendered markup for motion hooks and animates them.
 *
 * Everything uses gsap.from(), so the CSS resting state is the *final*
 * state: with JS disabled or before hydration, all content is already
 * visible to users and crawlers. Nothing is hidden by default.
 *
 *   data-reveal            fade + rise the element itself
 *   data-reveal-stagger    fade + rise its direct children in sequence
 *   data-parallax="-12"    drift by N percent across the viewport
 */
export default function MotionEngine() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 28,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
        });
      });

      gsap.utils.toArray<HTMLElement>('[data-reveal-stagger]').forEach((el) => {
        const items = Array.from(el.children) as HTMLElement[];
        if (!items.length) return;
        gsap.from(items, {
          opacity: 0,
          y: 24,
          duration: 0.6,
          stagger: 0.07,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
        });
      });

      gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
        const amount = parseFloat(el.dataset.parallax || '-10');
        gsap.to(el, {
          yPercent: amount,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 },
        });
      });

      // Count-up stats
      gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
        const target = parseFloat(el.dataset.count || '0');
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 1.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          onUpdate: () => {
            el.textContent = String(Math.round(obj.v));
          },
        });
      });
    });

    return () => ctx.revert();
  }, []);

  return null;
}
