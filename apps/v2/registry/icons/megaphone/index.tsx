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
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <motion.g variants={variants.horn} initial="initial" animate={controls}>
        <path d="M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
        <path d="M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14" />
        <path d="M8 6v8" />
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
