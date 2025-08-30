import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  const { tenantId } = await req.json();
  if (!tenantId) return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 });
  // Ensure user is member and tenant is ACTIVE
  const member = await prisma.tenantMember.findUnique({
    where: { tenantId_userId: { tenantId, userId: (session.user as any).id } },
    include: { tenant: true },
  });
  if (!member) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  if (member.tenant.status !== 'ACTIVE') return NextResponse.json({ error: 'TENANT_NOT_ACTIVE' }, { status: 403 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set('tenantId', tenantId, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: (process.env.NEXTAUTH_URL || '').startsWith('https://'),
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
