import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const { email, code } = await req.json();
  if (!email || !code) return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 });
  const rlIp = rateLimit(`otpVerify:ip:${ip}`, 60, 10 * 60_000); // 60/10min per IP
  const rlEmail = rateLimit(`otpVerify:email:${email.toLowerCase()}`, 15, 10 * 60_000); // 15/10min per email
  if (!rlIp.ok || !rlEmail.ok) return NextResponse.json({ error: 'RATE_LIMITED' }, { status: 429 });
  const token = await prisma.verificationToken.findFirst({
    where: { identifier: email.toLowerCase(), token: code },
    orderBy: { expires: 'desc' },
  });
  if (!token || token.expires < new Date()) {
    return NextResponse.json({ error: 'INVALID_CODE' }, { status: 400 });
  }
  await prisma.$transaction([
    prisma.user.update({ where: { email: email.toLowerCase() }, data: { emailVerified: new Date() } }),
    prisma.verificationToken.deleteMany({ where: { identifier: email.toLowerCase() } }),
  ]);
  return NextResponse.json({ ok: true });
}
