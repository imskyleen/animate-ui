'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type Notification01Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: { rotate: 0 },
      animate: {
        rotate: [0, 20, -10, 10, -5, 3, 0],
        transformOrigin: 'top center',
        transition: { duration: 0.9, ease: 'easeInOut' },
      },
    },
    path1: {
      initial: { x: 0 },
      animate: {
        x: [0, -3, 2.5, -2.5, 2, -1.5, 1, 0],
        transition: { duration: 1.1, ease: 'easeInOut' },
      },
    },
    path2: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: Notification01Props) {
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
        d="M15.5 18C15.5 19.933 13.933 21.5 12 21.5C10.067 21.5 8.5 19.933 8.5 18"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M19.2311 18H4.76887C3.79195 18 3 17.208 3 16.2311C3 15.762 3.18636 15.3121 3.51809 14.9803L4.12132 14.3771C4.68393 13.8145 5 13.0514 5 12.2558V9.5C5 5.63401 8.13401 2.5 12 2.5C15.866 2.5 19 5.634 19 9.5V12.2558C19 13.0514 19.3161 13.8145 19.8787 14.3771L20.4819 14.9803C20.8136 15.3121 21 15.762 21 16.2311C21 17.208 20.208 18 19.2311 18Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Notification01(props: Notification01Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Notification01,
  Notification01 as Notification01Icon,
  type Notification01Props,
  type Notification01Props as Notification01IconProps,
};
