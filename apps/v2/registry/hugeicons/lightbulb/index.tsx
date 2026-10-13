'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type LightbulbProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: { rotate: 0, transformOrigin: 'bottom center' },
      animate: {
        rotate: [0, -12, 9, -4, 0],
        transformOrigin: 'bottom center',
        transition: {
          duration: 0.8,
          ease: 'easeInOut',
          times: [0, 0.4, 0.6, 0.8, 1],
        },
      },
    },
    path1: {
      initial: { fill: 'transparent' },
      animate: {
        fill: 'currentColor',
        fillOpacity: [0, 1, 0, 1, 0],
        transition: {
          fillOpacity: {
            duration: 0.3,
            ease: 'easeInOut',
            times: [0, 0.4, 0.6, 0.8, 1],
            delay: 0.4,
          },
        },
      },
    },
    path2: {},
    path3: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: LightbulbProps) {
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
      <motion.g variants={variants.group} initial="initial" animate={controls}>
        <motion.path
          d="M15.4812 16.9043C15.48 16.7344 15.4793 16.6494 15.4796 16.6252C15.4889 15.5876 15.6101 15.2943 16.3363 14.553C16.3532 14.5357 16.5411 14.35 16.917 13.9785C18.2007 12.7095 18.9961 10.9476 18.9961 9C18.9961 5.13401 15.8621 2 11.9961 2C8.1301 2 4.99609 5.13401 4.99609 9C4.99609 10.948 5.79184 12.7102 7.07601 13.9792C7.46075 14.3594 7.65312 14.5495 7.67314 14.5701C8.38589 15.3019 8.50393 15.5845 8.52348 16.6059C8.52402 16.6345 8.52402 16.7241 8.52402 16.9033C8.52402 16.9931 8.52402 17.038 8.52547 17.0759C8.56516 18.1209 9.40314 18.9589 10.4481 18.9986C10.486 19 10.5309 19 10.6207 19H13.4004C13.4759 19 13.5137 19 13.5456 18.999C14.6056 18.9652 15.4549 18.1098 15.4812 17.0495C15.482 17.0176 15.4817 16.9799 15.4812 16.9043Z"
          variants={variants.path1}
          initial="initial"
          animate={controls}
        />
        <path
          d="M9.99609 19V20C9.99609 21.1046 10.8915 22 11.9961 22C13.1007 22 13.9961 21.1046 13.9961 20V19"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.49609 16H15.4961"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>
    </motion.svg>
  );
}

function Lightbulb(props: LightbulbProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Lightbulb,
  Lightbulb as LightbulbIcon,
  type LightbulbProps,
  type LightbulbProps as LightbulbIconProps,
};
