'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type ArrowRight01Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path: {
      initial: { x: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
      animate: { x: 4, transition: { duration: 0.3, ease: 'easeInOut' } },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    path: {
      initial: { x: 0 },
      animate: { x: [0, 4, 0], transition: { duration: 0.6, ease: 'easeInOut' } },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ArrowRight01Props) {
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
        d="M9.00005 6C9.00005 6 15 10.4189 15 12C15 13.5812 9 18 9 18"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function ArrowRight01(props: ArrowRight01Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  ArrowRight01,
  ArrowRight01 as ArrowRight01Icon,
  type ArrowRight01Props,
  type ArrowRight01Props as ArrowRight01IconProps,
};
