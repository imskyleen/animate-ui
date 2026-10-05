'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type WifiProps = IconProps<keyof typeof animations>;

const animations = {
  default: (() => {
    const animation: Record<string, Variants> = {};

    for (let i = 1; i <= 4; i++) {
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

function IconComponent({ size, ...props }: WifiProps) {
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
        d="M12 20h.01"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M8.5 16.429a5 5 0 0 1 7 0"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M5 12.859a10 10 0 0 1 14 0"
        variants={variants.path3}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M2 8.82a15 15 0 0 1 20 0"
        variants={variants.path4}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Wifi(props: WifiProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Wifi,
  Wifi as WifiIcon,
  type WifiProps,
  type WifiProps as WifiIconProps,
};
