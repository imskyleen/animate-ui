'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type RadioTowerProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    circle: {},
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
    path3: {},
    path4: {},
  } satisfies Record<string, Variants>,
  blink: {
    circle: {},
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
    path3: {},
    path4: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: RadioTowerProps) {
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
      <circle cx={11.9922} cy={8.65723} r={2.0} />
      <path d="M11.9922 11V21" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M8.49219 21H15.4922"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <motion.g variants={variants.path1} initial="initial" animate={controls}>
        <path
          d="M15.5277 12.1931C17.4803 10.2405 17.4803 7.07469 15.5277 5.12207"
          strokeLinecap="round"
        />
        <path
          d="M8.45665 12.1931C6.50403 10.2405 6.50403 7.07469 8.45665 5.12207"
          strokeLinecap="round"
        />
      </motion.g>
      <motion.g variants={variants.path2} initial="initial" animate={controls}>
        <path
          d="M17.649 14.3137C20.7732 11.1895 20.7732 6.12419 17.649 3"
          strokeLinecap="round"
        />
        <path
          d="M6.33533 14.3137C3.21114 11.1895 3.21114 6.12419 6.33533 3"
          strokeLinecap="round"
        />
      </motion.g>
    </motion.svg>
  );
}

function RadioTower(props: RadioTowerProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  RadioTower,
  RadioTower as RadioTowerIcon,
  type RadioTowerProps,
  type RadioTowerProps as RadioTowerIconProps,
};
