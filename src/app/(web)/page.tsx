import Features from "@/app/(web)/_components/features";
import {
    WebPageHeader,
    WebPageWrapper,
} from "@/app/(web)/_components/general-components";
import { Promotion } from "@/app/(web)/_components/promotion";
import { Testimonials } from "@/app/(web)/_components/testimonials";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { siteUrls } from "@/config/urls";
import Image from "next/image";
import Link from "next/link";
import Balancer from "react-wrap-balancer";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Le role mining intelligent",
};

export const dynamic = "force-static";

export default async function HomePage() {
    return (
        <WebPageWrapper>
            <WebPageHeader
                badge="Simplifier les processus métiers avec Minden"
                title="Minden — Le role mining intelligent"
            >
                <Balancer
                    as="p"
                    className="text-center text-base text-muted-foreground sm:text-lg"
                >
                    Créer un compte sur Minden et commencer à utiliser le role mining intelligent pour automatiser la gestion des rôles et des permissions dans vos applications. Minden vous aide à simplifier les processus métiers en analysant les données d'utilisation et en générant des recommandations basées sur l'IA.
                </Balancer>

                <div className="flex items-center gap-3">
                    <Link
                        href={siteUrls.github}
                        className={buttonVariants({ variant: "outline" })}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Icons.gitHub className="mr-2 h-4 w-4" /> Github
                    </Link>

                    <Link
                        href={siteUrls.auth.signup}
                        className={buttonVariants()}
                    >
                        Créer un compte
                    </Link>
                </div>
            </WebPageHeader>

            <div className="-m-2 w-full rounded-xl bg-foreground/5 p-2 ring-1 ring-inset ring-foreground/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                <div className="relative aspect-video w-full rounded-md bg-muted">
                    <Image
                        src="https://utfs.io/f/43bbc3c8-cf3c-4fae-a0eb-9183f1779489-294m81.png"
                        alt="dashboard preview"
                        fill
                        className="block rounded-md border border-border dark:hidden"
                        priority
                    />

                    <Image
                        src="https://utfs.io/f/fddea366-51c6-45f4-bd54-84d273ad9fb9-1ly324.png"
                        alt="dashboard preview"
                        fill
                        className="hidden rounded-md border border-border dark:block"
                        priority
                    />
                </div>
            </div>

            <Promotion />

            <Features />

            <Testimonials />
        </WebPageWrapper>
    );
}
