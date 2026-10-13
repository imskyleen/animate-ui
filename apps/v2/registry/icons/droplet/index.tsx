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
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <motion.path
        d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"
        variants={variants.drop}
        initial="initial"
        animate={controls}
      />
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
