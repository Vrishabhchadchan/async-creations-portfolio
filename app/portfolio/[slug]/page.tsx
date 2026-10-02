import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SectionHead from '@/components/SectionHead';
import Breadcrumbs from '@/components/Breadcrumbs';
import WorkNav from '@/components/WorkNav';
import { ShotCard } from '@/components/WorkCards';
import JsonLd from '@/components/JsonLd';
import { pageMetadata } from '@/lib/seo';
import { getManifest } from '@/lib/manifest';
import { SITE_URL, site, services } from '@/lib/site';
import { WORK_SECTIONS, sectionForCategory } from '@/lib/workSections';

// The gallery is team-editable, so revalidate rather than freezing at build.
export const revalidate = 60;
export const dynamicParams = false;

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return WORK_SECTIONS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const section = WORK_SECTIONS.find((s) => s.slug === slug);
  if (!section) return {};

  return pageMetadata({
    title: `${section.name} Portfolio — ${site.name}, ${site.city}`,
    description: `${section.name} work by ${site.name}, ${site.city}: ${section.tagline}`,
    path: `/portfolio/${section.slug}`,
    keywords: [`${section.name.toLowerCase()} ${site.city}`, `${section.name.toLowerCase()} portfolio`],
  });
}

export default async function WorkSectionPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const section = WORK_SECTIONS.find((s) => s.slug === slug);
  if (!section) notFound();

  const service = services.find((s) => s.slug === section.slug);

  // Only this section's work, newest first.
  const shots = (await getManifest())
    .filter((i) => i.imageUrl && sectionForCategory(i.category) === section.slug)
    .sort((a, b) => b.createdAt - a.createdAt);

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ImageGallery',
          name: `${section.name} — ${site.name} Portfolio`,
          description: `${section.name} work by ${site.name}, ${site.city}.`,
          url: `${SITE_URL}/portfolio/${section.slug}`,
          image: shots.slice(0, 12).map((i) => ({
            '@type': 'ImageObject',
            name: i.title,
            contentUrl: i.imageUrl?.startsWith('http') ? i.imageUrl : `${SITE_URL}${i.imageUrl}`,
            description: `${i.title} — ${i.categoryLabel} by ${site.name}, ${site.city}.`,
          })),
        }}
      />

      <section className="page-hero">
        <div className="shell">
          <Breadcrumbs
            trail={[
              { name: 'Portfolio', path: '/portfolio' },
              { name: section.name, path: `/portfolio/${section.slug}` },
            ]}
          />
          <SectionHead
            as="h1"
            label={`${shots.length} ${shots.length === 1 ? 'project' : 'projects'}`}
            title={section.name}
            lede={service?.short ?? section.tagline}
          />
        </div>
      </section>

      <WorkNav items={WORK_SECTIONS.map((s) => ({ slug: s.slug, label: s.name }))} current={section.slug} />

      <section className="section work-page" style={{ paddingTop: 0 }}>
        <div className="shell">
          {shots.length ? (
            <div className="work-grid">
              {shots.map((item, i) => (
                <ShotCard key={item.id} item={item} priority={i < 3} />
              ))}
            </div>
          ) : (
            <p className="t-lead work-empty">Work for this section is being added. Please check back soon.</p>
          )}
        </div>
      </section>
    </>
  );
}
