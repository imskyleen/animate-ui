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
  IndicatorGroupContext,
  IndicatorModeContext,
} from '../../../internal/aria-indicator';
import {
  HighlightedItem,
  type ItemRender,
} from '../../../internal/aria-item-highlight';
import { HighlightScope } from '../../../internal/item-highlight';
import { PickContext, useCheckGroup } from '../../../internal/item-indicator';

type MenuProps<T> = MenuPrimitiveProps<T>;

const MENU_POPOVER =
  '[data-trigger="MenuTrigger"], [data-trigger="SubmenuTrigger"]';

type Reach = {
  left: number;
  right: number;
  ownLeft: number;
  ownRight: number;
  content: number;
};

function Menu<T extends object>({
  style,
  ref,
  ...props
}: MenuProps<T> & React.RefAttributes<HTMLDivElement>) {
  const group = useCheckGroup();
  const menuRef = React.useRef<HTMLDivElement>(null);
  const mergedRef = React.useMemo(() => mergeRefs(ref, menuRef), [ref]);
  const [reach, setReach] = React.useState<Reach | 'none' | null>(null);

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
    <HighlightScope open shared>
      <IndicatorGroupContext value={group}>
        <MenuPrimitive
          {...props}
          ref={mergedRef}
          style={(renderProps) => ({
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
      </IndicatorGroupContext>
    </HighlightScope>
  );
}

type MenuSectionProps<T> = MenuSectionPrimitiveProps<T>;

function MenuSection<T extends object>(
  props: MenuSectionProps<T> & React.RefAttributes<HTMLElement>,
) {
  const group = useCheckGroup();
  return (
    <IndicatorGroupContext value={group}>
      <MenuSectionPrimitive {...props} />
    </IndicatorGroupContext>
  );
}

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
          <IndicatorModeContext value={values.selectionMode}>
            <HighlightedItem
              domProps={{
                ...own,
                onClick: (event: React.MouseEvent<HTMLElement>) => {
                  const { selectionMode, isSelected } = values;
                  const look = picks?.checkOf(event.currentTarget);
                  if (
                    (selectionMode === 'multiple' ||
                      (selectionMode === 'single' && !isSelected)) &&
                    look
                  )
                    picks?.markPick(look);
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
