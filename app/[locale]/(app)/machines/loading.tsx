"use client";
import { LogoLoader } from '@/components/ui/logo-loader';

export default function Loading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <LogoLoader size={72} />
    </div>
  );
}

