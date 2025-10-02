'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

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
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, -26, 0, -26, 0],
        transition: {
          duration: 1.2,
          ease: 'easeInOut',
        },
      },
    },
    group2: {
      initial: {
        rotate: 0,
      },
      animate: {
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
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <motion.g variants={variants.group} initial="initial" animate={controls}>
        <motion.g
          variants={variants.group1}
          initial="initial"
          animate={controls}
        >
          <motion.circle
            cx="4"
            cy="8"
            r="2"
            variants={variants.circle1}
            initial="initial"
            animate={controls}
          />
          <motion.path
            d="M5.42 9.42 8 12"
            variants={variants.path1}
            initial="initial"
            animate={controls}
          />
          <motion.path
            d="M10.8 14.8 14 18"
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
            cx="4"
            cy="16"
            r="2"
            variants={variants.circle2}
            initial="initial"
            animate={controls}
          />
          <motion.path
            d="m14 6-8.58 8.58"
            variants={variants.path3}
            initial="initial"
            animate={controls}
          />
        </motion.g>
      </motion.g>
      <motion.path
        d="M16 12h-2"
        variants={variants.path4}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M22 12h-2"
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
  ScissorsLineDashed as ScissorsLineDashedwIcon,
  type ScissorsLineDashedProps,
  type ScissorsLineDashedProps as ScissorsLineDashedIconProps,
};
