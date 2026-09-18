import Link from 'next/link';
import { site } from '@/lib/site';

export default function CtaBand({
  title = (
    <>
      Every brand worth remembering started with <span className="italic-serif">one conversation.</span>
    </>
  ),
  lede = 'Tell us what you are building. We will tell you honestly what it needs — and what it does not.',
}: {
  title?: React.ReactNode;
  lede?: string;
}) {
  return (
    <section className="section on-ink">
      <div className="shell cta-band" data-reveal>
        <span className="t-label">{site.tagline}</span>
        <h2 style={{ marginTop: '1.5rem' }}>{title}</h2>
        <p className="t-lead measure" style={{ marginInline: 'auto', marginTop: '1.5rem' }}>
          {lede}
        </p>
        <div className="cta-actions">
          <Link href="/contact" className="btn btn-primary">
            Get a Quote
          </Link>
          <a href={site.whatsapp} className="btn btn-ghost" target="_blank" rel="noopener noreferrer">
            WhatsApp {site.phoneDisplay}
          </a>
        </div>
      </div>
    </section>
  );
}
