'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type FanProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: { rotate: 0, transformOrigin: '48.72% 52.63%' },
      animate: {
        rotate: 360,
        transformOrigin: '48.72% 52.63%',
        transition: {
          duration: 1.2,
          ease: 'linear',
          repeat: Infinity,
          repeatType: 'loop',
        },
      },
    },
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: FanProps) {
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
      <motion.g variants={variants.group} initial="initial" animate={controls}>
        <path
          d="M9.26281 12.2458C7.19268 12.0545 4.64013 12.1232 3.2361 12.9338L3.08751 13.0196C2.62814 13.2848 2.28791 13.723 2.25891 14.2527C2.21535 15.0482 2.30808 16.3264 3.07103 17.6479C4.42486 19.9928 6.77519 21.0713 7.76997 21.4394C8.06576 21.5489 8.38955 21.5054 8.66269 21.3477C9.16614 21.0571 9.37976 20.4464 9.24709 19.8804C8.87657 18.2997 8.79308 16.0301 9.9787 14.2647C9.52837 13.8126 9.25 13.189 9.25 12.5005C9.25 12.4145 9.25434 12.3296 9.26281 12.2458Z"
          strokeLinejoin="round"
        />
        <path
          d="M14.1611 13.1637C13.9722 13.8519 13.4966 14.4215 12.8706 14.7359C13.7391 16.6397 15.09 18.8587 16.5108 19.679L16.6594 19.7648C17.1188 20.03 17.6685 20.1055 18.1416 19.8658C18.8523 19.5058 19.913 18.7864 20.6759 17.4649C22.0297 15.12 21.7886 12.5453 21.61 11.4998C21.5569 11.1889 21.3574 10.9302 21.0842 10.7725C20.5808 10.4818 19.9451 10.6021 19.5213 11C18.3133 12.1341 16.3345 13.368 14.1611 13.1637Z"
          strokeLinejoin="round"
        />
        <path
          d="M11.1722 10.0676C11.3577 10.0237 11.5511 10.0005 11.75 10.0005C12.3502 10.0005 12.901 10.212 13.3319 10.5645C14.5328 8.86728 15.75 6.62197 15.75 5.00049V4.82892C15.75 4.29848 15.5406 3.78471 15.0964 3.49477C14.4293 3.0593 13.2759 2.50049 11.75 2.50049C9.04235 2.50049 6.93318 3.99669 6.11697 4.67412C5.87428 4.87556 5.75 5.17768 5.75 5.49308C5.75 6.07441 6.17204 6.56474 6.72854 6.73284C8.25356 7.19351 10.2147 8.2251 11.1722 10.0676Z"
          strokeLinejoin="round"
        />
        <path
          d="M14.2499 12.5002C14.2499 13.881 13.1307 15.0002 11.7499 15.0002C10.3692 15.0002 9.24994 13.881 9.24994 12.5002C9.24994 11.1195 10.3692 10.0002 11.7499 10.0002C13.1307 10.0002 14.2499 11.1195 14.2499 12.5002Z"
          strokeLinejoin="round"
        />
      </motion.g>
    </motion.svg>
  );
}

function Fan(props: FanProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Fan,
  Fan as FanIcon,
  type FanProps,
  type FanProps as FanIconProps,
};
