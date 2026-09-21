import Link from 'next/link';
import HeroCanvas from '@/components/three/HeroCanvas';
import SectionHead from '@/components/SectionHead';
import CardCorners from '@/components/CardCorners';
import CtaBand from '@/components/CtaBand';
import FaqList from '@/components/FaqList';
import Testimonials from '@/components/Testimonials';
import PackagesGrid from '@/components/PackagesGrid';
import GalleryGrid from '@/components/GalleryGrid';
import JsonLd from '@/components/JsonLd';
import { faqSchema } from '@/lib/seo';
import { getManifest } from '@/lib/manifest';
import { site, services, whyAsync, processSteps as steps, stats } from '@/lib/site';

const MARQUEE = [
  'Photography',
  'Videography',
  'Reels',
  'Drone Shoots',
  'Real Estate',
  'Social Media',
  'Influencer Campaigns',
  'Product & Food',
  'Brand Identity',
  'Motion Graphics',
];

export default async function HomePage() {
  const items = await getManifest();

  return (
    <>
      <JsonLd data={faqSchema()} />

      {/* ---------------- 1. HERO ---------------- */}
      <section className="hero">
        <HeroCanvas />
        <div className="shell hero-inner">
          <div className="hero-copy">
            <p className="t-label hero-eyebrow" data-reveal>
              {site.role} · {site.city}
            </p>
            <h1 className="t-display hero-title">
              <span className="ln" data-split="chars">
                We Create.
              </span>
              <span className="ln t-outline" data-split="chars">
                You Grow.
              </span>
            </h1>
            <p className="t-lead hero-desc" data-split="lines">
              Async Creation is a photography, videography and branding studio in {site.city}. We shoot it, cut it,
              design it and run the campaign — so your brand shows up everywhere looking like it means it.
            </p>
            <div className="hero-actions" data-reveal>
              <Link href="/portfolio" className="btn btn-primary" data-magnetic>
                See our work
              </Link>
              <Link href="/contact" className="btn btn-ghost" data-magnetic>
                Get a quote
              </Link>
            </div>
          </div>

          <div className="hero-meta">
            {stats.map((s) => (
              <div key={s.label}>
                <b className="tnum">
                  <span data-count={s.value}>{s.value}</span>
                  {s.suffix}
                </b>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- MARQUEE ---------------- */}
      <div className="strip" data-marquee="-100">
        <div className="marquee">
          {[0, 1].map((dup) => (
            <div className="marquee-track" key={dup} aria-hidden={dup === 1}>
              {MARQUEE.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ---------------- 2. ABOUT ---------------- */}
      <section className="section" id="about" data-bg="sand">
        <div className="shell lede-grid">
          <div>
            <span className="t-label" data-reveal>
              About the studio
            </span>
            <span className="label-rule" data-draw aria-hidden="true" />
            <h2 className="t-h2" data-split="lines">
              A content studio that thinks like a <span className="italic-serif">brand partner</span>
            </h2>
          </div>
          <div data-reveal>
            <p className="t-lead" data-highlight>
              Most brands do not have a content problem. They have a consistency problem — a great shoot in January and
              silence until June.
            </p>
            <p className="t-lead" style={{ marginTop: '1.25rem' }}>
              Async Creation was built to close that gap. Strategy, photography, video, design and distribution sit in
              one team, so what gets planned actually gets made, and what gets made actually gets published. We work
              with builders, restaurants, D2C labels and service brands across {site.city} and the rest of India.
            </p>
            <div className="pill-row">
              {['Founder-led', 'In-house production', 'Strategy first', 'Reported on results'].map((p) => (
                <span className="pill" key={p}>
                  {p}
                </span>
              ))}
            </div>
            <div style={{ marginTop: '2.5rem' }}>
              <Link href="/about" className="btn btn-ghost">
                More about us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- STATEMENT ---------------- */}
      <section className="section statement" data-bg="bone">
        <div className="shell">
          <p className="t-label" data-reveal>
            The belief
          </p>
          <p className="statement-text t-quote" data-highlight>
            A brand is not what you say about yourself. It is what people remember after the scroll — the one frame that
            stayed, the film that made them call, the feed that finally looked like it meant something. We make the
            things worth remembering.
          </p>
          <div className="statement-marks" aria-hidden="true">
            <span data-from="left" data-from-distance="90">
              Shoot
            </span>
            <span data-from="bottom" data-from-distance="70">
              Edit
            </span>
            <span data-from="top" data-from-distance="70">
              Design
            </span>
            <span data-from="right" data-from-distance="90">
              Publish
            </span>
          </div>
        </div>
      </section>

      {/* ---------------- 3. SERVICES ---------------- */}
      {/* ScrollTrigger's pin wraps its target in a .pin-spacer div. If the
          target were this <section> — a direct child of <main> — React
          would later try to remove it from <main> and fail, because its
          real parent had become the spacer. Pinning the inner wrapper
          keeps that reparenting inside a subtree React removes wholesale. */}
      <section className="section on-ink hsection" id="services">
        <div className="hsection-inner" data-hscroll>
          <div className="shell">
            <SectionHead
              chapter="01"
              variant="alt"
              label="Services"
              title={
                <>
                  Ten services, <span className="italic-serif">one pipeline</span>
                </>
              }
              lede="From the first strategy call to the final published reel — every part of the process is handled in-house."
            />
          </div>

          <div className="htrack-wrap">
            <div className="htrack">
              {services.map((s) => (
                <Link key={s.slug} href={`/services#${s.slug}`} className="card svc hcard">
                  <CardCorners />
                  <h3>{s.title}</h3>
                  <p>{s.short}</p>
                  <span className="hcard-go" aria-hidden="true">
                    →
                  </span>
                </Link>
              ))}
              <Link href="/services" className="card hcard hcard-cta">
                <h3>
                  See every <span className="italic-serif">service</span>
                </h3>
                <span className="btn btn-primary">Explore all services</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- 4. PORTFOLIO ---------------- */}
      <section className="section" id="work" data-bg="cream">
        <div className="shell">
          <SectionHead
            chapter="02"
            label="Portfolio"
            title={
              <>
                Recent work through <span className="italic-serif">our lens</span>
              </>
            }
            lede="Event coverage, brand launches and campaign photography shot across Pune and Maharashtra."
          />
          <GalleryGrid items={items.slice(0, 8)} />
          <div style={{ marginTop: '3rem' }} data-reveal>
            <Link href="/portfolio" className="btn btn-ghost">
              View the full portfolio
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- 5. REAL ESTATE ---------------- */}
      <section className="section on-ink" id="real-estate">
        <div className="shell lede-grid">
          <div data-from="left">
            <span className="t-label">Real Estate Solutions</span>
            <h2 className="t-h2" style={{ marginTop: '1rem' }}>
              Properties sell faster when they <span className="italic-serif">photograph honestly</span>
            </h2>
            <p className="t-lead" data-highlight style={{ marginTop: '1.5rem' }}>
              A dedicated vertical for builders, developers, architects and agents in Pune — interiors, exteriors, drone
              aerials, cinematic walkthroughs and every launch creative that carries them to market.
            </p>
            <div style={{ marginTop: '2.5rem' }}>
              <Link href="/real-estate" className="btn btn-primary">
                Real estate solutions
              </Link>
            </div>
          </div>
          <ul className="svc-list" data-from="right" style={{ gap: '1rem' }}>
            {[
              'Interior and exterior property photography',
              '4K drone aerials and site reveal shots',
              'Cinematic walkthrough films for listings',
              'Construction progress documentation',
              'Brochures, hoardings and listing creatives',
              'Project launch campaigns end to end',
            ].map((f) => (
              <li key={f} style={{ fontSize: '1rem' }}>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------- 6. SOCIAL & INFLUENCER ---------------- */}
      <section className="section" id="social" data-bg="blush">
        <div className="shell">
          <SectionHead
            chapter="03"
            label="Social Media & Influencer"
            title={
              <>
                A feed that runs <span className="italic-serif">every month</span>
              </>
            }
            lede="Managed social media, campaign planning and creator-led collaborations — briefed properly and measured honestly."
          />
          <div className="grid-2">
            <article className="card svc" data-from="left" data-from-distance="80">
              <CardCorners />
              <h3>Social Media Management</h3>
              <p>
                Monthly calendars, shoot days, design, copywriting, scheduling and community replies — with reporting at
                the end of every cycle.
              </p>
              <ul className="svc-list">
                {['Content calendar and strategy', 'Design and copywriting', 'Scheduling and community management', 'Paid campaign support'].map(
                  (f) => (
                    <li key={f}>{f}</li>
                  )
                )}
              </ul>
            </article>
            <article className="card svc" data-from="right" data-from-distance="80">
              <CardCorners />
              <h3>Influencer & Creator Management</h3>
              <p>
                We match creators to your audience rather than their follower count, and report on what each one
                actually returned.
              </p>
              <ul className="svc-list">
                {['Creator shortlisting and vetting', 'Briefs, contracts and approvals', 'Usage rights handling', 'Per-creator performance reporting'].map(
                  (f) => (
                    <li key={f}>{f}</li>
                  )
                )}
              </ul>
            </article>
          </div>
          <div style={{ marginTop: '3rem' }} data-reveal>
            <Link href="/social-media" className="btn btn-ghost">
              Social &amp; influencer services
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- 7. WHY ASYNC ---------------- */}
      <section className="section on-ink" id="why">
        <div className="shell">
          <SectionHead
            chapter="04"
            variant="alt"
            label="Why Async Creation"
            title={
              <>
                Six reasons brands <span className="italic-serif">stay with us</span>
              </>
            }
            lede="What actually changes when one studio owns the whole pipeline instead of three vendors owning a third each."
          />
          <div className="grid-3" data-cards>
            {whyAsync.map((w, i) => (
              <article key={w.title} className="card svc">
                <CardCorners />
                <h3>{w.title}</h3>
                <p>{w.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- PROCESS ---------------- */}
      <section className="section" data-bg="moss">
        <div className="shell">
          <SectionHead
            chapter="05"
            label="How we work"
            title={
              <>
                From first call to <span className="italic-serif">final delivery</span>
              </>
            }
            lede="Five stages, agreed upfront, with a preview at the end of each one."
          />
          <div data-stack className="stack">
            {steps.map((s) => (
              <article key={s.step} className="card stack-card">
                <span className="stack-num">{s.step}</span>
                <h3 className="t-h3">{s.title}</h3>
                <p>{s.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- 8. PACKAGES ---------------- */}
      <section className="section on-ink" id="packages">
        <div className="shell">
          <SectionHead
            chapter="06"
            label="Packages"
            title={
              <>
                Retainers that scale with <span className="italic-serif">your calendar</span>
              </>
            }
            lede="Transparent starting points. Every package is adjusted to your shoot volume and deliverables after a discovery call."
          />
          <PackagesGrid />
          <p className="t-lead" style={{ marginTop: '2.5rem' }} data-from="bottom">
            Need something outside these tiers?{' '}
            <Link href="/contact" style={{ textDecoration: 'underline' }}>
              Ask for a custom quote
            </Link>
            .
          </p>
        </div>
      </section>

      {/* ---------------- 9. TESTIMONIALS ---------------- */}
      <Testimonials />

      {/* ---------------- FAQ ---------------- */}
      <section className="section">
        <div className="shell">
          <SectionHead
            chapter="07"
            label="FAQ"
            title={
              <>
                Questions we get <span className="italic-serif">before every project</span>
              </>
            }
            lede="Still unsure about scope, timelines or pricing? Ask us directly — we answer the same day."
          />
          <FaqList />
        </div>
      </section>

      {/* ---------------- 10. CTA ---------------- */}
      <CtaBand />
    </>
  );
}
