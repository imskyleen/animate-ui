'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type CalendarPlusProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    ring1: {
      initial: { y: 0 },
      animate: {
        y: [0, -1, 0, -0.3, 0],
        transition: {
          duration: 0.5,
          ease: 'easeInOut',
          times: [0, 0.3, 0.55, 0.75, 1],
        },
      },
    },
    ring2: {
      initial: { y: 0 },
      animate: {
        y: [0, -1, 0, -0.3, 0],
        transition: {
          duration: 0.5,
          ease: 'easeInOut',
          times: [0, 0.3, 0.55, 0.75, 1],
          delay: 0.08,
        },
      },
    },
    plus: {
      initial: { rotate: 0 },
      animate: { rotate: 90, transition: { duration: 0.5, ease: 'easeInOut' } },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: CalendarPlusProps) {
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
        d="M8 2V6"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.ring1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M16 2V6"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.ring2}
        initial="initial"
        animate={controls}
      />
      <path d="M3 10H21" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M21 13C21 9.22876 21 6.34315 19.8284 5.17157C18.6569 4 16.7712 4 13 4H11C7.22876 4 5.34315 4 4.17157 5.17157C3 6.34315 3 8.22876 3 12V14C3 17.7712 3 19.6569 4.17157 20.8284C5.34315 22 7.22876 22 11 22H14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <motion.g variants={variants.plus} initial="initial" animate={controls}>
        <path d="M16 18.995H22" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M18.995 22L18.995 16"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>
    </motion.svg>
  );
}

function CalendarPlus(props: CalendarPlusProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  CalendarPlus,
  CalendarPlus as CalendarPlusIcon,
  type CalendarPlusProps,
  type CalendarPlusProps as CalendarPlusIconProps,
};
