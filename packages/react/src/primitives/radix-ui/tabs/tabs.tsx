'use client';

import * as React from 'react';
import { Tabs as TabsPrimitive } from 'radix-ui';
import { motion, type Transition } from 'motion/react';

import { getStrictContext } from '../../../utils/strict-context';
import { ReducedMotionConfig } from '../../../utils/motion';
import {
  TAB_ATTRIBUTE,
  usePanelMotion,
  useTabsIndicator,
} from '../../../internal/tabs';

// Same API as Radix's Tabs, moving like Animate UI v1's Radix Tabs (see
// ../../../internal/tabs): the active tab's surface slides to the new tab,
// and the incoming panel fades in from a blur while its height springs.

// An object, not the raw value: no tab selected is `undefined`, which a
// strict context would read as "no provider".
const [ValueProvider, useValue] = getStrictContext<{
  value: string | undefined;
}>('Tabs.Root');

type TabsProps = TabsPrimitive.TabsProps;
type TabsListProps = TabsPrimitive.TabsListProps & ListAnimationProps;
type TabsTriggerProps = TabsPrimitive.TabsTriggerProps;
type TabsContentProps = TabsPrimitive.TabsContentProps & ContentAnimationProps;

/** Animate UI's additions to `Tabs.List`. */
type ListAnimationProps = {
  /** Transition of the active tab's surface sliding to the new tab. Defaults to a spring (stiffness 200, damping 25). */
  transition?: Transition;
};

/** Animate UI's additions to `Tabs.Content`. */
type ContentAnimationProps = {
  /** Transition of the incoming panel: its fade (500ms ease-out) and, in `height`, its height (a spring, stiffness 300, damping 30). */
  transition?: Transition;
};

function Root(props: React.ComponentProps<typeof TabsPrimitive.Root>) {
  // Mirrors the selected tab (Radix keeps it private) for force-mounted
  // panels; Radix stays the source of truth.
  const controlled = props.value !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState(props.defaultValue);
  const value = controlled ? props.value : uncontrolled;

  const onValueChange = (next: string) => {
    if (!controlled) setUncontrolled(next);
    props.onValueChange?.(next);
  };

  return (
    <ValueProvider value={{ value }}>
      <ReducedMotionConfig>
        <TabsPrimitive.Root {...props} onValueChange={onValueChange} />
      </ReducedMotionConfig>
    </ValueProvider>
  );
}

function List({
  ref,
  transition,
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & ListAnimationProps) {
  const [list, setList] = React.useState<HTMLDivElement | null>(null);
  // With `asChild`, Radix's Slot takes a single child: no room for the
  // indicator, so the list keeps the active tab's own surface.
  const { indicator, listProps } = useTabsIndicator(list, {
    transition,
    enabled: !props.asChild,
  });

  return (
    <TabsPrimitive.List
      {...props}
      {...listProps}
      ref={(node) => {
        setList(node);
        if (typeof ref === 'function') return ref(node);
        if (ref) ref.current = node;
      }}
    >
      {props.asChild ? (
        children
      ) : (
        <>
          {indicator}
          {children}
        </>
      )}
    </TabsPrimitive.List>
  );
}

function Trigger(props: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return <TabsPrimitive.Trigger {...{ [TAB_ATTRIBUTE]: '' }} {...props} />;
}

function Content({
  forceMount,
  transition,
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content> & ContentAnimationProps) {
  const { value } = useValue();
  const active = value === props.value;
  const { ref, initial, animate } = usePanelMotion(active, { transition });

  return (
    // Radix's props (className, style, data-state, hidden…) land on the
    // motion.div through asChild; it only carries the animation. The
    // outgoing panel unmounts at once (no exit), so the two never overlap.
    <TabsPrimitive.Content {...props} forceMount={forceMount} asChild>
      <motion.div
        ref={ref as React.Ref<HTMLDivElement>}
        // A force-mounted inactive panel stays in the DOM, hidden (the
        // outgoing panel leaves at once).
        hidden={!active || undefined}
        initial={initial}
        animate={animate}
      >
        {children}
      </motion.div>
    </TabsPrimitive.Content>
  );
}

const createTabsScope: typeof TabsPrimitive.createTabsScope =
  TabsPrimitive.createTabsScope;

export {
  Root,
  List,
  Trigger,
  Content,
  List as TabsList,
  Trigger as TabsTrigger,
  Content as TabsContent,
  createTabsScope,
  type TabsProps,
  type TabsListProps,
  type TabsTriggerProps,
  type TabsContentProps,
};
