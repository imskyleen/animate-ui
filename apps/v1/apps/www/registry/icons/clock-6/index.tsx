'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type Clock6Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    circle: {},
    line1: {
      initial: {
        rotate: 0,
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
      animate: {
        transformOrigin: 'top left',
        rotate: [0, 20, 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    line2: {
      initial: {
        rotate: 0,
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
      animate: {
        transformOrigin: 'bottom left',
        rotate: 360,
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: Clock6Props) {
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
      <motion.circle
        cx={12}
        cy={12}
        r={10}
        variants={variants.circle}
        initial="initial"
        animate={controls}
      />
      <motion.line
        x1={12}
        y1={16.5}
        x2={12}
        y2={12}
        variants={variants.line1}
        initial="initial"
        animate={controls}
      />
      <motion.line
        x1={12}
        y1={6}
        x2={12}
        y2={12}
        variants={variants.line2}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Clock6(props: Clock6Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Clock6,
  Clock6 as Clock6Icon,
  type Clock6Props,
  type Clock6Props as Clock6IconProps,
};
