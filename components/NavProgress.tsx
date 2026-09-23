'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * A thin progress bar across the top of the page during route changes.
 *
 * A click that shows nothing for a beat reads as broken, even when the
 * wait is short. This acknowledges the click on the same frame, so the
 * navigation feels answered immediately rather than ignored. It matters
 * most in dev, where each route is compiled on first visit.
 */
export default function NavProgress() {
  const [phase, setPhase] = useState<'idle' | 'loading' | 'done'>('idle');
  const pathname = usePathname();
  const startedAt = useRef(0);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      // Ignore anything the browser will handle itself.
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const link = (e.target as HTMLElement | null)?.closest?.('a');
      if (!link) return;
      if (link.target && link.target !== '_self') return;
      if (link.hasAttribute('download')) return;

      const href = link.getAttribute('href');
      if (!href || href.startsWith('#')) return;

      const url = new URL(href, location.href);
      if (url.origin !== location.origin) return;
      // Same page, or a jump to an anchor on it — nothing to wait for.
      if (url.pathname === location.pathname) return;

      startedAt.current = performance.now();
      setPhase('loading');
    };

    // Capture phase: fires before the router's own handler.
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  // The route arrived — fill the bar, then clear it.
  useEffect(() => {
    if (phase !== 'loading') return;
    setPhase('done');
    const t = window.setTimeout(() => setPhase('idle'), 320);
    return () => window.clearTimeout(t);
    // Intentionally keyed on pathname: this runs when navigation completes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return <div className={`nav-progress is-${phase}`} aria-hidden="true" />;
}
