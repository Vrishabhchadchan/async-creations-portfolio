import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { updateTestimonials, type TestimonialItem } from '@/lib/testimonials';

const VALID_RATINGS = new Set([1, 2, 3, 4, 5]);

// Public endpoint — anyone with the link can submit a review, so every
// submission is created hidden and only goes live once an admin approves
// it from the team portal.
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { name, rating, quote, role } = body;

  // Honeypot: a real visitor never fills this hidden field.
  if (typeof body.website === 'string' && body.website.trim()) {
    return NextResponse.json({ ok: true });
  }

  const cleanName = (typeof name === 'string' ? name : '').trim().slice(0, 80);
  if (!cleanName) return NextResponse.json({ error: 'Please add your name.' }, { status: 400 });

  const cleanQuote = (typeof quote === 'string' ? quote : '').trim().slice(0, 600);
  if (!cleanQuote) return NextResponse.json({ error: 'Please add your feedback.' }, { status: 400 });
  if (cleanQuote.length < 10) {
    return NextResponse.json({ error: 'Please write a bit more about your experience.' }, { status: 400 });
  }

  const numRating = Number(rating);
  if (!VALID_RATINGS.has(numRating)) {
    return NextResponse.json({ error: 'Please choose a star rating.' }, { status: 400 });
  }

  const cleanRole = typeof role === 'string' ? role.trim().slice(0, 80) : '';

  const newItem: TestimonialItem = {
    id: crypto.randomUUID(),
    name: cleanName,
    role: cleanRole || undefined,
    rating: numRating as TestimonialItem['rating'],
    quote: cleanQuote,
    createdAt: Date.now(),
    visible: false,
  };

  try {
    await updateTestimonials(
      (current) => [...current, newItem],
      (check) => check.some((item) => item.id === newItem.id)
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('POST /api/testimonials-submit', err);
    return NextResponse.json(
      { error: (err as Error).message || 'Could not submit your feedback. Please try again.' },
      { status: 409 }
    );
  }
}
