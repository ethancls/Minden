import { SessionUser } from '@/models/types';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  const userId = (session.user as SessionUser).id;
  const { id } = params;
  const credential = await prisma.webAuthnCredential.findFirst({ where: { id, userId } });
  if (!credential) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  await prisma.webAuthnCredential.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

