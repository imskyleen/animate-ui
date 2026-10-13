'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type ClockPlusProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    face1: {},
    plus: {
      initial: { rotate: 0, transition: { duration: 0.4, ease: 'easeInOut' } },
      animate: { rotate: 90, transition: { duration: 0.4, ease: 'easeInOut' } },
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

function IconComponent({ size, ...props }: ClockPlusProps) {
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
        d="M21.92 13.267a10 10 0 1 0-8.653 8.653"
        variants={variants.face1}
        initial="initial"
        animate={controls}
      />
      <motion.g variants={variants.plus} initial="initial" animate={controls}>
        <motion.path
          d="M16 19h6"
          variants={variants.path1}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M19 16v6"
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
        d="M12 12L15.644 13.822"
        variants={variants.hour}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function ClockPlus(props: ClockPlusProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  ClockPlus,
  ClockPlus as ClockPlusIcon,
  type ClockPlusProps,
  type ClockPlusProps as ClockPlusIconProps,
};
