'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type CloudSunRainProps = IconProps<keyof typeof animations>;

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
  default: (() => {
    const animation: Record<string, Variants> = {
      path1: {},
      path2: {},
      group: {
        animate: {
          transition: {
            staggerChildren: 0.3,
          },
        },
      },
      path3: rainAnimation,
      path4: rainAnimation,
    };

    for (let i = 1; i <= 4; i++) {
      animation[`line${i}`] = {
        initial: { opacity: 1, scale: 1 },
        animate: {
          opacity: [0, 1],
          pathLength: [0, 1],
          transition: {
            duration: 0.6,
            ease: 'easeInOut',
            delay: (i - 1) * 0.15,
          },
        },
      };
    }

    return animation;
  })() satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: CloudSunRainProps) {
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
        d="M15.947 12.65a4 4 0 0 0-5.925-4.128"
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

      <motion.line
        x1="6.3"
        y1="6.3"
        x2="4.9"
        y2="4.9"
        variants={variants.line1}
        initial="initial"
        animate={controls}
      />
      <motion.line
        x1="12"
        y1="4"
        x2="12"
        y2="2"
        variants={variants.line2}
        initial="initial"
        animate={controls}
      />
      <motion.line
        x1="17.7"
        y1="6.3"
        x2="19.1"
        y2="4.9"
        variants={variants.line3}
        initial="initial"
        animate={controls}
      />
      <motion.line
        x1="20"
        y1="12"
        x2="22"
        y2="12"
        variants={variants.line4}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function CloudSunRain(props: CloudSunRainProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  CloudSunRain,
  CloudSunRain as CloudSunRainIcon,
  type CloudSunRainProps,
  type CloudSunRainProps as CloudSunRainIconProps,
};
