import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Sparkles, Globe2, ShieldCheck, Bot, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default async function LandingPage({ params: { locale } }: { params: { locale: string } }) {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect(`/${locale}/dashboard`);
  }
  const tApp = await getTranslations({ locale, namespace: 'app' });
  const tLanding = await getTranslations({ locale, namespace: 'landing' });

  return (
    <div className="space-y-24 lg:space-y-32">
      {/* Hero Section améliorée */}
      <section className="relative overflow-hidden rounded-3xl border bg-card/50 backdrop-blur-sm">
        {/* Background gradients */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50/50 via-white to-orange-50/50 dark:from-blue-950/20 dark:via-background dark:to-orange-950/20" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(249,115,22,0.1),transparent_50%)]" />
        
        <div className="container mx-auto max-w-6xl px-4 sm:px-8 py-20 lg:py-32">
          <div className="text-center space-y-8">
            <h1 className="bg-gradient-to-r from-[#3B82F6] via-[#6366F1] to-[#F97316] bg-clip-text text-4xl font-bold tracking-tight text-transparent lg:text-7xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
              {tLanding('heroTitle')}
            </h1>
            <p className="mx-auto max-w-4xl text-lg text-muted-foreground lg:text-xl leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
              {tLanding('heroSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
              <Button asChild size="lg" className="h-12 px-8 text-base shadow-lg hover:shadow-xl transition-all duration-300">
                <Link href={`/${locale}/auth/signin`} className="inline-flex items-center group">
                  {tApp('ctaSignup')} 
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base border-2 hover:bg-muted/50 transition-all duration-300">
                <Link href={`/${locale}/subscriptions`} className="inline-flex items-center group">
                  {tLanding('ctaPlans')} 
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features améliorées */}
      <section className="container mx-auto max-w-6xl px-4 sm:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {([
            { Icon: Sparkles, key: 'f1' },
            { Icon: Bot, key: 'f2' },
            { Icon: Globe2, key: 'f3' },
            { Icon: ShieldCheck, key: 'f4' }
          ] as const).map(({ Icon, key }, i) => (
            <Card key={i} className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-lg">{tLanding(`features.${key}.title`)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{tLanding(`features.${key}.desc`)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Product highlights améliorés */}
      <section className="container mx-auto max-w-6xl px-4 sm:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {(['h1','h2','h3'] as const).map((k,i)=> (
            <Card key={i} className="group relative overflow-hidden border-0 bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-sm transition-all duration-500 hover:shadow-xl hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <CardContent className="relative p-8">
                <h3 className="mb-3 font-bold text-xl text-foreground">{tLanding(`highlights.${k}.title`)}</h3>
                <p className="text-muted-foreground leading-relaxed">{tLanding(`highlights.${k}.desc`)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section finale plus sobre */}
      <section className="container mx-auto max-w-6xl px-4 sm:px-8">
        <div className="relative overflow-hidden rounded-2xl border bg-card/80 backdrop-blur-sm shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10" />
          <div className="relative px-8 py-16 sm:px-16 sm:py-20 text-center">
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold flex items-center justify-center gap-3">
                {tLanding('ctaTitle')}
              </h2>
              <p className="mx-auto max-w-2xl text-lg sm:text-xl text-muted-foreground leading-relaxed">
                {tLanding('ctaSubtitle')}
              </p>
              <div className="pt-4">
                <Button asChild size="lg" className="h-14 px-10 text-lg shadow-lg transition-all duration-300">
                  <Link href={`/${locale}/subscriptions`} className="inline-flex items-center group">
                    {tLanding('ctaPlans')} 
                    <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-8 pt-6 text-sm text-muted-foreground">
                <div className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>{tLanding('ctaPerk1')}</span>
                </div>
                <div className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>{tLanding('ctaPerk2')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
export const metadata = { title: 'Minden' };
