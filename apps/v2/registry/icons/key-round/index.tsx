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
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <motion.g variants={variants.group} initial="initial" animate={controls}>
        <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" />
        <circle cx={16.5} cy={7.5} r={0.5} />
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
