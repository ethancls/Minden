import { SessionUser } from '@/models/types';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  const url = new URL(req.url);
  const tenantId = url.searchParams.get('tenantId') || undefined;
  const userId = (session.user as SessionUser).id;
  const tenantIds = (await prisma.tenantMember.findMany({ where: { userId, tenant: { status: 'ACTIVE' } }, select: { tenantId: true } })).map((m) => m.tenantId);
  const filterTenantId = tenantId && tenantIds.includes(tenantId) ? tenantId : undefined;
  const machines = await prisma.machine.findMany({ where: { tenantId: filterTenantId ? filterTenantId : { in: tenantIds } }, orderBy: { updatedAt: 'desc' } });
  return NextResponse.json({ machines });
}

const CreateSchema = z.object({ tenantId: z.string(), name: z.string().min(2).max(80), desiredServices: z.array(z.string()).optional() });
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  const json = await req.json();
  const parsed = CreateSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 });
  const { tenantId, name, desiredServices = [] } = parsed.data;
  const member = await prisma.tenantMember.findUnique({ where: { tenantId_userId: { tenantId, userId: (session.user as SessionUser).id } }, include: { tenant: true } });
  if (!member) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  if (member.tenant.status !== 'ACTIVE') return NextResponse.json({ error: 'TENANT_NOT_ACTIVE' }, { status: 403 });
  const machine = await prisma.machine.create({ data: { tenantId, name, status: 'OFFLINE', desiredServices } });
  const plaintext = crypto.randomBytes(24).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(plaintext).digest('hex');
  await prisma.agentToken.create({ data: { tenantId, machineId: machine.id, name: `default-${machine.name}`, tokenHash } });
  return NextResponse.json({ ok: true, machine, token: plaintext });
}
