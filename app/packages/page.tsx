import Link from 'next/link';
import type { Metadata } from 'next';
import SectionHead from '@/components/SectionHead';
import CardCorners from '@/components/CardCorners';
import Breadcrumbs from '@/components/Breadcrumbs';
import CtaBand from '@/components/CtaBand';
import PackagesGrid from '@/components/PackagesGrid';
import FaqList from '@/components/FaqList';
import JsonLd from '@/components/JsonLd';
import { pageMetadata } from '@/lib/seo';
import { SITE_URL, site, packages } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: `Packages & Pricing — Content and Social Media Retainers in ${site.city}`,
  description:
    'Transparent monthly packages for photography, videography, reels and social media management in Pune. Retainers from ₹25,000 per month, plus custom project quotes for launches and real estate.',
  path: '/packages',
  keywords: [
    'social media package price Pune',
    'photography package cost Pune',
    'content creation retainer India',
    'videography pricing Maharashtra',
    'monthly content package',
  ],
});

const projectRates = [
  { name: 'Half-day shoot', detail: 'Up to 4 hours, one location, one photographer or videographer.', from: 'From ₹12,000' },
  { name: 'Full-day shoot', detail: 'Up to 9 hours, multiple setups, crew of two with lighting.', from: 'From ₹22,000' },
  { name: 'Drone add-on', detail: '4K aerials added to any shoot day, including flight planning.', from: 'From ₹8,000' },
  { name: 'Real estate project', detail: 'Interiors, exteriors, aerials, walkthrough film and listing creatives.', from: 'From ₹45,000' },
  { name: 'Brand identity', detail: 'Logo, type, colour system and a documented brand guideline.', from: 'From ₹35,000' },
  { name: 'Reel bundle', detail: 'A batch of 6 scripted, shot and edited vertical reels.', from: 'From ₹18,000' },
];

const packageFaqs = [
  {
    q: 'How much does social media management cost in Pune?',
    a: 'Our monthly retainers start at ₹25,000 for the Starter package (1 shoot day, 8 posts and 4 reels) and ₹55,000 for Growth (2 shoot days, 16 posts and 10 reels, plus paid campaign support). Signature packages for launches and developers are quoted per project.',
  },
  {
    q: 'What does a photography or videography shoot day cost?',
    a: 'A half-day shoot starts from ₹12,000 and a full day from ₹22,000, depending on crew, lighting and locations. Drone coverage can be added from ₹8,000, and real estate project packages start from ₹45,000.',
  },
  {
    q: 'Is there a minimum contract period for retainers?',
    a: 'We recommend a three-month minimum because consistency is what makes content work, but we do not lock anyone into long contracts. Retainers are billed monthly and can be paused with notice.',
  },
  {
    q: 'What is included in the price and what costs extra?',
    a: 'Quoted prices include planning, shooting, editing, design and one round of revisions. Travel and stay for outstation shoots, paid ad spend, props, sets, models and licensed music are billed separately and always agreed in writing first.',
  },
  {
    q: 'Do you offer custom packages?',
    a: 'Yes. Most of our work is scoped to the client rather than picked off a list. Share your deliverables, shoot volume and timeline and we will build a package around them.',
  },
];

export default function PackagesPage() {
  return (
    <>
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'OfferCatalog',
            name: `${site.name} packages`,
            url: `${SITE_URL}/packages`,
            itemListElement: packages.map((p) => ({
              '@type': 'Offer',
              name: p.name,
              description: `${p.tagline}. ${p.features.join('. ')}.`,
              priceCurrency: 'INR',
              url: `${SITE_URL}/packages`,
              availability: 'https://schema.org/InStock',
            })),
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: packageFaqs.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          },
        ]}
      />

      <section className="page-hero">
        <div className="shell">
          <Breadcrumbs trail={[{ name: 'Packages', path: '/packages' }]} />
          <SectionHead
            as="h1"
            label="Packages & Pricing"
            title={
              <>
                Clear starting points, <span className="italic-serif">no surprise line items</span>
              </>
            }
            lede="Monthly retainers for brands that publish consistently, and project rates for one-off shoots. Every package is adjusted to your scope after a discovery call."
          />
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="shell">
          <PackagesGrid />
        </div>
      </section>

      <section className="section on-ink">
        <div className="shell">
          <SectionHead
            label="Project rates"
            title={
              <>
                One-off shoots, <span className="italic-serif">priced plainly</span>
              </>
            }
            lede="For brands that need a specific piece of work rather than an ongoing retainer."
          />
          <div className="grid-3" data-cards>
            {projectRates.map((r) => (
              <article key={r.name} className="card svc">
                <CardCorners />
                <h3>{r.name}</h3>
                <p>{r.detail}</p>
                <span className="pkg-price tnum" style={{ fontSize: '1.5rem', marginTop: 'auto' }}>
                  {r.from}
                </span>
              </article>
            ))}
          </div>
          <p className="t-lead" style={{ marginTop: '2.5rem' }} data-reveal>
            Travel, ad spend, props, models and licensed music are billed separately and always agreed in writing before
            the shoot.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <SectionHead
            label="Pricing FAQ"
            title={
              <>
                What people ask about <span className="italic-serif">cost</span>
              </>
            }
          />
          <FaqList items={packageFaqs} />
          <div style={{ marginTop: '3rem' }} data-reveal>
            <Link href="/contact" className="btn btn-primary">
              Request a custom quote
            </Link>
          </div>
        </div>
      </section>

      <CtaBand
        title={
          <>
            Tell us the scope. We will send <span className="italic-serif">a real number.</span>
          </>
        }
        lede="No retainer lock-ins, no hidden line items — a written quote you can plan a budget around."
      />
    </>
  );
}
