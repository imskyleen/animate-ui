'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type WifiError01Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    arc1: {},
    arc2: {},
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
    badge: {},
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

function IconComponent({ size, ...props }: WifiError01Props) {
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
          d="M18.5 9.99761C14.7324 6.66535 9.5 6.66535 5.5 9.99761"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.arc1}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M2 6.9986C8.31579 1.66699 15.6842 1.66698 22 6.99849"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.arc2}
          initial="initial"
          animate={controls}
        />
      </motion.g>
      <motion.path
        d="M11.9933 14.9853V16.4964M11.9933 18.4673V18.4984"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.mark}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M12.1444 12.0075C12.4933 11.9942 13.375 12.163 14.2349 13.6825L16.3884 17.3742C17.2109 18.5922 17.6154 20.7778 14.5873 20.9418L12 21.0002L9.3841 20.926C6.35606 20.7621 6.82207 18.5938 7.58302 17.3585L9.73652 13.6667C10.5964 12.1473 11.4781 11.9784 11.8271 11.9918L12.1444 12.0075Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.badge}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function WifiError01(props: WifiError01Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  WifiError01,
  WifiError01 as WifiError01Icon,
  type WifiError01Props,
  type WifiError01Props as WifiError01IconProps,
};
