'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type SunriseProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    sun: {
      initial: { scale: 1, transformOrigin: '50% 100%' },
      animate: {
        scale: [0.4, 1],
        transformOrigin: '50% 100%',
        transition: { duration: 0.6, ease: 'easeOut' },
      },
    },
    shaft: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
    },
    head: {
      initial: { opacity: 1, scale: 1, transformOrigin: '50% 0%' },
      animate: {
        opacity: [0, 0, 1],
        scale: [0.3, 0.3, 1],
        transformOrigin: '50% 0%',
        transition: { duration: 0.5, ease: 'easeOut', times: [0, 0.5, 1] },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: SunriseProps) {
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
      <path d="m4.93 10.93 1.41 1.41" />
      <path d="M2 18h2" />
      <path d="M20 18h2" />
      <path d="m19.07 10.93-1.41 1.41" />
      <path d="M22 22H2" />
      <motion.path
        d="M16 18a4 4 0 0 0-8 0"
        variants={variants.sun}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M12 10V2"
        variants={variants.shaft}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="m8 6 4-4 4 4"
        variants={variants.head}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Sunrise(props: SunriseProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Sunrise,
  Sunrise as SunriseIcon,
  type SunriseProps,
  type SunriseProps as SunriseIconProps,
};
