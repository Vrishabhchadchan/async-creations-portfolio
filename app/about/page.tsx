import Image from 'next/image';
import type { Metadata } from 'next';
import SectionHead from '@/components/SectionHead';
import Breadcrumbs from '@/components/Breadcrumbs';
import CtaBand from '@/components/CtaBand';
import JsonLd from '@/components/JsonLd';
import { pageMetadata } from '@/lib/seo';
import { SITE_URL, site, team, whyAsync, processSteps, stats } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: `About — Creative Content & Branding Studio in ${site.city}`,
  description:
    'Async Creation is a founder-led creative content and branding studio in Pune. Meet the team behind the photography, videography, social media and brand work.',
  path: '/about',
  keywords: [
    'creative studio Pune',
    'about Async Creation',
    'photography team Pune',
    'branding agency Maharashtra',
    'content studio founders Pune',
  ],
});

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={team.map((m) => ({
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: m.name,
          jobTitle: m.role,
          image: `${SITE_URL}${m.photo}`,
          worksFor: { '@id': `${SITE_URL}/#organization` },
          knowsAbout: m.skills,
          address: { '@type': 'PostalAddress', addressLocality: site.city, addressRegion: site.state },
        }))}
      />

      <section className="page-hero">
        <div className="shell">
          <Breadcrumbs trail={[{ name: 'About', path: '/about' }]} />
          <SectionHead
            as="h1"
            label="About the studio"
            title={
              <>
                A small team that would rather <span className="italic-serif">own the whole thing</span>
              </>
            }
            lede={`Async Creation is a creative content and branding studio based in ${site.city}, ${site.state}. We handle strategy, photography, video, design and distribution in-house — because work suffers most in the gaps between vendors.`}
          />
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="shell lede-grid">
          <div data-reveal>
            <h2 className="t-h3">Why we started</h2>
            <p className="t-lead" style={{ marginTop: '1rem' }}>
              We kept meeting good brands with the same problem: a great shoot once a year, a designer somewhere else, an
              agency posting content nobody on the team had seen. The output was fine. The consistency was not.
            </p>
          </div>
          <div data-reveal>
            <h2 className="t-h3">What we do differently</h2>
            <p className="t-lead" style={{ marginTop: '1rem' }}>
              One team plans the campaign, shoots it, edits it, designs around it and publishes it. That means fewer
              briefs lost in translation, a faster turnaround, and a body of work that looks like it came from the same
              brand — because it did.
            </p>
          </div>
        </div>
      </section>

      <section className="section on-ink">
        <div className="shell">
          <div className="stat-grid" data-reveal-stagger>
            {stats.map((s) => (
              <div className="stat" key={s.label}>
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

      <section className="section">
        <div className="shell">
          <SectionHead
            label="Studio leadership"
            title={
              <>
                The directors behind <span className="italic-serif">Async Creation</span>
              </>
            }
            lede="Two specialists, one vision — and the same two people you will meet on your shoot day."
          />

          <div className="grid-2" data-cards>
            {team.map((m) => (
              <article key={m.name} className="card">
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <Image
                    src={m.photo}
                    alt={`${m.name}, ${m.role} at ${site.name}`}
                    width={84}
                    height={84}
                    style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                  />
                  <div>
                    <h3 className="t-h3">{m.name}</h3>
                    <span className="t-label">{m.role}</span>
                  </div>
                </div>

                <p style={{ color: 'var(--color-muted)', margin: 0 }}>{m.bio}</p>

                <div className="hero-meta" style={{ marginTop: '2rem', paddingTop: '1.5rem', gap: '2rem' }}>
                  {m.meta.map((x) => (
                    <div key={x.v}>
                      <b style={{ fontSize: '1.4rem' }}>{x.k}</b>
                      <span>{x.v}</span>
                    </div>
                  ))}
                </div>

                <div className="kw-row">
                  {m.skills.map((s) => (
                    <span className="kw" key={s}>
                      {s}
                    </span>
                  ))}
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--color-muted)', marginTop: '1.5rem' }}>{m.note}</p>

                <a href={`tel:${m.phone}`} className="btn btn-ghost" style={{ marginTop: '1.5rem' }}>
                  Call {m.name.split(' ')[0]}
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section on-ink">
        <div className="shell">
          <SectionHead
            label="How we work"
            title={
              <>
                From first call to <span className="italic-serif">final delivery</span>
              </>
            }
            lede="Five stages, agreed upfront, with a preview at the end of each one."
          />
          <div data-reveal-stagger>
            {processSteps.map((s) => (
              <article key={s.step} className="step">
                <span className="step-num">{s.step}</span>
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
            label="Why Async Creation"
            title={
              <>
                Six reasons brands <span className="italic-serif">stay with us</span>
              </>
            }
          />
          <div className="grid-3" data-cards>
            {whyAsync.map((w, i) => (
              <article key={w.title} className="card svc">
                <span className="svc-num">{String(i + 1).padStart(2, '0')}</span>
                <h3>{w.title}</h3>
                <p>{w.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
