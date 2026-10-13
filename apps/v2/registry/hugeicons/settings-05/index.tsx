'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type Settings05Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    line1: {
      initial: { x: 0 },
      animate: { x: 4, transition: { ease: 'easeInOut', duration: 0.4 } },
    },
    line2: {
      initial: { d: 'M10 8.5L17 8.5' },
      animate: {
        d: 'M14 8.5L17 8.5',
        transition: { ease: 'easeInOut', duration: 0.4 },
      },
    },
    line3: {
      initial: { x: 0 },
      animate: { x: -4, transition: { ease: 'easeInOut', duration: 0.4 } },
    },
    line4: {
      initial: { d: 'M14 15.5L7 15.5' },
      animate: {
        d: 'M10 15.5L7 15.5',
        transition: { ease: 'easeInOut', duration: 0.4 },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    line1: {
      initial: { x: 0 },
      animate: {
        x: [0, 4, 0],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line2: {
      initial: { d: 'M10 8.5L17 8.5' },
      animate: {
        d: ['M10 8.5L17 8.5', 'M14 8.5L17 8.5', 'M10 8.5L17 8.5'],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line3: {
      initial: { x: 0 },
      animate: {
        x: [0, -4, 0],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line4: {
      initial: { d: 'M14 15.5L7 15.5' },
      animate: {
        d: ['M14 15.5L7 15.5', 'M10 15.5L7 15.5', 'M14 15.5L7 15.5'],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: Settings05Props) {
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
      <path
        d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z"
        strokeLinejoin="round"
      />
      <motion.path
        d="M8.5 10C7.67157 10 7 9.32843 7 8.5C7 7.67157 7.67157 7 8.5 7C9.32843 7 10 7.67157 10 8.5C10 9.32843 9.32843 10 8.5 10Z"
        variants={variants.line1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M10 8.5L17 8.5"
        strokeLinecap="round"
        variants={variants.line2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M15.5 17C16.3284 17 17 16.3284 17 15.5C17 14.6716 16.3284 14 15.5 14C14.6716 14 14 14.6716 14 15.5C14 16.3284 14.6716 17 15.5 17Z"
        variants={variants.line3}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M14 15.5L7 15.5"
        strokeLinecap="round"
        variants={variants.line4}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Settings05(props: Settings05Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Settings05,
  Settings05 as Settings05Icon,
  type Settings05Props,
  type Settings05Props as Settings05IconProps,
};
