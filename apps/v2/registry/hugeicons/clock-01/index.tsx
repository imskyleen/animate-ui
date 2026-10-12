'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type Clock01Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    circle: {},
    hands: {
      initial: {
        rotate: 0,
        transformOrigin: '0% 66.667%',
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
      animate: {
        rotate: 360,
        transformOrigin: '0% 66.667%',
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: Clock01Props) {
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
      <motion.circle
        cx={12}
        cy={12}
        r={10}
        variants={variants.circle}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M12 8V12L14 14"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.hands}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Clock01(props: Clock01Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Clock01,
  Clock01 as Clock01Icon,
  type Clock01Props,
  type Clock01Props as Clock01IconProps,
};
