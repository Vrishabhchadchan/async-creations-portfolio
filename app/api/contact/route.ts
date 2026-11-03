import { NextRequest, NextResponse } from 'next/server';

/**
 * Contact form handler — forwards enquiries to asynccreations@gmail.com
 * via Web3Forms using WEB3FORMS_ACCESS_KEY.
 */

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 5;
const submissionsByIp = new Map<string, number[]>();

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return 'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (submissionsByIp.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  hits.push(now);
  submissionsByIp.set(ip, hits);
  if (submissionsByIp.size > 5000) submissionsByIp.clear();
  return hits.length > RATE_LIMIT_MAX;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME = 100;
const MAX_PHONE = 30;
const MAX_EMAIL = 200;
const MAX_SERVICE = 100;
const MAX_MESSAGE = 4000;

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many submissions — please wait a minute and try again.' },
      { status: 429 }
    );
  }

  const accessKey = process.env.WEB3FORMS_ACCESS_KEY || '13740dd7-80a4-42f1-a1e0-e286b00475c7';

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  // Honeypot field
  if (typeof body.website === 'string' && (body.website as string).trim()) {
    return NextResponse.json({ ok: true });
  }

  const name = String(body.name || '').trim().slice(0, MAX_NAME);
  const phone = String(body.phone || '').trim().slice(0, MAX_PHONE);
  const email = String(body.email || '').trim().slice(0, MAX_EMAIL);
  const service = String(body.service || '').trim().slice(0, MAX_SERVICE) || 'General Enquiry';
  const message = String(body.message || '').trim().slice(0, MAX_MESSAGE);

  if (!name) return NextResponse.json({ error: 'Please add your name.' }, { status: 400 });
  if (!phone) return NextResponse.json({ error: 'Please add a phone number.' }, { status: 400 });
  if (!email || !EMAIL_RE.test(email))
    return NextResponse.json({ error: 'Please add a valid email address.' }, { status: 400 });
  if (!message) return NextResponse.json({ error: 'Please add a message.' }, { status: 400 });

  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        access_key: accessKey,
        subject: `New Project Enquiry: ${name} — ${service}`,
        from_name: 'Async Creations Website',
        replyto: email,
        Name: name,
        Phone: phone,
        Email: email,
        'Service Needed': service,
        Message: message,
      }),
    });

    const data = await res.json();

    if (data.success) {
      return NextResponse.json({ ok: true });
    } else {
      console.error('Web3Forms returned an error:', data);
      return NextResponse.json(
        { error: data.message || "Couldn't send your message right now — please try again or contact us via WhatsApp." },
        { status: 502 }
      );
    }
  } catch (err) {
    console.error('contact route: Web3Forms submission failed', err);
    return NextResponse.json(
      { error: "Couldn't send your message right now — please try again or contact us via WhatsApp." },
      { status: 502 }
    );
  }
}
