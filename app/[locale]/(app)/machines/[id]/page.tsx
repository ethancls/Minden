import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
export const metadata = { title: 'Machine' };

export default async function MachineDetail({ params: { locale, id } }: { params: { locale: string; id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const userId = (session.user as any).id as string;
  const machine = await prisma.machine.findUnique({ where: { id }, include: { tenant: { include: { members: { where: { userId }, select: { userId: true } } } }, services: true, tokens: true }, });
  if (!machine || machine.tenant.members.length === 0) return notFound();
  const logs = await prisma.logEvent.findMany({ where: { machineId: id }, orderBy: { ts: 'desc' }, take: 50 });
  const t = await getTranslations({ locale, namespace: 'machines' });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{machine.name}</h1>
          <div className="text-xs text-muted-foreground">{machine.hostname ?? '—'} • {machine.ip ?? '—'} • {machine.status}</div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-4">
          <div className="mb-2 text-sm font-medium">{t('services')}</div>
          <ul className="space-y-2 text-sm">
            {machine.services.map((s) => (
              <li key={s.id} className="flex items-center justify-between">
                <div>{s.name}{s.port ? `:${s.port}` : ''}{s.protocol ? `/${s.protocol}` : ''}</div>
                <span className={`text-xs ${s.status === 'RUNNING' ? 'text-green-500' : 'text-muted-foreground'}`}>{s.status}</span>
              </li>
            ))}
            {machine.services.length === 0 && <li className="text-muted-foreground">—</li>}
          </ul>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <div className="mb-2 text-sm font-medium">{t('agentToken')}</div>
          <div className="rounded-md bg-secondary p-2 text-xs">{machine.tokens[0]?.token ?? '—'}</div>
          <div className="mt-2 text-xs text-muted-foreground">{t('agentTokenHelp')}</div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <div className="mb-2 text-sm font-medium">{t('latestLogs')}</div>
        <ul className="space-y-1 text-xs">
          {logs.map((l) => (
            <li key={l.id} className="flex items-baseline gap-2">
              <span className="text-muted-foreground">{new Date(l.ts).toLocaleTimeString()}</span>
              <span>{l.message}</span>
            </li>
          ))}
          {logs.length === 0 && <li className="text-muted-foreground">{t('none')}</li>}
        </ul>
      </div>
    </div>
  );
}
