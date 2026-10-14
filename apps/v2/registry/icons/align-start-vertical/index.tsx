'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type AlignStartVerticalProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    bar: {
      initial: { x: 0 },
      animate: {
        x: [0, 5, 0],
        transition: {
          duration: 0.6,
          times: [0, 0.45, 1],
          ease: ['easeOut', 'backOut'],
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: AlignStartVerticalProps) {
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
      <rect x={6} y={4} width={16} height={6} rx={2} />
      <motion.rect
        x={6}
        y={14}
        width={9}
        height={6}
        rx={2}
        variants={variants.bar}
        initial="initial"
        animate={controls}
      />
      <path d="M2 2v20" />
    </motion.svg>
  );
}

function AlignStartVertical(props: AlignStartVerticalProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  AlignStartVertical,
  AlignStartVertical as AlignStartVerticalIcon,
  type AlignStartVerticalProps,
  type AlignStartVerticalProps as AlignStartVerticalIconProps,
};
