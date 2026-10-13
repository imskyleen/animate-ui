'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type CoffeeProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    steam1: {
      initial: { y: 0, opacity: 1 },
      animate: {
        y: [0, -1, 0],
        opacity: [1, 0.3, 1],
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
    },
    steam2: {
      initial: { y: 0, opacity: 1 },
      animate: {
        y: [0, -1, 0],
        opacity: [1, 0.3, 1],
        transition: { duration: 0.8, ease: 'easeInOut', delay: 0.15 },
      },
    },
    steam3: {
      initial: { y: 0, opacity: 1 },
      animate: {
        y: [0, -1, 0],
        opacity: [1, 0.3, 1],
        transition: { duration: 0.8, ease: 'easeInOut', delay: 0.3 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: CoffeeProps) {
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
      <path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1" />
      <motion.path
        d="M6 2v2"
        variants={variants.steam1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M10 2v2"
        variants={variants.steam2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M14 2v2"
        variants={variants.steam3}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Coffee(props: CoffeeProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Coffee,
  Coffee as CoffeeIcon,
  type CoffeeProps,
  type CoffeeProps as CoffeeIconProps,
};
