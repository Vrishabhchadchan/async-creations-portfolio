import type { Metadata } from 'next';
import SectionHead from '@/components/SectionHead';
import Breadcrumbs from '@/components/Breadcrumbs';
import CtaBand from '@/components/CtaBand';
import PortfolioGallery from '@/components/PortfolioGallery';
import JsonLd from '@/components/JsonLd';
import { pageMetadata } from '@/lib/seo';
import { getManifest, CATEGORY_ORDER, categoryLabel } from '@/lib/manifest';
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

  // Only offer a filter for categories that actually hold photographs,
  // ordered by the taxonomy rather than by upload order.
  const counts = withImages.reduce<Record<string, number>>((acc, i) => {
    acc[i.category] = (acc[i.category] || 0) + 1;
    return acc;
  }, {});

  const known = CATEGORY_ORDER.filter((key) => counts[key]);
  const extra = Object.keys(counts).filter((key) => !CATEGORY_ORDER.includes(key as never));

  const categories = [...known, ...extra].map((key) => ({
    key,
    label: categoryLabel(key),
    count: counts[key],
  }));

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
            lede={`Weddings, events and concerts, drone and aerial, corporate and commercial, travel and brand content — shot across ${site.city} and Maharashtra. This gallery is updated by our team as new work ships.`}
          />
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="shell">
          <PortfolioGallery items={withImages} categories={categories} />
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
