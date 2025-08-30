import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { DeleteConfirm } from '@/components/machines/DeleteConfirm';
import { RotateToken } from '@/components/machines/RotateToken';
import type { SessionUser } from '@/models/types';
import { ServiceSelector } from '@/components/machines/ServiceSelector';

export const metadata = { title: 'Machine' };

export default async function MachineDetail({ params: { locale, id } }: { params: { locale: string; id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const userId = (session.user as SessionUser).id;
  const machine = await prisma.machine.findUnique({ where: { id }, include: { tenant: { include: { members: { where: { userId }, select: { userId: true } } } }, services: true, tokens: true }, });
  if (!machine || machine.tenant.members.length === 0) return notFound();
  const logs = await prisma.logEvent.findMany({ where: { machineId: id }, orderBy: { ts: 'desc' }, take: 50 });
  const t = await getTranslations({ locale, namespace: 'machines' });

  async function updateMachine(formData: FormData) {
    'use server';
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect(`/${locale}/auth/signin`);
    const userId = (session.user as SessionUser).id;
    const db = await prisma.machine.findUnique({ where: { id }, include: { tenant: { include: { members: { where: { userId }, select: { userId: true } } } } } });
    if (!db || db.tenant.members.length === 0) return notFound();
    const name = String(formData.get('name') || '').trim();
    const desiredServices = (formData.getAll('services') as string[]).filter(Boolean);
    await prisma.machine.update({ where: { id }, data: { name: name || db.name, desiredServices } });
    redirect(`/${locale}/machines/${id}?toast=machine_saved`);
  }

  async function deleteMachine() {
    'use server';
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect(`/${locale}/auth/signin`);
    const userId = (session.user as SessionUser).id;
    const db = await prisma.machine.findUnique({ where: { id }, include: { tenant: { include: { members: { where: { userId }, select: { userId: true } } } } } });
    if (!db || db.tenant.members.length === 0) return notFound();
    await prisma.machine.delete({ where: { id } });
    redirect(`/${locale}/machines?toast=machine_deleted`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{machine.name}</h1>
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${machine.status === 'ONLINE' ? 'bg-green-500' : 'bg-muted-foreground/50'}`} />
            <span>{machine.hostname ?? '—'} • {machine.ip ?? '—'} • {machine.status}</span>
          </div>
        </div>
        <>
          <form id="deleteMachineForm" action={deleteMachine} method="post" />
          <DeleteConfirm
            targetFormId="deleteMachineForm"
            title={t('confirmDelete.title')}
            description={t('confirmDelete.description')}
            confirm={t('confirmDelete.confirm')}
            cancel={t('confirmDelete.cancel')}
            trigger={
              <button type="button" className="inline-flex items-center justify-center gap-2 rounded-md bg-destructive px-3 py-2 text-sm text-destructive-foreground hover:bg-destructive/90">
                {t('delete')}
              </button>
            }
          />
        </>
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
          <div className="rounded-md bg-secondary p-2 text-xs">
            <span className="text-muted-foreground">{t('tokenHidden')}</span>
          </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <div className="text-xs text-muted-foreground">{t('agentTokenHelp')}</div>
            <RotateToken machineId={id} />
            </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <div className="mb-3 text-sm font-medium">{t('edit')}</div>
        <form action={updateMachine} className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground" htmlFor="name">{t('name')}</label>
            <input id="name" name="name" defaultValue={machine.name} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">{t('services')}</div>
            <ServiceSelector name="services" initial={machine.desiredServices as string[]} />
          </div>
          <div>
            <button type="submit" className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90">{t('save')}</button>
          </div>
        </form>
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
