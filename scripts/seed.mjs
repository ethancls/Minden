import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';

const prisma = new PrismaClient();

function s(str) { return slugify(str, { lower: true, strict: true }); }

async function main() {
  console.log('Seeding database (Minden)...');

  const user = await prisma.user.upsert({
    where: { email: 'demo@minden.local' },
    update: {},
    create: { email: 'demo@minden.local', name: 'Demo User', emailVerified: new Date() },
  });

  const tenant = await prisma.tenant.create({ data: { name: 'Demo Tenant', slug: s('Demo Tenant'), createdById: user.id, status: 'ACTIVE' } });
  await prisma.tenantMember.create({ data: { tenantId: tenant.id, userId: user.id, role: 'OWNER' } });

  const machine = await prisma.machine.create({ data: { tenantId: tenant.id, name: 'demo-machine', hostname: 'demo.local', ip: '10.0.0.10', status: 'ONLINE', agentVersion: '0.1.0', lastHeartbeatAt: new Date() } });
  await prisma.agentToken.create({ data: { tenantId: tenant.id, machineId: machine.id, name: 'default', token: 'DEMO_TOKEN_123' } });

  await prisma.service.createMany({ data: [
    { machineId: machine.id, name: 'ssh', port: 22, protocol: 'tcp', status: 'RUNNING' },
    { machineId: machine.id, name: 'http', port: 80, protocol: 'tcp', status: 'RUNNING' }
  ]});

  await prisma.logEvent.createMany({ data: [
    { machineId: machine.id, level: 'WARN', source: 'AGENT', message: 'Failed auth from 192.168.1.50' },
    { machineId: machine.id, level: 'INFO', source: 'AGENT', message: 'Service scan completed' }
  ]});

  console.log('Seeding complete.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
