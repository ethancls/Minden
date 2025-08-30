import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getMany, setSetting } from '@/lib/settings';
import { getTranslations } from 'next-intl/server';
import type { SessionUser } from '@/models/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
export const metadata = { title: 'Admin Settings' };

export default async function AdminSettingsPage({ params: { locale } }: { params: { locale: string } }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as SessionUser | null)?.role;
  if (!session?.user || role !== 'ADMIN') redirect(`/${locale}`);
  const t = await getTranslations({ locale, namespace: 'admin.settings' });
  const current = await getMany(['SMTP_HOST','SMTP_PORT','SMTP_USER','SMTP_PASSWORD','SMTP_FROM']);

  async function save(formData: FormData) {
    'use server';
    const pairs: Array<[string, string, boolean]> = [
      ['SMTP_HOST', String(formData.get('SMTP_HOST') || ''), false],
      ['SMTP_PORT', String(formData.get('SMTP_PORT') || ''), false],
      ['SMTP_USER', String(formData.get('SMTP_USER') || ''), true],
      ['SMTP_PASSWORD', String(formData.get('SMTP_PASSWORD') || ''), true],
      ['SMTP_FROM', String(formData.get('SMTP_FROM') || ''), false],
    ];
    for (const [key, value, isSecret] of pairs) {
      await setSetting(key, value, isSecret);
    }
    redirect(`/${locale}/admin/settings?toast=settings_saved`);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t('title')}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t('smtp')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <form action={save} className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <label className="text-sm text-muted-foreground" htmlFor="SMTP_HOST">{t('host')}</label>
                <Input id="SMTP_HOST" name="SMTP_HOST" defaultValue={current['SMTP_HOST'] || ''} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground" htmlFor="SMTP_PORT">{t('port')}</label>
                <Input id="SMTP_PORT" name="SMTP_PORT" defaultValue={current['SMTP_PORT'] || ''} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground" htmlFor="SMTP_USER">{t('user')}</label>
                <Input id="SMTP_USER" name="SMTP_USER" defaultValue={current['SMTP_USER'] || ''} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground" htmlFor="SMTP_PASSWORD">{t('password')}</label>
                <Input id="SMTP_PASSWORD" type="password" name="SMTP_PASSWORD" defaultValue={current['SMTP_PASSWORD'] || ''} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm text-muted-foreground" htmlFor="SMTP_FROM">{t('from')}</label>
                <Input id="SMTP_FROM" name="SMTP_FROM" defaultValue={current['SMTP_FROM'] || ''} />
              </div>
            </div>
            <Button type="submit">{t('save')}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
