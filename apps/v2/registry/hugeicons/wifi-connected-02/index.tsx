'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type WifiConnected02Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    check: {
      initial: { pathLength: 1, opacity: 1, scale: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        scale: [1, 1.1, 1],
        transition: { duration: 0.6, ease: 'easeInOut', delay: 0.24 },
      },
    },
    wave1: {
      initial: { opacity: 1, scale: 1 },
      animate: {
        opacity: [1, 0.25, 1],
        scale: [1, 0.85, 1],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
    wave2: {
      initial: { opacity: 1, scale: 1 },
      animate: {
        opacity: [1, 0.25, 1],
        scale: [1, 0.85, 1],
        transition: { duration: 0.5, ease: 'easeInOut', delay: 0.12 },
      },
    },
  } satisfies Record<string, Variants>,
  blink: {
    check: {},
    wave1: {
      initial: { opacity: 1, scale: 1 },
      animate: {
        opacity: 0,
        scale: 0,
        transition: {
          opacity: {
            duration: 0.2,
            ease: 'easeInOut',
            repeat: 1,
            repeatType: 'reverse',
            repeatDelay: 0.2,
          },
          scale: {
            duration: 0.2,
            ease: 'easeInOut',
            repeat: 1,
            repeatType: 'reverse',
            repeatDelay: 0.2,
          },
        },
      },
    },
    wave2: {
      initial: { opacity: 1, scale: 1 },
      animate: {
        opacity: 0,
        scale: 0,
        transition: {
          opacity: {
            duration: 0.2,
            ease: 'easeInOut',
            repeat: 1,
            repeatType: 'reverse',
            repeatDelay: 0.2,
            delay: 0.2,
          },
          scale: {
            duration: 0.2,
            ease: 'easeInOut',
            repeat: 1,
            repeatType: 'reverse',
            repeatDelay: 0.2,
            delay: 0.2,
          },
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: WifiConnected02Props) {
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
        d="M9 18.0001C9 18.0001 10 18.0001 11 20.0001C11 20.0001 13.4766 16.1017 16 14.501"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.check}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M18.5 11.5C14.7324 8.16667 9.5 8.16667 5.5 11.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.wave1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M2 8C8.31579 2.66669 15.6842 2.66668 22 7.99989"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.wave2}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function WifiConnected02(props: WifiConnected02Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  WifiConnected02,
  WifiConnected02 as WifiConnected02Icon,
  type WifiConnected02Props,
  type WifiConnected02Props as WifiConnected02IconProps,
};
