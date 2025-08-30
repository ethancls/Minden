import { Button } from '@/components/ui/button';
import { getTranslations } from 'next-intl/server';
export const metadata = { title: 'Subscriptions' };

export default async function SubscriptionsPage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'subscriptions' });
  const planIds = ['free', 'pro', 'team'] as const;
  return (
    <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {planIds.map((id) => (
        <div key={id} className="flex flex-col rounded-xl border bg-card p-6">
          <div className="text-lg font-semibold">{t(`${id}.name`)}</div>
          <div className="mt-1 text-3xl font-bold text-primary">{t(`${id}.price`)}</div>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {[0,1,2].map((i) => (
              <li key={i} className="leading-relaxed">• {t(`${id}.features.${i}`)}</li>
            ))}
          </ul>
          <div className="mt-6">
            <Button className="w-full">{t(`${id}.cta`)}</Button>
          </div>
        </div>
      ))}
    </div>
  );
}
