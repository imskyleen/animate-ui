'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type RotateLeft01Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path1: {},
    path2: {},
    group: {
      initial: { rotate: 0 },
      animate: {
        rotate: [0, -12, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: RotateLeft01Props) {
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
          d="M20.0071 14.5662L19.3587 14.1731C18.7986 13.8508 18.3579 13.3564 18.102 12.7634L15.68 7.15102C15.5927 6.94865 15.4729 6.77988 15.328 6.64097C14.6876 6.02689 13.5808 6.28697 13.0432 6.99226C12.0506 8.29448 13.3839 9.52751 13.1022 10.6133L5.35908 6.26089C3.55799 5.28913 2.0024 7.87074 3.79277 9.06333L8.37607 11.6124C7.4934 12.765 5.25512 18.3551 8.12341 20.0599C8.28646 20.1568 8.4672 20.2213 8.64852 20.2773C8.76516 20.3134 8.88186 20.3496 8.99761 20.3857C9.8979 20.6667 11.6003 21.02 12.7668 20.9182C13.9811 20.8123 14.7421 21.4597 15.68 21.9995"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path1}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M9.36184 4.96447C9.75873 5.36011 11.4854 5.24597 12.1223 5.16653M9.36184 4.96447C8.96494 4.56883 8.95358 2.63679 9.03328 2.0019M9.36184 4.96447C10.3829 3.19624 14.4425 0.375691 18.4708 3.19624C20.4175 4.55924 20.6922 5.4182 21 5.99362"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path2}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function RotateLeft01(props: RotateLeft01Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  RotateLeft01,
  RotateLeft01 as RotateLeft01Icon,
  type RotateLeft01Props,
  type RotateLeft01Props as RotateLeft01IconProps,
};
