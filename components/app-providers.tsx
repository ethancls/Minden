"use client";
import { ThemeProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';
import { Toaster } from '@/components/ui/sonner';

export function AppProviders({ children, session }: { children: React.ReactNode; session?: Session | null }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider session={session}>
        {children}
        <Toaster richColors position="bottom-right" />
      </SessionProvider>
    </ThemeProvider>
  );
}
