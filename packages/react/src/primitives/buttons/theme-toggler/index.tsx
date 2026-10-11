'use client';

import * as React from 'react';
import type { Transition } from 'motion/react';

import { getStrictContext } from '../../../utils/strict-context';
import { Button, type ButtonProps } from '../button';
import { IconSwap } from '../_icon-swap';
import {
  ThemeToggler,
  type Direction,
  type Resolved,
  type ThemeSelection,
  type ThemeTogglerProps,
} from '../../effects/theme-toggler';

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

type ThemeTogglerButtonProps = ButtonProps &
  Pick<
    ThemeTogglerProps,
    'theme' | 'resolvedTheme' | 'setTheme' | 'onImmediateChange'
  > & {
    /**
     * The themes a click cycles through, in order.
     * @default ['light', 'dark', 'system']
     */
    modes?: ThemeSelection[];
    /**
     * Direction of the wipe.
     * @default 'ltr'
     */
    direction?: Direction;
  };

function ThemeTogglerButton({
  theme,
  resolvedTheme,
  setTheme,
  onImmediateChange,
  modes = DEFAULT_MODES,
  direction = 'ltr',
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

  return (
    <ThemeToggler
      theme={theme}
      resolvedTheme={resolvedTheme}
      setTheme={setTheme}
      direction={direction}
      onImmediateChange={onImmediateChange}
    >
      {({ effective, resolved, toggleTheme }) => {
        const shown = modes.includes('system') ? effective : resolved;
        const next = getNextTheme(effective, resolved, modes);

        return (
          <ThemeTogglerButtonProvider
            value={{ theme: shown, effective, resolved, next }}
          >
            <InstantContext value={!settled}>
              <Button
                data-slot="theme-toggler-button"
                data-theme={shown}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                  onClick?.(event);
                  if (event.defaultPrevented) return;
                  toggleTheme(next);
                }}
                {...props}
              />
            </InstantContext>
          </ThemeTogglerButtonProvider>
        );
      }}
    </ThemeToggler>
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
  /** Transition of the swap. */
  transition?: Transition;
};

function ThemeTogglerButtonIcon({
  light,
  dark,
  system,
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
  type Direction,
};
