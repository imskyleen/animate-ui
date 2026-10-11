'use client';

import * as React from 'react';
import {
  Tab as AriaTab,
  TabList as AriaTabList,
  TabPanel as AriaTabPanel,
  type TabListProps as AriaTabListProps,
  type TabPanelProps as AriaTabPanelProps,
  type TabProps,
} from 'react-aria-components';
import type { Transition } from 'motion/react';

import { ReducedMotionConfig } from '../../../utils/motion';
import {
  TAB_ATTRIBUTE,
  usePanelMotion,
  useTabsIndicator,
} from '../../../internal/tabs';

// Same API as React Aria's TabList, Tab and TabPanel, moving like Motion's
// Radix tabs example (see ../../../internal/tabs): one indicator slides to
// the new tab, and the panels change one after the other: the outgoing one
// fades out into a blur, then the incoming one fades in from it while the
// height glides. Both go through React Aria's `render` prop, so the animated
// elements are React Aria's own.

type ListAnimationProps = {
  /** Transition of the indicator sliding to the new tab. Defaults to a spring (stiffness 300, damping 30). */
  transition?: Transition;
};

type PanelAnimationProps = {
  /** Transition of the panel coming in: its fade from a blur (300ms) and, in `height`, the height gliding from the previous panel's (450ms, Motion's layout curve). */
  transition?: Transition;
  /** Transition of the panel leaving: its fade into a blur (150ms ease-out). */
  exitTransition?: Transition;
};

type TabListProps<T> = AriaTabListProps<T> & ListAnimationProps;
type TabPanelProps = AriaTabPanelProps & PanelAnimationProps;

function assignRef<T>(ref: React.Ref<T> | undefined, node: T | null) {
  if (typeof ref === 'function') ref(node);
  else if (ref) ref.current = node;
}

function TabList<T extends object>({
  transition,
  render,
  ...props
}: TabListProps<T> & React.RefAttributes<HTMLDivElement>) {
  const [list, setList] = React.useState<HTMLDivElement | null>(null);
  const { indicator, listProps } = useTabsIndicator(list, { transition });

  return (
    <ReducedMotionConfig>
      <AriaTabList
        {...props}
        render={(domProps, renderProps) => {
          const element = {
            ...domProps,
            ...listProps,
            ref: (node: HTMLDivElement | null) => {
              setList(node);
              assignRef(domProps.ref as React.Ref<HTMLDivElement>, node);
            },
            // The indicator renders next to React Aria's collection.
            children: (
              <>
                {indicator}
                {domProps.children}
              </>
            ),
          };
          return render ? render(element, renderProps) : <div {...element} />;
        }}
      />
    </ReducedMotionConfig>
  );
}

function Tab(props: TabProps & React.RefAttributes<HTMLDivElement>) {
  return <AriaTab {...{ [TAB_ATTRIBUTE]: '' }} {...props} />;
}

function TabPanel({
  transition,
  exitTransition,
  render,
  ...props
}: TabPanelProps & React.RefAttributes<HTMLDivElement>) {
  return (
    <ReducedMotionConfig>
      <AriaTabPanel
        {...props}
        render={(domProps, renderProps) =>
          // A custom `render` keeps working, without the animation.
          render ? (
            render(domProps, renderProps)
          ) : (
            <PanelElement
              {...(domProps as React.ComponentProps<'div'>)}
              selected={!renderProps.isInert}
              isExiting={renderProps.isExiting}
              panelTransition={transition}
              panelExitTransition={exitTransition}
            />
          )
        }
      />
    </ReducedMotionConfig>
  );
}

function PanelElement({
  ref,
  selected,
  isExiting,
  panelTransition,
  panelExitTransition,
  hidden,
  ...props
}: React.ComponentProps<'div'> & {
  selected: boolean;
  /** React Aria keeps it mounted until its running animations end. */
  isExiting: boolean;
  panelTransition: Transition | undefined;
  panelExitTransition: Transition | undefined;
}) {
  // React Aria waits for the running animations of an unselected panel (its
  // fade out, started in the commit it leaves in) before removing it.
  const {
    ref: panelRef,
    waiting,
    leaving,
  } = usePanelMotion(selected, {
    transition: panelTransition,
    exitTransition: panelExitTransition,
  });

  return (
    <div
      {...props}
      ref={(node: HTMLDivElement | null) => {
        panelRef.current = node;
        assignRef(ref as React.Ref<HTMLDivElement>, node);
      }}
      // Hidden while the previous panel leaves, and once its own fade out is
      // over (React Aria removes it right after). A force-mounted panel then
      // stays as React Aria leaves it (inert).
      hidden={
        hidden || waiting || (!selected && !leaving && isExiting) || undefined
      }
    />
  );
}

export { TabList, Tab, TabPanel, type TabListProps, type TabPanelProps };
