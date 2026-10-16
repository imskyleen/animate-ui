'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type CloudMoonRainProps = IconProps<keyof typeof animations>;

const rainAnimation: Variants = {
  initial: { y: 0, opacity: 1 },
  animate: (i: number = 0) => ({
    y: [0, 1, -1, 0],
    opacity: [1, 0, 0, 1],
    transition: {
      duration: 0.8,
      times: [0, 0.4, 0.4, 1],
      ease: ['easeIn', 'linear', 'easeOut'],
      repeat: Infinity,
      delay: i * 0.3,
    },
  }),
};

const animations = {
  default: {
    group: {},
    path1: {},
    path2: {},
    path3: rainAnimation,
    path4: rainAnimation,
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: CloudMoonRainProps) {
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
      <motion.path
        d="M19.0394 13C19.7703 12.674 20.4173 12.1759 20.9289 11.5455C21.4404 10.9151 21.8023 10.1698 21.9856 9.36918C22.1116 8.81932 21.4246 8.5158 20.9232 8.74102C20.2968 9.02108 19.6034 9.1001 18.933 8.96783C18.2625 8.83557 17.646 8.49813 17.1635 7.99929C16.6809 7.50046 16.3545 6.86324 16.2267 6.17033C16.0988 5.47742 16.1754 4.76079 16.4465 4.11343C16.6636 3.59524 16.3699 2.88614 15.837 3.01547C14.7866 3.27341 13.8423 3.86874 13.1397 4.71597C12.8171 5.10495 12.5531 5.53786 12.3535 6"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M4 18.6792C2.81753 18.1442 2 16.9964 2 15.6667C2 13.9336 3.38879 12.5094 5.1643 12.3485C5.33363 10.4724 6.98627 9 9 9C11.1263 9 12.85 10.6416 12.85 12.6667C12.85 12.779 12.8447 12.8902 12.8343 13C12.8395 13 12.8448 13 12.85 13C14.5897 13 16 14.3431 16 16C16 17.2703 15.1709 18.3563 14 18.7938"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
      <motion.g variants={variants.group} initial="initial" animate={controls}>
        <motion.path
          d="M7 18V20"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path3}
          custom={0}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M11 19V21"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path4}
          custom={1}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function CloudMoonRain(props: CloudMoonRainProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  CloudMoonRain,
  CloudMoonRain as CloudMoonRainIcon,
  type CloudMoonRainProps,
  type CloudMoonRainProps as CloudMoonRainIconProps,
};
