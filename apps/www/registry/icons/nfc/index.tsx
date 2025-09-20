'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type NfcProps = IconProps<keyof typeof animations>;

const animations = {
  default: (() => {
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
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <motion.path
        d="M6 8.32a7.43 7.43 0 0 1 0 7.36"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M9.46 6.21a11.76 11.76 0 0 1 0 11.58"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M12.91 4.1a15.91 15.91 0 0 1 .01 15.8"
        variants={variants.path3}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M16.37 2a20.16 20.16 0 0 1 0 20"
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
