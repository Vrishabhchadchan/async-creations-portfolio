'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

/**
 * A scout quadcopter that flies in the corner once you leave the hero —
 * a nod to where most of the studio's work comes from.
 *
 * Drawn as SVG rather than a second WebGL canvas: a separate 3D context
 * costs a whole extra renderer for one small prop, and in testing the
 * second context silently failed to draw at all. Vector keeps it exact,
 * weightless and reliable on every device.
 *
 * Decorative and inert — pointer-events off, hidden from assistive tech.
 */
export default function DroneScout() {
  const [flying, setFlying] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const craft = useRef<SVGGElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(min-width: 1024px)').matches) return;

    const el = craft.current;
    if (!el) return;

    // Rotors: fast enough to read as spinning discs.
    const rotors = gsap.to('.rotor-blades', {
      rotate: 360,
      duration: 0.22,
      ease: 'none',
      repeat: -1,
      transformOrigin: '50% 50%',
    });

    // Idle hover — never perfectly still, the way a quad holds position.
    const hover = gsap.to(el, {
      y: '-=7',
      duration: 1.5,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      transformOrigin: '50% 50%',
    });

    const sway = gsap.to(el, {
      x: '+=9',
      duration: 3.4,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    // Blinking navigation light.
    const led = gsap.to('.drone-led', { opacity: 0.15, duration: 0.55, yoyo: true, repeat: -1, ease: 'none' });

    // A quadcopter pitches nose-down to move forward, so leaning with
    // scroll direction is what sells it as flying rather than bobbing.
    const tiltTo = gsap.quickTo(el, 'rotate', { duration: 0.6, ease: 'power2.out' });
    let last = window.scrollY;
    let velocity = 0;
    let raf = 0;

    const loop = () => {
      const y = window.scrollY;
      const delta = y - last;
      last = y;
      velocity += (delta - velocity) * 0.12;
      tiltTo(gsap.utils.clamp(-16, 16, velocity * 0.9));
      setFlying(y > window.innerHeight * 0.7);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      rotors.kill();
      hover.kill();
      sway.kill();
      led.kill();
    };
  }, []);

  return (
    <div ref={wrap} className={`drone-scout${flying ? ' is-flying' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g ref={craft}>
          {/* arms */}
          <g stroke="var(--drone-body)" strokeWidth="6" strokeLinecap="round">
            <path d="M100 74 L46 46" />
            <path d="M100 74 L154 46" />
            <path d="M100 74 L52 96" />
            <path d="M100 74 L148 96" />
          </g>

          {/* rotors */}
          {[
            [46, 46],
            [154, 46],
            [52, 96],
            [148, 96],
          ].map(([cx, cy], i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="7" fill="var(--drone-metal)" />
              <g className="rotor-blades" style={{ transformOrigin: `${cx}px ${cy}px` }}>
                <ellipse cx={cx} cy={cy} rx="26" ry="3.4" fill="var(--drone-prop)" opacity="0.5" />
                <ellipse cx={cx} cy={cy} rx="3.4" ry="26" fill="var(--drone-prop)" opacity="0.5" />
              </g>
              <circle cx={cx} cy={cy} r="26" stroke="var(--drone-prop)" strokeWidth="0.75" opacity="0.28" />
            </g>
          ))}

          {/* body */}
          <rect x="74" y="56" width="52" height="36" rx="11" fill="var(--drone-body)" />
          <rect x="82" y="60" width="36" height="17" rx="7" fill="var(--drone-top)" />

          {/* gimbal camera */}
          <circle cx="100" cy="97" r="10" fill="var(--drone-top)" />
          <circle cx="100" cy="97" r="6" fill="#0b0a09" />
          <circle cx="102" cy="95" r="1.9" fill="var(--drone-glint)" opacity="0.9" />

          {/* navigation light */}
          <circle className="drone-led" cx="100" cy="53" r="3.4" fill="var(--color-clay)" />
        </g>
      </svg>
      <span className="drone-tag">Drone &amp; Aerial</span>
    </div>
  );
}
