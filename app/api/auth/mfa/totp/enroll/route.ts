import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { buildOtpAuthUrl, generateBase32Secret } from '@/lib/totp';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  const userId = (session.user as any).id as string;
  const ip = getClientIp(req.headers);
  const rl = rateLimit(`mfaEnroll:ip:${ip}`, 10, 60_000);
  if (!rl.ok) return NextResponse.json({ error: 'RATE_LIMITED' }, { status: 429 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.email) return NextResponse.json({ error: 'INVALID_USER' }, { status: 400 });

  const secret = generateBase32Secret(20);
  await prisma.user.update({ where: { id: userId }, data: { totpSecret: secret } });
  const otpauth = buildOtpAuthUrl('Minden', user.email, secret);
  return NextResponse.json({ ok: true, secret, otpauth });
}

