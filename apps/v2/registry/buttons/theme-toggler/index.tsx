'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { AnimatePresence, motion, type Transition } from 'motion/react';
import {
  Button,
  type ButtonProps,
} from '@animate-ui/react/primitives/buttons/button';
import {
  motionTokens,
  useShouldReduceMotion,
  useTempoTransition,
} from '@animate-ui/react/utils/motion';
import { getStrictContext } from '@animate-ui/react/utils/strict-context';
import { cn } from 'cn';

const themeTogglerButtonVariants = cva(
  "focus-visible:border-ring focus-visible:ring-ring/50 inline-flex shrink-0 items-center justify-center rounded-lg transition-[color,background-color,border-color,box-shadow] outline-none focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        accent: 'bg-accent text-accent-foreground hover:bg-accent/90',
        outline:
          'bg-background hover:bg-muted hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 border',
        ghost: 'hover:bg-muted hover:text-foreground dark:hover:bg-muted/50',
      },
      size: {
        default: 'size-9',
        sm: 'size-8',
        lg: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

const SWAP_TRANSITION: Transition = motionTokens.transition.swap;

const HIDDEN = {
  opacity: 0,
  scale: motionTokens.scale.icon,
  filter: motionTokens.blur.icon,
};
const SHOWN = { opacity: 1, scale: 1, filter: 'blur(0px)' };

type IconSwapProps = Omit<React.ComponentProps<'span'>, 'children'> & {
  swapKey: string;
  children: React.ReactNode;
  instant?: boolean;
  rotate?: number;
  transition?: Transition;
};

function IconSwap({
  swapKey,
  children,
  instant = false,
  rotate,
  transition,
  style,
  ...props
}: IconSwapProps) {
  const reduce = useShouldReduceMotion();
  const defaultTransition = useTempoTransition(
    rotate ? motionTokens.transition.spin : SWAP_TRANSITION,
  );
  const turn = reduce || !rotate ? undefined : rotate;
  const entering = reduce
    ? { opacity: 0, filter: HIDDEN.filter }
    : turn
      ? { ...HIDDEN, rotate: -turn }
      : HIDDEN;
  const leaving = reduce
    ? { opacity: 0, filter: HIDDEN.filter }
    : turn
      ? { ...HIDDEN, rotate: turn }
      : HIDDEN;
  const shown = reduce
    ? { opacity: 1, filter: SHOWN.filter }
    : turn
      ? { ...SHOWN, rotate: 0 }
      : SHOWN;

  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
      {...props}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={swapKey}
          data-icon={swapKey}
          aria-hidden="true"
          initial={instant ? false : entering}
          animate={shown}
          exit={instant ? undefined : leaving}
          transition={transition ?? defaultTransition}
          style={{ display: 'inline-flex' }}
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

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

type ThemeTogglerButtonProps = ButtonProps &
  VariantProps<typeof themeTogglerButtonVariants> & {
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
  variant,
  size,
  className,
  ...props
}: ThemeTogglerButtonProps) {
  const mounted = useIsMounted();
  const [settled, setSettled] = React.useState(false);
  React.useEffect(() => {
    if (!mounted) return;
    const frame = requestAnimationFrame(() => setSettled(true));
    return () => cancelAnimationFrame(frame);
  }, [mounted]);

  const shown = mounted
    ? modes.includes('system')
      ? theme
      : resolvedTheme
    : 'light';
  const next = getNextTheme(theme, resolvedTheme, modes);

  return (
    <ThemeTogglerButtonProvider
      value={{
        theme: shown,
        effective: mounted ? theme : 'light',
        resolved: mounted ? resolvedTheme : 'light',
        next,
      }}
    >
      <InstantContext value={!settled}>
        <Button
          data-slot="theme-toggler-button"
          data-theme={shown}
          className={cn(
            themeTogglerButtonVariants({ variant, size }),
            className,
          )}
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
  themeTogglerButtonVariants,
  ThemeTogglerButtonIcon,
  useThemeTogglerButton,
  type ThemeTogglerButtonProps,
  type ThemeTogglerButtonIconProps,
  type ThemeTogglerButtonContextType,
  type ThemeSelection,
  type Resolved,
};
