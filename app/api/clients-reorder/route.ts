import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { updateClients } from '@/lib/clients';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Please log in again.' }, { status: 401 });

  const { orderedIds } = await request.json().catch(() => ({}));
  if (!Array.isArray(orderedIds) || !orderedIds.every((id) => typeof id === 'string')) {
    return NextResponse.json({ error: 'orderedIds must be an array of strings' }, { status: 400 });
  }

  try {
    const updated = await updateClients(
      (current) => {
        const orderMap = new Map(orderedIds.map((id, index) => [id, index]));
        return current.slice().sort((a, b) => {
          const aIndex = orderMap.has(a.id) ? (orderMap.get(a.id) as number) : 9999;
          const bIndex = orderMap.has(b.id) ? (orderMap.get(b.id) as number) : 9999;
          return aIndex - bIndex;
        });
      },
      () => true
    );
    return NextResponse.json({ items: updated });
  } catch (err) {
    console.error('POST /api/clients-reorder', err);
    return NextResponse.json(
      { error: (err as Error).message || 'Could not reorder clients. Please try again.' },
      { status: 409 }
    );
  }
}
