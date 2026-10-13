'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type ShoppingCartProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    basket: {
      initial: { y: 0 },
      animate: {
        y: [0, -1, 0, -0.4, 0],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
          times: [0, 0.3, 0.55, 0.75, 1],
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ShoppingCartProps) {
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
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <motion.g variants={variants.basket} initial="initial" animate={controls}>
        <path d="m2.05 2.05 1.099-.028a1 1 0 0 1 1.008.815l2.69 14.347A1 1 0 0 0 7.83 18H18" />
        <path d="M4.563 5h16.435a1 1 0 0 1 .981 1.204l-1.026 6.226A2 2 0 0 1 18.962 14H6.25" />
      </motion.g>
      <circle cx={18} cy={20} r={2} />
      <circle cx={8} cy={20} r={2} />
    </motion.svg>
  );
}

function ShoppingCart(props: ShoppingCartProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  ShoppingCart,
  ShoppingCart as ShoppingCartIcon,
  type ShoppingCartProps,
  type ShoppingCartProps as ShoppingCartIconProps,
};
