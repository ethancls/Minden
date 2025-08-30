import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET(
  _req: NextRequest,
  { params: { id } }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  const userId = (session.user as any).id as string
  const tenantId = cookies().get('tenantId')?.value
  if (!tenantId) return NextResponse.json({ error: 'NO_TENANT' }, { status: 403 })
  const member = await prisma.tenantMember.findUnique({ where: { tenantId_userId: { tenantId, userId } } })
  if (!member) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
  const machine = await prisma.machine.findUnique({ where: { id } })
  if (!machine || machine.tenantId !== tenantId) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
  return NextResponse.json({ status: machine.status, lastHeartbeatAt: machine.lastHeartbeatAt })
}

