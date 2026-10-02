'use client';

import { useEffect } from 'react';
import Link from 'next/link';

type Item = { slug: string; label: string };

/**
 * Sticky switcher between the work sections. Each pill is a page of its
 * own; the current one is marked and, on narrow screens where the bar
 * overflows, scrolled to the middle of the bar.
 */
export default function WorkNav({ items, current }: { items: Item[]; current: string }) {
  useEffect(() => {
    // Scroll only the pill bar itself; scrollIntoView could drag the whole
    // page down to the bar on first load.
    const bar = document.querySelector<HTMLElement>('.work-nav-inner');
    const pill = bar?.querySelector<HTMLElement>('a[aria-current="page"]');
    if (!bar || !pill) return;
    bar.scrollTo({ left: pill.offsetLeft - (bar.clientWidth - pill.clientWidth) / 2 });
  }, [current]);

  return (
    <nav className="work-nav" aria-label="Work sections">
      <div className="shell work-nav-inner">
        {items.map((i) => (
          <Link
            key={i.slug}
            href={`/portfolio/${i.slug}`}
            className="work-pill"
            aria-current={current === i.slug ? 'page' : undefined}
          >
            {i.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
