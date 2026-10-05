'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type CloudSnowProps = IconProps<keyof typeof animations>;

const snowAnimation: Variants = {
  initial: { opacity: 1 },
  animate: (i: number = 0) => ({
    opacity: [1, 0.4, 1],
    transition: {
      duration: 1.2,
      ease: 'easeInOut',
      repeat: Infinity,
      delay: i * 0.2,
    },
  }),
};

const animations = {
  default: {
    group: {
      initial: {},
      animate: {},
    },
    path1: {},
    path2: snowAnimation,
    path3: snowAnimation,
    path4: snowAnimation,
    path5: snowAnimation,
    path6: snowAnimation,
    path7: snowAnimation,
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: CloudSnowProps) {
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
      <motion.path
        d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.g variants={variants.group} initial="initial" animate={controls}>
        <motion.path d="M8 15h.01" variants={variants.path2} custom={0} />
        <motion.path d="M12 21h.01" variants={variants.path3} custom={1} />
        <motion.path d="M16 15h.01" variants={variants.path4} custom={2} />
        <motion.path d="M12 17h.01" variants={variants.path7} custom={3} />
        <motion.path d="M16 19h.01" variants={variants.path6} custom={4} />
        <motion.path d="M8 19h.01" variants={variants.path5} custom={5} />
      </motion.g>
    </motion.svg>
  );
}

function CloudSnow(props: CloudSnowProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  CloudSnow,
  CloudSnow as CloudSnowIcon,
  type CloudSnowProps,
  type CloudSnowProps as CloudSnowIconProps,
};
