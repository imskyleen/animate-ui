'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type CloudSunRainProps = IconProps<keyof typeof animations>;

const rainAnimation: Variants = {
  initial: {
    opacity: 1,
  },
  animate: {
    opacity: [1, 0.4, 1],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

const animations = {
  default: (() => {
    const animation: Record<string, Variants> = {
      path1: {},
      path2: {},
      group: {
        animate: {
          transition: {
            staggerChildren: 0.3,
          },
        },
      },
      path3: rainAnimation,
      path4: rainAnimation,
    };

    for (let i = 1; i <= 4; i++) {
      animation[`line${i}`] = {
        initial: { opacity: 1, scale: 1, pathLength: 1 },
        animate: {
          opacity: [0, 1],
          pathLength: [0, 1],
          transition: {
            duration: 0.6,
            ease: 'easeInOut',
            delay: (i - 1) * 0.15,
          },
        },
      };
    }

    return animation;
  })() satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: CloudSunRainProps) {
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
      initial="initial"
      animate={controls}
      {...props}
    >
      <motion.path
        d="M17.3686 13C17.4509 12.6804 17.4946 12.3453 17.4946 12C17.4946 9.79086 15.7038 8 13.4946 8C12.7915 8 12.1308 8.18142 11.5566 8.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M4 20.6792C2.81753 20.1442 2 18.9964 2 17.6667C2 15.9336 3.38879 14.5094 5.1643 14.3485C5.33363 12.4724 6.98627 11 9 11C11.1263 11 12.85 12.6416 12.85 14.6667C12.85 14.779 12.8447 14.8902 12.8343 15C12.8395 15 12.8448 15 12.85 15C14.5897 15 16 16.3431 16 18C16 19.2703 15.1709 20.3563 14 20.7938"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />

      <motion.g variants={variants.group} initial="initial" animate={controls}>
        <motion.path
          d="M7 18V20"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path3}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M11 19V21"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path4}
          initial="initial"
          animate={controls}
        />
      </motion.g>

      <motion.path
        d="M8.19929 6.19343L7.49218 5.48633"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.line1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M13.494 4L13.494 3"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.line2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M18.7988 6.19328L19.5059 5.48617"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.line3}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M20.999 11.495L21.999 11.495"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.line4}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function CloudSunRain(props: CloudSunRainProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  CloudSunRain,
  CloudSunRain as CloudSunRainIcon,
  type CloudSunRainProps,
  type CloudSunRainProps as CloudSunRainIconProps,
};
