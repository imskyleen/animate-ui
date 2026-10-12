'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type WifiError02Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    arcs: {},
    mark: {
      initial: { y: 0 },
      animate: {
        y: [0, 1, -0.25, 0],
        transition: {
          duration: 0.8,
          ease: 'easeInOut',
          times: [0, 0.4, 0.7, 1],
        },
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

function IconComponent({ size, ...props }: WifiError02Props) {
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
          d="M2 8.31974C3.99395 6.5363 6.41376 5.33105 9 4.8031M22 8.31974C20.0061 6.5363 17.5862 5.33105 15 4.8031M5 12.3587C6.13592 11.2453 7.50961 10.4295 9 9.96076M19 12.3587C17.8641 11.2453 16.4904 10.4295 15 9.96076M8.5 15.9287C8.65791 15.774 8.82501 15.6307 9 15.4994M15.5 15.9287C15.3421 15.774 15.175 15.6307 15 15.4994"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.arcs}
          initial="initial"
          animate={controls}
        />
      </motion.g>
      <motion.path
        d="M12 15.5001V4.50006M12.1256 19.2501H12.0006M12.2506 19.2501C12.2506 19.3881 12.1387 19.5001 12.0006 19.5001C11.8625 19.5001 11.7506 19.3881 11.7506 19.2501C11.7506 19.112 11.8625 19.0001 12.0006 19.0001C12.1387 19.0001 12.2506 19.112 12.2506 19.2501Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.mark}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function WifiError02(props: WifiError02Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  WifiError02,
  WifiError02 as WifiError02Icon,
  type WifiError02Props,
  type WifiError02Props as WifiError02IconProps,
};
