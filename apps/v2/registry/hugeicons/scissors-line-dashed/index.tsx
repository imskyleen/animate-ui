'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type ScissorsLineDashedProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        x: 0,
      },
      animate: {
        x: 7,
        transition: {
          duration: 1.2,
          ease: 'easeInOut',
        },
      },
    },
    group1: {
      initial: { transformOrigin: '54.5% 54.5%', rotate: 0 },
      animate: {
        transformOrigin: '54.5% 54.5%',
        rotate: [0, -26, 0, -26, 0],
        transition: {
          duration: 1.2,
          ease: 'easeInOut',
        },
      },
    },
    group2: {
      initial: { transformOrigin: '54.5% 45.5%', rotate: 0 },
      animate: {
        transformOrigin: '54.5% 45.5%',
        rotate: [0, 26, 0, 26, 0],
        transition: {
          duration: 1.2,
          ease: 'easeInOut',
        },
      },
    },
    path1: {},
    path2: {},
    path3: {},
    path4: {
      initial: {
        opacity: 1,
        scale: 1,
      },
      animate: {
        opacity: 0,
        scale: 0,
        transition: {
          duration: 0.2,
          ease: 'easeInOut',
          delay: 0.25,
        },
      },
    },
    path5: {
      initial: {
        opacity: 1,
        scale: 1,
      },
      animate: {
        opacity: 0,
        scale: 0,
        transition: {
          duration: 0.2,
          ease: 'easeInOut',
          delay: 0.85,
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ScissorsLineDashedProps) {
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
      <motion.g variants={variants.group} initial="initial" animate={controls}>
        <motion.g
          variants={variants.group1}
          initial="initial"
          animate={controls}
        >
          <motion.circle
            cx={4.49219}
            cy={8}
            r={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={variants.circle1}
            initial="initial"
            animate={controls}
          />
          <motion.path
            d="M6.49219 10L8.49219 12"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={variants.path1}
            initial="initial"
            animate={controls}
          />
          <motion.path
            d="M10.9922 14.5L13.4922 17"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={variants.path2}
            initial="initial"
            animate={controls}
          />
        </motion.g>
        <motion.g
          variants={variants.group2}
          initial="initial"
          animate={controls}
        >
          <motion.circle
            cx={4.49219}
            cy={16}
            r={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={variants.circle2}
            initial="initial"
            animate={controls}
          />
          <motion.path
            d="M13.4922 7L8.49219 12M8.49219 12L6.49219 14"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={variants.path3}
            initial="initial"
            animate={controls}
          />
        </motion.g>
      </motion.g>
      <motion.path
        d="M15.4922 12L13.4922 12"
        strokeLinecap="round"
        variants={variants.path4}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M21.4922 12L19.4922 12"
        strokeLinecap="round"
        variants={variants.path5}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function ScissorsLineDashed(props: ScissorsLineDashedProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  ScissorsLineDashed,
  ScissorsLineDashed as ScissorsLineDashedIcon,
  type ScissorsLineDashedProps,
  type ScissorsLineDashedProps as ScissorsLineDashedIconProps,
};
