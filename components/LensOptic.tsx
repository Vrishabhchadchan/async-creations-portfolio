'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const C = 300; // centre of the 600×600 viewBox
const BLADES = 9;
const HINGE_R = 176;

/** Resting and extreme iris angles, in degrees about each blade's hinge. */
const IRIS_OPEN = 7;
const IRIS_REST = 16;
const IRIS_SHUT = 34;

const FOCUS_MARKS = ['∞', '10', '5', '3', '1.5'];

/** Evenly spaced ticks around a ring, as SVG path data. */
function ticks(radius: number, length: number, count: number, every = 1) {
  let d = '';
  for (let i = 0; i < count; i++) {
    if (i % every !== 0) continue;
    const a = (i / count) * Math.PI * 2;
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    d += `M${C + cos * radius},${C + sin * radius}L${C + cos * (radius + length)},${C + sin * (radius + length)}`;
  }
  return d;
}

/**
 * The hero optic: a 35mm prime seen head-on.
 *
 * Drawn as vector rather than WebGL. Everything this needs — engraved
 * ring text, hairline knurling, coating gradients, specular arcs — is
 * native to SVG and fights a 3D renderer, which is why the previous
 * version read as flat and blunt. It also stays razor sharp at any
 * density and costs no GPU context.
 */
export default function LensOptic() {
  const root = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const blades = gsap.utils.toArray<SVGGElement>('.iris-blade', el);

    if (reduced) {
      // Static, fully legible resting state.
      blades.forEach((b) => gsap.set(b, { rotate: IRIS_REST, svgOrigin: `${C + HINGE_R} ${C}` }));
      return;
    }

    const ctx = gsap.context(() => {
      // Rings turn slowly and in opposition, the way a lens is racked.
      gsap.to('.ring-focus', {
        rotate: 360,
        duration: 52,
        ease: 'none',
        repeat: -1,
        svgOrigin: `${C} ${C}`,
      });
      gsap.to('.ring-name', {
        rotate: -360,
        duration: 68,
        ease: 'none',
        repeat: -1,
        svgOrigin: `${C} ${C}`,
      });

      // One proxy drives all nine blades, so they stay in lockstep and we
      // run a single tween rather than nine.
      const iris = { a: IRIS_SHUT };
      const applyIris = () => {
        blades.forEach((b) => gsap.set(b, { rotate: iris.a, svgOrigin: `${C + HINGE_R} ${C}` }));
      };
      applyIris();

      const intro = gsap.to(iris, {
        a: IRIS_REST,
        duration: 1.2,
        ease: 'power3.out',
        onUpdate: applyIris,
      });

      // Then it breathes, the way a lens hunts for exposure.
      intro.then(() => {
        gsap.to(iris, {
          a: IRIS_OPEN,
          duration: 3.6,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          onUpdate: applyIris,
        });
      });

      // Specular arcs drift with the pointer so the glass reads curved.
      // Pointer-device only; a few pixels at most.
      if (window.matchMedia('(pointer: fine)').matches) {
        const gx = gsap.quickTo('.glass-spec', 'x', { duration: 0.9, ease: 'power2.out' });
        const gy = gsap.quickTo('.glass-spec', 'y', { duration: 0.9, ease: 'power2.out' });
        const sx = gsap.quickTo('.glass-sheen', 'x', { duration: 1.2, ease: 'power2.out' });
        const sy = gsap.quickTo('.glass-sheen', 'y', { duration: 1.2, ease: 'power2.out' });

        const onMove = (e: MouseEvent) => {
          const r = el.getBoundingClientRect();
          const nx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
          const ny = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
          gx(gsap.utils.clamp(-1, 1, nx) * 9);
          gy(gsap.utils.clamp(-1, 1, ny) * 9);
          sx(gsap.utils.clamp(-1, 1, nx) * -5);
          sy(gsap.utils.clamp(-1, 1, ny) * -5);
        };

        window.addEventListener('mousemove', onMove, { passive: true });
        return () => window.removeEventListener('mousemove', onMove);
      }
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <svg
      ref={root}
      className="lens-optic"
      viewBox="0 0 600 600"
      role="img"
      aria-label="Async Creation 35mm lens"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Barrel: lit from upper-left, falling to shadow lower-right */}
        <linearGradient id="barrelGrad" x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor="#4a443d" />
          <stop offset="38%" stopColor="#2a2622" />
          <stop offset="100%" stopColor="#131110" />
        </linearGradient>
        <linearGradient id="ringGrad" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#3e3932" />
          <stop offset="45%" stopColor="#221f1b" />
          <stop offset="100%" stopColor="#100e0d" />
        </linearGradient>
        <linearGradient id="chromeGrad" x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#cfc7bb" />
          <stop offset="40%" stopColor="#8e877c" />
          <stop offset="100%" stopColor="#4c4740" />
        </linearGradient>
        <linearGradient id="bladeGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#574f45" />
          <stop offset="52%" stopColor="#38322c" />
          <stop offset="100%" stopColor="#201d1a" />
        </linearGradient>

        {/* Glass: deep in the centre, lifting slightly at the rim */}
        <radialGradient id="glassGrad" cx="0.42" cy="0.36" r="0.72">
          <stop offset="0%" stopColor="#1d2733" />
          <stop offset="46%" stopColor="#101720" />
          <stop offset="100%" stopColor="#060809" />
        </radialGradient>

        {/* Anti-reflective coating — restrained, and only near the rim */}
        <radialGradient id="coatGrad" cx="0.5" cy="0.5" r="0.5">
          <stop offset="62%" stopColor="#000000" stopOpacity="0" />
          <stop offset="84%" stopColor="#6b4f9e" stopOpacity="0.13" />
          <stop offset="93%" stopColor="#2f8d8a" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#c98a3f" stopOpacity="0.16" />
        </radialGradient>

        <radialGradient id="pupilGrad" cx="0.5" cy="0.45" r="0.6">
          <stop offset="0%" stopColor="#05070a" />
          <stop offset="100%" stopColor="#000000" />
        </radialGradient>

        <linearGradient id="specGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        <filter id="lensShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="6" dy="16" stdDeviation="18" floodColor="#3a2412" floodOpacity="0.3" />
        </filter>
        <filter id="softBlur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="7" />
        </filter>

        {/* The barrel hides the outer half of every blade, exactly as a
            real bore does — without this they spill over the engraving. */}
        <clipPath id="boreClip">
          <circle cx={C} cy={C} r="170" />
        </clipPath>

        {/* Arc the engraved name follows */}
        <path id="nameArc" d={`M${C - 194},${C} a194,194 0 1,1 388,0`} fill="none" />
      </defs>

      <g filter="url(#lensShadow)">
        {/* ---- Outer barrel with knurled grip ---- */}
        <circle cx={C} cy={C} r="284" fill="url(#barrelGrad)" />
        <circle cx={C} cy={C} r="284" fill="none" stroke="#6d6458" strokeWidth="1" opacity="0.5" />
        <path d={ticks(258, 26, 132)} stroke="#0d0c0b" strokeWidth="2.4" opacity="0.55" />
        <path d={ticks(258, 26, 132, 2)} stroke="#7b7265" strokeWidth="1" opacity="0.4" />

        {/* ---- Focus ring: distance scale and index mark ---- */}
        <circle cx={C} cy={C} r="248" fill="url(#ringGrad)" />
        <circle cx={C} cy={C} r="248" fill="none" stroke="#5d564c" strokeWidth="0.9" opacity="0.55" />

        <g className="ring-focus">
          <path d={ticks(214, 11, 60)} stroke="#a89f92" strokeWidth="1.1" opacity="0.5" />
          <path d={ticks(214, 18, 60, 5)} stroke="#d3cabb" strokeWidth="1.7" opacity="0.75" />
          {FOCUS_MARKS.map((m, i) => {
            const a = (i / FOCUS_MARKS.length) * Math.PI * 2 - Math.PI / 2;
            const r = 234;
            return (
              <text
                key={m}
                x={C + Math.cos(a) * r}
                y={C + Math.sin(a) * r}
                className="lens-mark"
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${(i / FOCUS_MARKS.length) * 360} ${C + Math.cos(a) * r} ${C + Math.sin(a) * r})`}
              >
                {m}
              </text>
            );
          })}
        </g>

        {/* Index mark — the one deliberate accent */}
        <path d={`M${C},${C - 252} l0,-16`} stroke="var(--color-clay)" strokeWidth="3.5" strokeLinecap="round" />

        {/* ---- Name ring ---- */}
        <circle cx={C} cy={C} r="206" fill="url(#barrelGrad)" />
        <circle cx={C} cy={C} r="206" fill="none" stroke="#6a6154" strokeWidth="0.8" opacity="0.5" />
        <g className="ring-name">
          <text className="lens-engrave">
            <textPath href="#nameArc" startOffset="50%" textAnchor="middle">
              ASYNC CREATION · 35mm 1:1.4 · PUNE
            </textPath>
          </text>
        </g>

        {/* ---- Inner barrel and filter lip ---- */}
        <circle cx={C} cy={C} r="182" fill="url(#ringGrad)" />
        <circle cx={C} cy={C} r="176" fill="none" stroke="url(#chromeGrad)" strokeWidth="6" />
        <circle cx={C} cy={C} r="170" fill="#0a0908" />

        {/* ---- Iris ---- */}
        <g className="iris" clipPath="url(#boreClip)">
          {Array.from({ length: BLADES }).map((_, i) => (
            <g key={i} transform={`rotate(${(i / BLADES) * 360} ${C} ${C})`}>
              <g className="iris-blade">
                <path
                  d={`M${C + HINGE_R},${C} Q${C + 122},${C - 2} ${C + 74},${C + 20} L${C + 83},${C + 82} Q${C + 132},${C + 112} ${C + HINGE_R + 6},${C + 152} Z`}
                  fill="url(#bladeGrad)"
                  stroke="#8a8072"
                  strokeWidth="0.9"
                  strokeOpacity="0.45"
                />
              </g>
            </g>
          ))}
        </g>

        {/* Opening: inner depth plus a faint reflection ring */}
        <circle cx={C} cy={C} r="60" fill="url(#pupilGrad)" />
        <circle cx={C} cy={C} r="52" fill="none" stroke="#7d8ea6" strokeWidth="1.1" opacity="0.32" />
        <circle cx={C} cy={C} r="36" fill="none" stroke="#c98a3f" strokeWidth="0.9" opacity="0.18" />

        {/* ---- Front element ---- */}
        <circle cx={C} cy={C} r="170" fill="url(#glassGrad)" opacity="0.42" />
        <circle cx={C} cy={C} r="170" fill="url(#coatGrad)" />

        {/* Specular arcs — the cue that the surface is curved */}
        <g className="glass-spec">
          <path
            d={`M${C - 122},${C - 78} A150,150 0 0 1 ${C - 34},${C - 158}`}
            stroke="url(#specGrad)"
            strokeWidth="13"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={`M${C + 96},${C + 104} A146,146 0 0 1 ${C + 44},${C + 142}`}
            stroke="url(#specGrad)"
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
            opacity="0.5"
          />
        </g>
        <ellipse
          className="glass-sheen"
          cx={C - 58}
          cy={C - 66}
          rx="64"
          ry="40"
          fill="#cfe2ff"
          opacity="0.07"
          filter="url(#softBlur)"
          transform={`rotate(-34 ${C - 58} ${C - 66})`}
        />

        {/* Rim light so the barrel lifts off the cream background */}
        <circle cx={C} cy={C} r="283" fill="none" stroke="#fdf6e9" strokeWidth="1.6" opacity="0.3" />
        <path
          d={`M${C - 240},${C - 148} A284,284 0 0 1 ${C - 62},${C - 277}`}
          stroke="#fff6e6"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />
      </g>
    </svg>
  );
}
