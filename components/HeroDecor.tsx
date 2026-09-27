'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { gsap } from 'gsap';

/* Three frames, not four: at 1280 a fourth card crowded the lens and
   collided with the exposure readout. They sit at the corners of the
   viewfinder frame, leaving its diagonal — where the lens lives — clear.

   The photos are the studio's own, reused from the services set. Captions
   describe what is actually in each shot: nothing in the library is aerial,
   so there is no drone card. `depth` scales each card's parallax travel,
   and `focus` recentres the crop, since these are 16:9 in a 4:5 window. */
const FRAMES = [
  {
    src: '/images/work/service-cine.jpg',
    caption: 'FILM · ON SET',
    cls: 'f1',
    rotate: -6,
    depth: 1,
    focus: '38% 50%',
  },
  {
    src: '/images/work/service-brand.jpg',
    caption: 'BRAND · CAMPAIGN',
    cls: 'f2',
    rotate: 5,
    depth: 0.55,
    focus: '50% 32%',
  },
  {
    src: '/images/work/service-drone.jpg',
    caption: 'EVENT · PUNE',
    cls: 'f3',
    rotate: 7,
    depth: 0.8,
    focus: '52% 55%',
  },
];

const BADGE_TEXT = 'AVAILABLE FOR SHOOTS · PUNE · 2026 · ';

/** The furniture only exists from 768px, so neither effect runs below it. */
const DESKTOP = '(min-width: 768px)';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

/**
 * Desktop hero furniture: print-style work frames, a viewfinder frame with a
 * running timecode, a rotating availability badge and the margin details.
 *
 * Everything here is decoration except the badge, which is a real link to
 * the quote form — so the wrapper is not blanket `aria-hidden`; the
 * decorative pieces hide themselves individually.
 */
export default function HeroDecor() {
  const root = useRef<HTMLDivElement>(null);
  const [clock, setClock] = useState('00:00:00');

  // Timecode. Driven off wall time so it stays honest if the tab sleeps.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const mq = window.matchMedia(DESKTOP);
    let id = 0;
    const started = Date.now();

    const tick = () => {
      const t = Math.floor((Date.now() - started) / 1000);
      setClock(`${pad(Math.floor(t / 3600))}:${pad(Math.floor(t / 60) % 60)}:${pad(t % 60)}`);
    };

    const sync = () => {
      window.clearInterval(id);
      if (mq.matches) id = window.setInterval(tick, 1000);
    };

    sync();
    mq.addEventListener('change', sync);
    return () => {
      window.clearInterval(id);
      mq.removeEventListener('change', sync);
    };
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia(DESKTOP).matches) return;

    const ctx = gsap.context(() => {
      // Frames float in, staggered, once the headline has landed.
      gsap.from('.hframe', {
        opacity: 0,
        y: 26,
        scale: 0.94,
        duration: 0.9,
        stagger: 0.12,
        delay: 0.55,
        ease: 'power3.out',
      });

      if (!window.matchMedia('(pointer: fine)').matches) return;

      // Parallax. Each card keeps its own quickTo so the tweens never fight,
      // and depth varies the travel to suggest layers at different distances.
      const movers = gsap.utils.toArray<HTMLElement>('.hframe').map((card) => ({
        depth: parseFloat(card.dataset.depth || '1'),
        x: gsap.quickTo(card, 'x', { duration: 0.9, ease: 'power2.out' }),
        y: gsap.quickTo(card, 'y', { duration: 0.9, ease: 'power2.out' }),
      }));

      const onMove = (e: MouseEvent) => {
        const nx = (e.clientX / window.innerWidth) * 2 - 1;
        const ny = (e.clientY / window.innerHeight) * 2 - 1;
        movers.forEach((m) => {
          m.x(nx * 15 * m.depth);
          m.y(ny * 15 * m.depth);
        });
      };

      window.addEventListener('mousemove', onMove, { passive: true });
      return () => window.removeEventListener('mousemove', onMove);
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div className="hero-decor" ref={root}>
      {/* Warm pool of light so the lens sits in something */}
      <span className="hero-glow" aria-hidden="true" />

      {/* Viewfinder frame around the lens and the work frames */}
      <div className="hvf" aria-hidden="true">
        <i className="hvf-corner tl" />
        <i className="hvf-corner tr" />
        <i className="hvf-corner bl" />
        <i className="hvf-corner br" />
        <span className="hvf-rec">
          <i className="hvf-dot" />
          REC {clock}
        </span>
        <span className="hvf-readout">ISO 400 · 1/250 · f/2.8</span>

        {FRAMES.map((f) => (
          <figure
            key={f.cls}
            className={`hframe ${f.cls}`}
            data-depth={f.depth}
            style={{ rotate: `${f.rotate}deg` }}
            aria-hidden="true"
          >
            <div className="hframe-media">
              {/* Fixed intrinsic size + a ratio box, so decoding shifts nothing. */}
              <Image
                src={f.src}
                alt=""
                width={600}
                height={750}
                sizes="200px"
                style={{ objectPosition: f.focus }}
              />
            </div>
            <figcaption>{f.caption}</figcaption>
          </figure>
        ))}
      </div>


      {/* The one interactive piece in here */}
      <Link href="/contact" className="hero-badge" aria-label="Available for shoots in Pune — get a quote">
        <svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">
          <defs>
            <path id="badgeArc" d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0" fill="none" />
          </defs>
          <text className="badge-text">
            <textPath href="#badgeArc">{BADGE_TEXT}</textPath>
          </text>
        </svg>
        <span className="badge-arrow" aria-hidden="true">
          ↗
        </span>
      </Link>

      {/* Margin details */}
      <span className="hero-coords" aria-hidden="true">
        18.52°N 73.85°E
      </span>
      <span className="hero-scroll" aria-hidden="true">
        Scroll <i>↓</i>
      </span>
    </div>
  );
}
