import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getManifest, updateManifest, isVisible, HOME_MAX } from '@/lib/manifest';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Please log in again.' }, { status: 401 });

  const { id, onHome } = await request.json().catch(() => ({}));
  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  if (typeof onHome !== 'boolean') {
    return NextResponse.json({ error: 'Missing onHome flag' }, { status: 400 });
  }

  if (onHome) {
    const current = await getManifest();
    const target = current.find((item) => item.id === id);
    if (!target) return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    if (!target.imageUrl) {
      return NextResponse.json({ error: 'Only photos with an image can go on the home page.' }, { status: 400 });
    }
    if (!isVisible(target)) {
      return NextResponse.json(
        { error: 'Show this photo on the live site before adding it to the home page.' },
        { status: 400 }
      );
    }
    const others = current.filter((item) => item.id !== id && item.onHome === true && isVisible(item)).length;
    if (others >= HOME_MAX) {
      return NextResponse.json(
        { error: `The home page already shows ${HOME_MAX} photos. Remove one first, then add this one.` },
        { status: 409 }
      );
    }
  }

  try {
    const items = await updateManifest(
      (current) => current.map((item) => (item.id === id ? { ...item, onHome } : item)),
      (check) => (check.find((item) => item.id === id)?.onHome === true) === onHome
    );
    return NextResponse.json({ items });
  } catch (err) {
    console.error('POST /api/gallery-home', err);
    return NextResponse.json(
      { error: (err as Error).message || 'Could not update the home page. Please try again.' },
      { status: 409 }
    );
  }
}
