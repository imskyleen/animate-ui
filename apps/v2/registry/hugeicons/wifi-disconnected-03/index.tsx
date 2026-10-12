'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type WifiDisconnected03Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    waves: {},
    x1: {
      initial: { rotate: 0, scale: 1 },
      animate: {
        rotate: [0, 45, 0],
        scale: [1, 0.85, 1],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    x2: {
      initial: { rotate: 0, scale: 1 },
      animate: {
        rotate: [0, 45, 0],
        scale: [1, 0.85, 1],
        transition: { duration: 0.6, ease: 'easeInOut', delay: 0.05 },
      },
    },
    group: {
      initial: { x: 0 },
      animate: {
        // (Their arcs run from edge to edge: more, and they'd be cut.)
        x: [0, -0.6, 0.6, -0.6, 0.6, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: WifiDisconnected03Props) {
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
          d="M2 7.81966C4.75011 5.35989 8.31034 4 12 4M5 11.8587C6.86929 10.0264 9.38247 9.00009 12 9.00009M8.5 15.4287C9.43464 14.5125 10.6912 13.9994 12 13.9994C13.3088 13.9994 14.5654 14.5125 15.5 15.4287M12.1256 18.75H12.0006M12.2506 18.75C12.2506 18.8881 12.1387 19 12.0006 19C11.8625 19 11.7506 18.8881 11.7506 18.75C11.7506 18.6119 11.8625 18.5 12.0006 18.5C12.1387 18.5 12.2506 18.6119 12.2506 18.75Z"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.waves}
          initial="initial"
          animate={controls}
        />
      </motion.g>
      <motion.path
        d="M16 4L22 10"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.x1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M22 4L16 10"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.x2}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function WifiDisconnected03(props: WifiDisconnected03Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  WifiDisconnected03,
  WifiDisconnected03 as WifiDisconnected03Icon,
  type WifiDisconnected03Props,
  type WifiDisconnected03Props as WifiDisconnected03IconProps,
};
