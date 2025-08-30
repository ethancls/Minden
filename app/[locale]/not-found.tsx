import Link from 'next/link';
import { getTranslations, getLocale } from 'next-intl/server';
import { Button } from '@/components/ui/button';

export default async function NotFound() {
  const t = await getTranslations('notFound');
  const locale = await getLocale();

  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-3xl font-semibold">{t('title')}</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">{t('description')}</p>
      <div className="mt-6">
        <Button asChild>
          <Link href={`/${locale}`}>{t('goHome')}</Link>
        </Button>
      </div>
    </div>
  );
}

