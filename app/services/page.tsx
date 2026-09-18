import Link from 'next/link';
import type { Metadata } from 'next';
import SectionHead from '@/components/SectionHead';
import Breadcrumbs from '@/components/Breadcrumbs';
import CtaBand from '@/components/CtaBand';
import JsonLd from '@/components/JsonLd';
import { pageMetadata, serviceSchema } from '@/lib/seo';
import { services, site } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: `Services — Photography, Videography, Drone & Branding in ${site.city}`,
  description:
    'Photography, videography, reel creation, drone shoots, real estate shoots, social media management, influencer campaigns, product and food photography, brand identity design, content strategy and motion graphics in Pune.',
  path: '/services',
  keywords: services.flatMap((s) => s.keywords),
});

export default function ServicesPage() {
  return (
    <>
      <JsonLd data={services.map((s) => serviceSchema(s.slug)).filter(Boolean) as object[]} />

      <section className="page-hero">
        <div className="shell">
          <Breadcrumbs trail={[{ name: 'Services', path: '/services' }]} />
          <SectionHead
            as="h1"
            label="What we do"
            title={
              <>
                Ten creative services, run by <span className="italic-serif">one studio</span>
              </>
            }
            lede={`Every service below is delivered in-house from our base in ${site.city} — planned together, shot together and published together, so nothing gets lost between vendors.`}
          />
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="shell">
          {services.map((s, i) => (
            <article key={s.slug} id={s.slug} className="svc-row" data-reveal>
              <div>
                <span className="svc-row-index">Service {String(i + 1).padStart(2, '0')}</span>
                <h2>{s.title}</h2>
                <p className="t-lead" style={{ marginTop: '1rem' }}>
                  {s.short}
                </p>
              </div>

              <div>
                <p style={{ margin: 0, color: 'var(--color-muted)' }}>{s.description}</p>

                <h3 className="t-label" style={{ display: 'block', marginTop: '2rem', marginBottom: '1rem' }}>
                  What you receive
                </h3>
                <ul className="svc-list">
                  {s.deliverables.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>

                <div className="kw-row">
                  {s.keywords.slice(0, 3).map((k) => (
                    <span className="kw" key={k}>
                      {k}
                    </span>
                  ))}
                </div>

                <div style={{ marginTop: '2rem' }}>
                  <Link href="/contact" className="btn btn-ghost">
                    Enquire about {s.title.split(' ')[0].replace('&', '')} work
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <CtaBand
        title={
          <>
            Not sure which of these you <span className="italic-serif">actually need?</span>
          </>
        }
        lede="Tell us the goal rather than the deliverable. We will scope the shortest route to it."
      />
    </>
  );
}
