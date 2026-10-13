'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type MicOffProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    slash: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: MicOffProps) {
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
      <path d="M12 19v3" />
      <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33" />
      <path d="M16.95 16.95A7 7 0 0 1 5 12v-2" />
      <path d="M18.89 13.23A7 7 0 0 0 19 12v-2" />
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12" />
      <motion.path
        d="m2 2 20 20"
        variants={variants.slash}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function MicOff(props: MicOffProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  MicOff,
  MicOff as MicOffIcon,
  type MicOffProps,
  type MicOffProps as MicOffIconProps,
};
