import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Github, Mail, Twitter, Shield, Globe, Heart } from 'lucide-react';

export async function Footer({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'footer' });
  return (
    <footer className="mt-0 border-t bg-card/30 backdrop-blur-sm">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
      
      <div className="relative">
        {/* Main footer content */}
        <div className="container mx-auto px-4 sm:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
            
            {/* Brand section */}
            <div className="md:col-span-2 space-y-4">
              <Link href={`/${locale}`} className="inline-flex items-center gap-3 group">
                <div className="relative">
                  <Image src="/logo.svg" width={32} height={32} alt="" className="transition-transform group-hover:scale-110" />
                </div>
                <span className="text-xl font-bold">
                  Minden
                </span>
              </Link>
              <p className="text-muted-foreground leading-relaxed max-w-md">
                Protégez votre infrastructure avec des honeypots intelligents. 
                Détection avancée des menaces par IA et analyse en temps réel.
              </p>
              <div className="flex items-center gap-4 pt-2">
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center justify-center h-10 w-10 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
                  aria-label="GitHub"
                >
                  <Github className="h-4 w-4" />
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center justify-center h-10 w-10 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
                  aria-label="Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </a>
                <a 
                  href="mailto:contact@minden.app" 
                  className="flex items-center justify-center h-10 w-10 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
                  aria-label="Email"
                >
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Navigation links */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Produit
              </h3>
              <nav className="flex flex-col space-y-3">
                <Link href={`/${locale}/machines`} className="text-muted-foreground hover:text-foreground transition-colors duration-200 hover:translate-x-1 transform">
                  Machines
                </Link>
                <Link href={`/${locale}/subscriptions`} className="text-muted-foreground hover:text-foreground transition-colors duration-200 hover:translate-x-1 transform">
                  Abonnements
                </Link>
                <Link href={`/${locale}/trending`} className="text-muted-foreground hover:text-foreground transition-colors duration-200 hover:translate-x-1 transform">
                  {t('trending')}
                </Link>
                <Link href={`/${locale}/categories`} className="text-muted-foreground hover:text-foreground transition-colors duration-200 hover:translate-x-1 transform">
                  {t('categories')}
                </Link>
              </nav>
            </div>

            {/* Support links */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                Support
              </h3>
              <nav className="flex flex-col space-y-3">
                <Link href={`/${locale}/settings`} className="text-muted-foreground hover:text-foreground transition-colors duration-200 hover:translate-x-1 transform">
                  {t('settings')}
                </Link>
                <Link href={`/${locale}/help`} className="text-muted-foreground hover:text-foreground transition-colors duration-200 hover:translate-x-1 transform">
                  Aide
                </Link>
                <Link href={`/${locale}/docs`} className="text-muted-foreground hover:text-foreground transition-colors duration-200 hover:translate-x-1 transform">
                  Documentation
                </Link>
                <Link href={`/${locale}/contact`} className="text-muted-foreground hover:text-foreground transition-colors duration-200 hover:translate-x-1 transform">
                  Contact
                </Link>
              </nav>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border/50">
          <div className="container mx-auto px-4 sm:px-8 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>© {new Date().getFullYear()} Minden.</span>
                <span>Tous droits réservés.</span>
              </div>
              <div className="flex items-center gap-6">
                <Link href={`/${locale}/privacy`} className="hover:text-foreground transition-colors">
                  Confidentialité
                </Link>
                <Link href={`/${locale}/terms`} className="hover:text-foreground transition-colors">
                  Conditions
                </Link>
                <div className="flex items-center gap-1 text-xs">
                  <span>Fait avec</span>
                  <Heart className="h-3 w-3 text-red-500 fill-current" />
                  <span>en France</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
