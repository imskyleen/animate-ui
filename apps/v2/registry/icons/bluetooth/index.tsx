'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type BluetoothProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    rune: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 0.88, 1.06, 1],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: BluetoothProps) {
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
        d="m7 7 10 10-5 5V2l5 5L7 17"
        variants={variants.rune}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Bluetooth(props: BluetoothProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Bluetooth,
  Bluetooth as BluetoothIcon,
  type BluetoothProps,
  type BluetoothProps as BluetoothIconProps,
};
