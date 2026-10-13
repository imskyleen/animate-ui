'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type WifiCogProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    cog: {
      initial: { rotate: 0, transition: { duration: 0.8, ease: 'easeInOut' } },
      animate: {
        rotate: 120,
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
    },
    path1: {},
    path2: {},
    path3: {},
    path4: {},
    path5: {},
    path6: {},
    path7: {},
    path8: {},
    path9: {},
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
    cog: {},
    path1: {},
    path2: {},
    path3: {},
    path4: {},
    path5: {},
    path6: {},
    path7: {},
    path8: {},
    path9: {},
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

function IconComponent({ size, ...props }: WifiCogProps) {
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
      <motion.g variants={variants.cog} initial="initial" animate={controls}>
        <motion.path
          d="m14.305 19.53.923-.382"
          variants={variants.path1}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="m15.228 16.852-.923-.383"
          variants={variants.path2}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="m16.852 15.228-.383-.923"
          variants={variants.path3}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="m16.852 20.772-.383.924"
          variants={variants.path4}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="m19.148 15.228.383-.923"
          variants={variants.path5}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="m19.53 21.696-.382-.924"
          variants={variants.path6}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="m20.772 16.852.924-.383"
          variants={variants.path7}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="m20.772 19.148.924.383"
          variants={variants.path8}
          initial="initial"
          animate={controls}
        />
        <motion.circle
          cx={18}
          cy={18}
          r={3}
          variants={variants.path9}
          initial="initial"
          animate={controls}
        />
      </motion.g>
      <motion.path
        d="M8.5 15.429a5 5 0 0 1 2.413-1.31"
        variants={variants.wave1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M5 11.858a10 10 0 0 1 11.5-1.785"
        variants={variants.wave2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M2 7.82a15 15 0 0 1 20 0"
        variants={variants.wave3}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function WifiCog(props: WifiCogProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  WifiCog,
  WifiCog as WifiCogIcon,
  type WifiCogProps,
  type WifiCogProps as WifiCogIconProps,
};
