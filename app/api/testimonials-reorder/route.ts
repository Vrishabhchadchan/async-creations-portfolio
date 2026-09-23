import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getTestimonials, updateTestimonials } from '@/lib/testimonials';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Please log in again.' }, { status: 401 });

  const { orderedIds } = await request.json().catch(() => ({}));
  if (!Array.isArray(orderedIds) || orderedIds.some((id) => typeof id !== 'string')) {
    return NextResponse.json({ error: 'Missing or invalid orderedIds' }, { status: 400 });
  }

  const current = await getTestimonials();
  const currentIds = new Set(current.map((item) => item.id));
  const sameSet =
    orderedIds.length === current.length && orderedIds.every((id: string) => currentIds.has(id));
  if (!sameSet) {
    return NextResponse.json(
      { error: 'That order is out of date — please refresh and try again.' },
      { status: 409 }
    );
  }

  try {
    const items = await updateTestimonials(
      (curr) => {
        const byId = new Map(curr.map((item) => [item.id, item]));
        return orderedIds.map((id: string) => byId.get(id)!);
      },
      (check) => check.map((item) => item.id).join(',') === orderedIds.join(',')
    );
    return NextResponse.json({ items });
  } catch (err) {
    console.error('POST /api/testimonials-reorder', err);
    return NextResponse.json(
      { error: (err as Error).message || 'Could not save the new order. Please try again.' },
      { status: 409 }
    );
  }
}
