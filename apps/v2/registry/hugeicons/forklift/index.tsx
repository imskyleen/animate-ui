'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type ForkliftProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    circle1: {},
    circle2: {},
    path1: {},
    path2: {},
    line: {
      initial: { y: 0 },
      animate: {
        y: [0, -11, -10],
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    circle1: {},
    circle2: {},
    path1: {},
    path2: {},
    line: {
      initial: { y: 0 },
      animate: {
        y: [0, -11, -10, 0],
        transition: { duration: 1.2, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ForkliftProps) {
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
      <path d="M17 3V15" strokeLinecap="round" strokeLinejoin="round" />
      <motion.path
        d="M17 15C17 16.8856 17 17.8284 17.5858 18.4142C18.1716 19 19.1144 19 21 19H22"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.line}
        initial="initial"
        animate={controls}
      />
      <path d="M16 19H20" strokeLinecap="round" />
      <path d="M8 19H12" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M17 19V17C17 15.1144 17 14.1716 16.4142 13.5858C15.8284 13 14.8856 13 13 13H9.11803C8.63287 13 8.39029 13 8.185 12.9014C8.12141 12.8708 8.06123 12.8336 8.00547 12.7904C7.82546 12.6509 7.71697 12.4339 7.5 12C7.28303 11.5661 7.17454 11.3491 6.99453 11.2096C6.93877 11.1664 6.87859 11.1292 6.815 11.0986C6.60971 11 6.36713 11 5.88197 11H5.81966C4.1088 11 3.25338 11 2.6894 11.4893C2.61805 11.5512 2.55116 11.618 2.48926 11.6894C2 12.2534 2 13.1088 2 14.8197V17C2 17.9428 2 18.4142 2.29289 18.7071C2.58579 19 3.05719 19 4 19"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 11V6.88304C4 6.06082 4 5.64972 4.11905 5.32028C4.32106 4.76126 4.76126 4.32106 5.32028 4.11905C5.64972 4 6.06082 4 6.88304 4C7.79699 4 8.25397 4 8.65449 4.11333C9.3326 4.30519 9.92152 4.72966 10.318 5.3123C10.5521 5.65643 10.6967 6.08996 10.9857 6.95701L13 13"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <motion.path
        d="M14 21C15.1046 21 16 20.1046 16 19C16 17.8954 15.1046 17 14 17C12.8954 17 12 17.8954 12 19C12 20.1046 12.8954 21 14 21Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.circle1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M6 21C7.10457 21 8 20.1046 8 19C8 17.8954 7.10457 17 6 17C4.89543 17 4 17.8954 4 19C4 20.1046 4.89543 21 6 21Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.circle2}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Forklift(props: ForkliftProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Forklift,
  Forklift as ForkliftIcon,
  type ForkliftProps,
  type ForkliftProps as ForkliftIconProps,
};
