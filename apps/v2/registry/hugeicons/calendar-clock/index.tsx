'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type CalendarClockProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    face1: {},
    face2: {},
    face3: {},
    face4: {},
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

function IconComponent({ size, ...props }: CalendarClockProps) {
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
        d="M16 2V6M8 2V6"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.face1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M20.8985 8C20.7706 6.69989 20.4816 5.82475 19.8284 5.17157C18.6569 4 16.7712 4 13 4H11C7.22876 4 5.34315 4 4.17157 5.17157C3 6.34315 3 8.22876 3 12V14C3 17.7712 3 19.6569 4.17157 20.8284C4.97975 21.6366 6.1277 21.8873 8 21.965"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.face2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M3 10H8"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.face3}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M16 22C19.3137 22 22 19.3137 22 16C22 12.6863 19.3137 10 16 10C12.6863 10 10 12.6863 10 16C10 19.3137 12.6863 22 16 22Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.face4}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M16 13L16 16"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.minute}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M18 17L16 16"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.hour}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function CalendarClock(props: CalendarClockProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  CalendarClock,
  CalendarClock as CalendarClockIcon,
  type CalendarClockProps,
  type CalendarClockProps as CalendarClockIconProps,
};
