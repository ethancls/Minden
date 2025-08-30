import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await (await import('next-intl/server')).getTranslations({ locale, namespace: 'dashboard' });
  return { title: t('title') };
}

export default async function DashboardPage({ params: { locale } }: { params: { locale: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    const base = (process.env.NEXTAUTH_URL || '').replace(/\/$/, '');
    const signin = base ? `${base}/${locale}/auth/signin?callbackUrl=${encodeURIComponent(`${base}/${locale}/dashboard`)}` : `/${locale}/auth/signin?callbackUrl=/${locale}/dashboard`;
    redirect(signin);
  }
  const t = await getTranslations({ locale, namespace: 'dashboard' });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t('title')}</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-4">Placeholder metric</div>
        <div className="rounded-xl border bg-card p-4">Placeholder chart</div>
        <div className="rounded-xl border bg-card p-4">Placeholder list</div>
      </div>
    </div>
  );
}

