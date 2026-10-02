'use client';

import * as React from 'react';
import { motion, type Transition } from 'motion/react';
import {
  TabGroup as TabGroupPrimitive,
  TabList as TabListPrimitive,
  Tab as TabPrimitive,
  TabPanels as TabPanelsPrimitive,
  TabPanel as TabPanelPrimitive,
  type TabGroupProps as TabGroupPrimitiveProps,
  type TabListProps as TabListPrimitiveProps,
  type TabProps as TabPrimitiveProps,
  type TabPanelsProps as TabPanelsPrimitiveProps,
  type TabPanelProps as TabPanelPrimitiveProps,
} from '@headlessui/react';

import {
  Highlight,
  HighlightItem,
  HighlightItemProps,
  HighlightProps,
} from '@/registry/primitives/effects/highlight';
import { getStrictContext } from '@/registry/lib/get-strict-context';
import {
  ReducedMotionConfig,
  spring,
  transition as motionTransition,
} from '@/registry/lib/motion';
import { AutoHeight } from '@/registry/primitives/effects/auto-height';

type TabsContextType = {
  selectedIndex: number;
  /** Last interaction was the keyboard: the indicator moves instantly. */
  isKeyboard: boolean;
};

const [TabsProvider, useTabs] =
  getStrictContext<TabsContextType>('TabsContext');

type TabGroupProps<TTag extends React.ElementType = 'div'> =
  TabGroupPrimitiveProps<TTag> & {
    as?: TTag;
    className?: string;
  };

function TabGroup<TTag extends React.ElementType = 'div'>({
  children,
  onKeyDownCapture,
  onPointerDownCapture,
  ...props
}: TabGroupProps<TTag>) {
  const [isKeyboard, setIsKeyboard] = React.useState(false);

  return (
    <ReducedMotionConfig>
      <TabGroupPrimitive
        data-slot="tab-group"
        {...props}
        onKeyDownCapture={(event: React.KeyboardEvent<HTMLElement>) => {
          setIsKeyboard(true);
          onKeyDownCapture?.(event);
        }}
        onPointerDownCapture={(event: React.PointerEvent<HTMLElement>) => {
          setIsKeyboard(false);
          onPointerDownCapture?.(event);
        }}
      >
        {(bag) => (
          <TabsProvider
            value={{ selectedIndex: bag.selectedIndex, isKeyboard }}
          >
            {typeof children === 'function' ? children(bag) : children}
          </TabsProvider>
        )}
      </TabGroupPrimitive>
    </ReducedMotionConfig>
  );
}

type TabListProps<TTag extends React.ElementType = 'div'> =
  TabListPrimitiveProps<TTag> & {
    as?: TTag;
    className?: string;
  };

function TabList<TTag extends React.ElementType = 'div'>(
  props: TabListProps<TTag>,
) {
  return <TabListPrimitive data-slot="tab-list" {...props} />;
}

type TabHighlightProps = Omit<HighlightProps, 'controlledItems' | 'value'>;

function TabHighlight({
  transition = spring.snappy,
  ...props
}: TabHighlightProps) {
  const { selectedIndex, isKeyboard } = useTabs();

  return (
    <Highlight
      data-slot="tab-highlight"
      controlledItems
      value={selectedIndex.toString()}
      transition={isKeyboard ? motionTransition.instant : transition}
      {...props}
    />
  );
}

type TabProps<TTag extends React.ElementType = 'button'> = Omit<
  TabPrimitiveProps<TTag>,
  'children'
> &
  Required<Pick<TabPrimitiveProps<TTag>, 'children'>> & {
    index: number;
    as?: TTag;
    className?: string;
  };

function Tab<TTag extends React.ElementType = 'button'>(props: TabProps<TTag>) {
  const { index, as = 'button', ...rest } = props;

  return (
    <TabPrimitive
      data-slot="tab"
      as={as as React.ElementType}
      index={index}
      {...rest}
    />
  );
}

type TabHighlightItemProps = HighlightItemProps & {
  index: number;
};

function TabHighlightItem({ index, ...props }: TabHighlightItemProps) {
  return (
    <HighlightItem
      data-slot="tab-highlight-item"
      value={index.toString()}
      {...props}
    />
  );
}

type TabPanelProps<TTag extends React.ElementType = typeof motion.div> = Omit<
  TabPanelPrimitiveProps<TTag>,
  'transition'
> & {
  children: React.ReactNode;
  className?: string;
  as?: TTag;
  transition?: Transition;
};

function TabPanel<TTag extends React.ElementType = typeof motion.div>(
  props: TabPanelProps<TTag>,
) {
  const {
    as = motion.div,
    transition = motionTransition.fade,
    ...rest
  } = props;

  // The incoming panel fades in; the outgoing one leaves at once, so the two
  // never overlap and nothing waits for an exit.
  return (
    <TabPanelPrimitive
      data-slot="tab-panel"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={transition}
      as={as as React.ElementType}
      {...rest}
    />
  );
}

type TabPanelsAutoProps<TTag extends React.ElementType = typeof AutoHeight> =
  Omit<TabPanelsPrimitiveProps<TTag>, 'transition' | 'as'> & {
    mode?: 'auto-height';
    className?: string;
    transition?: Transition;
  };

type TabPanelsLayoutProps<TTag extends React.ElementType = typeof motion.div> =
  Omit<TabPanelsPrimitiveProps<TTag>, 'transition'> & {
    mode: 'layout';
    className?: string;
    transition?: Transition;
  };

type TabPanelsProps<TTag extends React.ElementType> =
  TabPanelsAutoProps<TTag> | TabPanelsLayoutProps<TTag>;

const defaultTransition: Transition = spring.snappy;

function TabPanels<TTag extends React.ElementType>(
  props: TabPanelsProps<TTag>,
) {
  const { selectedIndex } = useTabs();

  if (!('mode' in props) || props.mode === 'auto-height') {
    const { transition = defaultTransition, ...rest } = props;

    return (
      <TabPanelsPrimitive
        data-slot="tab-panels"
        deps={[selectedIndex]}
        transition={transition}
        as={AutoHeight}
        {...rest}
      />
    );
  }

  if ('mode' in props && props.mode === 'layout') {
    const {
      transition = defaultTransition,
      as = motion.div,
      style,
      ...rest
    } = props;

    return (
      <TabPanelsPrimitive
        data-slot="tab-panels"
        layout="size"
        layoutDependency={selectedIndex.toString()}
        style={{ overflow: 'hidden', ...style }}
        transition={{ layout: transition }}
        as={as as React.ElementType}
        {...rest}
      />
    );
  }

  return <React.Fragment />;
}

export {
  TabGroup,
  TabList,
  TabHighlight,
  TabHighlightItem,
  Tab,
  TabPanel,
  TabPanels,
  type TabGroupProps,
  type TabListProps,
  type TabHighlightProps,
  type TabHighlightItemProps,
  type TabProps,
  type TabPanelProps,
  type TabPanelsProps,
};
