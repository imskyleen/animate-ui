'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type GiftProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    box: {},
    ribbon: {},
    group: {
      initial: {
        y: 0,
        rotate: 0,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        y: -1,
        rotate: [0, -4, 4, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    lid: {},
    bow1: {},
    bow2: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: GiftProps) {
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
        d="M4 11V15C4 18.2998 4 19.9497 5.02513 20.9749C6.05025 22 7.70017 22 11 22H13C16.2998 22 17.9497 22 18.9749 20.9749C20 19.9497 20 18.2998 20 15V11"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.box}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M12 11L12 22"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.ribbon}
        initial="initial"
        animate={controls}
      />
      <motion.g variants={variants.group} initial="initial" animate={controls}>
        <motion.path
          d="M3 9C3 8.25231 3 7.87846 3.20096 7.6C3.33261 7.41758 3.52197 7.26609 3.75 7.16077C4.09808 7 4.56538 7 5.5 7H18.5C19.4346 7 19.9019 7 20.25 7.16077C20.478 7.26609 20.6674 7.41758 20.799 7.6C21 7.87846 21 8.25231 21 9C21 9.74769 21 10.1215 20.799 10.4C20.6674 10.5824 20.478 10.7339 20.25 10.8392C19.9019 11 19.4346 11 18.5 11H5.5C4.56538 11 4.09808 11 3.75 10.8392C3.52197 10.7339 3.33261 10.5824 3.20096 10.4C3 10.1215 3 9.74769 3 9Z"
          strokeLinejoin="round"
          variants={variants.lid}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M6 3.78571C6 2.79949 6.79949 2 7.78571 2H8.14286C10.2731 2 12 3.7269 12 5.85714V7H9.21429C7.43908 7 6 5.56091 6 3.78571Z"
          strokeLinejoin="round"
          variants={variants.bow1}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M18 3.78571C18 2.79949 17.2005 2 16.2143 2H15.8571C13.7269 2 12 3.7269 12 5.85714V7H14.7857C16.5609 7 18 5.56091 18 3.78571Z"
          strokeLinejoin="round"
          variants={variants.bow2}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function Gift(props: GiftProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Gift,
  Gift as GiftIcon,
  type GiftProps,
  type GiftProps as GiftIconProps,
};
