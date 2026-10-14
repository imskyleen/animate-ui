'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type InfinityProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    loop: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.9, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: InfinityProps) {
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
        d="M6 16c5 0 7-8 12-8a4 4 0 0 1 0 8c-5 0-7-8-12-8a4 4 0 1 0 0 8"
        variants={variants.loop}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function InfinityIcon(props: InfinityProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  InfinityIcon as Infinity,
  InfinityIcon,
  type InfinityProps,
  type InfinityProps as InfinityIconProps,
};
