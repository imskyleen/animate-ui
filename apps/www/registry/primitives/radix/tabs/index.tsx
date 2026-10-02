'use client';

import * as React from 'react';
import { Tabs as TabsPrimitive } from 'radix-ui';
import { motion, type HTMLMotionProps, type Transition } from 'motion/react';

import {
  Highlight,
  HighlightItem,
  type HighlightProps,
  type HighlightItemProps,
} from '@/registry/primitives/effects/highlight';
import { getStrictContext } from '@/registry/lib/get-strict-context';
import { useControlledState } from '@/registry/hooks/use-controlled-state';
import {
  ReducedMotionConfig,
  spring,
  transition as motionTransition,
} from '@/registry/lib/motion';
import {
  AutoHeight,
  type AutoHeightProps,
} from '@/registry/primitives/effects/auto-height';

type TabsContextType = {
  value: string | undefined;
  setValue: TabsProps['onValueChange'];
  /** Last interaction was the keyboard: the indicator moves instantly. */
  isKeyboard: boolean;
};

const [TabsProvider, useTabs] =
  getStrictContext<TabsContextType>('TabsContext');

type TabsProps = React.ComponentProps<typeof TabsPrimitive.Root>;

function Tabs({ onKeyDownCapture, onPointerDownCapture, ...props }: TabsProps) {
  const [value, setValue] = useControlledState({
    value: props.value,
    defaultValue: props.defaultValue,
    onChange: props.onValueChange,
  });
  const [isKeyboard, setIsKeyboard] = React.useState(false);

  return (
    <TabsProvider value={{ value, setValue, isKeyboard }}>
      <ReducedMotionConfig>
        <TabsPrimitive.Root
          data-slot="tabs"
          {...props}
          onKeyDownCapture={(event) => {
            setIsKeyboard(true);
            onKeyDownCapture?.(event);
          }}
          onPointerDownCapture={(event) => {
            setIsKeyboard(false);
            onPointerDownCapture?.(event);
          }}
          onValueChange={setValue}
        />
      </ReducedMotionConfig>
    </TabsProvider>
  );
}

type TabsHighlightProps = Omit<HighlightProps, 'controlledItems' | 'value'>;

function TabsHighlight({
  transition = spring.snappy,
  ...props
}: TabsHighlightProps) {
  const { value, isKeyboard } = useTabs();

  return (
    <Highlight
      data-slot="tabs-highlight"
      controlledItems
      value={value}
      transition={isKeyboard ? motionTransition.instant : transition}
      click={false}
      {...props}
    />
  );
}

type TabsListProps = React.ComponentProps<typeof TabsPrimitive.List>;

function TabsList(props: TabsListProps) {
  return <TabsPrimitive.List data-slot="tabs-list" {...props} />;
}

type TabsHighlightItemProps = HighlightItemProps & {
  value: string;
};

function TabsHighlightItem(props: TabsHighlightItemProps) {
  return <HighlightItem data-slot="tabs-highlight-item" {...props} />;
}

type TabsTriggerProps = React.ComponentProps<typeof TabsPrimitive.Trigger>;

function TabsTrigger(props: TabsTriggerProps) {
  return <TabsPrimitive.Trigger data-slot="tabs-trigger" {...props} />;
}

type TabsContentProps = React.ComponentProps<typeof TabsPrimitive.Content> &
  HTMLMotionProps<'div'>;

function TabsContent({
  value,
  forceMount,
  transition = motionTransition.fade,
  ...props
}: TabsContentProps) {
  // The incoming panel fades in; the outgoing one leaves at once, so the two
  // never overlap and nothing waits for an exit.
  return (
    <TabsPrimitive.Content asChild forceMount={forceMount} value={value}>
      <motion.div
        data-slot="tabs-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={transition}
        {...props}
      />
    </TabsPrimitive.Content>
  );
}

type TabsContentsAutoProps = AutoHeightProps & {
  mode?: 'auto-height';
  children: React.ReactNode;
  transition?: Transition;
};

type TabsContentsLayoutProps = Omit<HTMLMotionProps<'div'>, 'transition'> & {
  mode: 'layout';
  children: React.ReactNode;
  transition?: Transition;
};

type TabsContentsProps = TabsContentsAutoProps | TabsContentsLayoutProps;

const defaultTransition: Transition = spring.snappy;

function isAutoMode(props: TabsContentsProps): props is TabsContentsAutoProps {
  return !('mode' in props) || props.mode === 'auto-height';
}

function TabsContents(props: TabsContentsProps) {
  const { value } = useTabs();

  if (isAutoMode(props)) {
    const { transition = defaultTransition, ...autoProps } = props;

    return (
      <AutoHeight
        data-slot="tabs-contents"
        deps={[value]}
        transition={transition}
        {...autoProps}
      />
    );
  }

  const { transition = defaultTransition, style, ...layoutProps } = props;

  return (
    <motion.div
      data-slot="tabs-contents"
      layout="size"
      layoutDependency={value}
      style={{ overflow: 'hidden', ...style }}
      transition={{ layout: transition }}
      {...layoutProps}
    />
  );
}

export {
  Tabs,
  TabsHighlight,
  TabsHighlightItem,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsContents,
  type TabsProps,
  type TabsHighlightProps,
  type TabsHighlightItemProps,
  type TabsListProps,
  type TabsTriggerProps,
  type TabsContentProps,
  type TabsContentsProps,
};
