import { NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { getSession } from '@/lib/auth';
import { getClients, updateClients } from '@/lib/clients';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Please log in again.' }, { status: 401 });

  const { id } = await request.json().catch(() => ({}));
  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const items = await getClients();
  const target = items.find((item) => item.id === id);
  if (!target) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

  // Only remove from Vercel Blob if stored there
  if (target.logoUrl?.includes('.public.blob.vercel-storage.com/')) {
    try {
      await del(target.logoUrl);
    } catch (err) {
      console.error('clients-delete: blob delete failed', err);
    }
  }

  try {
    const updated = await updateClients(
      (current) => current.filter((item) => item.id !== id),
      (check) => !check.some((item) => item.id === id)
    );
    return NextResponse.json({ items: updated });
  } catch (err) {
    console.error('POST /api/clients-delete', err);
    return NextResponse.json(
      { error: (err as Error).message || 'Could not delete client. Please try again.' },
      { status: 409 }
    );
  }
}
