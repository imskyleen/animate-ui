'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type CastProps = IconProps<keyof typeof animations>;

const animations = {
  default: (() => {
    const animation: Record<string, Variants> = {
      path4: {},
    };

    for (let i = 1; i <= 3; i++) {
      animation[`path${i}`] = {
        initial: { opacity: 1, scale: 1 },
        animate: {
          opacity: 0,
          scale: 0,
          transition: {
            opacity: {
              duration: 0.2,
              ease: 'easeInOut',
              repeat: 1,
              repeatType: 'reverse',
              repeatDelay: 0.2,
              delay: 0.2 * (i - 1),
            },
            scale: {
              duration: 0.2,
              ease: 'easeInOut',
              repeat: 1,
              repeatType: 'reverse',
              repeatDelay: 0.2,
              delay: 0.2 * (i - 1),
            },
          },
        },
      };
    }

    return animation;
  })() satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: CastProps) {
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
        d="M2 20 L2 20"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M2 16a5 5 0 0 1 4 4"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M2 12a9 9 0 0 1 8 8"
        variants={variants.path3}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6"
        variants={variants.path4}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Cast(props: CastProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Cast,
  Cast as CastIcon,
  type CastProps,
  type CastProps as CastIconProps,
};
