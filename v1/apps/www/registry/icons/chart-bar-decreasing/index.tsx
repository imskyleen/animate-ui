'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type ChartBarDecreasingProps = IconProps<keyof typeof animations>;

const animations = {
  default: (() => {
    const animation: Record<string, Variants> = {
      path4: {},
    };

    for (let i = 1; i <= 3; i++) {
      animation[`path${i}`] = {
        initial: { opacity: 1 },
        animate: {
          opacity: [0, 1],
          pathLength: [0, 1],
          transition: {
            ease: 'easeInOut',
            duration: 0.4,
            delay: (i - 1) * 0.3,
          },
        },
      };
    }

    return animation as Record<string, Variants>;
  })() satisfies Record<string, Variants>,
  'default-loop': (() => {
    const n = 3;
    const delayStep = 0.3;
    const segDuration = 0.4;

    const startOut = (i: number) => (n - i) * delayStep;
    const endOut = (i: number) => startOut(i) + segDuration;

    const outTotal = Math.max(
      ...Array.from({ length: n }, (_, k) => endOut(k + 1)),
    );

    const startIn = (i: number) => outTotal + (i - 1) * delayStep;
    const endIn = (i: number) => startIn(i) + segDuration;

    const totalDuration = Math.max(
      ...Array.from({ length: n }, (_, k) => endIn(k + 1)),
    );

    const animation: Record<string, Variants> = {};

    for (let i = 1; i <= n; i++) {
      const tSO = startOut(i) / totalDuration;
      const tEO = endOut(i) / totalDuration;
      const tSI = startIn(i) / totalDuration;
      const tEI = endIn(i) / totalDuration;

      animation[`path${i}`] = {
        initial: { opacity: 1, pathLength: 1 },
        animate: {
          pathLength: [1, 1, 0, 0, 1],
          opacity: [1, 1, 0, 0, 1],
          transition: {
            ease: 'easeInOut',
            duration: totalDuration,
            times: [0, tSO, tEO, tSI, tEI],
          },
        },
      };
    }

    return animation as Record<string, Variants>;
  })() satisfies Record<string, Variants>,
  decreasing: {
    path1: {
      initial: { d: 'M7 6h12' },
      animate: {
        d: 'M7 6h3',
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
    path2: {
      initial: { d: 'M7 11h8' },
      animate: {
        d: 'M7 11h8',
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
    path3: {
      initial: { d: 'M7 16h3' },
      animate: {
        d: 'M7 16h12',
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ChartBarDecreasingProps) {
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
      <motion.path
        d="M7 6h12"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M7 11h8"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M7 16h3"
        variants={variants.path3}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M3 3v16a2 2 0 0 0 2 2h16"
        variants={variants.path4}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function ChartBarDecreasing(props: ChartBarDecreasingProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  ChartBarDecreasing,
  ChartBarDecreasing as ChartBarDecreasingIcon,
  type ChartBarDecreasingProps,
  type ChartBarDecreasingProps as ChartBarDecreasingIconProps,
};
