"use client";
import { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Github, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export default function SignInPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('auth.signin');
  const tVerify = useTranslations('auth.verify');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsVerify, setNeedsVerify] = useState(false);
  const [providers, setProviders] = useState<any | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const sp = useSearchParams();
  const callbackUrl = sp.get('callbackUrl') ?? `/${locale}`;

  useEffect(() => {
    async function loadProviders() {
      try {
        const res = await fetch('/api/auth/providers');
        if (res.ok) setProviders(await res.json());
      } catch {}
    }
    loadProviders();
  }, []);

  async function onCredentials(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn('credentials', {
      email,
      password,
      callbackUrl,
      redirect: false,
    });
    setLoading(false);
    if (res?.ok) {
      toast.success(t('toast.success'));
      window.location.href = callbackUrl;
    } else if (res?.error === 'EMAIL_NOT_VERIFIED') {
      setNeedsVerify(true);
      toast.info(t('toast.emailNotVerified'));
    } else {
      if (res?.error === 'USER_NOT_FOUND') toast.error(t('toast.userNotFound'));
      else if (res?.error === 'INVALID_PASSWORD') toast.error(t('toast.invalidPassword'));
      else toast.error(t('toast.failed'));
    }
  }

  async function onMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn('email', { email, callbackUrl, redirect: false });
    setLoading(false);
    if (res?.ok) toast.success(t('toast.magicSent'));
    else toast.error(res?.error || t('toast.failed'));
  }

  async function resendOtp() {
    setLoading(true);
    const res = await fetch('/api/auth/otp/request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, locale }) });
    setLoading(false);
    if (res.ok) toast.success(tVerify('codeSent'));
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full items-center justify-center">
      <div className="w-full max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('desc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            {providers?.google && (
            <Button onClick={() => signIn('google', { callbackUrl })} variant="outline" className="justify-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12 c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C33.64,6.053,29.084,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20 s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,16.108,18.961,14,24,14c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657 C33.64,6.053,29.084,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.197l-6.191-5.238C29.211,35.091,26.715,36,24,36 c-5.202,0-9.619-3.317-11.274-7.946l-6.52,5.025C9.5,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.094,5.565 c0.001-0.001,0.002-0.001,0.003-0.002l6.191,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
              {t('oauth.google')}
            </Button>
            )}
            {providers?.github && (
            <Button onClick={() => signIn('github', { callbackUrl })} variant="outline" className="justify-start gap-2">
              <Github className="h-4 w-4" /> {t('oauth.github')}
            </Button>
            )}
            {providers?.apple && (
            <Button onClick={() => signIn('apple', { callbackUrl })} variant="outline" className="justify-start gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"></path></svg>
              {t('oauth.apple')}
            </Button>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><span className="h-[1px] w-full bg-border" />{t('or')}<span className="h-[1px] w-full bg-border" /></div>
          <form onSubmit={onCredentials} className="space-y-3">
            <Input type="email" placeholder={t('email')} value={email} onChange={(e) => setEmail(e.target.value)} required />
            <div className="relative">
              <Input type={showPassword ? 'text' : 'password'} placeholder={t('password')} value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" aria-label="Toggle password" onClick={() => setShowPassword((v) => !v)} className="absolute inset-y-0 right-2 flex items-center text-muted-foreground">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Button type="submit" disabled={loading} className="w-full">{t('submit')}</Button>
          </form>
          {providers?.email && (
          <form onSubmit={onMagicLink} className="space-y-3">
            <Input type="email" placeholder={t('magicPlaceholder')} value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Button type="submit" disabled={loading} variant="secondary" className="w-full">{t('magicButton')}</Button>
          </form>
          )}
          {needsVerify && (
            <div className="rounded-md border bg-accent p-3 text-sm">
              <div className="mb-2">{t('verifyPrompt')}</div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={resendOtp}>{t('resendCode')}</Button>
                <Button variant="outline" onClick={onMagicLink}>{t('magicButton')}</Button>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <p className="w-full text-center text-sm text-muted-foreground">
            {t('noAccount')} <Link href={`/${locale}/auth/signup`} className="underline">{t('createOne')}</Link>
          </p>
        </CardFooter>
      </Card>
      </div>
    </div>
  );
}
