'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type InfinityProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    loop: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.9, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: InfinityProps) {
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
        d="M12 12C12 12 9.26142 17 6.5 17C3.73858 17 2 14.7614 2 12C2 9.23858 3.73858 7 6.5 7C9.26142 7 12 12 12 12Z"
        variants={variants.loop}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M12 12C12 12 14.7386 17 17.5 17C20.2614 17 22 14.7614 22 12C22 9.23858 20.2614 7 17.5 7C14.7386 7 12 12 12 12Z"
        variants={variants.loop}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function InfinityIcon(props: InfinityProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  InfinityIcon as Infinity,
  InfinityIcon,
  type InfinityProps,
  type InfinityProps as InfinityIconProps,
};
