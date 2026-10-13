'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type RotateCcwKeyProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 150, damping: 25 },
      },
      animate: {
        rotate: -45,
        scale: 0.85,
        transition: { type: 'spring', stiffness: 150, damping: 25 },
      },
    },
    arrowArc: {},
    arrowHead: {},
    keyPart1: {},
    keyPart2: {},
    circle: {},
  } satisfies Record<string, Variants>,
  rotate: {
    group: {
      initial: {
        rotate: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 170, damping: 26 },
      },
      animate: {
        rotate: -360,
        scale: [1, 0.8, 0.8, 1],
        transition: {
          rotate: { type: 'spring', stiffness: 170, damping: 26, delay: 0.1 },
          scale: {
            duration: 1.4,
            ease: 'easeInOut',
            times: [0, 0.07, 0.85, 1],
          },
        },
      },
    },
    arrowArc: {},
    arrowHead: {},
    keyPart1: {},
    keyPart2: {},
    circle: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: RotateCcwKeyProps) {
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
      variants={variants.group}
      initial="initial"
      animate={controls}
      {...props}
    >
      <motion.g variants={variants.group} initial="initial" animate={controls}>
        <path
          d="M3.99219 2V5.13219C3.99219 5.42605 4.35943 5.55908 4.54746 5.33333C6.37759 3.2875 9.03718 2 11.9973 2C17.5173 2 21.9922 6.47715 21.9922 12C21.9922 15.9582 19.6937 19.3793 16.3592 21"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11.6296 22C12.0918 22 12.5467 21.9695 12.9922 21.9106"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2.2549 9C2.14363 9.38726 2.05631 9.77865 1.99219 10.1722"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2.02641 13.7496C2.09601 14.1396 2.18667 14.5258 2.29762 14.9063"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3.80677 18.0963C4.04271 18.4409 4.29849 18.7726 4.57321 19.0892"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7.36647 21.3767C7.71664 21.574 8.0811 21.7526 8.45914 21.9106"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11.9922 13.1229V6.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11.9922 8.75281H13.9922"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13.4064 13.831C14.1874 14.6131 14.1874 15.8812 13.4064 16.6634C12.6254 17.4455 11.359 17.4455 10.578 16.6634C9.79693 15.8812 9.79693 14.6131 10.578 13.831C11.359 13.0488 12.6254 13.0488 13.4064 13.831Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>
    </motion.svg>
  );
}

function RotateCcwKey(props: RotateCcwKeyProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  RotateCcwKey,
  RotateCcwKey as RotateCcwKeyIcon,
  type RotateCcwKeyProps,
  type RotateCcwKeyProps as RotateCcwKeyIconProps,
};
