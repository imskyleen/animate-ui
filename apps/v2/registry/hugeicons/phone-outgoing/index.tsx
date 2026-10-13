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
      {...props}
    >
      <motion.path
        d="M4.90404 10.5413L7.54448 7.90088C8.08309 7.36227 8.26947 6.56642 8.05163 5.83652C7.88129 5.26577 7.68937 4.57964 7.5618 3.99292C7.44381 3.45027 6.96763 3 6.41231 3H4.90404C3.79339 3 2.8813 3.90384 3.00313 5.0078C3.92928 13.3996 10.5926 20.0629 18.9844 20.9891C20.0883 21.1109 20.9922 20.1988 20.9922 19.0881V17.5799C20.9922 17.0246 20.5401 16.569 19.9937 16.4696C19.391 16.36 18.7533 16.1804 18.2198 16.0103C17.4533 15.7659 16.6013 15.9377 16.0325 16.5065L13.4509 19.0881"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.handset}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M13.9922 10L19.2592 4.73304"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.shaft}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M14.9922 4.29599C16.2475 4.18677 19.0391 3.67736 19.6769 4.31524C20.3148 4.95312 19.8054 7.74466 19.6962 9"
        strokeLinecap="round"
        strokeLinejoin="round"
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
