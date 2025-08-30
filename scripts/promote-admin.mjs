import { config } from 'node:process';
import { PrismaClient } from '@prisma/client';

const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/promote-admin.mjs user@example.com');
  process.exit(1);
}

const prisma = new PrismaClient();
try {
  const user = await prisma.user.update({
    where: { email: email.toLowerCase() },
    data: { role: 'ADMIN' },
    select: { id: true, email: true, role: true },
  });
  console.log('Promoted:', user);
} catch (e) {
  console.error('Failed:', e?.message || e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}

