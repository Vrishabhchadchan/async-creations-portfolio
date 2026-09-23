import Image from 'next/image';
import type { GalleryItem } from '@/lib/manifest';

/**
 * Magazine-style spread for the home page.
 *
 * A uniform grid of equal tiles gives every photograph the same weight,
 * which is what made this read as a contact sheet. Here a repeating
 * seven-frame rhythm varies column span, aspect ratio and vertical
 * offset, so the eye is led rather than scanned.
 *
 * Server-rendered, so every title and alt text is in the HTML.
 */
export default function GalleryEditorial({ items }: { items: GalleryItem[] }) {
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
    <div className="spread">
      {shown.map((item, i) => (
        <figure key={item.id} className="frame">
          {/* The reveal clips the media box, not the figure: clip-path on
              the figure would also cut off the caption sitting below it. */}
          <div className="frame-media" data-clip data-kenburns>
            <Image
              src={item.imageUrl as string}
              alt={`${item.title} — ${item.categoryLabel} by Async Creation, Pune`}
              fill
              // Frames are wide: undersized sources were the other half of
              // why these looked soft.
              sizes="(max-width: 700px) 92vw, (max-width: 1100px) 60vw, 46vw"
              quality={90}
              loading={i < 3 ? 'eager' : 'lazy'}
              priority={i < 2}
            />
          </div>
          <figcaption className="frame-cap">
            <span className="frame-cat">{item.categoryLabel}</span>
            <b>{item.title}</b>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
