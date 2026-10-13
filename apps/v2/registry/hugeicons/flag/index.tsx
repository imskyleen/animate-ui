'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type FlagProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    cloth: {
      initial: { skewY: 0, scaleX: 1, transformOrigin: '0% 50%' },
      animate: {
        skewY: [0, 3, -3, 1.5, 0],
        scaleX: [1, 0.9, 1, 0.95, 1],
        transformOrigin: '0% 50%',
        transition: { duration: 0.9, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: FlagProps) {
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
      <path
        d="M5.0249 21C5.04385 19.2643 5.04366 17.5541 5.0366 15.9209"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.0366 15.9209C5.01301 10.4614 4.91276 5.86186 5.19475 4.04271"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <motion.path
        d="M5.19475 4.04271C5.5611 1.67939 9.39301 3.82993 13.9703 5.59842L16.0328 6.48729C17.5508 7.1415 19.7187 8.30352 18.7662 9.66084C18.3738 10.22 17.56 10.8596 16.0575 11.567L5.0366 15.9209"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.cloth}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Flag(props: FlagProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Flag,
  Flag as FlagIcon,
  type FlagProps,
  type FlagProps as FlagIconProps,
};
