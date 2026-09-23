import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { updateTestimonials, type TestimonialItem } from '@/lib/testimonials';

const VALID_RATINGS = new Set([1, 2, 3, 4, 5]);

// Admin-only — for entering a review the team received by phone, email,
// Google, etc. Goes live immediately since a logged-in teammate is
// vouching for it, unlike the public /api/testimonials-submit endpoint.
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Please log in again.' }, { status: 401 });

  const { name, rating, quote, role } = await request.json().catch(() => ({}));

  const cleanName = (typeof name === 'string' ? name : '').trim().slice(0, 80);
  if (!cleanName) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

  const cleanQuote = (typeof quote === 'string' ? quote : '').trim().slice(0, 600);
  if (!cleanQuote) return NextResponse.json({ error: 'Feedback text is required' }, { status: 400 });

  const numRating = Number(rating);
  if (!VALID_RATINGS.has(numRating)) {
    return NextResponse.json({ error: 'Invalid rating' }, { status: 400 });
  }

  const cleanRole = typeof role === 'string' ? role.trim().slice(0, 80) : '';

  const newItem: TestimonialItem = {
    id: crypto.randomUUID(),
    name: cleanName,
    role: cleanRole || undefined,
    rating: numRating as TestimonialItem['rating'],
    quote: cleanQuote,
    createdAt: Date.now(),
    visible: true,
  };

  try {
    const items = await updateTestimonials(
      (current) => [...current, newItem],
      (check) => check.some((item) => item.id === newItem.id)
    );
    return NextResponse.json({ items });
  } catch (err) {
    console.error('POST /api/testimonials-add', err);
    return NextResponse.json(
      { error: (err as Error).message || 'Could not save testimonial. Please try again.' },
      { status: 409 }
    );
  }
}
