'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type VolumeOffProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    speaker: {},
    sound1: {},
    sound2: {},
    slash: {},
    group: {
      initial: { x: 0 },
      animate: {
        // (Their arcs run from edge to edge: more, and they'd be cut.)
        x: [0, -0.6, 0.6, -0.6, 0.6, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  off: {
    speaker: {},
    sound1: {},
    sound2: {},
    slash: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    group: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: VolumeOffProps) {
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
          d="M14 14C14 17.1452 14 19.5313 13.074 19.9227C12.1481 20.3141 11.0583 19.2021 8.8787 16.9781C7.7499 15.8264 7.106 15.5713 5.5 15.5713C4.3879 15.5713 3.02749 15.7187 2.33706 14.6643C2 14.1496 2 13.4331 2 12C2 10.5669 2 9.85038 2.33706 9.33566C3.02749 8.28131 4.3879 8.42869 5.5 8.42869C6.60725 8.42869 7.3569 8.43869 7.96 7.96M14 9.5C14 6.3548 14.026 4.46866 13.1 4.0773C12.3292 3.75147 11.5323 4.46765 10 6"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.speaker}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M17 10C17.6296 10.7667 18 11.7054 18 12.7195C18 13.1635 17.929 13.593 17.7963 14"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.sound1}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M20 8C21.2508 9.22951 22 10.7952 22 12.5C22 13.9164 21.4829 15.2367 20.5906 16.348"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.sound2}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M22 22L2 2"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.slash}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function VolumeOff(props: VolumeOffProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  VolumeOff,
  VolumeOff as VolumeOffIcon,
  type VolumeOffProps,
  type VolumeOffProps as VolumeOffIconProps,
};
