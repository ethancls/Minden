import { AppPageShell } from "@/app/(app)/_components/page-shell";
import { RevenueChart } from "@/app/(app)/admin/dashboard/_components/revenue-chart";
import { StatsCard } from "@/app/(app)/admin/dashboard/_components/stats-card";
import { SubsChart } from "@/app/(app)/admin/dashboard/_components/subs-chart";
import { UsersChart } from "@/app/(app)/admin/dashboard/_components/users-chart";
import { adminDashConfig } from "@/app/(app)/admin/dashboard/_constants/page-config";
import { buttonVariants } from "@/components/ui/button";
import { siteUrls } from "@/config/urls";
import { cn } from "@/lib/utils";
import {
    getRevenueCount,
    getSubscriptionsCount,
} from "@/server/actions/subscription/query";
import { getUsersCount } from "@/server/actions/user/queries";
import {
    DollarSignIcon,
    UserRoundCheckIcon,
    UserRoundPlusIcon,
    Users2Icon,
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashPage() {
    const usersCountData = await getUsersCount();
    const usersChartData = usersCountData.usersCountByMonth;

    // Désactiver LemonSqueezy si pas de clé API configurée
    let subscriptionsCountData = { totalCount: 0, subscriptionsCountByMonth: [] };
    let activeSubscriptionsCountData = { totalCount: 0 };
    let revenueCountData = { totalRevenue: "€0", revenueCountByMonth: [] };
    
    try {
        // Vérifier si LemonSqueezy est configuré
        if (process.env.LEMONSQUEEZY_API_KEY && process.env.LEMONSQUEEZY_API_KEY.trim() !== "") {
            subscriptionsCountData = await getSubscriptionsCount({});
            activeSubscriptionsCountData = await getSubscriptionsCount({
                status: "active",
            });
            revenueCountData = await getRevenueCount();
        }
    } catch (error) {
        console.warn("LemonSqueezy not configured, using default values");
    }
    
    const subsChartData = subscriptionsCountData.subscriptionsCountByMonth;
    const revenueChartData = revenueCountData.revenueCountByMonth;

    return (
        <AppPageShell
            title={adminDashConfig.title}
            description={adminDashConfig.description}
        >
            <div className="grid w-full gap-8">
                <p className="text-sm">
                    Ceci est un tableau de bord simple avec Analytics. Pour voir des analyses détaillées, allez sur{" "}
                    <Link
                        href={siteUrls.admin.analytics}
                        className={cn(
                            buttonVariants({
                                variant: "link",
                                size: "default",
                                className: "px-0 underline",
                            }),
                        )}
                    >
                        Tableau de bord PostHog
                    </Link>
                </p>

                {(!process.env.LEMONSQUEEZY_API_KEY || process.env.LEMONSQUEEZY_API_KEY.trim() === "") && (
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950 dark:text-yellow-200">
                        <p><strong>Note :</strong> LemonSqueezy n'est pas configuré. Les données de revenus et d'abonnements affichent des valeurs par défaut.</p>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatsCard
                        title="Utilisateurs"
                        value={String(usersCountData.totalCount)}
                        Icon={Users2Icon}
                        subText="Total des utilisateurs inscrits"
                    />

                    <StatsCard
                        title="Revenus"
                        value={revenueCountData.totalRevenue}
                        Icon={DollarSignIcon}
                        subText="Revenus totaux générés"
                    />

                    <StatsCard
                        title="Abonnements"
                        value={String(subscriptionsCountData.totalCount)}
                        Icon={UserRoundPlusIcon}
                        subText="Total des abonnements souscrits"
                    />

                    <StatsCard
                        title="Abonnements actifs"
                        value={String(activeSubscriptionsCountData.totalCount)}
                        Icon={UserRoundCheckIcon}
                        subText="Abonnements actuellement actifs"
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <UsersChart data={usersChartData} />

                    <SubsChart data={subsChartData} />

                    <RevenueChart data={revenueChartData} />
                </div>
            </div>
        </AppPageShell>
    );
}
