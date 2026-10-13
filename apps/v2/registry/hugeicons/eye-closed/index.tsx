'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type EyeClosedProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: { scaleY: 1, transformOrigin: '50% 0%' },
      animate: {
        scaleY: [1, 0.45, 1],
        transformOrigin: '50% 0%',
        transition: { duration: 0.45, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: EyeClosedProps) {
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
      <motion.g variants={variants.group} initial="initial" animate={controls}>
        <path d="M12 13.5V16.5" strokeLinecap="round" />
        <path d="M16 13L17 15.5" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M19.5 11L21.5 13"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M2.5 13L4.5 11" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 13L7 15.5" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M2 7.5C2 7.5 5 13.5 12 13.5C19 13.5 22 7.5 22 7.5"
          strokeLinecap="round"
        />
      </motion.g>
    </motion.svg>
  );
}

function EyeClosed(props: EyeClosedProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  EyeClosed,
  EyeClosed as EyeClosedIcon,
  type EyeClosedProps,
  type EyeClosedProps as EyeClosedIconProps,
};
