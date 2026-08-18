const { put, list, del } = require('@vercel/blob');

const MANIFEST_PREFIX = 'gallery/manifest-';

const CATEGORY_LABELS = {
  brand: 'Brand Launch',
  portrait: 'Portraits',
  wedding: 'Weddings',
  event: 'Events',
  fashion: 'Fashion',
};

// Seed data mirrors what shipped in the static HTML before this became
// database-backed, so the live site doesn't visually change on first load.
const SEED_ITEMS = [
  { id: 'seed-1', category: 'brand', title: 'Viksit Bharat — Team On Stage', size: 'big', imageUrl: '/images/work/brand-launch-4.jpg' },
  { id: 'seed-2', category: 'brand', title: 'Live Event Coverage', size: 'tall', imageUrl: '/images/work/brand-launch-5.jpg' },
  { id: 'seed-3', category: 'portrait', title: 'Golden Hour Series', size: 'normal', imageUrl: null, placeholderVariant: 'ph-1' },
  { id: 'seed-4', category: 'wedding', title: 'A Monsoon Wedding', size: 'normal', imageUrl: null, placeholderVariant: 'ph-2' },
  { id: 'seed-5', category: 'event', title: 'Persona Fest — Showstopper Fashion Show', size: 'big', imageUrl: '/images/work/events3.jpg' },
  { id: 'seed-6', category: 'event', title: 'On-Stage Ensemble', size: 'tall', imageUrl: '/images/work/events1.jpg' },
  { id: 'seed-7', category: 'event', title: 'Persona Fest 2026', size: 'normal', imageUrl: '/images/work/events2.jpg' },
  { id: 'seed-8', category: 'event', title: 'Spotlight Moment', size: 'normal', imageUrl: '/images/work/events4.jpg' },
  { id: 'seed-9', category: 'event', title: 'Winning Moment — Closing Ceremony', size: 'wide', imageUrl: '/images/work/events5.jpg' },
  { id: 'seed-10', category: 'fashion', title: 'Studio Edit No.4', size: 'normal', imageUrl: null, placeholderVariant: 'ph-4' },
  { id: 'seed-11', category: 'portrait', title: 'Portrait Diaries', size: 'normal', imageUrl: null, placeholderVariant: 'ph-5' },
  { id: 'seed-12', category: 'brand', title: 'We Create Experiences', size: 'normal', imageUrl: null, placeholderVariant: 'ph-8' },
].map((item) => ({ ...item, categoryLabel: CATEGORY_LABELS[item.category], createdAt: 0 }));

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Vercel's public Blob CDN caches responses by path only (s-maxage=300),
// ignoring query strings entirely — so re-fetching the *same* URL after a
// write can serve a stale copy for up to 5 minutes no matter what cache
// headers the request sends. The fix: never reuse a URL. Every save writes
// a brand-new, never-before-cached file, and reads always take the newest
// one via list() (a control-plane call, not the cached CDN path).
async function listManifestBlobs() {
  const { blobs } = await list({ prefix: MANIFEST_PREFIX, limit: 50 });
  return blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
}

async function getManifest() {
  const blobs = await listManifestBlobs();
  if (blobs.length) {
    try {
      const res = await fetch(blobs[0].url, { cache: 'no-store' });
      if (res.ok) {
        const items = await res.json();
        if (Array.isArray(items)) return items;
      }
    } catch (err) {
      console.error('getManifest: fetch failed', err);
    }
  }
  return saveManifest(SEED_ITEMS);
}

async function saveManifest(items) {
  await put(`${MANIFEST_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 8)}.json`, JSON.stringify(items, null, 2), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
  });

  // Best-effort cleanup of older manifest versions so the store doesn't
  // accumulate files forever. Never blocks or fails the caller.
  listManifestBlobs()
    .then((blobs) => Promise.all(blobs.slice(3).map((b) => del(b.url).catch(() => {}))))
    .catch(() => {});

  return items;
}

// Read-modify-write against shared storage can lose an update if two writes
// overlap. Guard against that by re-reading (from a fresh, never-cached
// file) after every write and, if the change didn't stick, retrying the
// whole cycle against the latest state.
async function updateManifest(mutate, verify) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const current = await getManifest();
    const updated = mutate(current);
    await saveManifest(updated);

    if (attempt > 0) await sleep(300);
    const check = await getManifest();
    if (verify(check)) return check;
  }
  throw new Error('Changes may not have saved reliably — please refresh and try again.');
}

function categoryLabel(category) {
  return CATEGORY_LABELS[category] || category;
}

module.exports = { getManifest, saveManifest, updateManifest, categoryLabel, CATEGORY_LABELS };
