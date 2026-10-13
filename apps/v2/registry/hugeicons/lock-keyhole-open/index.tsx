'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type LockKeyholeOpenProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
        scale: 1,
      },
      animate: {
        rotate: [0, 7, -5, 0],
        scale: [1, 0.9, 1, 1],
        transition: {
          duration: 1.2,
          ease: 'easeInOut',
        },
      },
    },
    path: {
      initial: {
        d: 'M7.49609 9V6.5C7.49609 4.01472 9.51081 2 11.9961 2C13.9554 2 15.3783 3.25221 15.9961 5V5',
      },
      animate: {
        d: [
          'M7.49609 9V6.5C7.49609 4.01472 9.51081 2 11.9961 2C13.9554 2 15.3783 3.25221 15.9961 5V5',
          'M7.49609 9V6.5C7.49609 4.01472 9.51081 2 11.9961 2C14.4814 2 16.4961 4.01472 16.4961 6.5V9',
          'M7.49609 9V6.5C7.49609 4.01472 9.51081 2 11.9961 2C13.9554 2 15.3783 3.25221 15.9961 5V5',
          'M7.49609 9V6.5C7.49609 4.01472 9.51081 2 11.9961 2C13.9554 2 15.3783 3.25221 15.9961 5V5',
        ],
        transition: {
          duration: 1.2,
          ease: 'easeInOut',
        },
      },
    },
    rect: {},
    circle: {},
  } satisfies Record<string, Variants>,
  lock: {
    group: {
      initial: {
        rotate: 0,
        scale: 1,
      },
      animate: {
        rotate: [0, 7, 0],
        scale: [1, 0.9, 1],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
        },
      },
    },
    path: {
      initial: {
        d: 'M7.49609 9V6.5C7.49609 4.01472 9.51081 2 11.9961 2C13.9554 2 15.3783 3.25221 15.9961 5V5',
      },
      animate: {
        d: [
          'M7.49609 9V6.5C7.49609 4.01472 9.51081 2 11.9961 2C13.9554 2 15.3783 3.25221 15.9961 5V5',
          'M7.49609 9V6.5C7.49609 4.01472 9.51081 2 11.9961 2C14.4814 2 16.4961 4.01472 16.4961 6.5V9',
        ],
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
        },
      },
    },
    rect: {},
    circle: {},
  } satisfies Record<string, Variants>,
  unlock: {
    group: {
      initial: {
        rotate: 0,
        scale: 1,
      },
      animate: {
        rotate: [0, -5, 0],
        scale: [1, 0.9, 1],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
        },
      },
    },
    path: {
      initial: {
        d: 'M7.49609 9V6.5C7.49609 4.01472 9.51081 2 11.9961 2C13.9554 2 15.3783 3.25221 15.9961 5V5',
      },
      animate: {
        d: [
          'M7.49609 9V6.5C7.49609 4.01472 9.51081 2 11.9961 2C14.4814 2 16.4961 4.01472 16.4961 6.5V9',
          'M7.49609 9V6.5C7.49609 4.01472 9.51081 2 11.9961 2C13.9554 2 15.3783 3.25221 15.9961 5V5',
        ],
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
        },
      },
    },
    rect: {},
    circle: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: LockKeyholeOpenProps) {
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
      <motion.g variants={variants.group} initial="initial" animate={controls}>
        <motion.circle
          cx={11.9961}
          cy={15.5}
          r={2}
          variants={variants.circle}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M13.4955 9H10.4961C8.16128 9 6.99386 9 6.11018 9.47237C5.41244 9.84535 4.84098 10.4169 4.46807 11.1146C3.99578 11.9984 3.99589 13.1658 3.9961 15.5006C3.99632 17.835 3.99643 19.0023 4.46877 19.8858C4.84172 20.5835 5.41317 21.1548 6.11085 21.5277C6.99445 22 8.16166 22 10.4961 22H13.4955C15.8301 22 16.9974 22 17.8811 21.5277C18.5788 21.1548 19.1503 20.5833 19.5232 19.8856C19.9955 19.0019 19.9955 17.8346 19.9955 15.5C19.9955 13.1654 19.9955 11.9981 19.5232 11.1144C19.1503 10.4167 18.5788 9.84525 17.8811 9.47231C16.9974 9 15.8301 9 13.4955 9Z"
          strokeLinecap="round"
          variants={variants.rect}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M7.49609 9V6.5C7.49609 4.01472 9.51081 2 11.9961 2C13.9554 2 15.3783 3.25221 15.9961 5V5"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function LockKeyholeOpen(props: LockKeyholeOpenProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  LockKeyholeOpen,
  LockKeyholeOpen as LockKeyholeOpenIcon,
  type LockKeyholeOpenProps,
  type LockKeyholeOpenProps as LockKeyholeOpenIconProps,
};
