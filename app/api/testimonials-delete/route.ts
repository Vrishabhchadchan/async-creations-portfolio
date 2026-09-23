import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { updateTestimonials } from '@/lib/testimonials';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Please log in again.' }, { status: 401 });

  const { id } = await request.json().catch(() => ({}));
  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    const updated = await updateTestimonials(
      (current) => current.filter((item) => item.id !== id),
      (check) => !check.some((item) => item.id === id)
    );
    return NextResponse.json({ items: updated });
  } catch (err) {
    console.error('POST /api/testimonials-delete', err);
    return NextResponse.json(
      { error: (err as Error).message || 'Could not delete testimonial. Please try again.' },
      { status: 409 }
    );
  }
}
