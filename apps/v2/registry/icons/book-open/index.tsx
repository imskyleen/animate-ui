'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type BookOpenProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    rightLeaf: {
      initial: {
        scaleX: 1,
        opacity: 1,
        transformOrigin: '0% 50%',
        transition: { duration: 0 },
      },
      animate: {
        scaleX: [1, 0.02, -1, -1],
        opacity: [1, 1, 1, 0],
        transformOrigin: '0% 50%',
        transition: {
          duration: 0.75,
          times: [0, 0.4, 0.8, 1],
          ease: 'easeInOut',
        },
      },
    },
    leftLeaf: { initial: { opacity: 0 }, animate: { opacity: 0 } },
    lineL1: {
      initial: { opacity: 0, pathLength: 0, transition: { duration: 0.12 } },
      animate: {
        opacity: 1,
        pathLength: 1,
        transition: {
          opacity: { duration: 0.1, delay: 0.55 },
          pathLength: { duration: 0.25, delay: 0.55, ease: 'easeOut' },
        },
      },
    },
    lineL2: {
      initial: { opacity: 0, pathLength: 0, transition: { duration: 0.12 } },
      animate: {
        opacity: 1,
        pathLength: 1,
        transition: {
          opacity: { duration: 0.1, delay: 0.65 },
          pathLength: { duration: 0.25, delay: 0.65, ease: 'easeOut' },
        },
      },
    },
    lineR1: {
      initial: { opacity: 0, pathLength: 0 },
      animate: { opacity: 0, pathLength: 0 },
    },
    lineR2: {
      initial: { opacity: 0, pathLength: 0 },
      animate: { opacity: 0, pathLength: 0 },
    },
  } satisfies Record<string, Variants>,
  rtl: {
    rightLeaf: { initial: { opacity: 0 }, animate: { opacity: 0 } },
    leftLeaf: {
      initial: {
        scaleX: 1,
        opacity: 1,
        transformOrigin: '100% 50%',
        transition: { duration: 0 },
      },
      animate: {
        scaleX: [1, 0.02, -1, -1],
        opacity: [1, 1, 1, 0],
        transformOrigin: '100% 50%',
        transition: {
          duration: 0.75,
          times: [0, 0.4, 0.8, 1],
          ease: 'easeInOut',
        },
      },
    },
    lineL1: {
      initial: { opacity: 0, pathLength: 0 },
      animate: { opacity: 0, pathLength: 0 },
    },
    lineL2: {
      initial: { opacity: 0, pathLength: 0 },
      animate: { opacity: 0, pathLength: 0 },
    },
    lineR1: {
      initial: { opacity: 0, pathLength: 0, transition: { duration: 0.12 } },
      animate: {
        opacity: 1,
        pathLength: 1,
        transition: {
          opacity: { duration: 0.1, delay: 0.55 },
          pathLength: { duration: 0.25, delay: 0.55, ease: 'easeOut' },
        },
      },
    },
    lineR2: {
      initial: { opacity: 0, pathLength: 0, transition: { duration: 0.12 } },
      animate: {
        opacity: 1,
        pathLength: 1,
        transition: {
          opacity: { duration: 0.1, delay: 0.65 },
          pathLength: { duration: 0.25, delay: 0.65, ease: 'easeOut' },
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: BookOpenProps) {
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
      <path d="M12 5v16" />
      <path d="M12 5A5 5 0 0 0 8 3H4A2 2 0 0 0 2 5V17A2 2 0 0 0 3.999 19H8A5 5 0 0 1 12 21" />
      <path d="M12 5A5 5 0 0 1 16 3.002L20.001 3A2 2 0 0 1 22 5V17A2 2 0 0 1 20.001 19H16A5 5 0 0 0 12 21" />
      <motion.path
        d="M12 5A5 5 0 0 1 16 3.002L20.001 3A2 2 0 0 1 22 5V17A2 2 0 0 1 20.001 19H16A5 5 0 0 0 12 21V5Z"
        variants={variants.rightLeaf}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M12 5A5 5 0 0 0 8 3H4A2 2 0 0 0 2 5V17A2 2 0 0 0 3.999 19H8A5 5 0 0 1 12 21V5Z"
        variants={variants.leftLeaf}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M6 8h2"
        variants={variants.lineL1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M6 12h2"
        variants={variants.lineL2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M16 8h2"
        variants={variants.lineR1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M16 12h2"
        variants={variants.lineR2}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function BookOpen(props: BookOpenProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  BookOpen,
  BookOpen as BookOpenIcon,
  type BookOpenProps,
  type BookOpenProps as BookOpenIconProps,
};
