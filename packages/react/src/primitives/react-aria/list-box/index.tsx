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
import { mergeRefs } from '../../../internal/anchored';
import {
  HighlightScope,
  useItemHighlight,
  withHighlight,
} from '../../../internal/item-highlight';
import {
  CHECK_TRANSITION,
  GLIDE_TRANSITION,
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
//   selection, it glides to the chosen item, like v1's radio indicator; with
//   a multiple selection, it pops in from half its size with a fade, like
//   v1's checkbox check, and goes at once when the item is deselected.
//
// Items are collection items: React Aria renders the real element later, from
// the props the item gave the collection. So the highlight is rendered through
// the item's `render` prop, which React Aria calls with the element's props.

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

type ItemRender = NonNullable<ListBoxItemProps['render']>;
type ItemDOMProps = Parameters<ItemRender>[0];

function ListBoxItem<T extends object>({
  render,
  ...props
}: ListBoxItemProps<T> & React.RefAttributes<HTMLDivElement>) {
  return (
    <ListBoxItemPrimitive
      {...props}
      render={(domProps, values) => (
        <HighlightedItem domProps={domProps} values={values} render={render} />
      )}
    />
  );
}

type HighlightedItemProps = {
  domProps: ItemDOMProps;
  values: ListBoxItemRenderProps;
  render: ItemRender | undefined;
};

/** The element React Aria asked for, with the highlight inside. */
function HighlightedItem({ domProps, values, render }: HighlightedItemProps) {
  const { ref: highlightRef, highlight } = useItemHighlight(values.isDisabled, {
    attribute: 'data-focused',
  });
  const ownRef = (domProps as { ref?: React.Ref<HTMLElement> }).ref;
  const ref = React.useMemo(
    () => mergeRefs(ownRef, highlightRef),
    [ownRef, highlightRef],
  );
  const props = {
    ...domProps,
    ref,
    children: withHighlight(domProps.children, highlight),
  } as ItemDOMProps;

  if (render) return render(props, values);
  // A link item renders an `<a>`, like React Aria's.
  if ('href' in props && props.href)
    return <a {...(props as React.ComponentProps<'a'>)} />;
  return <div {...(props as React.ComponentProps<'div'>)} />;
}

/** React Aria's props, plus Animate UI's `transition`. */
type SelectionIndicatorProps = SelectionIndicatorPrimitiveProps & {
  /**
   * Transition of the indicator gliding to the chosen item (single
   * selection), or popping in (multiple selection). Defaults to Motion's
   * defaults, as v1's radio and checkbox indicators.
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
