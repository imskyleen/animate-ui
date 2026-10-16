'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type PhoneCallProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    phone: {
      initial: { rotate: 0, scale: 1 },
      animate: {
        rotate: [0, -10, 10, -10, 10, 0],
        scale: [1, 0.88, 0.88, 0.88, 0.88, 1],
        transition: { duration: 0.7, ease: 'easeInOut' },
      },
    },
    wave1: {
      initial: { opacity: 1, scale: 1 },
      animate: {
        opacity: [1, 0.25, 1],
        scale: [1, 0.85, 1],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
    wave2: {
      initial: { opacity: 1, scale: 1 },
      animate: {
        opacity: [1, 0.25, 1],
        scale: [1, 0.85, 1],
        transition: { duration: 0.5, ease: 'easeInOut', delay: 0.15 },
      },
    },
  } satisfies Record<string, Variants>,
  blink: {
    phone: {
      initial: { rotate: 0, scale: 1 },
      animate: {
        rotate: [0, -10, 10, -10, 10, 0],
        scale: [1, 0.88, 0.88, 0.88, 0.88, 1],
        transition: { duration: 0.7, ease: 'easeInOut' },
      },
    },
    wave1: {
      initial: { opacity: 1, scale: 1 },
      animate: {
        opacity: 0,
        scale: 0,
        transition: {
          opacity: {
            duration: 0.2,
            ease: 'easeInOut',
            repeat: 1,
            repeatType: 'reverse',
            repeatDelay: 0.2,
          },
          scale: {
            duration: 0.2,
            ease: 'easeInOut',
            repeat: 1,
            repeatType: 'reverse',
            repeatDelay: 0.2,
          },
        },
      },
    },
    wave2: {
      initial: { opacity: 1, scale: 1 },
      animate: {
        opacity: 0,
        scale: 0,
        transition: {
          opacity: {
            duration: 0.2,
            ease: 'easeInOut',
            repeat: 1,
            repeatType: 'reverse',
            repeatDelay: 0.2,
            delay: 0.2,
          },
          scale: {
            duration: 0.2,
            ease: 'easeInOut',
            repeat: 1,
            repeatType: 'reverse',
            repeatDelay: 0.2,
            delay: 0.2,
          },
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: PhoneCallProps) {
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
        variants={variants.phone}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M12.9922 8C14.649 8 15.9922 9.34315 15.9922 11"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.wave1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M12.9922 4C16.8582 4 19.9922 7.13401 19.9922 11"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.wave2}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function PhoneCall(props: PhoneCallProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  PhoneCall,
  PhoneCall as PhoneCallIcon,
  type PhoneCallProps,
  type PhoneCallProps as PhoneCallIconProps,
};
