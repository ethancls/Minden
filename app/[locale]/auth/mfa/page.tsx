"use client";
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function MfaPage() {
  const tMfa = useTranslations('auth.mfa');
  const [secret, setSecret] = useState<string | null>(null);
  const [otpauth, setOtpauth] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  async function enroll() {
    setMessage(null);
    const res = await fetch('/api/auth/mfa/totp/enroll', { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      setSecret(data.secret);
      setOtpauth(data.otpauth);
      toast.success(tMfa('secretGenerated'));
    } else {
      setMessage(data.error || 'Failed');
      toast.error(data.error || tMfa('invalid'));
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const res = await fetch('/api/auth/mfa/totp/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) });
    const data = await res.json();
    if (res.ok) { setMessage(tMfa('enabled')); toast.success(tMfa('enabled')); }
    else { setMessage(data.error || tMfa('invalid')); toast.error(data.error || tMfa('invalid')); }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full items-center justify-center">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Multi‑factor authentication</CardTitle>
            <CardDescription>Enable TOTP with an authenticator app.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={enroll} variant="secondary">{secret ? 'Regenerate secret' : 'Start setup'}</Button>
            {secret && (
              <div className="space-y-2 text-sm">
                <div className="text-muted-foreground">Secret (Base32)</div>
                <div className="rounded bg-secondary p-2 break-all">{secret}</div>
                {otpauth && (
                  <div className="text-xs text-muted-foreground break-all">otpauth: {otpauth}</div>
                )}
                <form onSubmit={verify} className="space-y-2">
                  <Input placeholder="Enter 6‑digit code" value={code} onChange={(e) => setCode(e.target.value)} />
                  <Button type="submit" disabled={code.length !== 6}>Verify & enable</Button>
                </form>
              </div>
            )}
            {message && <div className="text-sm text-muted-foreground">{message}</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
