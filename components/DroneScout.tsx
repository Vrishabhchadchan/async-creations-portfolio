'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import DroneArt from '@/components/DroneArt';

/**
 * A professional camera drone, anchored to the About section.
 *
 * Vector rather than WebGL: a second 3D context for one prop is not a
 * fair trade against scroll performance, and the gimbal detail that
 * makes it read as a *camera* drone is far crisper drawn than modelled.
 *
 * It climbs with the section's scroll progress, pitching forward as it
 * goes while the gimbal counter-rotates to stay level — which is the
 * whole point of a gimbal. Decorative and inert throughout.
 */
export default function DroneScout() {
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Props read as spinning discs, so only the faint streaks turn.
      gsap.to('.rotor-streak', {
        rotate: 360,
        duration: 0.32,
        ease: 'none',
        repeat: -1,
        transformOrigin: '50% 50%',
      });

      // Idle: a hover bob with a touch of sway, never perfectly still.
      gsap.to('.drone-craft', {
        y: -9,
        duration: 3,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
      gsap.to('.drone-craft', {
        rotate: 1.6,
        duration: 4.4,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        transformOrigin: '50% 50%',
      });

      // Status lights: one blinking amber, one steady white.
      gsap.to('.led-amber', { opacity: 0.12, duration: 0.7, yoyo: true, repeat: -1, ease: 'none' });

      // Scroll-linked ascent across the About section. Scrubbed so it
      // tracks the wheel smoothly and reverses on the way back up.
      const section = document.querySelector('#about');
      if (!section) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 72%',
          end: 'bottom 55%',
          scrub: 1.1,
        },
      });

      // Travel is deliberately short: the left column's heading is
      // sticky, so a longer climb would fly the craft straight into it.
      tl.to('.drone-lift', { y: -62, ease: 'none' }, 0)
        // Real drones pitch nose-down to travel; a few degrees is plenty.
        .to('.drone-tilt', { rotate: -7, ease: 'none', transformOrigin: '50% 50%' }, 0)
        // The gimbal's job is to stay level while the body moves.
        .to('.drone-gimbal', { rotate: 7, ease: 'none', transformOrigin: '160px 132px' }, 0)
        .to('.drone-shadow', { scale: 0.55, opacity: 0.12, ease: 'none', transformOrigin: '50% 50%' }, 0)
        .to('.drone-label', { opacity: 0, y: 10, ease: 'none' }, 0);
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div className="drone-stage" ref={stage} aria-hidden="true">
      <div className="drone-lift">
        <DroneArt idPrefix="about" />
      </div>
      <span className="drone-label">Drone &amp; Aerial</span>
    </div>
  );
}
