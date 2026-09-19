import Link from 'next/link';
import { packages } from '@/lib/site';

export default function PackagesGrid() {
  return (
    <div className="grid-3" data-cards>
      {packages.map((p) => (
        <div key={p.name} className="pkg-wrap">
          {p.featured && <span className="pkg-badge">{p.cta}</span>}
          <article className={`card pkg${p.featured ? ' is-featured' : ''}`}>
            <div>
              <h3 className="t-h3">{p.name}</h3>
              <p className="pkg-tag">{p.tagline}</p>
            </div>
            <div>
              <span className="pkg-price tnum">{p.price}</span>
              <span className="pkg-period">{p.period}</span>
            </div>
            <ul className="svc-list">
              {p.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <Link href="/contact" className={`btn ${p.featured ? 'btn-primary' : 'btn-ghost'}`}>
              {p.featured ? 'Get started' : p.cta}
            </Link>
          </article>
        </div>
      ))}
    </div>
  );
}
