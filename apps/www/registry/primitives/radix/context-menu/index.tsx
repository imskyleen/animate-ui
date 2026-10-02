'use client';

import * as React from 'react';
import { ContextMenu as ContextMenuPrimitive } from 'radix-ui';
import { AnimatePresence, motion, type HTMLMotionProps } from 'motion/react';

import {
  Highlight,
  HighlightItem,
  type HighlightItemProps,
  type HighlightProps,
} from '@/registry/primitives/effects/highlight';
import { getStrictContext } from '@/registry/lib/get-strict-context';
import { useControlledState } from '@/registry/hooks/use-controlled-state';
import { useDataState } from '@/registry/hooks/use-data-state';
import {
  ReducedMotionConfig,
  scale,
  spring,
  transition as motionTransition,
  useShouldReduceMotion,
} from '@/registry/lib/motion';

type ContextMenuContextType = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  highlightedValue: string | null;
  setHighlightedValue: (value: string | null) => void;
  /** Last interaction was the keyboard: the highlight moves instantly. */
  isKeyboard: boolean;
  setIsKeyboard: (isKeyboard: boolean) => void;
};

type ContextMenuSubContextType = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

const [ContextMenuProvider, useContextMenu] =
  getStrictContext<ContextMenuContextType>('ContextMenuContext');

const [ContextMenuSubProvider, useContextMenuSub] =
  getStrictContext<ContextMenuSubContextType>('ContextMenuSubContext');

/** Reports the item to the highlight when Radix marks it `data-highlighted`. */
function useHighlightedItemRef(ref?: React.Ref<HTMLDivElement | null>) {
  const { setHighlightedValue } = useContextMenu();
  const [highlighted, highlightedRef] = useDataState<HTMLDivElement>(
    'highlighted',
    ref,
  );

  React.useEffect(() => {
    if (highlighted !== true) return;
    const el = highlightedRef.current;
    const v = el?.dataset.value || el?.id || null;
    if (v) setHighlightedValue(v);
  }, [highlighted, highlightedRef, setHighlightedValue]);

  return highlightedRef;
}

type ContextMenuProps = React.ComponentProps<typeof ContextMenuPrimitive.Root>;

// Radix's ContextMenu root is uncontrolled: it only reports `onOpenChange`.
function ContextMenu({ onOpenChange, ...props }: ContextMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [highlightedValue, setHighlightedValue] = React.useState<string | null>(
    null,
  );
  const [isKeyboard, setIsKeyboard] = React.useState(false);

  const handleOpenChange = (open: boolean) => {
    // A context menu opens from the pointer; keyboard use is detected again
    // from the next key press inside the menu.
    if (open) setIsKeyboard(false);
    setIsOpen(open);
    onOpenChange?.(open);
  };

  return (
    <ContextMenuProvider
      value={{
        isOpen,
        setIsOpen,
        highlightedValue,
        setHighlightedValue,
        isKeyboard,
        setIsKeyboard,
      }}
    >
      <ContextMenuPrimitive.Root
        data-slot="context-menu"
        {...props}
        onOpenChange={handleOpenChange}
      />
    </ContextMenuProvider>
  );
}

type ContextMenuTriggerProps = React.ComponentProps<
  typeof ContextMenuPrimitive.Trigger
>;

function ContextMenuTrigger(props: ContextMenuTriggerProps) {
  return (
    <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />
  );
}

type ContextMenuPortalProps = React.ComponentProps<
  typeof ContextMenuPrimitive.Portal
>;

function ContextMenuPortal(props: ContextMenuPortalProps) {
  return (
    <ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props} />
  );
}

type ContextMenuGroupProps = React.ComponentProps<
  typeof ContextMenuPrimitive.Group
>;

function ContextMenuGroup(props: ContextMenuGroupProps) {
  return (
    <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />
  );
}

type ContextMenuRadioGroupProps = React.ComponentProps<
  typeof ContextMenuPrimitive.RadioGroup
>;

function ContextMenuRadioGroup(props: ContextMenuRadioGroupProps) {
  return (
    <ContextMenuPrimitive.RadioGroup
      data-slot="context-menu-radio-group"
      {...props}
    />
  );
}

type ContextMenuContentProps = Omit<
  React.ComponentProps<typeof ContextMenuPrimitive.Content>,
  'forceMount' | 'asChild'
> &
  Pick<React.ComponentProps<typeof ContextMenuPrimitive.Portal>, 'container'> &
  HTMLMotionProps<'div'>;

function ContextMenuContent({ container, ...props }: ContextMenuContentProps) {
  const { isOpen } = useContextMenu();

  return (
    <AnimatePresence>
      {isOpen && (
        <ContextMenuPrimitive.Portal
          forceMount
          data-slot="context-menu-portal"
          container={container}
        >
          <ReducedMotionConfig>
            <ContextMenuContentMotion {...props} />
          </ReducedMotionConfig>
        </ContextMenuPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}

// Inside ReducedMotionConfig, so useShouldReduceMotion() sees it.
function ContextMenuContentMotion({
  loop,
  onCloseAutoFocus,
  onEscapeKeyDown,
  onPointerDownOutside,
  onFocusOutside,
  onInteractOutside,
  alignOffset,
  avoidCollisions,
  collisionBoundary,
  collisionPadding,
  arrowPadding,
  sticky,
  hideWhenDetached,
  updatePositionStrategy,
  onKeyDownCapture,
  onPointerMoveCapture,
  transition = motionTransition.dropdown,
  style,
  ...props
}: Omit<ContextMenuContentProps, 'container'>) {
  const { isKeyboard, setIsKeyboard } = useContextMenu();
  const reduce = useShouldReduceMotion();
  const hidden = {
    opacity: 0,
    transform: reduce ? 'scale(1)' : `scale(${scale.enter})`,
  };

  return (
    <ContextMenuPrimitive.Content
      asChild
      forceMount
      loop={loop}
      onCloseAutoFocus={onCloseAutoFocus}
      onEscapeKeyDown={onEscapeKeyDown}
      onPointerDownOutside={onPointerDownOutside}
      onFocusOutside={onFocusOutside}
      onInteractOutside={onInteractOutside}
      alignOffset={alignOffset}
      avoidCollisions={avoidCollisions}
      collisionBoundary={collisionBoundary}
      collisionPadding={collisionPadding}
      arrowPadding={arrowPadding}
      sticky={sticky}
      hideWhenDetached={hideWhenDetached}
      updatePositionStrategy={updatePositionStrategy}
    >
      <motion.div
        data-slot="context-menu-content"
        initial={hidden}
        animate={{ opacity: 1, transform: 'scale(1)', transition }}
        exit={{ ...hidden, transition: motionTransition.exit }}
        // Capture phase: Radix handles arrow keys before they bubble. React
        // events also bubble through portals, so submenus are covered too.
        onKeyDownCapture={(event) => {
          if (!isKeyboard) setIsKeyboard(true);
          onKeyDownCapture?.(event);
        }}
        onPointerMoveCapture={(event) => {
          if (isKeyboard) setIsKeyboard(false);
          onPointerMoveCapture?.(event);
        }}
        style={{
          transformOrigin: 'var(--radix-context-menu-content-transform-origin)',
          ...style,
        }}
        {...props}
      />
    </ContextMenuPrimitive.Content>
  );
}

type ContextMenuHighlightProps = Omit<
  HighlightProps,
  'controlledItems' | 'enabled' | 'hover' | 'value'
>;

function ContextMenuHighlight({
  transition = spring.snappy,
  exitDelay,
  ...props
}: ContextMenuHighlightProps) {
  const { highlightedValue, isKeyboard } = useContextMenu();

  // Arrow keys move the highlight instantly, without a lingering exit.
  return (
    <Highlight
      data-slot="context-menu-highlight"
      click={false}
      controlledItems
      value={highlightedValue}
      transition={isKeyboard ? motionTransition.instant : transition}
      exitDelay={isKeyboard ? 0 : exitDelay}
      {...props}
    />
  );
}

type ContextMenuHighlightItemProps = HighlightItemProps;

function ContextMenuHighlightItem(props: ContextMenuHighlightItemProps) {
  return <HighlightItem data-slot="context-menu-highlight-item" {...props} />;
}

type ContextMenuItemProps = React.ComponentProps<
  typeof ContextMenuPrimitive.Item
>;

function ContextMenuItem({ ref, ...props }: ContextMenuItemProps) {
  const highlightedRef = useHighlightedItemRef(ref);

  return (
    <ContextMenuPrimitive.Item
      ref={highlightedRef}
      data-slot="context-menu-item"
      {...props}
    />
  );
}

type ContextMenuCheckboxItemProps = React.ComponentProps<
  typeof ContextMenuPrimitive.CheckboxItem
>;

function ContextMenuCheckboxItem({
  ref,
  ...props
}: ContextMenuCheckboxItemProps) {
  const highlightedRef = useHighlightedItemRef(ref);

  return (
    <ContextMenuPrimitive.CheckboxItem
      ref={highlightedRef}
      data-slot="context-menu-checkbox-item"
      {...props}
    />
  );
}

type ContextMenuRadioItemProps = React.ComponentProps<
  typeof ContextMenuPrimitive.RadioItem
>;

function ContextMenuRadioItem({ ref, ...props }: ContextMenuRadioItemProps) {
  const highlightedRef = useHighlightedItemRef(ref);

  return (
    <ContextMenuPrimitive.RadioItem
      ref={highlightedRef}
      data-slot="context-menu-radio-item"
      {...props}
    />
  );
}

type ContextMenuItemIndicatorProps = React.ComponentProps<
  typeof ContextMenuPrimitive.ItemIndicator
>;

function ContextMenuItemIndicator(props: ContextMenuItemIndicatorProps) {
  return (
    <ContextMenuPrimitive.ItemIndicator
      data-slot="context-menu-item-indicator"
      {...props}
    />
  );
}

type ContextMenuLabelProps = React.ComponentProps<
  typeof ContextMenuPrimitive.Label
>;

function ContextMenuLabel(props: ContextMenuLabelProps) {
  return (
    <ContextMenuPrimitive.Label data-slot="context-menu-label" {...props} />
  );
}

type ContextMenuSeparatorProps = React.ComponentProps<
  typeof ContextMenuPrimitive.Separator
>;

function ContextMenuSeparator(props: ContextMenuSeparatorProps) {
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      {...props}
    />
  );
}

type ContextMenuShortcutProps = React.ComponentProps<'span'>;

function ContextMenuShortcut(props: ContextMenuShortcutProps) {
  return <span data-slot="context-menu-shortcut" {...props} />;
}

type ContextMenuSubProps = React.ComponentProps<
  typeof ContextMenuPrimitive.Sub
>;

function ContextMenuSub(props: ContextMenuSubProps) {
  const [isOpen, setIsOpen] = useControlledState({
    value: props.open,
    defaultValue: props.defaultOpen ?? false,
    onChange: props.onOpenChange,
  });

  return (
    <ContextMenuSubProvider value={{ isOpen, setIsOpen }}>
      <ContextMenuPrimitive.Sub
        data-slot="context-menu-sub"
        {...props}
        open={isOpen}
        onOpenChange={setIsOpen}
      />
    </ContextMenuSubProvider>
  );
}

type ContextMenuSubTriggerProps = React.ComponentProps<
  typeof ContextMenuPrimitive.SubTrigger
>;

function ContextMenuSubTrigger({ ref, ...props }: ContextMenuSubTriggerProps) {
  const highlightedRef = useHighlightedItemRef(ref);

  return (
    <ContextMenuPrimitive.SubTrigger
      ref={highlightedRef}
      data-slot="context-menu-sub-trigger"
      {...props}
    />
  );
}

type ContextMenuSubContentProps = Omit<
  React.ComponentProps<typeof ContextMenuPrimitive.SubContent>,
  'forceMount' | 'asChild'
> &
  Pick<React.ComponentProps<typeof ContextMenuPrimitive.Portal>, 'container'> &
  HTMLMotionProps<'div'>;

// Submenus open tens of times a day: a quick fade, no scale.
function ContextMenuSubContent({
  loop,
  onEscapeKeyDown,
  onPointerDownOutside,
  onFocusOutside,
  onInteractOutside,
  sideOffset,
  alignOffset,
  avoidCollisions,
  collisionBoundary,
  collisionPadding,
  arrowPadding,
  sticky,
  hideWhenDetached,
  updatePositionStrategy,
  transition = motionTransition.exit,
  style,
  container,
  ...props
}: ContextMenuSubContentProps) {
  const { isOpen } = useContextMenuSub();

  return (
    <AnimatePresence>
      {isOpen && (
        <ContextMenuPrimitive.Portal
          forceMount
          data-slot="context-menu-portal"
          container={container}
        >
          <ContextMenuPrimitive.SubContent
            asChild
            forceMount
            loop={loop}
            onEscapeKeyDown={onEscapeKeyDown}
            onPointerDownOutside={onPointerDownOutside}
            onFocusOutside={onFocusOutside}
            onInteractOutside={onInteractOutside}
            sideOffset={sideOffset}
            alignOffset={alignOffset}
            avoidCollisions={avoidCollisions}
            collisionBoundary={collisionBoundary}
            collisionPadding={collisionPadding}
            arrowPadding={arrowPadding}
            sticky={sticky}
            hideWhenDetached={hideWhenDetached}
            updatePositionStrategy={updatePositionStrategy}
          >
            <motion.div
              data-slot="context-menu-sub-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition }}
              exit={{ opacity: 0, transition: motionTransition.exit }}
              style={{
                transformOrigin:
                  'var(--radix-context-menu-content-transform-origin)',
                ...style,
              }}
              {...props}
            />
          </ContextMenuPrimitive.SubContent>
        </ContextMenuPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuPortal,
  ContextMenuContent,
  ContextMenuHighlight,
  ContextMenuHighlightItem,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuItemIndicator,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  useContextMenu,
  useContextMenuSub,
  type ContextMenuProps,
  type ContextMenuTriggerProps,
  type ContextMenuPortalProps,
  type ContextMenuContentProps,
  type ContextMenuHighlightProps,
  type ContextMenuHighlightItemProps,
  type ContextMenuItemProps,
  type ContextMenuCheckboxItemProps,
  type ContextMenuRadioGroupProps,
  type ContextMenuRadioItemProps,
  type ContextMenuItemIndicatorProps,
  type ContextMenuLabelProps,
  type ContextMenuSeparatorProps,
  type ContextMenuShortcutProps,
  type ContextMenuGroupProps,
  type ContextMenuSubProps,
  type ContextMenuSubTriggerProps,
  type ContextMenuSubContentProps,
  type ContextMenuContextType,
  type ContextMenuSubContextType,
};
