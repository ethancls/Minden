import {
    BarChart4Icon,
    BookTextIcon,
    Building2Icon,
    ClipboardListIcon,
    CreditCardIcon,
    HelpCircleIcon,
    LayoutDashboardIcon,
    MessageSquareIcon,
    PenLineIcon,
    Settings2Icon,
    UserRoundCheckIcon,
    UserRoundPlusIcon,
    UsersRoundIcon,
    UsersIcon,
    BrainIcon,
    NetworkIcon,
    UploadIcon,
    GitGraph,
    LucideGitGraph,
    GitBranchPlus,
    GemIcon,
} from "lucide-react";
import { siteUrls } from "@/config/urls";
import { AvatarIcon } from "@radix-ui/react-icons";

/**
 * This file contains the configuration for the navigation items in the sidebar
 * to add a new navigation item, you can add a new object to the navigation array
 * 1 id: a unique id for the navigation, add it to the navIds object
 * 2 label: the label for the navigation (it's a category label)
 * 3 showLabel: if true, the label will be shown in the sidebar (it's a category label)
 * 4 items: an array of navigation items
 *   - label: the label for the navigation item
 *   - icon: the icon for the navigation item
 *   - href: the href for the navigation item
 *   - subMenu: an array of subMenu items
 *     > label: the label for the subMenu item
 *     > href: the href for the subMenu item
 *     > icon: the icon for the subMenu item
 *
 * @use specific navigation items in the sidebar, you can use the filterNavItems function
 */

type IconProps = React.HTMLAttributes<SVGElement>;

type NavItemBase = {
    label: string;
    icon: React.ComponentType<IconProps>;
    disabled?: boolean;
};

type NavItemWithHref = NavItemBase & {
    href: string;
    external?: boolean;
    subMenu?: never;
};

type NavItemWithSubMenu = NavItemBase & {
    href?: never;
    subMenu: {
        label: string;
        href: string;
        icon: React.ComponentType<IconProps>;
        external?: boolean;
        disabled?: boolean;
    }[];
};

type NavItem = NavItemWithHref | NavItemWithSubMenu;

export type SidebarNavItems = {
    id: string;
    label: string;
    showLabel?: boolean;
    items: NavItem[];
};

const navIds = {
    admin: "admin",
    general: "general",
    teams: "teams",
    org: "org",
    resources: "resources",
};

const navigation: SidebarNavItems[] = [
    {
        id: navIds.admin,
        label: "Admin",
        showLabel: true,
        items: [
            {
                label: "Dashboard",
                icon: LayoutDashboardIcon,
                href: siteUrls.admin.dashboard,
            },
            {
                label: "Utilisateurs",
                icon: UsersRoundIcon,
                href: siteUrls.admin.users,
            },
            {
                label: "Organisations",
                icon: Building2Icon,
                href: siteUrls.admin.organizations,
            },
            {
                label: "Liste d'attente",
                icon: ClipboardListIcon,
                href: siteUrls.admin.waitlist,
            },
            {
                label: "Statistiques",
                icon: BarChart4Icon,
                href: siteUrls.admin.analytics,
            },
            {
                label: "Feedbacks",
                icon: HelpCircleIcon,
                href: siteUrls.admin.feedbacks,
            },
        ],
    },
    {
        id: navIds.general,
        label: "Général",
        showLabel: true,
        items: [
            {
                label: "Dashboard",
                icon: LayoutDashboardIcon,
                href: siteUrls.dashboard.home,
            },
        ],
    },
    {
        id: navIds.teams,
        label: "Analyse d'équipes",
        showLabel: true,
        items: [
            {
                label: "Équipes",
                icon: UsersIcon,
                subMenu: [
                    {
                        label: "Datasets",
                        icon: NetworkIcon,
                        href: siteUrls.teams.home,
                    },
                    {
                        label: "Importer",
                        icon: UploadIcon,
                        href: siteUrls.teams.import,
                    },
                ],
            },
            {
                label: "Den",
                icon: GemIcon,
                href: siteUrls.teams.den,
            },
        ],
    },
    {
        id: navIds.org,
        label: "Organisation",
        showLabel: true,
        items: [
            {
                label: "Membres",
                icon: UsersRoundIcon,
                subMenu: [
                    {
                        label: "Liste",
                        icon: UserRoundCheckIcon,
                        href: siteUrls.organization.members.home,
                    },
                    {
                        label: "Inviter",
                        icon: UserRoundPlusIcon,
                        href: siteUrls.organization.members.invite,
                    },
                ],
            },
            {
                label: "Abonnement",
                icon: CreditCardIcon,
                href: siteUrls.organization.plansAndBilling,
            },
            {
                label: "Paramètres",
                icon: Settings2Icon,
                href: siteUrls.organization.settings,
            },
        ],
    },
    {
        id: navIds.resources,
        label: "Resources",
        showLabel: true,
        items: [
            {
                label: "Feedbacks",
                icon: MessageSquareIcon,
                href: siteUrls.feedback,
            },
            {
                label: "Documentation",
                icon: BookTextIcon,
                href: siteUrls.docs,
            },
            {
                label: "Presse",
                icon: PenLineIcon,
                href: siteUrls.blogs,
            },
            {
                label: "Support",
                icon: HelpCircleIcon,
                href: siteUrls.support,
            },
        ],
    },
];

type FilterNavItemsProps = {
    removeIds?: string[];
    includedIds?: string[];
};

/**
 * @purpose Filters the navigation items for the sidebar.
 * The filterNavItems function filters the navigation items for the sidebar.
 * @param removeIds An array of string identifiers to remove from the navigation items.
 * @param includeIds An array of string identifiers to include in the navigation items.
 *
 * @returns The filtered navigation items for the sidebar.
 * */

export function filteredNavItems({
    removeIds = [],
    includedIds = [],
}: FilterNavItemsProps) {
    let includedItems = sidebarConfig.navigation;

    if (includedIds.length) {
        includedItems = includedItems.filter((item) =>
            includedIds.includes(item.id),
        );
    }

    if (removeIds.length) {
        includedItems = includedItems.filter(
            (item) => !removeIds.includes(item.id),
        );
    }

    return includedItems;
}

/**
 * The sidebarConfig is an object that contains the configuration for the dashboard
 * @export all the configuration for the sidebar in sidebarConfig
 */

export const sidebarConfig = {
    navIds,
    navigation,
    filteredNavItems,
} as const;
