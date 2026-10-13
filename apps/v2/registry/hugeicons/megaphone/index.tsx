'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type MegaphoneProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    horn: {
      initial: { scale: 1, transformOrigin: '0% 50%' },
      animate: {
        scale: [1, 1.06, 1, 1.06, 1],
        transformOrigin: '0% 50%',
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    lines: {
      initial: { opacity: 1, x: 0 },
      animate: {
        opacity: [1, 0.25, 1, 0.25, 1],
        x: [0, 0.6, 0, 0.6, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: MegaphoneProps) {
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
      <motion.g variants={variants.horn} initial="initial" animate={controls}>
        <path
          d="M9 14V6H6C5.07003 6 4.60504 6 4.22354 6.10222C3.18827 6.37962 2.37962 7.18827 2.10222 8.22354C2 8.60504 2 9.07003 2 10C2 10.93 2 11.395 2.10222 11.7765C2.37962 12.8117 3.18827 13.6204 4.22354 13.8978C4.60504 14 5.07003 14 6 14H9Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 14L9.96466 18.8233C9.98816 18.9408 10 19.0604 10 19.1802V19.3411C10 20.2573 9.25728 21 8.34109 21C7.55885 21 6.8829 20.4536 6.719 19.6887L5.5 14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 6H9V14H10C11.2982 14 12.5614 14.4211 13.6 15.2L15.747 16.8103C15.9112 16.9334 16.111 17 16.3162 17C16.7246 17 17.0909 16.7404 17.2088 16.3495C17.5537 15.2067 18 13.2728 18 10C18 6.72718 17.5537 4.79327 17.2088 3.65054C17.0909 3.25961 16.7246 3 16.3162 3C16.111 3 15.9112 3.06658 15.747 3.18974L13.6 4.8C12.5614 5.57893 11.2982 6 10 6Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>
      <motion.g variants={variants.lines} initial="initial" animate={controls}>
        <path d="M21 9.99996H22" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M20.5 6.00109L21.5 5.40637"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20.5 14L21.5 14.6481"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>
    </motion.svg>
  );
}

function Megaphone(props: MegaphoneProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Megaphone,
  Megaphone as MegaphoneIcon,
  type MegaphoneProps,
  type MegaphoneProps as MegaphoneIconProps,
};
