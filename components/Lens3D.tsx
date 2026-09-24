'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import LensOptic from '@/components/LensOptic';

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
  const [mode, setMode] = useState<Mode>('pending');

  useEffect(() => {
    const el = stage.current;
    if (!el) return;

    const desktop = window.matchMedia('(min-width: 1024px)').matches;
    if (!desktop || !webglAvailable()) {
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

        const ro = new ResizeObserver(() => lens.resize());
        ro.observe(el);

        const io = new IntersectionObserver(([entry]) => lens.setActive(entry.isIntersecting), {
          threshold: 0,
        });
        io.observe(el);

        const onMove = (e: MouseEvent) => {
          const r = el.getBoundingClientRect();
          lens.setPointer(
            (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2),
            (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2),
          );
        };
        if (!reduced) window.addEventListener('mousemove', onMove, { passive: true });

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
          ro.disconnect();
          io.disconnect();
          window.removeEventListener('mousemove', onMove);
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
    <div className={`lens-stage is-${mode}`}>
      <div className="lens-flat">
        <LensOptic />
      </div>
      <div className="lens-3d" ref={stage} />
    </div>
  );
}
