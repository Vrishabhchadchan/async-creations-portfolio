import { put, list, del } from '@vercel/blob';

const MANIFEST_PREFIX = 'clients/manifest-';

export type ClientItem = {
  id: string;
  name: string;
  logoUrl: string;
  website?: string;
  createdAt: number;
  visible?: boolean;
};

/** Whether an item should render on the public site. */
export function isVisible(item: ClientItem) {
  return item.visible !== false;
}

export const SEED_CLIENTS: ClientItem[] = [
  {
    id: 'client-1',
    name: 'Astra',
    logoUrl: '/images/clients/astra.jpg',
    createdAt: 1,
    visible: true,
  },
  {
    id: 'client-2',
    name: 'Dada Kunjeer',
    logoUrl: '/images/clients/dada-kunjeer.jpg',
    createdAt: 2,
    visible: true,
  },
  {
    id: 'client-3',
    name: 'MIT University',
    logoUrl: '/images/clients/mit-university.jpg',
    createdAt: 3,
    visible: true,
  },
  {
    id: 'client-4',
    name: 'MIT-ADT University (Student Affairs)',
    logoUrl: '/images/clients/mit-adt-student-affairs.png',
    createdAt: 4,
    visible: true,
  },
  {
    id: 'client-5',
    name: 'Vishwashanti Gurukul World School',
    logoUrl: '/images/clients/vishwashanti-gurukul.jpg',
    createdAt: 5,
    visible: true,
  },
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function listManifestBlobs() {
  const { blobs } = await list({ prefix: MANIFEST_PREFIX, limit: 50 });
  return blobs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
}

export async function getClients(): Promise<ClientItem[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return SEED_CLIENTS;

  try {
    const blobs = await listManifestBlobs();
    if (blobs.length) {
      const res = await fetch(blobs[0].url, { cache: 'no-store' });
      if (res.ok) {
        const items = await res.json();
        if (Array.isArray(items)) return items;
      }
    }
    return saveClients(SEED_CLIENTS);
  } catch (err) {
    console.error('getClients failed, serving seed items', err);
    return SEED_CLIENTS;
  }
}

export async function saveClients(items: ClientItem[]) {
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

export async function updateClients(
  mutate: (items: ClientItem[]) => ClientItem[],
  verifyChange: (items: ClientItem[]) => boolean
) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const current = await getClients();
    await saveClients(mutate(current));

    if (attempt > 0) await sleep(300);
    const check = await getClients();
    if (verifyChange(check)) return check;
  }
  throw new Error('Changes may not have saved reliably — please refresh and try again.');
}
