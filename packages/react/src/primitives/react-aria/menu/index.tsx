'use client';

import * as React from 'react';
import {
  Menu as MenuPrimitive,
  MenuItem as MenuItemPrimitive,
  type MenuItemProps as MenuItemPrimitiveProps,
  type MenuItemRenderProps,
  type MenuProps as MenuPrimitiveProps,
} from 'react-aria-components';

import {
  HighlightedItem,
  type ItemRender,
} from '../../../internal/aria-item-highlight';
import { HighlightScope } from '../../../internal/item-highlight';

// Same API as React Aria's Menu and MenuItem: the menus of MenuTrigger
// (dropdown and context menus) and SubmenuTrigger. React Aria has no Animate
// UI v1 counterpart: the items move like the Radix UI and Base UI menus'.
//
// One highlight glides behind the focused item, the one React Aria marks
// `data-focused` (the pointer and the arrow keys move it alike), like v1's
// menu highlight (internal/item-highlight). It goes into submenus, whose Menu
// shares their root menu's highlight, and stays on the last item when the
// pointer leaves the menu. It wears the item's own focused background, read
// from your styles; a submenu trigger's background is cleared while its
// submenu is open, the highlight having moved into it.
//
// Items are collection items: the highlight goes through their `render` prop
// (internal/aria-item-highlight).

/** React Aria's props. */
type MenuProps<T> = MenuPrimitiveProps<T>;

function Menu<T extends object>({
  style,
  ...props
}: MenuProps<T> & React.RefAttributes<HTMLDivElement>) {
  return (
    // Mounted with its popover: each opening starts without a highlight. A
    // submenu's Menu uses its root menu's.
    <HighlightScope open shared>
      <MenuPrimitive
        {...props}
        style={(renderProps) => ({
          // The highlight goes under the items' content, above the menu's
          // background: the menu is its own stacking context.
          isolation: 'isolate',
          ...(typeof style === 'function' ? style(renderProps) : style),
        })}
      />
    </HighlightScope>
  );
}

/** React Aria's props. */
type MenuItemProps<T = object> = MenuItemPrimitiveProps<T>;

function MenuItem<T extends object>({
  render,
  ...props
}: MenuItemProps<T> & React.RefAttributes<HTMLDivElement>) {
  return (
    <MenuItemPrimitive
      {...props}
      render={(domProps, values) => (
        <HighlightedItem
          domProps={domProps}
          values={values}
          render={render as ItemRender<MenuItemRenderProps> | undefined}
        />
      )}
    />
  );
}

export { Menu, MenuItem, type MenuProps, type MenuItemProps };
