'use client';

import * as React from 'react';
import { Select as SelectPrimitive } from 'radix-ui';
import { AnimatePresence, motion, type HTMLMotionProps } from 'motion/react';

import { getStrictContext } from '@/registry/lib/get-strict-context';
import { useControlledState } from '@/registry/hooks/use-controlled-state';
import {
  ReducedMotionConfig,
  scale,
  transition as motionTransition,
  useShouldReduceMotion,
} from '@/registry/lib/motion';

type SelectContextType = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

const [SelectProvider, useSelect] =
  getStrictContext<SelectContextType>('SelectContext');

type SelectProps = React.ComponentProps<typeof SelectPrimitive.Root>;

function Select(props: SelectProps) {
  const [isOpen, setIsOpen] = useControlledState({
    value: props?.open,
    defaultValue: props?.defaultOpen ?? false,
    onChange: props?.onOpenChange,
  });

  return (
    <SelectProvider value={{ isOpen, setIsOpen }}>
      <SelectPrimitive.Root
        data-slot="select"
        {...props}
        open={isOpen}
        onOpenChange={setIsOpen}
      />
    </SelectProvider>
  );
}

type SelectTriggerProps = React.ComponentProps<typeof SelectPrimitive.Trigger>;

function SelectTrigger(props: SelectTriggerProps) {
  return <SelectPrimitive.Trigger data-slot="select-trigger" {...props} />;
}

type SelectValueProps = React.ComponentProps<typeof SelectPrimitive.Value>;

function SelectValue(props: SelectValueProps) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

type SelectIconProps = React.ComponentProps<typeof SelectPrimitive.Icon>;

function SelectIcon(props: SelectIconProps) {
  return <SelectPrimitive.Icon data-slot="select-icon" {...props} />;
}

type SelectPortalProps = Omit<
  React.ComponentProps<typeof SelectPrimitive.Portal>,
  'forceMount'
>;

// The content handles its own presence (see SelectContent), so the portal
// stays a plain passthrough.
function SelectPortal(props: SelectPortalProps) {
  return <SelectPrimitive.Portal {...props} />;
}

type SelectContentProps = Omit<
  React.ComponentProps<typeof SelectPrimitive.Content>,
  'forceMount' | 'asChild'
> &
  HTMLMotionProps<'div'>;

function SelectContent(props: SelectContentProps) {
  const { isOpen } = useSelect();
  // True while the content is open or playing its exit animation.
  const [isPresent, setIsPresent] = React.useState(isOpen);
  if (isOpen && !isPresent) setIsPresent(true);

  return (
    <>
      <AnimatePresence onExitComplete={() => setIsPresent(false)}>
        {isOpen && (
          <ReducedMotionConfig key="select-content">
            <SelectContentMotion {...props} />
          </ReducedMotionConfig>
        )}
      </AnimatePresence>
      {/* Once closed, Radix renders the items off-screen so the trigger keeps
          showing the selected value, typeahead works and forms submit. */}
      {!isPresent && (
        <SelectPrimitive.Content position={props.position}>
          {props.children}
        </SelectPrimitive.Content>
      )}
    </>
  );
}

// Inside ReducedMotionConfig, so useShouldReduceMotion() sees it.
function SelectContentMotion({
  position,
  side,
  sideOffset,
  align,
  alignOffset,
  avoidCollisions,
  collisionBoundary,
  collisionPadding,
  arrowPadding,
  sticky,
  hideWhenDetached,
  updatePositionStrategy,
  onCloseAutoFocus,
  onEscapeKeyDown,
  onPointerDownOutside,
  style,
  transition = motionTransition.dropdown,
  ...props
}: SelectContentProps) {
  const reduce = useShouldReduceMotion();
  // Item-aligned mode (Radix's default) measures the content on mount to line
  // the selected item up with the trigger, and has no origin: fade only there.
  const isPopper = position === 'popper';
  const hidden = isPopper
    ? { opacity: 0, transform: reduce ? 'scale(1)' : `scale(${scale.enter})` }
    : { opacity: 0 };
  const visible = isPopper
    ? { opacity: 1, transform: 'scale(1)' }
    : { opacity: 1 };

  return (
    <SelectPrimitive.Content
      asChild
      forceMount
      position={position}
      side={side}
      sideOffset={sideOffset}
      align={align}
      alignOffset={alignOffset}
      avoidCollisions={avoidCollisions}
      collisionBoundary={collisionBoundary}
      collisionPadding={collisionPadding}
      arrowPadding={arrowPadding}
      sticky={sticky}
      hideWhenDetached={hideWhenDetached}
      updatePositionStrategy={updatePositionStrategy}
      onCloseAutoFocus={onCloseAutoFocus}
      onEscapeKeyDown={onEscapeKeyDown}
      onPointerDownOutside={onPointerDownOutside}
    >
      <motion.div
        data-slot="select-content"
        initial={hidden}
        animate={{ ...visible, transition }}
        exit={{ ...hidden, transition: motionTransition.exit }}
        style={{
          transformOrigin: isPopper
            ? 'var(--radix-select-content-transform-origin)'
            : undefined,
          ...style,
        }}
        {...props}
      />
    </SelectPrimitive.Content>
  );
}

type SelectViewportProps = React.ComponentProps<
  typeof SelectPrimitive.Viewport
>;

function SelectViewport(props: SelectViewportProps) {
  return <SelectPrimitive.Viewport data-slot="select-viewport" {...props} />;
}

type SelectGroupProps = React.ComponentProps<typeof SelectPrimitive.Group>;

function SelectGroup(props: SelectGroupProps) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

type SelectLabelProps = React.ComponentProps<typeof SelectPrimitive.Label>;

function SelectLabel(props: SelectLabelProps) {
  return <SelectPrimitive.Label data-slot="select-label" {...props} />;
}

// No animated highlight: arrow keys move it, and keyboard navigation stays
// instant. Style `data-highlighted` / `focus` instead.
type SelectItemProps = React.ComponentProps<typeof SelectPrimitive.Item>;

function SelectItem(props: SelectItemProps) {
  return <SelectPrimitive.Item data-slot="select-item" {...props} />;
}

type SelectItemTextProps = React.ComponentProps<
  typeof SelectPrimitive.ItemText
>;

function SelectItemText(props: SelectItemTextProps) {
  return <SelectPrimitive.ItemText data-slot="select-item-text" {...props} />;
}

// Not animated: it only mounts with the content (choosing an item closes the
// list), so a fade would just repeat the content's.
type SelectItemIndicatorProps = React.ComponentProps<
  typeof SelectPrimitive.ItemIndicator
>;

function SelectItemIndicator(props: SelectItemIndicatorProps) {
  return (
    <SelectPrimitive.ItemIndicator
      data-slot="select-item-indicator"
      {...props}
    />
  );
}

type SelectSeparatorProps = React.ComponentProps<
  typeof SelectPrimitive.Separator
>;

function SelectSeparator(props: SelectSeparatorProps) {
  return <SelectPrimitive.Separator data-slot="select-separator" {...props} />;
}

type SelectScrollUpButtonProps = React.ComponentProps<
  typeof SelectPrimitive.ScrollUpButton
>;

function SelectScrollUpButton(props: SelectScrollUpButtonProps) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      {...props}
    />
  );
}

type SelectScrollDownButtonProps = React.ComponentProps<
  typeof SelectPrimitive.ScrollDownButton
>;

function SelectScrollDownButton(props: SelectScrollDownButtonProps) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      {...props}
    />
  );
}

type SelectArrowProps = React.ComponentProps<typeof SelectPrimitive.Arrow>;

function SelectArrow(props: SelectArrowProps) {
  return <SelectPrimitive.Arrow data-slot="select-arrow" {...props} />;
}

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectIcon,
  SelectPortal,
  SelectContent,
  SelectViewport,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectItemText,
  SelectItemIndicator,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
  SelectArrow,
  useSelect,
  type SelectProps,
  type SelectTriggerProps,
  type SelectValueProps,
  type SelectIconProps,
  type SelectPortalProps,
  type SelectContentProps,
  type SelectViewportProps,
  type SelectGroupProps,
  type SelectLabelProps,
  type SelectItemProps,
  type SelectItemTextProps,
  type SelectItemIndicatorProps,
  type SelectSeparatorProps,
  type SelectScrollUpButtonProps,
  type SelectScrollDownButtonProps,
  type SelectArrowProps,
  type SelectContextType,
};
