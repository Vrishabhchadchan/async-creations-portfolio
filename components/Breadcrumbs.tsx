import Link from 'next/link';
import JsonLd from './JsonLd';
import { breadcrumbSchema } from '@/lib/seo';

export type Crumb = { name: string; path: string };

/** Visible breadcrumbs plus the matching BreadcrumbList schema —
 *  this is what produces the breadcrumb trail in Google results. */
export default function Breadcrumbs({ trail }: { trail: Crumb[] }) {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: 'Home', path: '/' }, ...trail])} />
      <nav aria-label="Breadcrumb">
        <ol className="crumbs">
          <li>
            <Link href="/">Home</Link>
          </li>
          {trail.map((c, i) => (
            <li key={c.path}>
              {i === trail.length - 1 ? (
                <span aria-current="page">{c.name}</span>
              ) : (
                <Link href={c.path}>{c.name}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
