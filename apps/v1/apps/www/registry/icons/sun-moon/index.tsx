'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type SunMoonProps = IconProps<keyof typeof animations>;

const animations = {
  default: (() => {
    const animation: Record<string, Variants> = {
      path1: {
        initial: {
          rotate: 0,
        },
        animate: {
          rotate: [0, -10, 10, 0],
          transition: {
            duration: 0.6,
            ease: 'easeInOut',
          },
        },
      },
      path2: {},
    };

    for (let i = 1; i <= 3; i++) {
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

function IconComponent({ size, ...props }: SunMoonProps) {
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
        d="M14.837 16.385a6 6 0 1 1-7.223-7.222c.624-.147.97.66.715 1.248a4 4 0 0 0 5.26 5.259c.589-.255 1.396.09 1.248.715"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M16 12a4 4 0 0 0-4-4"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
      <motion.line
        x1="12"
        y1="4"
        x2="12"
        y2="2"
        variants={variants.line1}
        initial="initial"
        animate={controls}
      />
      <motion.line
        x1="17.7"
        y1="6.3"
        x2="19"
        y2="5"
        variants={variants.line2}
        initial="initial"
        animate={controls}
      />
      <motion.line
        x1="20"
        y1="12"
        x2="22"
        y2="12"
        variants={variants.line3}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function SunMoon(props: SunMoonProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  SunMoon,
  SunMoon as SunMoonIcon,
  type SunMoonProps,
  type SunMoonProps as SunMoonIconProps,
};
