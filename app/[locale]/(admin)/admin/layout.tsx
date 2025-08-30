import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/sidebar';

export default async function AdminLayout({ children, params: { locale } }: { children: React.ReactNode; params: { locale: string } }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session?.user || role !== 'ADMIN') redirect(`/${locale}`);
  const base = `/${locale}`;
  return (
    <div className="flex min-h-[calc(100vh-56px)]">
      <AdminSidebar base={base} />
      <div className="flex grow flex-col">
        <div className="p-6 w-full">{children}</div>
      </div>
    </div>
  );
}
