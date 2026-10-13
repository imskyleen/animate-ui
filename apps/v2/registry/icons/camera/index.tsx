'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type CameraProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    body: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 0.94, 1],
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
    },
    lens: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 0.7, 1.1, 1],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: CameraProps) {
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
      <motion.g variants={variants.body} initial="initial" animate={controls}>
        <path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z" />
        <motion.circle
          cx={12}
          cy={13}
          r={3}
          variants={variants.lens}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function Camera(props: CameraProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Camera,
  Camera as CameraIcon,
  type CameraProps,
  type CameraProps as CameraIconProps,
};
