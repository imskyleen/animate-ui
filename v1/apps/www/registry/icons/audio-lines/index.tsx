'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type AudioLinesProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    line1: {
      initial: {
        y1: 10,
        y2: 13,
      },
      animate: {
        y1: [10, 5, 8, 6, 10],
        y2: [13, 18, 15, 17, 13],
        transition: {
          duration: 1.5,
          ease: 'linear',
          repeat: Infinity,
        },
      },
    },
    line2: {
      initial: {
        y1: 6,
        y2: 17,
      },
      animate: {
        y1: [6, 2, 10, 6],
        y2: [17, 22, 13, 17],
        transition: {
          duration: 1.5,
          ease: 'linear',
          repeat: Infinity,
        },
      },
    },
    line3: {
      initial: {
        y1: 3,
        y2: 21,
      },
      animate: {
        y1: [3, 6, 3, 8, 3],
        y2: [21, 17, 21, 15, 21],
        transition: {
          duration: 1.5,
          ease: 'linear',
          repeat: Infinity,
        },
      },
    },
    line4: {
      initial: {
        y1: 8,
        y2: 15,
      },
      animate: {
        y1: [8, 4, 7, 2, 8],
        y2: [15, 19, 16, 22, 15],
        transition: {
          duration: 1.5,
          ease: 'linear',
          repeat: Infinity,
        },
      },
    },
    line5: {
      initial: {
        y1: 5,
        y2: 18,
      },
      animate: {
        y1: [5, 10, 4, 8, 5],
        y2: [18, 13, 19, 15, 18],
        transition: {
          duration: 1.5,
          ease: 'linear',
          repeat: Infinity,
        },
      },
    },
    line6: {
      initial: {
        y1: 10,
        y2: 13,
      },
      animate: {
        y1: [10, 8, 5, 10],
        y2: [13, 15, 18, 13],
        transition: {
          duration: 1.5,
          ease: 'linear',
          repeat: Infinity,
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: AudioLinesProps) {
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
      <motion.line
        x1={2}
        y1={10}
        x2={2}
        y2={13}
        variants={variants.line1}
        initial="initial"
        animate={controls}
      />
      <motion.line
        x1={6}
        y1={6}
        x2={6}
        y2={17}
        variants={variants.line2}
        initial="initial"
        animate={controls}
      />
      <motion.line
        x1={10}
        y1={3}
        x2={10}
        y2={21}
        variants={variants.line3}
        initial="initial"
        animate={controls}
      />
      <motion.line
        x1={14}
        y1={8}
        x2={14}
        y2={15}
        variants={variants.line4}
        initial="initial"
        animate={controls}
      />
      <motion.line
        x1={18}
        y1={5}
        x2={18}
        y2={18}
        variants={variants.line5}
        initial="initial"
        animate={controls}
      />
      <motion.line
        x1={22}
        y1={10}
        x2={22}
        y2={13}
        variants={variants.line6}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function AudioLines(props: AudioLinesProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  AudioLines,
  AudioLines as AudioLinesIcon,
  type AudioLinesProps,
  type AudioLinesProps as AudioLinesIconProps,
};
