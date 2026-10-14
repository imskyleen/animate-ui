'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type ShapesProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    triangle: {
      initial: { scale: 1, transformOrigin: '50% 50%' },
      animate: {
        scale: [1, 0.72, 1.08, 1],
        transformOrigin: '50% 50%',
        transition: {
          duration: 0.45,
          times: [0, 0.35, 0.75, 1],
          ease: 'easeOut',
          delay: 0,
        },
      },
    },
    square: {
      initial: { scale: 1, transformOrigin: '50% 50%' },
      animate: {
        scale: [1, 0.72, 1.08, 1],
        transformOrigin: '50% 50%',
        transition: {
          duration: 0.45,
          times: [0, 0.35, 0.75, 1],
          ease: 'easeOut',
          delay: 0.12,
        },
      },
    },
    circle: {
      initial: { scale: 1, transformOrigin: '50% 50%' },
      animate: {
        scale: [1, 0.72, 1.08, 1],
        transformOrigin: '50% 50%',
        transition: {
          duration: 0.45,
          times: [0, 0.35, 0.75, 1],
          ease: 'easeOut',
          delay: 0.24,
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ShapesProps) {
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
        d="M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z"
        variants={variants.triangle}
        initial="initial"
        animate={controls}
      />
      <motion.rect
        x="3"
        y="14"
        width="7"
        height="7"
        rx="1"
        variants={variants.square}
        initial="initial"
        animate={controls}
      />
      <motion.circle
        cx="17.5"
        cy="17.5"
        r="3.5"
        variants={variants.circle}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Shapes(props: ShapesProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Shapes,
  Shapes as ShapesIcon,
  type ShapesProps,
  type ShapesProps as ShapesIconProps,
};
