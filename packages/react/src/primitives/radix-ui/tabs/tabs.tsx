'use client';

import * as React from 'react';
import { Tabs as TabsPrimitive } from 'radix-ui';
import { motion, type Transition } from 'motion/react';

import { getStrictContext } from '../../../utils/strict-context';
import { ReducedMotionConfig, useMotionTokens } from '../../../utils/motion';
import {
  TAB_ATTRIBUTE,
  TabsMotionProvider,
  isKeyboardInput,
  usePanelEnters,
  useTabsIndicator,
} from '../../../internal/tabs';

// Same API as Radix's Tabs. The active tab's surface glides between tabs
// (see ../../../internal/tabs), and the incoming panel fades in.

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
  /** Transition of the indicator gliding to the active tab. Defaults to `spring.snappy`. */
  transition?: Transition;
};

/** Animate UI's additions to `Tabs.Content`. */
type ContentAnimationProps = {
  /** Transition of the incoming panel's fade. Defaults to `transition.fade` (600ms). */
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
      <TabsMotionProvider>
        <ReducedMotionConfig>
          <TabsPrimitive.Root {...props} onValueChange={onValueChange} />
        </ReducedMotionConfig>
      </TabsMotionProvider>
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
  const tokens = useMotionTokens();
  const active = value === props.value;
  const enters = usePanelEnters(active);
  // Keyboard changes swap the panel at once.
  const fade = isKeyboardInput()
    ? tokens.transition.instant
    : (transition ?? tokens.transition.fade);

  return (
    // Radix's props (className, style, data-state, hidden…) land on the
    // motion.div through asChild; it only carries the fade. The outgoing panel
    // unmounts at once (no exit), so the two never overlap.
    <TabsPrimitive.Content {...props} forceMount={forceMount} asChild>
      <motion.div
        initial={enters ? { opacity: 0 } : false}
        // A force-mounted inactive panel stays in the DOM, hidden (the
        // outgoing panel leaves at once).
        hidden={!active || undefined}
        animate={
          active
            ? { opacity: 1, transition: fade }
            : { opacity: 0, transition: tokens.transition.instant }
        }
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
