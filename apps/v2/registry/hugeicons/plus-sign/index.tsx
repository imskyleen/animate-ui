'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type PlusSignProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    line1: {
      initial: {
        rotate: 0,
        transition: { duration: 0.4, ease: 'easeInOut', delay: 0.1 },
      },
      animate: {
        rotate: 90,
        transition: { duration: 0.4, ease: 'easeInOut', delay: 0.1 },
      },
    },
    line2: {
      initial: { rotate: 0, transition: { duration: 0.4, ease: 'easeInOut' } },
      animate: { rotate: 90, transition: { duration: 0.4, ease: 'easeInOut' } },
    },
  } satisfies Record<string, Variants>,
  x: {
    line1: {
      initial: { rotate: 0, scale: 1 },
      animate: {
        rotate: 45,
        scale: 1.2,
        transition: { duration: 0.3, ease: 'easeInOut', delay: 0.1 },
      },
    },
    line2: {
      initial: { rotate: 0, scale: 1 },
      animate: {
        rotate: 45,
        scale: 1.2,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: PlusSignProps) {
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
        d="M12 4V20"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.line1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M20 12H4"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.line2}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function PlusSign(props: PlusSignProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  PlusSign,
  PlusSign as PlusSignIcon,
  type PlusSignProps,
  type PlusSignProps as PlusSignIconProps,
};
