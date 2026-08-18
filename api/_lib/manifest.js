const { put, list } = require('@vercel/blob');

const MANIFEST_PATH = 'gallery/manifest.json';

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

async function findManifestBlob() {
  const { blobs } = await list({ prefix: MANIFEST_PATH, limit: 10 });
  return blobs.find((b) => b.pathname === MANIFEST_PATH) || null;
}

async function getManifest() {
  const existing = await findManifestBlob();
  if (existing) {
    // Cache-bust the query string so a CDN edge cache can't serve a stale
    // copy right after another request just overwrote this same URL.
    const res = await fetch(`${existing.url}?t=${Date.now()}`, { cache: 'no-store' });
    if (res.ok) {
      const items = await res.json();
      if (Array.isArray(items)) return items;
    }
  }
  await saveManifest(SEED_ITEMS);
  return SEED_ITEMS;
}

async function saveManifest(items) {
  await put(MANIFEST_PATH, JSON.stringify(items, null, 2), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

function categoryLabel(category) {
  return CATEGORY_LABELS[category] || category;
}

module.exports = { getManifest, saveManifest, categoryLabel, CATEGORY_LABELS };
