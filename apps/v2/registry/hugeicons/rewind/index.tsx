'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type RewindProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    back: {
      initial: { x: 0 },
      animate: {
        x: [0, -1.5, 0],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
    front: {
      initial: { x: 0 },
      animate: {
        x: [0, -0.6, 0],
        transition: { duration: 0.5, ease: 'easeInOut', delay: 0.05 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: RewindProps) {
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
      <motion.path
        d="M14.9974 15.5372C17.3245 17.218 18.4881 18.0583 19.461 17.9969C20.204 17.9499 20.8946 17.6007 21.3699 17.0315C21.9922 16.2863 21.9922 14.8575 21.9922 12C21.9922 9.14246 21.9922 7.71369 21.3699 6.96846C20.8946 6.39933 20.204 6.0501 19.461 6.00315C18.4881 5.94167 17.3245 6.78203 14.9974 8.46275"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.back}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M2.15512 12.9178C2.43749 13.6884 3.29078 14.3047 4.99737 15.5372C7.32449 17.218 8.48806 18.0583 9.46099 17.9969C10.204 17.9499 10.8946 17.6007 11.3699 17.0315C11.9922 16.2863 11.9922 14.8575 11.9922 12C11.9922 9.14246 11.9922 7.71369 11.3699 6.96846C10.8946 6.39933 10.204 6.0501 9.46099 6.00315C8.48806 5.94167 7.32449 6.78203 4.99737 8.46275C3.29078 9.6953 2.43749 10.3116 2.15512 11.0822C1.93788 11.675 1.93788 12.325 2.15512 12.9178Z"
        strokeLinejoin="round"
        variants={variants.front}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Rewind(props: RewindProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Rewind,
  Rewind as RewindIcon,
  type RewindProps,
  type RewindProps as RewindIconProps,
};
