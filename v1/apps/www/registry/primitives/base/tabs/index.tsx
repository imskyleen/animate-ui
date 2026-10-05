'use client';

import * as React from 'react';
import { Tabs as TabsPrimitive } from '@base-ui-components/react/tabs';
import {
  motion,
  AnimatePresence,
  type HTMLMotionProps,
  type Transition,
} from 'motion/react';

import {
  Highlight,
  HighlightItem,
  type HighlightProps,
  type HighlightItemProps,
} from '@/registry/primitives/effects/highlight';
import { getStrictContext } from '@/registry/lib/get-strict-context';
import { useControlledState } from '@/registry/hooks/use-controlled-state';
import {
  AutoHeight,
  type AutoHeightProps,
} from '@/registry/primitives/effects/auto-height';

type TabsContextType = {
  value: string | undefined;
  setValue: TabsProps['onValueChange'];
};

const [TabsProvider, useTabs] =
  getStrictContext<TabsContextType>('TabsContext');

type TabsProps = React.ComponentProps<typeof TabsPrimitive.Root>;

function Tabs(props: TabsProps) {
  const [value, setValue] = useControlledState({
    value: props.value,
    defaultValue: props.defaultValue,
    onChange: props.onValueChange,
  });

  return (
    <TabsProvider value={{ value, setValue }}>
      <TabsPrimitive.Root
        data-slot="tabs"
        {...props}
        onValueChange={setValue}
      />
    </TabsProvider>
  );
}

type TabsHighlightProps = Omit<HighlightProps, 'controlledItems' | 'value'>;

function TabsHighlight({
  transition = { type: 'spring', stiffness: 200, damping: 25 },
  ...props
}: TabsHighlightProps) {
  const { value } = useTabs();

  return (
    <Highlight
      data-slot="tabs-highlight"
      controlledItems
      value={value}
      transition={transition}
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
  transition = { duration: 0.5, ease: 'easeInOut' },
  ...props
}: TabsPanelProps) {
  return (
    <AnimatePresence mode="wait">
      <TabsPrimitive.Panel
        render={
          <motion.div
            data-slot="tabs-panel"
            layout
            layoutDependency={value}
            initial={{ opacity: 0, filter: 'blur(4px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(4px)' }}
            transition={transition}
            {...props}
          />
        }
        keepMounted={keepMounted}
        value={value}
      />
    </AnimatePresence>
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

const defaultTransition: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 30,
};

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
