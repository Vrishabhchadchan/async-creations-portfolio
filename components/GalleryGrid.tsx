import Image from 'next/image';
import type { GalleryItem } from '@/lib/manifest';

/** Server-rendered so every project title and alt text is in the HTML. */
export default function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const shown = items.filter((i) => i.imageUrl);

  if (!shown.length) {
    return (
      <div className="card" data-reveal>
        <h3 className="t-h3">Portfolio coming soon</h3>
        <p className="t-lead" style={{ marginTop: '0.75rem' }}>
          New work is being added to this gallery. In the meantime, ask us for the full showreel and recent case
          studies.
        </p>
      </div>
    );
  }

  return (
    <div className="gal" data-reveal-stagger>
      {shown.map((item, i) => (
        <figure key={item.id} className={`gal-item${item.size === 'wide' ? ' is-wide' : ''}`}>
          <Image
            src={item.imageUrl as string}
            alt={`${item.title} — ${item.categoryLabel} photography by Async Creation, Pune`}
            fill
            sizes="(max-width: 767px) 50vw, (max-width: 1199px) 33vw, 25vw"
            loading={i < 4 ? 'eager' : 'lazy'}
            priority={i < 2}
          />
          <figcaption className="gal-cap">
            <span>{item.categoryLabel}</span>
            <b>{item.title}</b>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
