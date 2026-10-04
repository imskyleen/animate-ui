'use client';
/* eslint-disable @typescript-eslint/no-namespace -- each part keeps Base UI's `Part.Props`/`Part.State` type namespace */

import * as React from 'react';
import { Tabs as TabsPrimitive } from '@base-ui/react/tabs';
import { motion, type HTMLMotionProps, type Transition } from 'motion/react';

import { ReducedMotionConfig } from '../../../utils/motion';
import {
  TAB_ATTRIBUTE,
  useFinishAnimationsWhen,
  usePanelMotion,
  useTabsIndicator,
} from '../../../internal/tabs';

// Same API as Base UI's Tabs, moving like Animate UI v1's Base UI Tabs (see
// ../../../internal/tabs): the active tab's surface slides to the new tab,
// and the incoming panel fades in from a blur while its height springs.

/** Animate UI's additions to `Tabs.List`. */
type ListAnimationProps = {
  /** Transition of the active tab's surface sliding to the new tab. Defaults to a spring (stiffness 200, damping 25). */
  transition?: Transition;
};

/** Animate UI's additions to `Tabs.Panel`. */
type PanelAnimationProps = {
  /** Transition of the incoming panel: its fade (500ms ease-in-out) and, in `height`, its height (a spring, stiffness 200, damping 30). */
  transition?: Transition;
};

/** v1's TabsPanels spring: the panels' height. */
const HEIGHT_TRANSITION: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 30,
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

function Panel({ transition, ...props }: Panel.Props) {
  return (
    <TabsPrimitive.Panel
      {...props}
      // Base UI's props (className, style, hidden, data-*…) land on the
      // motion.div; it only carries the animation.
      render={(renderProps, state) => (
        <PanelMotion
          {...(renderProps as HTMLMotionProps<'div'>)}
          // A closing panel leaves at once: no exit, the two never overlap.
          active={!state.hidden && state.transitionStatus !== 'ending'}
          panelTransition={transition}
        />
      )}
    />
  );
}

namespace Panel {
  /** Base UI's props, plus Animate UI's `transition`. */
  export type Props = TabsPrimitive.Panel.Props &
    PanelAnimationProps &
    React.RefAttributes<HTMLDivElement>;
  export type State = TabsPrimitive.Panel.State;
  export type Metadata = TabsPrimitive.Panel.Metadata;
}

function PanelMotion({
  ref,
  active,
  panelTransition,
  hidden,
  ...props
}: HTMLMotionProps<'div'> & {
  active: boolean;
  panelTransition: Transition | undefined;
}) {
  const {
    ref: localRef,
    initial,
    animate,
  } = usePanelMotion(active, {
    transition: panelTransition,
    heightTransition: HEIGHT_TRANSITION,
  });
  useFinishAnimationsWhen(localRef, !active);

  return (
    <motion.div
      {...props}
      ref={(node: HTMLDivElement | null) => {
        localRef.current = node;
        if (typeof ref === 'function') return ref(node);
        if (ref) ref.current = node;
      }}
      // Base UI keeps a closing panel mounted until its animations end:
      // hide it right away.
      hidden={hidden || !active}
      initial={initial}
      animate={animate}
    />
  );
}

export { Root, List, Tab, Indicator, Panel };
