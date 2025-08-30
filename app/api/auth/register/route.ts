import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { generateOtp } from '@/lib/otp';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { sendOtpEmail } from '@/lib/email';

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(60).optional(),
  locale: z.enum(['en', 'fr']).optional().default('en'),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const rl = rateLimit(`register:ip:${ip}`, 5, 60_000); // 5/min per IP
  if (!rl.ok) return NextResponse.json({ error: 'RATE_LIMITED', retryAfter: rl.retryAfter }, { status: 429 });
  const body = await req.json();
  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 });
  }
  const { email, password, name, locale } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return NextResponse.json({ error: 'EMAIL_TAKEN' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      name,
      locale,
      primaryProvider: 'LOCAL',
    },
    select: { id: true, email: true, name: true },
  });
  // Create OTP and send email
  const code = generateOtp(6);
  const expires = new Date(Date.now() + 10 * 60 * 1000);
  await prisma.verificationToken.create({ data: { identifier: normalizedEmail, token: code, expires } });
  try {
    await sendOtpEmail(normalizedEmail, code, locale);
  } catch (e) {
    // ignore send errors; frontend can re-request
  }

  return NextResponse.json({ ok: true, user, needsVerification: true });
}
