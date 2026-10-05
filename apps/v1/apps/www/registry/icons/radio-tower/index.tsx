'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type RadioTowerProps = IconProps<keyof typeof animations>;

const animations = {
  default: (() => {
    const animation: Record<string, Variants> = {};

    for (let i = 1; i <= 2; i++) {
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

function IconComponent({ size, ...props }: RadioTowerProps) {
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
        d="M7.8 4.7a6.14 6.14 0 0 0-.8 7.5"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M4.9 1.9 C1 5.8 1 12.2 4.9 16.1"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
      <motion.circle
        cx="12"
        cy="9"
        r="2"
        variants={variants.circle}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M16.2 4.8c2 2 2.26 5.11.8 7.47"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M19.1 1.9a9.96 9.96 0 0 1 0 14.1"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M9.5 18h5"
        variants={variants.path3}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="m8 22 4-11 4 11"
        variants={variants.path4}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function RadioTower(props: RadioTowerProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  RadioTower,
  RadioTower as RadioTowerIcon,
  type RadioTowerProps,
  type RadioTowerProps as RadioTowerIconProps,
};
