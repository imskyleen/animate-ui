'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { type HTMLMotionProps, motion, type Transition } from 'motion/react';
import * as React from 'react';
import { ScrollArea as ScrollAreaPrimitive } from 'radix-ui';

import {
  Highlight,
  HighlightItem,
  type HighlightProps,
} from '@/registry/primitives/effects/highlight';
import { getStrictContext } from '@/registry/lib/get-strict-context';
import { cn } from '@workspace/ui/lib/utils';

const scrollTargetTabVariants = cva(
  'ring-sidebar-ring relative flex w-full items-center justify-center rounded-md px-3 py-1.5 text-center text-sm font-medium outline-hidden transition-colors focus-visible:ring-2',
  {
    variants: {
      variant: {
        primary:
          'data-[state=active]:text-primary-foreground text-muted-foreground hover:text-primary',
        accent:
          'data-[state=active]:text-accent-foreground text-muted-foreground hover:text-accent-foreground',
        secondary:
          'data-[state=active]:text-secondary-foreground text-muted-foreground hover:text-foreground',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  },
);

const scrollTargetTabsHighlightVariants = cva('rounded-md', {
  variants: {
    variant: {
      primary: 'bg-primary',
      accent: 'bg-accent',
      secondary: 'bg-secondary',
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
});

type ScrollTargetTabsVariant = VariantProps<
  typeof scrollTargetTabVariants
>['variant'];

type ScrollTargetTabsContextType = {
  activeValue: string;
  setActiveValue: (value: string) => void;
  registerSection: (value: string, element: HTMLElement | null) => void;
  scrollToSection: (value: string) => void;
  scrollOffset: number;
  isProgrammaticScrollRef: React.MutableRefObject<boolean>;
  variant: ScrollTargetTabsVariant;
};

const [ScrollTargetTabsProvider, useScrollTargetTabs] =
  getStrictContext<ScrollTargetTabsContextType>('ScrollTargetTabsContext');

type BaseScrollTargetTabsProps = React.ComponentProps<'div'> & {
  children: React.ReactNode;
  scrollOffset?: number;
  variant?: ScrollTargetTabsVariant;
};

type UncontrolledScrollTargetTabsProps = BaseScrollTargetTabsProps & {
  defaultValue?: string;
  value?: never;
  onValueChange?: never;
};

type ControlledScrollTargetTabsProps = BaseScrollTargetTabsProps & {
  value: string;
  onValueChange?: (value: string) => void;
  defaultValue?: never;
};

type ScrollTargetTabsProps =
  | UncontrolledScrollTargetTabsProps
  | ControlledScrollTargetTabsProps;

function ScrollTargetTabs({
  defaultValue,
  value,
  onValueChange,
  scrollOffset = 10,
  variant = 'primary',
  children,
  ...props
}: ScrollTargetTabsProps) {
  const [activeValue, setActiveValue] = React.useState<string>(
    defaultValue ?? '',
  );
  const sectionsRef = React.useRef(new Map<string, HTMLElement>());
  const isControlled = value !== undefined;

  const currentValue = isControlled ? value : activeValue;

  const handleSetActiveValue = React.useCallback(
    (val: string) => {
      if (!isControlled) {
        setActiveValue(val);
      }
      onValueChange?.(val);
    },
    [isControlled, onValueChange],
  );

  const registerSection = React.useCallback(
    (val: string, element: HTMLElement | null) => {
      if (element) {
        sectionsRef.current.set(val, element);
      } else {
        sectionsRef.current.delete(val);
      }
    },
    [],
  );

  const isProgrammaticScrollRef = React.useRef(false);
  const scrollCleanupRef = React.useRef<(() => void) | null>(null);

  const scrollToSection = React.useCallback(
    (val: string) => {
      const element = sectionsRef.current.get(val);
      if (!element) return;

      // Update active value immediately FIRST to prevent flicker
      handleSetActiveValue(val);

      // Cancel any previous scroll detection from rapid clicking
      if (scrollCleanupRef.current) {
        scrollCleanupRef.current();
        scrollCleanupRef.current = null;
      }

      // Set flag to block scroll boundary detection during programmatic scroll
      isProgrammaticScrollRef.current = true;

      // Get the scroll container (look for the ScrollArea viewport)
      const scrollContainer = element.closest(
        '[data-radix-scroll-area-viewport]',
      );
      if (!scrollContainer) {
        // Fallback to native scrollIntoView
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Use scrollend event if available, otherwise fallback to timeout
        const clearFlagWithDebounce = () => {
          // Add debounce buffer to prevent flicker at the end
          setTimeout(() => {
            isProgrammaticScrollRef.current = false;
          }, 150);
        };

        if ('onscrollend' in window) {
          window.addEventListener('scrollend', clearFlagWithDebounce, {
            once: true,
          });
          scrollCleanupRef.current = () => {
            window.removeEventListener('scrollend', clearFlagWithDebounce);
          };
        } else {
          const timeoutId = setTimeout(clearFlagWithDebounce, 1000);
          scrollCleanupRef.current = () => {
            clearTimeout(timeoutId);
          };
        }
        return;
      }

      // Calculate the scroll position with offset
      const elementRect = element.getBoundingClientRect();
      const containerRect = scrollContainer.getBoundingClientRect();
      const scrollTop = scrollContainer.scrollTop;
      const targetScrollTop =
        scrollTop + elementRect.top - containerRect.top - scrollOffset;

      // Smooth scroll using scrollTo
      scrollContainer.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: 'smooth',
      });

      // Detect when scroll animation completes
      let lastScrollTop = scrollContainer.scrollTop;
      let scrollStoppedTimer: number | null = null;
      let safetyTimer: number | null = null;
      let consecutiveStopCount = 0;
      const maxWaitTime = 2000; // Maximum 2 seconds safety timeout
      const scrollCheckInterval = 50; // Check every 50ms
      const debounceDelay = 150; // Wait 150ms after scroll stops

      const startTime = Date.now();

      const clearFlagWithDebounce = () => {
        // Clean up timers
        if (scrollStoppedTimer !== null) {
          clearInterval(scrollStoppedTimer);
          scrollStoppedTimer = null;
        }
        if (safetyTimer !== null) {
          clearTimeout(safetyTimer);
          safetyTimer = null;
        }

        // Add debounce buffer to prevent flicker at the end
        setTimeout(() => {
          isProgrammaticScrollRef.current = false;
          scrollCleanupRef.current = null;
        }, debounceDelay);
      };

      // Use scrollend event if available (modern browsers)
      if ('onscrollend' in scrollContainer) {
        const handleScrollEnd = () => {
          clearFlagWithDebounce();
        };

        scrollContainer.addEventListener('scrollend', handleScrollEnd, {
          once: true,
        });

        // Still set a safety timeout
        safetyTimer = window.setTimeout(clearFlagWithDebounce, maxWaitTime);

        // Store cleanup function
        scrollCleanupRef.current = () => {
          scrollContainer.removeEventListener('scrollend', handleScrollEnd);
          if (safetyTimer !== null) {
            clearTimeout(safetyTimer);
            safetyTimer = null;
          }
          isProgrammaticScrollRef.current = false;
        };
      } else {
        // Fallback: Poll scroll position to detect when it stops changing
        scrollStoppedTimer = window.setInterval(() => {
          const currentScrollTop = scrollContainer.scrollTop;
          const elapsed = Date.now() - startTime;

          // More conservative stop detection: require 2 consecutive checks with < 2px movement
          if (Math.abs(currentScrollTop - lastScrollTop) < 2) {
            consecutiveStopCount++;
            if (consecutiveStopCount >= 2) {
              clearFlagWithDebounce();
            }
          } else {
            consecutiveStopCount = 0;
            lastScrollTop = currentScrollTop;
          }

          // Safety: force clear after max wait time
          if (elapsed > maxWaitTime) {
            clearFlagWithDebounce();
          }
        }, scrollCheckInterval);

        // Store cleanup function
        scrollCleanupRef.current = () => {
          if (scrollStoppedTimer !== null) {
            clearInterval(scrollStoppedTimer);
            scrollStoppedTimer = null;
          }
          isProgrammaticScrollRef.current = false;
        };
      }
    },
    [scrollOffset, handleSetActiveValue],
  );

  const contextValue = React.useMemo<ScrollTargetTabsContextType>(
    () => ({
      activeValue: currentValue,
      setActiveValue: handleSetActiveValue,
      registerSection,
      scrollToSection,
      scrollOffset,
      isProgrammaticScrollRef,
      variant,
    }),
    [
      currentValue,
      handleSetActiveValue,
      registerSection,
      scrollToSection,
      scrollOffset,
      variant,
    ],
  );

  return (
    <ScrollTargetTabsProvider value={contextValue}>
      <div data-slot="scroll-target-tabs" {...props}>
        {children}
      </div>
    </ScrollTargetTabsProvider>
  );
}

type ScrollTargetTabsHighlightProps = Omit<
  HighlightProps,
  'controlledItems' | 'value' | 'click'
> & {
  transition?: Transition;
  containerClassName?: string;
  boundsOffset?: Partial<{
    top: number;
    left: number;
    width: number;
    height: number;
  }>;
};

function ScrollTargetTabsHighlight({
  transition = { type: 'spring', stiffness: 200, damping: 25 },
  className,
  ...props
}: ScrollTargetTabsHighlightProps) {
  const { activeValue, variant } = useScrollTargetTabs();

  return (
    <Highlight
      data-slot="scroll-target-tabs-highlight"
      controlledItems
      value={activeValue}
      transition={transition}
      click={false}
      className={cn(scrollTargetTabsHighlightVariants({ variant }), className)}
      {...props}
    />
  );
}

type ScrollTargetTabsListProps = React.ComponentProps<'div'> & {
  children: React.ReactNode;
};

function ScrollTargetTabsList({
  className,
  ...props
}: ScrollTargetTabsListProps) {
  return (
    <div
      role="tablist"
      data-slot="scroll-target-tabs-list"
      className={cn('flex items-center gap-1', className)}
      {...props}
    />
  );
}

type ScrollTargetTabProps = HTMLMotionProps<'button'> & {
  value: string;
  children: React.ReactNode;
};

function ScrollTargetTab({
  value,
  className,
  onClick,
  children,
  ...props
}: ScrollTargetTabProps) {
  const { activeValue, scrollToSection, variant } = useScrollTargetTabs();
  const isActive = activeValue === value;

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      scrollToSection(value);
    },
    [onClick, scrollToSection, value],
  );

  return (
    <HighlightItem value={value} className="basis-0 min-w-0 flex-1">
      <motion.button
        type="button"
        role="tab"
        aria-selected={isActive}
        data-slot="scroll-target-tab"
        data-state={isActive ? 'active' : 'inactive'}
        className={cn(
          'cursor-pointer flex gap-1',
          scrollTargetTabVariants({ variant }),
          className,
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
      </motion.button>
    </HighlightItem>
  );
}

type ScrollTargetContentProps = React.ComponentPropsWithoutRef<
  typeof ScrollAreaPrimitive.Root
> & {
  children: React.ReactNode;
};

function ScrollTargetContent({
  className,
  children,
  ...props
}: ScrollTargetContentProps) {
  const { setActiveValue, scrollOffset, isProgrammaticScrollRef } =
    useScrollTargetTabs();
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const rafIdRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    // Function to determine which section is active based on scroll position
    const updateActiveSection = () => {
      // Ignore updates during programmatic scrolling
      if (isProgrammaticScrollRef.current) {
        return;
      }

      const sections = viewport.querySelectorAll<HTMLElement>(
        '[data-scroll-target-section]',
      );
      if (sections.length === 0) return;

      const scrollTop = viewport.scrollTop;
      const threshold = scrollOffset;

      // Find the last section whose top has crossed the threshold line
      // (i.e., the section whose top is at or above the red line)
      let activeSectionValue: string | null = null;

      sections.forEach((section) => {
        // Get the section's position relative to the scroll container
        const sectionTop = section.offsetTop;

        // Check if this section's top has crossed the threshold
        if (sectionTop <= scrollTop + threshold) {
          // This section has crossed the red line, so it's a candidate
          const value = section.getAttribute('data-scroll-target-value');
          if (value) {
            activeSectionValue = value;
          }
        }
      });

      // Update the active value if we found a section
      if (activeSectionValue) {
        setActiveValue(activeSectionValue);
      }
    };

    // Handle scroll with requestAnimationFrame for performance
    const handleScroll = () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }

      rafIdRef.current = requestAnimationFrame(() => {
        updateActiveSection();
        rafIdRef.current = null;
      });
    };

    // Set initial active section
    updateActiveSection();

    // Listen to scroll events
    viewport.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      viewport.removeEventListener('scroll', handleScroll);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [setActiveValue, scrollOffset, isProgrammaticScrollRef, children]);

  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-target-content"
      className={cn('overflow-hidden', className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        ref={viewportRef}
        className="size-full rounded-[inherit]"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollAreaPrimitive.Corner />
      <ScrollAreaPrimitive.Scrollbar
        orientation="vertical"
        className="flex w-1.5 select-none data-[state=hidden]:animate-fd-fade-out"
      >
        <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-fd-border" />
      </ScrollAreaPrimitive.Scrollbar>
    </ScrollAreaPrimitive.Root>
  );
}

type ScrollTargetSectionProps = React.ComponentProps<'div'> & {
  value: string;
  children: React.ReactNode;
};

function ScrollTargetSection({
  value,
  className,
  children,
  ...props
}: ScrollTargetSectionProps) {
  const { registerSection, scrollOffset } = useScrollTargetTabs();
  const sectionRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    registerSection(value, sectionRef.current);
    return () => registerSection(value, null);
  }, [value, registerSection]);

  return (
    <div
      ref={sectionRef}
      data-scroll-target-section
      data-scroll-target-value={value}
      data-slot="scroll-target-section"
      className={className}
      style={{
        scrollMarginTop: `${scrollOffset}px`,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export {
  ScrollTargetTabs,
  ScrollTargetTabsList,
  ScrollTargetTabsHighlight,
  ScrollTargetTab,
  ScrollTargetContent,
  ScrollTargetSection,
  useScrollTargetTabs,
  scrollTargetTabVariants,
  scrollTargetTabsHighlightVariants,
  type ScrollTargetTabsProps,
  type ScrollTargetTabsListProps,
  type ScrollTargetTabsHighlightProps,
  type ScrollTargetTabProps,
  type ScrollTargetContentProps,
  type ScrollTargetSectionProps,
  type ScrollTargetTabsContextType,
  type ScrollTargetTabsVariant,
};
