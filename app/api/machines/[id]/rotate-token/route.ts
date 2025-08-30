import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(_req: NextRequest, { params: { id } }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  const machine = await prisma.machine.findUnique({ where: { id }, include: { tenant: true } });
  if (!machine) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  const plaintext = crypto.randomBytes(24).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(plaintext).digest('hex');
  await prisma.agentToken.create({ data: { tenantId: machine.tenantId, machineId: machine.id, name: `rotated-${Date.now()}`, tokenHash } });
  return NextResponse.json({ ok: true, token: plaintext });
}

