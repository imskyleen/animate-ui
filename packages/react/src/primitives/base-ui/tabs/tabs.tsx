'use client';
/* eslint-disable @typescript-eslint/no-namespace -- each part keeps Base UI's `Part.Props`/`Part.State` type namespace */

import * as React from 'react';
import { Tabs as TabsPrimitive } from '@base-ui/react/tabs';
import { motion, type HTMLMotionProps, type Transition } from 'motion/react';

import { ReducedMotionConfig, useMotionTokens } from '../../../utils/motion';
import {
  TAB_ATTRIBUTE,
  TabsMotionProvider,
  isKeyboardInput,
  useFinishAnimationsWhen,
  usePanelEnters,
  useTabsIndicator,
} from '../../../internal/tabs';

// Same API as Base UI's Tabs. The active tab's surface glides between tabs
// (see ../../../internal/tabs), and the incoming panel fades in.

/** Animate UI's additions to `Tabs.List`. */
type ListAnimationProps = {
  /** Transition of the indicator gliding to the active tab. Defaults to `spring.snappy`. */
  transition?: Transition;
};

/** Animate UI's additions to `Tabs.Panel`. */
type PanelAnimationProps = {
  /** Transition of the incoming panel's fade. Defaults to `transition.fade` (600ms). */
  transition?: Transition;
};

// When the user renders Base UI's own `Tabs.Indicator`, the list doesn't
// draw its gliding one.
const CustomIndicatorContext = React.createContext<
  ((present: boolean) => void) | null
>(null);

function Root(props: Root.Props) {
  return (
    <TabsMotionProvider>
      <ReducedMotionConfig>
        <TabsPrimitive.Root {...props} />
      </ReducedMotionConfig>
    </TabsMotionProvider>
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
      // motion.div; it only carries the fade.
      render={(renderProps, state) => (
        <PanelMotion
          {...(renderProps as HTMLMotionProps<'div'>)}
          // A closing panel leaves at once: no exit, the two never overlap.
          active={!state.hidden && state.transitionStatus !== 'ending'}
          fadeTransition={transition}
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
  fadeTransition,
  hidden,
  ...props
}: HTMLMotionProps<'div'> & {
  active: boolean;
  fadeTransition: Transition | undefined;
}) {
  const tokens = useMotionTokens();
  const enters = usePanelEnters(active);
  const localRef = React.useRef<HTMLDivElement>(null);
  useFinishAnimationsWhen(localRef, !active);
  // Keyboard changes swap the panel at once.
  const fade = isKeyboardInput()
    ? tokens.transition.instant
    : (fadeTransition ?? tokens.transition.fade);

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
      initial={enters ? { opacity: 0 } : false}
      animate={
        active
          ? { opacity: 1, transition: fade }
          : { opacity: 0, transition: tokens.transition.instant }
      }
    />
  );
}

export { Root, List, Tab, Indicator, Panel };
