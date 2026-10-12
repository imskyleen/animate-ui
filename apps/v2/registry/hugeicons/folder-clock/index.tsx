'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type FolderClockProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    face1: {},
    face2: {},
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

function IconComponent({ size, ...props }: FolderClockProps) {
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
      <motion.circle
        cx={17}
        cy={16.5}
        r={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.face1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M8.01332 6.50447H16.7827C18.8941 6.50447 19.9498 6.50447 20.7081 7.01062C21.0364 7.22974 21.3183 7.51131 21.5377 7.83925C21.8193 8.26031 21.9444 8.77313 22 9.50782M12.0222 6.50447L11.3874 5.23618C10.8614 4.18546 10.3808 3.12782 9.21524 2.69122C8.70475 2.5 8.12158 2.5 6.95525 2.5C5.13474 2.5 4.22449 2.5 3.54148 2.88074C3.0546 3.15215 2.65287 3.55344 2.38116 4.03978C2 4.72204 2 5.63129 2 7.44979V10.5089C2 15.2282 2 17.5879 3.46772 19.054C4.58412 20.1692 6.21809 20.4361 9.01554 20.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.face2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M17 14.5L17 16.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.minute}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M18.5 17L17 16.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.hour}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function FolderClock(props: FolderClockProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  FolderClock,
  FolderClock as FolderClockIcon,
  type FolderClockProps,
  type FolderClockProps as FolderClockIconProps,
};
