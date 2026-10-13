'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type UmbrellaProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    canopy: {
      initial: { scaleX: 1, scaleY: 1, transformOrigin: '50% 0%' },
      animate: {
        scaleX: [0.4, 1.02, 1],
        scaleY: [0.8, 1],
        transformOrigin: '50% 0%',
        transition: { duration: 0.6, ease: 'easeOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: UmbrellaProps) {
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
      <path d="M12 13v7a2 2 0 0 0 4 0" />
      <path d="M12 2v2" />
      <motion.path
        d="M20.992 13a1 1 0 0 0 .97-1.274 10.284 10.284 0 0 0-19.923 0A1 1 0 0 0 3 13z"
        variants={variants.canopy}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Umbrella(props: UmbrellaProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Umbrella,
  Umbrella as UmbrellaIcon,
  type UmbrellaProps,
  type UmbrellaProps as UmbrellaIconProps,
};
