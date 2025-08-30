import crypto from 'crypto';

// RFC 4648 base32 decoding
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
export function base32Decode(input: string): Buffer {
  const clean = input.replace(/=+$/,'').toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = '';
  for (const c of clean) {
    const val = BASE32_ALPHABET.indexOf(c);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

function hotp(secret: Buffer, counter: number, digits = 6): string {
  const buf = Buffer.alloc(8);
  for (let i = 7; i >= 0; i--) {
    buf[i] = counter & 0xff;
    counter = counter >> 8;
  }
  const hmac = crypto.createHmac('sha1', secret).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code = ((hmac[offset] & 0x7f) << 24) | ((hmac[offset + 1] & 0xff) << 16) | ((hmac[offset + 2] & 0xff) << 8) | (hmac[offset + 3] & 0xff);
  const otp = (code % 10 ** digits).toString().padStart(digits, '0');
  return otp;
}

export function verifyTotp(base32Secret: string, token: string, timeStep = 30, window = 1, digits = 6): boolean {
  try {
    const secret = base32Decode(base32Secret);
    const now = Math.floor(Date.now() / 1000);
    const counter = Math.floor(now / timeStep);
    for (let w = -window; w <= window; w++) {
      const otp = hotp(secret, counter + w, digits);
      if (otp === token) return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function generateBase32Secret(length = 32): string {
  const rnd = crypto.randomBytes(length);
  let out = '';
  for (let i = 0; i < rnd.length; i += 5) {
    const chunk = rnd.subarray(i, i + 5);
    const bits = Array.from(chunk).map((b) => b.toString(2).padStart(8, '0')).join('');
    for (let j = 0; j < bits.length; j += 5) {
      const idx = parseInt(bits.slice(j, j + 5).padEnd(5, '0'), 2);
      out += BASE32_ALPHABET[idx % 32];
    }
  }
  return out.slice(0, Math.ceil((length * 8) / 5));
}

export function buildOtpAuthUrl(issuer: string, accountName: string, base32Secret: string): string {
  const label = encodeURIComponent(`${issuer}:${accountName}`);
  const params = new URLSearchParams({ secret: base32Secret, issuer, algorithm: 'SHA1', digits: '6', period: '30' });
  return `otpauth://totp/${label}?${params.toString()}`;
}

