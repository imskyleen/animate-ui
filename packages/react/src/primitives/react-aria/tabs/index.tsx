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

type ListAnimationProps = {
  transition?: Transition;
};

type PanelAnimationProps = {
  transition?: Transition;
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
  isExiting: boolean;
  panelTransition: Transition | undefined;
  panelExitTransition: Transition | undefined;
}) {
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
      hidden={
        hidden || waiting || (!selected && !leaving && isExiting) || undefined
      }
    />
  );
}

export { TabList, Tab, TabPanel, type TabListProps, type TabPanelProps };
