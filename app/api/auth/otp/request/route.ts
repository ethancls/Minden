import { SessionUser } from '@/models/types';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateOtp } from '@/lib/otp';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  const u = session.user as SessionUser;
  const user = await prisma.user.findUnique({ where: { id: u.id } });
  if (!user || !user.email) return NextResponse.json({ error: 'USER_NOT_FOUND' }, { status: 404 });

  const otp = generateOtp();
  // TODO: Implement sendVerificationEmail and createOtp
  console.log('OTP generated:', otp);
  // await sendVerificationEmail(user.email, otp, user.locale || 'en');

  return NextResponse.json({ ok: true });
}

