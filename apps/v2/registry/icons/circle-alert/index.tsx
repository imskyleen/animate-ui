'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type CircleAlertProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    outline: {},
    mark: {
      initial: { opacity: 1 },
      animate: {
        opacity: [1, 0.15, 1, 0.15, 1],
        transition: {
          duration: 1.1,
          times: [0, 0.2, 0.45, 0.7, 1],
          ease: 'easeInOut',
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: CircleAlertProps) {
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
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        variants={variants.outline}
        initial="initial"
        animate={controls}
      />
      <motion.line
        x1="12"
        x2="12"
        y1="8"
        y2="12"
        variants={variants.mark}
        initial="initial"
        animate={controls}
      />
      <motion.line
        x1="12"
        x2="12.01"
        y1="16"
        y2="16"
        variants={variants.mark}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function CircleAlert(props: CircleAlertProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  CircleAlert,
  CircleAlert as CircleAlertIcon,
  type CircleAlertProps,
  type CircleAlertProps as CircleAlertIconProps,
};
