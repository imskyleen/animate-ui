'use client';
/* eslint-disable @typescript-eslint/no-namespace -- each part keeps Base UI's `Part.Props`/`Part.State` type namespace */

import * as React from 'react';
import { Tabs as TabsPrimitive } from '@base-ui/react/tabs';
import type { Transition } from 'motion/react';

import { ReducedMotionConfig } from '../../../utils/motion';
import {
  TAB_ATTRIBUTE,
  usePanelMotion,
  useTabsIndicator,
} from '../../../internal/tabs';

// Same API as Base UI's Tabs, moving like Motion's Radix tabs example (see
// ../../../internal/tabs): one indicator slides to the new tab, and the
// panels change one after the other: the outgoing one fades out into a blur,
// then the incoming one fades in from it while the height glides.

/** Animate UI's additions to `Tabs.List`. */
type ListAnimationProps = {
  /** Transition of the indicator sliding to the new tab. Defaults to a spring (stiffness 300, damping 30). */
  transition?: Transition;
};

/** Animate UI's additions to `Tabs.Panel`. */
type PanelAnimationProps = {
  /** Transition of the panel coming in: its fade from a blur (300ms) and, in `height`, the height gliding from the previous panel's (450ms, Motion's layout curve). */
  transition?: Transition;
  /** Transition of the panel leaving: its fade into a blur (150ms ease-out). */
  exitTransition?: Transition;
};

// When the user renders Base UI's own `Tabs.Indicator`, the list doesn't
// draw its gliding one.
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
  /** Base UI's props, plus Animate UI's `transition`. */
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
  // A `render` of your own replaces the animated element.
  if (render) return <TabsPrimitive.Panel {...props} render={render} />;
  return (
    <TabsPrimitive.Panel
      {...props}
      // Base UI's props (className, style, hidden, inert, data-*…) land on
      // the panel's element.
      render={(renderProps, state) => (
        <PanelElement
          {...(renderProps as React.ComponentProps<'div'>)}
          // Base UI marks an unselected panel inert from the commit it
          // leaves in (`hidden` only once it's gone).
          selected={!state.hidden && !renderProps.inert}
          panelTransition={transition}
          panelExitTransition={exitTransition}
        />
      )}
    />
  );
}

namespace Panel {
  /** Base UI's props, plus Animate UI's `transition` and `exitTransition`. */
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
  // Base UI keeps an unselected panel mounted until its animations end (its
  // fade out), then unmounts it, or hides it with `keepMounted`.
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
      // Hidden while the previous panel leaves, and once its own fade out is
      // over (Base UI removes it right after).
      hidden={hidden || waiting || (!selected && !leaving) || undefined}
    />
  );
}

export { Root, List, Tab, Indicator, Panel };
