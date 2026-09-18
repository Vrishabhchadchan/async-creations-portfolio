import type { Metadata } from 'next';
import { SITE_URL, site, services, faqs } from './site';

type PageSeo = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
};

/** Builds canonical-correct, OG-complete metadata for a route. */
export function pageMetadata({ title, description, path, keywords }: PageSeo): Metadata {
  const url = `${SITE_URL}${path}`;
  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: site.name,
      locale: 'en_IN',
      type: 'website',
      images: [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: `${site.name} — ${site.role}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${SITE_URL}/opengraph-image`],
    },
  };
}

const ORG_ID = `${SITE_URL}/#organization`;

/** LocalBusiness — the entity Google ranks for "photographer near me" queries. */
export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['ProfessionalService', 'LocalBusiness'],
    '@id': ORG_ID,
    name: site.name,
    legalName: site.legalName,
    url: SITE_URL,
    description: site.description,
    slogan: site.tagline,
    foundingDate: site.founded,
    email: site.email,
    telephone: site.phone,
    priceRange: site.priceRange,
    image: `${SITE_URL}/opengraph-image`,
    logo: { '@type': 'ImageObject', url: `${SITE_URL}/images/icon/logo-icon-400.png` },
    address: {
      '@type': 'PostalAddress',
      addressLocality: site.city,
      addressRegion: site.state,
      postalCode: site.postalCode,
      addressCountry: site.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lng },
    areaServed: site.areaServed.map((name) => ({ '@type': 'Place', name })),
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00',
      closes: '20:00',
    },
    sameAs: site.socials.map((s) => s.href),
    knowsAbout: services.flatMap((s) => s.keywords).slice(0, 25),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Creative content and branding services',
      itemListElement: services.map((s) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: s.title,
          description: s.description,
          url: `${SITE_URL}/services#${s.slug}`,
          areaServed: site.areaServed.join(', '),
          provider: { '@id': ORG_ID },
        },
      })),
    },
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: site.name,
    description: site.description,
    publisher: { '@id': ORG_ID },
    inLanguage: 'en-IN',
  };
}

export function faqSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function serviceSchema(slug: string) {
  const s = services.find((x) => x.slug === slug);
  if (!s) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: s.title,
    description: s.description,
    serviceType: s.title,
    url: `${SITE_URL}/services#${s.slug}`,
    provider: { '@id': ORG_ID },
    areaServed: site.areaServed.map((name) => ({ '@type': 'Place', name })),
  };
}

export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
