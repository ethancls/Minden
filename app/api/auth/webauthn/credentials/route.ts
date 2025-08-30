import { SessionUser } from '@/models/types';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  const userId = (session.user as SessionUser).id;
  const credentials = await prisma.webAuthnCredential.findMany({ where: { userId } });
  return NextResponse.json(credentials);
}

