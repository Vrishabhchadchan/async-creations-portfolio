const nodemailer = require('nodemailer');

const STUDIO_INBOX = process.env.CONTACT_TO_EMAIL || 'asynccreations@gmail.com';

const MAX_NAME = 100;
const MAX_PHONE = 30;
const MAX_EMAIL = 200;
const MAX_SERVICE = 100;
const MAX_MESSAGE = 4000;

const SERVICE_OPTIONS = new Set([
  'Photography',
  'Videography & Films',
  'Reels & Social Content',
  'Brand Identity Shoot',
  'Event Coverage',
  'Something else',
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Serverless instances are reused between invocations while warm, so this
// resets on cold start rather than persisting forever — good enough to
// blunt a burst of submissions without needing external storage for a
// low-volume contact form.
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 3;
const submissionsByIp = new Map();

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd) return fwd.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

function isRateLimited(ip) {
  const now = Date.now();
  const hits = (submissionsByIp.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  hits.push(now);
  submissionsByIp.set(ip, hits);

  if (submissionsByIp.size > 5000) submissionsByIp.clear();

  return hits.length > RATE_LIMIT_MAX;
}

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

let cachedTransporter = null;
function getTransporter() {
  if (cachedTransporter) return cachedTransporter;
  const user = process.env.CONTACT_GMAIL_USER;
  const pass = process.env.CONTACT_GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;

  cachedTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
  return cachedTransporter;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ip = clientIp(req);
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many submissions — please wait a minute and try again.' });
  }

  const body = req.body || {};

  // Honeypot: a field real visitors never see or fill, so a bot that
  // blindly fills every input outs itself here. Report success so the bot
  // doesn't learn to skip it.
  if (typeof body.website === 'string' && body.website.trim()) {
    return res.status(200).json({ ok: true });
  }

  const name = String(body.name || '').trim().slice(0, MAX_NAME);
  const phone = String(body.phone || '').trim().slice(0, MAX_PHONE);
  const email = String(body.email || '').trim().slice(0, MAX_EMAIL);
  const rawService = String(body.service || '').trim().slice(0, MAX_SERVICE);
  const service = SERVICE_OPTIONS.has(rawService) ? rawService : 'Something else';
  const message = String(body.message || '').trim().slice(0, MAX_MESSAGE);

  if (!name) return res.status(400).json({ error: 'Please add your name.' });
  if (!phone) return res.status(400).json({ error: 'Please add a phone number.' });
  if (!email || !EMAIL_RE.test(email)) return res.status(400).json({ error: 'Please add a valid email address.' });
  if (!message) return res.status(400).json({ error: 'Please add a message.' });

  const transporter = getTransporter();
  if (!transporter) {
    console.error('contact.js: CONTACT_GMAIL_USER / CONTACT_GMAIL_APP_PASSWORD not configured');
    return res.status(503).json({ error: "The contact form isn't fully set up yet — please reach out via WhatsApp or email instead." });
  }

  try {
    await transporter.sendMail({
      // Gmail SMTP only lets us send as the authenticated account, so the
      // visitor's address goes in Reply-To: hitting Reply answers them.
      from: `"Async Creations Website" <${process.env.CONTACT_GMAIL_USER}>`,
      to: STUDIO_INBOX,
      replyTo: `"${name.replace(/["\r\n]/g, '')}" <${email}>`,
      subject: `New inquiry: ${name.replace(/[\r\n]/g, ' ')} — ${service}`,
      text: [
        `Name: ${name}`,
        `Phone: ${phone}`,
        `Email: ${email}`,
        `Interested in: ${service}`,
        '',
        'Message:',
        message,
      ].join('\n'),
      html: `
        <div style="font-family:sans-serif;font-size:15px;line-height:1.6;color:#111;">
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Interested in:</strong> ${escapeHtml(service)}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space:pre-wrap;">${escapeHtml(message)}</p>
        </div>`,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('contact.js: sendMail failed', err);
    return res.status(502).json({ error: "Couldn't send your message right now — please try again or reach out via WhatsApp." });
  }
};
