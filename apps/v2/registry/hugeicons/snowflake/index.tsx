'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type SnowflakeProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: { rotate: 0, scale: 1, transition: { duration: 0 } },
      animate: {
        rotate: 60,
        scale: [1, 0.9, 1],
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: SnowflakeProps) {
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
        <path
          d="M14.244 3.00632C13.801 3.40963 12.6212 5.00086 11.991 5C11.3608 4.99909 10.1858 3.40451 9.744 3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14.244 20.9937C13.801 20.5904 12.6212 18.9991 11.991 19C11.3608 19.0009 10.1858 20.5955 9.744 21"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20.9077 9.45191C20.337 9.26993 18.3691 9.04383 18.0547 8.4976C17.7404 7.9514 18.5338 6.13651 18.6632 5.55164"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.33024 18.4456C5.45802 17.8603 6.24618 16.043 5.93032 15.4976C5.61445 14.9523 3.64599 14.732 3.07477 14.5516"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3.07602 9.45203C3.64679 9.27005 5.61472 9.04395 5.9291 8.49772C6.2434 7.95152 5.44996 6.13663 5.32055 5.55176"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18.6529 18.4457C18.5252 17.8604 17.737 16.0431 18.0529 15.4977C18.3687 14.9524 20.3372 14.7321 20.9084 14.5518"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15.4581 9.97911L17.994 8.49982"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11.9937 8.02071L11.9937 4.99982"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M17.9937 15.4998L15.458 14.0206"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.99424 15.4998L8.56579 13.9997"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11.9937 18.9998L11.9937 15.9789"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.56579 10.0001L5.994 8.49982"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15.4957 11.7313C15.4955 10.8861 15.4955 10.4635 15.2945 10.1155C15.0935 9.76744 14.7275 9.55617 13.9955 9.13361L13.5316 8.86583C12.7996 8.44326 12.4336 8.23198 12.0317 8.23199C11.6298 8.23201 11.2638 8.44332 10.5318 8.86593L10.0679 9.13379C9.33581 9.55644 8.96978 9.76777 8.76882 10.1158C8.56786 10.4639 8.56786 10.8866 8.56786 11.7319L8.56786 12.2677C8.56786 13.113 8.56786 13.5356 8.76881 13.8837C8.96976 14.2318 9.33578 14.4431 10.0678 14.8658L10.5319 15.1337C11.264 15.5564 11.63 15.7678 12.032 15.7678C12.4339 15.7678 12.7999 15.5564 13.532 15.1338L13.9958 14.866C14.728 14.4433 15.0941 14.2319 15.295 13.8838C15.496 13.5356 15.4959 13.1129 15.4958 12.2674L15.4957 11.7313Z"
          strokeLinejoin="round"
        />
      </motion.g>
    </motion.svg>
  );
}

function Snowflake(props: SnowflakeProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Snowflake,
  Snowflake as SnowflakeIcon,
  type SnowflakeProps,
  type SnowflakeProps as SnowflakeIconProps,
};
