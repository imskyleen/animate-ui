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

type ListBoxProps<T> = ListBoxPrimitiveProps<T>;

function ListBox<T extends object>({
  style,
  ...props
}: ListBoxProps<T> & React.RefAttributes<HTMLDivElement>) {
  const group = useCheckGroup();

  return (
    <IndicatorGroupContext value={group}>
      <HighlightScope open>
        <ListBoxPrimitive
          {...props}
          style={(renderProps) => ({
            isolation: 'isolate',
            ...(typeof style === 'function' ? style(renderProps) : style),
          })}
        />
      </HighlightScope>
    </IndicatorGroupContext>
  );
}

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

type SelectionIndicatorProps = SelectionIndicatorPrimitiveProps &
  ItemCheckAnimationProps;

function SelectionIndicator({
  animation,
  transition,
  ...props
}: SelectionIndicatorProps & React.RefAttributes<HTMLDivElement>) {
  const group = React.use(IndicatorGroupContext);
  const item = useSlottedContext(SelectionIndicatorContext);
  if (!group || props.render) {
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

function AnimatedIndicator({
  group,
  animation,
  transition,
  ref,
  ...ownProps
}: AnimatedIndicatorProps) {
  const [props, mergedRef] = useContextProps(
    ownProps,
    ref,
    SelectionIndicatorContext,
  );
  const { isSelected, className, style, children, ...domProps } = props;
  const state = React.use(ListStateContext);
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
