'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type NfcProps = IconProps<keyof typeof animations>;

const animations = {
  // The waves pulse one after the other, never gone (as Hugeicons').
  default: (() => {
    const animation: Record<string, Variants> = {};

    for (let i = 1; i <= 4; i++) {
      animation[`path${i}`] = {
        initial: { opacity: 1, scale: 1 },
        animate: {
          opacity: [1, 0.25, 1],
          scale: [1, 0.85, 1],
          transition: {
            duration: 0.5,
            ease: 'easeInOut',
            delay: 0.15 * (i - 1),
          },
        },
      };
    }

    return animation;
  })() satisfies Record<string, Variants>,
  // The waves gone and back, one after the other.
  blink: (() => {
    const animation: Record<string, Variants> = {};

    for (let i = 1; i <= 4; i++) {
      animation[`path${i}`] = {
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
              delay: 0.2 * (i - 1),
            },
            scale: {
              duration: 0.2,
              ease: 'easeInOut',
              repeat: 1,
              repeatType: 'reverse',
              repeatDelay: 0.2,
              delay: 0.2 * (i - 1),
            },
          },
        },
      };
    }

    return animation;
  })() satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: NfcProps) {
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
        d="M5.5 9C6.0978 9.59883 6.5 10.7181 6.5 12C6.5 13.2819 6.0978 14.4012 5.5 15"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M9 7C9.8967 7.99804 10.5 9.86346 10.5 12C10.5 14.1365 9.8967 16.002 9 17"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M12.5 5C13.6956 6.39726 14.5 9.00885 14.5 12C14.5 14.9912 13.6956 17.6027 12.5 19"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path3}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M15.5 3C17.2934 4.79648 18.5 8.15423 18.5 12C18.5 15.8458 17.2934 19.2035 15.5 21"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path4}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Nfc(props: NfcProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Nfc,
  Nfc as NfcIcon,
  type NfcProps,
  type NfcProps as NfcIconProps,
};
