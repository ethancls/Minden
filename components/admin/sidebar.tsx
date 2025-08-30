"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, User, Server } from 'lucide-react';

export function AdminSidebar({ base }: { base: string }) {
  const pathname = usePathname();
  const items = [
    { href: `${base}/admin`, label: 'Dashboard', icon: LayoutDashboard },
    { href: `${base}/machines`, label: 'Machines', icon: Server },
    { href: `${base}/admin/users`, label: 'Users', icon: User },
  ];
  return (
    <aside className="hidden w-60 shrink-0 border-r lg:block">
      <div className="p-4 text-lg font-semibold">Admin</div>
      <nav className="space-y-1 px-2">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              'flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent',
              pathname === it.href && 'bg-accent'
            )}
          >
            <it.icon className="h-4 w-4" /> {it.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
