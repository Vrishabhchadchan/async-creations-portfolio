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
      <div className="shell cta-band">
        <span className="t-label" data-reveal>
          {site.tagline}
        </span>
        <h2 style={{ marginTop: '1.5rem' }} data-split="lines">
          {title}
        </h2>
        <p className="t-lead measure" style={{ marginInline: 'auto', marginTop: '1.5rem' }} data-reveal>
          {lede}
        </p>
        <div className="cta-actions" data-reveal>
          <Link href="/contact" className="btn btn-primary" data-magnetic>
            Get a Quote
          </Link>
          <a
            href={site.whatsapp}
            className="btn btn-ghost"
            target="_blank"
            rel="noopener noreferrer"
            data-magnetic
          >
            WhatsApp {site.phoneDisplay}
          </a>
        </div>
      </div>

      {/* Oversized tagline marquee closing the page */}
      <div className="cta-marquee marquee" data-marquee="-100" aria-hidden="true">
        {[0, 1].map((d) => (
          <div className="marquee-track" key={d}>
            {['We Create.', 'You Grow.', 'We Create.', 'You Grow.'].map((t, i) => (
              <span key={i} className={i % 2 ? 't-outline' : undefined}>
                {t}
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
