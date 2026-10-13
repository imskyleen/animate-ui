'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type Globe02Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    meridian: {
      initial: { scaleX: 1 },
      animate: {
        scaleX: [1, 0.1, 1, 0.1, 1],
        transition: { duration: 1, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: Globe02Props) {
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
      <circle cx={12} cy={12} r={10} />
      <path d="M21 15H3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 9H3" strokeLinecap="round" strokeLinejoin="round" />
      <motion.path
        d="M8 12C8 18 12 22 12 22C12 22 16 18 16 12C16 6 12 2 12 2C12 2 8 6 8 12Z"
        strokeLinejoin="round"
        variants={variants.meridian}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Globe02(props: Globe02Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Globe02,
  Globe02 as Globe02Icon,
  type Globe02Props,
  type Globe02Props as Globe02IconProps,
};
