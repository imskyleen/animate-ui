'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type MessageCircleHeartProps = IconProps<keyof typeof animations>;

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
    path2: {
      initial: {
        scale: 1,
      },
      animate: {
        scale: [1, 0.7, 1.1, 1],
        transition: {
          ease: 'easeInOut',
          duration: 0.8,
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: MessageCircleHeartProps) {
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
          d="M21.4974 12C21.4974 17.2467 17.2441 21.5 11.9974 21.5C10.3693 21.5 8.83683 21.0904 7.49744 20.3687C5.62921 19.362 4.37205 20.2979 3.26336 20.4658C3.09517 20.4913 2.92768 20.4302 2.8074 20.31C2.62484 20.1274 2.5901 19.8451 2.69094 19.6074C3.12609 18.5818 3.52564 16.6382 2.98084 15C2.66724 14.057 2.49744 13.0483 2.49744 12C2.49744 6.75329 6.75073 2.5 11.9974 2.5C17.2441 2.5 21.4974 6.75329 21.4974 12Z"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path1}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M11.9974 15.9995C11.9974 15.9995 7.99744 13.5289 7.99744 11.1384C7.99744 9.95712 8.83954 8.99951 9.99744 8.99951C10.5974 8.99951 11.1974 9.20539 11.9974 10.0289C12.7974 9.20539 13.3974 8.99951 13.9974 8.99951C15.1553 8.99951 15.9974 9.95712 15.9974 11.1384C15.9974 13.5289 11.9974 15.9995 11.9974 15.9995Z"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path2}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function MessageCircleHeart(props: MessageCircleHeartProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  MessageCircleHeart,
  MessageCircleHeart as MessageCircleHeartIcon,
  type MessageCircleHeartProps,
  type MessageCircleHeartProps as MessageCircleHeartIconProps,
};
