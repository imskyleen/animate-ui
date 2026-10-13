'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type AirplayProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path1: {},
    path2: {
      initial: {
        y: 0,
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
      animate: {
        y: 2,
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    path1: {},
    path2: {
      initial: {
        y: 0,
      },
      animate: {
        y: [0, 2, -2, 0],
        transition: {
          duration: 0.8,
          ease: 'easeInOut',
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: AirplayProps) {
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
      <motion.path
        d="M5.5 17C3.52684 16.7534 2 15.0665 2 13.0222V10.0155C2 7.20036 2 5.79279 2.67412 4.78166C2.96596 4.34393 3.34096 3.9681 3.77772 3.67561C4.78661 3 6.19108 3 9 3H15C17.8089 3 19.2134 3 20.2223 3.67561C20.659 3.9681 21.034 4.34393 21.3259 4.78166C22 5.79279 22 7.20036 22 10.0155V13.0222C22 15.0665 20.4732 16.7534 18.5 17"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M14.9007 17.6437L13.4686 16.0924C12.7808 15.3472 12.4369 14.9746 11.999 14.9746C11.5612 14.9746 11.2173 15.3472 10.5294 16.0924L9.09741 17.6437C7.76897 19.0829 7.10475 19.8024 7.36698 20.4014C7.62921 21.0003 8.60848 21.0003 10.567 21.0003H13.4311C15.3896 21.0003 16.3689 21.0003 16.6311 20.4014C16.8933 19.8024 16.2291 19.0829 14.9007 17.6437Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Airplay(props: AirplayProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Airplay,
  Airplay as AirplayIcon,
  type AirplayProps,
  type AirplayProps as AirplayIconProps,
};
