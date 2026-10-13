'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type MessageCircleProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path: {
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
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: MessageCircleProps) {
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
        d="M21.4961 12C21.4961 17.2467 17.2428 21.5 11.9961 21.5C10.368 21.5 8.83549 21.0904 7.49609 20.3687C5.62786 19.362 4.37071 20.2979 3.26202 20.4658C3.09383 20.4913 2.92634 20.4302 2.80606 20.31C2.6235 20.1274 2.58875 19.8451 2.6896 19.6074C3.12475 18.5818 3.5243 16.6382 2.9795 15C2.6659 14.057 2.49609 13.0483 2.49609 12C2.49609 6.75329 6.74939 2.5 11.9961 2.5C17.2428 2.5 21.4961 6.75329 21.4961 12Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function MessageCircle(props: MessageCircleProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  MessageCircle,
  MessageCircle as MessageCircleIcon,
  type MessageCircleProps,
  type MessageCircleProps as MessageCircleIconProps,
};
