'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type Clock04Props = IconProps<keyof typeof animations>;

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

function IconComponent({ size, ...props }: Clock04Props) {
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
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C7.52232 2 3.77426 4.94289 2.5 9H5"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.face1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M2 12C2 12.3373 2.0152 12.6709 2.04494 13M9 22C8.6584 21.8876 8.32471 21.7564 8 21.6078M3.20939 17C3.01655 16.6284 2.84453 16.2433 2.69497 15.8462M4.83122 19.3065C5.1369 19.6358 5.46306 19.9441 5.80755 20.2292"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.face2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M12 8L12 12"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.minute}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M14 14L12 12"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.hour}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Clock04(props: Clock04Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Clock04,
  Clock04 as Clock04Icon,
  type Clock04Props,
  type Clock04Props as Clock04IconProps,
};
