'use client';

import * as React from 'react';
import { DropdownMenu as DropdownMenuPrimitive } from 'radix-ui';
import { AnimatePresence, motion, type Transition } from 'motion/react';
import { CheckIcon, ChevronRightIcon, CircleIcon } from 'lucide-react';

import { cn } from '@workspace/ui/lib/utils';
import {
  ReducedMotionConfig,
  scale,
  transition as motionTransition,
  useShouldReduceMotion,
} from '@/registry/lib/motion';
import { getStrictContext } from '@/registry/lib/get-strict-context';
import { useControlledState } from '@/registry/hooks/use-controlled-state';

const TRANSFORM_ORIGIN = 'var(--radix-dropdown-menu-content-transform-origin)';

type DropdownMenuContextType = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

const [DropdownMenuProvider, useDropdownMenu] =
  getStrictContext<DropdownMenuContextType>('DropdownMenuContext');

type Modality = 'pointer' | 'keyboard';

type DropdownMenuSubContextType = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  modality: Modality;
  setModality: (modality: Modality) => void;
};

const [DropdownMenuSubProvider, useDropdownMenuSub] =
  getStrictContext<DropdownMenuSubContextType>('DropdownMenuSubContext');

// Keys that open or close a submenu (rule 12: keyboard-driven menu
// navigation does not animate).
const SUB_KEYS = new Set(['ArrowRight', 'ArrowLeft', 'Enter', ' ', 'Escape']);

function DropdownMenu({
  open,
  defaultOpen,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  const [isOpen, setIsOpen] = useControlledState({
    value: open,
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange,
  });

  return (
    <DropdownMenuProvider value={{ isOpen, setIsOpen }}>
      <DropdownMenuPrimitive.Root
        data-slot="dropdown-menu"
        open={isOpen}
        onOpenChange={setIsOpen}
        {...props}
      />
    </DropdownMenuProvider>
  );
}

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
  );
}

function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  );
}

type MotionOverlayProps = {
  /** Entrance transition. Defaults to `transition.dropdown` (0.2s ease-out). */
  transition?: Transition;
  /** Exit transition. Defaults to `transition.tooltip` (0.15s ease-out). */
  exitTransition?: Transition;
};

/**
 * The animated surface shared by the menu and its submenus. Rendered as the
 * `asChild` target of a Radix Content, so Radix forwards its props, ref,
 * className, style and `data-*` attributes onto it.
 */
function MenuSurface({
  instant = false,
  transition = motionTransition.dropdown,
  exitTransition = motionTransition.tooltip,
  ...props
}: MotionOverlayProps & {
  instant?: boolean;
} & React.ComponentProps<'div'>) {
  const reduce = useShouldReduceMotion();
  const enter = reduce || instant ? 1 : scale.enter;
  const hidden = { opacity: 0, transform: `scale(${enter})` };

  return (
    <motion.div
      {...(props as React.ComponentProps<typeof motion.div>)}
      initial={instant ? false : hidden}
      animate={{ opacity: 1, transform: 'scale(1)', transition }}
      exit={{
        ...hidden,
        transition: instant ? { duration: 0 } : exitTransition,
      }}
      style={{ transformOrigin: TRANSFORM_ORIGIN, ...props.style }}
    />
  );
}

type DropdownMenuContentProps = Omit<
  React.ComponentProps<typeof DropdownMenuPrimitive.Content>,
  'forceMount' | 'asChild'
> &
  MotionOverlayProps;

function DropdownMenuContent({
  className,
  sideOffset = 4,
  transition,
  exitTransition,
  children,
  ...props
}: DropdownMenuContentProps) {
  const { isOpen } = useDropdownMenu();

  return (
    <AnimatePresence>
      {isOpen && (
        <DropdownMenuPrimitive.Portal forceMount>
          <ReducedMotionConfig>
            <DropdownMenuPrimitive.Content
              asChild
              forceMount
              data-slot="dropdown-menu-content"
              sideOffset={sideOffset}
              className={cn(
                'bg-popover text-popover-foreground z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md',
                className,
              )}
              {...props}
            >
              <MenuSurface
                transition={transition}
                exitTransition={exitTransition}
              >
                {children}
              </MenuSurface>
            </DropdownMenuPrimitive.Content>
          </ReducedMotionConfig>
        </DropdownMenuPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}

function DropdownMenuGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return (
    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
  );
}

function DropdownMenuItem({
  className,
  inset,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean;
  variant?: 'default' | 'destructive';
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  );
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        'px-2 py-1.5 text-sm font-medium data-[inset]:pl-8',
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn('bg-border -mx-1 my-1 h-px', className)}
      {...props}
    />
  );
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        'text-muted-foreground ml-auto text-xs tracking-widest',
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuSub({
  open,
  defaultOpen,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  const [isOpen, setIsOpen] = useControlledState({
    value: open,
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange,
  });
  const [modality, setModality] = React.useState<Modality>('pointer');

  return (
    <DropdownMenuSubProvider
      value={{ isOpen, setIsOpen, modality, setModality }}
    >
      <DropdownMenuPrimitive.Sub
        data-slot="dropdown-menu-sub"
        open={isOpen}
        onOpenChange={setIsOpen}
        {...props}
      />
    </DropdownMenuSubProvider>
  );
}

/** Records whether the submenu is being driven by the keyboard or a pointer. */
function useModalityHandlers({
  onKeyDown,
  onPointerMove,
}: {
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
  onPointerMove?: React.PointerEventHandler<HTMLDivElement>;
}) {
  const { setModality } = useDropdownMenuSub();
  return {
    onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (SUB_KEYS.has(event.key)) setModality('keyboard');
      onKeyDown?.(event);
    },
    onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.pointerType === 'mouse') setModality('pointer');
      onPointerMove?.(event);
    },
  };
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  onKeyDown,
  onPointerMove,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean;
}) {
  const handlers = useModalityHandlers({ onKeyDown, onPointerMove });

  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        'focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8',
        className,
      )}
      {...props}
      {...handlers}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

type DropdownMenuSubContentProps = Omit<
  React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>,
  'forceMount' | 'asChild'
> &
  MotionOverlayProps;

function DropdownMenuSubContent({
  className,
  transition,
  exitTransition,
  children,
  onKeyDown,
  onPointerMove,
  ...props
}: DropdownMenuSubContentProps) {
  const { isOpen, modality } = useDropdownMenuSub();
  const handlers = useModalityHandlers({ onKeyDown, onPointerMove });

  return (
    <AnimatePresence>
      {isOpen && (
        <DropdownMenuPrimitive.Portal forceMount>
          <ReducedMotionConfig>
            <DropdownMenuPrimitive.SubContent
              asChild
              forceMount
              data-slot="dropdown-menu-sub-content"
              className={cn(
                'bg-popover text-popover-foreground z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-lg',
                className,
              )}
              {...props}
              {...handlers}
            >
              <MenuSurface
                instant={modality === 'keyboard'}
                transition={transition}
                exitTransition={exitTransition}
              >
                {children}
              </MenuSurface>
            </DropdownMenuPrimitive.SubContent>
          </ReducedMotionConfig>
        </DropdownMenuPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  type DropdownMenuContentProps,
  type DropdownMenuSubContentProps,
};
