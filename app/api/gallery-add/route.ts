import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { updateManifest, categoryLabel, CATEGORY_LABELS, type GalleryItem } from '@/lib/manifest';

const VALID_SIZES = new Set(['normal', 'big', 'tall', 'wide']);

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Please log in again.' }, { status: 401 });

  const { url, category, title, size } = await request.json().catch(() => ({}));

  if (!url || typeof url !== 'string' || !/^https:\/\//.test(url)) {
    return NextResponse.json({ error: 'Missing or invalid image URL' }, { status: 400 });
  }
  if (!category || !CATEGORY_LABELS[category]) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
  }

  const cleanTitle = (typeof title === 'string' ? title : '').trim().slice(0, 120);
  if (!cleanTitle) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

  const newItem: GalleryItem = {
    id: crypto.randomUUID(),
    category,
    categoryLabel: categoryLabel(category),
    title: cleanTitle,
    size: VALID_SIZES.has(size) ? size : 'normal',
    imageUrl: url,
    createdAt: Date.now(),
  };

  try {
    const items = await updateManifest(
      (current) => [...current, newItem],
      (check) => check.some((item) => item.id === newItem.id)
    );
    return NextResponse.json({ items });
  } catch (err) {
    console.error('POST /api/gallery-add', err);
    return NextResponse.json(
      { error: (err as Error).message || 'Could not save photo. Please try again.' },
      { status: 409 }
    );
  }
}
