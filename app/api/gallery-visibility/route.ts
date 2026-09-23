import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { updateManifest } from '@/lib/manifest';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Please log in again.' }, { status: 401 });

  const { id, visible } = await request.json().catch(() => ({}));
  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  if (typeof visible !== 'boolean') {
    return NextResponse.json({ error: 'Missing visible flag' }, { status: 400 });
  }

  try {
    const items = await updateManifest(
      (current) => current.map((item) => (item.id === id ? { ...item, visible } : item)),
      (check) => {
        const target = check.find((item) => item.id === id);
        // Undefined reads as visible, so only require an exact match when hiding.
        return visible ? target?.visible !== false : target?.visible === false;
      }
    );
    return NextResponse.json({ items });
  } catch (err) {
    console.error('POST /api/gallery-visibility', err);
    return NextResponse.json(
      { error: (err as Error).message || 'Could not update visibility. Please try again.' },
      { status: 409 }
    );
  }
}
