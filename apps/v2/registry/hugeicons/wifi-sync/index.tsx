'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type WifiSyncProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    sync: {
      initial: {
        rotate: 0,
        scale: 1,
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
      animate: {
        rotate: 180,
        scale: [1, 0.8, 1],
        transition: { duration: 0.8, ease: 'easeInOut' },
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
    sync: {},
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

function IconComponent({ size, ...props }: WifiSyncProps) {
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
        d="M21.4649 13.5C20.7733 12.3044 19.4806 11.5 18 11.5C16.4726 11.5 15.1451 12.3561 14.4713 13.6147M14.5351 17.5C15.2267 18.6956 16.5194 19.5 18 19.5C19.5227 19.5 20.8467 18.6492 21.5224 17.397M17 14H16C15.0572 14 14.5858 14 14.2929 13.7071C14 13.4142 14 12.9428 14 12V11M19 17H20C20.9428 17 21.4142 17 21.7071 17.2929C22 17.5858 22 18.0572 22 19V20"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.sync}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M8.5 15.4287C8.93844 14.9989 9.44772 14.6578 10 14.4168"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.wave1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M5 11.8587C6.38599 10.5001 8.12597 9.58466 10 9.20209"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.wave2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M2 7.81966C4.75011 5.35989 8.31034 4 12 4C15.6897 4 19.2499 5.35989 22 7.81966"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.wave3}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function WifiSync(props: WifiSyncProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  WifiSync,
  WifiSync as WifiSyncIcon,
  type WifiSyncProps,
  type WifiSyncProps as WifiSyncIconProps,
};
