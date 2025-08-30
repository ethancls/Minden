import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
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
  const userId = (session.user as any).id as string;
  const currentTenantId = cookies().get('tenantId')?.value;
  if (!currentTenantId) redirect(`/${locale}/tenants`);
  const member = await prisma.tenantMember.findUnique({ where: { tenantId_userId: { tenantId: currentTenantId!, userId } }, include: { tenant: true } });
  if (!member || member.tenant.status !== 'ACTIVE') redirect(`/${locale}/tenants`);
  const machines = await prisma.machine.findMany({ where: { tenantId: currentTenantId! }, orderBy: { updatedAt: 'desc' } });
  const tM = await getTranslations({ locale, namespace: 'machines' });

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
          <Link key={m.id} href={`/${locale}/machines/${m.id}`} className="rounded-xl border bg-card p-4 hover:bg-card/80">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{m.name}</div>
                <div className="text-xs text-muted-foreground">{m.hostname ?? '—'} • {m.ip ?? '—'}</div>
              </div>
              <span className={`text-xs ${m.status === 'ONLINE' ? 'text-green-500' : 'text-muted-foreground'}`}>{m.status}</span>
            </div>
          </Link>
        ))}
        {machines.length === 0 && <div className="text-sm text-muted-foreground">{tM('none')}</div>}
      </div>
    </div>
  );
}
