'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type ClockAlertProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    face1: {},
    group: {
      initial: { x: 0 },
      animate: {
        x: [0, -0.6, 0.6, -0.6, 0.6, 0],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
    mark: {},
    dot: {},
    minute: {
      initial: {
        rotate: 0,
        transformOrigin: '50% 100%',
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
      animate: {
        rotate: 360,
        transformOrigin: '50% 100%',
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    hour: {
      initial: {
        rotate: 0,
        transformOrigin: '0% 0%',
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
      animate: {
        rotate: [0, 20, 0],
        transformOrigin: '0% 0%',
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ClockAlertProps) {
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
        d="M21.9 10C20.9734 5.43552 16.9379 2 12.1 2C6.57717 2 2.10002 6.47715 2.10002 12C2.10002 17.5228 6.57717 22 12.1 22C13.1452 22 14.153 21.8396 15.1 21.5422"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.face1}
        initial="initial"
        animate={controls}
      />
      <motion.g variants={variants.group} initial="initial" animate={controls}>
        <motion.path
          d="M20.1 18V14"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.mark}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M20.225 21.75H20.1M20.35 21.75C20.35 21.8881 20.2381 22 20.1 22C19.962 22 19.85 21.8881 19.85 21.75C19.85 21.6119 19.962 21.5 20.1 21.5C20.2381 21.5 20.35 21.6119 20.35 21.75Z"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.dot}
          initial="initial"
          animate={controls}
        />
      </motion.g>
      <motion.path
        d="M12.1 8L12.1 12"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.minute}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M14.1 14L12.1 12"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.hour}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function ClockAlert(props: ClockAlertProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  ClockAlert,
  ClockAlert as ClockAlertIcon,
  type ClockAlertProps,
  type ClockAlertProps as ClockAlertIconProps,
};
