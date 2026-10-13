'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type ShoppingBagProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    bag: {
      initial: { scaleY: 1, transformOrigin: '50% 100%' },
      animate: {
        scaleY: [1, 1.03, 0.97, 1],
        transformOrigin: '50% 100%',
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    handle: {
      initial: { y: 0 },
      animate: {
        y: [0, -1.2, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ShoppingBagProps) {
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
      <motion.g variants={variants.bag} initial="initial" animate={controls}>
        <path d="M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z" />
        <path d="M3.103 6.034h17.794" />
        <motion.path
          d="M16 10a4 4 0 0 1-8 0"
          variants={variants.handle}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function ShoppingBag(props: ShoppingBagProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  ShoppingBag,
  ShoppingBag as ShoppingBagIcon,
  type ShoppingBagProps,
  type ShoppingBagProps as ShoppingBagIconProps,
};
