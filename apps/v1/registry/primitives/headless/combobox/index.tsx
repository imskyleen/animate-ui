'use client';

import * as React from 'react';
import {
  Combobox as ComboboxPrimitive,
  ComboboxInput as ComboboxInputPrimitive,
  ComboboxButton as ComboboxButtonPrimitive,
  ComboboxOptions as ComboboxOptionsPrimitive,
  ComboboxOption as ComboboxOptionPrimitive,
  type ComboboxProps as ComboboxPrimitiveProps,
  type ComboboxInputProps as ComboboxInputPrimitiveProps,
  type ComboboxButtonProps as ComboboxButtonPrimitiveProps,
  type ComboboxOptionsProps as ComboboxOptionsPrimitiveProps,
  type ComboboxOptionProps as ComboboxOptionPrimitiveProps,
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

type ComboboxContextType = {
  isOpen: boolean;
};

const [ComboboxProvider, useCombobox] =
  getStrictContext<ComboboxContextType>('ComboboxContext');

type ComboboxProps<
  TValue = unknown,
  TMultiple extends boolean | undefined = false,
  TTag extends React.ElementType = typeof React.Fragment,
> = ComboboxPrimitiveProps<TValue, TMultiple, TTag> & {
  as?: TTag;
};

function Combobox<
  TValue,
  TMultiple extends boolean | undefined = false,
  TTag extends React.ElementType = typeof React.Fragment,
>({ children, ...props }: ComboboxProps<TValue, TMultiple, TTag>) {
  return (
    <ComboboxPrimitive
      {...(props as ComboboxPrimitiveProps<
        TValue,
        TMultiple,
        typeof React.Fragment
      >)}
    >
      {(bag) => (
        // A Fragment, so Headless UI renders the default Fragment root without
        // trying to forward its props onto our provider.
        <React.Fragment>
          <ComboboxProvider value={{ isOpen: bag.open }}>
            <ReducedMotionConfig>
              {typeof children === 'function' ? children(bag) : children}
            </ReducedMotionConfig>
          </ComboboxProvider>
        </React.Fragment>
      )}
    </ComboboxPrimitive>
  );
}

type ComboboxInputProps<
  TTag extends React.ElementType = 'input',
  TType = string,
> = ComboboxInputPrimitiveProps<TTag, TType> & {
  as?: TTag;
};

function ComboboxInput<
  TTag extends React.ElementType = 'input',
  TType = string,
>(props: ComboboxInputProps<TTag, TType>) {
  return <ComboboxInputPrimitive data-slot="combobox-input" {...props} />;
}

type ComboboxButtonProps<TTag extends React.ElementType = 'button'> =
  ComboboxButtonPrimitiveProps<TTag> & {
    as?: TTag;
  };

function ComboboxButton<TTag extends React.ElementType = 'button'>(
  props: ComboboxButtonProps<TTag>,
) {
  return <ComboboxButtonPrimitive data-slot="combobox-button" {...props} />;
}

type ComboboxOptionsProps<TTag extends React.ElementType = 'div'> = Omit<
  ComboboxOptionsPrimitiveProps<TTag>,
  'transition' | 'static' | 'unmount'
> &
  Omit<HTMLMotionProps<'div'>, 'children'> & {
    transition?: Transition;
    as?: TTag;
  };

// Filtering is keyboard-driven and high frequency: options appear and
// disappear instantly, only the list itself animates in and out. While it
// exits, AnimatePresence keeps the last rendered options, so resetting the
// query in `onClose` doesn't flash the unfiltered list.
function ComboboxOptions<TTag extends React.ElementType = 'div'>(
  props: ComboboxOptionsProps<TTag>,
) {
  const {
    transition = motionTransition.dropdown,
    as = motion.div,
    ...rest
  } = props;

  const { isOpen } = useCombobox();
  // Rendered inside the Combobox's ReducedMotionConfig.
  const reduce = useShouldReduceMotion();
  const hidden = {
    opacity: 0,
    transform: reduce ? 'scale(1)' : `scale(${scale.enter})`,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <ComboboxOptionsPrimitive
          data-slot="combobox-options"
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

// No animated highlight: arrow keys move it, and keyboard navigation stays
// instant. Style `data-focus` instead.
type ComboboxOptionProps<
  TTag extends React.ElementType = 'div',
  TType = unknown,
> = ComboboxOptionPrimitiveProps<TTag, TType> & {
  as?: TTag;
};

function ComboboxOption<
  TTag extends React.ElementType = 'div',
  TType = unknown,
>(props: ComboboxOptionProps<TTag, TType>) {
  return <ComboboxOptionPrimitive data-slot="combobox-option" {...props} />;
}

export {
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
  useCombobox,
  type ComboboxProps,
  type ComboboxInputProps,
  type ComboboxButtonProps,
  type ComboboxOptionsProps,
  type ComboboxOptionProps,
  type ComboboxContextType,
};
