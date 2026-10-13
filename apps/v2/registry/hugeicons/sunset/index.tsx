'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type SunsetProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    sun: {
      initial: { scale: 1, transformOrigin: '50% 100%' },
      animate: {
        scale: [1, 0.4, 1],
        transformOrigin: '50% 100%',
        transition: { duration: 0.8, ease: 'easeInOut' },
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
      initial: { opacity: 1, scale: 1, transformOrigin: '50% 100%' },
      animate: {
        opacity: [0, 0, 1],
        scale: [0.3, 0.3, 1],
        transformOrigin: '50% 100%',
        transition: { duration: 0.5, ease: 'easeOut', times: [0, 0.5, 1] },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: SunsetProps) {
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
      <path d="M18.3633 10.6357L16.9491 12.05" strokeLinecap="round" />
      <path d="M3 17H5" strokeLinecap="round" />
      <path d="M5.63657 10.6356L7.05078 12.0498" strokeLinecap="round" />
      <path d="M21 17H19" strokeLinecap="round" />
      <path d="M21 20H3" strokeLinecap="round" />
      <motion.path
        d="M16 17C16 14.7909 14.2091 13 12 13C9.79086 13 8 14.7909 8 17"
        strokeLinecap="round"
        variants={variants.sun}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M12 4V10"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.shaft}
        initial="initial"
        animate={controls}
      />
      <motion.g variants={variants.head} initial="initial" animate={controls}>
        <path
          d="M9.5 7.5C9.99153 8.0057 11.2998 10 12 10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14.5 7.5C14.0085 8.0057 12.7002 10 12 10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>
    </motion.svg>
  );
}

function Sunset(props: SunsetProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Sunset,
  Sunset as SunsetIcon,
  type SunsetProps,
  type SunsetProps as SunsetIconProps,
};
