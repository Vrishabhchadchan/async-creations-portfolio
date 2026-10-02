import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { updateClients, type ClientItem } from '@/lib/clients';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Please log in again.' }, { status: 401 });

  const { name, logoUrl, website } = await request.json().catch(() => ({}));

  const cleanName = (typeof name === 'string' ? name : '').trim().slice(0, 100);
  if (!cleanName) return NextResponse.json({ error: 'Client name is required.' }, { status: 400 });

  if (!logoUrl || typeof logoUrl !== 'string' || (!logoUrl.startsWith('/') && !/^https:\/\//.test(logoUrl))) {
    return NextResponse.json({ error: 'A valid logo URL is required.' }, { status: 400 });
  }

  const cleanWebsite = typeof website === 'string' ? website.trim().slice(0, 200) : undefined;

  const newItem: ClientItem = {
    id: crypto.randomUUID(),
    name: cleanName,
    logoUrl,
    website: cleanWebsite || undefined,
    createdAt: Date.now(),
    visible: true,
  };

  try {
    const items = await updateClients(
      (current) => [...current, newItem],
      (check) => check.some((item) => item.id === newItem.id)
    );
    return NextResponse.json({ items });
  } catch (err) {
    console.error('POST /api/clients-add', err);
    return NextResponse.json(
      { error: (err as Error).message || 'Could not save client logo. Please try again.' },
      { status: 409 }
    );
  }
}
