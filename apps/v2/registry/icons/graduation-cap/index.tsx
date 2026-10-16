'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type GraduationCapProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    hat: {
      initial: { rotate: 0, transformOrigin: '50% 50%' },
      animate: {
        rotate: [0, -8, 4, 0],
        transformOrigin: '50% 50%',
        transition: {
          duration: 0.9,
          times: [0, 0.35, 0.7, 1],
          ease: 'easeInOut',
        },
      },
    },
    tassel: {
      initial: { rotate: 0, transformOrigin: '50% 0%' },
      animate: {
        rotate: [0, 12, -8, 4, 0],
        transformOrigin: '50% 0%',
        transition: {
          duration: 0.9,
          delay: 0.1,
          times: [0, 0.3, 0.6, 0.85, 1],
          ease: 'easeInOut',
        },
      },
    },
    part: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: GraduationCapProps) {
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
      <motion.g variants={variants.hat} initial="initial" animate={controls}>
        <motion.path
          d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"
          variants={variants.part}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M22 10v6"
          variants={variants.tassel}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"
          variants={variants.part}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function GraduationCap(props: GraduationCapProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  GraduationCap,
  GraduationCap as GraduationCapIcon,
  type GraduationCapProps,
  type GraduationCapProps as GraduationCapIconProps,
};
