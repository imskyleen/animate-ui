'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type RotateRight01Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path1: {},
    path2: {},
    group: {
      initial: { rotate: 0 },
      animate: {
        rotate: [0, 12, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: RotateRight01Props) {
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
          d="M3.97007 14.8124L4.6194 14.4192C5.18035 14.0967 5.62166 13.6021 5.87794 13.0089L8.30346 7.39389C8.39092 7.19143 8.51089 7.02259 8.65596 6.88362C9.29728 6.26925 10.4057 6.52945 10.9441 7.23506C11.9381 8.53788 10.6029 9.77147 10.885 10.8578L18.6394 6.50335C20.4431 5.53116 22.0009 8.11395 20.208 9.30708L15.618 11.8574C16.502 13.0104 18.7435 18.6031 15.871 20.3087C15.7077 20.4056 15.5268 20.4701 15.3452 20.5262C15.2284 20.5622 15.1115 20.5985 14.9956 20.6347C14.094 20.9157 12.3891 21.2692 11.2209 21.1674C10.0048 21.0614 9.24274 21.7091 8.30349 22.2491"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path1}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M14.6474 4.72061C14.2501 5.11704 12.5218 5.00267 11.8843 4.92307M14.6474 4.72061C15.0446 4.32417 15.056 2.38825 14.9762 1.75209M14.6474 4.72061C13.6253 2.94883 9.56188 0.122614 5.52965 2.94883C3.58112 4.31456 3.30617 5.17524 2.99803 5.75183"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path2}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function RotateRight01(props: RotateRight01Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  RotateRight01,
  RotateRight01 as RotateRight01Icon,
  type RotateRight01Props,
  type RotateRight01Props as RotateRight01IconProps,
};
