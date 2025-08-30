import { SessionUser } from '@/models/types';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await (await import('next-intl/server')).getTranslations({ locale, namespace: 'tenants' });
  return { title: t('title') };
}

export default async function TenantsPage({ params: { locale } }: { params: { locale: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect(`/${locale}/auth/signin`);
  const userId = (session.user as SessionUser).id;
  const memberships = await prisma.tenantMember.findMany({ where: { userId }, include: { tenant: true } });
  const currentTenantId = cookies().get('tenantId')?.value;

  async function create(formData: FormData) {
    'use server';
    const name = String(formData.get('name') || '').trim();
    if (!name) return;
    await prisma.tenant.create({ data: { name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,64), createdById: userId, status: 'PENDING' } });
    await prisma.tenantMember.create({ data: { tenantId: (await prisma.tenant.findFirstOrThrow({ where: { name } })).id, userId, role: 'OWNER' } });
    redirect(`/${locale}/tenants?toast=tenant_created`);
  }

  async function select(formData: FormData) {
    'use server';
    const tenantId = String(formData.get('tenantId') || '');
    if (!tenantId) return;
    const member = await prisma.tenantMember.findUnique({ where: { tenantId_userId: { tenantId, userId } }, include: { tenant: true } });
    if (!member || member.tenant.status !== 'ACTIVE') return;
    cookies().set('tenantId', tenantId, {
      path: '/',
      sameSite: 'lax',
      httpOnly: true,
      secure: (process.env.NEXTAUTH_URL || '').startsWith('https://'),
      maxAge: 60 * 60 * 24 * 30,
    });
    redirect(`/${locale}/machines?toast=tenant_selected`);
  }

  const t = await getTranslations({ locale, namespace: 'tenants' });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-4">
          <div className="mb-2 text-sm font-medium">{t('yourTenants')}</div>
          <ul className="space-y-3 text-sm">
            {memberships.map((m) => (
              <li key={m.tenantId} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{m.tenant.name}</div>
                  <div className="text-xs text-muted-foreground">{m.role} • {m.tenant.status}</div>
                </div>
                <form action={select} className="flex items-center gap-2">
                  <input type="hidden" name="tenantId" defaultValue={m.tenantId} />
                  <Button type="submit" disabled={m.tenant.status !== 'ACTIVE'}>
                    {t('select')}{currentTenantId===m.tenantId ? ' ✓' : ''}
                  </Button>
                </form>
              </li>
            ))}
            {memberships.length === 0 && (
              <li className="text-muted-foreground">{t('none')}</li>
            )}
          </ul>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <div className="mb-2 text-sm font-medium">{t('requestTitle')}</div>
          <form action={create} className="flex items-center gap-2">
            <Input name="name" placeholder={t('requestPlaceholder')} />
            <Button type="submit">{t('requestBtn')}</Button>
          </form>
          <p className="mt-2 text-xs text-muted-foreground">{t('pendingNote')}</p>
        </div>
      </div>
    </div>
  );
}
