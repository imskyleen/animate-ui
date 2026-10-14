'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type LayoutTemplateProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    header: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 0.7, 1.05, 1],
        transition: {
          duration: 0.45,
          times: [0, 0.35, 0.7, 1],
          ease: 'easeInOut',
        },
      },
    },
    left: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 0.7, 1.05, 1],
        transition: {
          duration: 0.45,
          times: [0, 0.35, 0.7, 1],
          ease: 'easeInOut',
          delay: 0.1,
        },
      },
    },
    right: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 0.7, 1.05, 1],
        transition: {
          duration: 0.45,
          times: [0, 0.35, 0.7, 1],
          ease: 'easeInOut',
          delay: 0.2,
        },
      },
    },
  } satisfies Record<string, Variants>,
  slide: {
    header: {
      initial: { y: 0, opacity: 1 },
      animate: {
        y: [0, -2, -2, 0],
        opacity: [1, 0, 0, 1],
        transition: {
          duration: 0.5,
          times: [0, 0.3, 0.4, 1],
          ease: 'easeOut',
        },
      },
    },
    left: {
      initial: { x: 0, opacity: 1 },
      animate: {
        x: [0, -2, -2, 0],
        opacity: [1, 0, 0, 1],
        transition: {
          duration: 0.5,
          times: [0, 0.3, 0.4, 1],
          ease: 'easeOut',
          delay: 0.14,
        },
      },
    },
    right: {
      initial: { x: 0, opacity: 1 },
      animate: {
        x: [0, 2, 2, 0],
        opacity: [1, 0, 0, 1],
        transition: {
          duration: 0.5,
          times: [0, 0.3, 0.4, 1],
          ease: 'easeOut',
          delay: 0.28,
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: LayoutTemplateProps) {
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
      <motion.rect
        x={3}
        y={3}
        width={18}
        height={7}
        rx={1}
        variants={variants.header}
        initial="initial"
        animate={controls}
      />
      <motion.rect
        x={3}
        y={14}
        width={9}
        height={7}
        rx={1}
        variants={variants.left}
        initial="initial"
        animate={controls}
      />
      <motion.rect
        x={16}
        y={14}
        width={5}
        height={7}
        rx={1}
        variants={variants.right}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function LayoutTemplate(props: LayoutTemplateProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  LayoutTemplate,
  LayoutTemplate as LayoutTemplateIcon,
  type LayoutTemplateProps,
  type LayoutTemplateProps as LayoutTemplateIconProps,
};
