import '../globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Header } from '@/components/header';
import { locales, type Locale } from '@/lib/i18n/config';
import { AppProviders } from '@/components/app-providers';
import { VibrantMesh } from '@/components/backgrounds/VibrantMesh';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ToastEvents } from '@/components/toast-events';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    default: 'Minden',
    template: 'Minden | %s',
  },
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
};

export function generateStaticParams() {
  return locales.map((l) => ({ locale: l }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: Locale };
}) {
  const { locale } = params;
  const messages = await getMessages();
  const session = await getServerSession(authOptions);

  return (
    <html lang={locale} >
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AppProviders session={session}>
            <div className="relative isolate min-h-screen pb-8">
              <div className="pointer-events-none absolute inset-0 -z-10">
                <VibrantMesh />
              </div>
              <Header locale={locale} />
              <ToastEvents />
              <main className="container relative z-10 py-8">{children}</main>
            </div>
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
