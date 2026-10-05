'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type MoveRightProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group1: {
      initial: {
        x: 0,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        x: '15%',
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
    group2: {},
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
  'default-loop': {
    group1: {
      initial: {
        x: 0,
      },
      animate: {
        x: [0, '15%', 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    group2: {},
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
  pointing: {
    group1: {},
    group2: {},
    path1: {
      initial: {
        d: 'M2 12H22',
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        d: 'M2 12H12',
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
    path2: {
      initial: {
        d: 'M18 8L22 12L18 16',
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        d: 'M8 8L12 12L8 16',
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
  } satisfies Record<string, Variants>,
  'pointing-loop': {
    group1: {},
    group2: {},
    path1: {
      initial: {
        d: 'M2 12H22',
      },
      animate: {
        d: ['M2 12H22', 'M2 12H12', 'M2 12H22'],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    path2: {
      initial: {
        d: 'M18 8L22 12L18 16',
      },
      animate: {
        d: ['M18 8L22 12L18 16', 'M8 8L12 12L8 16', 'M18 8L22 12L18 16'],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
  } satisfies Record<string, Variants>,
  out: {
    group1: {},
    group2: {
      initial: {
        x: 0,
      },
      animate: {
        x: [0, '150%', '-150%', 0],
        transition: {
          default: { ease: 'easeInOut', duration: 0.6 },
          x: {
            ease: 'easeInOut',
            duration: 0.6,
            times: [0, 0.5, 0.5, 1],
          },
        },
      },
    },
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: MoveRightProps) {
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
      strokeLinecap="round"
      strokeLinejoin="round"
      variants={variants.group1}
      initial="initial"
      animate={controls}
      {...props}
    >
      <motion.g variants={variants.group2} initial="initial" animate={controls}>
        <motion.path
          d="M2 12H22"
          variants={variants.path1}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M18 8L22 12L18 16"
          variants={variants.path2}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function MoveRight(props: MoveRightProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  MoveRight,
  MoveRight as MoveRightIcon,
  type MoveRightProps,
  type MoveRightProps as MoveRightIconProps,
};
