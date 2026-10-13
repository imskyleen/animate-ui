'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type BinaryProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    rect1: {
      initial: {
        x: 0,
      },
      animate: {
        x: -8,
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
        },
      },
    },
    rect2: {
      initial: {
        x: 0,
      },
      animate: {
        x: 8,
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
        },
      },
    },
    path1: {
      initial: {
        y: 0,
      },
      animate: {
        y: -10,
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
        },
      },
    },
    path2: {
      initial: {
        y: 0,
      },
      animate: {
        y: 10,
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: BinaryProps) {
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
      <motion.g variants={variants.rect1} initial="initial" animate={controls}>
        <path
          d="M18.5 21L14.5 21"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16.5 21V15.4878C16.5 14.6127 16.5 14.1752 16.2236 14.0367C15.9472 13.8981 15.5981 14.1606 14.9 14.6856L14.5 14.9864"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>
      <motion.g variants={variants.rect2} initial="initial" animate={controls}>
        <path
          d="M9.59961 10L5.59961 10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7.59961 10V4.48779C7.59961 3.61275 7.59961 3.17523 7.32322 3.03665C7.04682 2.89808 6.69775 3.1606 5.99961 3.68562L5.59961 3.98644"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>
      <motion.path
        d="M10 18.5V16.5C10 15.1193 8.88071 14 7.5 14C6.11929 14 5 15.1193 5 16.5V18.5C5 19.8807 6.11929 21 7.5 21C8.88071 21 10 19.8807 10 18.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M19 7.5V5.5C19 4.11929 17.8807 3 16.5 3C15.1193 3 14 4.11929 14 5.5V7.5C14 8.88071 15.1193 10 16.5 10C17.8807 10 19 8.88071 19 7.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Binary(props: BinaryProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Binary,
  Binary as BinaryIcon,
  type BinaryProps,
  type BinaryProps as BinaryIconProps,
};
