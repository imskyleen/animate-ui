'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type ClockFadingProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    face1: {},
    minute: {
      initial: {
        rotate: 0,
        transformOrigin: '50% 100%',
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
      animate: {
        rotate: 360,
        transformOrigin: '50% 100%',
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    hour: {
      initial: {
        rotate: 0,
        transformOrigin: '0% 0%',
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
      animate: {
        rotate: [0, 20, 0],
        transformOrigin: '0% 0%',
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ClockFadingProps) {
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
        d="M5.43823 19.5496C6.54888 20.5162 7.89133 21.2512 9.40963 21.6576C10.2751 21.8893 11.1446 22 12 22M16.5374 20.906C17.6966 20.3145 18.7389 19.4992 19.5953 18.5M21.6561 14.5847C21.9352 13.5441 22.0395 12.4978 21.9868 11.4771M20.9103 7.46053C20.699 7.04586 20.4591 6.64615 20.1924 6.26456M16.4698 3.05251C15.8798 2.7588 15.2517 2.51942 14.5904 2.34238C9.25745 0.914877 3.77452 4.08152 2.3439 9.41528C1.78336 11.5051 1.92809 13.6176 2.63227 15.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.face1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M12 6L12 12"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.minute}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M16 14L12 12"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.hour}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function ClockFading(props: ClockFadingProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  ClockFading,
  ClockFading as ClockFadingIcon,
  type ClockFadingProps,
  type ClockFadingProps as ClockFadingIconProps,
};
