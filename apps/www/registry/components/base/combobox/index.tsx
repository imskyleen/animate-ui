import * as React from 'react';
import { CheckIcon, ChevronDownIcon, XIcon } from 'lucide-react';

import {
  Combobox as ComboboxPrimitive,
  ComboboxValue as ComboboxValuePrimitive,
  ComboboxInputGroup as ComboboxInputGroupPrimitive,
  ComboboxInput as ComboboxInputPrimitive,
  ComboboxTrigger as ComboboxTriggerPrimitive,
  ComboboxClear as ComboboxClearPrimitive,
  ComboboxChips as ComboboxChipsPrimitive,
  ComboboxChip as ComboboxChipPrimitive,
  ComboboxChipRemove as ComboboxChipRemovePrimitive,
  ComboboxPortal as ComboboxPortalPrimitive,
  ComboboxPositioner as ComboboxPositionerPrimitive,
  ComboboxPopup as ComboboxPopupPrimitive,
  ComboboxEmpty as ComboboxEmptyPrimitive,
  ComboboxList as ComboboxListPrimitive,
  ComboboxCollection as ComboboxCollectionPrimitive,
  ComboboxItem as ComboboxItemPrimitive,
  ComboboxItemIndicator as ComboboxItemIndicatorPrimitive,
  ComboboxGroup as ComboboxGroupPrimitive,
  ComboboxGroupLabel as ComboboxGroupLabelPrimitive,
  ComboboxSeparator as ComboboxSeparatorPrimitive,
  type ComboboxProps as ComboboxPrimitiveProps,
  type ComboboxValueProps as ComboboxValuePrimitiveProps,
  type ComboboxInputProps as ComboboxInputPrimitiveProps,
  type ComboboxTriggerProps as ComboboxTriggerPrimitiveProps,
  type ComboboxClearProps as ComboboxClearPrimitiveProps,
  type ComboboxChipsProps as ComboboxChipsPrimitiveProps,
  type ComboboxChipProps as ComboboxChipPrimitiveProps,
  type ComboboxPositionerProps as ComboboxPositionerPrimitiveProps,
  type ComboboxPopupProps as ComboboxPopupPrimitiveProps,
  type ComboboxEmptyProps as ComboboxEmptyPrimitiveProps,
  type ComboboxListProps as ComboboxListPrimitiveProps,
  type ComboboxCollectionProps as ComboboxCollectionPrimitiveProps,
  type ComboboxItemProps as ComboboxItemPrimitiveProps,
  type ComboboxGroupProps as ComboboxGroupPrimitiveProps,
  type ComboboxGroupLabelProps as ComboboxGroupLabelPrimitiveProps,
  type ComboboxSeparatorProps as ComboboxSeparatorPrimitiveProps,
} from '@/registry/primitives/base/combobox';
import { cn } from '@workspace/ui/lib/utils';

type ComboboxProps<
  Value = unknown,
  Multiple extends boolean | undefined = false,
> = ComboboxPrimitiveProps<Value, Multiple>;

function Combobox<Value, Multiple extends boolean | undefined = false>(
  props: ComboboxProps<Value, Multiple>,
) {
  return <ComboboxPrimitive {...props} />;
}

type ComboboxValueProps = ComboboxValuePrimitiveProps;

function ComboboxValue(props: ComboboxValueProps) {
  return <ComboboxValuePrimitive {...props} />;
}

const inputGroupButtonClassName =
  "text-muted-foreground hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 focus-visible:ring-ring/50 inline-flex size-6 shrink-0 items-center justify-center rounded-[calc(var(--radius)-5px)] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4";

type ComboboxTriggerProps = ComboboxTriggerPrimitiveProps;

function ComboboxTrigger({
  className,
  children,
  ...props
}: ComboboxTriggerProps) {
  return (
    <ComboboxTriggerPrimitive
      className={cn("[&_svg:not([class*='size-'])]:size-4", className)}
      {...props}
    >
      {children}
      <ChevronDownIcon
        data-slot="combobox-trigger-icon"
        className="text-muted-foreground pointer-events-none size-4"
      />
    </ComboboxTriggerPrimitive>
  );
}

type ComboboxClearProps = ComboboxClearPrimitiveProps;

function ComboboxClear({ className, ...props }: ComboboxClearProps) {
  return (
    <ComboboxClearPrimitive
      aria-label="Clear selection"
      className={cn(inputGroupButtonClassName, className)}
      {...props}
    >
      <XIcon className="pointer-events-none" />
    </ComboboxClearPrimitive>
  );
}

type ComboboxInputProps = ComboboxInputPrimitiveProps & {
  showTrigger?: boolean;
  showClear?: boolean;
};

function ComboboxInput({
  className,
  children,
  disabled = false,
  showTrigger = true,
  showClear = false,
  ...props
}: ComboboxInputProps) {
  return (
    <ComboboxInputGroupPrimitive
      data-slot="input-group"
      className={cn(
        'group/input-group border-input dark:bg-input/30 relative flex h-9 w-auto min-w-0 items-center rounded-md border shadow-xs transition-[color,box-shadow] outline-none',
        'has-[[data-slot=combobox-input]:focus-visible]:border-ring has-[[data-slot=combobox-input]:focus-visible]:ring-ring/50 has-[[data-slot=combobox-input]:focus-visible]:ring-[3px]',
        'has-[[aria-invalid=true]]:ring-destructive/20 dark:has-[[aria-invalid=true]]:ring-destructive/40 has-[[aria-invalid=true]]:border-destructive',
        className,
      )}
    >
      <ComboboxInputPrimitive
        disabled={disabled}
        className="placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground h-full w-full min-w-0 flex-1 rounded-none border-0 bg-transparent px-3 py-1 text-base outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        {...props}
      />
      <div
        data-slot="input-group-addon"
        className="text-muted-foreground order-last mr-1.5 flex items-center gap-1"
      >
        {showTrigger && (
          <ComboboxTrigger
            aria-label="Open popup"
            disabled={disabled}
            className={cn(
              inputGroupButtonClassName,
              'group-has-data-[slot=combobox-clear]/input-group:hidden',
            )}
          />
        )}
        {showClear && <ComboboxClear disabled={disabled} />}
      </div>
      {children}
    </ComboboxInputGroupPrimitive>
  );
}

type ComboboxContentProps = ComboboxPopupPrimitiveProps &
  Pick<
    ComboboxPositionerPrimitiveProps,
    'side' | 'align' | 'sideOffset' | 'alignOffset' | 'anchor'
  >;

function ComboboxContent({
  className,
  side = 'bottom',
  sideOffset = 6,
  align = 'start',
  alignOffset = 0,
  anchor,
  ...props
}: ComboboxContentProps) {
  return (
    <ComboboxPortalPrimitive>
      <ComboboxPositionerPrimitive
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className="isolate z-50"
      >
        <ComboboxPopupPrimitive
          data-chips={!!anchor}
          className={cn(
            'bg-popover text-popover-foreground group/combobox-content relative max-h-96 w-(--anchor-width) max-w-(--available-width) min-w-[calc(var(--anchor-width)+--spacing(7))] overflow-hidden rounded-md border shadow-md data-[chips=true]:min-w-(--anchor-width)',
            className,
          )}
          {...props}
        />
      </ComboboxPositionerPrimitive>
    </ComboboxPortalPrimitive>
  );
}

type ComboboxListProps = ComboboxListPrimitiveProps;

function ComboboxList({ className, ...props }: ComboboxListProps) {
  return (
    <ComboboxListPrimitive
      className={cn(
        'max-h-[min(calc(--spacing(96)---spacing(9)),calc(var(--available-height)---spacing(9)))] scroll-py-1 overflow-y-auto p-1 data-empty:p-0',
        className,
      )}
      {...props}
    />
  );
}

type ComboboxItemProps = ComboboxItemPrimitiveProps;

function ComboboxItem({ className, children, ...props }: ComboboxItemProps) {
  return (
    <ComboboxItemPrimitive
      className={cn(
        "data-highlighted:bg-accent data-highlighted:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
      <ComboboxItemIndicatorPrimitive className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
        <CheckIcon className="pointer-events-none size-4" />
      </ComboboxItemIndicatorPrimitive>
    </ComboboxItemPrimitive>
  );
}

type ComboboxGroupProps = ComboboxGroupPrimitiveProps;

function ComboboxGroup(props: ComboboxGroupProps) {
  return <ComboboxGroupPrimitive {...props} />;
}

type ComboboxLabelProps = ComboboxGroupLabelPrimitiveProps;

function ComboboxLabel({ className, ...props }: ComboboxLabelProps) {
  return (
    <ComboboxGroupLabelPrimitive
      className={cn('text-muted-foreground px-2 py-1.5 text-xs', className)}
      {...props}
    />
  );
}

type ComboboxCollectionProps = ComboboxCollectionPrimitiveProps;

function ComboboxCollection(props: ComboboxCollectionProps) {
  return <ComboboxCollectionPrimitive {...props} />;
}

type ComboboxEmptyProps = ComboboxEmptyPrimitiveProps;

function ComboboxEmpty({ className, ...props }: ComboboxEmptyProps) {
  return (
    <ComboboxEmptyPrimitive
      // Base UI's Empty is a live region: it must stay displayed, so it
      // collapses when it has no children instead of being hidden.
      className={cn(
        'text-muted-foreground flex w-full justify-center py-2 text-center text-sm empty:p-0',
        className,
      )}
      {...props}
    />
  );
}

type ComboboxSeparatorProps = ComboboxSeparatorPrimitiveProps;

function ComboboxSeparator({ className, ...props }: ComboboxSeparatorProps) {
  return (
    <ComboboxSeparatorPrimitive
      className={cn('bg-border -mx-1 my-1 h-px', className)}
      {...props}
    />
  );
}

type ComboboxChipsProps = ComboboxChipsPrimitiveProps;

function ComboboxChips({ className, ...props }: ComboboxChipsProps) {
  return (
    <ComboboxChipsPrimitive
      className={cn(
        // `relative`: removed chips pop out of the flow (AnimatePresence
        // `popLayout`) and are positioned against it while they exit.
        'dark:bg-input/30 border-input focus-within:border-ring focus-within:ring-ring/50 has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40 has-aria-invalid:border-destructive dark:has-aria-invalid:border-destructive/50 relative flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border bg-transparent bg-clip-padding px-2.5 py-1.5 text-sm shadow-xs transition-[color,box-shadow] focus-within:ring-[3px] has-aria-invalid:ring-[3px] has-data-[slot=combobox-chip]:px-1.5',
        className,
      )}
      {...props}
    />
  );
}

type ComboboxChipProps = ComboboxChipPrimitiveProps & {
  showRemove?: boolean;
};

function ComboboxChip({
  className,
  children,
  showRemove = true,
  ...props
}: ComboboxChipProps) {
  return (
    <ComboboxChipPrimitive
      className={cn(
        'bg-muted text-foreground flex h-[calc(--spacing(5.5))] w-fit items-center justify-center gap-1 rounded-sm px-1.5 text-xs font-medium whitespace-nowrap has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50 has-data-[slot=combobox-chip-remove]:pr-0',
        className,
      )}
      {...props}
    >
      {children}
      {showRemove && (
        <ComboboxChipRemovePrimitive
          aria-label="Remove"
          className="hover:bg-accent dark:hover:bg-accent/50 -ml-1 inline-flex size-6 items-center justify-center rounded-[calc(var(--radius)-5px)] opacity-50 outline-none hover:opacity-100 [&_svg:not([class*='size-'])]:size-3.5"
        >
          <XIcon className="pointer-events-none" />
        </ComboboxChipRemovePrimitive>
      )}
    </ComboboxChipPrimitive>
  );
}

type ComboboxChipsInputProps = ComboboxInputPrimitiveProps;

function ComboboxChipsInput({ className, ...props }: ComboboxChipsInputProps) {
  return (
    <ComboboxInputPrimitive
      data-slot="combobox-chip-input"
      className={cn(
        'placeholder:text-muted-foreground min-w-16 flex-1 bg-transparent outline-none',
        className,
      )}
      {...props}
    />
  );
}

function useComboboxAnchor() {
  return React.useRef<HTMLDivElement | null>(null);
}

export {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxCollection,
  ComboboxEmpty,
  ComboboxSeparator,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxTrigger,
  ComboboxValue,
  ComboboxClear,
  useComboboxAnchor,
  type ComboboxProps,
  type ComboboxInputProps,
  type ComboboxContentProps,
  type ComboboxListProps,
  type ComboboxItemProps,
  type ComboboxGroupProps,
  type ComboboxLabelProps,
  type ComboboxCollectionProps,
  type ComboboxEmptyProps,
  type ComboboxSeparatorProps,
  type ComboboxChipsProps,
  type ComboboxChipProps,
  type ComboboxChipsInputProps,
  type ComboboxTriggerProps,
  type ComboboxValueProps,
  type ComboboxClearProps,
};
