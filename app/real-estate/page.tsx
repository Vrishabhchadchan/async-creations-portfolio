import Link from 'next/link';
import type { Metadata } from 'next';
import SectionHead from '@/components/SectionHead';
import Breadcrumbs from '@/components/Breadcrumbs';
import CtaBand from '@/components/CtaBand';
import FaqList from '@/components/FaqList';
import JsonLd from '@/components/JsonLd';
import { pageMetadata, serviceSchema } from '@/lib/seo';
import { site } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: `Real Estate Photography, Videography & Branding in ${site.city}`,
  description:
    'Real estate photography, cinematic walkthrough videos, 4K drone aerials and launch branding for builders, developers, architects and agents in Pune and across Maharashtra.',
  path: '/real-estate',
  keywords: [
    'real estate photography Pune',
    'property videography Pune',
    'drone shoot for real estate Maharashtra',
    'builder marketing agency Pune',
    'property walkthrough video India',
    'real estate branding services',
    'architectural photography Pune',
  ],
});

const offerings = [
  {
    title: 'Interior & Exterior Photography',
    body: 'Wide, corrected, naturally lit frames of every room and elevation — shot at the right time of day so the space looks like itself, not like a render.',
  },
  {
    title: 'Cinematic Walkthrough Films',
    body: 'Gimbal-led walkthroughs that move the way a buyer would, cut to a pace that holds attention through the whole unit.',
  },
  {
    title: '4K Drone Aerials',
    body: 'Reveal shots, orbits and top-downs that establish location, scale and surroundings — the context a ground camera cannot show.',
  },
  {
    title: 'Construction Progress Coverage',
    body: 'Scheduled monthly shoots documenting build progress for investor updates, approvals and pre-launch marketing.',
  },
  {
    title: 'Brochures & Listing Creatives',
    body: 'Brochures, hoardings, portal listings and social creatives designed from the same shoot, so every channel matches.',
  },
  {
    title: 'Project Launch Campaigns',
    body: 'The full launch package — teaser films, reels, creator visits and paid campaign assets planned around your booking window.',
  },
];

const audience = [
  'Residential developers and builders',
  'Commercial and retail projects',
  'Architects and interior designers',
  'Real estate agents and brokerages',
  'Co-working and managed spaces',
  'Resorts, villas and holiday homes',
];

const realEstateFaqs = [
  {
    q: 'How long does a real estate shoot take?',
    a: 'A typical 2BHK or 3BHK sample flat takes three to four hours including lighting setup. A full project with exteriors, amenities and drone coverage usually runs one full day, and large townships are split across two days.',
  },
  {
    q: 'Do you provide drone shots for property projects in Pune?',
    a: 'Yes. Drone aerials are included in our real estate packages — reveal shots, orbits, top-down layouts and surrounding-context frames in 4K, with permission-compliant flight planning for the site.',
  },
  {
    q: 'When will we receive the photos and the walkthrough video?',
    a: 'Edited photographs are delivered within five to seven working days. Walkthrough films and drone edits follow within seven to ten working days, with one round of revisions included.',
  },
  {
    q: 'Can you also design the brochure and social media creatives?',
    a: 'Yes. We design brochures, hoardings, portal listings and social creatives from the same shoot, so the photography, layout and messaging stay consistent across every channel.',
  },
  {
    q: 'Do you cover projects outside Pune?',
    a: 'We regularly shoot in Pimpri-Chinchwad, Mumbai, Nashik and Kolhapur, and travel anywhere in India for full project launches. Travel and stay are quoted separately for outstation work.',
  },
];

export default function RealEstatePage() {
  return (
    <>
      <JsonLd
        data={[
          serviceSchema('real-estate')!,
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: realEstateFaqs.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          },
        ]}
      />

      <section className="page-hero">
        <div className="shell">
          <Breadcrumbs trail={[{ name: 'Real Estate Solutions', path: '/real-estate' }]} />
          <SectionHead
            as="h1"
            label="Real Estate Solutions"
            title={
              <>
                Property marketing that starts with <span className="italic-serif">honest photography</span>
              </>
            }
            lede={`A dedicated vertical for builders, developers, architects and agents in ${site.city} — photography, walkthrough films, drone aerials and every launch creative, from one team.`}
          />
          <div className="hero-actions" data-reveal>
            <Link href="/contact" className="btn btn-primary">
              Request a project quote
            </Link>
            <a href={site.whatsapp} className="btn btn-ghost" target="_blank" rel="noopener noreferrer">
              WhatsApp us
            </a>
          </div>
        </div>
      </section>

      <section className="section on-ink">
        <div className="shell">
          <SectionHead
            label="What we deliver"
            title={
              <>
                The full visual package for <span className="italic-serif">a project launch</span>
              </>
            }
            lede="Booked as a complete launch package or as individual shoots, depending on where your project is in its cycle."
          />
          <div className="grid-3" data-cards>
            {offerings.map((o, i) => (
              <article key={o.title} className="card svc">
                <span className="svc-num">{String(i + 1).padStart(2, '0')}</span>
                <h3>{o.title}</h3>
                <p>{o.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell lede-grid">
          <div data-reveal>
            <span className="t-label">Who this is for</span>
            <h2 className="t-h2" style={{ marginTop: '1rem' }}>
              Built for the people who have to <span className="italic-serif">sell the space</span>
            </h2>
            <p className="t-lead" style={{ marginTop: '1.5rem' }}>
              A listing competes against a hundred others on the same portal. What separates the ones that get enquiries
              is rarely the property — it is whether the photography let a buyer picture themselves inside it.
            </p>
          </div>
          <ul className="svc-list" data-reveal style={{ gap: '1rem' }}>
            {audience.map((a) => (
              <li key={a} style={{ fontSize: '1rem' }}>
                {a}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <SectionHead
            label="Real estate FAQ"
            title={
              <>
                What builders ask us <span className="italic-serif">first</span>
              </>
            }
          />
          <FaqList items={realEstateFaqs} />
        </div>
      </section>

      <CtaBand
        title={
          <>
            Let us shoot your next <span className="italic-serif">project launch.</span>
          </>
        }
        lede="Share the project stage, unit count and launch date — we will send a scoped quote and a shoot plan."
      />
    </>
  );
}
