'use client';

import * as React from 'react';
import {
  Menu as MenuPrimitive,
  MenuItem as MenuItemPrimitive,
  MenuSection as MenuSectionPrimitive,
  type MenuItemProps as MenuItemPrimitiveProps,
  type MenuItemRenderProps,
  type MenuProps as MenuPrimitiveProps,
  type MenuSectionProps as MenuSectionPrimitiveProps,
} from 'react-aria-components';

import { mergeRefs } from '../../../internal/anchored';
import {
  IndicatorLayoutContext,
  IndicatorModeContext,
} from '../../../internal/aria-indicator';
import {
  HighlightedItem,
  type ItemRender,
} from '../../../internal/aria-item-highlight';
import { HighlightScope } from '../../../internal/item-highlight';
import { PickContext } from '../../../internal/item-indicator';

// Same API as React Aria's Menu, MenuSection and MenuItem: the menus of
// MenuTrigger (dropdown and context menus) and SubmenuTrigger. React Aria has
// no Animate UI v1 counterpart: the items move like the Radix UI and Base UI
// menus'.
//
// One highlight glides behind the focused item, the one React Aria marks
// `data-focused` (the pointer and the arrow keys move it alike), like v1's
// menu highlight (internal/item-highlight). It goes into submenus, whose Menu
// shares their root menu's highlight, and stays on the last item when the
// pointer leaves the menu. It wears the item's own focused background, read
// from your styles; a submenu trigger's background is cleared while its
// submenu is open, the highlight having moved into it.
//
// A SelectionIndicator inside an item (the list-box primitive's) is its check:
// a multiple selection's draws itself and erases itself, like a checkbox's; a
// single selection's glides to the chosen item, between the items of its
// Menu or MenuSection. Choosing an item that closes the menu (a single
// selection's, from the pointer or Enter) holds the menu still for 150ms
// while its check moves (the Popover waits).
//
// Items are collection items: the highlight goes through their `render` prop
// (internal/aria-item-highlight).

/** React Aria's props. */
type MenuProps<T> = MenuPrimitiveProps<T>;

/** The popovers React Aria opens for menus. */
const MENU_POPOVER =
  '[data-trigger="MenuTrigger"], [data-trigger="SubmenuTrigger"]';

/** How far a menu reaches into its popover's padding (px), and its own. */
type Reach = {
  left: number;
  right: number;
  ownLeft: number;
  ownRight: number;
  /** Its items' width, which must not change. */
  content: number;
};

function Menu<T extends object>({
  style,
  ref,
  ...props
}: MenuProps<T> & React.RefAttributes<HTMLDivElement>) {
  // Its items' checks (a selection on the Menu itself) glide between them.
  const layoutId = React.useId();
  const menuRef = React.useRef<HTMLDivElement>(null);
  const mergedRef = React.useMemo(() => mergeRefs(ref, menuRef), [ref]);
  const [reach, setReach] = React.useState<Reach | 'none' | null>(null);

  // A popover pads its menu, which clips its items flush with them: the
  // highlight crossing into a submenu (one surface leaving, one entering) was
  // cut through both paddings. The menu reaches into its popover's padding
  // (a negative margin, as much padding on top of its own), so it clips
  // where the popover's padding ends, like the Radix UI and Base UI menus;
  // its items stay where they were.
  React.useLayoutEffect(() => {
    const menu = menuRef.current;
    const popover = menu?.parentElement;
    if (reach || !menu || !popover?.matches(MENU_POPOVER)) return;
    const outer = getComputedStyle(popover);
    const own = getComputedStyle(menu);
    const left = parseFloat(outer.paddingLeft) || 0;
    const right = parseFloat(outer.paddingRight) || 0;
    if (
      (!left && !right) ||
      (own.overflowX === 'visible' && own.overflowY === 'visible')
    )
      return setReach('none');
    const ownLeft = parseFloat(own.paddingLeft) || 0;
    const ownRight = parseFloat(own.paddingRight) || 0;
    setReach({
      left,
      right,
      ownLeft,
      ownRight,
      content: menu.clientWidth - ownLeft - ownRight,
    });
  }, [reach]);
  // A menu with a width of its own would get narrower items: it stays put.
  React.useLayoutEffect(() => {
    const menu = menuRef.current;
    if (!menu || !reach || reach === 'none') return;
    const content =
      menu.clientWidth -
      (reach.ownLeft + reach.left) -
      (reach.ownRight + reach.right);
    if (Math.abs(content - reach.content) > 0.5) setReach('none');
  }, [reach]);

  const reaching = reach && reach !== 'none' ? reach : null;
  return (
    // Mounted with its popover: each opening starts without a highlight. A
    // submenu's Menu uses its root menu's.
    <HighlightScope open shared>
      <IndicatorLayoutContext value={layoutId}>
        <MenuPrimitive
          {...props}
          ref={mergedRef}
          style={(renderProps) => ({
            // The highlight goes under the items' content, above the menu's
            // background: the menu is its own stacking context.
            isolation: 'isolate',
            ...(reaching && {
              marginLeft: -reaching.left,
              marginRight: -reaching.right,
              paddingLeft: reaching.ownLeft + reaching.left,
              paddingRight: reaching.ownRight + reaching.right,
            }),
            ...(typeof style === 'function' ? style(renderProps) : style),
          })}
        />
      </IndicatorLayoutContext>
    </HighlightScope>
  );
}

/** React Aria's props. */
type MenuSectionProps<T> = MenuSectionPrimitiveProps<T>;

/** Its own selection: its items' checks glide between them. */
function MenuSection<T extends object>(
  props: MenuSectionProps<T> & React.RefAttributes<HTMLElement>,
) {
  const layoutId = React.useId();
  return (
    <IndicatorLayoutContext value={layoutId}>
      <MenuSectionPrimitive {...props} />
    </IndicatorLayoutContext>
  );
}

/** React Aria's props. */
type MenuItemProps<T = object> = MenuItemPrimitiveProps<T>;

type ClickProps = { onClick?: (event: React.MouseEvent<HTMLElement>) => void };

function MenuItem<T extends object>({
  render,
  ...props
}: MenuItemProps<T> & React.RefAttributes<HTMLDivElement>) {
  const picks = React.use(PickContext);
  return (
    <MenuItemPrimitive
      {...props}
      render={(domProps, values) => {
        const own = domProps as ClickProps;
        return (
          // Its check reads its selection mode.
          <IndicatorModeContext value={values.selectionMode}>
            <HighlightedItem
              domProps={{
                ...own,
                // React Aria closes the menu in its click (pointer, Enter):
                // the pick is marked first when the check moves. A multiple
                // selection's draws or erases itself; a single one's glides
                // from the one shown.
                onClick: (event: React.MouseEvent<HTMLElement>) => {
                  const { selectionMode, isSelected } = values;
                  if (
                    selectionMode === 'multiple' ||
                    (selectionMode === 'single' &&
                      !isSelected &&
                      picks?.hasCheck())
                  )
                    picks?.markPick();
                  own.onClick?.(event);
                },
              }}
              values={values}
              render={render as ItemRender<MenuItemRenderProps> | undefined}
            />
          </IndicatorModeContext>
        );
      }}
    />
  );
}

export {
  Menu,
  MenuSection,
  MenuItem,
  type MenuProps,
  type MenuSectionProps,
  type MenuItemProps,
};
