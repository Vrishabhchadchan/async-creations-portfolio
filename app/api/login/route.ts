import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { setSessionCookie } from '@/lib/auth';

export async function POST(request: Request) {
  const expected = process.env.TEAM_PASSCODE;
  if (!expected) {
    return NextResponse.json({ error: 'Server is not configured (missing TEAM_PASSCODE)' }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const given = typeof body.passcode === 'string' ? body.passcode : '';

  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  const match = a.length === b.length && crypto.timingSafeEqual(a, b);

  if (!match) {
    return NextResponse.json({ error: 'Incorrect passcode' }, { status: 401 });
  }

  await setSessionCookie();
  return NextResponse.json({ ok: true });
}
