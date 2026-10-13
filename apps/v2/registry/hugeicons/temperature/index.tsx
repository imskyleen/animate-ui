'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type TemperatureProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: { rotate: 0, transformOrigin: '50% 100%' },
      animate: {
        rotate: [0, -6, 6, -3, 0],
        transformOrigin: '50% 100%',
        transition: { duration: 0.7, ease: 'easeInOut' },
      },
    },
    mercury: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.4, ease: 'easeInOut', delay: 0.1 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: TemperatureProps) {
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
        <path
          d="M12 22C14.7614 22 17 19.7614 17 17C17 15.3644 16.2147 13.9122 15.0005 13V5.00049C15.0005 4.06815 15.0005 3.60198 14.8481 3.23428C14.6451 2.74451 14.256 2.35537 13.7662 2.15239C13.3985 2 12.9323 2 12 2C11.0677 2 10.6015 2 10.2338 2.15239C9.74402 2.35537 9.35488 2.74451 9.1519 3.23428C8.99951 3.60198 8.99951 4.06815 8.99951 5.00049V13C7.78534 13.9122 7 15.3644 7 17C7 19.7614 9.23858 22 12 22Z"
          strokeLinejoin="round"
        />
        <path
          d="M12 15C10.8954 15 10 15.8954 10 17C10 18.1046 10.8954 19 12 19C13.1046 19 14 18.1046 14 17C14 15.8954 13.1046 15 12 15Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <motion.path
          d="M12 15V8"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.mercury}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function Temperature(props: TemperatureProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Temperature,
  Temperature as TemperatureIcon,
  type TemperatureProps,
  type TemperatureProps as TemperatureIconProps,
};
