'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type BotMessageSquareProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
      },
      animate: {
        transformOrigin: 'bottom left',
        rotate: [0, 8, -8, 2, 0],
        transition: {
          ease: 'easeInOut',
          duration: 0.8,
          times: [0, 0.4, 0.6, 0.8, 1],
        },
      },
    },
    path1: {},
    path2: {},
    path3: {},
    path4: {
      initial: {
        scaleY: 1,
      },
      animate: {
        scaleY: [1, 0.5, 1],
        transition: {
          ease: 'easeInOut',
          duration: 0.6,
        },
      },
    },
    path5: {},
    path6: {},
  } satisfies Record<string, Variants>,
  'look-at': {
    group: {},
    path1: {},
    path2: {},
    path3: {},
    path4: {
      initial: {
        x: 0,
        y: 0,
      },
      animate: {
        x: [0, -1.5, 1.5, 0],
        y: [0, 1.5, 1.5, 0],
        transition: {
          ease: 'easeInOut',
          duration: 1.3,
        },
      },
    },
    path5: {
      initial: {
        x: 0,
        y: 0,
      },
      animate: {
        x: [0, -1.5, 1.5, 0],
        y: [0, 1.5, 1.5, 0],
        transition: {
          ease: 'easeInOut',
          duration: 1.3,
        },
      },
    },
    path6: {},
  } satisfies Record<string, Variants>,
  blink: {
    group: {},
    path1: {},
    path2: {},
    path3: {},
    path4: {
      initial: {
        scaleY: 1,
      },
      animate: {
        scaleY: [1, 0.5, 1],
        transition: {
          ease: 'easeInOut',
          duration: 0.6,
        },
      },
    },
    path5: {
      initial: {
        scaleY: 1,
      },
      animate: {
        scaleY: [1, 0.5, 1],
        transition: {
          ease: 'easeInOut',
          duration: 0.6,
        },
      },
    },
    path6: {},
  } satisfies Record<string, Variants>,
  wink: {
    group: {},
    path1: {},
    path2: {},
    path3: {},
    path4: {},
    path5: {
      initial: {
        scaleY: 1,
      },
      animate: {
        scaleY: [1, 0.5, 1],
        transition: {
          ease: 'easeInOut',
          duration: 0.6,
        },
      },
    },
    path6: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: BotMessageSquareProps) {
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
      <motion.g variants={variants.group} initial="initial" animate={controls}>
        <motion.path
          d="M12 6V2H8"
          variants={variants.path1}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="m8 18-4 4V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2Z"
          variants={variants.path2}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M2 12h2"
          variants={variants.path3}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M9 11v2"
          variants={variants.path4}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M15 11v2"
          variants={variants.path5}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M20 12h2"
          variants={variants.path6}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function BotMessageSquare(props: BotMessageSquareProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  BotMessageSquare,
  BotMessageSquare as BotMessageSquareIcon,
  type BotMessageSquareProps,
  type BotMessageSquareProps as BotMessageSquareIconProps,
};
