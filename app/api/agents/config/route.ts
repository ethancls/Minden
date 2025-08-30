import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

type AgentConfig = {
  services: Array<{
    name: string
    template: 'nginx'
    ports: Array<{ host: number; container: number }>
    env?: Record<string, string>
  }>
}

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()
    if (!token) return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
    const tokenHash = crypto.createHash('sha256').update(String(token)).digest('hex')
    const agent = await prisma.agentToken.findUnique({ where: { tokenHash } })
    if (!agent || !agent.machineId) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    const machine = await prisma.machine.findUnique({ where: { id: agent.machineId } })
    if (!machine) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })

    // Parse desiredServices. Example entries: "nginx" or "nginx:8080"
    const services: AgentConfig['services'] = []
    for (const entry of machine.desiredServices || []) {
      const [raw, portRaw] = String(entry).split(':')
      const name = raw.trim().toLowerCase()
      if (name === 'nginx') {
        const hostPort = Number(portRaw || 8080) || 8080
        services.push({ name: 'nginx', template: 'nginx', ports: [{ host: hostPort, container: 80 }] })
      }
      // More templates can be added here (ssh, ftp, smtp, etc.)
    }

    return NextResponse.json<AgentConfig>({ services })
  } catch {
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}
