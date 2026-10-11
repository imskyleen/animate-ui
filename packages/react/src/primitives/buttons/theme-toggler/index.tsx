'use client';

import * as React from 'react';
import type { Transition } from 'motion/react';

import { motionTokens } from '../../../utils/motion';
import { getStrictContext } from '../../../utils/strict-context';
import { Button, type ButtonProps } from '../button';
import { IconSwap } from '../_icon-swap';

/** A theme to choose: light, dark, or the system's. */
type ThemeSelection = 'light' | 'dark' | 'system';
/** A theme actually shown. */
type Resolved = 'light' | 'dark';

type ThemeTogglerButtonContextType = {
  /**
   * The theme the button shows: the selected one when `modes` include
   * `system`, else the theme actually shown.
   */
  theme: ThemeSelection;
  /** The selected theme. */
  effective: ThemeSelection;
  /** The theme actually shown. */
  resolved: Resolved;
  /** The theme a click switches to. */
  next: ThemeSelection;
};

const [ThemeTogglerButtonProvider, useThemeTogglerButton] =
  getStrictContext<ThemeTogglerButtonContextType>('ThemeTogglerButtonContext');

/** Whether the icons swap at once (until the theme has settled). */
const InstantContext = React.createContext(true);

function subscribeToNothing() {
  return () => {};
}

/** False during SSR and hydration, true afterwards. */
function useIsMounted() {
  return React.useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
}

const DEFAULT_MODES: ThemeSelection[] = ['light', 'dark', 'system'];

/** The mode after the current one; a theme outside `modes` counts as the one it shows. */
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
  /** The selected theme. */
  theme: ThemeSelection;
  /** The theme actually shown. */
  resolvedTheme: Resolved;
  /** Applies a theme, called on click with the next one of `modes`. */
  setTheme: (theme: ThemeSelection) => void;
  /**
   * The themes a click cycles through, in order.
   * @default ['light', 'dark', 'system']
   */
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
  // The icon shows at rest on mount, and when the theme becomes known after
  // hydrating (the render where `mounted` turns true): icons swap from the
  // render after.
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
  /** The icon of the light theme. */
  light: React.ReactNode;
  /** The icon of the dark theme. */
  dark: React.ReactNode;
  /** The icon of the system theme. */
  system?: React.ReactNode;
  /**
   * Degrees the icons turn as they swap.
   * @default 90
   */
  rotate?: number;
  /** Transition of the swap. */
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
  // Without a system icon, system shows the theme it resolves to.
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
