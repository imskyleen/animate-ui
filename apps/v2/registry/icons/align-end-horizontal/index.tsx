'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type AlignEndHorizontalProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    bar: {
      initial: { y: 0 },
      animate: {
        y: [0, -5, 0],
        transition: {
          duration: 0.6,
          times: [0, 0.45, 1],
          ease: ['easeOut', 'backOut'],
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: AlignEndHorizontalProps) {
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
      <rect x={4} y={2} width={6} height={16} rx={2} />
      <motion.rect
        x={14}
        y={9}
        width={6}
        height={9}
        rx={2}
        variants={variants.bar}
        initial="initial"
        animate={controls}
      />
      <path d="M22 22H2" />
    </motion.svg>
  );
}

function AlignEndHorizontal(props: AlignEndHorizontalProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  AlignEndHorizontal,
  AlignEndHorizontal as AlignEndHorizontalIcon,
  type AlignEndHorizontalProps,
  type AlignEndHorizontalProps as AlignEndHorizontalIconProps,
};
