'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type PhoneOutgoingProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    handset: {
      initial: { rotate: 0, scale: 1 },
      animate: {
        rotate: [0, -10, 10, -10, 10, 0],
        scale: [1, 0.88, 0.88, 0.88, 0.88, 1],
        transition: { duration: 0.7, ease: 'easeInOut' },
      },
    },
    shaft: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
    },
    head: {
      initial: { opacity: 1, scale: 1, transformOrigin: '100% 0%' },
      animate: {
        opacity: [0, 1],
        scale: [0.3, 1],
        transformOrigin: '100% 0%',
        transition: { duration: 0.25, ease: 'easeOut', delay: 0.3 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: PhoneOutgoingProps) {
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
      <motion.path
        d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"
        variants={variants.handset}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="m16 8 6-6"
        variants={variants.shaft}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M22 8V2h-6"
        variants={variants.head}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function PhoneOutgoing(props: PhoneOutgoingProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  PhoneOutgoing,
  PhoneOutgoing as PhoneOutgoingIcon,
  type PhoneOutgoingProps,
  type PhoneOutgoingProps as PhoneOutgoingIconProps,
};
