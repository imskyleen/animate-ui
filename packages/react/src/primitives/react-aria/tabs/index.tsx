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

import { ReducedMotionConfig, useMotionTokens } from '../../../utils/motion';
import {
  TAB_ATTRIBUTE,
  isKeyboardInput,
  useFinishAnimationsWhen,
  useTabsIndicator,
} from '../../../internal/tabs';

// Same API as React Aria's TabList, Tab and TabPanel. The selected tab's
// surface glides between tabs (see ../../../internal/tabs), and the incoming panel
// fades in. Both go through React Aria's `render` prop, so the animated
// elements are React Aria's own.

type ListAnimationProps = {
  /** Transition of the indicator gliding to the selected tab. Defaults to `spring.snappy`. */
  transition?: Transition;
};

type PanelAnimationProps = {
  /** Transition of the incoming panel's fade. Defaults to `transition.fade` (600ms). */
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
          // A custom `render` keeps working, without the fade.
          render ? (
            render(domProps, renderProps)
          ) : (
            <PanelMotion
              {...(domProps as HTMLMotionProps<'div'>)}
              isEntering={renderProps.isEntering}
              isExiting={renderProps.isExiting}
              fadeTransition={transition}
            />
          )
        }
      />
    </ReducedMotionConfig>
  );
}

function PanelMotion({
  ref,
  isEntering,
  isExiting,
  fadeTransition,
  hidden,
  ...props
}: HTMLMotionProps<'div'> & {
  isEntering: boolean;
  isExiting: boolean;
  fadeTransition: Transition | undefined;
}) {
  const tokens = useMotionTokens();
  // React Aria reports entering only for panels selected after mount (not
  // the initial one); keyboard changes swap the panel at once.
  const [enters] = React.useState(() => isEntering && !isKeyboardInput());
  const localRef = React.useRef<HTMLDivElement>(null);
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
      initial={enters ? { opacity: 0 } : false}
      animate={{
        opacity: 1,
        transition: fadeTransition ?? tokens.transition.fade,
      }}
    />
  );
}

export { TabList, Tab, TabPanel, type TabListProps, type TabPanelProps };
