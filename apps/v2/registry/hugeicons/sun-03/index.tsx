'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type Sun03Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    circle: {},
    line1: {
      initial: { opacity: 1, pathLength: 1 },
      animate: {
        opacity: [0, 1],
        pathLength: [0, 1],
        transition: { duration: 0.6, ease: 'easeInOut', delay: 0.0 },
      },
    },
    line2: {
      initial: { opacity: 1, pathLength: 1 },
      animate: {
        opacity: [0, 1],
        pathLength: [0, 1],
        transition: { duration: 0.6, ease: 'easeInOut', delay: 0.15 },
      },
    },
    line3: {
      initial: { opacity: 1, pathLength: 1 },
      animate: {
        opacity: [0, 1],
        pathLength: [0, 1],
        transition: { duration: 0.6, ease: 'easeInOut', delay: 0.3 },
      },
    },
    line4: {
      initial: { opacity: 1, pathLength: 1 },
      animate: {
        opacity: [0, 1],
        pathLength: [0, 1],
        transition: { duration: 0.6, ease: 'easeInOut', delay: 0.45 },
      },
    },
    line5: {
      initial: { opacity: 1, pathLength: 1 },
      animate: {
        opacity: [0, 1],
        pathLength: [0, 1],
        transition: { duration: 0.6, ease: 'easeInOut', delay: 0.6 },
      },
    },
    line6: {
      initial: { opacity: 1, pathLength: 1 },
      animate: {
        opacity: [0, 1],
        pathLength: [0, 1],
        transition: { duration: 0.6, ease: 'easeInOut', delay: 0.75 },
      },
    },
    line7: {
      initial: { opacity: 1, pathLength: 1 },
      animate: {
        opacity: [0, 1],
        pathLength: [0, 1],
        transition: { duration: 0.6, ease: 'easeInOut', delay: 0.9 },
      },
    },
    line8: {
      initial: { opacity: 1, pathLength: 1 },
      animate: {
        opacity: [0, 1],
        pathLength: [0, 1],
        transition: { duration: 0.6, ease: 'easeInOut', delay: 1.05 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: Sun03Props) {
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
        d="M17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12Z"
        variants={variants.circle}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M12 3.5V2"
        strokeLinecap="round"
        variants={variants.line1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M18.0106 5.98937L19.0713 4.92871"
        strokeLinecap="round"
        variants={variants.line2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M20.5 12H22"
        strokeLinecap="round"
        variants={variants.line3}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M18.0101 18.0106L19.0708 19.0713"
        strokeLinecap="round"
        variants={variants.line4}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M12 20.5V22"
        strokeLinecap="round"
        variants={variants.line5}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M5.98975 18.0107L4.92909 19.0714"
        strokeLinecap="round"
        variants={variants.line6}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M3.5 12H2"
        strokeLinecap="round"
        variants={variants.line7}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M5.98926 5.98926L4.9286 4.9286"
        strokeLinecap="round"
        variants={variants.line8}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Sun03(props: Sun03Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Sun03,
  Sun03 as Sun03Icon,
  type Sun03Props,
  type Sun03Props as Sun03IconProps,
};
