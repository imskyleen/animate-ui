'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type LightbulbOffProps = IconProps<keyof typeof animations>;

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
  } satisfies Record<string, Variants>,
  off: {
    path1: {},
    path2: {
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
    path3: {},
    path4: {},
    path5: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: LightbulbOffProps) {
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
      variants={variants.group}
      initial="initial"
      animate={controls}
      {...props}
    >
      <motion.path
        d="M16.8 11.2c.8-.9 1.2-2 1.2-3.2a6 6 0 0 0-9.3-5"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="m2 2 20 20"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M6.3 6.3a4.67 4.67 0 0 0 1.2 5.2c.7.7 1.3 1.5 1.5 2.5"
        variants={variants.path3}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M9 18h6"
        variants={variants.path4}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M10 22h4"
        variants={variants.path5}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function LightbulbOff(props: LightbulbOffProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  LightbulbOff,
  LightbulbOff as LightbulbOffIcon,
  type LightbulbOffProps,
  type LightbulbOffProps as LightbulbOffIconProps,
};
