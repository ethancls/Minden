"use client";
import * as React from 'react';
import { useSession, signIn } from 'next-auth/react';
import { LogoLoader } from '@/components/ui/logo-loader';

export function Protected({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const triggered = React.useRef(false);

  React.useEffect(() => {
    if (status === 'unauthenticated' && !triggered.current) {
      triggered.current = true;
      // Fallback in case middleware didn't catch it
      const callbackUrl = typeof window !== 'undefined' ? window.location.href : undefined;
      signIn(undefined, callbackUrl ? { callbackUrl } : undefined);
    }
  }, [status]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-[40vh] w-full items-center justify-center">
        <LogoLoader size={64} />
      </div>
    );
  }

  if (status !== 'authenticated') {
    return (
      <div className="flex min-h-[40vh] w-full items-center justify-center">
        <LogoLoader size={64} />
      </div>
    );
  }

  return <>{children}</>;
}

