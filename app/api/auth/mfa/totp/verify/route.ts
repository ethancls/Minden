import { SessionUser } from '@/models/types';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verifyTotp } from '@/lib/totp';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  const userId = (session.user as SessionUser).id;
  const ip = getClientIp(req.headers);
  const rl = rateLimit(`mfaVerify:ip:${ip}`, 20, 10 * 60_000);
  if (!rl.ok) return NextResponse.json({ error: 'RATE_LIMITED' }, { status: 429 });

  const { code } = await req.json();
  if (!code || String(code).length < 6) return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { totpSecret: true } });
  if (!user?.totpSecret) return NextResponse.json({ error: 'NO_ENROLLMENT' }, { status: 400 });
  const ok = verifyTotp(user.totpSecret, String(code));
  if (!ok) return NextResponse.json({ error: 'INVALID_CODE' }, { status: 400 });
  await prisma.user.update({ where: { id: userId }, data: { mfaEnabled: true } });
  return NextResponse.json({ ok: true });
}

