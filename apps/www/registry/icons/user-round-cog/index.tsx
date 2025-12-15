'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type UserRoundCogProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path: {
      initial: {
        y: 0,
      },
      animate: {
        y: [0, 4, -2, 0],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
        },
      },
    },
    circle: {
      initial: {
        y: 0,
      },
      animate: {
        y: [0, 1, -2, 0],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
        },
      },
    },
    group: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, 90, 180],
        transition: {
          duration: 1.25,
          ease: 'easeInOut',
        },
      },
    },
  } satisfies Record<string, Variants>,
  rotate: {
    path: {},
    circle: {},
    group: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: 360,
        transition: {
          duration: 2,
          ease: 'linear',
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: UserRoundCogProps) {
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
      <motion.path
        d="M2 21a8 8 0 0 1 10.434-7.62"
        variants={variants.path}
        initial="initial"
        animate={controls}
      />
      <motion.circle
        cx={10}
        cy={8}
        r={5}
        variants={variants.circle}
        initial="initial"
        animate={controls}
      />
      <motion.g
        variants={variants.group}
        initial="initial"
        animate={controls}
        style={{ transformOrigin: '18px 18px' }}
      >
        <path d="m14.305 19.53.923-.382" />
        <path d="m15.228 16.852-.923-.383" />
        <path d="m16.852 15.228-.383-.923" />
        <path d="m16.852 20.772-.383.924" />
        <path d="m19.148 15.228.383-.923" />
        <path d="m19.53 21.696-.382-.924" />
        <path d="m20.772 16.852.924-.383" />
        <path d="m20.772 19.148.924.383" />
        <circle cx={18} cy={18} r={3} />
      </motion.g>
    </motion.svg>
  );
}

function UserRoundCog(props: UserRoundCogProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  UserRoundCog,
  UserRoundCog as UserRoundCogIcon,
  type UserRoundCogProps,
  type UserRoundCogProps as UserRoundCogIconProps,
};
