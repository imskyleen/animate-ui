'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type CastProps = IconProps<keyof typeof animations>;

const animations = {
  default: (() => {
    const animation: Record<string, Variants> = {
      path4: {},
    };

    for (let i = 1; i <= 3; i++) {
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
  blink: (() => {
    const animation: Record<string, Variants> = {
      path4: {},
    };

    for (let i = 1; i <= 3; i++) {
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

function IconComponent({ size, ...props }: CastProps) {
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
        d="M3.25 20.625V20.75M3.5 20.75C3.5 20.8881 3.38807 21 3.25 21C3.11193 21 3 20.8881 3 20.75C3 20.6119 3.11193 20.5 3.25 20.5C3.38807 20.5 3.5 20.6119 3.5 20.75Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M3 16C5.76142 16 8 18.2386 8 21"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M3 12C7.97056 12 12 16.0294 12 21"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path3}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M3 8C3 7.07069 3 6.60603 3.07686 6.21964C3.39249 4.63288 4.63288 3.39249 6.21964 3.07686C6.60603 3 7.07069 3 8 3L13 3C16.7712 3 18.6569 3 19.8284 4.17157C21 5.34315 21 7.22876 21 11L21 16C21 16.9293 21 17.394 20.9231 17.7804C20.6075 19.3671 19.3671 20.6075 17.7804 20.9231C17.394 21 16.9293 21 16 21"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path4}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Cast(props: CastProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Cast,
  Cast as CastIcon,
  type CastProps,
  type CastProps as CastIconProps,
};
