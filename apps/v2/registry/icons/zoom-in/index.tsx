'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type ZoomInProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    lens: {
      initial: { scale: 1, transformOrigin: '44.44% 44.44%' },
      animate: {
        scale: [1, 1.1, 1],
        transformOrigin: '44.44% 44.44%',
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
    sign: {
      initial: { rotate: 0 },
      animate: { rotate: 90, transition: { duration: 0.5, ease: 'easeInOut' } },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ZoomInProps) {
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
      <motion.g variants={variants.lens} initial="initial" animate={controls}>
        <line x1={21} x2={16.65} y1={21} y2={16.65} />
        <circle cx={11} cy={11} r={8} />
        <motion.g variants={variants.sign} initial="initial" animate={controls}>
          <line x1={11} x2={11} y1={8} y2={14} />
          <line x1={8} x2={14} y1={11} y2={11} />
        </motion.g>
      </motion.g>
    </motion.svg>
  );
}

function ZoomIn(props: ZoomInProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  ZoomIn,
  ZoomIn as ZoomInIcon,
  type ZoomInProps,
  type ZoomInProps as ZoomInIconProps,
};
