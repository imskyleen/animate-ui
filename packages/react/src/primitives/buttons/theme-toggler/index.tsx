'use client';

import * as React from 'react';
import type { Transition } from 'motion/react';

import { motionTokens } from '../../../utils/motion';
import { getStrictContext } from '../../../utils/strict-context';
import { Button, type ButtonProps } from '../button';
import { IconSwap } from '../_icon-swap';

type ThemeSelection = 'light' | 'dark' | 'system';
type Resolved = 'light' | 'dark';

type ThemeTogglerButtonContextType = {
  theme: ThemeSelection;
  effective: ThemeSelection;
  resolved: Resolved;
  next: ThemeSelection;
};

const [ThemeTogglerButtonProvider, useThemeTogglerButton] =
  getStrictContext<ThemeTogglerButtonContextType>('ThemeTogglerButtonContext');

const InstantContext = React.createContext(true);

function subscribeToNothing() {
  return () => {};
}

function useIsMounted() {
  return React.useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
}

const DEFAULT_MODES: ThemeSelection[] = ['light', 'dark', 'system'];

function getNextTheme(
  effective: ThemeSelection,
  resolved: Resolved,
  modes: ThemeSelection[],
): ThemeSelection {
  let i = modes.indexOf(effective);
  if (i === -1) i = modes.indexOf(resolved);
  if (i === -1) return modes[0] ?? resolved;
  return modes[(i + 1) % modes.length]!;
}

type ThemeTogglerButtonProps = ButtonProps & {
  theme: ThemeSelection;
  resolvedTheme: Resolved;
  setTheme: (theme: ThemeSelection) => void;
  modes?: ThemeSelection[];
};

function ThemeTogglerButton({
  theme,
  resolvedTheme,
  setTheme,
  modes = DEFAULT_MODES,
  onClick,
  ...props
}: ThemeTogglerButtonProps) {
  const mounted = useIsMounted();
  const [settled, setSettled] = React.useState(false);
  React.useEffect(() => {
    if (!mounted) return;
    const frame = requestAnimationFrame(() => setSettled(true));
    return () => cancelAnimationFrame(frame);
  }, [mounted]);

  const shown = modes.includes('system') ? theme : resolvedTheme;
  const next = getNextTheme(theme, resolvedTheme, modes);

  return (
    <ThemeTogglerButtonProvider
      value={{ theme: shown, effective: theme, resolved: resolvedTheme, next }}
    >
      <InstantContext value={!settled}>
        <Button
          data-slot="theme-toggler-button"
          data-theme={shown}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            onClick?.(event);
            if (event.defaultPrevented) return;
            setTheme(next);
          }}
          {...props}
        />
      </InstantContext>
    </ThemeTogglerButtonProvider>
  );
}

type ThemeTogglerButtonIconProps = Omit<
  React.ComponentProps<'span'>,
  'children'
> & {
  light: React.ReactNode;
  dark: React.ReactNode;
  system?: React.ReactNode;
  rotate?: number;
  transition?: Transition;
};

function ThemeTogglerButtonIcon({
  light,
  dark,
  system,
  rotate = motionTokens.rotate.icon,
  ...props
}: ThemeTogglerButtonIconProps) {
  const { theme, resolved } = useThemeTogglerButton();
  const instant = React.use(InstantContext);
  const key = theme === 'system' && system === undefined ? resolved : theme;
  const icon = key === 'system' ? system : key === 'dark' ? dark : light;

  return (
    <IconSwap
      data-slot="theme-toggler-button-icon"
      swapKey={key}
      instant={instant}
      rotate={rotate}
      {...props}
    >
      {icon}
    </IconSwap>
  );
}

export {
  ThemeTogglerButton,
  ThemeTogglerButtonIcon,
  useThemeTogglerButton,
  type ThemeTogglerButtonProps,
  type ThemeTogglerButtonIconProps,
  type ThemeTogglerButtonContextType,
  type ThemeSelection,
  type Resolved,
};
