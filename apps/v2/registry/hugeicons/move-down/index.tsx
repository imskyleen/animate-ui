'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type MoveDownProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group1: {
      initial: { y: 0, transition: { ease: 'easeInOut', duration: 0.3 } },
      animate: { y: '10%', transition: { ease: 'easeInOut', duration: 0.3 } },
    },
    group2: {},
    path1: {},
    cap: {},
    path2: {},
  } satisfies Record<string, Variants>,
  'default-loop': {
    group1: {
      initial: { y: 0 },
      animate: {
        y: [0, '10%', 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    group2: {},
    path1: {},
    cap: {},
    path2: {},
  } satisfies Record<string, Variants>,
  pointing: {
    group1: {},
    group2: {},
    path1: {
      initial: {
        d: 'M11.9922 4H11.2422V19.5H11.9922H12.7422V4H11.9922Z',
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        d: 'M11.9922 4H11.2422V12H11.9922H12.7422V4H11.9922Z',
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
    cap: {
      initial: { y: 0, transition: { ease: 'easeInOut', duration: 0.3 } },
      animate: { y: -7.5, transition: { ease: 'easeInOut', duration: 0.3 } },
    },
    path2: {
      initial: { y: 0, transition: { ease: 'easeInOut', duration: 0.3 } },
      animate: { y: -7.5, transition: { ease: 'easeInOut', duration: 0.3 } },
    },
  } satisfies Record<string, Variants>,
  'pointing-loop': {
    group1: {},
    group2: {},
    path1: {
      initial: { d: 'M11.9922 4H11.2422V19.5H11.9922H12.7422V4H11.9922Z' },
      animate: {
        d: [
          'M11.9922 4H11.2422V19.5H11.9922H12.7422V4H11.9922Z',
          'M11.9922 4H11.2422V12H11.9922H12.7422V4H11.9922Z',
          'M11.9922 4H11.2422V19.5H11.9922H12.7422V4H11.9922Z',
        ],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    cap: {
      initial: { y: 0 },
      animate: {
        y: [0, -7.5, 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    path2: {
      initial: { y: 0 },
      animate: {
        y: [0, -7.5, 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
  } satisfies Record<string, Variants>,
  out: {
    group1: {},
    group2: {
      initial: { y: 0 },
      animate: {
        y: [0, '150%', '-150%', 0],
        transition: {
          default: { ease: 'easeInOut', duration: 0.6 },
          y: { ease: 'easeInOut', duration: 0.6, times: [0, 0.5, 0.5, 1] },
        },
      },
    },
    path1: {},
    cap: {},
    path2: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: MoveDownProps) {
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
      variants={variants.group1}
      initial="initial"
      animate={controls}
      {...props}
    >
      <motion.g variants={variants.group2} initial="initial" animate={controls}>
        <motion.path
          d="M11.9922 4H11.2422V19.5H11.9922H12.7422V4H11.9922Z"
          fill="currentColor"
          strokeWidth={0.5}
          strokeLinejoin="round"
          variants={variants.path1}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M11.2422 19.5C11.2422 19.9142 11.578 20.25 11.9922 20.25C12.4064 20.25 12.7422 19.9142 12.7422 19.5H11.9922H11.2422Z"
          fill="currentColor"
          strokeWidth={0.5}
          strokeLinejoin="round"
          variants={variants.cap}
          initial="initial"
          animate={controls}
        />
        <path
          d="M12.7422 4C12.7422 3.58579 12.4064 3.25 11.9922 3.25C11.578 3.25 11.2422 3.58579 11.2422 4H11.9922H12.7422Z"
          fill="currentColor"
          strokeWidth={0.5}
          strokeLinejoin="round"
        />
        <motion.path
          d="M6.99219 15C7.97523 16.0114 10.5918 20 11.9922 20C13.3926 20 16.0091 16.0114 16.9922 15"
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

function MoveDown(props: MoveDownProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  MoveDown,
  MoveDown as MoveDownIcon,
  type MoveDownProps,
  type MoveDownProps as MoveDownIconProps,
};
