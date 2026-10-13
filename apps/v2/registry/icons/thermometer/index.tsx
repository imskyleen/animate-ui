'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type ThermometerProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: { rotate: 0, transformOrigin: '50% 100%' },
      animate: {
        rotate: [0, -6, 6, -3, 0],
        transformOrigin: '50% 100%',
        transition: { duration: 0.7, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ThermometerProps) {
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
      <motion.g variants={variants.group} initial="initial" animate={controls}>
        <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
      </motion.g>
    </motion.svg>
  );
}

function Thermometer(props: ThermometerProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Thermometer,
  Thermometer as ThermometerIcon,
  type ThermometerProps,
  type ThermometerProps as ThermometerIconProps,
};
