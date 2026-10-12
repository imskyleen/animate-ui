'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type Upload04Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: { y: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
      animate: { y: -2, transition: { duration: 0.3, ease: 'easeInOut' } },
    },
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
  'default-loop': {
    group: {
      initial: { y: 0 },
      animate: {
        y: [0, -2, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: Upload04Props) {
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
          d="M16.5 7.49996C16.5 7.49996 13.1858 3.00001 12 3C10.8141 2.99999 7.5 7.5 7.5 7.5M12 4V15"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path1}
          initial="initial"
          animate={controls}
        />
      </motion.g>
      <motion.path
        d="M5.25 21H18.75C18.9822 21 19.0983 21 19.196 20.9904C20.1456 20.8968 20.8968 20.1456 20.9904 19.196C21 19.0983 21 18.9822 21 18.75C21 18.5178 21 18.4017 20.9904 18.304C20.8968 17.3544 20.1456 16.6032 19.196 16.5096C19.0983 16.5 18.9822 16.5 18.75 16.5H17.0607C16.8324 16.5 16.7182 16.5 16.6087 16.5121C16.2317 16.5538 15.8742 16.7018 15.5781 16.939C15.4921 17.0079 15.4114 17.0886 15.25 17.25C15.0886 17.4114 15.0079 17.4921 14.9219 17.561C14.6258 17.7982 14.2683 17.9462 13.8913 17.9879C13.7818 18 13.6676 18 13.4393 18H10.5607C10.3324 18 10.2182 18 10.1087 17.9879C9.73165 17.9462 9.37423 17.7982 9.07814 17.561C8.99213 17.4921 8.91142 17.4114 8.75 17.25C8.58858 17.0886 8.50787 17.0079 8.42186 16.939C8.12577 16.7018 7.76835 16.5538 7.3913 16.5121C7.28177 16.5 7.16763 16.5 6.93934 16.5H5.25C5.01783 16.5 4.90175 16.5 4.80397 16.5096C3.85441 16.6032 3.10315 17.3544 3.00963 18.304C3 18.4017 3 18.5178 3 18.75C3 18.9822 3 19.0983 3.00963 19.196C3.10315 20.1456 3.85441 20.8968 4.80397 20.9904C4.90175 21 5.01783 21 5.25 21Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Upload04(props: Upload04Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Upload04,
  Upload04 as Upload04Icon,
  type Upload04Props,
  type Upload04Props as Upload04IconProps,
};
