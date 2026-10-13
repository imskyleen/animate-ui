'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type FingerPrintProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    line1: {
      initial: { pathLength: 1 },
      animate: {
        pathLength: [1, 0.05, 1],
        transition: { duration: 1.6, ease: 'easeInOut', delay: 0.0 },
      },
    },
    line2: {
      initial: { pathLength: 1 },
      animate: {
        pathLength: [1, 0.05, 1],
        transition: { duration: 1.6, ease: 'easeInOut', delay: 0.1 },
      },
    },
    line3: {
      initial: { pathLength: 1 },
      animate: {
        pathLength: [1, 0.05, 1],
        transition: { duration: 1.6, ease: 'easeInOut', delay: 0.2 },
      },
    },
    line4: {
      initial: { pathLength: 1 },
      animate: {
        pathLength: [1, 0.05, 1],
        transition: { duration: 1.6, ease: 'easeInOut', delay: 0.3 },
      },
    },
    line5: {
      initial: { pathLength: 1 },
      animate: {
        pathLength: [1, 0.05, 1],
        transition: { duration: 1.6, ease: 'easeInOut', delay: 0.4 },
      },
    },
    line6: {
      initial: { pathLength: 1 },
      animate: {
        pathLength: [1, 0.05, 1],
        transition: { duration: 1.6, ease: 'easeInOut', delay: 0.5 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: FingerPrintProps) {
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
        d="M7.42857 3.36201C11.3996 0.664089 17.136 2.12432 19.2301 6.41803"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.line1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M10.8571 21.9236C15.5839 22.5822 20 18.8952 20 14.2103V10.3333"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.line2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M7.42857 20.6058C5.35602 19.1977 4 16.8583 4 14.2103V9.75757C4 8.57285 4.27144 7.44988 4.75704 6.44444"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.line3}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M16 13.8C16 16.1196 14.2091 18 12 18C9.79086 18 8 16.1196 8 13.8V10.2C8 9.55584 8.13811 8.94555 8.38493 8.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.line4}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M12 6C14.2091 6 16 7.8804 16 10.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.line5}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M12 10.5L12 13.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.line6}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function FingerPrint(props: FingerPrintProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  FingerPrint,
  FingerPrint as FingerPrintIcon,
  type FingerPrintProps,
  type FingerPrintProps as FingerPrintIconProps,
};
