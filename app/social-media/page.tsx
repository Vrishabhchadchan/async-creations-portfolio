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
  title: `Social Media Management & Influencer Marketing in ${site.city}`,
  description:
    'Monthly social media management, content calendars, campaign planning and influencer and creator management for brands in Pune — strategy, shoots, design, scheduling and reporting in one retainer.',
  path: '/social-media',
  keywords: [
    'social media management Pune',
    'social media agency Maharashtra',
    'influencer marketing agency Pune',
    'creator management India',
    'Instagram marketing services Pune',
    'content calendar agency',
    'digital campaign management India',
  ],
});

const socialScope = [
  { title: 'Strategy & Calendar', body: 'Monthly content pillars, posting cadence and a calendar approved before the month starts — so nothing is made the night before.' },
  { title: 'Shoot Days', body: 'Scheduled photo and video days that produce a full month of posts, reels and stories in one visit.' },
  { title: 'Design & Copy', body: 'Post design, carousels, motion graphics and captions written in your brand voice, not a template.' },
  { title: 'Scheduling & Publishing', body: 'Everything queued and published at the right times, with story sequences planned around launches.' },
  { title: 'Community Management', body: 'Comment and DM replies handled daily, with enquiries routed to your sales team the same day.' },
  { title: 'Paid Campaigns', body: 'Meta and Google campaign setup, creative variants, audience testing and spend reporting against cost per result.' },
];

const influencerScope = [
  { title: 'Creator Shortlisting', body: 'We vet on audience overlap, engagement quality and past brand work — not follower count alone.' },
  { title: 'Briefs & Contracts', body: 'Written briefs, deliverable schedules, contracts and usage rights agreed before a single frame is shot.' },
  { title: 'Content Approvals', body: 'Draft reviews against the brief, so what goes live matches what was agreed.' },
  { title: 'Barter & Paid Deals', body: 'Both models handled, negotiated and settled — including product logistics for barter collaborations.' },
  { title: 'Campaign Reporting', body: 'Reach, saves, shares, click-throughs and enquiries reported per creator, so you know who to rebook.' },
  { title: 'Creator-Led Shoots', body: 'Where it fits, we shoot creator content ourselves for consistent quality across the whole campaign.' },
];

const socialFaqs = [
  {
    q: 'What does a social media management retainer include?',
    a: 'A monthly retainer covers strategy and content calendar, scheduled shoot days, post and reel design, copywriting, scheduling and publishing, community management, and a performance report at the end of each cycle. Paid campaign management is included from the Growth package upward.',
  },
  {
    q: 'How many posts and reels do we get each month?',
    a: 'Our Starter package delivers 8 posts and 4 reels a month, and Growth delivers 16 posts and 10 reels. Volumes are adjusted to your platforms and launch calendar after a discovery call.',
  },
  {
    q: 'Do you handle influencer campaigns as well?',
    a: 'Yes. We manage creator campaigns end to end — shortlisting, briefs, contracts, content approvals, usage rights, barter and paid negotiations, and per-creator performance reporting.',
  },
  {
    q: 'Do we need a separate shoot for social media content?',
    a: 'Usually not. Our retainers include shoot days designed to produce a full month of content in one or two visits, which is what keeps cost per asset low and the feed consistent.',
  },
  {
    q: 'How do you measure whether social media is working?',
    a: 'We report on reach, saves, shares, profile visits, enquiries generated and cost per result for paid campaigns — then use those numbers to shape the next month rather than repeating the same plan.',
  },
];

export default function SocialMediaPage() {
  return (
    <>
      <JsonLd
        data={[
          serviceSchema('social-media-management')!,
          serviceSchema('influencer-creator-management')!,
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: socialFaqs.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          },
        ]}
      />

      <section className="page-hero">
        <div className="shell">
          <Breadcrumbs trail={[{ name: 'Social & Influencer', path: '/social-media' }]} />
          <SectionHead
            as="h1"
            label="Social Media & Influencer Management"
            title={
              <>
                Show up every week, not just at <span className="italic-serif">launch</span>
              </>
            }
            lede={`Managed social media and creator campaigns for brands in ${site.city} and across India — planned, shot, designed, published and reported by one team.`}
          />
          <div className="hero-actions" data-reveal>
            <Link href="/packages" className="btn btn-primary">
              See retainer packages
            </Link>
            <Link href="/contact" className="btn btn-ghost">
              Talk to us
            </Link>
          </div>
        </div>
      </section>

      <section className="section on-ink">
        <div className="shell">
          <SectionHead
            label="Social Media Management"
            title={
              <>
                A content engine, <span className="italic-serif">not a posting service</span>
              </>
            }
            lede="Everything below runs on a monthly cycle, with the calendar approved before the month begins."
          />
          <div className="grid-3" data-reveal-stagger>
            {socialScope.map((s, i) => (
              <article key={s.title} className="card svc">
                <span className="svc-num">{String(i + 1).padStart(2, '0')}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <SectionHead
            label="Influencer & Creator Management"
            title={
              <>
                The right creators, briefed properly, <span className="italic-serif">measured honestly</span>
              </>
            }
            lede="Creator marketing fails when it is bought by follower count. We buy audience fit and report what each collaboration actually returned."
          />
          <div className="grid-3" data-reveal-stagger>
            {influencerScope.map((s, i) => (
              <article key={s.title} className="card svc">
                <span className="svc-num">{String(i + 1).padStart(2, '0')}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <SectionHead
            label="Social & influencer FAQ"
            title={
              <>
                What brands ask <span className="italic-serif">before signing on</span>
              </>
            }
          />
          <FaqList items={socialFaqs} />
        </div>
      </section>

      <CtaBand
        title={
          <>
            Let us take the calendar <span className="italic-serif">off your desk.</span>
          </>
        }
        lede="Tell us your platforms, your launch dates and where you want to be in six months."
      />
    </>
  );
}
