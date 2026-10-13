'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type MicProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: { rotate: 0, transformOrigin: '50% 100%' },
      animate: {
        rotate: [0, -10, 10, -5, 0],
        transformOrigin: '50% 100%',
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: MicProps) {
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
        <path
          d="M7 6.5C7 4.01472 9.01472 2 11.5 2C13.9853 2 16 4.01472 16 6.5V11.5C16 13.9853 13.9853 16 11.5 16C9.01472 16 7 13.9853 7 11.5V6.5Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11.5 19H11.0828C7.57267 19 4.57706 16.4623 4 13"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11.5 19H11.9172C15.4273 19 18.4229 16.4623 19 13"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M11.5 19V22" strokeLinecap="round" strokeLinejoin="round" />
      </motion.g>
    </motion.svg>
  );
}

function Mic(props: MicProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Mic,
  Mic as MicIcon,
  type MicProps,
  type MicProps as MicIconProps,
};
