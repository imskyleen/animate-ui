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

const [ValueProvider, useValue] = getStrictContext<{
  value: string | undefined;
}>('Tabs.Root');

type TabsProps = TabsPrimitive.TabsProps;
type TabsListProps = TabsPrimitive.TabsListProps & ListAnimationProps;
type TabsTriggerProps = TabsPrimitive.TabsTriggerProps;
type TabsContentProps = TabsPrimitive.TabsContentProps & ContentAnimationProps;

type ListAnimationProps = {
  transition?: Transition;
};

type ContentAnimationProps = {
  transition?: Transition;
  exitTransition?: Transition;
};

function Root({
  value: valueProp,
  defaultValue,
  onValueChange,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  const controlled = valueProp !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
  const value = controlled ? valueProp : uncontrolled;

  const handleValueChange = (next: string) => {
    if (!controlled) setUncontrolled(next);
    onValueChange?.(next);
  };

  return (
    <ValueProvider value={{ value }}>
      <ReducedMotionConfig>
        <TabsPrimitive.Root
          {...props}
          value={value ?? ''}
          onValueChange={handleValueChange}
        />
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
      forceMount={forceMount || leaving ? true : undefined}
      hidden={hidden || waiting || (!active && !leaving) || undefined}
      inert={inert || leaving || undefined}
    />
  );
}

const createTabsScope: typeof TabsPrimitive.createTabsScope =
  TabsPrimitive.createTabsScope;

Root.displayName = 'Tabs';
List.displayName = 'TabsList';
Trigger.displayName = 'TabsTrigger';
Content.displayName = 'TabsContent';

export {
  Root,
  Root as Tabs,
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
