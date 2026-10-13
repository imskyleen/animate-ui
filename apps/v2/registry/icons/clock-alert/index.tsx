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
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <motion.path
        d="M21.25 8.2A10 10 0 1 0 16 21.16"
        variants={variants.face1}
        initial="initial"
        animate={controls}
      />
      <motion.g variants={variants.group} initial="initial" animate={controls}>
        <motion.path
          d="M20 12v5"
          variants={variants.mark}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M20 21h.01"
          variants={variants.dot}
          initial="initial"
          animate={controls}
        />
      </motion.g>
      <motion.path
        d="M12 6V12"
        variants={variants.minute}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M12 12L16 14"
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
