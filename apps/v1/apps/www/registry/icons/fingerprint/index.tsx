'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
  pathClassName,
} from '@/registry/icons/icon';
import { cn } from '@workspace/ui/lib/utils';

type FingerprintProps = IconProps<keyof typeof animations>;

const animations = {
  default: (() => {
    const variants: Record<string, Variants> = {
      group: {
        initial: {
          scale: 1,
        },
        animate: {
          scale: [1, 1.1, 1],
          transition: {
            ease: 'easeInOut',
            duration: 1.5,
          },
        },
      },
      path: {
        initial: {
          strokeOpacity: 0.2,
        },
      },
    };
    new Array(9).fill(0).forEach((_, i) => {
      variants[`path${i + 1}`] = {
        initial: {
          pathLength: 1,
        },
        animate: {
          pathLength: [1, 0.05, 1],
          transition: {
            pathLength: { duration: 1.5, ease: 'easeInOut' },
          },
        },
      };
    });
    return variants;
  })() satisfies Record<string, Variants>,
  'default-2': (() => {
    const variants: Record<string, Variants> = {
      group: {
        initial: {
          scale: 1,
        },
        animate: {
          scale: [1, 1.1, 1],
          transition: {
            ease: 'easeInOut',
            duration: 1.5,
          },
        },
      },
      path: {
        initial: {
          strokeOpacity: 0,
        },
      },
    };
    new Array(9).fill(0).forEach((_, i) => {
      variants[`path${i + 1}`] = {
        initial: {
          pathLength: 1,
        },
        animate: {
          pathLength: [1, 0.05, 1],
          transition: {
            pathLength: { duration: 1.5, ease: 'easeInOut' },
          },
        },
      };
    });
    return variants;
  })() satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, className, ...props }: FingerprintProps) {
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
      className={cn(pathClassName, className)}
      variants={variants.group}
      initial="initial"
      animate={controls}
      {...props}
    >
      <motion.path
        stroke="currentColor"
        variants={variants.path}
        initial="initial"
        animate={controls}
        d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4 M14 13.12c0 2.38 0 6.38-1 8.88 M17.29 21.02c.12-.6.43-2.3.5-3.02 M2 12a10 10 0 0 1 18-6 M2 16h.01 M21.8 16c.2-2 .131-5.354 0-6 M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2 M8.65 22c.21-.66.45-1.32.57-2 M9 6.8a6 6 0 0 1 9 5.2v2"
      />
      <motion.path
        d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M14 13.12c0 2.38 0 6.38-1 8.88"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M17.29 21.02c.12-.6.43-2.3.5-3.02"
        variants={variants.path3}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M2 12a10 10 0 0 1 18-6"
        variants={variants.path4}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M2 16h.01"
        variants={variants.path5}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M21.8 16c.2-2 .131-5.354 0-6"
        variants={variants.path6}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"
        variants={variants.path7}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M8.65 22c.21-.66.45-1.32.57-2"
        variants={variants.path8}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M9 6.8a6 6 0 0 1 9 5.2v2"
        variants={variants.path9}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Fingerprint(props: FingerprintProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Fingerprint,
  Fingerprint as FingerprintIcon,
  type FingerprintProps,
  type FingerprintProps as FingerprintIconProps,
};
