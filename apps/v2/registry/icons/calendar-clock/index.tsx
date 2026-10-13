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
    face5: {},
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
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <motion.path
        d="M21 7.338V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h2.338"
        variants={variants.face1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M16 2v3"
        variants={variants.face2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M8 2v3"
        variants={variants.face3}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M3 9h5.859"
        variants={variants.face4}
        initial="initial"
        animate={controls}
      />
      <motion.circle
        cx={16}
        cy={16}
        r={6}
        variants={variants.face5}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M16 14V16.2"
        variants={variants.minute}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M16 16.2L17.6 17.2"
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
