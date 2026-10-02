'use client';

import * as React from 'react';
import {
  Dialog as DialogPrimitive,
  DialogBackdrop as DialogBackdropPrimitive,
  DialogPanel as DialogPanelPrimitive,
  DialogTitle as DialogTitlePrimitive,
  Description as DialogDescriptionPrimitive,
  type DialogProps as DialogPrimitiveProps,
  type DialogBackdropProps as DialogBackdropPrimitiveProps,
  type DialogPanelProps as DialogPanelPrimitiveProps,
  type DialogTitleProps as DialogTitlePrimitiveProps,
  CloseButton,
  CloseButtonProps,
} from '@headlessui/react';
import {
  motion,
  AnimatePresence,
  type Transition,
  type HTMLMotionProps,
} from 'motion/react';

import {
  ReducedMotionConfig,
  scale,
  transition as motionTransition,
  useShouldReduceMotion,
} from '@/registry/lib/motion';

type DialogProps<TTag extends React.ElementType = 'div'> = Omit<
  DialogPrimitiveProps<TTag>,
  'static'
> & {
  className?: string;
  as?: TTag;
};

function Dialog<TTag extends React.ElementType = 'div'>({
  className,
  children,
  ...props
}: DialogProps<TTag>) {
  return (
    <AnimatePresence>
      {props?.open && (
        <DialogPrimitive
          data-slot="dialog"
          className={className}
          {...props}
          static
        >
          {(bag) => (
            <ReducedMotionConfig>
              {typeof children === 'function' ? children(bag) : children}
            </ReducedMotionConfig>
          )}
        </DialogPrimitive>
      )}
    </AnimatePresence>
  );
}

type DialogBackdropProps<TTag extends React.ElementType = typeof motion.div> =
  Omit<DialogBackdropPrimitiveProps<TTag>, 'transition'> &
    HTMLMotionProps<'div'> & {
      as?: TTag;
    };

function DialogBackdrop<TTag extends React.ElementType = typeof motion.div>(
  props: DialogBackdropProps<TTag>,
) {
  const { as = motion.div, transition, ...rest } = props;

  return (
    <DialogBackdropPrimitive
      data-slot="dialog-backdrop"
      as={as as React.ElementType}
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        transition: transition ?? motionTransition.modal,
      }}
      exit={{
        opacity: 0,
        transition: transition ?? motionTransition.modalExit,
      }}
      {...rest}
    />
  );
}

type DialogFlipDirection = 'top' | 'bottom' | 'left' | 'right';

type DialogPanelProps<TTag extends React.ElementType = typeof motion.div> =
  Omit<DialogPanelPrimitiveProps<TTag>, 'transition'> &
    Omit<HTMLMotionProps<'div'>, 'children'> & {
      /** Opt-in 3D flip from this edge. Default: a subtle scale. */
      from?: DialogFlipDirection;
      transition?: Transition;
      as?: TTag;
    };

function getContentTransform(
  from: DialogFlipDirection | undefined,
  progress: 'hidden' | 'visible',
) {
  const scaleValue = progress === 'hidden' ? scale.enter : 1;
  if (!from) return `scale(${scaleValue})`;

  const axis = from === 'top' || from === 'bottom' ? 'rotateX' : 'rotateY';
  const angle =
    progress === 'hidden'
      ? from === 'bottom' || from === 'left'
        ? '20deg'
        : '-20deg'
      : '0deg';
  return `perspective(500px) ${axis}(${angle}) scale(${scaleValue})`;
}

function DialogPanel<TTag extends React.ElementType = typeof motion.div>(
  props: DialogPanelProps<TTag>,
) {
  const { children, as = motion.div, from, transition, ...rest } = props;

  const reduce = useShouldReduceMotion();
  const hiddenTransform = reduce
    ? getContentTransform(from, 'visible')
    : getContentTransform(from, 'hidden');

  return (
    <DialogPanelPrimitive
      data-slot="dialog-panel"
      as={as as React.ElementType}
      initial={{ opacity: 0, transform: hiddenTransform }}
      animate={{
        opacity: 1,
        transform: getContentTransform(from, 'visible'),
        transition: transition ?? motionTransition.modal,
      }}
      exit={{
        opacity: 0,
        transform: hiddenTransform,
        transition: transition ?? motionTransition.modalExit,
      }}
      {...rest}
    >
      {(bag) => (
        <>{typeof children === 'function' ? children(bag) : children}</>
      )}
    </DialogPanelPrimitive>
  );
}

type DialogCloseProps<TTag extends React.ElementType = 'div'> =
  CloseButtonProps<TTag> & {
    as?: TTag;
  };

function DialogClose<TTag extends React.ElementType = 'button'>(
  props: DialogCloseProps<TTag>,
) {
  const { as = 'button', ...rest } = props;

  return (
    <CloseButton
      data-slot="dialog-close"
      as={as as React.ElementType}
      {...rest}
    />
  );
}

type DialogHeaderProps<TTag extends React.ElementType = 'div'> =
  React.ComponentProps<TTag> & {
    as?: TTag;
  };

function DialogHeader<TTag extends React.ElementType = 'div'>({
  as: Component = 'div',
  ...props
}: DialogHeaderProps<TTag>) {
  return <Component data-slot="dialog-header" {...props} />;
}

type DialogFooterProps<TTag extends React.ElementType = 'div'> =
  React.ComponentProps<TTag> & {
    as?: TTag;
  };

function DialogFooter({ as: Component = 'div', ...props }: DialogFooterProps) {
  return <Component data-slot="dialog-footer" {...props} />;
}

type DialogTitleProps<TTag extends React.ElementType = 'h2'> =
  DialogTitlePrimitiveProps<TTag> & {
    as?: TTag;
    className?: string;
  };

function DialogTitle<TTag extends React.ElementType = 'h2'>(
  props: DialogTitleProps<TTag>,
) {
  return <DialogTitlePrimitive data-slot="dialog-title" {...props} />;
}

type DialogDescriptionProps<TTag extends React.ElementType = 'div'> =
  React.ComponentProps<typeof DialogDescriptionPrimitive<TTag>> & {
    as?: TTag;
    className?: string;
  };

function DialogDescription<TTag extends React.ElementType = 'div'>(
  props: DialogDescriptionProps<TTag>,
) {
  return (
    <DialogDescriptionPrimitive data-slot="dialog-description" {...props} />
  );
}

export {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogClose,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  type DialogProps,
  type DialogBackdropProps,
  type DialogPanelProps,
  type DialogCloseProps,
  type DialogTitleProps,
  type DialogDescriptionProps,
  type DialogHeaderProps,
  type DialogFooterProps,
  type DialogFlipDirection,
};
