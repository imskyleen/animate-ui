'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type DropletProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    drop: {
      initial: { scaleY: 1, scaleX: 1, transformOrigin: '50% 100%' },
      animate: {
        scaleY: [1, 0.85, 1.04, 1],
        scaleX: [1, 1.08, 0.97, 1],
        transformOrigin: '50% 100%',
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: DropletProps) {
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
      <motion.g variants={variants.drop} initial="initial" animate={controls}>
        <path d="M3.5 13.678C3.5 9.49387 7.08079 5.35907 9.59413 2.97222C10.9591 1.67593 13.0409 1.67593 14.4059 2.97222C16.9192 5.35907 20.5 9.49387 20.5 13.678C20.5 17.7804 17.2812 22 12 22C6.71878 22 3.5 17.7804 3.5 13.678Z" />
        <path
          d="M16 14C16 16.2091 14.2091 18 12 18"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>
    </motion.svg>
  );
}

function Droplet(props: DropletProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Droplet,
  Droplet as DropletIcon,
  type DropletProps,
  type DropletProps as DropletIconProps,
};
