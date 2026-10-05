'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type AccessibilityProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group1: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, 5, -5, 0],
        transition: {
          duration: 0.8,
          ease: 'easeInOut',
        },
      },
    },
    group2: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: -360,
        transition: {
          duration: 1,
          delay: 0.4,
          ease: 'easeInOut',
        },
      },
    },
    circle: {
      initial: {
        y: 0,
        x: 0,
      },
      animate: {
        y: [0, 1, -1, 0],
        x: [0, 1, -1, 0],
        transition: {
          duration: 0.8,
          ease: 'easeInOut',
        },
      },
    },
    path1: {},
    path2: {},
    path3: {
      initial: {
        rotate: 0,
        d: 'M8 5 L5 8',
      },
      animate: {
        rotate: [0, -60, 0],
        d: ['M8 5 L5 8', 'M8 5 L4 9', 'M8 5 L5 8'],
        transition: {
          duration: 0.4,
          delay: 0.2,
          ease: 'easeInOut',
        },
        transformOrigin: 'top right',
      },
    },
    path4: {},
    path5: {},
    path6: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: AccessibilityProps) {
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
      <motion.circle
        cx="16"
        cy="4"
        r="1"
        variants={variants.circle}
        initial="initial"
        animate={controls}
      />
      <motion.g variants={variants.group1} initial="initial" animate={controls}>
        <motion.path
          d="M18,19l1-7-6,1"
          variants={variants.path1}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M8,5l5.5,3-2.4,3.5"
          variants={variants.path2}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M8 5 L5 8"
          variants={variants.path3}
          initial="initial"
          animate={controls}
        />
      </motion.g>
      <motion.g variants={variants.group2} initial="initial" animate={controls}>
        <motion.path
          d="M4.2,14.5c-.8,2.6.7,5.4,3.3,6.2,1.2.4,2.4.3,3.6-.2"
          variants={variants.path4}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M13.8,17.5c.8-2.6-.7-5.4-3.3-6.2-1.2-.4-2.4-.3-3.6.2"
          variants={variants.path5}
          initial="initial"
          animate={controls}
        />
      </motion.g>
      <motion.path
        d="M13,13.1c-.5-.7-1.1-1.2-1.9-1.6"
        variants={variants.path6}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Accessibility(props: AccessibilityProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Accessibility,
  Accessibility as AccessibilityIcon,
  type AccessibilityProps,
  type AccessibilityProps as AccessibilityIconProps,
};
