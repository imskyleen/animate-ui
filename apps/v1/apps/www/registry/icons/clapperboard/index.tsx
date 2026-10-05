'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type ClapperboardProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group1: {
      initial: {
        rotate: 0,
        scale: 1,
      },
      animate: {
        rotate: [0, -5, 7, 0],
        scale: [1, 0.9, 1.1, 1],
        transition: {
          duration: 1.2,
          ease: 'easeInOut',
        },
      },
    },
    group2: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, -4, 15, 0],
        transformOrigin: 'bottom left',
        transition: {
          duration: 1.2,
          ease: 'easeInOut',
        },
      },
    },
    path1: {},
    path2: {},
    path3: {},
    path4: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ClapperboardProps) {
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
      <motion.g variants={variants.group1} initial="initial" animate={controls}>
        <motion.g
          variants={variants.group2}
          initial="initial"
          animate={controls}
        >
          <motion.path
            d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z"
            variants={variants.path1}
            initial="initial"
            animate={controls}
          />
          <motion.path
            d="m6.2 5.3 3.1 3.9"
            variants={variants.path2}
            initial="initial"
            animate={controls}
          />
          <motion.path
            d="m12.4 3.4 3.1 4"
            variants={variants.path3}
            initial="initial"
            animate={controls}
          />
        </motion.g>
        <motion.path
          d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"
          variants={variants.path4}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function Clapperboard(props: ClapperboardProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Clapperboard,
  Clapperboard as ClapperboardIcon,
  type ClapperboardProps,
  type ClapperboardProps as ClapperboardIconProps,
};
