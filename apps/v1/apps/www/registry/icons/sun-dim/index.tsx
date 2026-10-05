'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type SunDimProps = IconProps<keyof typeof animations>;

const animations = {
  default: (() => {
    const animation: Record<string, Variants> = {
      circle: {},
    };

    for (let i = 1; i <= 8; i++) {
      animation[`path${i}`] = {
        initial: { opacity: 1, scale: 1 },
        animate: {
          opacity: [0, 1],
          scale: [0, 1],
          transition: {
            duration: 0.6,
            ease: 'easeInOut',
            delay: (i - 1) * 0.15,
          },
        },
      };
    }

    return animation;
  })() satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: SunDimProps) {
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
      initial="initial"
      animate={controls}
      {...props}
    >
      <motion.circle
        cx="12"
        cy="12"
        r="4"
        variants={variants.circle}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M12 4h.01"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M17.657 6.343h.01"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M20 12h.01"
        variants={variants.path3}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M17.657 17.657h.01"
        variants={variants.path4}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M12 20h.01"
        variants={variants.path5}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M6.343 17.657h.01"
        variants={variants.path6}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M4 12h.01"
        variants={variants.path7}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M6.343 6.343h.01"
        variants={variants.path8}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function SunDim(props: SunDimProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  SunDim,
  SunDim as SunDimIcon,
  type SunDimProps,
  type SunDimProps as SunDimIconProps,
};
