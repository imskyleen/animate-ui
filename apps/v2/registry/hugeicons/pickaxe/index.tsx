'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type PickaxeProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
      },
      animate: {
        transformOrigin: 'bottom left',
        rotate: [0, 15, -4, 0],
      },
    },
    path1: {},
    path2: {},
    path3: {},
    path4: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: PickaxeProps) {
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
      variants={variants.group}
      initial="initial"
      animate={controls}
      {...props}
    >
      <motion.g variants={variants.path1} initial="initial" animate={controls}>
        <path
          d="M13.3027 12.7166L5.18981 20.8296C4.62973 21.3897 3.72166 21.3897 3.16158 20.8296C2.6015 20.2695 2.6015 19.3614 3.16158 18.8014L11.2745 10.6884"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M10.7259 9.51097V9.51097Z" strokeLinejoin="round" />
      </motion.g>
      <motion.path
        d="M12.7942 6.12507L10.2589 3.58976C9.13875 2.46959 7.32262 2.46959 6.20245 3.58976L10.766 8.15332"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M14.3983 5.8385V5.8385C13.7682 5.8385 13.2612 6.34556 12.2471 7.35969C11.2329 8.37381 10.7259 8.88087 10.7259 9.51097C10.7259 10.1411 11.2329 10.6481 12.2471 11.6623C13.2612 12.6764 13.7682 13.1834 14.3983 13.1834V13.1834M14.3983 5.8385C15.0284 5.8385 15.5355 6.34556 16.5496 7.35969C17.5637 8.37381 18.0708 8.88087 18.0708 9.51097M14.3983 13.1834C15.0284 13.1834 15.5355 12.6764 16.5496 11.6623C17.5637 10.6481 18.0708 10.1411 18.0708 9.51097M18.0708 9.51097V9.51097Z"
        strokeLinejoin="round"
        variants={variants.path3}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M17.8674 11.1949L20.4027 13.7303C21.5229 14.8504 21.5229 16.6666 20.4027 17.7868L15.8392 13.2232"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path4}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Pickaxe(props: PickaxeProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Pickaxe,
  Pickaxe as PickaxeIcon,
  type PickaxeProps,
  type PickaxeProps as PickaxeIconProps,
};
