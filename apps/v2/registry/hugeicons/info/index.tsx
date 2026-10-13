'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type InfoProps = IconProps<keyof typeof animations>;

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

function IconComponent({ size, ...props }: InfoProps) {
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
      <circle cx={12} cy={11.9999} r={10} />
      <motion.g variants={variants.mark} initial="initial" animate={controls}>
        <path
          d="M11.875 8.24994L12 8.24994"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11.75 8.24994C11.75 8.11187 11.8619 7.99994 12 7.99994C12.1381 7.99994 12.25 8.11187 12.25 8.24994C12.25 8.38801 12.1381 8.49994 12 8.49994C11.8619 8.49994 11.75 8.38801 11.75 8.24994Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 15.9999L12 11.9999"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>
    </motion.svg>
  );
}

function Info(props: InfoProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Info,
  Info as InfoIcon,
  type InfoProps,
  type InfoProps as InfoIconProps,
};
