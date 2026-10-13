'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type SquarePlusProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    rect: {},
    line1: {
      initial: {
        rotate: 0,
        transition: { ease: 'easeInOut', duration: 0.4, delay: 0.1 },
      },
      animate: {
        rotate: 90,
        transition: { ease: 'easeInOut', duration: 0.4, delay: 0.1 },
      },
    },
    line2: {
      initial: {
        rotate: 0,
        transition: { ease: 'easeInOut', duration: 0.4 },
      },
      animate: {
        rotate: 90,
        transition: { ease: 'easeInOut', duration: 0.4 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: SquarePlusProps) {
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
      {...props}
    >
      <motion.path
        d="M2.49219 12C2.49219 7.77027 2.49219 5.6554 3.69016 4.25276C3.86027 4.05358 4.04577 3.86808 4.24495 3.69797C5.64759 2.5 7.76246 2.5 11.9922 2.5C16.2219 2.5 18.3368 2.5 19.7394 3.69797C19.9386 3.86808 20.1241 4.05358 20.2942 4.25276C21.4922 5.6554 21.4922 7.77027 21.4922 12C21.4922 16.2297 21.4922 18.3446 20.2942 19.7472C20.1241 19.9464 19.9386 20.1319 19.7394 20.302C18.3368 21.5 16.2219 21.5 11.9922 21.5C7.76246 21.5 5.64759 21.5 4.24495 20.302C4.04577 20.1319 3.86027 19.9464 3.69016 19.7472C2.49219 18.3446 2.49219 16.2297 2.49219 12Z"
        variants={variants.rect}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M7.99219 12L15.9922 12"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.line1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M11.9922 16L11.9922 8"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.line2}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function SquarePlus(props: SquarePlusProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  SquarePlus,
  SquarePlus as SquarePlusIcon,
  type SquarePlusProps,
  type SquarePlusProps as SquarePlusIconProps,
};
