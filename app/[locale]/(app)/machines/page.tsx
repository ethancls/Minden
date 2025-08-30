import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DeleteConfirm } from '@/components/machines/DeleteConfirm';
import { Trash2 } from 'lucide-react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import type { SessionUser } from '@/models/types';
import type { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await (await import('next-intl/server')).getTranslations({ locale, namespace: 'machines' });
  return { title: t('title') };
}

export default async function MachinesPage({ params: { locale } }: { params: { locale: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    const base = (process.env.NEXTAUTH_URL || '').replace(/\/$/, '');
    const signin = base ? `${base}/${locale}/auth/signin?callbackUrl=${encodeURIComponent(`${base}/${locale}/machines`)}` : `/${locale}/auth/signin?callbackUrl=/${locale}/machines`;
    redirect(signin);
  }
  const userId = (session.user as SessionUser).id;
  const currentTenantId = cookies().get('tenantId')?.value;
  if (!currentTenantId) redirect(`/${locale}/tenants`);
  const member = await prisma.tenantMember.findUnique({ where: { tenantId_userId: { tenantId: currentTenantId!, userId } }, include: { tenant: true } });
  if (!member || member.tenant.status !== 'ACTIVE') redirect(`/${locale}/tenants`);
  const machines = await prisma.machine.findMany({ where: { tenantId: currentTenantId! }, orderBy: { updatedAt: 'desc' } });
  const tM = await getTranslations({ locale, namespace: 'machines' });

  async function deleteMachine(formData: FormData) {
    'use server';
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect(`/${locale}/auth/signin`);
    const userId = (session.user as SessionUser).id;
    const tenantId = cookies().get('tenantId')?.value;
    if (!tenantId) redirect(`/${locale}/tenants`);
    const member = await prisma.tenantMember.findUnique({ where: { tenantId_userId: { tenantId, userId } } });
    if (!member) redirect(`/${locale}/tenants`);
    const id = String(formData.get('id') || '');
    const m = await prisma.machine.findUnique({ where: { id } });
    if (!m || m.tenantId !== tenantId) redirect(`/${locale}/machines`);
    await prisma.machine.delete({ where: { id } });
    redirect(`/${locale}/machines?toast=machine_deleted`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{tM('title')}</h1>
        <div className="flex items-center gap-2">
          <Link href={`/${locale}/tenants`} className="text-sm text-muted-foreground hover:text-foreground">{tM('switchTenant')}</Link>
          <Link href={`/${locale}/machines/new`}><Button>{tM('add')}</Button></Link>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {machines.map((m) => (
          <div key={m.id} className="rounded-xl border bg-card p-4 hover:bg-card/80 flex items-center justify-between">
            <Link href={`/${locale}/machines/${m.id}`} className="min-w-0">
              <div className="font-medium flex items-center gap-2">
                <span className={`inline-block h-2.5 w-2.5 rounded-full ${m.status === 'ONLINE' ? 'bg-green-500' : 'bg-muted-foreground/50'}`} />
                <span className="truncate">{m.name}</span>
              </div>
              <div className="text-xs text-muted-foreground truncate">{m.hostname ?? '—'} • {m.ip ?? '—'}</div>
            </Link>
            <div className="flex items-center gap-3">
              <span className={`text-xs ${m.status === 'ONLINE' ? 'text-green-500' : 'text-muted-foreground'}`}>{m.status}</span>
              <form id={`deleteMachine-${m.id}`} action={deleteMachine} method="post">
                <input type="hidden" name="id" value={m.id} />
              </form>
              <DeleteConfirm
                targetFormId={`deleteMachine-${m.id}`}
                title={tM('confirmDelete.title')}
                description={tM('confirmDelete.description')}
                confirm={tM('confirmDelete.confirm')}
                cancel={tM('confirmDelete.cancel')}
                trigger={
                  <button type="button" className="inline-flex items-center justify-center rounded-md border border-transparent bg-destructive/10 text-destructive hover:bg-destructive/15 h-8 w-8" aria-label={tM('delete')}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                }
              />
            </div>
          </div>
        ))}
        {machines.length === 0 && <div className="text-sm text-muted-foreground">{tM('none')}</div>}
      </div>
    </div>
  );
}
