import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export async function GET(_req: NextRequest, { params: { id } }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  const userId = (session.user as any).id as string;

  // Enforce membership on the machine's tenant and hide sensitive token hashes
  const m = await prisma.machine.findUnique({
    where: { id },
    include: {
      tenant: { include: { members: { where: { userId }, select: { userId: true } }, } },
      services: true,
      tokens: { select: { id: true, name: true, lastUsedAt: true } },
    },
  });
  if (!m) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  if (m.tenant.members.length === 0) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  // Strip tenant.members from response
  const { tenant, ...rest } = m as any;
  return NextResponse.json({ machine: { ...rest, tenantId: tenant.id } });
}

const PatchSchema = z.object({ name: z.string().min(2).max(80).optional(), desiredServices: z.array(z.string()).optional() });
export async function PATCH(req: NextRequest, { params: { id } }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  const json = await req.json();
  const parsed = PatchSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 });
  const { name, desiredServices } = parsed.data;
  const updated = await prisma.machine.update({ where: { id }, data: { name, desiredServices } });
  return NextResponse.json({ ok: true, machine: updated });
}

export async function DELETE(_req: NextRequest, { params: { id } }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  await prisma.machine.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
