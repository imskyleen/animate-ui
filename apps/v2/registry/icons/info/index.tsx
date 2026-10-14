'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type InfoProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    mark: {
      initial: { y: 0 },
      animate: {
        y: [0, -2, 0, -0.8, 0],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
          times: [0, 0.3, 0.55, 0.75, 1],
        },
      },
    },
  } satisfies Record<string, Variants>,
  blink: {
    mark: {
      initial: { opacity: 1 },
      animate: {
        opacity: [1, 0.15, 1, 0.15, 1],
        transition: {
          duration: 1.1,
          times: [0, 0.2, 0.45, 0.7, 1],
          ease: 'easeInOut',
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: InfoProps) {
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
      <circle cx={12} cy={12} r={10} />
      <motion.g variants={variants.mark} initial="initial" animate={controls}>
        <path d="M12 8h.01" />
        <path d="M12 16v-4" />
      </motion.g>
    </motion.svg>
  );
}

function Info(props: InfoProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Info,
  Info as InfoIcon,
  type InfoProps,
  type InfoProps as InfoIconProps,
};
