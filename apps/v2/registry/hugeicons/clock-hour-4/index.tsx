'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type ClockHour4Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    face1: {},
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

function IconComponent({ size, ...props }: ClockHour4Props) {
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
      <motion.circle
        cx={12}
        cy={12}
        r={10}
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.face1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M12 6L12 12"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.minute}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M15.5 14L12 12"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.hour}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function ClockHour4(props: ClockHour4Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  ClockHour4,
  ClockHour4 as ClockHour4Icon,
  type ClockHour4Props,
  type ClockHour4Props as ClockHour4IconProps,
};
