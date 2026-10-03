'use client';

import * as React from 'react';
import { Menu as MenuPrimitive } from '@base-ui/react/menu';
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

type MenuActiveValueContextType = {
  highlightedValue: string | null;
  setHighlightedValue: (value: string | null) => void;
  /** Last interaction was the keyboard: the highlight moves instantly. */
  isKeyboard: boolean;
  setIsKeyboard: (isKeyboard: boolean) => void;
};

type MenuContextType = {
  isOpen: boolean;
  setIsOpen: MenuProps['onOpenChange'];
  /** Submenu popups fade only, without scale. */
  isSubmenu: boolean;
};

const [MenuActiveValueProvider, useMenuActiveValue] =
  getStrictContext<MenuActiveValueContextType>('MenuActiveValueContext');
const [MenuProvider, useMenu] =
  getStrictContext<MenuContextType>('MenuContext');

type MenuProps = React.ComponentProps<typeof MenuPrimitive.Root>;

function Menu(props: MenuProps) {
  const [isOpen, setIsOpen] = useControlledState({
    value: props?.open,
    defaultValue: props?.defaultOpen,
    onChange: props?.onOpenChange,
  });
  const [highlightedValue, setHighlightedValue] = React.useState<string | null>(
    null,
  );
  const [isKeyboard, setIsKeyboard] = React.useState(false);

  return (
    <MenuActiveValueProvider
      value={{
        highlightedValue,
        setHighlightedValue,
        isKeyboard,
        setIsKeyboard,
      }}
    >
      <MenuProvider value={{ isOpen, setIsOpen, isSubmenu: false }}>
        <MenuPrimitive.Root
          data-slot="menu"
          {...props}
          onOpenChange={setIsOpen}
        />
      </MenuProvider>
    </MenuActiveValueProvider>
  );
}

type MenuTriggerProps = React.ComponentProps<typeof MenuPrimitive.Trigger>;

function MenuTrigger(props: MenuTriggerProps) {
  return <MenuPrimitive.Trigger data-slot="menu-trigger" {...props} />;
}

type MenuPortalProps = Omit<
  React.ComponentProps<typeof MenuPrimitive.Portal>,
  'keepMounted'
>;

function MenuPortal({ children, ...props }: MenuPortalProps) {
  const { isOpen } = useMenu();

  return (
    <AnimatePresence>
      {isOpen && (
        <MenuPrimitive.Portal keepMounted data-slot="menu-portal" {...props}>
          <ReducedMotionConfig>{children}</ReducedMotionConfig>
        </MenuPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}

type MenuGroupProps = React.ComponentProps<typeof MenuPrimitive.Group>;

function MenuGroup(props: MenuGroupProps) {
  return <MenuPrimitive.Group data-slot="menu-group" {...props} />;
}

type MenuGroupLabelProps = React.ComponentProps<
  typeof MenuPrimitive.GroupLabel
>;

function MenuGroupLabel(props: MenuGroupLabelProps) {
  return <MenuPrimitive.GroupLabel data-slot="menu-group-label" {...props} />;
}

type MenuSubmenuProps = React.ComponentProps<typeof MenuPrimitive.SubmenuRoot>;

function MenuSubmenu(props: MenuSubmenuProps) {
  const [isOpen, setIsOpen] = useControlledState({
    value: props?.open,
    defaultValue: props?.defaultOpen,
    onChange: props?.onOpenChange,
  });

  return (
    <MenuProvider value={{ isOpen, setIsOpen, isSubmenu: true }}>
      <MenuPrimitive.SubmenuRoot
        data-slot="menu-submenu"
        {...props}
        onOpenChange={setIsOpen}
      />
    </MenuProvider>
  );
}

type MenuSubmenuTriggerProps = Omit<
  React.ComponentProps<typeof MenuPrimitive.SubmenuTrigger>,
  'render'
> &
  HTMLMotionProps<'div'> & {
    disabled?: boolean;
  };

function MenuSubmenuTrigger({
  label,
  id,
  nativeButton,
  ...props
}: MenuSubmenuTriggerProps) {
  const { setHighlightedValue } = useMenuActiveValue();
  const [, highlightedRef] = useDataState<HTMLDivElement>(
    'highlighted',
    undefined,
    (value) => {
      if (value === true) {
        const el = highlightedRef.current;
        const v = el?.dataset.value || el?.id || null;
        if (v) setHighlightedValue(v);
      }
    },
  );

  return (
    <MenuPrimitive.SubmenuTrigger
      ref={highlightedRef}
      label={label}
      id={id}
      nativeButton={nativeButton}
      data-slot="menu-submenu-trigger"
      {...props}
    />
  );
}

type MenuHighlightProps = Omit<
  HighlightProps,
  'controlledItems' | 'enabled' | 'hover'
> & {
  animateOnHover?: boolean;
};

function MenuHighlight({
  transition = spring.snappy,
  ...props
}: MenuHighlightProps) {
  const { highlightedValue, isKeyboard } = useMenuActiveValue();

  return (
    <Highlight
      data-slot="menu-highlight"
      click={false}
      controlledItems
      transition={isKeyboard ? motionTransition.instant : transition}
      value={highlightedValue}
      {...props}
    />
  );
}

type MenuHighlightItemProps = HighlightItemProps;

function MenuHighlightItem(props: MenuHighlightItemProps) {
  return <HighlightItem data-slot="menu-highlight-item" {...props} />;
}

type MenuPositionerProps = React.ComponentProps<
  typeof MenuPrimitive.Positioner
>;

function MenuPositioner(props: MenuPositionerProps) {
  return <MenuPrimitive.Positioner data-slot="menu-positioner" {...props} />;
}

type MenuPopupProps = Omit<
  React.ComponentProps<typeof MenuPrimitive.Popup>,
  'render'
> &
  HTMLMotionProps<'div'>;

function MenuPopup({
  finalFocus,
  id,
  transition,
  style,
  onKeyDownCapture,
  onPointerDownCapture,
  onPointerMoveCapture,
  ...props
}: MenuPopupProps) {
  const { isSubmenu } = useMenu();
  const { isKeyboard, setIsKeyboard } = useMenuActiveValue();
  const reduce = useShouldReduceMotion();
  // Submenus open tens of times a day: they fade only, quickly both ways.
  const hidden =
    isSubmenu || reduce
      ? { opacity: 0, transform: 'scale(1)' }
      : { opacity: 0, transform: `scale(${scale.enter})` };
  const enter =
    transition ??
    (isSubmenu ? motionTransition.exit : motionTransition.dropdown);

  return (
    <MenuPrimitive.Popup
      finalFocus={finalFocus}
      id={id}
      render={
        <motion.div
          data-slot="menu-popup"
          initial={hidden}
          animate={{ opacity: 1, transform: 'scale(1)', transition: enter }}
          exit={{ ...hidden, transition: motionTransition.exit }}
          style={{ transformOrigin: 'var(--transform-origin)', ...style }}
          {...props}
          // Arrow keys move the highlight instantly; the pointer animates it.
          // Capture phase: items may stop the propagation of their keys.
          onKeyDownCapture={(event) => {
            setIsKeyboard(true);
            onKeyDownCapture?.(event);
          }}
          onPointerDownCapture={(event) => {
            setIsKeyboard(false);
            onPointerDownCapture?.(event);
          }}
          onPointerMoveCapture={(event) => {
            if (isKeyboard) setIsKeyboard(false);
            onPointerMoveCapture?.(event);
          }}
        />
      }
    />
  );
}

type MenuItemProps = Omit<
  React.ComponentProps<typeof MenuPrimitive.Item>,
  'render'
> &
  HTMLMotionProps<'div'>;

function MenuItem({
  disabled,
  label,
  closeOnClick,
  nativeButton,
  id,
  ...props
}: MenuItemProps) {
  const { setHighlightedValue } = useMenuActiveValue();
  const [, highlightedRef] = useDataState<HTMLDivElement>(
    'highlighted',
    undefined,
    (value) => {
      if (value === true) {
        const el = highlightedRef.current;
        const v = el?.dataset.value || el?.id || null;
        if (v) setHighlightedValue(v);
      }
    },
  );

  return (
    <MenuPrimitive.Item
      ref={highlightedRef}
      label={label}
      closeOnClick={closeOnClick}
      nativeButton={nativeButton}
      disabled={disabled}
      id={id}
      data-slot="menu-item"
      {...props}
    />
  );
}

type MenuCheckboxItemProps = Omit<
  React.ComponentProps<typeof MenuPrimitive.CheckboxItem>,
  'render'
>;

function MenuCheckboxItem({
  label,
  defaultChecked,
  checked,
  onCheckedChange,
  disabled,
  closeOnClick,
  nativeButton,
  id,
  ...props
}: MenuCheckboxItemProps) {
  const { setHighlightedValue } = useMenuActiveValue();
  const [, highlightedRef] = useDataState<HTMLDivElement>(
    'highlighted',
    undefined,
    (value) => {
      if (value === true) {
        const el = highlightedRef.current;
        const v = el?.dataset.value || el?.id || null;
        if (v) setHighlightedValue(v);
      }
    },
  );
  return (
    <MenuPrimitive.CheckboxItem
      ref={highlightedRef}
      label={label}
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      closeOnClick={closeOnClick}
      nativeButton={nativeButton}
      id={id}
      data-slot="menu-checkbox-item"
      {...props}
    />
  );
}

type MenuCheckboxItemIndicatorProps = Omit<
  React.ComponentProps<typeof MenuPrimitive.CheckboxItemIndicator>,
  'render'
> &
  HTMLMotionProps<'div'>;

function MenuCheckboxItemIndicator({
  keepMounted,
  ...props
}: MenuCheckboxItemIndicatorProps) {
  return (
    <MenuPrimitive.CheckboxItemIndicator
      data-slot="menu-checkbox-item-indicator"
      keepMounted={keepMounted}
      render={
        <motion.div data-slot="menu-checkbox-item-indicator" {...props} />
      }
    />
  );
}

type MenuRadioGroupProps = React.ComponentProps<
  typeof MenuPrimitive.RadioGroup
>;

function MenuRadioGroup(props: MenuRadioGroupProps) {
  return <MenuPrimitive.RadioGroup data-slot="menu-radio-group" {...props} />;
}

type MenuRadioItemProps = Omit<
  React.ComponentProps<typeof MenuPrimitive.RadioItem>,
  'render'
>;

function MenuRadioItem({
  value,
  disabled,
  label,
  closeOnClick,
  nativeButton,
  id,
  ...props
}: MenuRadioItemProps) {
  const { setHighlightedValue } = useMenuActiveValue();
  const [, highlightedRef] = useDataState<HTMLDivElement>(
    'highlighted',
    undefined,
    (value) => {
      if (value === true) {
        const el = highlightedRef.current;
        const v = el?.dataset.value || el?.id || null;
        if (v) setHighlightedValue(v);
      }
    },
  );
  return (
    <MenuPrimitive.RadioItem
      ref={highlightedRef}
      value={value}
      disabled={disabled}
      label={label}
      closeOnClick={closeOnClick}
      nativeButton={nativeButton}
      id={id}
      data-slot="menu-radio-item"
      {...props}
    />
  );
}

type MenuRadioItemIndicatorProps = Omit<
  React.ComponentProps<typeof MenuPrimitive.RadioItemIndicator>,
  'render'
> &
  HTMLMotionProps<'div'>;

function MenuRadioItemIndicator({
  keepMounted,
  ...props
}: MenuRadioItemIndicatorProps) {
  return (
    <MenuPrimitive.RadioItemIndicator
      data-slot="menu-radio-item-indicator"
      keepMounted={keepMounted}
      render={<motion.div data-slot="menu-radio-item-indicator" {...props} />}
    />
  );
}

type MenuShortcutProps = React.ComponentProps<'span'>;

function MenuShortcut(props: MenuShortcutProps) {
  return <span data-slot="menu-shortcut" {...props} />;
}

type MenuArrowProps = React.ComponentProps<typeof MenuPrimitive.Arrow>;

function MenuArrow(props: MenuArrowProps) {
  return <MenuPrimitive.Arrow data-slot="menu-arrow" {...props} />;
}

type MenuSeparatorProps = React.ComponentProps<typeof MenuPrimitive.Separator>;

function MenuSeparator(props: MenuSeparatorProps) {
  return <MenuPrimitive.Separator data-slot="menu-separator" {...props} />;
}

export {
  Menu,
  MenuTrigger,
  MenuPortal,
  MenuPositioner,
  MenuPopup,
  MenuArrow,
  MenuItem,
  MenuCheckboxItem,
  MenuCheckboxItemIndicator,
  MenuRadioGroup,
  MenuRadioItem,
  MenuRadioItemIndicator,
  MenuGroup,
  MenuGroupLabel,
  MenuSeparator,
  MenuShortcut,
  MenuHighlight,
  MenuHighlightItem,
  MenuSubmenu,
  MenuSubmenuTrigger,
  useMenuActiveValue,
  useMenu,
  type MenuProps,
  type MenuTriggerProps,
  type MenuPortalProps,
  type MenuPositionerProps,
  type MenuPopupProps,
  type MenuArrowProps,
  type MenuItemProps,
  type MenuCheckboxItemProps,
  type MenuCheckboxItemIndicatorProps,
  type MenuRadioItemProps,
  type MenuRadioItemIndicatorProps,
  type MenuRadioGroupProps,
  type MenuGroupProps,
  type MenuGroupLabelProps,
  type MenuSeparatorProps,
  type MenuShortcutProps,
  type MenuHighlightProps,
  type MenuHighlightItemProps,
  type MenuSubmenuProps,
  type MenuSubmenuTriggerProps,
  type MenuActiveValueContextType,
  type MenuContextType,
};
