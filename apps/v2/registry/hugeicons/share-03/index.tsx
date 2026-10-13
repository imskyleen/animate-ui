'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type Share03Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    shaft: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
    },
    head: {
      initial: { opacity: 1, scale: 1, transformOrigin: '50% 0%' },
      animate: {
        opacity: [0, 1],
        scale: [0.3, 1],
        transformOrigin: '50% 0%',
        transition: { duration: 0.3, ease: 'easeOut', delay: 0.3 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: Share03Props) {
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
      <path
        d="M8 11C6.59987 11 5.8998 11 5.36502 11.2725C4.89462 11.5122 4.51217 11.8946 4.27248 12.365C4 12.8998 4 13.5999 4 15V16C4 18.357 4 19.5355 4.73223 20.2678C5.46447 21 6.64298 21 9 21H15C17.357 21 18.5355 21 19.2678 20.2678C20 19.5355 20 18.357 20 16V15C20 13.5999 20 12.8998 19.7275 12.365C19.4878 11.8946 19.1054 11.5122 18.635 11.2725C18.1002 11 17.4001 11 16 11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <motion.path
        d="M12.0337 15L12.0337 4"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.shaft}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M8 7C8 7 10.1958 4.28386 11.4044 3.23889C11.5987 3.0709 11.8169 2.99152 12.0337 3.00072C12.2282 3.00897 12.4215 3.08844 12.5958 3.23912C13.8041 4.28428 16 7 16 7"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.head}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Share03(props: Share03Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Share03,
  Share03 as Share03Icon,
  type Share03Props,
  type Share03Props as Share03IconProps,
};
