"use client";
import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export function ToastEvents() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tTenants = useTranslations('tenants');
  const tAdminSettings = useTranslations('admin.settings');
  const tMachines = useTranslations('machines');

  useEffect(() => {
    const key = sp.get('toast');
    if (!key) return;
    switch (key) {
      case 'tenant_selected':
        toast.success(tTenants('toast.selected'));
        break;
      case 'tenant_created':
        toast.success(tTenants('toast.created'));
        break;
      case 'settings_saved':
        toast.success(tAdminSettings('toast.saved'));
        break;
      case 'machine_saved':
        toast.success(tMachines('toast.saved'));
        break;
      case 'machine_deleted':
        toast.success(tMachines('toast.deleted'));
        break;
      case 'machine_connected':
        toast.success(tMachines('toast.connected'));
        break;
      default:
        break;
    }
    // remove the param
    const next = new URLSearchParams(Array.from(sp.entries()));
    next.delete('toast');
    router.replace(`${pathname}${next.size ? `?${next.toString()}` : ''}`);
  }, [sp, pathname, router, tTenants, tAdminSettings, tMachines]);

  return null;
}
