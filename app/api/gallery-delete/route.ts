import { NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { getSession } from '@/lib/auth';
import { getManifest, updateManifest } from '@/lib/manifest';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Please log in again.' }, { status: 401 });

  const { id } = await request.json().catch(() => ({}));
  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const items = await getManifest();
  const target = items.find((item) => item.id === id);
  if (!target) return NextResponse.json({ error: 'Photo not found' }, { status: 404 });

  // Only remove the underlying file when it actually lives in our Blob
  // store — seed images under /images/ must stay on disk.
  if (target.imageUrl?.includes('.public.blob.vercel-storage.com/')) {
    try {
      await del(target.imageUrl);
    } catch (err) {
      console.error('gallery-delete: blob delete failed', err);
    }
  }

  try {
    const updated = await updateManifest(
      (current) => current.filter((item) => item.id !== id),
      (check) => !check.some((item) => item.id === id)
    );
    return NextResponse.json({ items: updated });
  } catch (err) {
    console.error('POST /api/gallery-delete', err);
    return NextResponse.json(
      { error: (err as Error).message || 'Could not delete photo. Please try again.' },
      { status: 409 }
    );
  }
}
