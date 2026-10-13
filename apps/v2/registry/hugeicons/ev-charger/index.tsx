'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type EvChargerProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path1: {},
    path2: {},
    path3: {},
    path4: {},
    path5: {
      initial: { opacity: 1, scale: 1 },
      animate: {
        opacity: [1, 0.5, 1, 0.5, 1],
        scale: [1, 0.9, 1, 0.9, 1],
        transition: { duration: 1.8, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: EvChargerProps) {
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
      <path d="M2.75 21H15.75" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M15 21V8.5C15 6.15442 15 4.98164 14.3801 4.17372C14.2205 3.96572 14.0343 3.77954 13.8263 3.61994C13.0184 3 11.8456 3 9.5 3C7.15442 3 5.98164 3 5.17372 3.61994C4.96572 3.77954 4.77954 3.96572 4.61994 4.17372C4 4.98164 4 6.15442 4 8.5V21"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.75 5C18.2144 5 18.4466 5 18.6416 5.02567C19.9878 5.2029 21.0471 6.26222 21.2243 7.60842C21.25 7.80337 21.25 8.03558 21.25 8.5V17.25C21.25 18.2165 20.4665 19 19.5 19C18.5335 19 17.75 18.2165 17.75 17.25V15.75C17.75 15.0522 17.75 14.7033 17.6639 14.4194C17.47 13.7802 16.9698 13.28 16.3306 13.0861C16.0467 13 15.6978 13 15 13"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M7.5 17H11.5" strokeLinecap="round" strokeLinejoin="round" />
      <motion.path
        d="M9.25 7L8.29498 8.91459C8.05232 9.40106 7.93099 9.6443 8.04065 9.82215C8.15031 10 8.42161 10 8.96421 10H9.53579C10.0784 10 10.3497 10 10.4594 10.1779C10.569 10.3557 10.4477 10.5989 10.205 11.0854L9.25 13"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path5}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function EvCharger(props: EvChargerProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  EvCharger,
  EvCharger as EvChargerIcon,
  type EvChargerProps,
  type EvChargerProps as EvChargerIconProps,
};
