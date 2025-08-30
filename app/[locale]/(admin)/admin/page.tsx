import { prisma } from '@/lib/prisma';
// import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, Server, Activity } from 'lucide-react';
// Removed unused Table imports
import { MachinesChart, UsersChart } from '@/components/admin/charts';
import { getTranslations } from 'next-intl/server';
export const metadata = { title: 'Admin' };

export default async function AdminDashboard({ params: { locale } }: { params: { locale: string } }) {
  const [users, tenants, machines, logs] = await Promise.all([
    prisma.user.count(),
    prisma.tenant.count(),
    prisma.machine.count(),
    prisma.logEvent.count(),
  ]);

  // Build last 14 days activity data
  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const [machineDates, userDates, logDates] = await Promise.all([
    prisma.machine.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.user.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.logEvent.findMany({ where: { ts: { gte: since } }, select: { ts: true } }),
  ]);

  function buildSeries(dates: { createdAt?: Date; ts?: Date }[]) {
    const map = new Map<string, number>();
    for (let i = 0; i < 14; i++) {
      const d = new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      map.set(key, 0);
    }
    for (const rec of dates) {
      const dt = (rec.createdAt || rec.ts)!;
      const key = dt.toISOString().slice(0, 10);
      if (map.has(key)) map.set(key, (map.get(key) || 0) + 1);
    }
    return Array.from(map.entries()).map(([date, value]) => ({ date, value }));
  }

  const chartData = {
    machines: buildSeries(machineDates),
    users: buildSeries(userDates),
    logs: buildSeries(logDates),
  };
  const t = await getTranslations({ locale, namespace: 'admin' });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t('dashboard.title', { default: 'Dashboard' })}</h1>
        <p className="text-sm text-muted-foreground">{t('dashboard.subtitle', { default: 'Overview of system activity' })}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('metrics.users')}</CardTitle>
            <span className="rounded-md bg-muted p-2 text-muted-foreground"><Users className="h-4 w-4" /></span>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{users}</CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('metrics.tenants')}</CardTitle>
            <span className="rounded-md bg-muted p-2 text-muted-foreground"><Building2 className="h-4 w-4" /></span>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{tenants}</CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('metrics.machines')}</CardTitle>
            <span className="rounded-md bg-muted p-2 text-muted-foreground"><Server className="h-4 w-4" /></span>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{machines}</CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('metrics.logs')}</CardTitle>
            <span className="rounded-md bg-muted p-2 text-muted-foreground"><Activity className="h-4 w-4" /></span>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{logs}</CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>{t('charts.machinesCreated14')}</CardTitle></CardHeader>
          <CardContent className="h-64">
            <MachinesChart data={chartData.machines} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{t('charts.newUsers')}</CardTitle></CardHeader>
          <CardContent className="h-64">
            <UsersChart data={chartData.users} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
