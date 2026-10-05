'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type ListProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    rect: {},
    path1: {
      initial: {
        pathLength: 1,
        opacity: 1,
        scale: 1,
      },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        scale: [1.1, 1],
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
        },
      },
    },
    path2: {
      initial: {
        pathLength: 1,
        opacity: 1,
        scale: 1,
      },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        scale: [1.1, 1],
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
          delay: 0.2,
        },
      },
    },
    path3: {
      initial: {
        pathLength: 1,
        opacity: 1,
        scale: 1,
      },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        scale: [1.1, 1],
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
          delay: 0.4,
        },
      },
    },
    path4: {
      initial: {
        pathLength: 1,
        opacity: 1,
        scale: 1,
      },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        scale: [1.1, 1],
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
          delay: 0.6,
        },
      },
    },
    path5: {
      initial: {
        pathLength: 1,
        opacity: 1,
        scale: 1,
      },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        scale: [1.1, 1],
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
          delay: 0.8,
        },
      },
    },
    path6: {
      initial: {
        pathLength: 1,
        opacity: 1,
        scale: 1,
      },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        scale: [1.1, 1],
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
          delay: 1,
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ListProps) {
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
        d="M3 5h.01"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M8 5h13"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M3 12h.01"
        variants={variants.path3}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M8 12h13"
        variants={variants.path4}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M3 19h.01"
        variants={variants.path5}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M8 19h13"
        variants={variants.path6}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function List(props: ListProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  List,
  List as ListIcon,
  type ListProps,
  type ListProps as ListIconProps,
};
