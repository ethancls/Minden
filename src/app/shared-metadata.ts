import { siteConfig } from "@/config/site";
import { siteUrls } from "@/config/urls";
import type { Metadata } from "next";

export const defaultMetadata: Metadata = {
    icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon.ico",
        apple: "/icon-dark.png",
    },
    title: {
        template: `%s | ${siteConfig.name}`,
        default: siteConfig.name,
    },
    description: siteConfig.description,
    metadataBase: new URL(siteUrls.publicUrl),
    keywords: [
        "Role Mining",
        "RBAC",
        "Role-Based Access Control",
        "Access Control",
        "Access Management",
        "Role Management",
        "Role Analysis",
        "Role Optimization",
        "Role Engineering",
        "Role Discovery",
        "Role Design",
        "Role Governance",
        "Role Definition",
        "Role Assignment",
        "Role Hierarchy",
        "Role Permissions",
        "Role Modeling",
        "Role Analysis Tools",
        "AI Role Mining",
        "AI Role Mining Tools",
        "AI Role Mining Software",
        "AI Role Mining Solutions",
        "AI Role Mining Platform",
    ],
    authors: [{ name: "Ethan Nicolas", url: "https://portofolio.ethancls.com" }],
    creator: "Ethan Nicolas",
};

export const twitterMetadata: Metadata["twitter"] = {
    title: siteConfig.name,
    description: siteConfig.description,
    card: "summary_large_image",
    images: [siteConfig.orgImage],
    creator: "@ethancls",
};

export const ogMetadata: Metadata["openGraph"] = {
    title: siteConfig.name,
    description: siteConfig.description,
    type: "website",
    images: [{ url: siteConfig.orgImage, alt: siteConfig.name }],
    locale: "fr_FR",
    url: siteUrls.publicUrl,
    siteName: siteConfig.name,
};
