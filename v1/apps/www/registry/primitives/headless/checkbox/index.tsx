'use client';

import * as React from 'react';
import {
  Checkbox as CheckboxPrimitive,
  type CheckboxProps as CheckboxPrimitiveProps,
} from '@headlessui/react';
import {
  motion,
  type SVGMotionProps,
  type HTMLMotionProps,
} from 'motion/react';

import { getStrictContext } from '@/registry/lib/get-strict-context';

type CheckboxContextType = {
  isChecked: boolean;
  isIndeterminate: boolean;
};

const [CheckboxProvider, useCheckbox] =
  getStrictContext<CheckboxContextType>('CheckboxContext');

type CheckboxProps<TTag extends React.ElementType = typeof motion.button> =
  CheckboxPrimitiveProps<TTag> &
    Omit<
      HTMLMotionProps<'button'>,
      'checked' | 'onChange' | 'defaultChecked' | 'children'
    > & {
      as?: TTag;
    };

function Checkbox<TTag extends React.ElementType = typeof motion.button>({
  children,
  ...props
}: CheckboxProps<TTag>) {
  const { as = motion.button, ...rest } = props;

  return (
    <CheckboxPrimitive
      data-slot="checkbox"
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      {...rest}
      as={as as React.ElementType}
    >
      {(bag) => (
        <CheckboxProvider
          value={{ isChecked: bag.checked, isIndeterminate: bag.indeterminate }}
        >
          {typeof children === 'function' ? children(bag) : children}
        </CheckboxProvider>
      )}
    </CheckboxPrimitive>
  );
}

type CheckboxIndicatorProps = SVGMotionProps<SVGSVGElement>;

function CheckboxIndicator(props: CheckboxIndicatorProps) {
  const { isChecked, isIndeterminate } = useCheckbox();

  return (
    <motion.svg
      data-slot="checkbox-indicator"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="3.5"
      stroke="currentColor"
      initial="unchecked"
      animate={isChecked ? 'checked' : 'unchecked'}
      {...props}
    >
      {isIndeterminate ? (
        <motion.line
          x1="5"
          y1="12"
          x2="19"
          y2="12"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: 1,
            opacity: 1,
            transition: { duration: 0.2 },
          }}
        />
      ) : (
        <motion.path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.5 12.75l6 6 9-13.5"
          variants={{
            checked: {
              pathLength: 1,
              opacity: 1,
              transition: {
                duration: 0.2,
                delay: 0.2,
              },
            },
            unchecked: {
              pathLength: 0,
              opacity: 0,
              transition: {
                duration: 0.2,
              },
            },
          }}
        />
      )}
    </motion.svg>
  );
}

export {
  Checkbox,
  CheckboxIndicator,
  useCheckbox,
  type CheckboxProps,
  type CheckboxIndicatorProps,
  type CheckboxContextType,
};
