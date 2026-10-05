'use client';

import * as React from 'react';
import {
  ListBox as ListBoxPrimitive,
  ListBoxItem as ListBoxItemPrimitive,
  ListStateContext,
  SelectionIndicator as SelectionIndicatorPrimitive,
  SelectionIndicatorContext,
  SelectStateContext,
  useContextProps,
  useRenderProps,
  type ListBoxItemProps as ListBoxItemPrimitiveProps,
  type ListBoxItemRenderProps,
  type ListBoxProps as ListBoxPrimitiveProps,
  type SelectionIndicatorProps as SelectionIndicatorPrimitiveProps,
} from 'react-aria-components';
import {
  motion,
  PresenceContext,
  type HTMLMotionProps,
  type Transition,
} from 'motion/react';

import {
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import {
  HighlightedItem,
  type ItemRender,
} from '../../../internal/aria-item-highlight';
import { HighlightScope } from '../../../internal/item-highlight';
import {
  CHECK_TRANSITION,
  GLIDE_TRANSITION,
  useRegisterCheck,
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
// - A SelectionIndicator inside an item (the check): with a single
//   selection, it glides to the chosen item on a quick spring while the list
//   holds still (the Popover waits for it before closing); with a multiple
//   selection, it pops in from half its size with a fade, like v1's checkbox
//   check, and goes at once when the item is deselected.
//
// Items are collection items: the highlight goes through their `render` prop
// (internal/aria-item-highlight).

/** The ListBox's checks share it: a single selection's check glides. */
const IndicatorLayoutContext = React.createContext<string | null>(null);

/** React Aria's props. */
type ListBoxProps<T> = ListBoxPrimitiveProps<T>;

function ListBox<T extends object>({
  style,
  ...props
}: ListBoxProps<T> & React.RefAttributes<HTMLDivElement>) {
  const layoutId = React.useId();

  return (
    <IndicatorLayoutContext value={layoutId}>
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
    </IndicatorLayoutContext>
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

/** React Aria's props, plus Animate UI's `transition`. */
type SelectionIndicatorProps = SelectionIndicatorPrimitiveProps & {
  /**
   * Transition of the indicator gliding to the chosen item (single
   * selection), or popping in (multiple selection). Defaults to a spring
   * (stiffness 500, damping 40), and Motion's defaults for the pop, as v1's
   * checkbox indicator.
   */
  transition?: Transition;
};

/**
 * Animated inside Animate UI's ListBox. Anywhere else (a Tab, a ToggleButton,
 * React Aria's own ListBox), it's React Aria's.
 */
function SelectionIndicator({
  transition,
  ...props
}: SelectionIndicatorProps & React.RefAttributes<HTMLDivElement>) {
  const layoutId = React.use(IndicatorLayoutContext);
  const select = React.use(SelectStateContext);
  const list = React.use(ListStateContext);
  // A SelectValue renders the chosen item's content again, in the trigger:
  // no check there (React Aria's own would throw, out of any list).
  if (select && !list) return null;
  if (!layoutId || props.render)
    return <SelectionIndicatorPrimitive {...props} />;
  return (
    <ReducedMotionConfig>
      <AnimatedIndicator
        {...props}
        layoutId={layoutId}
        transition={transition}
      />
    </ReducedMotionConfig>
  );
}

type AnimatedIndicatorProps = SelectionIndicatorProps &
  React.RefAttributes<HTMLDivElement> & { layoutId: string };

// Inside ReducedMotionConfig, so useShouldReduceMotion() sees it.
function AnimatedIndicator({
  layoutId,
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
  const multiple = state?.selectionManager.selectionMode === 'multiple';
  // A single selection's shown check: choosing another item holds the list.
  useRegisterCheck(!multiple && Boolean(isSelected));
  const reduce = useShouldReduceMotion();
  const check = useTempoTransition(transition ?? CHECK_TRANSITION);
  const glide = useTempoTransition(transition ?? GLIDE_TRANSITION);
  const renderProps = useRenderProps({
    className,
    style,
    children,
    defaultClassName: 'react-aria-SelectionIndicator',
    values: { isEntering: false, isExiting: false },
  });

  // Deselected: gone at once.
  if (!isSelected) return null;

  const elementProps = {
    ...(domProps as HTMLMotionProps<'div'>),
    ref: mergedRef,
    className: renderProps.className,
    style: renderProps.style,
  };

  if (!multiple) {
    return (
      // Out of the popover's exit: it doesn't wait for the glide to end
      // before it unmounts.
      <PresenceContext value={null}>
        <motion.div
          {...elementProps}
          layoutId={layoutId}
          // One check moving, not two crossfading.
          layoutCrossfade={false}
          transition={glide}
        >
          {renderProps.children}
        </motion.div>
      </PresenceContext>
    );
  }
  return (
    <motion.div
      {...elementProps}
      initial={{ opacity: 0, scale: reduce ? 1 : 0.5 }}
      animate={{ opacity: 1, scale: 1, transition: check }}
    >
      {renderProps.children}
    </motion.div>
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
