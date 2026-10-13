'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type LinkProps = IconProps<keyof typeof animations>;

const animations = {
  // The links unhook along the chain, whole, and snap back (unlink keeps them
  // apart), as Hugeicons' Link; drawn together is `join`.
  default: {
    path1: {
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
    path2: {
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
  } satisfies Record<string, Variants>,
  'default-loop': {
    path1: {
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
    path2: {
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
  } satisfies Record<string, Variants>,
  unlink: {
    path1: {
      initial: { x: 0, y: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
      animate: {
        x: 1,
        y: -1,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
    path2: {
      initial: { x: 0, y: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
      animate: {
        x: -1,
        y: 1,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  join: {
    path1: {
      initial: {
        x: 0,
        y: 0,
        pathLength: 1,
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
        },
      },
      animate: {
        x: -1.5,
        y: 1.5,
        pathLength: 0.85,
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
        },
      },
    },
    path2: {
      initial: {
        x: 0,
        y: 0,
        pathLength: 1,
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
        },
      },
      animate: {
        x: 1.5,
        y: -1.5,
        pathLength: 0.85,
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
        },
      },
    },
  } satisfies Record<string, Variants>,
  'join-loop': {
    path1: {
      initial: {
        x: 0,
        y: 0,
        pathLength: 1,
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
        },
      },
      animate: {
        x: [0, -1.5, 0],
        y: [0, 1.5, 0],
        pathLength: [1, 0.85, 1],
        transition: {
          duration: 0.8,
          ease: 'easeInOut',
        },
      },
    },
    path2: {
      initial: {
        x: 0,
        y: 0,
        pathLength: 1,
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
        },
      },
      animate: {
        x: [0, 1.5, 0],
        y: [0, -1.5, 0],
        pathLength: [1, 0.85, 1],
        transition: {
          duration: 0.8,
          ease: 'easeInOut',
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: LinkProps) {
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
        d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Link(props: LinkProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Link,
  Link as LinkIcon,
  type LinkProps,
  type LinkProps as LinkIconProps,
};
