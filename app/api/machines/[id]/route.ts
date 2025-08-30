import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

import { SessionUser } from '@/models/types';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  const userId = (session.user as SessionUser).id;
  const machine = await prisma.machine.findFirst({ where: { id: params.id, tenant: { members: { some: { userId } } } } });
  if (!machine) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  return NextResponse.json(machine);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  const userId = (session.user as SessionUser).id;
  const machine = await prisma.machine.findFirst({ where: { id: params.id, tenant: { members: { some: { userId } } } } });
  if (!machine) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  const { name, desiredServices } = await req.json();
  const updated = await prisma.machine.update({ where: { id: params.id }, data: { name, desiredServices } });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  const userId = (session.user as SessionUser).id;
  const machine = await prisma.machine.findFirst({ where: { id: params.id, tenant: { members: { some: { userId } } } } });
  if (!machine) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  await prisma.machine.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
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

