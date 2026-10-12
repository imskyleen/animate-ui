'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type Download04Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: { y: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
      animate: { y: 1.5, transition: { duration: 0.3, ease: 'easeInOut' } },
    },
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
  'default-loop': {
    group: {
      initial: { y: 0 },
      animate: { y: [0, 1.5, 0], transition: { duration: 0.6, ease: 'easeInOut' } },
    },
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: Download04Props) {
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
          d="M16.9504 12.1817C17.1981 12.814 16.5076 13.5726 15.1267 15.0899C13.6702 16.6902 12.9201 17.4904 12 17.5C11.0799 17.4904 10.3298 16.6902 8.87331 15.0899C7.49239 13.5726 6.80193 12.814 7.04964 12.1817C7.05868 12.1586 7.06851 12.1359 7.0791 12.1135C7.34928 11.542 8.24477 11.5029 10 11.5002V4.99998C10 4.53501 10 4.30253 10.0511 4.11179C10.1898 3.59414 10.5941 3.1898 11.1118 3.05111C11.3025 3 11.535 3 12 3C12.4649 3 12.6974 3 12.8882 3.05111C13.4058 3.1898 13.8102 3.59414 13.9489 4.11179C14 4.30253 14 4.53501 14 4.99998V11.5002C15.7552 11.5029 16.6507 11.542 16.9209 12.1135C16.9315 12.1359 16.9413 12.1586 16.9504 12.1817Z"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path1}
          initial="initial"
          animate={controls}
        />
      </motion.g>
      <motion.path
        d="M5.00006 21H19.0001"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Download04(props: Download04Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Download04,
  Download04 as Download04Icon,
  type Download04Props,
  type Download04Props as Download04IconProps,
};
