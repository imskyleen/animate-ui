'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type CrownProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    crown: {
      initial: { y: 0, rotate: 0 },
      animate: {
        y: [0, -1.5, 0],
        rotate: [0, -6, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: CrownProps) {
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
      <motion.path
        d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"
        variants={variants.crown}
        initial="initial"
        animate={controls}
      />
      <path d="M5 21h14" />
    </motion.svg>
  );
}

function Crown(props: CrownProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Crown,
  Crown as CrownIcon,
  type CrownProps,
  type CrownProps as CrownIconProps,
};
