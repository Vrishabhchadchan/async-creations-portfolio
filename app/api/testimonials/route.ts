import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getTestimonials } from '@/lib/testimonials';

export const dynamic = 'force-dynamic';

// Full list, including hidden/pending items — this is the admin portal's
// view. The public site reads getTestimonials() directly server-side and
// filters to visible items itself.
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Please log in again.' }, { status: 401 });

  try {
    const items = await getTestimonials();
    return NextResponse.json({ items }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('GET /api/testimonials', err);
    return NextResponse.json({ error: 'Failed to load testimonials' }, { status: 500 });
  }
}
