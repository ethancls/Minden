import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await (await import('next-intl/server')).getTranslations({ locale, namespace: 'alerts' });
  return { title: t('title') };
}

export default async function AlertsPage({ params: { locale } }: { params: { locale: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    const base = (process.env.NEXTAUTH_URL || '').replace(/\/$/, '');
    const signin = base ? `${base}/${locale}/auth/signin?callbackUrl=${encodeURIComponent(`${base}/${locale}/alerts`)}` : `/${locale}/auth/signin?callbackUrl=/${locale}/alerts`;
    redirect(signin);
  }
  const t = await getTranslations({ locale, namespace: 'alerts' });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t('title')}</h1>
      <div className="rounded-xl border bg-card p-4">No alerts yet.</div>
    </div>
  );
}

