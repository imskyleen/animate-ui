'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type MessageSquareDashedProps = IconProps<keyof typeof animations>;

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
    path4: {},
    path5: {},
    path6: {},
    path7: {},
    path8: {},
    path9: {},
  } satisfies Record<string, Variants>,
  draw: {
    group: {},
    ...(() => {
      const paths: Record<string, Variants> = {};

      for (let i = 1; i <= 9; i++) {
        paths[`path${i}`] = {
          initial: { opacity: 0, scale: 0 },
          animate: {
            opacity: [0, 1],
            scale: [0, 1],
            transition: {
              delay: i * 0.2,
              duration: 0.4,
            },
          },
        };
      }

      return paths;
    })(),
  },
} as const;

function IconComponent({ size, ...props }: MessageSquareDashedProps) {
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
          d="M5 3a2 2 0 0 0-2 2"
          variants={variants.path1}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M9 3h1"
          variants={variants.path2}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M14 3h1"
          variants={variants.path3}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M19 3a2 2 0 0 1 2 2"
          variants={variants.path4}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M21 9v1"
          variants={variants.path5}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M21 14v1a2 2 0 0 1-2 2"
          variants={variants.path6}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M14 17h1"
          variants={variants.path7}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M10 17H7l-4 4v-7"
          variants={variants.path8}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M3 9v1"
          variants={variants.path9}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function MessageSquareDashed(props: MessageSquareDashedProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  MessageSquareDashed,
  MessageSquareDashed as MessageSquareDashedIcon,
  type MessageSquareDashedProps,
  type MessageSquareDashedProps as MessageSquareDashedIconProps,
};
