"use client";
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

export default function VerifyPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('auth.verify');
  const sp = useSearchParams();
  const router = useRouter();
  const [email] = useState(sp.get('email') || '');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/auth/otp/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, code }) });
    setLoading(false);
    if (res.ok) {
      toast.success(t('verified'));
      router.push(`/${locale}/auth/signin`);
    } else {
      const data = await res.json();
      const err = String(data.error || '');
      if (err === 'INVALID_CODE') toast.error(t('invalid'));
      else if (err === 'EMAIL_REQUIRED' || err === 'INVALID_INPUT') toast.error(t('emailRequired'));
      else if (err === 'RATE_LIMITED') toast.error(t('rateLimited'));
      else toast.error(t('invalid'));
    }
  }

  async function resend() {
    if (!email) return toast.error(t('emailRequired'));
    setLoading(true);
    const res = await fetch('/api/auth/otp/request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, locale }) });
    setLoading(false);
    if (res.ok) { setSent(true); toast.success(t('codeSent')); } else { toast.error('Failed'); }
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
          <form onSubmit={onVerify} className="space-y-4">
            <InputOTP maxLength={6} value={code} onChange={(v) => setCode(v)}>
              <InputOTPGroup>
                {[0,1,2,3,4,5].map((i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
            <Button type="submit" disabled={loading || code.length !== 6} className="w-full">{t('submit')}</Button>
          </form>
          <Button variant="ghost" onClick={resend} disabled={loading}>{t('resend')}</Button>
          {sent && <p className="text-xs text-muted-foreground">{t('codeSent')}</p>}
        </CardContent>
        <CardFooter>
          <p className="w-full text-center text-sm text-muted-foreground">{t('tip')}</p>
        </CardFooter>
      </Card>
    </div>
  );
}
