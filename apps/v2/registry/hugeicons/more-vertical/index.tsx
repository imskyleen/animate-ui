'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type MoreVerticalProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    dot1: {},
    dot2: {},
    dot3: {},
    group: {
      initial: {
        rotate: 0,
        transition: { type: 'spring', stiffness: 60, damping: 10 },
      },
      animate: {
        rotate: 180,
        transition: { type: 'spring', stiffness: 60, damping: 10 },
      },
    },
  } satisfies Record<string, Variants>,
  horizontal: {
    dot1: {},
    dot2: {},
    dot3: {},
    group: {
      initial: {
        rotate: 0,
        transition: { type: 'spring', stiffness: 100, damping: 12 },
      },
      animate: {
        rotate: 90,
        transition: { type: 'spring', stiffness: 100, damping: 12 },
      },
    },
  } satisfies Record<string, Variants>,
  pulse: {
    dot1: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 1.5, 1],
        transition: { duration: 1, ease: 'easeInOut', delay: 0 },
      },
    },
    dot2: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 1.5, 1],
        transition: { duration: 1, ease: 'easeInOut', delay: 0.2 },
      },
    },
    dot3: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 1.5, 1],
        transition: { duration: 1, ease: 'easeInOut', delay: 0.4 },
      },
    },
    group: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: MoreVerticalProps) {
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
          d="M11.9967 6.5V6M12.9967 6.5C12.9967 5.94772 12.549 5.5 11.9967 5.5C11.4444 5.5 10.9967 5.94772 10.9967 6.5C10.9967 7.05228 11.4444 7.5 11.9967 7.5C12.549 7.5 12.9967 7.05228 12.9967 6.5Z"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.dot1}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M11.9967 12.5V12M12.9967 12.5C12.9967 11.9477 12.549 11.5 11.9967 11.5C11.4444 11.5 10.9967 11.9477 10.9967 12.5C10.9967 13.0523 11.4444 13.5 11.9967 13.5C12.549 13.5 12.9967 13.0523 12.9967 12.5Z"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.dot2}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M11.9967 18.5V18M12.9967 18.5C12.9967 17.9477 12.549 17.5 11.9967 17.5C11.4444 17.5 10.9967 17.9477 10.9967 18.5C10.9967 19.0523 11.4444 19.5 11.9967 19.5C12.549 19.5 12.9967 19.0523 12.9967 18.5Z"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.dot3}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function MoreVertical(props: MoreVerticalProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  MoreVertical,
  MoreVertical as MoreVerticalIcon,
  type MoreVerticalProps,
  type MoreVerticalProps as MoreVerticalIconProps,
};
