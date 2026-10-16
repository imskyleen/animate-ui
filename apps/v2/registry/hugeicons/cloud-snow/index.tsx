'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type CloudSnowProps = IconProps<keyof typeof animations>;

const snowAnimation: Variants = {
  initial: { x: 0, y: 0, opacity: 1 },
  animate: (i: number = 0) => ({
    x: [0, 0.5, 0, -0.5, 0],
    y: [0, 1.5, -1, 0],
    opacity: [1, 0, 0, 1],
    transition: {
      duration: 2,
      times: [0, 0.5, 0.5, 1],
      ease: ['linear', 'linear', 'easeOut'],
      repeat: Infinity,
      delay: i * 0.3,
      x: {
        inherit: true,
        times: [0, 0.25, 0.5, 0.75, 1],
        ease: 'easeInOut',
      },
    },
  }),
};

const animations = {
  default: {
    group: {
      initial: {},
      animate: {},
    },
    path1: {},
    path2: snowAnimation,
    path3: snowAnimation,
    path4: snowAnimation,
    path5: snowAnimation,
    path6: snowAnimation,
    path7: snowAnimation,
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: CloudSnowProps) {
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
      initial="initial"
      animate={controls}
      {...props}
    >
      <motion.path
        d="M4.88559 17C3.18102 16.2326 2 14.566 2 12.6338C2 10.1293 3.98398 8.07128 6.52042 7.83875M6.52042 7.83875C6.76233 5.12773 9.12324 3 12 3C15.0376 3 17.5 5.37225 17.5 8.29856C17.5 8.46095 17.4924 8.62164 17.4776 8.7803M6.52042 7.83875C6.67826 7.82428 6.83823 7.81688 7 7.81688C8.12582 7.81688 9.16474 8.17534 10.0005 8.78025M16.2428 11.6704C16.9286 10.8704 17.3753 9.8732 17.4776 8.7803M17.4776 8.7803L17.5 8.78025C19.9853 8.78025 22 10.7212 22 13.1154C22 14.8176 20.9817 16.2906 19.5 17"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.g variants={variants.group} initial="initial" animate={controls}>
        <motion.path
          d="M8 14.75L8.125 14.75M8.25 14.75C8.25 14.8881 8.13807 15 8 15C7.86193 15 7.75 14.8881 7.75 14.75C7.75 14.6119 7.86193 14.5 8 14.5C8.13807 14.5 8.25 14.6119 8.25 14.75Z"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path2}
          custom={0}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M12 20.75L12.125 20.75M12.25 20.75C12.25 20.8881 12.1381 21 12 21C11.8619 21 11.75 20.8881 11.75 20.75C11.75 20.6119 11.8619 20.5 12 20.5C12.1381 20.5 12.25 20.6119 12.25 20.75Z"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path3}
          custom={1}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M16 14.75L16.125 14.75M16.25 14.75C16.25 14.8881 16.1381 15 16 15C15.8619 15 15.75 14.8881 15.75 14.75C15.75 14.6119 15.8619 14.5 16 14.5C16.1381 14.5 16.25 14.6119 16.25 14.75Z"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path4}
          custom={2}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M12 16.75L12.125 16.75M12.25 16.75C12.25 16.8881 12.1381 17 12 17C11.8619 17 11.75 16.8881 11.75 16.75C11.75 16.6119 11.8619 16.5 12 16.5C12.1381 16.5 12.25 16.6119 12.25 16.75Z"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path7}
          custom={3}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M16 18.75L16.125 18.75M16.25 18.75C16.25 18.8881 16.1381 19 16 19C15.8619 19 15.75 18.8881 15.75 18.75C15.75 18.6119 15.8619 18.5 16 18.5C16.1381 18.5 16.25 18.6119 16.25 18.75Z"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path6}
          custom={4}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M8 18.75L8.125 18.75M8.25 18.75C8.25 18.8881 8.13807 19 8 19C7.86193 19 7.75 18.8881 7.75 18.75C7.75 18.6119 7.86193 18.5 8 18.5C8.13807 18.5 8.25 18.6119 8.25 18.75Z"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path5}
          custom={5}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function CloudSnow(props: CloudSnowProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  CloudSnow,
  CloudSnow as CloudSnowIcon,
  type CloudSnowProps,
  type CloudSnowProps as CloudSnowIconProps,
};
