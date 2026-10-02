import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { GalleryItem } from '@/lib/manifest';
import type { WorkSection } from '@/lib/workSections';

const SIZES = '(max-width: 700px) 92vw, (max-width: 1100px) 46vw, 442px';

function cardStyle(section: WorkSection): CSSProperties {
  return {
    '--art': section.art.css,
    '--accent-a': section.accent[0],
    '--accent-b': section.accent[1],
  } as CSSProperties;
}

function Art({ section, coverImage }: { section: WorkSection; coverImage?: string | null }) {
  const imageSrc = coverImage || section.art.src;
  return (
    <div className="wcard-art" aria-hidden="true">
      {imageSrc && (
        <Image
          src={imageSrc}
          alt=""
          fill
          sizes={SIZES}
          quality={85}
          style={{ objectFit: 'cover', objectPosition: section.art.position || 'center' }}
        />
      )}
    </div>
  );
}

/**
 * Service card: an oversized condensed title over the artwork, then the
 * service name, a one-line promise and a button into that service's
 * section on the work page. The whole card is the click target.
 */
export function ServiceCard({
  section,
  href,
  coverImage,
}: {
  section: WorkSection;
  href: string;
  coverImage?: string | null;
}) {
  return (
    <article className="wcard" style={cardStyle(section)}>
      <Art section={section} coverImage={coverImage} />
      {section.cutout && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="wcard-cutout" src={section.cutout} alt="" loading="lazy" />
      )}
      <p className="wcard-mega" aria-hidden="true">
        {section.mega}
      </p>
      <div className="wcard-body">
        <h3 className="wcard-name">{section.name}</h3>
        <p className="wcard-tag">{section.tagline}</p>
        <Link href={href} className="wcard-btn">
          View Details
          <span className="wcard-sr"> — {section.name} work</span>
        </Link>
      </div>
    </article>
  );
}

/** A piece of uploaded work, at exactly the same size as a service card. */
export function ShotCard({ item, priority = false }: { item: GalleryItem; priority?: boolean }) {
  return (
    <figure className="wcard wcard-shot">
      <div className="wcard-art">
        <Image
          src={item.imageUrl as string}
          alt={`${item.title} — ${item.categoryLabel} by Async Creation, Pune`}
          fill
          sizes={SIZES}
          quality={88}
          priority={priority}
        />
      </div>
      <figcaption className="wcard-body">
        <span className="wcard-cat">{item.categoryLabel}</span>
        <b className="wcard-shot-title">{item.title}</b>
      </figcaption>
    </figure>
  );
}
