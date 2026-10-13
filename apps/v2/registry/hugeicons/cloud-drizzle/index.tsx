'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type CloudDrizzleProps = IconProps<keyof typeof animations>;

const drizzleAnimation: Variants = {
  initial: { opacity: 1 },
  animate: (i: number = 0) => ({
    opacity: [1, 0.4, 1],
    transition: {
      duration: 1.2,
      ease: 'easeInOut',
      repeat: Infinity,
      delay: i * 0.2,
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
    path2: drizzleAnimation,
    path3: drizzleAnimation,
    path4: drizzleAnimation,
    path5: drizzleAnimation,
    path6: drizzleAnimation,
    path7: drizzleAnimation,
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: CloudDrizzleProps) {
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
        d="M4 17.0004C2.78555 16.0882 2 14.6358 2 13C2 10.4003 3.98398 8.26407 6.52042 8.0227M6.52042 8.0227C6.76233 5.20862 9.12324 3 12 3C15.0376 3 17.5 5.46243 17.5 8.5C17.5 8.66856 17.4924 8.83536 17.4776 9.00005M6.52042 8.0227C6.67826 8.00768 6.83823 8 7 8C7.7111 8 8.38754 8.14845 9 8.41604M17.4776 9.00005C17.485 9.00002 17.4925 9 17.5 9C19.9853 9 22 11.0147 22 13.5C22 15.0602 21.206 16.435 20 17.2422M17.4776 9.00005C17.4466 9.34345 17.3841 9.67773 17.293 10"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.g variants={variants.group} initial="initial" animate={controls}>
        <motion.path
          d="M8 13V14"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path2}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M12 20V21"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path3}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M16 13V14"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path4}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M12 15V16"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path7}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M16 18V19"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path6}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M8 18V19"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path5}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function CloudDrizzle(props: CloudDrizzleProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  CloudDrizzle,
  CloudDrizzle as CloudDrizzleIcon,
  type CloudDrizzleProps,
  type CloudDrizzleProps as CloudDrizzleIconProps,
};
