'use client';

import { Switch } from '@/components/radix/switch';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export const ThemeSwitcher = ({ className }: { className?: string }) => {
  const { resolvedTheme: theme, setTheme } = useTheme();

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    isClient && (
      <Switch
        className={className}
        leftIcon={<Sun />}
        rightIcon={<Moon />}
        checked={theme === 'dark'}
        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
      />
    )
  );
};
