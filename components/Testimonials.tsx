import Link from 'next/link';
import type { TestimonialItem } from '@/lib/testimonials';
import SectionHead from './SectionHead';
import StarRating from './StarRating';

export default function Testimonials({ items, showAll = false }: { items: TestimonialItem[]; showAll?: boolean }) {
  if (!items.length) return null;

  return (
    <section className="section">
      <div className="shell">
        <SectionHead
          label="Testimonials"
          title={
            <>
              What clients say once the <span className="italic-serif">work is live</span>
            </>
          }
          lede="Reviews from clients we have shot, edited and marketed for. Our team curates what appears here in the Team Portal."
        />

        <div className="grid-2" data-cards>
          {items.map((t) => (
            <figure key={t.id} className="card quote">
              <StarRating rating={t.rating} />
              <blockquote className="t-quote">&ldquo;{t.quote}&rdquo;</blockquote>
              <footer>
                <cite>{t.name}</cite>
                {t.role && <span className="role">{t.role}</span>}
              </footer>
            </figure>
          ))}
        </div>

        {!showAll && (
          <div style={{ marginTop: '3rem' }} data-reveal>
            <Link href="/testimonials" className="btn btn-ghost">
              Read all reviews &amp; leave your own
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
