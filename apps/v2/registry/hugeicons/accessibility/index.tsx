'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type AccessibilityProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    circle: {
      initial: { y: 0, x: 0 },
      animate: {
        y: [0, 1, -1, 0],
        x: [0, 1, -1, 0],
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
    },
    group1: {
      initial: { rotate: 0 },
      animate: {
        rotate: [0, 5, -5, 0],
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
    },
    group2: {
      initial: { rotate: 0, transformOrigin: '54.6% 47.3%' },
      animate: {
        rotate: [0, -30, 0],
        transformOrigin: '54.6% 47.3%',
        transition: { duration: 0.8, delay: 0.2, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: AccessibilityProps) {
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
        d="M16.5 6C17.3284 6 18 5.32843 18 4.5C18 3.67157 17.3284 3 16.5 3C15.6716 3 15 3.67157 15 4.5C15 5.32843 15.6716 6 16.5 6Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.circle}
        initial="initial"
        animate={controls}
      />
      <motion.g variants={variants.group1} initial="initial" animate={controls}>
        <path
          d="M9 9.98098L9.30668 9.52623C10.1254 8.31219 10.5348 7.70516 11.1776 7.48717C11.8203 7.26917 12.5205 7.49988 13.9208 7.96129L14.8388 8.2638C15.8614 8.60073 16.3726 8.7692 16.5481 9.18793C16.7236 9.60666 16.4825 10.0832 16.0005 11.0361L14.0228 14.9461"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14.0228 14.9461H16.0319C17.3949 14.9461 18.0764 14.9461 18.3746 15.3883C18.6729 15.8305 18.4108 16.4524 17.8865 17.696L16.5342 20.9043"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14.0228 14.9461H13.8075C12.3309 14.9461 11.5926 14.9461 11.2991 14.4694C11.0055 13.9927 11.3446 13.3445 12.0228 12.0479L14.0228 8.22408"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>
      <motion.path
        d="M8 12.4668C6.51828 13.2031 5.5 14.7322 5.5 16.499C5.5 18.9843 7.51472 20.999 10 20.999C11.5602 20.999 12.935 20.205 13.7422 18.999"
        strokeLinecap="round"
        variants={variants.group2}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Accessibility(props: AccessibilityProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Accessibility,
  Accessibility as AccessibilityIcon,
  type AccessibilityProps,
  type AccessibilityProps as AccessibilityIconProps,
};
