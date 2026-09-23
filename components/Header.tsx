'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { nav, site } from '@/lib/site';

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close on route change, and never leave the page locked behind a closed menu.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className={`site-header${solid ? ' is-solid' : ''}`}>
      <div className="shell header-inner">
        <Link href="/" className="brand" aria-label={`${site.name} — home`}>
          <Image
            src="/images/icon/logo-icon-128.png"
            alt=""
            width={34}
            height={34}
            priority
            className="brand-mark"
          />
          <span className="brand-word">
            <b>ASYNC</b>
            <span>Creation</span>
          </span>
        </Link>

        <nav className="nav-desk" aria-label="Primary">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                // Without this the App Router only prefetches as far as the
                // nearest loading boundary, so each click still waits on the
                // route payload. These pages are static and small, and the
                // header is always on screen — fetch them up front.
                prefetch
                className={`nav-link${active ? ' is-active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="header-cta">
          <Link href="/contact" prefetch className="btn btn-primary btn-sm">
            Get a Quote
          </Link>
          <button
            type="button"
            className="nav-toggle"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            <span className={`bars${open ? ' is-open' : ''}`} aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
        </div>
      </div>

      <div id="mobile-nav" className={`mobile-nav${open ? ' is-open' : ''}`} hidden={!open}>
        <nav className="shell mobile-nav-inner" aria-label="Mobile">
          <Link href="/" prefetch className="mobile-link">
            Home
          </Link>
          {nav.map((item) => (
            <Link key={item.href} href={item.href} prefetch className="mobile-link">
              {item.label}
            </Link>
          ))}
          <Link href="/contact" prefetch className="mobile-link">
            Contact
          </Link>
          <a href={site.whatsapp} className="btn btn-primary mobile-cta" target="_blank" rel="noopener noreferrer">
            WhatsApp {site.phoneDisplay}
          </a>
        </nav>
      </div>
    </header>
  );
}
