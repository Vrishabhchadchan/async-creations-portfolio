import type { Metadata } from 'next';
import SectionHead from '@/components/SectionHead';
import TestimonialForm from '@/components/TestimonialForm';
import JsonLd from '@/components/JsonLd';
import { pageMetadata } from '@/lib/seo';
import { SITE_URL, site } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: `Leave Feedback — ${site.name}`,
  description: `Share your experience working with ${site.name}. Takes under a minute.`,
  path: '/feedback',
});

export default function FeedbackPage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: `Leave Feedback — ${site.name}`,
          url: `${SITE_URL}/feedback`,
        }}
      />

      <section className="page-hero">
        <div className="shell">
          <SectionHead
            as="h1"
            label="Thank you"
            title={
              <>
                How was your <span className="italic-serif">experience</span>?
              </>
            }
            lede={`Thanks for choosing ${site.name}. Your feedback takes under a minute and helps us keep improving — and helps other clients decide. Every review is checked by our team before it goes live.`}
          />
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="shell" style={{ maxWidth: 640, marginInline: 'auto' }}>
          <div className="card" data-reveal>
            <TestimonialForm />
          </div>
        </div>
      </section>
    </>
  );
}
