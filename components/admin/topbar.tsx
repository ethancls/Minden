"use client";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

export function AdminTopbar() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/70 px-4 backdrop-blur">
      <Input placeholder="Search..." className="w-72" />
      <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
    </div>
  );
}

