import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

// Simple agent ingestion endpoint: {token, type, payload}
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const { token, type, payload } = await req.json();
    
    // Log des données reçues (sans le token complet pour la sécurité)
    console.log(`[INGEST] ${new Date().toISOString()} - IP: ${ip}, Type: ${type}, Token: ${token?.slice(0, 8)}...`);
    console.log(`[INGEST] Payload:`, JSON.stringify(payload, null, 2));
    
    if (!token || !type) return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 });
    const tokenHash = crypto.createHash('sha256').update(String(token)).digest('hex');
    const rlToken = rateLimit(`ingest:token:${tokenHash}`, 240, 60_000); // 240/min per token
    const rlIp = rateLimit(`ingest:ip:${ip}`, 1000, 60_000); // 1000/min per IP
    if (!rlToken.ok || !rlIp.ok) return NextResponse.json({ error: 'RATE_LIMITED' }, { status: 429 });
    const agent = await prisma.agentToken.findUnique({ where: { tokenHash } });
    if (!agent) {
      console.log(`[INGEST] Token non trouvé: ${token?.slice(0, 8)}...`);
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }
    
    console.log(`[INGEST] Agent trouvé: ID ${agent.id}, Machine ID: ${agent.machineId}`);
    
    if (agent.machineId) {
      await prisma.agentToken.update({ where: { id: agent.id }, data: { lastUsedAt: new Date() } });
    }

    switch (type) {
      case 'heartbeat': {
        const { hostname, ip, version } = payload || {};
        console.log(`[HEARTBEAT] Machine ${agent.machineId}: ${hostname} (${ip}) v${version}`);
        if (agent.machineId) {
          await prisma.machine.update({ where: { id: agent.machineId }, data: { hostname, ip, agentVersion: version, status: 'ONLINE', lastHeartbeatAt: new Date() } });
        }
        break;
      }
      case 'services': {
        const services: Array<{ name: string; port?: number; protocol?: string; status?: string; meta?: unknown }> = payload || [];
        console.log(`[SERVICES] Machine ${agent.machineId}: ${services.length} services détectés`);
        services.forEach((s, i) => {
          console.log(`  ${i + 1}. ${s.name} (${s.protocol}:${s.port}) - ${s.status}`);
        });
        if (agent.machineId) {
          // naive replace-all for MVP
          await prisma.service.deleteMany({ where: { machineId: agent.machineId } });
          const mapStatus = (raw?: string): 'RUNNING' | 'STOPPED' | 'UNKNOWN' => {
            const v = String(raw || '').toUpperCase();
            if (v === 'RUNNING' || v === 'LISTEN' || v === 'LISTENING' || v === 'OPEN' || v === 'UP') return 'RUNNING';
            if (v === 'STOPPED' || v === 'CLOSED' || v === 'DOWN') return 'STOPPED';
            return 'UNKNOWN';
          };
          for (const s of services) {
            await prisma.service.create({
              data: {
                machineId: agent.machineId,
                name: s.name,
                port: s.port ?? null,
                protocol: s.protocol,
                status: mapStatus(s.status),
                meta: s.meta ?? undefined,
              },
            });
          }
        }
        break;
      }
      case 'log': {
        const lp = (payload || {}) as { level?: string; source?: string; message?: string; payload?: unknown };
        const level = lp.level ?? 'INFO';
        const source = lp.source ?? 'AGENT';
        const message = lp.message ?? '';
        const data = (lp as { payload?: unknown }).payload;
        const L = String(level || 'INFO').toUpperCase();
        const normLevel = (['INFO','WARN','ERROR'].includes(L) ? L : 'INFO') as 'INFO' | 'WARN' | 'ERROR';
        console.log(`[LOG] Machine ${agent.machineId}: [${normLevel}] ${source} - ${message}`);
        if (data) {
          console.log(`[LOG] Data:`, JSON.stringify(data, null, 2));
        }
        if (agent.machineId) {
          await prisma.logEvent.create({ data: { machineId: agent.machineId, level: normLevel, source, message, payload: data ?? undefined } });
        }
        break;
      }
      default:
        console.log(`[INGEST] Type inconnu: ${type}`);
        return NextResponse.json({ error: 'UNKNOWN_TYPE' }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    console.error('[INGEST] Erreur lors du traitement:', e);
    console.error('[INGEST] Stack trace:', e instanceof Error ? e.stack : String(e));
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
