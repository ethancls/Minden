"use client";
import { useCallback, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export default function SignUpPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('auth.signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const computePasswordScore = useCallback((pw: string) => {
    let score = 0;
    if (pw.length >= 12) score += 2; else if (pw.length >= 8) score += 1;
    if (/[a-z]/.test(pw)) score += 1;
    if (/[A-Z]/.test(pw)) score += 1;
    if (/[0-9]/.test(pw)) score += 1;
    if (/[^A-Za-z0-9]/.test(pw)) score += 1;
    const weak = ['password', '123456', 'qwerty'];
    if (weak.some((w) => pw.toLowerCase().includes(w))) score = Math.max(0, score - 2);
    if (email && pw.toLowerCase().includes(email.split('@')[0]?.toLowerCase() || '')) score = Math.max(0, score - 1);
    return Math.min(score, 6);
  }, [email]);
  const strength = useMemo(() => computePasswordScore(password), [password, computePasswordScore]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, locale }),
    });
    setLoading(false);
    if (res.ok) {
      try {
        const callbackUrl = `/${locale}`;
        const mod = await import('next-auth/react');
        await mod.signIn('email', { email, callbackUrl, redirect: false });
      } catch {}
      toast.success(t('toast.magicSent', { default: 'Magic link sent. Check your email.' }));
      window.location.href = `/${locale}/auth/verify?email=${encodeURIComponent(email)}`;
    } else {
      let data: { error?: string } = {};
      try { data = await res.json(); } catch {}
      const code = String(data?.error || '');
      if (code === 'EMAIL_TAKEN') toast.error(t('toast.emailTaken'));
      else if (code === 'INVALID_INPUT') toast.error(t('toast.invalidInput'));
      else if (code === 'RATE_LIMITED') toast.error(t('toast.rateLimited'));
      else toast.error(t('toast.failed'));
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full items-center justify-center">
      <div className="w-full max-w-md">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>{t('title')}</CardTitle>
          </div>
          <CardDescription>{t('desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-3">
            <Input placeholder={t('name')} value={name} onChange={(e) => setName(e.target.value)} />
            <Input type="email" placeholder={t('email')} value={email} onChange={(e) => setEmail(e.target.value)} required />
            <div className="space-y-2">
              <div className="relative">
                <Input type={showPassword ? 'text' : 'password'} placeholder={t('password')} value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" aria-label="Toggle password" onClick={() => setShowPassword((v) => !v)} className="absolute inset-y-0 right-2 flex items-center text-muted-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="h-1 w-full rounded bg-muted">
                <div className={`h-full rounded ${strength >= 5 ? 'bg-green-500' : strength >= 3 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${(strength/6)*100}%` }} />
              </div>
              <div className="text-xs text-muted-foreground">
                {strength >= 5 ? (locale === 'fr' ? 'Mot de passe fort' : 'Strong password') : strength >= 3 ? (locale === 'fr' ? 'Mot de passe moyen' : 'Medium password') : (locale === 'fr' ? 'Mot de passe faible' : 'Weak password')}
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full">{t('submit')}</Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="w-full text-center text-sm text-muted-foreground">
            {t('haveAccount')} <Link href={`/${locale}/auth/signin`} className="underline">{t('signin')}</Link>
          </p>
        </CardFooter>
      </Card>
      </div>
    </div>
  );
}
