'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type BetweenVerticalStartProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    leftRect: {
      initial: {
        x: 0,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        x: -2,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
    rightRect: {
      initial: {
        x: 0,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        x: 2,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
    arrow: {
      initial: {
        y: 0,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        y: 3,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    leftRect: {
      initial: { x: 0 },
      animate: {
        x: [0, -2, 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    rightRect: {
      initial: { x: 0 },
      animate: {
        x: [0, 2, 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    arrow: {
      initial: { y: 0 },
      animate: {
        y: [0, 3, 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: BetweenVerticalStartProps) {
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
        d="M10 18.5L10 11.5C10 10.5694 10 10.104 9.87764 9.72746C9.63035 8.96636 9.03364 8.36965 8.27254 8.12236C7.89596 8 7.43064 8 6.5 8C5.56936 8 5.10404 8 4.72746 8.12236C3.96636 8.36965 3.36965 8.96636 3.12236 9.72746C3 10.104 3 10.5694 3 11.5L3 18.5C3 19.4306 3 19.896 3.12236 20.2725C3.36965 21.0336 3.96636 21.6303 4.72746 21.8776C5.10404 22 5.56936 22 6.5 22C7.43064 22 7.89596 22 8.27254 21.8776C9.03364 21.6303 9.63035 21.0336 9.87764 20.2725C10 19.896 10 19.4306 10 18.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.leftRect}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M15 2C15 2 12.7906 5.00001 12 5C11.2095 4.99999 9 2.00002 9 2.00002"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.arrow}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M21 18.5L21 11.5C21 10.5694 21 10.104 20.8776 9.72746C20.6303 8.96636 20.0336 8.36965 19.2725 8.12236C18.896 8 18.4306 8 17.5 8C16.5694 8 16.104 8 15.7275 8.12236C14.9664 8.36965 14.3697 8.96636 14.1224 9.72746C14 10.104 14 10.5694 14 11.5L14 18.5C14 19.4306 14 19.896 14.1224 20.2725C14.3697 21.0336 14.9664 21.6303 15.7275 21.8776C16.104 22 16.5694 22 17.5 22C18.4306 22 18.896 22 19.2725 21.8776C20.0336 21.6303 20.6303 21.0336 20.8776 20.2725C21 19.896 21 19.4306 21 18.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.rightRect}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function BetweenVerticalStart(props: BetweenVerticalStartProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  BetweenVerticalStart,
  BetweenVerticalStart as BetweenVerticalStartIcon,
  type BetweenVerticalStartProps,
  type BetweenVerticalStartProps as BetweenVerticalStartIconProps,
};
