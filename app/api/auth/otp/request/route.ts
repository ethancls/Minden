import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateOtp } from '@/lib/otp';
import { sendOtpEmail } from '@/lib/email';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const { email, locale = 'en' } = await req.json();
  if (!email) return NextResponse.json({ error: 'EMAIL_REQUIRED' }, { status: 400 });
  const rlIp = rateLimit(`otpReq:ip:${ip}`, 20, 10 * 60_000); // 20/10min per IP
  const rlEmail = rateLimit(`otpReq:email:${email.toLowerCase()}`, 5, 10 * 60_000); // 5/10min per email
  if (!rlIp.ok || !rlEmail.ok) return NextResponse.json({ error: 'RATE_LIMITED' }, { status: 429 });
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return NextResponse.json({ error: 'USER_NOT_FOUND' }, { status: 404 });

  const code = generateOtp(6);
  const expires = new Date(Date.now() + 10 * 60 * 1000);
  await prisma.verificationToken.create({ data: { identifier: user.email!, token: code, expires } });
  try {
    await sendOtpEmail(user.email!, code, locale);
  } catch (e: any) {
    return NextResponse.json({ error: 'SEND_FAILED', detail: e?.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
