const crypto = require('crypto');

const COOKIE_NAME = 'ac_team_session';
const SESSION_DAYS = 7;

function base64url(input) {
  return Buffer.from(input).toString('base64url');
}

function sign(payload) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET is not configured');
  const data = base64url(JSON.stringify(payload));
  const sig = crypto.createHmac('sha256', secret).update(data).digest('base64url');
  return `${data}.${sig}`;
}

function verify(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [data, sig] = parts;
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;

  const expected = crypto.createHmac('sha256', secret).update(data).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;

  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  header.split(';').forEach((pair) => {
    const idx = pair.indexOf('=');
    if (idx === -1) return;
    const key = pair.slice(0, idx).trim();
    const val = pair.slice(idx + 1).trim();
    out[key] = decodeURIComponent(val);
  });
  return out;
}

function getSession(req) {
  const cookies = parseCookies(req.headers.cookie);
  return verify(cookies[COOKIE_NAME]);
}

function isLocalRequest(req) {
  const host = req.headers.host || '';
  return host.startsWith('localhost') || host.startsWith('127.0.0.1');
}

function setSessionCookie(req, res) {
  const token = sign({ sub: 'team', iat: Date.now(), exp: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000 });
  const secureFlag = isLocalRequest(req) ? '' : ' Secure;';
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly;${secureFlag} SameSite=Lax; Path=/; Max-Age=${SESSION_DAYS * 24 * 60 * 60}`
  );
}

function clearSessionCookie(req, res) {
  const secureFlag = isLocalRequest(req) ? '' : ' Secure;';
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; HttpOnly;${secureFlag} SameSite=Lax; Path=/; Max-Age=0`);
}

module.exports = { getSession, setSessionCookie, clearSessionCookie, parseCookies, verify };
