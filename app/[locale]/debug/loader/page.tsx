"use client";
import { LogoLoader } from '@/components/ui/logo-loader';

export default function LoaderDemo() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <LogoLoader size={80} />
    </div>
  );
}

