'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type CompassProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path: {
      initial: { transformOrigin: '57.1% 42.9%', rotate: 0 },
      animate: {
        transformOrigin: '57.1% 42.9%',
        rotate: [0, 95, 75],
        transition: {
          duration: 0.7,
          ease: 'easeInOut',
        },
      },
    },
    circle: {},
  } satisfies Record<string, Variants>,
  'default-loop': {
    path: {
      initial: { transformOrigin: '57.1% 42.9%', rotate: 0 },
      animate: {
        transformOrigin: '57.1% 42.9%',
        rotate: [0, 95, 75, -20, 0],
        transition: {
          duration: 1.4,
          ease: 'easeInOut',
        },
      },
    },
    circle: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: CompassProps) {
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
        d="M14.7728 10.2571C15.5061 10.9837 14.3328 16.8933 13.1289 16.9974C12.1189 17.0848 11.8041 15.0928 11.5914 14.4614C11.3815 13.8383 11.1478 13.6139 10.5298 13.4095C8.95989 12.8901 8.17492 12.6304 8.0195 12.2192C7.60796 11.1304 13.8362 9.32902 14.7728 10.2571Z"
        variants={variants.path}
        initial="initial"
        animate={controls}
      />
      <motion.g variants={variants.circle} initial="initial" animate={controls}>
        <circle cx={12} cy={13} r={9} strokeLinecap="round" />
        <path d="M10 2H14" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 3.5V2" strokeLinecap="round" strokeLinejoin="round" />
      </motion.g>
    </motion.svg>
  );
}

function Compass(props: CompassProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Compass,
  Compass as CompassIcon,
  type CompassProps,
  type CompassProps as CompassIconProps,
};
