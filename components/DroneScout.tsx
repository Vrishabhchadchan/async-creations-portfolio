'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const ROTORS = [
  { x: 54, y: 64 },
  { x: 266, y: 64 },
  { x: 76, y: 120 },
  { x: 244, y: 120 },
];

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
        <svg viewBox="0 0 320 210" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="hullGrad" x1="0.2" y1="0" x2="0.8" y2="1">
              <stop offset="0%" stopColor="#6a6258" />
              <stop offset="45%" stopColor="#403a34" />
              <stop offset="100%" stopColor="#23201c" />
            </linearGradient>
            <linearGradient id="armGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#4a443c" />
              <stop offset="100%" stopColor="#262320" />
            </linearGradient>
            <linearGradient id="gimbalGrad" x1="0.2" y1="0" x2="0.8" y2="1">
              <stop offset="0%" stopColor="#5b544b" />
              <stop offset="100%" stopColor="#2a2622" />
            </linearGradient>
            <radialGradient id="discGrad" cx="0.5" cy="0.5" r="0.5">
              <stop offset="55%" stopColor="#8d867a" stopOpacity="0.05" />
              <stop offset="88%" stopColor="#8d867a" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#8d867a" stopOpacity="0" />
            </radialGradient>
            <filter id="droneShadowBlur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>

          {/* Ground shadow — shrinks and fades as the craft climbs */}
          <ellipse
            className="drone-shadow"
            cx="160"
            cy="196"
            rx="72"
            ry="9"
            fill="#4a2c12"
            opacity="0.3"
            filter="url(#droneShadowBlur)"
          />

          <g className="drone-craft">
            <g className="drone-tilt">
              {/* ---- Arms ---- */}
              <g stroke="url(#armGrad)" strokeWidth="9" strokeLinecap="round">
                <path d="M132 86 L64 68" />
                <path d="M188 86 L256 68" />
                <path d="M134 112 L84 122" />
                <path d="M186 112 L236 122" />
              </g>

              {/* ---- Rotors: blurred discs, not visible blades ---- */}
              {ROTORS.map((r, i) => (
                <g key={i}>
                  <circle cx={r.x} cy={r.y} r="42" fill="url(#discGrad)" />
                  <circle cx={r.x} cy={r.y} r="42" stroke="#8d867a" strokeWidth="0.7" opacity="0.2" fill="none" />
                  <g className="rotor-streak" style={{ transformOrigin: `${r.x}px ${r.y}px` }}>
                    <ellipse cx={r.x} cy={r.y} rx="40" ry="2.6" fill="#a89f92" opacity="0.2" />
                    <ellipse cx={r.x} cy={r.y} rx="2.6" ry="40" fill="#a89f92" opacity="0.14" />
                  </g>
                  {/* motor housing */}
                  <rect x={r.x - 7} y={r.y - 6} width="14" height="15" rx="4" fill="#575046" />
                  <circle cx={r.x} cy={r.y} r="4" fill="#877f72" />
                </g>
              ))}

              {/* ---- Landing legs ---- */}
              <path d="M136 126 L126 158" stroke="#3a352f" strokeWidth="4.5" strokeLinecap="round" />
              <path d="M184 126 L194 158" stroke="#3a352f" strokeWidth="4.5" strokeLinecap="round" />
              <path d="M117 158 L135 158" stroke="#4a443c" strokeWidth="5" strokeLinecap="round" />
              <path d="M185 158 L203 158" stroke="#4a443c" strokeWidth="5" strokeLinecap="round" />

              {/* ---- Hull ---- */}
              <path
                d="M124 82 Q160 68 196 82 L200 108 Q160 126 120 108 Z"
                fill="url(#hullGrad)"
                stroke="#7a7266"
                strokeWidth="0.8"
                strokeOpacity="0.4"
              />
              {/* panel lines */}
              <path d="M133 84 Q160 74 187 84" stroke="#0f0d0c" strokeWidth="1.1" opacity="0.5" fill="none" />
              <path d="M128 100 L192 100" stroke="#0f0d0c" strokeWidth="1" opacity="0.35" />
              {/* canopy */}
              <path d="M141 80 Q160 72 179 80 L176 92 Q160 86 144 92 Z" fill="#171412" opacity="0.85" />

              {/* status LEDs */}
              <circle className="led-amber" cx="126" cy="104" r="3.4" fill="var(--color-clay)" />
              <circle cx="194" cy="104" r="3" fill="#f2ece1" opacity="0.9" />
            </g>

            {/* ---- 3-axis gimbal: stays level while the body pitches ---- */}
            <g className="drone-gimbal">
              {/* yoke arms */}
              <path
                d="M146 112 L146 130 M174 112 L174 130"
                stroke="#5b544b"
                strokeWidth="3.4"
                strokeLinecap="round"
              />
              <path d="M146 130 Q160 136 174 130" stroke="#5b544b" strokeWidth="3.4" fill="none" strokeLinecap="round" />
              {/* camera housing */}
              <rect x="146" y="126" width="28" height="22" rx="6" fill="url(#gimbalGrad)" stroke="#837a6d" strokeWidth="0.7" strokeOpacity="0.5" />
              {/* lens */}
              <circle cx="160" cy="137" r="8.4" fill="#100e0d" stroke="#8d8578" strokeWidth="1.4" />
              <circle cx="160" cy="137" r="4.6" fill="#0a1017" />
              <circle cx="162.4" cy="134.6" r="1.8" fill="#d6e6ff" opacity="0.85" />
            </g>
          </g>
        </svg>
      </div>
      <span className="drone-label">Drone &amp; Aerial</span>
    </div>
  );
}
