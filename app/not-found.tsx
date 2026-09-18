import Link from 'next/link';
import { nav } from '@/lib/site';

export const metadata = { title: 'Page not found', robots: { index: false, follow: true } };

export default function NotFound() {
  return (
    <section className="page-hero section">
      <div className="shell">
        <span className="t-label">Error 404</span>
        <h1 className="t-h1" style={{ marginTop: '1rem' }}>
          That page moved, or never <span className="italic-serif">existed</span>
        </h1>
        <p className="t-lead measure" style={{ marginTop: '1.5rem' }}>
          The link you followed is no longer here. Everything the studio offers is one of these:
        </p>

        <div className="pill-row">
          <Link href="/" className="pill">
            Home
          </Link>
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="pill">
              {n.label}
            </Link>
          ))}
          <Link href="/contact" className="pill">
            Contact
          </Link>
        </div>

        <div style={{ marginTop: '2.5rem' }}>
          <Link href="/" className="btn btn-primary">
            Back to home
          </Link>
        </div>
      </div>
    </section>
  );
}
