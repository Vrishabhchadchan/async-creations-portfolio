import Link from 'next/link';
import { site, services, nav } from '@/lib/site';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="on-ink site-footer">
      <div className="shell">
        <div className="footer-top">
          <div className="footer-brand">
            <p className="t-label">{site.role}</p>
            <p className="footer-tagline">{site.tagline}</p>
            <p className="t-lead measure">
              {site.name} is a creative content and branding studio in {site.city}, {site.state} — photography,
              videography, drone, social media and brand design under one roof.
            </p>
            <div className="footer-socials">
              {site.socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="footer-social">
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          <nav className="footer-col" aria-label="Services">
            <h2 className="footer-head">Services</h2>
            <ul>
              {services.slice(0, 6).map((s) => (
                <li key={s.slug}>
                  <Link href={`/services#${s.slug}`}>{s.title}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="footer-col" aria-label="Explore">
            <h2 className="footer-head">Explore</h2>
            <ul>
              {nav.map((n) => (
                <li key={n.href}>
                  <Link href={n.href}>{n.label}</Link>
                </li>
              ))}
              <li>
                <Link href="/testimonials">Reviews</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
            </ul>
          </nav>

          <div className="footer-col">
            <h2 className="footer-head">Contact</h2>
            <ul>
              <li>
                <a href={`tel:${site.phone}`}>{site.phoneDisplay}</a>
              </li>
              <li>
                <a href={`tel:${site.altPhone}`}>{site.altPhoneDisplay}</a>
              </li>
              <li>
                <a href={site.mailto} target="_blank" rel="noopener noreferrer" className="break-anywhere">
                  {site.email}
                </a>
              </li>
              <li className="footer-addr">
                {site.city}, {site.state} — shooting across India
              </li>
            </ul>
          </div>
        </div>

        <hr className="rule" />

        <div className="footer-bottom">
          <span>
            &copy; {year} {site.name}. All rights reserved.
          </span>
          <span>
            {site.city} · {site.state} · India
          </span>
        </div>
      </div>
    </footer>
  );
}
