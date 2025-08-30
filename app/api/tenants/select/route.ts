import { SessionUser } from '@/models/types';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  const userId = (session.user as SessionUser).id;
  const { tenantId } = await req.json();
  if (!tenantId) return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 });
  const member = await prisma.tenantMember.findFirst({ where: { tenantId, userId, tenant: { status: 'ACTIVE' } } });
  if (!member) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  cookies().set('tenantId', tenantId, { path: '/', maxAge: 60 * 60 * 24 * 30 });
  return NextResponse.json({ ok: true });
}

