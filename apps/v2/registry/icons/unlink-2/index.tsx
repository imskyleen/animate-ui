'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type Unlink2Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    left: {
      initial: { x: 0 },
      animate: {
        x: [0, -1, 0],
        transition: { duration: 0.8, ease: 'easeInOut', times: [0, 0.4, 1] },
      },
    },
    right: {
      initial: { x: 0 },
      animate: {
        x: [0, 1, 0],
        transition: { duration: 0.8, ease: 'easeInOut', times: [0, 0.4, 1] },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: Unlink2Props) {
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
        d="M9 17H7A5 5 0 0 1 7 7h2"
        variants={variants.left}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M15 7h2a5 5 0 0 1 0 10h-2"
        variants={variants.right}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Unlink2(props: Unlink2Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Unlink2,
  Unlink2 as Unlink2Icon,
  type Unlink2Props,
  type Unlink2Props as Unlink2IconProps,
};
