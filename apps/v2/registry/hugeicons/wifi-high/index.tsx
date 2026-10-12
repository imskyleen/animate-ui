'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type WifiHighProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
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
        transition: { duration: 0.5, ease: 'easeInOut', delay: 0.12 },
      },
    },
    wave3: {
      initial: { opacity: 1, scale: 1 },
      animate: {
        opacity: [1, 0.25, 1],
        scale: [1, 0.85, 1],
        transition: { duration: 0.5, ease: 'easeInOut', delay: 0.24 },
      },
    },
  } satisfies Record<string, Variants>,
  blink: {
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
    wave3: {
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
            delay: 0.4,
          },
          scale: {
            duration: 0.2,
            ease: 'easeInOut',
            repeat: 1,
            repeatType: 'reverse',
            repeatDelay: 0.2,
            delay: 0.4,
          },
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: WifiHighProps) {
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
        d="M12.1256 19.25H12.0006M12.2506 19.25C12.2506 19.3881 12.1387 19.5 12.0006 19.5C11.8625 19.5 11.7506 19.3881 11.7506 19.25C11.7506 19.112 11.8625 19 12.0006 19C12.1387 19 12.2506 19.112 12.2506 19.25Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.wave1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M8.5 15.9287C9.43464 15.0126 10.6912 14.4994 12 14.4994C13.3088 14.4994 14.5654 15.0126 15.5 15.9287"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.wave2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M5 12.3587C6.86929 10.5264 9.38247 9.50012 12 9.50012C14.6175 9.50012 17.1307 10.5264 19 12.3587"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.wave3}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function WifiHigh(props: WifiHighProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  WifiHigh,
  WifiHigh as WifiHighIcon,
  type WifiHighProps,
  type WifiHighProps as WifiHighIconProps,
};
