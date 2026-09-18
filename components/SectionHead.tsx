import type { ReactNode } from 'react';

type Props = {
  label: string;
  title: ReactNode;
  lede?: ReactNode;
  /** Heading level — keeps each page's h1→h2→h3 order sequential. */
  as?: 'h1' | 'h2';
};

export default function SectionHead({ label, title, lede, as: Tag = 'h2' }: Props) {
  return (
    <div className="sec-head" data-reveal>
      <div>
        <span className="t-label">{label}</span>
        <Tag className={Tag === 'h1' ? 't-h1' : 't-h2'}>{title}</Tag>
      </div>
      {lede ? <p className="t-lead measure">{lede}</p> : null}
    </div>
  );
}
