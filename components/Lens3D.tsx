'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import LensOptic from '@/components/LensOptic';
import { useLensTilt } from '@/components/useLensTilt';

type Mode = 'pending' | '3d' | 'flat';

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/**
 * The hero lens. On desktop it is a real-time 3D lens whose zoom is driven
 * by scroll; on small screens (where it is only a faint wash behind the
 * copy) or when WebGL is unavailable it falls back to the flat vector lens,
 * so nothing is ever missing.
 */
export default function Lens3D() {
  const stage = useRef<HTMLDivElement>(null);
  const shell = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{ setPointer(nx: number, ny: number): void } | null>(null);
  const [mode, setMode] = useState<Mode>('pending');

  const reduced =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // One tilt channel for both pointer and gyroscope. The 3D scene takes it
  // directly; the flat fallback leans via a CSS variable, so the gesture is
  // never dead weight on devices that never load the canvas.
  useLensTilt((nx, ny) => {
    sceneRef.current?.setPointer(nx, ny);
    const el = shell.current;
    if (el) {
      el.style.setProperty('--tilt-x', String(nx));
      el.style.setProperty('--tilt-y', String(ny));
    }
  }, !reduced);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;

    // The lens now has a dedicated block on small screens, so 3D is no
    // longer desktop-only; only a missing WebGL context forces the flat
    // fallback. (Phase 4 adds the low-end device gate.)
    if (!webglAvailable()) {
      setMode('flat');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let disposed = false;
    let cleanup = () => {};

    import('@/lib/lensScene')
      .then(({ createLensScene }) => {
        if (disposed) return;

        let lens: ReturnType<typeof createLensScene>;
        try {
          lens = createLensScene(el, { reduced });
        } catch {
          setMode('flat');
          return;
        }
        lens.onContextLost(() => setMode('flat'));
        setMode('3d');

        // Framing follows the layout: its own block on small screens, an
        // offset column on desktop.
        // 768 is where the hero becomes a two-column desktop layout, so the
        // lens takes its column framing from the same breakpoint.
        const wide = window.matchMedia('(min-width: 768px)');

        // Aim: keep the lens centred in the viewfinder frame rather than in
        // the canvas, which spans the whole hero so the lens has room to
        // dive. Measured from the layout, so it holds at any width — the
        // offsets differ with viewport height as well as width.
        /** Frame width the lens size is tuned against. Narrower than this and the
         * camera pulls back, which is what keeps the corner prints clear at
         * 1024 and 1280. */
        const REF_FRAME = 650;

        const aim = () => {
          if (!wide.matches) {
            lens.setFit(1);
            return lens.setAim(0.26, 0);
          }
          const frame = el.closest('.hero')?.querySelector('.hvf');
          if (!frame) return lens.setAim(0.26, 0);
          const c = el.getBoundingClientRect();
          const f = frame.getBoundingClientRect();
          if (!c.width || !c.height) return;
          // Biased slightly above the frame's centre. The barrel runs from
          // rear at the top-left to front glass at the bottom-right, so a
          // dead-centre aim leaves no strip under the front element for the
          // third work frame. The bias is what buys that strip.
          const RISE = 0.1;
          // Narrower viewfinders pull the camera back rather than letting
          // the barrel swallow the frame and the prints around it.
          lens.setFit(Math.min(1, f.width / REF_FRAME));
          lens.setAim(
            (f.left + f.width / 2 - (c.left + c.width / 2)) / c.width,
            (f.top + f.height * (0.5 - RISE) - (c.top + c.height / 2)) / c.height,
          );
        };

        const applyFraming = () => {
          lens.setFraming(!wide.matches);
          aim();
        };
        applyFraming();
        wide.addEventListener('change', applyFraming);

        const ro = new ResizeObserver(() => {
          lens.resize();
          aim();
        });
        ro.observe(el);

        const io = new IntersectionObserver(([entry]) => lens.setActive(entry.isIntersecting), {
          threshold: 0,
        });
        io.observe(el);

        sceneRef.current = lens;

        const ctx = gsap.context(() => {
          if (reduced) return;
          const hero = el.closest('.hero') as HTMLElement | null;
          if (!hero) return;

          const stageEl = el.parentElement;
          const span = () => window.innerHeight * 0.62;

          // The lens holds its place on screen while the hero copy scrolls
          // away, so the zoom is watched happening instead of the whole
          // thing sliding off first. It dissolves as the dive completes.
          // scrub is true (no lag) so the 1:1 counter-scroll never drifts.
          gsap
            .timeline({
              scrollTrigger: {
                trigger: hero,
                start: 'top top',
                end: () => `+=${span()}`,
                scrub: true,
                invalidateOnRefresh: true,
                onUpdate: (self) => lens.setProgress(self.progress),
              },
            })
            .to(stageEl, { y: () => span(), ease: 'none', duration: 1 }, 0)
            .to(stageEl, { opacity: 0, ease: 'power1.in', duration: 0.15 }, 0.88);
        });

        cleanup = () => {
          ctx.revert();
          wide.removeEventListener('change', applyFraming);
          ro.disconnect();
          io.disconnect();
          sceneRef.current = null;
          lens.dispose();
        };
      })
      .catch(() => setMode('flat'));

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <div className={`lens-stage is-${mode}`} ref={shell}>
      <div className="lens-flat">
        <LensOptic />
      </div>
      <div className="lens-3d" ref={stage} />
    </div>
  );
}
