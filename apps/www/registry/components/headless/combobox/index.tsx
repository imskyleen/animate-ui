import * as React from 'react';
import { CheckIcon, ChevronDownIcon } from 'lucide-react';

import {
  Combobox as ComboboxPrimitive,
  ComboboxInput as ComboboxInputPrimitive,
  ComboboxButton as ComboboxButtonPrimitive,
  ComboboxOptions as ComboboxOptionsPrimitive,
  ComboboxOption as ComboboxOptionPrimitive,
  type ComboboxProps as ComboboxPrimitiveProps,
  type ComboboxInputProps as ComboboxInputPrimitiveProps,
  type ComboboxButtonProps as ComboboxButtonPrimitiveProps,
  type ComboboxOptionsProps as ComboboxOptionsPrimitiveProps,
  type ComboboxOptionProps as ComboboxOptionPrimitiveProps,
} from '@/registry/primitives/headless/combobox';
import { cn } from '@workspace/ui/lib/utils';

type ComboboxProps<
  TValue = unknown,
  TMultiple extends boolean | undefined = false,
  TTag extends React.ElementType = typeof React.Fragment,
> = ComboboxPrimitiveProps<TValue, TMultiple, TTag>;

function Combobox<
  TValue,
  TMultiple extends boolean | undefined = false,
  TTag extends React.ElementType = typeof React.Fragment,
>(props: ComboboxProps<TValue, TMultiple, TTag>) {
  return <ComboboxPrimitive {...props} />;
}

type ComboboxInputProps<
  TTag extends React.ElementType = 'input',
  TType = string,
> = ComboboxInputPrimitiveProps<TTag, TType> & {
  className?: string;
  showButton?: boolean;
};

function ComboboxInput<
  TTag extends React.ElementType = 'input',
  TType = string,
>({ className, showButton = true, ...props }: ComboboxInputProps<TTag, TType>) {
  return (
    <div
      data-slot="input-group"
      className={cn(
        'group/input-group border-input dark:bg-input/30 relative flex h-9 w-auto min-w-0 items-center rounded-md border shadow-xs transition-[color,box-shadow] outline-none',
        'has-[[data-slot=combobox-input]:focus-visible]:border-ring has-[[data-slot=combobox-input]:focus-visible]:ring-ring/50 has-[[data-slot=combobox-input]:focus-visible]:ring-[3px]',
        'has-[[aria-invalid=true]]:ring-destructive/20 dark:has-[[aria-invalid=true]]:ring-destructive/40 has-[[aria-invalid=true]]:border-destructive',
        className,
      )}
    >
      <ComboboxInputPrimitive
        className="placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground h-full w-full min-w-0 flex-1 rounded-none border-0 bg-transparent px-3 py-1 text-base outline-none data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50 md:text-sm"
        {...props}
      />
      {showButton && <ComboboxButton aria-label="Open options" />}
    </div>
  );
}

type ComboboxButtonProps<TTag extends React.ElementType = 'button'> =
  ComboboxButtonPrimitiveProps<TTag> & {
    className?: string;
  };

function ComboboxButton<TTag extends React.ElementType = 'button'>({
  className,
  ...props
}: ComboboxButtonProps<TTag>) {
  return (
    <ComboboxButtonPrimitive
      className={cn(
        "text-muted-foreground hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 data-focus:ring-ring/50 mr-1.5 inline-flex size-6 shrink-0 items-center justify-center rounded-[calc(var(--radius)-5px)] transition-[color,box-shadow] outline-none data-disabled:pointer-events-none data-disabled:opacity-50 data-focus:ring-[3px] [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <ChevronDownIcon className="pointer-events-none size-4" />
    </ComboboxButtonPrimitive>
  );
}

type ComboboxOptionsProps<TTag extends React.ElementType = 'div'> =
  ComboboxOptionsPrimitiveProps<TTag>;

function ComboboxOptions<TTag extends React.ElementType = 'div'>({
  className,
  anchor = { to: 'bottom start', gap: 6 },
  ...props
}: ComboboxOptionsProps<TTag>) {
  return (
    <ComboboxOptionsPrimitive
      anchor={anchor}
      className={cn(
        'bg-popover text-popover-foreground z-50 max-h-96 w-(--input-width) min-w-[calc(var(--input-width)+--spacing(7))] scroll-py-1 overflow-y-auto rounded-md border p-1 shadow-md outline-hidden',
        'data-[anchor=top_center]:origin-bottom data-[anchor=top_start]:origin-bottom-left data-[anchor=top_end]:origin-bottom-right',
        'data-[anchor=bottom_center]:origin-top data-[anchor=bottom_start]:origin-top-left data-[anchor=bottom_end]:origin-top-right',
        'data-[anchor=left_center]:origin-right data-[anchor=left_start]:origin-top-right data-[anchor=left_end]:origin-bottom-right',
        'data-[anchor=right_center]:origin-left data-[anchor=right_start]:origin-top-left data-[anchor=right_end]:origin-bottom-left',
        className,
      )}
      {...props}
    />
  );
}

type ComboboxOptionProps<
  TTag extends React.ElementType = 'div',
  TType = unknown,
> = ComboboxOptionPrimitiveProps<TTag, TType> & {
  className?: string;
};

// The check is not animated: it only mounts with the list, and a single
// selection closes it.
function ComboboxOption<
  TTag extends React.ElementType = 'div',
  TType = unknown,
>({ className, children, ...props }: ComboboxOptionProps<TTag, TType>) {
  return (
    <ComboboxOptionPrimitive
      className={cn(
        "data-focus:bg-accent data-focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {(bag) => (
        <>
          {typeof children === 'function' ? children(bag) : children}
          {bag.selected && (
            <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
              <CheckIcon className="size-4" />
            </span>
          )}
        </>
      )}
    </ComboboxOptionPrimitive>
  );
}

type ComboboxEmptyProps = React.ComponentProps<'div'>;

// Not a Headless UI part: render it inside ComboboxOptions when the query
// matches nothing. Shown instantly, like the filtered options.
function ComboboxEmpty({ className, ...props }: ComboboxEmptyProps) {
  return (
    <div
      data-slot="combobox-empty"
      role="status"
      className={cn(
        'text-muted-foreground flex w-full justify-center py-2 text-center text-sm',
        className,
      )}
      {...props}
    />
  );
}

export {
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
  ComboboxEmpty,
  type ComboboxProps,
  type ComboboxInputProps,
  type ComboboxButtonProps,
  type ComboboxOptionsProps,
  type ComboboxOptionProps,
  type ComboboxEmptyProps,
};
