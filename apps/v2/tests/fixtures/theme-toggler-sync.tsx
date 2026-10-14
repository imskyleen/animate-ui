'use client';

import * as React from 'react';
import {
  ThemeToggler,
  type Resolved,
  type ThemeSelection,
} from '@animate-ui/react/primitives/effects/theme-toggler';

export default function ThemeTogglerSyncFixture() {
  const [theme, setTheme] = React.useState<ThemeSelection>('light');

  return (
    <div className="flex flex-col items-start gap-4">
      <ThemeToggler
        theme={theme}
        resolvedTheme={theme as Resolved}
        setTheme={setTheme}
      >
        {({ effective }) => (
          <output data-testid="effective">{effective}</output>
        )}
      </ThemeToggler>
      <button onClick={() => setTheme('dark')}>Set dark elsewhere</button>
    </div>
  );
}
