import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic';

export default async function CatchAll({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations('notFound');
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-3xl font-semibold">{t('title')}</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">{t('description')}</p>
      <div className="mt-6">
        <Link href={`/${locale}`} className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">
          {t('goHome')}
        </Link>
      </div>
    </div>
  );
}

