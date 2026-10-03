'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type CloudMoonRainProps = IconProps<keyof typeof animations>;

const rainAnimation: Variants = {
  initial: {
    opacity: 1,
  },
  animate: {
    opacity: [1, 0.4, 1],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

const animations = {
  default: {
    group: {
      animate: {
        transition: {
          staggerChildren: 0.3,
        },
      },
    },
    path1: {},
    path2: {},
    path3: rainAnimation,
    path4: rainAnimation,
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: CloudMoonRainProps) {
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
      initial="initial"
      animate={controls}
      {...props}
    >
      <motion.path
        d="M18.376 14.512a6 6 0 0 0 3.461-4.127c.148-.625-.659-.97-1.248-.714a4 4 0 0 1-5.259-5.26c.255-.589-.09-1.395-.716-1.248a6 6 0 0 0-4.594 5.36"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M3 20a5 5 0 1 1 8.9-4H13a3 3 0 0 1 2 5.24"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
      <motion.g variants={variants.group} initial="initial" animate={controls}>
        <motion.path d="M7 19v2" variants={variants.path3} />
        <motion.path d="M11 20v2" variants={variants.path4} />
      </motion.g>
    </motion.svg>
  );
}

function CloudMoonRain(props: CloudMoonRainProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  CloudMoonRain,
  CloudMoonRain as CloudMoonRainIcon,
  type CloudMoonRainProps,
  type CloudMoonRainProps as CloudMoonRainIconProps,
};
