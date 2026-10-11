'use client';

import * as React from 'react';
import { motion, type Transition, type HTMLMotionProps } from 'motion/react';

import { ReducedMotionConfig } from '../../utils/motion';
import {
  TAB_ATTRIBUTE,
  usePanelMotion,
  useTabsIndicator,
} from '../../internal/tabs';
import { getStrictContext } from '../../utils/strict-context';
import { Slot, type WithAsChild } from '../slot';

type TabsOrientation = 'horizontal' | 'vertical';

// Animate UI's own tabs move like the library tabs, after Motion's Radix tabs
// example (see ../../internal/tabs): the highlight is one surface sliding to
// the selected trigger on a spring (stiffness 300, damping 30), and the
// panels change one after the other: the outgoing one fades out into a blur,
// then the incoming one fades in from it while the height glides.

type TabsContextType = {
  activeValue: string;
  handleValueChange: (value: string) => void;
  registerTrigger: (value: string, node: HTMLElement | null) => void;
  /** Arrow keys follow it: Left/Right when horizontal, Up/Down when vertical. */
  orientation: TabsOrientation;
  /** Id of a trigger, referenced by its panel's `aria-labelledby`. */
  getTriggerId: (value: string) => string;
  /** Id of a panel, referenced by its trigger's `aria-controls`. */
  getContentId: (value: string) => string;
  /** Value of a registered trigger element. */
  getTriggerValue: (node: HTMLElement) => string | undefined;
  /** Records a trigger's or panel's own `id`, so its pair references it. */
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
  /** Which arrow keys move between triggers. */
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

  // Own ids passed to triggers and panels, by value.
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

/** Ids can't hold whitespace. */
function toIdPart(value: string) {
  return value.replace(/\s+/g, '-');
}

function isEnabled(tab: HTMLElement) {
  return (
    !tab.hasAttribute('disabled') &&
    tab.getAttribute('aria-disabled') !== 'true'
  );
}

type TabsHighlightProps = {
  children: React.ReactNode;
  /** Classes of the highlight: the surface behind the selected trigger. */
  className?: string;
  style?: React.CSSProperties;
  /** Transition of the highlight sliding to the selected trigger. */
  transition?: Transition;
};

const TabsHighlightContext = React.createContext<Omit<
  TabsHighlightProps,
  'children'
> | null>(null);

/**
 * The highlight behind the selected trigger, drawn by the `TabsList` inside:
 * one surface, sliding from trigger to trigger.
 */
function TabsHighlight({ children, ...highlight }: TabsHighlightProps) {
  return (
    <TabsHighlightContext value={highlight}>{children}</TabsHighlightContext>
  );
}

const HIGHLIGHT_ITEM_SLOT = 'tabs-highlight-item';

/** The highlight covers a trigger's `TabsHighlightItem`, or the trigger. */
function highlightBoxOf(tab: HTMLElement, list: HTMLElement): Element {
  const item = tab.closest(`[data-slot="${HIGHLIGHT_ITEM_SLOT}"]`);
  return item && list.contains(item) ? item : tab;
}

type TabsListProps = React.ComponentProps<'div'> & {
  children: React.ReactNode;
};

function TabsList({ ref, children, ...props }: TabsListProps) {
  const { orientation } = useTabs();
  const highlight = React.use(TabsHighlightContext);
  const [list, setList] = React.useState<HTMLDivElement | null>(null);
  const { indicator } = useTabsIndicator(list, {
    enabled: highlight !== null,
    transition: highlight?.transition,
    surface: {
      className: highlight?.className,
      style: highlight?.style,
      slot: 'tabs-highlight',
    },
    boxOf: highlightBoxOf,
  });

  return (
    <div
      role="tablist"
      aria-orientation={orientation}
      data-slot="tabs-list"
      data-orientation={orientation}
      {...props}
      ref={(node: HTMLDivElement | null) => {
        setList(node);
        if (typeof ref === 'function') return ref(node);
        if (ref) ref.current = node;
      }}
    >
      {indicator}
      {children}
    </div>
  );
}

type TabsHighlightItemProps = React.ComponentProps<'div'> & {
  /** Value of the trigger it wraps. */
  value: string;
};

/** Wraps a trigger: the highlight covers it when its trigger is selected. */
function TabsHighlightItem({ value, ...props }: TabsHighlightItemProps) {
  const { activeValue } = useTabs();
  return (
    <div
      data-slot={HIGHLIGHT_ITEM_SLOT}
      data-value={value}
      data-active={activeValue === value ? 'true' : 'false'}
      {...props}
    />
  );
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

  // WAI-ARIA tabs pattern: arrows move between the enabled triggers of the
  // list (wrapping), Home/End jump to the ends, and the focused tab is
  // selected at once (automatic activation, like Radix UI). The selection
  // animates as on click, with no delay.
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

    // The enabled triggers of this list (not of nested ones), in DOM order.
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
      {...{ [TAB_ATTRIBUTE]: '' }}
      data-slot="tabs-trigger"
      role="tab"
      type="button"
      aria-selected={isActive}
      aria-controls={getContentId(value)}
      // Roving tabindex: Tab enters the list on the selected trigger only.
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
  /** Transition of the height gliding from the previous panel's to the next one's. */
  transition?: Transition;
};

/** The panels' height transition, from `TabsContents`. */
const TabsContentsContext = React.createContext<Transition | undefined>(
  undefined,
);

/**
 * Holds the panels: one shows at a time, its height gliding from the
 * previous one's.
 */
function TabsContents({
  children,
  transition,
  style,
  ...props
}: TabsContentsProps) {
  return (
    <TabsContentsContext value={transition}>
      <motion.div
        data-slot="tabs-contents"
        {...props}
        style={{ ...style, overflow: 'hidden' }}
      >
        {children}
      </motion.div>
    </TabsContentsContext>
  );
}

type TabsContentProps = WithAsChild<
  {
    value: string;
    children: React.ReactNode;
    /** Transition of the panel coming in: its fade from a blur (300ms) and, in `height`, the height gliding from the previous panel's (450ms, Motion's layout curve). */
    transition?: Transition;
    /** Transition of the panel leaving: its fade into a blur (150ms ease-out). */
    exitTransition?: Transition;
  } & HTMLMotionProps<'div'>
>;

function TabsContent({
  ref,
  value,
  id,
  hidden,
  transition,
  exitTransition,
  asChild = false,
  ...props
}: TabsContentProps) {
  const { activeValue, getTriggerId, getContentId, registerId } = useTabs();
  const heightTransition = React.use(TabsContentsContext);
  const isActive = activeValue === value;
  const {
    ref: panelRef,
    waiting,
    leaving,
  } = usePanelMotion(isActive, {
    transition,
    exitTransition,
    heightTransition,
  });

  React.useEffect(() => {
    registerId('content', value, id);
    return () => registerId('content', value, undefined);
  }, [registerId, value, id]);

  const Component = asChild ? Slot : motion.div;

  return (
    <Component
      ref={(node: HTMLDivElement | null) => {
        panelRef.current = node;
        if (typeof ref === 'function') return ref(node);
        if (ref) ref.current = node;
      }}
      role="tabpanel"
      id={id ?? getContentId(value)}
      aria-labelledby={getTriggerId(value)}
      tabIndex={isActive ? 0 : -1}
      data-slot="tabs-content"
      data-state={isActive ? 'active' : 'inactive'}
      inert={!isActive}
      // Hidden while the previous panel leaves, and once unselected; leaving,
      // it fades out in the page.
      hidden={hidden || waiting || (!isActive && !leaving) || undefined}
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
