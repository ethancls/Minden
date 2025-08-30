
import { SessionUser } from '@/models/types';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }
  const userId = (session.user as SessionUser).id;

  const credentials = await prisma.webAuthnCredential.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      transports: true,
      createdAt: true,
      lastUsedAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return NextResponse.json(credentials);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }
  const userId = (session.user as SessionUser).id;

  const { id } = await req.json();

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 });
  }

  // Ensure the user owns this credential before deleting
  const credential = await prisma.webAuthnCredential.findUnique({
    where: { id },
  });

  if (!credential || credential.userId !== userId) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  await prisma.webAuthnCredential.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}
