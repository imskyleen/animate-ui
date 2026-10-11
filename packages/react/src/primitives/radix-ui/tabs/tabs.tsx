'use client';

import * as React from 'react';
import { Tabs as TabsPrimitive } from 'radix-ui';
import type { Transition } from 'motion/react';

import { getStrictContext } from '../../../utils/strict-context';
import { ReducedMotionConfig } from '../../../utils/motion';
import {
  TAB_ATTRIBUTE,
  usePanelMotion,
  useTabsIndicator,
} from '../../../internal/tabs';

// Same API as Radix's Tabs, moving like Motion's Radix tabs example (see
// ../../../internal/tabs): one indicator slides to the new tab, and the
// panels change one after the other: the outgoing one fades out into a blur,
// then the incoming one fades in from it while the height glides.

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
  /** Transition of the indicator sliding to the new tab. Defaults to a spring (stiffness 300, damping 30). */
  transition?: Transition;
};

/** Animate UI's additions to `Tabs.Content`. */
type ContentAnimationProps = {
  /** Transition of the panel coming in: its fade from a blur (300ms) and, in `height`, the height gliding from the previous panel's (450ms, Motion's layout curve). */
  transition?: Transition;
  /** Transition of the panel leaving: its fade into a blur (150ms ease-out). */
  exitTransition?: Transition;
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
  ref,
  forceMount,
  hidden,
  inert,
  transition,
  exitTransition,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content> & ContentAnimationProps) {
  const { value } = useValue();
  const active = value === props.value;
  const {
    ref: panelRef,
    waiting,
    leaving,
  } = usePanelMotion(active, { transition, exitTransition });

  return (
    <TabsPrimitive.Content
      {...props}
      ref={(node: HTMLDivElement | null) => {
        panelRef.current = node;
        if (typeof ref === 'function') return ref(node);
        if (ref) ref.current = node;
      }}
      // Radix unmounts a panel the moment it's unselected: kept mounted while
      // it fades out.
      forceMount={forceMount || leaving ? true : undefined}
      // Hidden while the previous panel leaves, and once unselected (a
      // force-mounted panel stays in the DOM). Leaving, it stays in the page
      // and can't be reached.
      hidden={hidden || waiting || (!active && !leaving) || undefined}
      inert={inert || leaving || undefined}
    />
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
