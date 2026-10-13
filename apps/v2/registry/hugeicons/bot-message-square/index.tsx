'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type BotMessageSquareProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: { rotate: 0 },
      animate: {
        transformOrigin: 'bottom left',
        rotate: [0, 4, -4, 1, 0],
        transition: {
          ease: 'easeInOut',
          duration: 0.8,
          times: [0, 0.4, 0.6, 0.8, 1],
        },
      },
    },
    path1: {},
    path2: {},
    path3: {},
    path4: {
      initial: { scaleY: 1 },
      animate: {
        scaleY: [1, 0.5, 1],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    path5: {},
    path6: {},
  } satisfies Record<string, Variants>,
  'look-at': {
    group: {},
    path1: {},
    path2: {},
    path3: {},
    path4: {
      initial: { x: 0, y: 0 },
      animate: {
        x: [0, -1.5, 1.5, 0],
        y: [0, 1.5, 1.5, 0],
        transition: { ease: 'easeInOut', duration: 1.3 },
      },
    },
    path5: {
      initial: { x: 0, y: 0 },
      animate: {
        x: [0, -1.5, 1.5, 0],
        y: [0, 1.5, 1.5, 0],
        transition: { ease: 'easeInOut', duration: 1.3 },
      },
    },
    path6: {},
  } satisfies Record<string, Variants>,
  blink: {
    group: {},
    path1: {},
    path2: {},
    path3: {},
    path4: {
      initial: { scaleY: 1 },
      animate: {
        scaleY: [1, 0.5, 1],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    path5: {
      initial: { scaleY: 1 },
      animate: {
        scaleY: [1, 0.5, 1],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    path6: {},
  } satisfies Record<string, Variants>,
  wink: {
    group: {},
    path1: {},
    path2: {},
    path3: {},
    path4: {},
    path5: {
      initial: { scaleY: 1 },
      animate: {
        scaleY: [1, 0.5, 1],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    path6: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: BotMessageSquareProps) {
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
          d="M19.499 15V12C19.499 10.1144 19.499 9.17157 18.9132 8.58579C18.3275 8 17.3846 8 15.499 8H8.49902C6.61341 8 5.6706 8 5.08481 8.58579C4.49902 9.17157 4.49902 10.1144 4.49902 12V16.5C4.49902 16.9647 4.49902 17.197 4.53745 17.3902C4.69527 18.1836 5.31546 18.8038 6.10884 18.9616C6.30204 19 6.53437 19 6.99902 19C6.99902 20.3737 6.99902 21.0605 7.37501 21.3608C7.4763 21.4416 7.59236 21.5021 7.71671 21.5387C8.1783 21.6745 8.74098 21.2806 9.86634 20.4929L11.4825 19.3615C11.7387 19.1822 11.8668 19.0925 12.0136 19.0463C12.1604 19 12.3167 19 12.6295 19H15.499C17.3846 19 18.3275 19 18.9132 18.4142C19.499 17.8284 19.499 16.8856 19.499 15Z"
          strokeLinejoin="round"
        />
        <path d="M11.999 8V5" strokeLinecap="round" />
        <path
          d="M4.5 16H4C3.05719 16 2.58579 16 2.29289 15.7071C2 15.4142 2 14.9428 2 14V12.5C2 12.0341 2 11.8011 2.07612 11.6173C2.17761 11.3723 2.37229 11.1776 2.61732 11.0761C2.80109 11 3.03406 11 3.5 11H4.5"
          strokeLinecap="round"
        />
        <path
          d="M19.4961 11H19.9961C20.9389 11 21.4103 11 21.7032 11.2929C21.9961 11.5858 21.9961 12.0572 21.9961 13V14C21.9961 14.9428 21.9961 15.4142 21.7032 15.7071C21.4103 16 20.9389 16 19.9961 16H19.4961"
          strokeLinecap="round"
        />
        <path d="M13.499 3.5C13.499 4.32843 12.8275 5 11.999 5C11.1706 5 10.499 4.32843 10.499 3.5C10.499 2.67157 11.1706 2 11.999 2C12.8275 2 13.499 2.67157 13.499 3.5Z" />
        <path
          d="M9.99902 15.5C9.99902 15.5 10.6657 16 11.999 16C13.3324 16 13.999 15.5 13.999 15.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <motion.path
          d="M8.99902 11.5V12.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path4}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M14.999 11.5V12.5"
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

function BotMessageSquare(props: BotMessageSquareProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  BotMessageSquare,
  BotMessageSquare as BotMessageSquareIcon,
  type BotMessageSquareProps,
  type BotMessageSquareProps as BotMessageSquareIconProps,
};
