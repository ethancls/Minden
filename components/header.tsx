"use client";
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Moon, Sun, Menu, Settings, CreditCard, LogOut, Gauge } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSession, signOut } from 'next-auth/react';
import { Sheet, SheetTrigger, SheetContent, SheetClose } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function Header({ locale }: { locale: string }) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const base = `/${locale}`;

  // Keep header visible on all routes, including admin

  function switchLocale(nextLocale: string) {
    if (nextLocale === locale) return;
    const segments = pathname.split('/');
    if (segments[1]) {
      segments[1] = nextLocale;
      const next = segments.join('/') || '/';
      router.push(next);
    } else {
      router.push(`/${nextLocale}`);
    }
  }

  return (
    <header className={`sticky top-0 z-40 w-full transition-colors ${scrolled ? 'border-b bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/60' : 'border-transparent bg-transparent'}`}>
      <div className="container flex h-14 items-center gap-3">
        <Link href={base} className="flex items-center gap-2 font-semibold text-lg">
          <Image src="/logo.svg" width={28} height={28} alt="" />
          <span>Minden</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href={`${base}/machines`} className="text-muted-foreground hover:text-foreground">
            {t('machines')}
          </Link>
          <Link href={`${base}/subscriptions`} className="text-muted-foreground hover:text-foreground">
            {t('subscriptions')}
          </Link>
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            <Sun className="h-4 w-4 dark:hidden" />
            <Moon className="hidden h-4 w-4 dark:block" />
          </Button>
          <Select value={locale} onValueChange={switchLocale}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder={t('language')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">{t('lang.en')}</SelectItem>
              <SelectItem value="fr">{t('lang.fr')}</SelectItem>
              <SelectItem value="ru">{t('lang.ru')}</SelectItem>
            </SelectContent>
          </Select>
          {session?.user ? (
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <Avatar>
                    <AvatarImage src={(session.user as any).image || ''} alt="" />
                    <AvatarFallback>{(session.user?.name || 'U').slice(0,1).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    {(session.user?.email) || ''}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`${base}/machines`} className="flex items-center gap-2"><Gauge className="h-4 w-4" />{t('machines')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`${base}/settings`} className="flex items-center gap-2"><Settings className="h-4 w-4" />{t('settings')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`${base}/subscriptions`} className="flex items-center gap-2"><CreditCard className="h-4 w-4" />{t('subscriptions')}</Link>
                  </DropdownMenuItem>
                  {(session.user as any).role === 'ADMIN' && (
                    <DropdownMenuItem asChild>
                      <Link href={`${base}/admin`} className="flex items-center gap-2"><Gauge className="h-4 w-4" />{t('admin')}</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => signOut({ callbackUrl: base })} className="flex items-center gap-2"><LogOut className="h-4 w-4" />{t('logout')}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href={`${base}/auth/signin`}>
                <Button variant="ghost">{t('signin')}</Button>
              </Link>
              <Link href={`${base}/auth/signup`}>
                <Button>{t('signup')}</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu amélioré */}
        <div className="md:hidden ml-auto">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Ouvrir le menu"><Menu className="h-5 w-5" /></Button>
            </SheetTrigger>
            <SheetContent>
              <div className="space-y-6 pt-2">
                <div className="flex items-center gap-3 pb-2 border-b">
                  <Link href={base} className="flex items-center gap-2 font-bold text-lg">
                    <Image src="/logo.svg" width={28} height={28} alt="" />
                    <span>Minden</span>
                  </Link>
                  <div className="ml-auto flex gap-2">
                    <Button variant="ghost" size="icon" aria-label="Changer le thème" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                      <Sun className="h-4 w-4 dark:hidden" />
                      <Moon className="hidden h-4 w-4 dark:block" />
                    </Button>
                    <Select value={locale} onValueChange={switchLocale}>
                      <SelectTrigger className="w-[90px]"><SelectValue placeholder={t('language')} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">{t('lang.en')}</SelectItem>
                        <SelectItem value="fr">{t('lang.fr')}</SelectItem>
                        <SelectItem value="ru">{t('lang.ru')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {/* Utilisateur connecté */}
                {session?.user ? (
                  <div className="flex items-center gap-3 pb-2 border-b">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={(session.user as any).image || ''} alt="" />
                      <AvatarFallback>{(session.user?.name || 'U').slice(0,1).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="text-xs font-medium">{session.user?.name}</div>
                      <div className="text-xs text-muted-foreground">{session.user?.email}</div>
                    </div>
                  </div>
                ) : null}
                {/* Liens principaux */}
                <div className="grid gap-2 pb-2 border-b">
                  <SheetClose asChild><Link href={`${base}/machines`} className="rounded-md px-2 py-2 hover:bg-accent flex items-center gap-2"><Gauge className="h-4 w-4" />{t('machines')}</Link></SheetClose>
                  <SheetClose asChild><Link href={`${base}/subscriptions`} className="rounded-md px-2 py-2 hover:bg-accent flex items-center gap-2"><CreditCard className="h-4 w-4" />{t('subscriptions')}</Link></SheetClose>
                  <SheetClose asChild><Link href={`${base}/settings`} className="rounded-md px-2 py-2 hover:bg-accent flex items-center gap-2"><Settings className="h-4 w-4" />{t('settings')}</Link></SheetClose>
                  {(session?.user as any)?.role === 'ADMIN' && (
                    <SheetClose asChild><Link href={`${base}/admin`} className="rounded-md px-2 py-2 hover:bg-accent flex items-center gap-2"><Gauge className="h-4 w-4" />{t('admin')}</Link></SheetClose>
                  )}
                </div>
                {/* Authentification / Déconnexion */}
                <div className="pt-2">
                  {session?.user ? (
                    <Button variant="outline" className="w-full flex items-center gap-2" onClick={() => signOut({ callbackUrl: base })}><LogOut className="h-4 w-4" />{t('logout')}</Button>
                  ) : (
                    <SheetClose asChild><Link href={`${base}/auth/signin`}><Button className="w-full">{t('signin')}</Button></Link></SheetClose>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
