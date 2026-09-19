import type { ReactNode } from 'react';

type Props = {
  label: string;
  title: ReactNode;
  lede?: ReactNode;
  /** Heading level — keeps each page's h1→h2→h3 order sequential. */
  as?: 'h1' | 'h2';
  /** Oversized outlined numeral behind the head. */
  chapter?: string;
};

export default function SectionHead({ label, title, lede, as: Tag = 'h2', chapter }: Props) {
  return (
    <div className="sec-head">
      {chapter && (
        <span className="chapter" aria-hidden="true">
          {chapter}
        </span>
      )}
      <div>
        <span className="t-label" data-reveal>
          {label}
        </span>
        <span className="label-rule" data-draw aria-hidden="true" />
        <Tag className={Tag === 'h1' ? 't-h1' : 't-h2'} data-split="lines">
          {title}
        </Tag>
      </div>
      {lede ? (
        <p className="t-lead measure" data-reveal>
          {lede}
        </p>
      ) : null}
    </div>
  );
}
