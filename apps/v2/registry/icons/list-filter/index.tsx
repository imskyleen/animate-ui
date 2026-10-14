'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type ListFilterProps = IconProps<keyof typeof animations>;

function bar(delay: number): Variants {
  return {
    initial: { y: 0, opacity: 1, transition: { duration: 0.15 } },
    animate: {
      y: [-3, 0],
      opacity: [0, 1],
      transition: { duration: 0.3, delay, ease: 'easeOut' },
    },
  };
}

const animations = {
  default: {
    top: bar(0),
    middle: bar(0.09),
    bottom: bar(0.18),
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ListFilterProps) {
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
        d="M2 5h20"
        variants={variants.top}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M6 12h12"
        variants={variants.middle}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M9 19h6"
        variants={variants.bottom}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function ListFilter(props: ListFilterProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  ListFilter,
  ListFilter as ListFilterIcon,
  type ListFilterProps,
  type ListFilterProps as ListFilterIconProps,
};
