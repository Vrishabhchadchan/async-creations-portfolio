const { sql } = require('@vercel/postgres');

const CATEGORY_LABELS = {
  photography: 'Photography',
  weddings: 'Weddings',
  'pre-weddings': 'Pre-Weddings',
  'drone-aerial': 'Drone & Aerial',
  'corporate-commercial': 'Corporate & Commercial',
  'events-concerts': 'Events & Concerts',
  'cinematic-reels': 'Cinematic Films & Reels',
  'institutional-education': 'Institutional & Education',
  'travel-lifestyle': 'Travel & Lifestyle',
  'social-media-brand': 'Social Media & Brand Content',
  'real-estate': 'Real Estate',
  'drone-shoot': 'Drone Shoot',
};

// Old category slugs (from before the category list was expanded) mapped
// onto their closest new equivalent, applied to existing rows on deploy.
const CATEGORY_MIGRATIONS = {
  brand: 'corporate-commercial',
  portrait: 'photography',
  wedding: 'weddings',
  event: 'events-concerts',
  fashion: 'photography',
};

// Seed data mirrors what shipped in the static HTML before this became
// database-backed, so the live site doesn't visually change on first load.
const SEED_ITEMS = [
  { id: 'seed-1', category: 'corporate-commercial', title: 'Viksit Bharat — Team On Stage', size: 'big', imageUrl: '/images/work/brand-launch-4.jpg' },
  { id: 'seed-2', category: 'corporate-commercial', title: 'Live Event Coverage', size: 'tall', imageUrl: '/images/work/brand-launch-5.jpg' },
  { id: 'seed-3', category: 'photography', title: 'Golden Hour Series', size: 'normal', imageUrl: null, placeholderVariant: 'ph-1' },
  { id: 'seed-4', category: 'weddings', title: 'A Monsoon Wedding', size: 'normal', imageUrl: null, placeholderVariant: 'ph-2' },
  { id: 'seed-5', category: 'events-concerts', title: 'Persona Fest — Showstopper Fashion Show', size: 'big', imageUrl: '/images/work/events3.jpg' },
  { id: 'seed-6', category: 'events-concerts', title: 'On-Stage Ensemble', size: 'tall', imageUrl: '/images/work/events1.jpg' },
  { id: 'seed-7', category: 'events-concerts', title: 'Persona Fest 2026', size: 'normal', imageUrl: '/images/work/events2.jpg' },
  { id: 'seed-8', category: 'events-concerts', title: 'Spotlight Moment', size: 'normal', imageUrl: '/images/work/events4.jpg' },
  { id: 'seed-9', category: 'events-concerts', title: 'Winning Moment — Closing Ceremony', size: 'wide', imageUrl: '/images/work/events5.jpg' },
  { id: 'seed-10', category: 'photography', title: 'Studio Edit No.4', size: 'normal', imageUrl: null, placeholderVariant: 'ph-4' },
  { id: 'seed-11', category: 'photography', title: 'Portrait Diaries', size: 'normal', imageUrl: null, placeholderVariant: 'ph-5' },
  { id: 'seed-12', category: 'corporate-commercial', title: 'We Create Experiences', size: 'normal', imageUrl: null, placeholderVariant: 'ph-8' },
];

function rowToItem(row) {
  return {
    id: row.id,
    category: row.category,
    categoryLabel: categoryLabel(row.category),
    title: row.title,
    size: row.size,
    imageUrl: row.image_url,
    mediaType: row.media_type || 'image',
    placeholderVariant: row.placeholder_variant || undefined,
    createdAt: Number(row.created_at),
  };
}

let schemaReady;
// Table + seed rows are created lazily on first request rather than via a
// separate migration step, so deploying just needs POSTGRES_URL set.
function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS gallery_items (
          id TEXT PRIMARY KEY,
          category TEXT NOT NULL,
          title TEXT NOT NULL,
          size TEXT NOT NULL DEFAULT 'normal',
          image_url TEXT,
          placeholder_variant TEXT,
          created_at BIGINT NOT NULL
        )
      `;
      // The table already existed in production before video support was
      // added, so the new column needs an explicit migration rather than
      // just being part of CREATE TABLE IF NOT EXISTS.
      await sql`ALTER TABLE gallery_items ADD COLUMN IF NOT EXISTS media_type TEXT NOT NULL DEFAULT 'image'`;

      // Remap any rows still on the old, narrower category set — idempotent,
      // since after the first run no row matches the old slugs anymore.
      for (const [oldCategory, newCategory] of Object.entries(CATEGORY_MIGRATIONS)) {
        await sql`UPDATE gallery_items SET category = ${newCategory} WHERE category = ${oldCategory}`;
      }

      const { rows } = await sql`SELECT COUNT(*)::int AS count FROM gallery_items`;
      if (rows[0].count === 0) {
        for (const item of SEED_ITEMS) {
          await sql`
            INSERT INTO gallery_items (id, category, title, size, image_url, placeholder_variant, created_at)
            VALUES (${item.id}, ${item.category}, ${item.title}, ${item.size}, ${item.imageUrl}, ${item.placeholderVariant || null}, 0)
            ON CONFLICT (id) DO NOTHING
          `;
        }
      }
    })();
  }
  return schemaReady;
}

async function getManifest() {
  await ensureSchema();
  const { rows } = await sql`SELECT * FROM gallery_items ORDER BY created_at ASC`;
  return rows.map(rowToItem);
}

async function getItem(id) {
  await ensureSchema();
  const { rows } = await sql`SELECT * FROM gallery_items WHERE id = ${id}`;
  return rows[0] ? rowToItem(rows[0]) : null;
}

async function insertItem(item) {
  await ensureSchema();
  await sql`
    INSERT INTO gallery_items (id, category, title, size, image_url, media_type, created_at)
    VALUES (${item.id}, ${item.category}, ${item.title}, ${item.size}, ${item.imageUrl}, ${item.mediaType || 'image'}, ${item.createdAt})
  `;
  return getManifest();
}

async function deleteItem(id) {
  await ensureSchema();
  await sql`DELETE FROM gallery_items WHERE id = ${id}`;
  return getManifest();
}

function categoryLabel(category) {
  return CATEGORY_LABELS[category] || category;
}

module.exports = { getManifest, getItem, insertItem, deleteItem, categoryLabel, CATEGORY_LABELS };
