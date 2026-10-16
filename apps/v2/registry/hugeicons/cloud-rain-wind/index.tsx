'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type CloudRainWindProps = IconProps<keyof typeof animations>;

const rainAnimation: Variants = {
  initial: { x: 0, y: 0, opacity: 1 },
  animate: (i: number = 0) => ({
    x: [0, -0.4, 0.4, 0],
    y: [0, 1, -1, 0],
    opacity: [1, 0, 0, 1],
    transition: {
      duration: 1.2,
      times: [0, 0.4, 0.4, 1],
      ease: ['easeIn', 'linear', 'easeOut'],
      repeat: Infinity,
      delay: i * 0.3,
    },
  }),
};

const animations = {
  default: {
    group: {},
    path1: {},
    path2: rainAnimation,
    path3: rainAnimation,
    path4: rainAnimation,
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: CloudRainWindProps) {
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
      initial="initial"
      animate={controls}
      {...props}
    >
      <motion.path
        d="M4 17.0004C2.78555 16.0882 2 14.6358 2 13C2 10.4003 3.98398 8.26407 6.52042 8.0227M6.52042 8.0227C6.76233 5.20862 9.12324 3 12 3C15.0376 3 17.5 5.46243 17.5 8.5C17.5 8.66856 17.4924 8.83536 17.4776 9.00005C17.4131 9.71494 17.2119 10.3904 16.9003 11M6.52042 8.0227C6.67826 8.00768 6.83823 8 7 8C7.78232 8 8.52268 8.17967 9.18206 8.5M17.4776 9.00005C17.485 9.00002 17.4925 9 17.5 9C19.9853 9 22 11.0147 22 13.5C22 15.0602 21.206 16.435 20 17.2422"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.g variants={variants.group} initial="initial" animate={controls}>
        <motion.path
          d="M10.1992 22L12.1992 17"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path2}
          custom={0}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M9 15L7 20"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path3}
          custom={1}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M17 15L15 20"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path4}
          custom={2}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function CloudRainWind(props: CloudRainWindProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  CloudRainWind,
  CloudRainWind as CloudRainWindIcon,
  type CloudRainWindProps,
  type CloudRainWindProps as CloudRainWindIconProps,
};
