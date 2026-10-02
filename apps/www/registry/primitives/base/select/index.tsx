'use client';

import * as React from 'react';
import { Select as SelectPrimitive } from '@base-ui/react/select';
import { mergeProps } from '@base-ui/react/merge-props';
import { motion, type HTMLMotionProps } from 'motion/react';

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
  setIsOpen: (
    isOpen: boolean,
    eventDetails: SelectPrimitive.Root.ChangeEventDetails,
  ) => void;
  /** Unmounts the popup once its exit animation has finished. */
  unmount: () => void;
  onOpenChangeComplete?: (open: boolean) => void;
};

const [SelectProvider, useSelect] =
  getStrictContext<SelectContextType>('SelectContext');

type SelectProps<
  Value = unknown,
  Multiple extends boolean | undefined = false,
> = SelectPrimitive.Root.Props<Value, Multiple>;

function Select<Value, Multiple extends boolean | undefined = false>({
  actionsRef: actionsRefProp,
  ...props
}: SelectProps<Value, Multiple>) {
  // Base UI's Select has no `keepMounted` portal: with an `actionsRef`, it
  // keeps the popup mounted until we unmount it after the exit animation.
  const actionsRef = React.useRef<SelectPrimitive.Root.Actions | null>(null);
  React.useImperativeHandle(
    actionsRefProp,
    () => ({ unmount: () => actionsRef.current?.unmount() }),
    [],
  );
  const unmount = React.useCallback(() => actionsRef.current?.unmount(), []);

  const [isOpen, setIsOpen] = useControlledState({
    value: props?.open,
    defaultValue: props?.defaultOpen ?? false,
    onChange: props?.onOpenChange,
  });

  return (
    <SelectProvider
      value={{
        isOpen,
        setIsOpen,
        unmount,
        onOpenChangeComplete: props?.onOpenChangeComplete,
      }}
    >
      <SelectPrimitive.Root
        data-slot="select"
        {...props}
        open={isOpen}
        onOpenChange={setIsOpen}
        actionsRef={actionsRef}
      />
    </SelectProvider>
  );
}

type SelectLabelProps = React.ComponentProps<typeof SelectPrimitive.Label>;

function SelectLabel(props: SelectLabelProps) {
  return <SelectPrimitive.Label data-slot="select-label" {...props} />;
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

type SelectPortalProps = React.ComponentProps<typeof SelectPrimitive.Portal>;

function SelectPortal(props: SelectPortalProps) {
  return <SelectPrimitive.Portal data-slot="select-portal" {...props} />;
}

type SelectBackdropProps = React.ComponentProps<
  typeof SelectPrimitive.Backdrop
>;

function SelectBackdrop(props: SelectBackdropProps) {
  return <SelectPrimitive.Backdrop data-slot="select-backdrop" {...props} />;
}

type SelectPositionerProps = React.ComponentProps<
  typeof SelectPrimitive.Positioner
>;

function SelectPositioner(props: SelectPositionerProps) {
  return (
    <SelectPrimitive.Positioner data-slot="select-positioner" {...props} />
  );
}

type SelectPopupProps = Omit<
  React.ComponentProps<typeof SelectPrimitive.Popup>,
  'render'
> &
  HTMLMotionProps<'div'>;

function SelectPopup(props: SelectPopupProps) {
  return (
    <ReducedMotionConfig>
      <SelectPopupMotion {...props} />
    </ReducedMotionConfig>
  );
}

// Inside ReducedMotionConfig, so useShouldReduceMotion() sees it.
function SelectPopupMotion({
  finalFocus,
  ref,
  className,
  style,
  onAnimationComplete,
  transition = motionTransition.dropdown,
  ...props
}: SelectPopupProps) {
  const { isOpen, unmount, onOpenChangeComplete } = useSelect();
  const reduce = useShouldReduceMotion();
  // Base UI can mount the popup while closed (form autofill registers the
  // items): only unmount after a close that followed an open.
  const hasOpenedRef = React.useRef(false);
  React.useEffect(() => {
    if (isOpen) hasOpenedRef.current = true;
  }, [isOpen]);

  // Base UI keeps a closed popup mounted (it remounts it after `unmount()`):
  // once the exit has played, hide it so it leaves the accessibility tree.
  const [exitDone, setExitDone] = React.useState(true);
  if (isOpen && exitDone) setExitDone(false);

  return (
    <SelectPrimitive.Popup
      ref={ref}
      finalFocus={finalFocus}
      className={className}
      render={(renderProps, state) => {
        // Align-with-trigger mode (`side` is "none") lays the list over the
        // trigger like a native select: fade only, no scale.
        const isAligned = state.side === 'none';
        const hidden = isAligned
          ? { opacity: 0 }
          : {
              opacity: 0,
              transform: reduce ? 'scale(1)' : `scale(${scale.enter})`,
            };
        const visible = isAligned
          ? { opacity: 1 }
          : { opacity: 1, transform: 'scale(1)' };

        return (
          <motion.div
            // Chains Base UI's handlers with the user's instead of replacing them.
            {...(mergeProps<'div'>(
              renderProps,
              props as React.ComponentProps<'div'>,
            ) as HTMLMotionProps<'div'>)}
            data-slot="select-popup"
            hidden={!isOpen && exitDone}
            initial={hidden}
            // The popup stays mounted while it closes, so the same element
            // retargets if the select reopens mid-exit.
            animate={
              isOpen
                ? { ...visible, transition }
                : { ...hidden, transition: motionTransition.exit }
            }
            onAnimationComplete={(definition) => {
              onAnimationComplete?.(definition);
              if (isOpen) {
                onOpenChangeComplete?.(true);
              } else {
                setExitDone(true);
                if (hasOpenedRef.current) {
                  hasOpenedRef.current = false;
                  unmount();
                }
              }
            }}
            style={{
              ...renderProps.style,
              transformOrigin: isAligned
                ? undefined
                : 'var(--transform-origin)',
              ...style,
            }}
          />
        );
      }}
    />
  );
}

type SelectListProps = React.ComponentProps<typeof SelectPrimitive.List>;

function SelectList(props: SelectListProps) {
  return <SelectPrimitive.List data-slot="select-list" {...props} />;
}

// No animated highlight: arrow keys move it, and keyboard navigation stays
// instant. Style `data-highlighted` instead.
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

// Not animated: it only mounts with the popup (choosing an item closes the
// list), so a fade would just repeat the popup's.
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

type SelectArrowProps = React.ComponentProps<typeof SelectPrimitive.Arrow>;

function SelectArrow(props: SelectArrowProps) {
  return <SelectPrimitive.Arrow data-slot="select-arrow" {...props} />;
}

type SelectScrollUpArrowProps = React.ComponentProps<
  typeof SelectPrimitive.ScrollUpArrow
>;

function SelectScrollUpArrow(props: SelectScrollUpArrowProps) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-arrow"
      {...props}
    />
  );
}

type SelectScrollDownArrowProps = React.ComponentProps<
  typeof SelectPrimitive.ScrollDownArrow
>;

function SelectScrollDownArrow(props: SelectScrollDownArrowProps) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-arrow"
      {...props}
    />
  );
}

type SelectGroupProps = React.ComponentProps<typeof SelectPrimitive.Group>;

function SelectGroup(props: SelectGroupProps) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

type SelectGroupLabelProps = React.ComponentProps<
  typeof SelectPrimitive.GroupLabel
>;

function SelectGroupLabel(props: SelectGroupLabelProps) {
  return (
    <SelectPrimitive.GroupLabel data-slot="select-group-label" {...props} />
  );
}

type SelectSeparatorProps = React.ComponentProps<
  typeof SelectPrimitive.Separator
>;

function SelectSeparator(props: SelectSeparatorProps) {
  return <SelectPrimitive.Separator data-slot="select-separator" {...props} />;
}

export {
  Select,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectPositioner,
  SelectPopup,
  SelectList,
  SelectItem,
  SelectItemText,
  SelectItemIndicator,
  SelectArrow,
  SelectScrollUpArrow,
  SelectScrollDownArrow,
  SelectGroup,
  SelectGroupLabel,
  SelectSeparator,
  useSelect,
  type SelectProps,
  type SelectLabelProps,
  type SelectTriggerProps,
  type SelectValueProps,
  type SelectIconProps,
  type SelectPortalProps,
  type SelectBackdropProps,
  type SelectPositionerProps,
  type SelectPopupProps,
  type SelectListProps,
  type SelectItemProps,
  type SelectItemTextProps,
  type SelectItemIndicatorProps,
  type SelectArrowProps,
  type SelectScrollUpArrowProps,
  type SelectScrollDownArrowProps,
  type SelectGroupProps,
  type SelectGroupLabelProps,
  type SelectSeparatorProps,
  type SelectContextType,
};
