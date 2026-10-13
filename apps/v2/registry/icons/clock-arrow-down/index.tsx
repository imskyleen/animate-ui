'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type ClockArrowDownProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    face1: {},
    arrow: {
      initial: { y: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
      animate: { y: 1, transition: { duration: 0.3, ease: 'easeInOut' } },
    },
    path1: {},
    path2: {},
    minute: {
      initial: {
        rotate: 0,
        transformOrigin: '50% 100%',
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
      animate: {
        rotate: 360,
        transformOrigin: '50% 100%',
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    hour: {
      initial: {
        rotate: 0,
        transformOrigin: '0% 0%',
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
      animate: {
        rotate: [0, 20, 0],
        transformOrigin: '0% 0%',
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ClockArrowDownProps) {
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
        d="M12.337 21.994a10 10 0 1 1 9.588-8.767"
        variants={variants.face1}
        initial="initial"
        animate={controls}
      />
      <motion.g variants={variants.arrow} initial="initial" animate={controls}>
        <motion.path
          d="m14 18 4 4 4-4"
          variants={variants.path1}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M18 14v8"
          variants={variants.path2}
          initial="initial"
          animate={controls}
        />
      </motion.g>
      <motion.path
        d="M12 6V12"
        variants={variants.minute}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M12 12L14 13"
        variants={variants.hour}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function ClockArrowDown(props: ClockArrowDownProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  ClockArrowDown,
  ClockArrowDown as ClockArrowDownIcon,
  type ClockArrowDownProps,
  type ClockArrowDownProps as ClockArrowDownIconProps,
};
