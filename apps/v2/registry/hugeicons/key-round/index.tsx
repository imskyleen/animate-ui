'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type KeyRoundProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: { rotate: 0, scale: 1 },
      animate: {
        rotate: [0, -12, 0],
        scale: [1, 0.95, 1],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  wiggle: {
    group: {
      initial: { rotate: 0 },
      animate: {
        rotate: [0, -6, 6, -6, 0],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: KeyRoundProps) {
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
          d="M15 15.5C18.5899 15.5 21.5 12.5899 21.5 9C21.5 5.41015 18.5899 2.5 15 2.5C11.4101 2.5 8.5 5.41015 8.5 9C8.5 9.41773 8.5394 9.82625 8.6147 10.2221C8.75737 10.972 8.82871 11.347 8.75558 11.5844C8.68245 11.8217 8.47202 12.032 8.05118 12.4526L3.67253 16.8283C3.094 17.4064 2.80474 17.6955 2.65237 18.0631C2.5 18.4308 2.5 18.8398 2.5 19.6576V21.5H6V19.5H8V17.5H10L11.5526 15.9485C11.9729 15.5286 12.183 15.3186 12.4201 15.2456C12.6572 15.1726 13.0316 15.2436 13.7806 15.3858C14.1756 15.4608 14.5832 15.5 15 15.5Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M18 7.5C18 8.32843 17.3284 9 16.5 9C15.6716 9 15 8.32843 15 7.5C15 6.67157 15.6716 6 16.5 6C17.3284 6 18 6.67157 18 7.5Z" />
      </motion.g>
    </motion.svg>
  );
}

function KeyRound(props: KeyRoundProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  KeyRound,
  KeyRound as KeyRoundIcon,
  type KeyRoundProps,
  type KeyRoundProps as KeyRoundIconProps,
};
