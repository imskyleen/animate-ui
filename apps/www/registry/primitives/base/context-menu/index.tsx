'use client';

import * as React from 'react';
import { ContextMenu as ContextMenuPrimitive } from '@base-ui/react/context-menu';
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

type ContextMenuActiveValueContextType = {
  highlightedValue: string | null;
  setHighlightedValue: (value: string | null) => void;
  /** Last interaction was the keyboard: the highlight moves instantly. */
  isKeyboard: boolean;
  setIsKeyboard: (isKeyboard: boolean) => void;
};

type ContextMenuContextType = {
  isOpen: boolean;
  /** True inside a submenu: its popup fades instead of scaling. */
  isSubmenu: boolean;
};

const [ContextMenuActiveValueProvider, useContextMenuActiveValue] =
  getStrictContext<ContextMenuActiveValueContextType>(
    'ContextMenuActiveValueContext',
  );
const [ContextMenuProvider, useContextMenu] =
  getStrictContext<ContextMenuContextType>('ContextMenuContext');

/** Reports the item to the highlight when Base UI marks it `data-highlighted`. */
function useHighlightedItemRef(ref?: React.Ref<HTMLElement | null>) {
  const { setHighlightedValue } = useContextMenuActiveValue();
  const [highlighted, highlightedRef] = useDataState<HTMLElement>(
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

function ContextMenu(props: ContextMenuProps) {
  const [isOpen, setIsOpen] = useControlledState({
    value: props.open,
    defaultValue: props.defaultOpen ?? false,
    onChange: props.onOpenChange,
  });
  const [highlightedValue, setHighlightedValue] = React.useState<string | null>(
    null,
  );
  const [isKeyboard, setIsKeyboard] = React.useState(false);

  return (
    <ContextMenuActiveValueProvider
      value={{
        highlightedValue,
        setHighlightedValue,
        isKeyboard,
        setIsKeyboard,
      }}
    >
      <ContextMenuProvider value={{ isOpen, isSubmenu: false }}>
        <ContextMenuPrimitive.Root
          data-slot="context-menu"
          {...props}
          open={isOpen}
          onOpenChange={(open, eventDetails) => {
            // A context menu opens from the pointer; keyboard use is detected
            // again from the next key press inside the menu.
            if (open) setIsKeyboard(false);
            setIsOpen(open, eventDetails);
          }}
        />
      </ContextMenuProvider>
    </ContextMenuActiveValueProvider>
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

type ContextMenuPortalProps = Omit<
  React.ComponentProps<typeof ContextMenuPrimitive.Portal>,
  'keepMounted'
>;

function ContextMenuPortal({ children, ...props }: ContextMenuPortalProps) {
  const { isOpen } = useContextMenu();

  return (
    <AnimatePresence>
      {isOpen && (
        <ContextMenuPrimitive.Portal
          keepMounted
          data-slot="context-menu-portal"
          {...props}
        >
          <ReducedMotionConfig>{children}</ReducedMotionConfig>
        </ContextMenuPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}

type ContextMenuPositionerProps = React.ComponentProps<
  typeof ContextMenuPrimitive.Positioner
>;

function ContextMenuPositioner(props: ContextMenuPositionerProps) {
  return (
    <ContextMenuPrimitive.Positioner
      data-slot="context-menu-positioner"
      {...props}
    />
  );
}

type ContextMenuPopupProps = Omit<
  React.ComponentProps<typeof ContextMenuPrimitive.Popup>,
  'render'
> &
  HTMLMotionProps<'div'>;

// Render it inside ContextMenuPortal, so useShouldReduceMotion() sees the
// ReducedMotionConfig.
function ContextMenuPopup({
  finalFocus,
  id,
  transition,
  onKeyDownCapture,
  onPointerMoveCapture,
  style,
  ...props
}: ContextMenuPopupProps) {
  const { isSubmenu } = useContextMenu();
  const { isKeyboard, setIsKeyboard } = useContextMenuActiveValue();
  const reduce = useShouldReduceMotion();

  // Submenus open tens of times a day: a quick fade, no scale.
  const hidden = isSubmenu
    ? { opacity: 0 }
    : {
        opacity: 0,
        transform: reduce ? 'scale(1)' : `scale(${scale.enter})`,
      };
  const visible = isSubmenu
    ? { opacity: 1 }
    : { opacity: 1, transform: 'scale(1)' };
  const enterTransition =
    transition ??
    (isSubmenu ? motionTransition.exit : motionTransition.dropdown);

  return (
    <ContextMenuPrimitive.Popup
      finalFocus={finalFocus}
      id={id}
      render={
        <motion.div
          data-slot={
            isSubmenu ? 'context-menu-submenu-popup' : 'context-menu-popup'
          }
          initial={hidden}
          animate={{ ...visible, transition: enterTransition }}
          exit={{ ...hidden, transition: motionTransition.exit }}
          // Capture phase: the menu handles arrow keys before they bubble.
          onKeyDownCapture={(event) => {
            if (!isKeyboard) setIsKeyboard(true);
            onKeyDownCapture?.(event);
          }}
          onPointerMoveCapture={(event) => {
            if (isKeyboard) setIsKeyboard(false);
            onPointerMoveCapture?.(event);
          }}
          style={{ transformOrigin: 'var(--transform-origin)', ...style }}
          {...props}
        />
      }
    />
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
  const { highlightedValue, isKeyboard } = useContextMenuActiveValue();

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

type ContextMenuCheckboxItemIndicatorProps = React.ComponentProps<
  typeof ContextMenuPrimitive.CheckboxItemIndicator
>;

function ContextMenuCheckboxItemIndicator(
  props: ContextMenuCheckboxItemIndicatorProps,
) {
  return (
    <ContextMenuPrimitive.CheckboxItemIndicator
      data-slot="context-menu-checkbox-item-indicator"
      {...props}
    />
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

type ContextMenuRadioItemIndicatorProps = React.ComponentProps<
  typeof ContextMenuPrimitive.RadioItemIndicator
>;

function ContextMenuRadioItemIndicator(
  props: ContextMenuRadioItemIndicatorProps,
) {
  return (
    <ContextMenuPrimitive.RadioItemIndicator
      data-slot="context-menu-radio-item-indicator"
      {...props}
    />
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

type ContextMenuGroupLabelProps = React.ComponentProps<
  typeof ContextMenuPrimitive.GroupLabel
>;

function ContextMenuGroupLabel(props: ContextMenuGroupLabelProps) {
  return (
    <ContextMenuPrimitive.GroupLabel
      data-slot="context-menu-group-label"
      {...props}
    />
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

type ContextMenuArrowProps = React.ComponentProps<
  typeof ContextMenuPrimitive.Arrow
>;

function ContextMenuArrow(props: ContextMenuArrowProps) {
  return (
    <ContextMenuPrimitive.Arrow data-slot="context-menu-arrow" {...props} />
  );
}

type ContextMenuSubmenuProps = React.ComponentProps<
  typeof ContextMenuPrimitive.SubmenuRoot
>;

function ContextMenuSubmenu(props: ContextMenuSubmenuProps) {
  const [isOpen, setIsOpen] = useControlledState({
    value: props.open,
    defaultValue: props.defaultOpen ?? false,
    onChange: props.onOpenChange,
  });

  return (
    <ContextMenuProvider value={{ isOpen, isSubmenu: true }}>
      <ContextMenuPrimitive.SubmenuRoot
        data-slot="context-menu-submenu"
        {...props}
        open={isOpen}
        onOpenChange={setIsOpen}
      />
    </ContextMenuProvider>
  );
}

type ContextMenuSubmenuTriggerProps = React.ComponentProps<
  typeof ContextMenuPrimitive.SubmenuTrigger
>;

function ContextMenuSubmenuTrigger({
  ref,
  ...props
}: ContextMenuSubmenuTriggerProps) {
  const highlightedRef = useHighlightedItemRef(ref);

  return (
    <ContextMenuPrimitive.SubmenuTrigger
      ref={highlightedRef}
      data-slot="context-menu-submenu-trigger"
      {...props}
    />
  );
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuPortal,
  ContextMenuPositioner,
  ContextMenuPopup,
  ContextMenuArrow,
  ContextMenuHighlight,
  ContextMenuHighlightItem,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuCheckboxItemIndicator,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuRadioItemIndicator,
  ContextMenuGroup,
  ContextMenuGroupLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSubmenu,
  ContextMenuSubmenuTrigger,
  useContextMenu,
  useContextMenuActiveValue,
  type ContextMenuProps,
  type ContextMenuTriggerProps,
  type ContextMenuPortalProps,
  type ContextMenuPositionerProps,
  type ContextMenuPopupProps,
  type ContextMenuArrowProps,
  type ContextMenuHighlightProps,
  type ContextMenuHighlightItemProps,
  type ContextMenuItemProps,
  type ContextMenuCheckboxItemProps,
  type ContextMenuCheckboxItemIndicatorProps,
  type ContextMenuRadioGroupProps,
  type ContextMenuRadioItemProps,
  type ContextMenuRadioItemIndicatorProps,
  type ContextMenuGroupProps,
  type ContextMenuGroupLabelProps,
  type ContextMenuSeparatorProps,
  type ContextMenuShortcutProps,
  type ContextMenuSubmenuProps,
  type ContextMenuSubmenuTriggerProps,
  type ContextMenuActiveValueContextType,
  type ContextMenuContextType,
};
