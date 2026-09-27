import type { Metadata } from 'next';
import SectionHead from '@/components/SectionHead';
import Breadcrumbs from '@/components/Breadcrumbs';
import CtaBand from '@/components/CtaBand';
import { ServiceCard } from '@/components/WorkCards';
import { pageMetadata } from '@/lib/seo';
import { site } from '@/lib/site';
import { WORK_SECTIONS } from '@/lib/workSections';

export const metadata: Metadata = pageMetadata({
  title: `Portfolio — Photography & Videography Work in ${site.city}`,
  description:
    'Our work, service by service: photography and videography, reels, drone shoots, real estate, social media, influencer campaigns, product and food, brand identity, content strategy and motion graphics by Async Creation, Pune.',
  path: '/portfolio',
  keywords: [
    'photography portfolio Pune',
    'event photography Pune',
    'drone videography portfolio',
    'real estate photography Pune',
    'videography portfolio India',
  ],
});

export default function PortfolioPage() {
  return (
    <>
      <section className="page-hero">
        <div className="shell">
          <Breadcrumbs trail={[{ name: 'Portfolio', path: '/portfolio' }]} />
          <SectionHead
            as="h1"
            label="Our work"
            title={
              <>
                Our work, <span className="italic-serif">service by service</span>
              </>
            }
            lede={`Photography, film, drone, real estate, social and brand work — shot across ${site.city} and Maharashtra. Choose a service to see its work.`}
          />
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="shell">
          <div className="work-grid">
            {WORK_SECTIONS.map((section) => (
              <ServiceCard key={section.slug} section={section} href={`/portfolio/${section.slug}`} />
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title={
          <>
            Want your brand in <span className="italic-serif">this gallery?</span>
          </>
        }
        lede="Send us the brief. We will come back with a concept, a shoot plan and a quote."
      />
    </>
  );
}
