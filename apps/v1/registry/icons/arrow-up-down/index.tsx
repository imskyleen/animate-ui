'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type ArrowUpDownProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    upArrowGroup: {
      initial: {
        y: 0,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        y: -3,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
    downArrowGroup: {
      initial: {
        y: 0,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        y: 3,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
    upArrowLine: {},
    upArrowHead: {},
    downArrowLine: {},
    downArrowHead: {},
  } satisfies Record<string, Variants>,
  'default-loop': {
    upArrowGroup: {
      initial: {
        y: 0,
      },
      animate: {
        y: [0, -3, 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    downArrowGroup: {
      initial: {
        y: 0,
      },
      animate: {
        y: [0, 3, 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    upArrowLine: {},
    upArrowHead: {},
    downArrowLine: {},
    downArrowHead: {},
  } satisfies Record<string, Variants>,
  out: {
    upArrowGroup: {
      initial: {
        y: 0,
      },
      animate: {
        y: [0, -24, 24, 0],
        transition: {
          default: { ease: 'easeInOut', duration: 0.6 },
          y: {
            ease: 'easeInOut',
            duration: 0.6,
            times: [0, 0.5, 0.5, 1],
          },
        },
      },
    },
    downArrowGroup: {
      initial: {
        y: 0,
      },
      animate: {
        y: [0, 24, -24, 0],
        transition: {
          default: { ease: 'easeInOut', duration: 0.6 },
          y: {
            ease: 'easeInOut',
            duration: 0.6,
            times: [0, 0.5, 0.5, 1],
          },
        },
      },
    },
    upArrowLine: {},
    upArrowHead: {},
    downArrowLine: {},
    downArrowHead: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ArrowUpDownProps) {
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
      {...props}
    >
      {/* Right Arrow (Down) */}
      <motion.g
        variants={variants.downArrowGroup}
        initial="initial"
        animate={controls}
      >
        <motion.path
          d="m21 16-4 4-4-4"
          variants={variants.downArrowHead}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M17 20V4"
          variants={variants.downArrowLine}
          initial="initial"
          animate={controls}
        />
      </motion.g>
      {/* Left Arrow (Up) */}
      <motion.g
        variants={variants.upArrowGroup}
        initial="initial"
        animate={controls}
      >
        <motion.path
          d="m3 8 4-4 4 4"
          variants={variants.upArrowHead}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M7 4v16"
          variants={variants.upArrowLine}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function ArrowUpDown(props: ArrowUpDownProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  ArrowUpDown,
  ArrowUpDown as ArrowUpDownIcon,
  type ArrowUpDownProps,
  type ArrowUpDownProps as ArrowUpDownIconProps,
};
