'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type OctagonAlertProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    mark: {
      initial: { y: 0 },
      animate: {
        y: [0, -2, 0, -0.8, 0],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
          times: [0, 0.3, 0.55, 0.75, 1],
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: OctagonAlertProps) {
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
      <path d="M15.312 2a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586l-4.688-4.688A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2z" />
      <motion.g variants={variants.mark} initial="initial" animate={controls}>
        <path d="M12 8v4" />
        <path d="M12 16h.01" />
      </motion.g>
    </motion.svg>
  );
}

function OctagonAlert(props: OctagonAlertProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  OctagonAlert,
  OctagonAlert as OctagonAlertIcon,
  type OctagonAlertProps,
  type OctagonAlertProps as OctagonAlertIconProps,
};
