'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type SendHorizontalProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        scale: 1,
        x: 0,
      },
      animate: {
        scale: [1, 0.8, 1, 1, 1],
        x: [0, '-10%', '125%', '-150%', 0],
        transition: {
          default: { ease: 'easeInOut', duration: 1.2 },
          x: {
            ease: 'easeInOut',
            duration: 1.2,
            times: [0, 0.25, 0.5, 0.5, 1],
          },
        },
      },
    },
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: SendHorizontalProps) {
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
          d="M3.7,3c-.2-.1-.5,0-.7.2,0,.1,0,.3,0,.4l2.8,7.6c.2.5.2.9,0,1.4l-2.8,7.6c0,.3,0,.5.3.6.1,0,.3,0,.4,0l18-8.5c.2-.1.4-.4.2-.7,0-.1-.1-.2-.2-.2L3.7,3Z"
          variants={variants.path1}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M6,12h16"
          variants={variants.path2}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function SendHorizontal(props: SendHorizontalProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  SendHorizontal,
  SendHorizontal as SendHorizontalIcon,
  type SendHorizontalProps,
  type SendHorizontalProps as SendHorizontalIconProps,
};
