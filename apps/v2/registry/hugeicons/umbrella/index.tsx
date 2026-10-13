'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type UmbrellaProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    canopy: {
      initial: { scaleX: 1, scaleY: 1, transformOrigin: '50% 0%' },
      animate: {
        scaleX: [0.4, 1.02, 1],
        scaleY: [0.8, 1],
        transformOrigin: '50% 0%',
        transition: { duration: 0.6, ease: 'easeOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: UmbrellaProps) {
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
      <path d="M12 3.5V2" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M12 13.5V20.5C12 21.3284 11.3284 22 10.5 22C9.67157 22 9 21.3284 9 20.5V20"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <motion.g variants={variants.canopy} initial="initial" animate={controls}>
        <path
          d="M12 3.5C11.0608 3.5 7.52791 7.29323 6.97182 12.2037"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 3.5C12.9392 3.5 16.4721 7.29322 17.0282 12.2037"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 3.5C16.9367 3.5 21.0545 6.93552 22 11.5C20.6123 12.7 18.1073 12.4691 17.0282 12.2037"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 3.5C7.06333 3.5 2.94545 6.93552 2 11.5C3.38792 12.7 5.89285 12.4691 6.97182 12.2037"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.97182 12.2037C8.4559 13.0288 10.1718 13.5 12 13.5C13.8282 13.5 15.5441 13.0288 17.0282 12.2037"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>
    </motion.svg>
  );
}

function Umbrella(props: UmbrellaProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Umbrella,
  Umbrella as UmbrellaIcon,
  type UmbrellaProps,
  type UmbrellaProps as UmbrellaIconProps,
};
