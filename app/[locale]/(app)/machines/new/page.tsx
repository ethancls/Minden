import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { cookies, headers } from 'next/headers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OnboardingPanel } from '@/components/machines/OnboardingPanel';
import { getTranslations } from 'next-intl/server';
import crypto from 'crypto';
export const metadata = { title: 'New Machine' };

async function createMachine(formData: FormData, locale: string) {
  'use server';
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    const base = (process.env.NEXTAUTH_URL || '').replace(/\/$/, '');
    const signin = base ? `${base}/${locale}/auth/signin?callbackUrl=${encodeURIComponent(`${base}/${locale}/machines/new`)}` : `/${locale}/auth/signin?callbackUrl=/${locale}/machines/new`;
    redirect(signin);
  }
  const userId = (session.user as any).id as string;
  const tenantId = cookies().get('tenantId')?.value;
  if (!tenantId) redirect(`/${locale}/tenants`);
  const member = await prisma.tenantMember.findUnique({ where: { tenantId_userId: { tenantId, userId } }, include: { tenant: true } });
  if (!member || member.tenant.status !== 'ACTIVE') redirect(`/${locale}/tenants`);

  const name = String(formData.get('name') || '').trim();
  if (!name) return { error: 'INVALID_NAME' };
  const desiredServices = (formData.getAll('services') as string[]).filter(Boolean);

  const machine = await prisma.machine.create({ data: { tenantId, name, status: 'OFFLINE', desiredServices } });
  const plaintext = crypto.randomBytes(24).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(plaintext).digest('hex');
  await prisma.agentToken.create({ data: { tenantId, machineId: machine.id, name: `default-${machine.name}`, tokenHash } });

  const base = process.env.NEXTAUTH_URL || new URL(headers().get('x-forwarded-proto')?.includes('https') ? 'https://' : 'http://' + headers().get('host')!).toString();
  return { ok: true, machineId: machine.id, name, token: plaintext, baseUrl: base.replace(/\/$/, '') };
}

export default async function NewMachinePage({ params: { locale } }: { params: { locale: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect(`/${locale}/auth/signin`);
  const t = await getTranslations({ locale, namespace: 'machines' });

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">{t('add')}</h1>
      <form action={async (fd) => {
        'use server';
        const res = await createMachine(fd, locale);
        (global as any)._createResult = res; // store temp to render below
      }} className="space-y-4">
        <div>
          <Input name="name" placeholder="machine-01" required />
        </div>
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Services</div>
          <div className="grid grid-cols-2 gap-2">
            {['ssh','http','ftp','smtp','mysql'].map(s => (
              <label key={s} className="flex items-center gap-2 text-sm"><input type="checkbox" name="services" value={s} /> {s.toUpperCase()}</label>
            ))}
          </div>
        </div>
        <Button type="submit">{t('add')}</Button>
      </form>

      {((global as any)._createResult?.ok) && (() => {
        const res = (global as any)._createResult as { machineId: string; token: string; baseUrl: string };
        return (
          <OnboardingPanel
            locale={locale}
            machineId={res.machineId}
            token={res.token}
            baseUrl={res.baseUrl}
          />
        );
      })()}
    </div>
  );
}
