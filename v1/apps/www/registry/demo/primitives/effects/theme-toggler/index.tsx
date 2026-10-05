import React from 'react';
import { useTheme } from 'next-themes';
import { Monitor, Moon, Sun } from 'lucide-react';

import {
  ThemeToggler,
  type ThemeSelection,
  type Resolved,
  type Direction,
} from '@/registry/primitives/effects/theme-toggler';

interface ThemeTogglerDemoProps {
  direction: Direction;
}

export const ThemeTogglerDemo = ({ direction }: ThemeTogglerDemoProps) => {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <ThemeToggler
      theme={theme as ThemeSelection}
      resolvedTheme={resolvedTheme as Resolved}
      setTheme={setTheme}
      direction={direction}
    >
      {({ effective, toggleTheme }) => {
        const nextTheme =
          effective === 'dark'
            ? 'light'
            : effective === 'system'
              ? 'dark'
              : 'system';

        return (
          <button onClick={() => toggleTheme(nextTheme)}>
            {effective === 'system' ? (
              <Monitor />
            ) : effective === 'dark' ? (
              <Moon />
            ) : (
              <Sun />
            )}
          </button>
        );
      }}
    </ThemeToggler>
  );
};
