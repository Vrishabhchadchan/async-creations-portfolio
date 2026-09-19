import { testimonials } from '@/lib/site';
import SectionHead from './SectionHead';

export default function Testimonials() {
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
          lede="Results from builders, restaurants and consumer brands we have shot, edited and marketed for."
        />

        <div className="grid-2" data-reveal-stagger>
          {testimonials.map((t) => (
            <figure key={t.name} className="card quote">
              <blockquote className="t-quote">&ldquo;{t.quote}&rdquo;</blockquote>
              <footer>
                <cite>{t.name}</cite>
                <span className="role">{t.role}</span>
              </footer>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
