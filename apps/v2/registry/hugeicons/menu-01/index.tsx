'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type Menu01Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    line1: {
      initial: {
        d: 'M4 5L20 5',
        opacity: 1,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        d: 'M6.34315 6.34315L17.6569 17.6569',
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
    line2: {
      initial: {
        d: 'M4 12L20 12',
        opacity: 1,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        d: 'M12 12L12 12',
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
    line3: {
      initial: {
        d: 'M4 19L20 19',
        opacity: 1,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        d: 'M6.34315 17.6569L17.6569 6.34315',
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: Menu01Props) {
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
        d="M4 5L20 5"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.line1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M4 12L20 12"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.line2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M4 19L20 19"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.line3}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Menu01(props: Menu01Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Menu01,
  Menu01 as Menu01Icon,
  type Menu01Props,
  type Menu01Props as Menu01IconProps,
};
