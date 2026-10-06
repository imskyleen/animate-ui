'use client';

import * as React from 'react';
import {
  ListBox as ListBoxPrimitive,
  ListBoxItem as ListBoxItemPrimitive,
  ListStateContext,
  SelectionIndicator as SelectionIndicatorPrimitive,
  SelectionIndicatorContext,
  useContextProps,
  useRenderProps,
  useSlottedContext,
  type ListBoxItemProps as ListBoxItemPrimitiveProps,
  type ListBoxItemRenderProps,
  type ListBoxProps as ListBoxPrimitiveProps,
  type SelectionIndicatorProps as SelectionIndicatorPrimitiveProps,
} from 'react-aria-components';
import { ReducedMotionConfig } from '../../../utils/motion';
import {
  IndicatorGroupContext,
  IndicatorModeContext,
} from '../../../internal/aria-indicator';
import {
  HighlightedItem,
  type ItemRender,
} from '../../../internal/aria-item-highlight';
import { HighlightScope } from '../../../internal/item-highlight';
import {
  ItemCheck,
  useCheckGroup,
  type CheckGroup,
  type ItemCheckAnimationProps,
} from '../../../internal/item-indicator';

// Same API as React Aria's ListBox, ListBoxItem and SelectionIndicator: the
// list under Select and ComboBox. React Aria has no Animate UI v1
// counterpart: the list moves like the Radix UI and Base UI selects and
// comboboxes.
//
// - One highlight glides behind the focused item, the one React Aria marks
//   `data-focused` (the pointer and the arrow keys move it alike), like v1's
//   menu highlight (internal/item-highlight). It wears the item's own focused
//   background, read from your styles.
// - A SelectionIndicator inside an item (the check), here or in Animate UI's
//   Menu: it draws itself when the item is selected and erases itself when
//   it's deselected, like a checkbox's check; with `pop`, it pops in and out,
//   and a single selection's check glides to the chosen item on a quick
//   spring. A closing list holds still while it does (the Popover waits for
//   it).
//
// Items are collection items: the highlight goes through their `render` prop
// (internal/aria-item-highlight).

/** React Aria's props. */
type ListBoxProps<T> = ListBoxPrimitiveProps<T>;

function ListBox<T extends object>({
  style,
  ...props
}: ListBoxProps<T> & React.RefAttributes<HTMLDivElement>) {
  const group = useCheckGroup();

  return (
    <IndicatorGroupContext value={group}>
      {/* Mounted with its popover: each opening starts without a highlight. */}
      <HighlightScope open>
        <ListBoxPrimitive
          {...props}
          style={(renderProps) => ({
            // The highlight goes under the items' content, above the list's
            // background: the list is its own stacking context.
            isolation: 'isolate',
            ...(typeof style === 'function' ? style(renderProps) : style),
          })}
        />
      </HighlightScope>
    </IndicatorGroupContext>
  );
}

/** React Aria's props. */
type ListBoxItemProps<T = object> = ListBoxItemPrimitiveProps<T>;

function ListBoxItem<T extends object>({
  render,
  ...props
}: ListBoxItemProps<T> & React.RefAttributes<HTMLDivElement>) {
  return (
    <ListBoxItemPrimitive
      {...props}
      render={(domProps, values) => (
        <HighlightedItem
          domProps={domProps}
          values={values}
          render={render as ItemRender<ListBoxItemRenderProps> | undefined}
        />
      )}
    />
  );
}

/** React Aria's props, plus Animate UI's `animation` and `transition`. */
type SelectionIndicatorProps = SelectionIndicatorPrimitiveProps &
  ItemCheckAnimationProps;

/**
 * Animated inside Animate UI's ListBox and Menu, where it's rendered on every
 * item (a check rendered only while its item is selected can't hide itself:
 * it glides from where it was with `pop`, and goes at once with `draw`).
 * Anywhere else (a Tab, a ToggleButton, React Aria's own ListBox or Menu),
 * it's React Aria's.
 */
function SelectionIndicator({
  animation,
  transition,
  ...props
}: SelectionIndicatorProps & React.RefAttributes<HTMLDivElement>) {
  const group = React.use(IndicatorGroupContext);
  const item = useSlottedContext(SelectionIndicatorContext);
  if (!group || props.render) {
    // React Aria's, shown on the selected item only. A SelectValue renders
    // the chosen item's content again in the trigger, out of any list and
    // unselected: React Aria's own would throw there.
    const selected = props.isSelected ?? item?.isSelected;
    return selected ? <SelectionIndicatorPrimitive {...props} /> : null;
  }
  return (
    <ReducedMotionConfig>
      <AnimatedIndicator
        {...props}
        group={group}
        animation={animation}
        transition={transition}
      />
    </ReducedMotionConfig>
  );
}

type AnimatedIndicatorProps = SelectionIndicatorProps &
  React.RefAttributes<HTMLDivElement> & { group: CheckGroup };

// Inside ReducedMotionConfig, so useShouldReduceMotion() sees it.
function AnimatedIndicator({
  group,
  animation,
  transition,
  ref,
  ...ownProps
}: AnimatedIndicatorProps) {
  // The item tells it whether it's selected.
  const [props, mergedRef] = useContextProps(
    ownProps,
    ref,
    SelectionIndicatorContext,
  );
  const { isSelected, className, style, children, ...domProps } = props;
  const state = React.use(ListStateContext);
  // A menu item says its selection mode; a list, its state.
  const mode =
    React.use(IndicatorModeContext) ?? state?.selectionManager.selectionMode;
  const multiple = mode === 'multiple';
  const renderProps = useRenderProps({
    className,
    style,
    children,
    defaultClassName: 'react-aria-SelectionIndicator',
    values: { isEntering: false, isExiting: false },
  });

  return (
    // Kept mounted: it hides itself when deselected, and leaves with the list
    // as it is.
    <ItemCheck
      {...(domProps as React.ComponentProps<'span'>)}
      ref={mergedRef as React.Ref<HTMLSpanElement>}
      className={renderProps.className}
      style={renderProps.style}
      as="div"
      multiple={multiple}
      group={multiple ? null : group}
      checked={Boolean(isSelected)}
      animation={animation}
      transition={transition}
    >
      {renderProps.children}
    </ItemCheck>
  );
}

export {
  ListBox,
  ListBoxItem,
  SelectionIndicator,
  type ListBoxProps,
  type ListBoxItemProps,
  type SelectionIndicatorProps,
};
