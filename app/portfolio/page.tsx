import type { Metadata } from 'next';
import SectionHead from '@/components/SectionHead';
import Breadcrumbs from '@/components/Breadcrumbs';
import CtaBand from '@/components/CtaBand';
import GalleryGrid from '@/components/GalleryGrid';
import JsonLd from '@/components/JsonLd';
import { pageMetadata } from '@/lib/seo';
import { getManifest } from '@/lib/manifest';
import { SITE_URL, site } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: `Portfolio — Photography & Videography Work in ${site.city}`,
  description:
    'Our work: event coverage, brand launches, fashion shows, portraits and campaign photography shot by Async Creation across Pune and Maharashtra.',
  path: '/portfolio',
  keywords: [
    'photography portfolio Pune',
    'event photography Pune',
    'brand launch photography',
    'fashion show photographer Maharashtra',
    'videography portfolio India',
  ],
});

// The gallery is team-editable, so revalidate rather than freezing at build.
export const revalidate = 60;

export default async function PortfolioPage() {
  const items = await getManifest();
  const withImages = items.filter((i) => i.imageUrl);

  const categories = Array.from(new Set(withImages.map((i) => i.categoryLabel)));

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ImageGallery',
          name: `${site.name} Portfolio`,
          description: 'Photography and videography work by Async Creation, Pune.',
          url: `${SITE_URL}/portfolio`,
          image: withImages.slice(0, 12).map((i) => ({
            '@type': 'ImageObject',
            name: i.title,
            contentUrl: i.imageUrl?.startsWith('http') ? i.imageUrl : `${SITE_URL}${i.imageUrl}`,
            description: `${i.title} — ${i.categoryLabel} by ${site.name}, ${site.city}.`,
          })),
        }}
      />

      <section className="page-hero">
        <div className="shell">
          <Breadcrumbs trail={[{ name: 'Portfolio', path: '/portfolio' }]} />
          <SectionHead
            as="h1"
            label="Our work"
            title={
              <>
                Frames from the <span className="italic-serif">last few shoots</span>
              </>
            }
            lede={`Event coverage, brand launches, fashion shows and campaign photography shot across ${site.city} and Maharashtra. This gallery is updated by our team as new work ships.`}
          />
          {categories.length > 0 && (
            <div className="pill-row" data-reveal style={{ marginTop: 0 }}>
              {categories.map((c) => (
                <span className="pill" key={c}>
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="shell">
          <GalleryGrid items={withImages} />
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
