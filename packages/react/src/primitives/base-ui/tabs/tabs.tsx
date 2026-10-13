'use client';
/* eslint-disable @typescript-eslint/no-namespace */

import * as React from 'react';
import { Tabs as TabsPrimitive } from '@base-ui/react/tabs';
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

const CustomIndicatorContext = React.createContext<
  ((present: boolean) => void) | null
>(null);

function Root(props: Root.Props) {
  return (
    <ReducedMotionConfig>
      <TabsPrimitive.Root {...props} />
    </ReducedMotionConfig>
  );
}

namespace Root {
  export type Props = TabsPrimitive.Root.Props &
    React.RefAttributes<HTMLDivElement>;
  export type State = TabsPrimitive.Root.State;
  export type Orientation = TabsPrimitive.Root.Orientation;
  export type ChangeEventReason = TabsPrimitive.Root.ChangeEventReason;
  export type ChangeEventDetails = TabsPrimitive.Root.ChangeEventDetails;
}

function List({ ref, transition, children, ...props }: List.Props) {
  const [list, setList] = React.useState<HTMLDivElement | null>(null);
  const [customIndicator, setCustomIndicator] = React.useState(false);
  const { indicator, listProps } = useTabsIndicator(list, {
    transition,
    enabled: !customIndicator,
  });

  return (
    <CustomIndicatorContext value={setCustomIndicator}>
      <TabsPrimitive.List
        {...props}
        {...listProps}
        ref={(node: HTMLDivElement | null) => {
          setList(node);
          if (typeof ref === 'function') return ref(node);
          if (ref) ref.current = node;
        }}
      >
        {indicator}
        {children}
      </TabsPrimitive.List>
    </CustomIndicatorContext>
  );
}

namespace List {
  export type Props = TabsPrimitive.List.Props &
    ListAnimationProps &
    React.RefAttributes<HTMLDivElement>;
  export type State = TabsPrimitive.List.State;
}

function Tab(props: Tab.Props) {
  return <TabsPrimitive.Tab {...{ [TAB_ATTRIBUTE]: '' }} {...props} />;
}

namespace Tab {
  export type Props = TabsPrimitive.Tab.Props &
    React.RefAttributes<HTMLElement>;
  export type State = TabsPrimitive.Tab.State;
  export type Value = TabsPrimitive.Tab.Value;
  export type ActivationDirection = TabsPrimitive.Tab.ActivationDirection;
  export type Position = TabsPrimitive.Tab.Position;
  export type Size = TabsPrimitive.Tab.Size;
  export type Metadata = TabsPrimitive.Tab.Metadata;
}

function Indicator(props: Indicator.Props) {
  const setCustomIndicator = React.use(CustomIndicatorContext);
  React.useLayoutEffect(() => {
    setCustomIndicator?.(true);
    return () => setCustomIndicator?.(false);
  }, [setCustomIndicator]);
  return <TabsPrimitive.Indicator {...props} />;
}

namespace Indicator {
  export type Props = TabsPrimitive.Indicator.Props &
    React.RefAttributes<HTMLSpanElement>;
  export type State = TabsPrimitive.Indicator.State;
}

function Panel({ transition, exitTransition, render, ...props }: Panel.Props) {
  if (render) return <TabsPrimitive.Panel {...props} render={render} />;
  return (
    <TabsPrimitive.Panel
      {...props}
      render={(renderProps, state) => (
        <PanelElement
          {...(renderProps as React.ComponentProps<'div'>)}
          selected={!state.hidden && !renderProps.inert}
          panelTransition={transition}
          panelExitTransition={exitTransition}
        />
      )}
    />
  );
}

namespace Panel {
  export type Props = TabsPrimitive.Panel.Props &
    PanelAnimationProps &
    React.RefAttributes<HTMLDivElement>;
  export type State = TabsPrimitive.Panel.State;
  export type Metadata = TabsPrimitive.Panel.Metadata;
}

function PanelElement({
  ref,
  selected,
  panelTransition,
  panelExitTransition,
  hidden,
  ...props
}: React.ComponentProps<'div'> & {
  selected: boolean;
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
        if (typeof ref === 'function') return ref(node);
        if (ref) ref.current = node;
      }}
      hidden={hidden || waiting || (!selected && !leaving) || undefined}
    />
  );
}

export { Root, List, Tab, Indicator, Panel };
