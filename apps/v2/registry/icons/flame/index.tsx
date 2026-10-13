'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type FlameProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    flame: {
      initial: { scaleY: 1, skewX: 0, transformOrigin: '50% 100%' },
      animate: {
        scaleY: [1, 1.05, 0.95, 1.03, 1],
        skewX: [0, 3, -3, 1.5, 0],
        transformOrigin: '50% 100%',
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: FlameProps) {
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
        d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"
        variants={variants.flame}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Flame(props: FlameProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Flame,
  Flame as FlameIcon,
  type FlameProps,
  type FlameProps as FlameIconProps,
};
