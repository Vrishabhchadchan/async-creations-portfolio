import { NextResponse } from 'next/server';
import { getManifest } from '@/lib/manifest';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const items = await getManifest();
    return NextResponse.json({ items }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('GET /api/gallery', err);
    return NextResponse.json({ error: 'Failed to load gallery' }, { status: 500 });
  }
}
