'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type RefreshCwOffProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        x: 0,
      },
      animate: {
        x: [0, '-7%', '7%', '-7%', '7%', 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path1: {},
    path2: {},
    path3: {},
    path4: {},
    path5: {},
    path6: {},
    path7: {},
  } satisfies Record<string, Variants>,
  off: {
    path1: {},
    path2: {},
    path3: {},
    path4: {},
    path5: {},
    path6: {},
    path7: {
      initial: {
        opacity: 0,
        pathLength: 0,
      },
      animate: {
        opacity: 1,
        pathLength: 1,
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: RefreshCwOffProps) {
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
        d="M19.5 6.50012C17.5 4.00012 15 3.00012 12 3.00012C10.8144 3.00012 9.68239 3.22936 8.64581 3.64593"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M8 17.2211C8 17.2211 4.71917 16.7233 4.22128 17.2212C3.72339 17.719 4.22129 20.9999 4.22129 20.9999"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M3.05493 13.0001C3.01863 12.6718 3 12.3381 3 12.0001C3 9.51484 4.00736 7.26484 5.63604 5.63616"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path3}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M4.5 17.5001C6.5 20.0001 9 21.0001 12 21.0001C14.4853 21.0001 16.7353 19.9928 18.364 18.3641"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path4}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M20.9451 11.0001C20.9814 11.3285 21 11.6621 21 12.0001C21 13.1857 20.7708 14.3177 20.3542 15.3543"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path5}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M19.7787 3.00012C19.7787 3.00012 20.2766 6.28096 19.7787 6.77883C19.2808 7.27671 16 6.77886 16 6.77886"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path6}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M3 3.00012L21 21.0001"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path7}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function RefreshCwOff(props: RefreshCwOffProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  RefreshCwOff,
  RefreshCwOff as RefreshCwOffIcon,
  type RefreshCwOffProps,
  type RefreshCwOffProps as RefreshCwOffIconProps,
};
