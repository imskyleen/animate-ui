'use client';

import * as React from 'react';
import { motion, type Transition, type HTMLMotionProps } from 'motion/react';

import {
  motionTokens,
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../utils/motion';
import {
  Highlight,
  HighlightItem,
  type HighlightItemProps,
  type HighlightProps,
} from '../effects/highlight';
import { getStrictContext } from '../../utils/strict-context';
import { Slot, type WithAsChild } from '../slot';

type TabsOrientation = 'horizontal' | 'vertical';

const HIGHLIGHT_TRANSITION: Transition = motionTokens.spring.selection;
const CONTENTS_TRANSITION: Transition = motionTokens.spring.slide;
const CONTENT_TRANSITION: Transition = motionTokens.spring.selection;

const INSTANT: Transition = { duration: 0 };

type TabsContextType = {
  activeValue: string;
  handleValueChange: (value: string) => void;
  registerTrigger: (value: string, node: HTMLElement | null) => void;
  orientation: TabsOrientation;
  getTriggerId: (value: string) => string;
  getContentId: (value: string) => string;
  getTriggerValue: (node: HTMLElement) => string | undefined;
  registerId: (
    kind: 'trigger' | 'content',
    value: string,
    id: string | undefined,
  ) => void;
};

const [TabsProvider, useTabs] =
  getStrictContext<TabsContextType>('TabsContext');

type BaseTabsProps = React.ComponentProps<'div'> & {
  children: React.ReactNode;
  orientation?: TabsOrientation;
};

type UnControlledTabsProps = BaseTabsProps & {
  defaultValue?: string;
  value?: never;
  onValueChange?: never;
};

type ControlledTabsProps = BaseTabsProps & {
  value: string;
  onValueChange?: (value: string) => void;
  defaultValue?: never;
};

type TabsProps = UnControlledTabsProps | ControlledTabsProps;

function Tabs({
  defaultValue,
  value,
  onValueChange,
  orientation = 'horizontal',
  children,
  ...props
}: TabsProps) {
  const baseId = React.useId();
  const [activeValue, setActiveValue] = React.useState<string | undefined>(
    defaultValue,
  );
  const triggersRef = React.useRef(new Map<string, HTMLElement>());
  const initialSet = React.useRef(false);
  const isControlled = value !== undefined;

  React.useEffect(() => {
    if (
      !isControlled &&
      activeValue === undefined &&
      triggersRef.current.size > 0 &&
      !initialSet.current
    ) {
      const firstTab = triggersRef.current.keys().next().value as
        string | undefined;
      if (firstTab !== undefined) {
        setActiveValue(firstTab);
        initialSet.current = true;
      }
    }
  }, [activeValue, isControlled]);

  const registerTrigger = React.useCallback(
    (val: string, node: HTMLElement | null) => {
      if (node) {
        triggersRef.current.set(val, node);
        if (!isControlled && activeValue === undefined && !initialSet.current) {
          setActiveValue(val);
          initialSet.current = true;
        }
      } else {
        triggersRef.current.delete(val);
      }
    },
    [activeValue, isControlled],
  );

  const handleValueChange = React.useCallback(
    (val: string) => {
      if (!isControlled) setActiveValue(val);
      else onValueChange?.(val);
    },
    [isControlled, onValueChange],
  );

  const [customIds, setCustomIds] = React.useState<
    Record<string, { trigger?: string; content?: string }>
  >({});
  const registerId = React.useCallback(
    (kind: 'trigger' | 'content', val: string, id: string | undefined) => {
      setCustomIds((prev) => {
        if (prev[val]?.[kind] === id) return prev;
        return { ...prev, [val]: { ...prev[val], [kind]: id } };
      });
    },
    [],
  );

  const getTriggerId = React.useCallback(
    (val: string) =>
      customIds[val]?.trigger ?? `${baseId}-trigger-${toIdPart(val)}`,
    [baseId, customIds],
  );
  const getContentId = React.useCallback(
    (val: string) =>
      customIds[val]?.content ?? `${baseId}-content-${toIdPart(val)}`,
    [baseId, customIds],
  );
  const getTriggerValue = React.useCallback((node: HTMLElement) => {
    for (const [val, el] of triggersRef.current) if (el === node) return val;
    return undefined;
  }, []);

  return (
    <TabsProvider
      value={{
        activeValue: (value ?? activeValue) as string,
        handleValueChange,
        registerTrigger,
        orientation,
        getTriggerId,
        getContentId,
        getTriggerValue,
        registerId,
      }}
    >
      <ReducedMotionConfig>
        <div data-slot="tabs" data-orientation={orientation} {...props}>
          {children}
        </div>
      </ReducedMotionConfig>
    </TabsProvider>
  );
}

function toIdPart(value: string) {
  return value.replace(/\s+/g, '-');
}

function isEnabled(tab: HTMLElement) {
  return (
    !tab.hasAttribute('disabled') &&
    tab.getAttribute('aria-disabled') !== 'true'
  );
}

type TabsHighlightProps = Omit<HighlightProps, 'controlledItems' | 'value'>;

function TabsHighlight({
  transition,
  exitDelay,
  ...props
}: TabsHighlightProps) {
  const { activeValue } = useTabs();

  return (
    <Highlight
      data-slot="tabs-highlight"
      controlledItems
      value={activeValue}
      transition={transition ?? HIGHLIGHT_TRANSITION}
      exitDelay={exitDelay}
      click={false}
      {...props}
    />
  );
}

type TabsListProps = React.ComponentProps<'div'> & {
  children: React.ReactNode;
};

function TabsList(props: TabsListProps) {
  const { orientation } = useTabs();
  return (
    <div
      role="tablist"
      aria-orientation={orientation}
      data-slot="tabs-list"
      data-orientation={orientation}
      {...props}
    />
  );
}

type TabsHighlightItemProps = HighlightItemProps & {
  value: string;
};

function TabsHighlightItem(props: TabsHighlightItemProps) {
  return <HighlightItem data-slot="tabs-highlight-item" {...props} />;
}

type TabsTriggerProps = WithAsChild<
  {
    value: string;
    children: React.ReactNode;
  } & HTMLMotionProps<'button'>
>;

function TabsTrigger({
  ref,
  value,
  id,
  asChild = false,
  onClick,
  onKeyDown,
  ...props
}: TabsTriggerProps) {
  const {
    activeValue,
    handleValueChange,
    registerTrigger,
    registerId,
    orientation,
    getTriggerId,
    getContentId,
    getTriggerValue,
  } = useTabs();
  const isActive = activeValue === value;

  React.useEffect(() => {
    registerId('trigger', value, id);
    return () => registerId('trigger', value, undefined);
  }, [registerId, value, id]);

  const localRef = React.useRef<HTMLButtonElement | null>(null);
  React.useImperativeHandle(ref, () => localRef.current as HTMLButtonElement);

  React.useEffect(() => {
    registerTrigger(value, localRef.current);
    return () => registerTrigger(value, null);
  }, [value, registerTrigger]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
      return;

    const current = event.currentTarget;
    const list = current.closest('[role="tablist"]');
    if (!list) return;

    const rtl = getComputedStyle(list).direction === 'rtl';
    const next =
      orientation === 'vertical'
        ? 'ArrowDown'
        : rtl
          ? 'ArrowLeft'
          : 'ArrowRight';
    const prev =
      orientation === 'vertical' ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft';
    if (![next, prev, 'Home', 'End'].includes(event.key)) return;

    const tabs = Array.from(
      list.querySelectorAll<HTMLElement>('[role="tab"]'),
    ).filter(
      (tab) =>
        tab.closest('[role="tablist"]') === list &&
        (tab === current || isEnabled(tab)),
    );
    const index = tabs.indexOf(current);
    if (index === -1) return;

    const count = tabs.length;
    const targetIndex =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? count - 1
          : (index + (event.key === next ? 1 : -1) + count) % count;
    const target = tabs[targetIndex];

    event.preventDefault();
    if (!target) return;
    target.focus();
    const targetValue = getTriggerValue(target);
    if (targetValue !== undefined) handleValueChange(targetValue);
  };

  const Component = asChild ? Slot : motion.button;

  return (
    <Component
      ref={localRef}
      id={id ?? getTriggerId(value)}
      data-slot="tabs-trigger"
      role="tab"
      type="button"
      aria-selected={isActive}
      aria-controls={getContentId(value)}
      tabIndex={isActive ? 0 : -1}
      data-state={isActive ? 'active' : 'inactive'}
      data-orientation={orientation}
      {...props}
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) handleValueChange(value);
      }}
      onKeyDown={handleKeyDown}
    />
  );
}

type TabsContentsProps = HTMLMotionProps<'div'> & {
  children: React.ReactNode;
  transition?: Transition;
};

function TabsContents({
  children,
  transition: transitionProp,
  ref,
  style,
  ...props
}: TabsContentsProps) {
  const { activeValue } = useTabs();
  const spring = useTempoTransition(transitionProp ?? CONTENTS_TRANSITION);
  const reduce = useShouldReduceMotion();
  const transition: Transition = reduce ? INSTANT : spring;
  const childrenArray = React.Children.toArray(children);
  const activeIndex = childrenArray.findIndex(
    (child): child is React.ReactElement<{ value: string }> =>
      React.isValidElement(child) &&
      typeof child.props === 'object' &&
      child.props !== null &&
      'value' in child.props &&
      child.props.value === activeValue,
  );

  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const itemRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const shownIndex = activeValue === undefined ? 0 : activeIndex;
  const [heightState, setHeightState] = React.useState<{
    value: number;
    animate: boolean;
    index: number;
  } | null>(null);
  const setHeight = React.useCallback(
    (value: number, index: number, glide = false) => {
      setHeightState((previous) =>
        previous?.value === value
          ? previous
          : {
              value,
              animate: previous !== null && (glide || previous.value > 0),
              index: previous?.index ?? index,
            },
      );
      requestAnimationFrame(() =>
        requestAnimationFrame(() =>
          setHeightState((previous) =>
            previous && !previous.animate && previous.value > 0
              ? { ...previous, animate: true }
              : previous,
          ),
        ),
      );
    },
    [],
  );

  const roRef = React.useRef<ResizeObserver | null>(null);

  const measure = React.useCallback((index: number) => {
    const pane = itemRefs.current[index];
    const container = containerRef.current;
    if (!pane || !container) return 0;

    const base = pane.getBoundingClientRect().height || 0;

    const cs = getComputedStyle(container);
    const isBorderBox = cs.boxSizing === 'border-box';
    const paddingY =
      (parseFloat(cs.paddingTop || '0') || 0) +
      (parseFloat(cs.paddingBottom || '0') || 0);
    const borderY =
      (parseFloat(cs.borderTopWidth || '0') || 0) +
      (parseFloat(cs.borderBottomWidth || '0') || 0);

    let total = base + (isBorderBox ? paddingY + borderY : 0);

    const dpr =
      typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    total = Math.ceil(total * dpr) / dpr;

    return total;
  }, []);

  React.useEffect(() => {
    if (roRef.current) {
      roRef.current.disconnect();
      roRef.current = null;
    }

    const pane = itemRefs.current[activeIndex];
    const container = containerRef.current;
    if (!pane || !container) return;

    const first = measure(activeIndex);
    if (first > 0) setHeight(first, activeIndex, true);

    const ro = new ResizeObserver(() => {
      const next = measure(activeIndex);
      if (next > 0) requestAnimationFrame(() => setHeight(next, activeIndex));
    });

    ro.observe(pane);
    ro.observe(container);

    roRef.current = ro;
    return () => {
      ro.disconnect();
      roRef.current = null;
    };
  }, [activeIndex, childrenArray.length, measure, setHeight]);

  React.useLayoutEffect(() => {
    if (heightState === null && activeIndex >= 0) {
      const next = measure(activeIndex);
      if (next > 0) setHeight(next, activeIndex);
      else if (containerRef.current?.getClientRects().length)
        setHeightState({ value: 0, animate: false, index: activeIndex });
    }
  }, [activeIndex, heightState, measure, setHeight]);

  return (
    <motion.div
      ref={(node: HTMLDivElement | null) => {
        containerRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      data-slot="tabs-contents"
      animate={{ height: heightState?.value ?? 'auto' }}
      transition={heightState?.animate ? transition : INSTANT}
      {...props}
      style={{ ...style, overflow: 'hidden' }}
    >
      <motion.div
        style={{ display: 'flex', marginInline: -8 }}
        animate={{ x: activeIndex * -100 + '%' }}
        transition={transition}
      >
        {childrenArray.map((child, index) => (
          <div
            key={index}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            style={{
              width: '100%',
              flexShrink: 0,
              paddingInline: 8,
              height: '100%',
              ...(!heightState?.animate &&
              index !== shownIndex &&
              index !== heightState?.index
                ? { maxHeight: 0, overflow: 'hidden' }
                : null),
            }}
          >
            {child}
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}

type TabsContentProps = WithAsChild<
  {
    value: string;
    children: React.ReactNode;
  } & HTMLMotionProps<'div'>
>;

function TabsContent({
  value,
  id,
  style,
  asChild = false,
  ...props
}: TabsContentProps) {
  const { activeValue, getTriggerId, getContentId, registerId } = useTabs();
  const blur = useTempoTransition(CONTENT_TRANSITION);
  const isActive = activeValue === value;

  React.useEffect(() => {
    registerId('content', value, id);
    return () => registerId('content', value, undefined);
  }, [registerId, value, id]);

  const Component = asChild ? Slot : motion.div;

  return (
    <Component
      role="tabpanel"
      id={id ?? getContentId(value)}
      aria-labelledby={getTriggerId(value)}
      tabIndex={isActive ? 0 : -1}
      data-slot="tabs-content"
      data-state={isActive ? 'active' : 'inactive'}
      inert={!isActive}
      style={{ overflow: 'hidden', ...style }}
      initial={{ filter: 'blur(0px)' }}
      animate={{ filter: isActive ? 'blur(0px)' : 'blur(4px)' }}
      exit={{ filter: 'blur(0px)' }}
      transition={blur}
      {...props}
    />
  );
}

export {
  Tabs,
  TabsList,
  TabsHighlight,
  TabsHighlightItem,
  TabsTrigger,
  TabsContents,
  TabsContent,
  useTabs,
  type TabsProps,
  type TabsListProps,
  type TabsHighlightProps,
  type TabsHighlightItemProps,
  type TabsTriggerProps,
  type TabsContentsProps,
  type TabsContentProps,
  type TabsContextType,
  type TabsOrientation,
};
