'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type Search01Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: { rotate: 0 },
      animate: {
        transformOrigin: 'bottom right',
        rotate: [0, 17, -10, 5, -1, 0],
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
    },
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
  find: {
    group: {
      initial: { x: 0, y: 0 },
      animate: {
        x: [0, '-15%', 0, 0],
        y: [0, 0, '-15%', 0],
        transition: { duration: 1, ease: 'easeInOut' },
      },
    },
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: Search01Props) {
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
      variants={variants.group}
      initial="initial"
      animate={controls}
      {...props}
    >
      <motion.path
        d="M17 17L21 21"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19C15.4183 19 19 15.4183 19 11Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Search01(props: Search01Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Search01,
  Search01 as Search01Icon,
  type Search01Props,
  type Search01Props as Search01IconProps,
};
