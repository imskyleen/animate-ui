'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type RadioProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path1: {
      initial: { opacity: 1, scale: 1 },
      animate: {
        opacity: [1, 0.25, 1],
        scale: [1, 0.85, 1],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
    path2: {
      initial: { opacity: 1, scale: 1 },
      animate: {
        opacity: [1, 0.25, 1],
        scale: [1, 0.85, 1],
        transition: { duration: 0.5, ease: 'easeInOut', delay: 0.15 },
      },
    },
  } satisfies Record<string, Variants>,
  blink: {
    path1: {
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
    path2: {
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
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: RadioProps) {
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
      <path
        d="M2 13.5C2 9.74142 2 7.86213 3.0528 6.60746C3.22119 6.40678 3.40678 6.22119 3.60746 6.0528C4.86213 5 6.74142 5 10.5 5H13.5C17.2586 5 19.1379 5 20.3925 6.0528C20.5932 6.22119 20.7788 6.40678 20.9472 6.60746C22 7.86213 22 9.74142 22 13.5C22 17.2586 22 19.1379 20.9472 20.3925C20.7788 20.5932 20.5932 20.7788 20.3925 20.9472C19.1379 22 17.2586 22 13.5 22H10.5C6.74142 22 4.86213 22 3.60746 20.9472C3.40678 20.7788 3.22119 20.5932 3.0528 20.3925C2 19.1379 2 17.2586 2 13.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 5L14 2" strokeLinecap="round" />
      <motion.g variants={variants.path1} initial="initial" animate={controls}>
        <circle cx={14.5} cy={13.5} r={3.5} />
      </motion.g>
      <motion.g variants={variants.path2} initial="initial" animate={controls}>
        <path d="M6 12H7" strokeLinecap="round" />
        <path d="M6 15H7" strokeLinecap="round" />
      </motion.g>
    </motion.svg>
  );
}

function Radio(props: RadioProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Radio,
  Radio as RadioIcon,
  type RadioProps,
  type RadioProps as RadioIconProps,
};
