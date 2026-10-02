'use client';

import * as React from 'react';
import { Tabs as TabsPrimitive } from '@base-ui/react/tabs';
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

type TabsTabProps = React.ComponentProps<typeof TabsPrimitive.Tab>;

function TabsTab(props: TabsTabProps) {
  return <TabsPrimitive.Tab data-slot="tabs-tab" {...props} />;
}

type TabsPanelProps = React.ComponentProps<typeof TabsPrimitive.Panel> &
  HTMLMotionProps<'div'>;

function TabsPanel({
  value,
  keepMounted,
  transition = motionTransition.fade,
  ...props
}: TabsPanelProps) {
  // The incoming panel fades in; the outgoing one leaves at once, so the two
  // never overlap and nothing waits for an exit.
  return (
    <TabsPrimitive.Panel
      render={
        <motion.div
          data-slot="tabs-panel"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={transition}
          {...props}
        />
      }
      keepMounted={keepMounted}
      value={value}
    />
  );
}

type TabsPanelsAutoProps = Omit<AutoHeightProps, 'children'> & {
  mode?: 'auto-height';
  children: React.ReactNode;
  transition?: Transition;
};

type TabsPanelsLayoutProps = Omit<HTMLMotionProps<'div'>, 'children'> & {
  mode: 'layout';
  children: React.ReactNode;
  transition?: Transition;
};

type TabsPanelsProps = TabsPanelsAutoProps | TabsPanelsLayoutProps;

const defaultTransition: Transition = spring.snappy;

function isAutoMode(props: TabsPanelsProps): props is TabsPanelsAutoProps {
  return !props.mode || props.mode === 'auto-height';
}

function TabsPanels(props: TabsPanelsProps) {
  const { value } = useTabs();

  if (isAutoMode(props)) {
    const { children, transition = defaultTransition, ...autoProps } = props;

    return (
      <AutoHeight
        data-slot="tabs-panels"
        deps={[value]}
        transition={transition}
        {...autoProps}
      >
        <React.Fragment key={value}>{children}</React.Fragment>
      </AutoHeight>
    );
  }

  const {
    children,
    style,
    transition = defaultTransition,
    ...layoutProps
  } = props;

  return (
    <motion.div
      data-slot="tabs-panels"
      layout="size"
      layoutDependency={value}
      transition={{ layout: transition }}
      style={{ overflow: 'hidden', ...style }}
      {...layoutProps}
    >
      <React.Fragment key={value}>{children}</React.Fragment>
    </motion.div>
  );
}

export {
  Tabs,
  TabsHighlight,
  TabsHighlightItem,
  TabsList,
  TabsTab,
  TabsPanel,
  TabsPanels,
  type TabsProps,
  type TabsHighlightProps,
  type TabsHighlightItemProps,
  type TabsListProps,
  type TabsTabProps,
  type TabsPanelProps,
  type TabsPanelsProps,
};
