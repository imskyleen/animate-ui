'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type ClockFadingProps = IconProps<keyof typeof animations>;

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

function IconComponent({ size, ...props }: ClockFadingProps) {
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
        d="M12 2a10 10 0 0 1 7.38 16.75"
        variants={variants.face1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M2.5 8.875a10 10 0 0 0-.5 3"
        variants={variants.face2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M2.83 16a10 10 0 0 0 2.43 3.4"
        variants={variants.face3}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M4.636 5.235a10 10 0 0 1 .891-.857"
        variants={variants.face4}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M8.644 21.42a10 10 0 0 0 7.631-.38"
        variants={variants.face5}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M12 6V12"
        variants={variants.minute}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M12 12L16 14"
        variants={variants.hour}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function ClockFading(props: ClockFadingProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  ClockFading,
  ClockFading as ClockFadingIcon,
  type ClockFadingProps,
  type ClockFadingProps as ClockFadingIconProps,
};
