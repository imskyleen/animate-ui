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
    tube: {},
    bulb: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 1.06, 1, 1.04, 1],
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
      <motion.path
        d="M10 14.54V4a2 2 0 0 1 4 0v10.54"
        variants={variants.tube}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M14 14.54a4 4 0 1 1-4 0"
        style={{ transformBox: 'view-box', transformOrigin: '12px 18px' }}
        variants={variants.bulb}
        initial="initial"
        animate={controls}
      />
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
