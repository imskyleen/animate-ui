'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type LockProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
        scale: 1,
      },
      animate: {
        rotate: [0, -5, 7, 0],
        scale: [1, 0.9, 1, 1],
        transition: {
          duration: 1.2,
          ease: 'easeInOut',
        },
      },
    },
    path: {
      initial: {
        pathLength: 1,
      },
      animate: {
        pathLength: [1, 0.8, 1, 1],
        transition: {
          duration: 1.2,
          ease: 'easeInOut',
        },
      },
    },
    rect: {},
  } satisfies Record<string, Variants>,
  unlock: {
    group: {
      initial: {
        rotate: 0,
        scale: 1,
      },
      animate: {
        rotate: [0, -5, 0],
        scale: [1, 0.9, 1],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
        },
      },
    },
    path: {
      initial: {
        pathLength: 1,
      },
      animate: {
        pathLength: 0.8,
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
        },
      },
    },
    rect: {},
  } satisfies Record<string, Variants>,
  lock: {
    group: {
      initial: {
        rotate: 0,
        scale: 1,
      },
      animate: {
        rotate: [0, 7, 0],
        scale: [1, 0.9, 1],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
        },
      },
    },
    path: {
      initial: {
        pathLength: 0.8,
      },
      animate: {
        pathLength: 1,
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
        },
      },
    },
    rect: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: LockProps) {
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
      initial="initial"
      animate={controls}
      {...props}
    >
      <motion.g variants={variants.group} initial="initial" animate={controls}>
        <motion.rect
          width="18"
          height="11"
          x="3"
          y="11"
          rx="2"
          ry="2"
          variants={variants.rect}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M7 11V7a5 5 0 0 1 10 0v4"
          variants={variants.path}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function Lock(props: LockProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Lock,
  Lock as LockIcon,
  type LockProps,
  type LockProps as LockIconProps,
};
