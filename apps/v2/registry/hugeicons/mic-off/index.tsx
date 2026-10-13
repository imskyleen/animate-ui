'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type MicOffProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    slash: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: MicOffProps) {
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
      <path
        d="M8.1572 4.1572C8.94761 2.86349 10.373 2 12 2C14.4853 2 16.5 4.01472 16.5 6.5V11.5C16.5 11.8111 16.4684 12.1149 16.4083 12.4083"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 7.5V11.5C7.5 13.9853 9.51472 16 12 16C13.1154 16 14.136 15.5942 14.9222 14.9222"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 19H11.5828C8.07267 19 5.07706 16.4623 4.5 13"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 19H12.4172C14.2325 19 15.9102 18.3213 17.1869 17.1869"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 19V22" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M19.5 13C19.3878 13.6733 19.1841 14.3116 18.903 14.903"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <motion.path
        d="M2 2L22 22"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.slash}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function MicOff(props: MicOffProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  MicOff,
  MicOff as MicOffIcon,
  type MicOffProps,
  type MicOffProps as MicOffIconProps,
};
