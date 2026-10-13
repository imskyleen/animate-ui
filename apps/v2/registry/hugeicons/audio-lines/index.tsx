'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type AudioLinesProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    line1: {
      initial: { d: 'M4 11V13' },
      animate: {
        d: [
          'M4 11V13',
          'M4 7.66667V16.3333',
          'M4 9.66667V14.3333',
          'M4 8.33333V15.6667',
          'M4 11V13',
        ],
        transition: { duration: 1.5, ease: 'linear', repeat: Infinity },
      },
    },
    line2: {
      initial: { d: 'M8 7V17' },
      animate: {
        d: ['M8 7V17', 'M8 3V21', 'M8 10.6364V13.3636', 'M8 7V17'],
        transition: { duration: 1.5, ease: 'linear', repeat: Infinity },
      },
    },
    line3: {
      initial: { d: 'M12 3V21' },
      animate: {
        d: ['M12 3V21', 'M12 6.5V17.5', 'M12 3V21', 'M12 8.5V15.5', 'M12 3V21'],
        transition: { duration: 1.5, ease: 'linear', repeat: Infinity },
      },
    },
    line4: {
      initial: { d: 'M16 7V17' },
      animate: {
        d: [
          'M16 7V17',
          'M16 3V21',
          'M16 5.57143V18.4286',
          'M16 3V21',
          'M16 7V17',
        ],
        transition: { duration: 1.5, ease: 'linear', repeat: Infinity },
      },
    },
    line5: {
      initial: { d: 'M20 11V13' },
      animate: {
        d: [
          'M20 11V13',
          'M20 11.7692V12.2308',
          'M20 10.8461V13.1539',
          'M20 11.4615V12.5385',
          'M20 11V13',
        ],
        transition: { duration: 1.5, ease: 'linear', repeat: Infinity },
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
      {...props}
    >
      <motion.path
        d="M4 11V13"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.line1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M8 7V17"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.line2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M12 3V21"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.line3}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M16 7V17"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.line4}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M20 11V13"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.line5}
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
