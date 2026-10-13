'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type Link01Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path1: {
      initial: { x: 0, y: 0 },
      animate: {
        x: [0, -1, 0],
        y: [0, 1, 0],
        transition: {
          duration: 0.6,
          times: [0, 0.4, 1],
          ease: ['easeOut', 'backOut'],
        },
      },
    },
    path2: {
      initial: { x: 0, y: 0 },
      animate: {
        x: [0, 1, 0],
        y: [0, -1, 0],
        transition: {
          duration: 0.6,
          times: [0, 0.4, 1],
          ease: ['easeOut', 'backOut'],
        },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    path1: {
      initial: { x: 0, y: 0 },
      animate: {
        x: [0, -1, 0],
        y: [0, 1, 0],
        transition: {
          duration: 0.8,
          times: [0, 0.4, 1],
          ease: ['easeOut', 'backOut'],
        },
      },
    },
    path2: {
      initial: { x: 0, y: 0 },
      animate: {
        x: [0, 1, 0],
        y: [0, -1, 0],
        transition: {
          duration: 0.8,
          times: [0, 0.4, 1],
          ease: ['easeOut', 'backOut'],
        },
      },
    },
  } satisfies Record<string, Variants>,
  unlink: {
    path1: {
      initial: { x: 0, y: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
      animate: {
        x: -1,
        y: 1,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
    path2: {
      initial: { x: 0, y: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
      animate: {
        x: 1,
        y: -1,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  join: {
    path1: {
      initial: { x: 0, y: 0, pathLength: 1 },
      animate: {
        x: 1.5,
        y: -1.5,
        pathLength: 0.85,
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
    },
    path2: {
      initial: { x: 0, y: 0, pathLength: 1 },
      animate: {
        x: -1.5,
        y: 1.5,
        pathLength: 0.85,
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  'join-loop': {
    path1: {
      initial: { x: 0, y: 0, pathLength: 1 },
      animate: {
        x: [0, 1.5, 0],
        y: [0, -1.5, 0],
        pathLength: [1, 0.85, 1],
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
    },
    path2: {
      initial: { x: 0, y: 0, pathLength: 1 },
      animate: {
        x: [0, -1.5, 0],
        y: [0, 1.5, 0],
        pathLength: [1, 0.85, 1],
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: Link01Props) {
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
        d="M9.14339 10.691L9.35031 10.4841C11.329 8.50532 14.5372 8.50532 16.5159 10.4841C18.4947 12.4628 18.4947 15.671 16.5159 17.6497L13.6497 20.5159C11.671 22.4947 8.46279 22.4947 6.48405 20.5159C4.50532 18.5372 4.50532 15.329 6.48405 13.3503L6.9484 12.886"
        strokeLinecap="round"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M17.0516 11.114L17.5159 10.6497C19.4947 8.67095 19.4947 5.46279 17.5159 3.48405C15.5372 1.50532 12.329 1.50532 10.3503 3.48405L7.48405 6.35031C5.50532 8.32904 5.50532 11.5372 7.48405 13.5159C9.46279 15.4947 12.671 15.4947 14.6497 13.5159L14.8566 13.309"
        strokeLinecap="round"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Link01(props: Link01Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Link01,
  Link01 as Link01Icon,
  type Link01Props,
  type Link01Props as Link01IconProps,
};
