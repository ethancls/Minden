import { SessionUser } from '@/models/types';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { slugify } from '@/lib/slugify';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  const userId = (session.user as SessionUser).id;
  const tenants = await prisma.tenantMember.findMany({
    where: { userId },
    include: { tenant: true },
  });
  return NextResponse.json({ tenants: tenants.map((m) => m.tenant) });
}

const CreateSchema = z.object({ name: z.string().min(3).max(64) });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  const userId = (session.user as SessionUser).id;
  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 });
  const { name } = parsed.data;
  const base = slugify(name);
  let slug = base;
  let i = 1;
  while (await prisma.tenant.findUnique({ where: { slug } })) slug = `${base}-${i++}`;
  const tenant = await prisma.tenant.create({ data: { name, slug, createdById: userId, status: 'PENDING' } });
  await prisma.tenantMember.create({ data: { tenantId: tenant.id, userId, role: 'OWNER' } });
  return NextResponse.json({ ok: true, tenant });
}
