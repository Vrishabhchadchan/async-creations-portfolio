'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import type { GalleryItem } from '@/lib/manifest';

const ALL = 'all';

/**
 * Filterable portfolio.
 *
 * Only categories that actually contain photographs get a pill, so the
 * filter bar can never lead somewhere empty. Re-layout runs through GSAP
 * Flip: the DOM changes first, then the tiles animate from where they
 * were to where they now are, instead of snapping.
 */
export default function PortfolioGallery({
  items,
  categories,
}: {
  items: GalleryItem[];
  categories: { key: string; label: string; count: number }[];
}) {
  const [active, setActive] = useState<string>(ALL);
  const gridRef = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  const visible = useMemo(
    () => (active === ALL ? items : items.filter((i) => i.category === active)),
    [items, active]
  );

  useEffect(() => {
    gsap.registerPlugin(Flip);
  }, []);

  // Capture positions before React commits the new list, then play the
  // difference once it has.
  const stateRef = useRef<Flip.FlipState | null>(null);
  const choose = (key: string) => {
    if (key === active) return;
    const tiles = gridRef.current?.querySelectorAll('.shot');
    if (tiles?.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      stateRef.current = Flip.getState(tiles);
    }
    setActive(key);
  };

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const state = stateRef.current;
    stateRef.current = null;
    if (!state || !gridRef.current) return;

    Flip.from(state, {
      duration: 0.62,
      ease: 'power3.inOut',
      scale: true,
      absolute: true,
      stagger: 0.02,
      onEnter: (els) =>
        gsap.fromTo(
          els,
          { opacity: 0, scale: 0.86 },
          { opacity: 1, scale: 1, duration: 0.45, ease: 'power2.out', stagger: 0.02 }
        ),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.86, duration: 0.3, ease: 'power2.in' }),
    });
  }, [active]);

  return (
    <>
      <div className="filters" role="group" aria-label="Filter work by category">
        {[{ key: ALL, label: 'Featured Works', count: items.length }, ...categories].map((c) => (
          <button
            key={c.key}
            type="button"
            className={`filter${active === c.key ? ' is-on' : ''}`}
            aria-pressed={active === c.key}
            onClick={() => choose(c.key)}
          >
            {c.label}
            <span className="filter-count">{c.count}</span>
          </button>
        ))}
      </div>

      <p className="filter-status" role="status" aria-live="polite">
        {visible.length} {visible.length === 1 ? 'project' : 'projects'}
        {active === ALL ? '' : ` in ${categories.find((c) => c.key === active)?.label}`}
      </p>

      <div className="shots" ref={gridRef}>
        {visible.map((item, i) => (
          <figure key={item.id} className="shot">
            <div className="shot-media">
              <Image
                src={item.imageUrl as string}
                alt={`${item.title} — ${item.categoryLabel} by Async Creation, Pune`}
                fill
                sizes="(max-width: 700px) 92vw, (max-width: 1100px) 46vw, 31vw"
                quality={90}
                loading={i < 6 ? 'eager' : 'lazy'}
              />
            </div>
            <figcaption className="shot-cap">
              <span className="shot-cat">{item.categoryLabel}</span>
              <b>{item.title}</b>
            </figcaption>
          </figure>
        ))}
      </div>
    </>
  );
}
