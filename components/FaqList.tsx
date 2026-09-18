import { faqs } from '@/lib/site';

/** Details/summary keeps answers in the DOM at all times, so the copy is
 *  indexed whether or not a panel is open. */
export default function FaqList({ items = faqs }: { items?: { q: string; a: string }[] }) {
  return (
    <div className="faq" data-reveal>
      {items.map((f) => (
        <details key={f.q}>
          <summary>{f.q}</summary>
          <p>{f.a}</p>
        </details>
      ))}
    </div>
  );
}
