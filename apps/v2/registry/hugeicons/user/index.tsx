'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type UserProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path: {
      initial: { y: 0 },
      animate: {
        y: [0, 2, -2, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    circle: {
      initial: { y: 0 },
      animate: {
        y: [0, 4, -2, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: UserProps) {
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
        d="M20 21.0001C19.713 17.269 16.7289 14.3151 12.995 14.0662L12 13.9999C11.6446 14.0096 11.3134 14.0225 11.0008 14.0378C7.3 14.2192 4.28417 17.3057 4 21.0001"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path}
        initial="initial"
        animate={controls}
      />
      <motion.circle
        cx={12}
        cy={6.99988}
        r={4}
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.circle}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function User(props: UserProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  User,
  User as UserIcon,
  type UserProps,
  type UserProps as UserIconProps,
};
