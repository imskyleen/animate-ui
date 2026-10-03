'use client';

import * as React from 'react';
import {
  Popover as PopoverPrimitive,
  PopoverButton as PopoverButtonPrimitive,
  PopoverPanel as PopoverPanelPrimitive,
  PopoverBackdrop as PopoverBackdropPrimitive,
  PopoverGroup as PopoverGroupPrimitive,
  type PopoverProps as PopoverPrimitiveProps,
  type PopoverButtonProps as PopoverButtonPrimitiveProps,
  type PopoverPanelProps as PopoverPanelPrimitiveProps,
  type PopoverBackdropProps as PopoverBackdropPrimitiveProps,
  type PopoverGroupProps as PopoverGroupPrimitiveProps,
} from '@headlessui/react';
import {
  AnimatePresence,
  motion,
  type HTMLMotionProps,
  type Transition,
} from 'motion/react';

import { getStrictContext } from '@/registry/lib/get-strict-context';
import {
  ReducedMotionConfig,
  scale,
  transition as motionTransition,
  useShouldReduceMotion,
} from '@/registry/lib/motion';

type PopoverContextType = {
  isOpen: boolean;
};

const [PopoverProvider, usePopover] =
  getStrictContext<PopoverContextType>('PopoverContext');

type PopoverProps<TTag extends React.ElementType = 'div'> =
  PopoverPrimitiveProps<TTag> & {
    as?: TTag;
  };

function Popover<TTag extends React.ElementType = 'div'>({
  children,
  ...props
}: PopoverProps<TTag>) {
  return (
    <PopoverPrimitive data-slot="popover" {...props}>
      {(bag) => (
        <PopoverProvider value={{ isOpen: bag.open }}>
          <ReducedMotionConfig>
            {typeof children === 'function' ? children(bag) : children}
          </ReducedMotionConfig>
        </PopoverProvider>
      )}
    </PopoverPrimitive>
  );
}

type PopoverButtonProps<TTag extends React.ElementType = 'button'> =
  PopoverButtonPrimitiveProps<TTag> & {
    as?: TTag;
  };

function PopoverButton<TTag extends React.ElementType = 'button'>(
  props: PopoverButtonProps<TTag>,
) {
  return <PopoverButtonPrimitive data-slot="popover-button" {...props} />;
}

type PopoverBackdropProps<TTag extends React.ElementType = 'div'> =
  PopoverBackdropPrimitiveProps<TTag> & {
    as?: TTag;
  };

function PopoverBackdrop<TTag extends React.ElementType = 'div'>(
  props: PopoverBackdropProps<TTag>,
) {
  return <PopoverBackdropPrimitive data-slot="popover-backdrop" {...props} />;
}

type PopoverGroupProps<TTag extends React.ElementType = 'div'> =
  PopoverGroupPrimitiveProps<TTag> & {
    as?: TTag;
  };

function PopoverGroup<TTag extends React.ElementType = 'div'>(
  props: PopoverGroupProps<TTag>,
) {
  return <PopoverGroupPrimitive data-slot="popover-group" {...props} />;
}

type PopoverPanelProps<TTag extends React.ElementType = 'div'> = Omit<
  PopoverPanelPrimitiveProps<TTag>,
  'transition'
> &
  Omit<HTMLMotionProps<'div'>, 'children'> & {
    transition?: Transition;
    as?: TTag;
  };

function PopoverPanel<TTag extends React.ElementType = 'div'>(
  props: PopoverPanelProps<TTag>,
) {
  const {
    transition = motionTransition.dropdown,
    as = motion.div,
    ...rest
  } = props;

  const { isOpen } = usePopover();
  // Rendered inside the Popover's ReducedMotionConfig.
  const reduce = useShouldReduceMotion();
  const hidden = {
    opacity: 0,
    transform: reduce ? 'scale(1)' : `scale(${scale.enter})`,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <PopoverPanelPrimitive
          data-slot="popover-panel"
          static
          as={as}
          initial={hidden}
          animate={{ opacity: 1, transform: 'scale(1)', transition }}
          exit={{ ...hidden, transition: motionTransition.exit }}
          {...rest}
        />
      )}
    </AnimatePresence>
  );
}

export {
  Popover,
  PopoverButton,
  PopoverPanel,
  PopoverBackdrop,
  PopoverGroup,
  type PopoverProps,
  type PopoverButtonProps,
  type PopoverPanelProps,
  type PopoverBackdropProps,
  type PopoverGroupProps,
};
