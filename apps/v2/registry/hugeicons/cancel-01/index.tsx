'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type Cancel01Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    line1: {
      initial: { rotate: 0, transition: { duration: 0.4, ease: 'easeInOut' } },
      animate: { rotate: 90, transition: { duration: 0.4, ease: 'easeInOut' } },
    },
    line2: {
      initial: {
        rotate: 0,
        transition: { duration: 0.4, ease: 'easeInOut', delay: 0.1 },
      },
      animate: {
        rotate: 90,
        transition: { duration: 0.4, ease: 'easeInOut', delay: 0.1 },
      },
    },
  } satisfies Record<string, Variants>,
  plus: {
    line1: {
      initial: { rotate: 0, scale: 1 },
      animate: {
        rotate: 45,
        scale: 0.82,
        transition: { duration: 0.3, ease: 'easeInOut', delay: 0.1 },
      },
    },
    line2: {
      initial: { rotate: 0, scale: 1 },
      animate: {
        rotate: 45,
        scale: 0.82,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: Cancel01Props) {
  const { controls } = useAnimateIconContext();
  const variants = getVariants(animations);

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      {...props}
    >
      <motion.path
        d="M18 6L6.00081 17.9992"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.line1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M17.9992 18L6 6.00085"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.line2}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Cancel01(props: Cancel01Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Cancel01,
  Cancel01 as Cancel01Icon,
  type Cancel01Props,
  type Cancel01Props as Cancel01IconProps,
};
