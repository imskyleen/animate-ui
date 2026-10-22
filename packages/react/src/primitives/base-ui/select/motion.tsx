'use client';

import * as React from 'react';
import { mergeProps } from '@base-ui/react/merge-props';
import { motion, type HTMLMotionProps, type Transition } from 'motion/react';

import {
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import {
  HIDDEN_SCALE,
  MENU_TRANSITION,
  mergeRefs,
} from '../../../internal/anchored';
import {
  HighlightScope,
  useItemHighlight,
  withHighlight,
} from '../../../internal/item-highlight';
import {
  staggerFromClosed,
  useStaggerTiming,
} from '../../../internal/stagger';
import {
  CheckRegistryContext,
  ItemCheck,
  usePickHold,
  useCheckGroup,
  useCheckRegistry,
  type CheckGroup,
  type ItemCheckAnimationProps,
  type Picked,
  type RegisterCheck,
} from '../../../internal/item-indicator';

type RootMotion = {
  unmount: () => void;
  multiple: boolean;
  picked: Picked;
  registerCheck: RegisterCheck;
};

type OpenChangeDetails = {
  reason: string;
  isCanceled: boolean;
  event?: Event;
};

type PopupAnimationProps = {
  transition?: Transition;
  exitTransition?: Transition;
};

type IndicatorAnimationProps = ItemCheckAnimationProps;

const IndicatorGroupContext = React.createContext<CheckGroup | null>(null);

function checkChanges(
  details: OpenChangeDetails,
  checkOf: (item: Element) => Picked,
): Picked {
  if (details.reason !== 'item-press') return false;
  const target = details.event?.target;
  const item =
    target instanceof Element ? target.closest('[role="option"]') : null;
  return (
    item !== null &&
    item.getAttribute('aria-selected') !== 'true' &&
    checkOf(item)
  );
}

function useRootMotion<
  Actions extends { unmount: () => void },
  Details extends OpenChangeDetails,
>(
  actionsRef: React.RefObject<Actions | null> | undefined,
  multiple: boolean,
  onOpenChange: ((open: boolean, eventDetails: Details) => void) | undefined,
) {
  const internalRef = React.useRef<Actions | null>(null);
  React.useImperativeHandle(
    actionsRef,
    () => ({ unmount: () => internalRef.current?.unmount() }) as Actions,
    [],
  );
  const unmount = React.useCallback(() => internalRef.current?.unmount(), []);
  const { registerCheck, checkOf } = useCheckRegistry();
  const [picked, setPicked] = React.useState<Picked>(false);
  const handleOpenChange = (open: boolean, eventDetails: Details) => {
    onOpenChange?.(open, eventDetails);
    if (eventDetails.isCanceled) return;
    setPicked(!open && checkChanges(eventDetails, checkOf));
  };
  const context = React.useMemo<RootMotion>(
    () => ({ unmount, multiple, picked, registerCheck }),
    [unmount, multiple, picked, registerCheck],
  );
  return [internalRef, context, handleOpenChange] as const;
}

type PopupRenderProps = React.HTMLAttributes<HTMLElement> & {
  ref?: React.Ref<HTMLElement>;
};

function usePopupRender(
  root: RootMotion | null,
  { transition, exitTransition }: PopupAnimationProps,
) {
  const reduce = useShouldReduceMotion();
  const enter = useTempoTransition(transition ?? MENU_TRANSITION);
  const exit = useTempoTransition(
    exitTransition ?? transition ?? MENU_TRANSITION,
  );
  const hold = usePickHold();
  const exitDelay = (exit as { delay?: number }).delay ?? 0;
  const held: Transition =
    root?.picked && !reduce
      ? { ...exit, delay: exitDelay + hold(root.picked) }
      : exit;
  const group = useCheckGroup();
  const shownRef = React.useRef(false);
  const nodeRef = React.useRef<HTMLElement | null>(null);
  const staggerRef = React.useRef<(() => void) | null>(null);
  const stagger = useStaggerTiming();

  return (
    { children, ...renderProps }: PopupRenderProps,
    state: { open: boolean; side: string },
  ) => {
    const { open } = state;
    const aligned = state.side === 'none';
    const hidden = aligned
      ? { opacity: 0 }
      : { opacity: 0, scale: reduce ? 1 : HIDDEN_SCALE.menu };
    const visible = aligned ? { opacity: 1 } : { opacity: 1, scale: 1 };

    return (
      <motion.div
        {...(renderProps as HTMLMotionProps<'div'>)}
        ref={mergeRefs(renderProps.ref, nodeRef)}
        initial={hidden}
        animate={
          open
            ? { ...visible, transition: enter }
            : { ...hidden, transition: held }
        }
        onAnimationStart={() => {
          if (!open) {
            staggerRef.current?.();
            staggerRef.current = null;
            return;
          }
          shownRef.current = true;
          const node = nodeRef.current;
          if (node && !reduce)
            staggerRef.current =
              staggerFromClosed(node, stagger.current) ?? staggerRef.current;
        }}
        onAnimationComplete={() => {
          if (open || !shownRef.current) return;
          shownRef.current = false;
          root?.unmount();
        }}
        style={{
          ...renderProps.style,
          transformOrigin: aligned ? undefined : 'var(--transform-origin)',
          isolation: 'isolate',
        }}
      >
        <IndicatorGroupContext value={group}>
          <CheckRegistryContext value={root?.registerCheck ?? null}>
            <HighlightScope open={open}>{children}</HighlightScope>
          </CheckRegistryContext>
        </IndicatorGroupContext>
      </motion.div>
    );
  };
}

type ItemProps = {
  disabled?: boolean;
  children?: React.ReactNode;
  ref?: React.Ref<HTMLElement>;
};

function useHighlightedItem<P extends ItemProps>({
  disabled,
  children,
  ref,
  ...props
}: P) {
  const { ref: highlightRef, highlight } = useItemHighlight(disabled);
  const mergedRef = React.useMemo(
    () => mergeRefs(ref, highlightRef),
    [ref, highlightRef],
  );
  return {
    ...props,
    disabled,
    ref: mergedRef,
    children: withHighlight(children, highlight),
  };
}

type IndicatorRender =
  | React.ReactElement<Record<string, unknown>>
  | ((props: never, state: never) => React.ReactElement)
  | undefined;

type IndicatorMotionProps = IndicatorAnimationProps & {
  render: IndicatorRender;
  props: Record<string, unknown>;
  state: { selected: boolean };
  multiple: boolean;
};

function IndicatorMotion({
  render,
  props,
  state,
  multiple,
  animation,
  transition,
}: IndicatorMotionProps) {
  const group = React.use(IndicatorGroupContext);

  let type = 'span';
  let elementProps = props;
  if (typeof render === 'function') {
    const element = (
      render as (p: unknown, s: unknown) => React.ReactElement | null
    )(props, state);
    if (!React.isValidElement(element) || typeof element.type !== 'string')
      return element;
    type = element.type;
    elementProps = element.props as Record<string, unknown>;
  } else if (React.isValidElement(render)) {
    const merged = {
      ...mergeProps(props, render.props as Record<string, unknown>),
      ref: props.ref,
    };
    if (typeof render.type !== 'string')
      return React.cloneElement(render, merged);
    type = render.type;
    elementProps = merged;
  }

  return (
    <ItemCheck
      {...(elementProps as React.ComponentProps<'span'>)}
      as={type === 'div' ? 'div' : 'span'}
      multiple={multiple}
      group={multiple ? null : group}
      checked={state.selected}
      animation={animation}
      transition={transition}
    />
  );
}

export {
  useRootMotion,
  usePopupRender,
  useHighlightedItem,
  IndicatorMotion,
  type RootMotion,
  type PopupAnimationProps,
  type IndicatorAnimationProps,
  type IndicatorRender,
};
