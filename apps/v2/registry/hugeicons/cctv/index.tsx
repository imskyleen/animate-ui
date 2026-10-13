'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type CctvProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: { x: 0 },
      animate: {
        x: [0, -1.5, -1.5, 1.5, 1.5, 0],
        transition: { duration: 1.8, ease: 'easeInOut' },
      },
    },
    path1: {},
    path2: {},
    path3: {
      initial: { opacity: 1 },
      animate: {
        opacity: [1, 0, 1, 0, 1, 0, 1],
        transition: { duration: 1.8, ease: 'easeInOut' },
      },
    },
    path4: {},
    path5: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: CctvProps) {
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
        d="M2 6C2 4.89543 2.89543 4 4 4H20C21.1046 4 22 4.89543 22 6C22 7.10457 21.1046 8 20 8H4C2.89543 8 2 7.10457 2 6Z"
        strokeLinejoin="round"
      />
      <path
        d="M20 8V12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12V8"
        strokeLinejoin="round"
      />
      <motion.g variants={variants.group} initial="initial" animate={controls}>
        <path d="M15 14C15 15.6569 13.6569 17 12 17C10.3431 17 9 15.6569 9 14C9 12.3431 10.3431 11 12 11C13.6569 11 15 12.3431 15 14Z" />
        <motion.path
          d="M12 13.875V14"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path3}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M12.25 14C12.25 14.1381 12.1381 14.25 12 14.25C11.8619 14.25 11.75 14.1381 11.75 14C11.75 13.8619 11.8619 13.75 12 13.75C12.1381 13.75 12.25 13.8619 12.25 14Z"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path3}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function Cctv(props: CctvProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Cctv,
  Cctv as CctvIcon,
  type CctvProps,
  type CctvProps as CctvIconProps,
};
