import { put, list, del } from '@vercel/blob';
import { testimonials as seedTestimonials } from '@/lib/site';

const MANIFEST_PREFIX = 'testimonials/manifest-';

export type TestimonialItem = {
  id: string;
  name: string;
  role?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  quote: string;
  createdAt: number;
  // Absent/undefined means visible — new client submissions are created
  // with this explicitly set to false so they wait for admin approval
  // before they can appear on the live site.
  visible?: boolean;
};

/** Whether an item should render on the public site. */
export function isVisible(item: TestimonialItem) {
  return item.visible !== false;
}

const SEED_ITEMS: TestimonialItem[] = seedTestimonials.map((t, i) => ({
  id: `seed-${i + 1}`,
  name: t.name,
  role: t.role,
  rating: 5,
  quote: t.quote,
  createdAt: 0,
  visible: true,
}));

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Same rationale as lib/manifest.ts: Vercel's public Blob CDN caches by
// path, so writes read back through list() (a control-plane call) rather
// than the cached URL.
async function listManifestBlobs() {
  const { blobs } = await list({ prefix: MANIFEST_PREFIX, limit: 50 });
  return blobs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
}

export async function getTestimonials(): Promise<TestimonialItem[]> {
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
    return saveTestimonials(SEED_ITEMS);
  } catch (err) {
    console.error('getTestimonials failed, serving seed items', err);
    return SEED_ITEMS;
  }
}

export async function saveTestimonials(items: TestimonialItem[]) {
  await put(
    `${MANIFEST_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 8)}.json`,
    JSON.stringify(items, null, 2),
    { access: 'public', contentType: 'application/json', addRandomSuffix: false }
  );

  listManifestBlobs()
    .then((blobs) => Promise.all(blobs.slice(3).map((b) => del(b.url).catch(() => {}))))
    .catch(() => {});

  return items;
}

// Read-modify-write against shared storage can lose an update when two
// writes overlap, so re-read after every write and retry against the
// latest state if the change did not stick.
export async function updateTestimonials(
  mutate: (items: TestimonialItem[]) => TestimonialItem[],
  verifyChange: (items: TestimonialItem[]) => boolean
) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const current = await getTestimonials();
    await saveTestimonials(mutate(current));

    if (attempt > 0) await sleep(300);
    const check = await getTestimonials();
    if (verifyChange(check)) return check;
  }
  throw new Error('Changes may not have saved reliably — please refresh and try again.');
}
