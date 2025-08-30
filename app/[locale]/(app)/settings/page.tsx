import { SessionUser } from '@/models/types';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { Metadata } from 'next';
import { PasskeysSettings } from '@/components/settings/passkeys';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await (await import('next-intl/server')).getTranslations({ locale, namespace: 'settings' });
  return { title: t('title') };
}

export default async function SettingsPage({ params: { locale } }: { params: { locale: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    const base = (process.env.NEXTAUTH_URL || '').replace(/\/$/, '');
    const signin = base ? `${base}/${locale}/auth/signin?callbackUrl=${encodeURIComponent(`${base}/${locale}/settings`)}` : `/${locale}/auth/signin?callbackUrl=/${locale}/settings`;
    redirect(signin);
  }
  const me = await prisma.user.findUnique({ where: { id: (session!.user as SessionUser).id }, select: { email: true, name: true, locale: true, mfaEnabled: true } });
  const t = await getTranslations({ locale, namespace: 'settings' });

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-2xl font-semibold">{t('title')}</h1>
      <div className="rounded-lg border p-4">
        <div className="text-sm text-muted-foreground">{t('fields.email')}</div>
        <div className="font-medium">{me?.email}</div>
      </div>
      <div className="rounded-lg border p-4">
        <div className="text-sm text-muted-foreground">{t('fields.name')}</div>
        <div className="font-medium">{me?.name ?? '—'}</div>
      </div>
      <div className="rounded-lg border p-4">
        <div className="text-sm text-muted-foreground">{t('fields.locale')}</div>
        <div className="font-medium">{me?.locale}</div>
      </div>
      <p className="text-sm text-muted-foreground">{t('note')}</p>

      <div className="rounded-lg border p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">MFA (TOTP)</div>
            <div className="text-sm text-muted-foreground">{me?.mfaEnabled ? 'Enabled' : 'Disabled'}</div>
          </div>
          <Link href={`/${locale}/auth/mfa`}> <Button variant="outline">{me?.mfaEnabled ? 'Manage' : 'Enable'}</Button></Link>
        </div>
      </div>
      <PasskeysSettings />
    </div>
  );
}
