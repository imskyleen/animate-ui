'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type ArrowRight02Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path1: {},
    path2: {},
    group: {
      initial: { x: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
      animate: { x: 2, transition: { duration: 0.3, ease: 'easeInOut' } },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    path1: {},
    path2: {},
    group: {
      initial: { x: 0 },
      animate: {
        x: [0, 2, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  pointing: {
    path1: {
      initial: {
        d: 'M18.5 12L4.99997 12',
        opacity: 1,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        d: 'M15 12L4.99997 12',
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
    path2: {
      initial: { x: 0 },
      animate: {
        x: -3.5,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
    group: {},
  } satisfies Record<string, Variants>,
  'pointing-loop': {
    path1: {
      initial: { d: 'M18.5 12L4.99997 12' },
      animate: {
        d: ['M18.5 12L4.99997 12', 'M15 12L4.99997 12', 'M18.5 12L4.99997 12'],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path2: {
      initial: { x: 0 },
      animate: {
        x: [0, -3.5, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    group: {},
  } satisfies Record<string, Variants>,
  out: {
    path1: {},
    path2: {},
    group: {
      initial: { x: 0 },
      animate: {
        x: [0, '150%', '-150%', 0],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
          times: [0, 0.5, 0.5, 1],
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ArrowRight02Props) {
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
      <motion.g variants={variants.group} initial="initial" animate={controls}>
        <motion.path
          d="M18.5 12L4.99997 12"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path1}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M13 18C13 18 19 13.5811 19 12C19 10.4188 13 6 13 6"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path2}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function ArrowRight02(props: ArrowRight02Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  ArrowRight02,
  ArrowRight02 as ArrowRight02Icon,
  type ArrowRight02Props,
  type ArrowRight02Props as ArrowRight02IconProps,
};
