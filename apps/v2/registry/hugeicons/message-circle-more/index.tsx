'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type MessageCircleMoreProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: { rotate: 0 },
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
    line1: {},
    line2: {},
    line3: {},
    dot1: {
      initial: { d: 'M16.1211 12L15.9961 12' },
      animate: {
        d: [
          'M16.1211 12L15.9961 12',
          'M15.9961 10.5L15.9961 13.5',
          'M16.1211 12L15.9961 12',
        ],
        transition: { ease: 'easeInOut', duration: 0.6, delay: 0.2 },
      },
    },
    dot2: {
      initial: { d: 'M12.1218 12L11.9968 12' },
      animate: {
        d: [
          'M12.1218 12L11.9968 12',
          'M11.9968 10.5L11.9968 13.5',
          'M12.1218 12L11.9968 12',
        ],
        transition: { ease: 'easeInOut', duration: 0.6, delay: 0.1 },
      },
    },
    dot3: {
      initial: { d: 'M8.12109 12L7.99609 12' },
      animate: {
        d: [
          'M8.12109 12L7.99609 12',
          'M7.99609 10.5L7.99609 13.5',
          'M8.12109 12L7.99609 12',
        ],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
  } satisfies Record<string, Variants>,
  pulse: {
    group: {},
    path: {},
    line1: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 1.5, 1],
        transition: { duration: 1, delay: 0.4, ease: 'easeInOut' },
      },
    },
    line2: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 1.5, 1],
        transition: { duration: 1, delay: 0.2, ease: 'easeInOut' },
      },
    },
    line3: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 1.5, 1],
        transition: { duration: 1, ease: 'easeInOut' },
      },
    },
    dot1: {},
    dot2: {},
    dot3: {},
  } satisfies Record<string, Variants>,
  jump: {
    group: {},
    path: {},
    line1: {
      initial: { y: 0 },
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
      initial: { y: 0 },
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
      initial: { y: 0 },
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
    dot1: {},
    dot2: {},
    dot3: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: MessageCircleMoreProps) {
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
      <motion.g variants={variants.group} initial="initial" animate={controls}>
        <motion.path
          d="M21.4961 12C21.4961 17.2467 17.2428 21.5 11.9961 21.5C10.368 21.5 8.83549 21.0904 7.49609 20.3687C5.62786 19.362 4.37071 20.2979 3.26202 20.4658C3.09383 20.4913 2.92634 20.4302 2.80606 20.31C2.6235 20.1274 2.58875 19.8451 2.6896 19.6074C3.12475 18.5818 3.5243 16.6382 2.9795 15C2.6659 14.057 2.49609 13.0483 2.49609 12C2.49609 6.75329 6.74939 2.5 11.9961 2.5C17.2428 2.5 21.4961 6.75329 21.4961 12Z"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path}
          initial="initial"
          animate={controls}
        />
        <motion.g
          variants={variants.line1}
          initial="initial"
          animate={controls}
        >
          <motion.path
            d="M16.1211 12L15.9961 12"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={variants.dot1}
            initial="initial"
            animate={controls}
          />
          <path
            d="M16.2461 12C16.2461 12.1381 16.1342 12.25 15.9961 12.25C15.858 12.25 15.7461 12.1381 15.7461 12C15.7461 11.8619 15.858 11.75 15.9961 11.75C16.1342 11.75 16.2461 11.8619 16.2461 12Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.g>
        <motion.g
          variants={variants.line2}
          initial="initial"
          animate={controls}
        >
          <motion.path
            d="M12.1218 12L11.9968 12"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={variants.dot2}
            initial="initial"
            animate={controls}
          />
          <path
            d="M12.2468 12C12.2468 12.1381 12.1349 12.25 11.9968 12.25C11.8588 12.25 11.7468 12.1381 11.7468 12C11.7468 11.8619 11.8588 11.75 11.9968 11.75C12.1349 11.75 12.2468 11.8619 12.2468 12Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.g>
        <motion.g
          variants={variants.line3}
          initial="initial"
          animate={controls}
        >
          <motion.path
            d="M8.12109 12L7.99609 12"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={variants.dot3}
            initial="initial"
            animate={controls}
          />
          <path
            d="M8.24609 12C8.24609 12.1381 8.13416 12.25 7.99609 12.25C7.85802 12.25 7.74609 12.1381 7.74609 12C7.74609 11.8619 7.85802 11.75 7.99609 11.75C8.13416 11.75 8.24609 11.8619 8.24609 12Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.g>
      </motion.g>
    </motion.svg>
  );
}

function MessageCircleMore(props: MessageCircleMoreProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  MessageCircleMore,
  MessageCircleMore as MessageCircleMoreIcon,
  type MessageCircleMoreProps,
  type MessageCircleMoreProps as MessageCircleMoreIconProps,
};
