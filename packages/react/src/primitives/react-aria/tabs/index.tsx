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
import { motion, type HTMLMotionProps, type Transition } from 'motion/react';

import { ReducedMotionConfig } from '../../../utils/motion';
import {
  TAB_ATTRIBUTE,
  useFinishAnimationsWhen,
  usePanelMotion,
  useTabsIndicator,
} from '../../../internal/tabs';

// Same API as React Aria's TabList, Tab and TabPanel, moving like Animate UI
// v1's tabs (v1's Headless UI Tabs, the closest to React Aria's; see
// ../../../internal/tabs): the selected tab's surface slides to the new tab,
// and the incoming panel fades in from a blur while its height springs. Both
// go through React Aria's `render` prop, so the animated elements are React
// Aria's own.

type ListAnimationProps = {
  /** Transition of the selected tab's surface sliding to the new tab. Defaults to a spring (stiffness 300, damping 30). */
  transition?: Transition;
};

type PanelAnimationProps = {
  /** Transition of the incoming panel: its fade (500ms ease-out) and, in `height`, its height (a spring, stiffness 300, damping 30). */
  transition?: Transition;
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
            <PanelMotion
              {...(domProps as HTMLMotionProps<'div'>)}
              active={!renderProps.isInert && !renderProps.isExiting}
              isExiting={renderProps.isExiting}
              panelTransition={transition}
            />
          )
        }
      />
    </ReducedMotionConfig>
  );
}

function PanelMotion({
  ref,
  active,
  isExiting,
  panelTransition,
  hidden,
  ...props
}: HTMLMotionProps<'div'> & {
  /** Selected and not leaving (a force-mounted panel stays mounted). */
  active: boolean;
  isExiting: boolean;
  panelTransition: Transition | undefined;
}) {
  const {
    ref: localRef,
    initial,
    animate,
  } = usePanelMotion(active, { transition: panelTransition });
  // React Aria waits for running animations before removing an exiting
  // panel: finish the fade so the old panel leaves at once.
  useFinishAnimationsWhen(localRef, isExiting);

  return (
    <motion.div
      {...props}
      ref={(node: HTMLDivElement | null) => {
        localRef.current = node;
        assignRef(ref as React.Ref<HTMLDivElement>, node);
      }}
      hidden={hidden || isExiting}
      initial={initial}
      animate={animate}
    />
  );
}

export { TabList, Tab, TabPanel, type TabListProps, type TabPanelProps };
