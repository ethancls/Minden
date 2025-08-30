"use client";
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

export default function VerifyPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('auth.verify');
  const sp = useSearchParams();
  const [email] = useState(sp.get('email') || '');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function resend() {
    if (!email) return toast.error(t('emailRequired'));
    setLoading(true);
    const mod = await import('next-auth/react');
    const callbackUrl = `/${locale}`;
    await mod.signIn('email', { email, callbackUrl, redirect: false });
    setLoading(false);
    setSent(true);
    toast.success(t('magicSent'));
  }

  useEffect(() => {
    setSent(false);
  }, [email]);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('desc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input type="email" placeholder={t('email')} value={email} readOnly disabled />
          <Button onClick={resend} disabled={loading} className="w-full">{t('resendMagic')}</Button>
          {sent && <p className="text-xs text-muted-foreground">{t('magicSent')}</p>}
        </CardContent>
        <CardFooter>
          <p className="w-full text-center text-sm text-muted-foreground">{t('tip')}</p>
        </CardFooter>
      </Card>
    </div>
  );
}
