'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type PlaneTakeoffProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    plane: {
      initial: { y: 0, rotate: 0, transformOrigin: '0% 100%' },
      animate: {
        y: [0, -1, 0],
        rotate: [0, -5, 0],
        transformOrigin: '0% 100%',
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: PlaneTakeoffProps) {
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
      <path d="M2 22h20" />
      <motion.path
        d="M6.36 17.4 4 17l-2-4 1.1-.55a2 2 0 0 1 1.8 0l.17.1a2 2 0 0 0 1.8 0L8 12 5 6l.9-.45a2 2 0 0 1 2.09.2l4.02 3a2 2 0 0 0 2.1.2l4.19-2.06a2.41 2.41 0 0 1 1.73-.17L21 7a1.4 1.4 0 0 1 .87 1.99l-.38.76c-.23.46-.6.84-1.07 1.08L7.58 17.2a2 2 0 0 1-1.22.18Z"
        variants={variants.plane}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function PlaneTakeoff(props: PlaneTakeoffProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  PlaneTakeoff,
  PlaneTakeoff as PlaneTakeoffIcon,
  type PlaneTakeoffProps,
  type PlaneTakeoffProps as PlaneTakeoffIconProps,
};
