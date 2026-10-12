'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type Copy01Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path1: {
      initial: { x: 0, y: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
      animate: {
        x: -2.5,
        y: -2.5,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
    path2: {
      initial: {
        x: 0,
        y: 0,
        opacity: 1,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        x: 2.5,
        y: 2.5,
        opacity: 0,
        transition: {
          duration: 0.3,
          ease: 'easeInOut',
          opacity: { duration: 0.15, ease: 'easeInOut' },
        },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    path1: {
      initial: { x: 0, y: 0 },
      animate: {
        x: [0, -2.5, 0],
        y: [0, -2.5, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path2: {
      initial: { x: 0, y: 0, opacity: 1 },
      animate: {
        x: [0, 2.5, 0],
        y: [0, 2.5, 0],
        opacity: [1, 0, 0, 1],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
          opacity: { duration: 0.6, times: [0, 0.25, 0.75, 1] },
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: Copy01Props) {
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
        d="M7.5 16.5C6.10355 16.5 5.40533 16.5 4.84402 16.3036C3.83866 15.9518 3.0482 15.1613 2.69641 14.156C2.5 13.5947 2.5 12.8964 2.5 11.5V9.5C2.5 6.20017 2.5 4.55025 3.52513 3.52513C4.55025 2.5 6.20017 2.5 9.5 2.5H11.5C12.8964 2.5 13.5947 2.5 14.156 2.69641C15.1613 3.0482 15.9518 3.83866 16.3036 4.84402C16.5 5.40533 16.5 6.10355 16.5 7.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M7.5 14.5C7.5 11.2002 7.5 9.55025 8.52513 8.52513C9.55025 7.5 11.2002 7.5 14.5 7.5C17.7998 7.5 19.4497 7.5 20.4749 8.52513C21.5 9.55025 21.5 11.2002 21.5 14.5C21.5 17.7998 21.5 19.4497 20.4749 20.4749C19.4497 21.5 17.7998 21.5 14.5 21.5C11.2002 21.5 9.55025 21.5 8.52513 20.4749C7.5 19.4497 7.5 17.7998 7.5 14.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Copy01(props: Copy01Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Copy01,
  Copy01 as Copy01Icon,
  type Copy01Props,
  type Copy01Props as Copy01IconProps,
};
