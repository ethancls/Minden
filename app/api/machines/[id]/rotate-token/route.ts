import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import type { SessionUser } from '@/models/types'
import crypto from 'crypto'

export async function POST(
  _req: NextRequest,
  { params: { id } }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  const userId = (session.user as SessionUser).id
  const tenantId = cookies().get('tenantId')?.value
  if (!tenantId) return NextResponse.json({ error: 'NO_TENANT' }, { status: 403 })
  const member = await prisma.tenantMember.findUnique({ where: { tenantId_userId: { tenantId, userId } } })
  if (!member) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
  const machine = await prisma.machine.findUnique({ where: { id } })
  if (!machine || machine.tenantId !== tenantId) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })

  const plaintext = crypto.randomBytes(24).toString('hex')
  const tokenHash = crypto.createHash('sha256').update(plaintext).digest('hex')

  // Update existing token for this machine or create one
  const existing = await prisma.agentToken.findFirst({ where: { machineId: id } })
  if (existing) {
    await prisma.agentToken.update({ where: { id: existing.id }, data: { tokenHash, lastUsedAt: null } })
  } else {
    await prisma.agentToken.create({ data: { tenantId, machineId: id, name: `default-${machine.name}`, tokenHash } })
  }

  return NextResponse.json({ ok: true, token: plaintext })
}
