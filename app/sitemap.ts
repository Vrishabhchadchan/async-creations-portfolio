import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const routes: { path: string; priority: number; freq: 'weekly' | 'monthly' }[] = [
    { path: '/', priority: 1, freq: 'weekly' },
    { path: '/services', priority: 0.9, freq: 'monthly' },
    { path: '/real-estate', priority: 0.9, freq: 'monthly' },
    { path: '/social-media', priority: 0.9, freq: 'monthly' },
    { path: '/portfolio', priority: 0.8, freq: 'weekly' },
    { path: '/testimonials', priority: 0.7, freq: 'weekly' },
    { path: '/feedback', priority: 0.3, freq: 'monthly' },
    { path: '/packages', priority: 0.8, freq: 'monthly' },
    { path: '/about', priority: 0.7, freq: 'monthly' },
    { path: '/contact', priority: 0.7, freq: 'monthly' },
  ];

  return routes.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.freq,
    priority: r.priority,
  }));
}
