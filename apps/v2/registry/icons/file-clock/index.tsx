'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type FileClockProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    face1: {},
    face2: {},
    face3: {},
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

function IconComponent({ size, ...props }: FileClockProps) {
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
        d="M16 22h2a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v2.85"
        variants={variants.face1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M14 2v5a1 1 0 0 0 1 1h5"
        variants={variants.face2}
        initial="initial"
        animate={controls}
      />
      <motion.circle
        cx={8}
        cy={16}
        r={6}
        variants={variants.face3}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M8 14V16.2"
        variants={variants.minute}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M8 16.2L9.6 17.2"
        variants={variants.hour}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function FileClock(props: FileClockProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  FileClock,
  FileClock as FileClockIcon,
  type FileClockProps,
  type FileClockProps as FileClockIconProps,
};
