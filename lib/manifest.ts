import { put, list, del } from '@vercel/blob';

const MANIFEST_PREFIX = 'gallery/manifest-';

/**
 * Display order for the portfolio filters. Legacy keys stay in the map
 * below so photos uploaded under the old taxonomy keep a proper label
 * instead of falling back to their raw slug.
 */
export const CATEGORY_ORDER = [
  'photography',
  'wedding',
  'prewedding',
  'drone',
  'corporate',
  'event',
  'film',
  'institutional',
  'travel',
  'social',
  'realestate',
  'product',
  'portrait',
  'fashion',
  'brand',
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  photography: 'Photography',
  wedding: 'Weddings',
  prewedding: 'Pre-Weddings',
  drone: 'Drone & Aerial',
  corporate: 'Corporate & Commercial',
  event: 'Events & Concerts',
  film: 'Cinematic Films & Reels',
  institutional: 'Institutional & Education',
  travel: 'Travel & Lifestyle',
  social: 'Social Media & Brand Content',
  realestate: 'Real Estate',
  product: 'Product & Food',
  // Legacy values — still accepted, still labelled.
  portrait: 'Portraits',
  fashion: 'Fashion',
  brand: 'Brand Launch',
};

export type GalleryItem = {
  id: string;
  category: string;
  categoryLabel: string;
  title: string;
  size: 'normal' | 'big' | 'tall' | 'wide';
  imageUrl: string | null;
  placeholderVariant?: string;
  createdAt: number;
};

const SEED_ITEMS: GalleryItem[] = (
  [
    { id: 'seed-1', category: 'corporate', title: 'Viksit Bharat — Team On Stage', size: 'big', imageUrl: '/images/work/brand-launch-4.jpg' },
    { id: 'seed-2', category: 'event', title: 'Live Event Coverage', size: 'tall', imageUrl: '/images/work/brand-launch-5.jpg' },
    { id: 'seed-5', category: 'event', title: 'Persona Fest — Showstopper Fashion Show', size: 'big', imageUrl: '/images/work/events3.jpg' },
    { id: 'seed-6', category: 'event', title: 'On-Stage Ensemble', size: 'tall', imageUrl: '/images/work/events1.jpg' },
    { id: 'seed-7', category: 'event', title: 'Persona Fest 2026', size: 'normal', imageUrl: '/images/work/events2.jpg' },
    { id: 'seed-8', category: 'event', title: 'Spotlight Moment', size: 'normal', imageUrl: '/images/work/events4.jpg' },
    { id: 'seed-9', category: 'event', title: 'Winning Moment — Closing Ceremony', size: 'wide', imageUrl: '/images/work/events5.jpg' },
    { id: 'seed-13', category: 'corporate', title: 'Brand Launch Coverage', size: 'normal', imageUrl: '/images/work/brand-launch-1.jpg' },
    { id: 'seed-14', category: 'event', title: 'Stage & Audience', size: 'normal', imageUrl: '/images/work/brand-launch-2.jpg' },
    { id: 'seed-15', category: 'corporate', title: 'Event Documentation', size: 'normal', imageUrl: '/images/work/brand-launch-3.jpg' },
  ] as const
).map((item) => ({
  ...item,
  categoryLabel: CATEGORY_LABELS[item.category],
  createdAt: 0,
})) as GalleryItem[];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Vercel's public Blob CDN caches by path only, so re-reading the same URL
// after a write can serve a stale copy for minutes. Every save writes a
// brand-new file and reads always take the newest via list(), which is a
// control-plane call rather than the cached CDN path.
async function listManifestBlobs() {
  const { blobs } = await list({ prefix: MANIFEST_PREFIX, limit: 50 });
  return blobs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
}

export async function getManifest(): Promise<GalleryItem[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return SEED_ITEMS;

  try {
    const blobs = await listManifestBlobs();
    if (blobs.length) {
      const res = await fetch(blobs[0].url, { cache: 'no-store' });
      if (res.ok) {
        const items = await res.json();
        if (Array.isArray(items)) return items;
      }
    }
    return saveManifest(SEED_ITEMS);
  } catch (err) {
    console.error('getManifest failed, serving seed items', err);
    return SEED_ITEMS;
  }
}

export async function saveManifest(items: GalleryItem[]) {
  await put(
    `${MANIFEST_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 8)}.json`,
    JSON.stringify(items, null, 2),
    { access: 'public', contentType: 'application/json', addRandomSuffix: false }
  );

  // Best-effort pruning of old versions. Never blocks the caller.
  listManifestBlobs()
    .then((blobs) => Promise.all(blobs.slice(3).map((b) => del(b.url).catch(() => {}))))
    .catch(() => {});

  return items;
}

// Read-modify-write against shared storage can lose an update when two
// writes overlap, so re-read after every write and retry against the
// latest state if the change did not stick.
export async function updateManifest(
  mutate: (items: GalleryItem[]) => GalleryItem[],
  verifyChange: (items: GalleryItem[]) => boolean
) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const current = await getManifest();
    await saveManifest(mutate(current));

    if (attempt > 0) await sleep(300);
    const check = await getManifest();
    if (verifyChange(check)) return check;
  }
  throw new Error('Changes may not have saved reliably — please refresh and try again.');
}

export function categoryLabel(category: string) {
  return CATEGORY_LABELS[category] || category;
}
