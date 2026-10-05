'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type CloudRainProps = IconProps<keyof typeof animations>;

const rainAnimation: Variants = {
  initial: {
    opacity: 1,
  },
  animate: {
    opacity: [1, 0.4, 1],
    transition: {
      duration: 1.2,
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
    path2: rainAnimation,
    path3: rainAnimation,
    path4: rainAnimation,
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: CloudRainProps) {
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
        d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.g variants={variants.group} initial="initial" animate={controls}>
        <motion.path d="M16 14v6" variants={variants.path2} />
        <motion.path d="M8 14v6" variants={variants.path3} />
        <motion.path d="M12 16v6" variants={variants.path4} />
      </motion.g>
    </motion.svg>
  );
}

function CloudRain(props: CloudRainProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  CloudRain,
  CloudRain as CloudRainIcon,
  type CloudRainProps,
  type CloudRainProps as CloudRainIconProps,
};
