import type { Metadata } from 'next';
import Link from 'next/link';
import SectionHead from '@/components/SectionHead';
import Breadcrumbs from '@/components/Breadcrumbs';
import Testimonials from '@/components/Testimonials';
import JsonLd from '@/components/JsonLd';
import { pageMetadata } from '@/lib/seo';
import { getTestimonials, isVisible } from '@/lib/testimonials';
import { SITE_URL, site } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: `Client Reviews & Testimonials — ${site.name}`,
  description: `Read what clients say about working with ${site.name} in ${site.city}, and share your own experience.`,
  path: '/testimonials',
  keywords: ['client reviews Async Creation', 'photography studio reviews Pune', 'testimonials Async Creation'],
});

// Reviews are team-editable and client-submitted, so revalidate rather
// than freezing at build.
export const revalidate = 60;

export default async function TestimonialsPage() {
  const all = await getTestimonials();
  const items = all.filter(isVisible);
  const avgRating = items.length ? items.reduce((sum, t) => sum + t.rating, 0) / items.length : 0;

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ProfessionalService',
          '@id': `${SITE_URL}/#organization`,
          name: site.name,
          ...(items.length && {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: avgRating.toFixed(1),
              reviewCount: items.length,
            },
            review: items.slice(0, 20).map((t) => ({
              '@type': 'Review',
              author: { '@type': 'Person', name: t.name },
              reviewRating: { '@type': 'Rating', ratingValue: t.rating, bestRating: 5 },
              reviewBody: t.quote,
            })),
          }),
        }}
      />

      <section className="page-hero">
        <div className="shell">
          <Breadcrumbs trail={[{ name: 'Testimonials', path: '/testimonials' }]} />
          <SectionHead
            as="h1"
            label="Client reviews"
            title={
              <>
                Every review, <span className="italic-serif">unfiltered</span>
              </>
            }
            lede={`What it's like to work with ${site.name} — straight from the people we've shot, edited and marketed for.`}
          />
        </div>
      </section>

      <Testimonials items={items} showAll />

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="shell" style={{ textAlign: 'center' }}>
          <p className="t-lead" style={{ marginBottom: '1.5rem' }}>
            Worked with us? We&apos;d love to hear about it.
          </p>
          <Link href="/feedback" className="btn btn-primary">
            Leave a review
          </Link>
        </div>
      </section>
    </>
  );
}
