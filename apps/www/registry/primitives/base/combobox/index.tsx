'use client';

import * as React from 'react';
import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox';
import {
  AnimatePresence,
  motion,
  type HTMLMotionProps,
  type Variants,
} from 'motion/react';

import { getStrictContext } from '@/registry/lib/get-strict-context';
import { useControlledState } from '@/registry/hooks/use-controlled-state';
import {
  ReducedMotionConfig,
  scale,
  transition as motionTransition,
  useShouldReduceMotion,
} from '@/registry/lib/motion';

type ComboboxContextType = {
  isOpen: boolean;
  setIsOpen: (
    isOpen: boolean,
    eventDetails: ComboboxPrimitive.Root.ChangeEventDetails,
  ) => void;
  /** Unmounts the popup once its exit animation has finished. */
  unmount: () => void;
  multiple: boolean;
  /** Whether the last value change came from the keyboard (Backspace…). */
  keyboardChangeRef: React.RefObject<boolean>;
};

const [ComboboxProvider, useCombobox] =
  getStrictContext<ComboboxContextType>('ComboboxContext');

type ComboboxProps<
  Value = unknown,
  Multiple extends boolean | undefined = false,
> = ComboboxPrimitive.Root.Props<Value, Multiple>;

function Combobox<Value, Multiple extends boolean | undefined = false>({
  actionsRef: actionsRefProp,
  onValueChange,
  ...props
}: ComboboxProps<Value, Multiple>) {
  // With an `actionsRef`, Base UI keeps the popup mounted until we unmount it
  // after the exit animation (it resets the query and syncs the input then).
  const actionsRef = React.useRef<ComboboxPrimitive.Root.Actions | null>(null);
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

  const keyboardChangeRef = React.useRef(false);

  const handleValueChange: ComboboxProps<Value, Multiple>['onValueChange'] = (
    value,
    eventDetails,
  ) => {
    keyboardChangeRef.current = eventDetails.event?.type === 'keydown';
    onValueChange?.(value, eventDetails);
  };

  return (
    <ComboboxProvider
      value={{
        isOpen,
        setIsOpen,
        unmount,
        multiple: !!props.multiple,
        keyboardChangeRef,
      }}
    >
      <ComboboxPrimitive.Root
        data-slot="combobox"
        {...props}
        open={isOpen}
        onOpenChange={setIsOpen}
        onValueChange={handleValueChange}
        actionsRef={actionsRef}
      />
    </ComboboxProvider>
  );
}

type ComboboxLabelProps = React.ComponentProps<typeof ComboboxPrimitive.Label>;

function ComboboxLabel(props: ComboboxLabelProps) {
  return <ComboboxPrimitive.Label data-slot="combobox-label" {...props} />;
}

type ComboboxValueProps = React.ComponentProps<typeof ComboboxPrimitive.Value>;

function ComboboxValue(props: ComboboxValueProps) {
  return <ComboboxPrimitive.Value data-slot="combobox-value" {...props} />;
}

type ComboboxInputGroupProps = React.ComponentProps<
  typeof ComboboxPrimitive.InputGroup
>;

function ComboboxInputGroup(props: ComboboxInputGroupProps) {
  return (
    <ComboboxPrimitive.InputGroup data-slot="combobox-input-group" {...props} />
  );
}

type ComboboxInputProps = React.ComponentProps<typeof ComboboxPrimitive.Input>;

function ComboboxInput(props: ComboboxInputProps) {
  return <ComboboxPrimitive.Input data-slot="combobox-input" {...props} />;
}

type ComboboxTriggerProps = React.ComponentProps<
  typeof ComboboxPrimitive.Trigger
>;

function ComboboxTrigger(props: ComboboxTriggerProps) {
  return <ComboboxPrimitive.Trigger data-slot="combobox-trigger" {...props} />;
}

type ComboboxIconProps = React.ComponentProps<typeof ComboboxPrimitive.Icon>;

function ComboboxIcon(props: ComboboxIconProps) {
  return <ComboboxPrimitive.Icon data-slot="combobox-icon" {...props} />;
}

type ComboboxClearProps = React.ComponentProps<typeof ComboboxPrimitive.Clear>;

function ComboboxClear(props: ComboboxClearProps) {
  return <ComboboxPrimitive.Clear data-slot="combobox-clear" {...props} />;
}

type ComboboxChipsProps = React.ComponentProps<typeof ComboboxPrimitive.Chips>;

function ComboboxChips(props: ComboboxChipsProps) {
  return <ComboboxPrimitive.Chips data-slot="combobox-chips" {...props} />;
}

type ComboboxChipProps = Omit<
  React.ComponentProps<typeof ComboboxPrimitive.Chip>,
  'render'
> &
  HTMLMotionProps<'div'>;

// Render the chips inside <AnimatePresence mode="popLayout" initial={false}>
// so a removed chip plays its exit while the others reflow.
function ComboboxChip(props: ComboboxChipProps) {
  return (
    <ReducedMotionConfig>
      <ComboboxChipMotion {...props} />
    </ReducedMotionConfig>
  );
}

// Inside ReducedMotionConfig, so useShouldReduceMotion() sees it.
function ComboboxChipMotion({
  transition = motionTransition.change,
  ...props
}: ComboboxChipProps) {
  const { keyboardChangeRef } = useCombobox();
  const reduce = useShouldReduceMotion();
  const hidden = {
    opacity: 0,
    transform: reduce ? 'scale(1)' : `scale(${scale.enter})`,
  };
  const variants: Variants = {
    hidden,
    visible: { opacity: 1, transform: 'scale(1)', transition },
    // Resolved when the chip leaves, so it reads how it was removed:
    // Backspace (keyboard) is instant, the remove button animates.
    exit: () => ({
      ...hidden,
      transition: keyboardChangeRef.current
        ? motionTransition.instant
        : motionTransition.exit,
    }),
  };

  return (
    <ComboboxPrimitive.Chip
      render={
        <motion.div
          data-slot="combobox-chip"
          variants={variants}
          initial="hidden"
          animate="visible"
          exit="exit"
          {...props}
        />
      }
    />
  );
}

type ComboboxChipRemoveProps = React.ComponentProps<
  typeof ComboboxPrimitive.ChipRemove
>;

function ComboboxChipRemove(props: ComboboxChipRemoveProps) {
  return (
    <ComboboxPrimitive.ChipRemove data-slot="combobox-chip-remove" {...props} />
  );
}

type ComboboxPortalProps = Omit<
  React.ComponentProps<typeof ComboboxPrimitive.Portal>,
  'keepMounted'
>;

function ComboboxPortal({ children, ...props }: ComboboxPortalProps) {
  const { isOpen, unmount } = useCombobox();

  return (
    <AnimatePresence onExitComplete={unmount}>
      {isOpen && (
        <ComboboxPrimitive.Portal
          keepMounted
          data-slot="combobox-portal"
          {...props}
        >
          <ReducedMotionConfig>{children}</ReducedMotionConfig>
        </ComboboxPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}

type ComboboxBackdropProps = React.ComponentProps<
  typeof ComboboxPrimitive.Backdrop
>;

function ComboboxBackdrop(props: ComboboxBackdropProps) {
  return (
    <ComboboxPrimitive.Backdrop data-slot="combobox-backdrop" {...props} />
  );
}

type ComboboxPositionerProps = React.ComponentProps<
  typeof ComboboxPrimitive.Positioner
>;

function ComboboxPositioner(props: ComboboxPositionerProps) {
  return (
    <ComboboxPrimitive.Positioner data-slot="combobox-positioner" {...props} />
  );
}

type ComboboxPopupProps = Omit<
  React.ComponentProps<typeof ComboboxPrimitive.Popup>,
  'render'
> &
  HTMLMotionProps<'div'>;

function ComboboxPopup({
  initialFocus,
  finalFocus,
  transition = motionTransition.dropdown,
  style,
  ...props
}: ComboboxPopupProps) {
  // Rendered inside the Portal's ReducedMotionConfig.
  const reduce = useShouldReduceMotion();
  const hidden = {
    opacity: 0,
    transform: reduce ? 'scale(1)' : `scale(${scale.enter})`,
  };

  return (
    <ComboboxPrimitive.Popup
      initialFocus={initialFocus}
      finalFocus={finalFocus}
      render={
        <motion.div
          data-slot="combobox-popup"
          initial={hidden}
          animate={{ opacity: 1, transform: 'scale(1)', transition }}
          exit={{ ...hidden, transition: motionTransition.exit }}
          style={{ transformOrigin: 'var(--transform-origin)', ...style }}
          {...props}
        />
      }
    />
  );
}

type ComboboxArrowProps = React.ComponentProps<typeof ComboboxPrimitive.Arrow>;

function ComboboxArrow(props: ComboboxArrowProps) {
  return <ComboboxPrimitive.Arrow data-slot="combobox-arrow" {...props} />;
}

type ComboboxStatusProps = React.ComponentProps<
  typeof ComboboxPrimitive.Status
>;

function ComboboxStatus(props: ComboboxStatusProps) {
  return <ComboboxPrimitive.Status data-slot="combobox-status" {...props} />;
}

// Shown instantly: filtering is keyboard-driven and high frequency.
type ComboboxEmptyProps = React.ComponentProps<typeof ComboboxPrimitive.Empty>;

function ComboboxEmpty(props: ComboboxEmptyProps) {
  return <ComboboxPrimitive.Empty data-slot="combobox-empty" {...props} />;
}

// No per-item or height animation: items appear and disappear instantly as
// the query changes.
type ComboboxListProps = React.ComponentProps<typeof ComboboxPrimitive.List>;

function ComboboxList(props: ComboboxListProps) {
  return <ComboboxPrimitive.List data-slot="combobox-list" {...props} />;
}

type ComboboxRowProps = React.ComponentProps<typeof ComboboxPrimitive.Row>;

function ComboboxRow(props: ComboboxRowProps) {
  return <ComboboxPrimitive.Row data-slot="combobox-row" {...props} />;
}

type ComboboxCollectionProps = React.ComponentProps<
  typeof ComboboxPrimitive.Collection
>;

function ComboboxCollection(props: ComboboxCollectionProps) {
  return <ComboboxPrimitive.Collection {...props} />;
}

// No animated highlight: arrow keys move it, and keyboard navigation stays
// instant. Style `data-highlighted` instead.
type ComboboxItemProps = React.ComponentProps<typeof ComboboxPrimitive.Item>;

function ComboboxItem(props: ComboboxItemProps) {
  return <ComboboxPrimitive.Item data-slot="combobox-item" {...props} />;
}

type ComboboxItemIndicatorProps = Omit<
  React.ComponentProps<typeof ComboboxPrimitive.ItemIndicator>,
  'render'
>;

// Single selection: not animated, it only mounts with the list (choosing an
// item closes it). Multiple selection keeps the list open, so toggling an item
// fades and scales its check; it still appears instantly when the list opens.
function ComboboxItemIndicator({
  keepMounted,
  ...props
}: ComboboxItemIndicatorProps) {
  const { multiple } = useCombobox();
  const reduce = useShouldReduceMotion();

  if (!multiple) {
    return (
      <ComboboxPrimitive.ItemIndicator
        data-slot="combobox-item-indicator"
        keepMounted={keepMounted}
        {...props}
      />
    );
  }

  return (
    <ComboboxPrimitive.ItemIndicator
      data-slot="combobox-item-indicator"
      keepMounted
      {...props}
      render={(renderProps, state) => (
        <motion.span
          {...(renderProps as HTMLMotionProps<'span'>)}
          initial={false}
          animate={
            state.selected
              ? {
                  opacity: 1,
                  transform: 'scale(1)',
                  transition: motionTransition.change,
                }
              : {
                  opacity: 0,
                  transform: reduce ? 'scale(1)' : `scale(${scale.enter})`,
                  transition: motionTransition.exit,
                }
          }
        />
      )}
    />
  );
}

type ComboboxGroupProps = React.ComponentProps<typeof ComboboxPrimitive.Group>;

function ComboboxGroup(props: ComboboxGroupProps) {
  return <ComboboxPrimitive.Group data-slot="combobox-group" {...props} />;
}

type ComboboxGroupLabelProps = React.ComponentProps<
  typeof ComboboxPrimitive.GroupLabel
>;

function ComboboxGroupLabel(props: ComboboxGroupLabelProps) {
  return (
    <ComboboxPrimitive.GroupLabel data-slot="combobox-group-label" {...props} />
  );
}

type ComboboxSeparatorProps = React.ComponentProps<
  typeof ComboboxPrimitive.Separator
>;

function ComboboxSeparator(props: ComboboxSeparatorProps) {
  return (
    <ComboboxPrimitive.Separator data-slot="combobox-separator" {...props} />
  );
}

const useComboboxFilter = ComboboxPrimitive.useFilter;

export {
  Combobox,
  ComboboxLabel,
  ComboboxValue,
  ComboboxInputGroup,
  ComboboxInput,
  ComboboxTrigger,
  ComboboxIcon,
  ComboboxClear,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxPortal,
  ComboboxBackdrop,
  ComboboxPositioner,
  ComboboxPopup,
  ComboboxArrow,
  ComboboxStatus,
  ComboboxEmpty,
  ComboboxList,
  ComboboxRow,
  ComboboxCollection,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxSeparator,
  useCombobox,
  useComboboxFilter,
  type ComboboxProps,
  type ComboboxLabelProps,
  type ComboboxValueProps,
  type ComboboxInputGroupProps,
  type ComboboxInputProps,
  type ComboboxTriggerProps,
  type ComboboxIconProps,
  type ComboboxClearProps,
  type ComboboxChipsProps,
  type ComboboxChipProps,
  type ComboboxChipRemoveProps,
  type ComboboxPortalProps,
  type ComboboxBackdropProps,
  type ComboboxPositionerProps,
  type ComboboxPopupProps,
  type ComboboxArrowProps,
  type ComboboxStatusProps,
  type ComboboxEmptyProps,
  type ComboboxListProps,
  type ComboboxRowProps,
  type ComboboxCollectionProps,
  type ComboboxItemProps,
  type ComboboxItemIndicatorProps,
  type ComboboxGroupProps,
  type ComboboxGroupLabelProps,
  type ComboboxSeparatorProps,
  type ComboboxContextType,
};
