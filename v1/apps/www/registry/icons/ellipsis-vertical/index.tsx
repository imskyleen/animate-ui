'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type EllipsisVerticalProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
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
    circle1: {},
    circle2: {},
    circle3: {},
  } satisfies Record<string, Variants>,
  horizontal: {
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
    circle1: {},
    circle2: {},
    circle3: {},
  } satisfies Record<string, Variants>,
  pulse: {
    group: {},
    circle1: {
      initial: {
        scale: 1,
      },
      animate: {
        scale: [1, 1.5, 1],
        transition: {
          duration: 1,
          delay: 0.4,
          ease: 'easeInOut',
        },
      },
    },
    circle2: {
      initial: {
        scale: 1,
      },
      animate: {
        scale: [1, 1.5, 1],
        transition: {
          duration: 1,
          delay: 0.2,
          ease: 'easeInOut',
        },
      },
    },
    circle3: {
      initial: {
        scale: 1,
      },
      animate: {
        scale: [1, 1.5, 1],
        transition: {
          duration: 1,
          ease: 'easeInOut',
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: EllipsisVerticalProps) {
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
      variants={variants.group}
      initial="initial"
      animate={controls}
      {...props}
    >
      <motion.circle
        cx={12}
        cy={19}
        r={1}
        variants={variants.circle1}
        initial="initial"
        animate={controls}
      />
      <motion.circle
        cx={12}
        cy={12}
        r={1}
        variants={variants.circle2}
        initial="initial"
        animate={controls}
      />
      <motion.circle
        cx={12}
        cy={5}
        r={1}
        variants={variants.circle3}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function EllipsisVertical(props: EllipsisVerticalProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  EllipsisVertical,
  EllipsisVertical as EllipsisVerticalIcon,
  type EllipsisVerticalProps,
  type EllipsisVerticalProps as EllipsisVerticalIconProps,
};
