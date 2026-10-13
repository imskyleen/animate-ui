'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type CircleQuestionMarkProps = IconProps<keyof typeof animations>;

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

function IconComponent({ size, ...props }: CircleQuestionMarkProps) {
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
      <circle cx={12} cy={12} r={10} />
      <motion.g variants={variants.mark} initial="initial" animate={controls}>
        <path
          d="M9.5 9.5C9.5 8.11929 10.6193 7 12 7C13.3807 7 14.5 8.11929 14.5 9.5C14.5 10.3569 14.0689 11.1131 13.4117 11.5636C12.7283 12.0319 12 12.6716 12 13.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.125 16.75H12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.25 16.75C12.25 16.8881 12.1381 17 12 17C11.8619 17 11.75 16.8881 11.75 16.75C11.75 16.6119 11.8619 16.5 12 16.5C12.1381 16.5 12.25 16.6119 12.25 16.75Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>
    </motion.svg>
  );
}

function CircleQuestionMark(props: CircleQuestionMarkProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  CircleQuestionMark,
  CircleQuestionMark as CircleQuestionMarkIcon,
  type CircleQuestionMarkProps,
  type CircleQuestionMarkProps as CircleQuestionMarkIconProps,
};
