'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type WifiDisconnected04Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    signal: {},
    x1: {
      initial: { rotate: 0 },
      animate: {
        rotate: [0, 45, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    x2: {
      initial: { rotate: 0 },
      animate: {
        rotate: [0, 45, 0],
        transition: { duration: 0.6, ease: 'easeInOut', delay: 0.05 },
      },
    },
    group: {
      initial: { x: 0 },
      animate: {
        x: [0, -0.6, 0.6, -0.6, 0.6, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: WifiDisconnected04Props) {
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
      <motion.g variants={variants.group} initial="initial" animate={controls}>
        <motion.path
          d="M12 21C11.0173 21 10.2863 20.003 8.82421 18.009L3.48742 10.7306C2.40801 9.25847 1.86831 8.52241 2.02741 7.57659C2.18651 6.63078 2.81754 6.2161 4.07962 5.38675C6.38289 3.87318 9.0958 3 12 3C14.9042 3 17.6171 3.87318 19.9204 5.38675C21.1825 6.2161 21.8135 6.63078 21.9726 7.57659C22.1317 8.52241 21.592 9.25847 20.5126 10.7306L19 12.6988"
          strokeLinecap="round"
          variants={variants.signal}
          initial="initial"
          animate={controls}
        />
      </motion.g>
      <motion.path
        d="M21.0002 15L15.0002 21"
        strokeLinecap="round"
        variants={variants.x1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M21.0002 21L15.0002 15"
        strokeLinecap="round"
        variants={variants.x2}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function WifiDisconnected04(props: WifiDisconnected04Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  WifiDisconnected04,
  WifiDisconnected04 as WifiDisconnected04Icon,
  type WifiDisconnected04Props,
  type WifiDisconnected04Props as WifiDisconnected04IconProps,
};
