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
  droneshoot: 'Drone & Aerial',
  // Legacy / fallback labels
  product: 'Photography',
  influencer: 'Social Media & Brand Content',
  branding: 'Corporate & Commercial',
  strategy: 'Corporate & Commercial',
  motion: 'Cinematic Films & Reels',
  portrait: 'Photography',
  fashion: 'Photography',
  brand: 'Corporate & Commercial',
};

export const LEGACY_CATEGORY_MAP: Record<string, { category: string; label: string }> = {
  brand: { category: 'corporate', label: 'Corporate & Commercial' },
  branding: { category: 'corporate', label: 'Corporate & Commercial' },
  strategy: { category: 'corporate', label: 'Corporate & Commercial' },
  corporate: { category: 'corporate', label: 'Corporate & Commercial' },

  fashion: { category: 'photography', label: 'Photography' },
  portrait: { category: 'photography', label: 'Photography' },
  portraits: { category: 'photography', label: 'Photography' },
  product: { category: 'photography', label: 'Photography' },
  photography: { category: 'photography', label: 'Photography' },

  event: { category: 'event', label: 'Events & Concerts' },
  events: { category: 'event', label: 'Events & Concerts' },

  drone: { category: 'drone', label: 'Drone & Aerial' },
  droneshoot: { category: 'drone', label: 'Drone & Aerial' },

  film: { category: 'film', label: 'Cinematic Films & Reels' },
  motion: { category: 'film', label: 'Cinematic Films & Reels' },

  social: { category: 'social', label: 'Social Media & Brand Content' },
  influencer: { category: 'social', label: 'Social Media & Brand Content' },

  wedding: { category: 'wedding', label: 'Weddings' },
  weddings: { category: 'wedding', label: 'Weddings' },
  prewedding: { category: 'prewedding', label: 'Pre-Weddings' },
  'pre-wedding': { category: 'prewedding', label: 'Pre-Weddings' },

  institutional: { category: 'institutional', label: 'Institutional & Education' },
  education: { category: 'institutional', label: 'Institutional & Education' },

  travel: { category: 'travel', label: 'Travel & Lifestyle' },
  lifestyle: { category: 'travel', label: 'Travel & Lifestyle' },

  realestate: { category: 'realestate', label: 'Real Estate' },
  'real-estate': { category: 'realestate', label: 'Real Estate' },
};

export function normalizeItem(item: GalleryItem): GalleryItem {
  const mapping = LEGACY_CATEGORY_MAP[item.category];
  const category = mapping ? mapping.category : item.category;
  let categoryLabel = mapping ? mapping.label : (CATEGORY_LABELS[category] || item.categoryLabel || category);

  let finalCategory = category;
  if (item.id === 'seed-2' || (item.title && item.title.toLowerCase().includes('live event'))) {
    finalCategory = 'event';
    categoryLabel = 'Events & Concerts';
  }

  return {
    ...item,
    category: finalCategory,
    categoryLabel,
    size: 'normal',
  };
}

export type GalleryItem = {
  id: string;
  category: string;
  categoryLabel: string;
  title: string;
  size: 'normal' | 'big' | 'tall' | 'wide';
  /** For images: the image URL. For videos: the poster/thumbnail URL (may be null). */
  imageUrl: string | null;
  /** Present only for video items — the URL of the uploaded video file. */
  videoUrl?: string | null;
  /** 'image' (default, keeps backwards-compat) or 'video'. */
  mediaType?: 'image' | 'video';
  placeholderVariant?: string;
  createdAt: number;
  visible?: boolean;
  onHome?: boolean;
};

/** Whether an item should render on the public site. */
export function isVisible(item: GalleryItem) {
  return item.visible !== false;
}

/** How many images the home page's recent-work glimpse shows. */
export const HOME_MAX = 6;

/** Whether the team has picked this item for the home page. */
export function isOnHome(item: GalleryItem) {
  return item.onHome === true;
}

/**
 * Images for the home page glimpse: the team's picks (in gallery order), up
 * to HOME_MAX. Until anything has been picked it falls back to the newest
 * uploads so the section is never empty.
 */
export function pickHomeItems(items: GalleryItem[]): GalleryItem[] {
  const usable = items.filter((i) => (i.imageUrl || i.mediaType === 'video') && isVisible(i));
  const picked = usable.filter(isOnHome);
  if (picked.length) return picked.slice(0, HOME_MAX);
  return [...usable].sort((a, b) => b.createdAt - a.createdAt).slice(0, HOME_MAX);
}

const SEED_ITEMS: GalleryItem[] = [
  {
    id: 'seed-photo-1',
    category: 'photography',
    categoryLabel: 'Photography',
    title: 'Editorial & Fashion Portraiture',
    size: 'normal',
    imageUrl: '/images/work/service-photo.jpg',
    createdAt: 14,
    onHome: true,
  },
  {
    id: 'seed-1',
    category: 'corporate',
    categoryLabel: 'Corporate & Commercial',
    title: 'Viksit Bharat — Team On Stage',
    size: 'normal',
    imageUrl: '/images/work/brand-launch-4.jpg',
    createdAt: 13,
    onHome: true,
  },
  {
    id: 'seed-drone-1',
    category: 'drone',
    categoryLabel: 'Drone & Aerial',
    title: 'Cinematic Aerial Survey & Landscapes',
    size: 'normal',
    imageUrl: '/images/work/service-drone.jpg',
    createdAt: 12,
    onHome: true,
  },
  {
    id: 'seed-film-1',
    category: 'film',
    categoryLabel: 'Cinematic Films & Reels',
    title: 'Commercial Film Production & Color Grading',
    size: 'normal',
    imageUrl: '/images/work/service-cine.jpg',
    createdAt: 11,
    onHome: true,
  },
  {
    id: 'seed-2',
    category: 'event',
    categoryLabel: 'Events & Concerts',
    title: 'Live Cultural Concert Coverage',
    size: 'normal',
    imageUrl: '/images/work/brand-launch-5.jpg',
    createdAt: 10,
    onHome: true,
  },
  {
    id: 'seed-5',
    category: 'event',
    categoryLabel: 'Events & Concerts',
    title: 'Persona Fest — Showstopper Fashion Show',
    size: 'normal',
    imageUrl: '/images/work/events3.jpg',
    createdAt: 9,
    onHome: true,
  },
  {
    id: 'seed-social-1',
    category: 'social',
    categoryLabel: 'Social Media & Brand Content',
    title: 'Dynamic Social Media Content & Reels',
    size: 'normal',
    imageUrl: '/images/work/service-reels.jpg',
    createdAt: 8,
  },
  {
    id: 'seed-13',
    category: 'corporate',
    categoryLabel: 'Corporate & Commercial',
    title: 'Visual Identity & Brand Campaign',
    size: 'normal',
    imageUrl: '/images/work/brand-launch-1.jpg',
    createdAt: 7,
  },
  {
    id: 'seed-6',
    category: 'event',
    categoryLabel: 'Events & Concerts',
    title: 'On-Stage Ensemble & Lighting',
    size: 'normal',
    imageUrl: '/images/work/events1.jpg',
    createdAt: 6,
  },
  {
    id: 'seed-7',
    category: 'event',
    categoryLabel: 'Events & Concerts',
    title: 'Persona Fest 2026 Live Performance',
    size: 'normal',
    imageUrl: '/images/work/events2.jpg',
    createdAt: 5,
  },
  {
    id: 'seed-8',
    category: 'event',
    categoryLabel: 'Events & Concerts',
    title: 'Spotlight Moment — Stage Finale',
    size: 'normal',
    imageUrl: '/images/work/events4.jpg',
    createdAt: 4,
  },
  {
    id: 'seed-9',
    category: 'event',
    categoryLabel: 'Events & Concerts',
    title: 'Winning Moment — Closing Ceremony',
    size: 'normal',
    imageUrl: '/images/work/events5.jpg',
    createdAt: 3,
  },
  {
    id: 'seed-14',
    category: 'corporate',
    categoryLabel: 'Corporate & Commercial',
    title: 'Corporate Conference & Keynote',
    size: 'normal',
    imageUrl: '/images/work/brand-launch-2.jpg',
    createdAt: 2,
  },
  {
    id: 'seed-15',
    category: 'corporate',
    categoryLabel: 'Corporate & Commercial',
    title: 'Executive Summit Documentation',
    size: 'normal',
    imageUrl: '/images/work/brand-launch-3.jpg',
    createdAt: 1,
  },
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function listManifestBlobs() {
  const { blobs } = await list({ prefix: MANIFEST_PREFIX, limit: 50 });
  return blobs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
}

export async function getManifest(): Promise<GalleryItem[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return SEED_ITEMS.map(normalizeItem);

  try {
    const blobs = await listManifestBlobs();
    if (blobs.length) {
      const res = await fetch(blobs[0].url, { cache: 'no-store' });
      if (res.ok) {
        const items = await res.json();
        if (Array.isArray(items)) {
          // Normalize every item to the proper category, label, and clean size
          return items.map(normalizeItem);
        }
      }
    }
    return saveManifest(SEED_ITEMS.map(normalizeItem));
  } catch (err) {
    console.error('getManifest failed, serving seed items', err);
    return SEED_ITEMS.map(normalizeItem);
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
