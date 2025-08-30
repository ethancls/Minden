"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export function RotateToken({ machineId }: { machineId: string }) {
  const t = useTranslations('machines');
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function rotate() {
    try {
      setLoading(true);
      const res = await fetch(`/api/machines/${machineId}/rotate-token`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'ROTATE_FAILED');
      setToken(data.token);
      setOpen(true);
      toast.success(t('toast.tokenRotated'));
    } catch {
      toast.error(t('toast.failed'));
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token);
      toast.success(t('onboard.copy'));
    } catch {}
  }

  return (
    <>
      <Button variant="outline" onClick={rotate} disabled={loading}>
        {t('rotateToken')}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild></DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('newToken')}</DialogTitle>
            <DialogDescription>{t('tokenShownOnce')}</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <Input readOnly value={token ?? ''} />
            <Button variant="outline" onClick={copy}>{t('onboard.copy')}</Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setOpen(false)}>{t('close')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
