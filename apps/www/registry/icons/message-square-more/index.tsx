'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type MessageSquareMoreProps = IconProps<keyof typeof animations>;

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
    path: {},
    line1: {
      initial: {
        y1: 10,
        y2: 10,
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
      animate: {
        y1: [10, 8.5, 10],
        y2: [10, 11.5, 10],
        transition: { ease: 'easeInOut', duration: 0.6, delay: 0.2 },
      },
    },
    line2: {
      initial: {
        y1: 10,
        y2: 10,
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
      animate: {
        y1: [10, 8.5, 10],
        y2: [10, 11.5, 10],
        transition: { ease: 'easeInOut', duration: 0.6, delay: 0.1 },
      },
    },
    line3: {
      initial: {
        y1: 10,
        y2: 10,
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
      animate: {
        y1: [10, 8.5, 10],
        y2: [10, 11.5, 10],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
  } satisfies Record<string, Variants>,
  pulse: {
    group: {},
    path: {},
    line1: {
      initial: {
        scale: 1,
      },
      animate: {
        scale: [1, 1.5, 1],
        transition: {
          duration: 1,
          delay: 0.4,
          ease: 'easeInOut',
        },
      },
    },
    line2: {
      initial: {
        scale: 1,
      },
      animate: {
        scale: [1, 1.5, 1],
        transition: {
          duration: 1,
          delay: 0.2,
          ease: 'easeInOut',
        },
      },
    },
    line3: {
      initial: {
        scale: 1,
      },
      animate: {
        scale: [1, 1.5, 1],
        transition: {
          duration: 1,
          ease: 'easeInOut',
        },
      },
    },
  } satisfies Record<string, Variants>,
  jump: {
    group: {},
    path: {},
    line1: {
      initial: {
        y: 0,
      },
      animate: {
        y: [-0.75, 0.75],
        transition: {
          duration: 0.8,
          delay: 0.4,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
        },
      },
    },
    line2: {
      initial: {
        y: 0,
      },
      animate: {
        y: [-0.75, 0.75],
        transition: {
          duration: 0.8,
          delay: 0.2,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
        },
      },
    },
    line3: {
      initial: {
        y: 0,
      },
      animate: {
        y: [-0.75, 0.75],
        transition: {
          duration: 0.8,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: MessageSquareMoreProps) {
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
          d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
          variants={variants.path}
          initial="initial"
          animate={controls}
        />
        <motion.line
          x1="16"
          y1="10"
          x2="16"
          y2="10"
          variants={variants.line1}
          initial="initial"
          animate={controls}
        />
        <motion.line
          x1="12"
          y1="10"
          x2="12"
          y2="10"
          variants={variants.line2}
          initial="initial"
          animate={controls}
        />
        <motion.line
          x1="8"
          y1="10"
          x2="8"
          y2="10"
          variants={variants.line3}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function MessageSquareMore(props: MessageSquareMoreProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  MessageSquareMore,
  MessageSquareMore as MessageSquareMoreIcon,
  type MessageSquareMoreProps,
  type MessageSquareMoreProps as MessageSquareMoreIconProps,
};
