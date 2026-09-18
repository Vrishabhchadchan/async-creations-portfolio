import type { Metadata } from 'next';
import SectionHead from '@/components/SectionHead';
import Breadcrumbs from '@/components/Breadcrumbs';
import ContactForm from '@/components/ContactForm';
import JsonLd from '@/components/JsonLd';
import { pageMetadata } from '@/lib/seo';
import { SITE_URL, site } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: `Contact — Get a Quote for Photography & Content in ${site.city}`,
  description:
    'Get a quote from Async Creation in Pune for photography, videography, drone shoots, real estate shoots, reels, social media management or brand design. We reply the same working day.',
  path: '/contact',
  keywords: [
    'contact photographer Pune',
    'get a quote videography Pune',
    'hire content studio Maharashtra',
    'photography enquiry Pune',
  ],
});

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          url: `${SITE_URL}/contact`,
          name: `Contact ${site.name}`,
          mainEntity: {
            '@id': `${SITE_URL}/#organization`,
            '@type': 'ProfessionalService',
            name: site.name,
            telephone: site.phone,
            email: site.email,
            areaServed: site.areaServed.join(', '),
          },
        }}
      />

      <section className="page-hero">
        <div className="shell">
          <Breadcrumbs trail={[{ name: 'Contact', path: '/contact' }]} />
          <SectionHead
            as="h1"
            label="Get a quote"
            title={
              <>
                Tell us what you are building, and <span className="italic-serif">when</span>
              </>
            }
            lede="Share the brief below or message us directly. We reply the same working day with a scope, a timeline and a written quote."
          />
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="shell contact-grid">
          <div data-reveal>
            <h2 className="t-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Reach us directly
            </h2>

            <div className="info-row">
              <b>WhatsApp</b>
              <a href={site.whatsapp} target="_blank" rel="noopener noreferrer">
                {site.phoneDisplay}
              </a>
            </div>
            <div className="info-row">
              <b>Call</b>
              <a href={`tel:${site.altPhone}`}>{site.altPhoneDisplay}</a>
            </div>
            <div className="info-row">
              <b>Email</b>
              <a href={site.mailto} target="_blank" rel="noopener noreferrer" className="break-anywhere">
                {site.email}
              </a>
            </div>
            <div className="info-row">
              <b>Studio</b>
              <span>
                {site.city}, {site.state} — shooting across India
              </span>
            </div>
            <div className="info-row" style={{ borderBottom: 0 }}>
              <b>Hours</b>
              <span>Monday to Saturday, 9am to 8pm</span>
            </div>

            <h2 className="t-label" style={{ display: 'block', margin: '2.5rem 0 1rem' }}>
              Follow the work
            </h2>
            <div className="pill-row" style={{ marginTop: 0 }}>
              {site.socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="pill">
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          <div data-reveal>
            <h2 className="t-h3" style={{ marginBottom: '1.5rem' }}>
              Send us a brief
            </h2>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
