'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type OctagonAlertProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    mark: {
      initial: { y: 0 },
      animate: {
        y: [0, -2, 0, -0.8, 0],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
          times: [0, 0.3, 0.55, 0.75, 1],
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: OctagonAlertProps) {
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
      <path d="M13.5067 2C14.733 2 15.3461 2 15.8974 2.22836C16.4487 2.45672 16.8823 2.89027 17.7494 3.75736L20.2346 6.24264C21.1017 7.10973 21.5353 7.54328 21.7636 8.09459C21.992 8.6459 21.992 9.25903 21.992 10.4853V13.5147C21.992 14.741 21.992 15.3541 21.7636 15.9054C21.5353 16.4567 21.1017 16.8903 20.2346 17.7574L17.7494 20.2426C16.8823 21.1097 16.4487 21.5433 15.8974 21.7716C15.3461 22 14.733 22 13.5067 22H10.4773C9.25105 22 8.63792 22 8.08659 21.7716C7.53527 21.5433 7.10172 21.1097 6.23462 20.2426L3.74948 17.7573C2.88242 16.8903 2.44889 16.4567 2.22054 15.9054C1.99219 15.3541 1.99219 14.741 1.99219 13.5148V10.4852C1.99219 9.259 1.99219 8.64589 2.22054 8.09458C2.44889 7.54328 2.88242 7.10974 3.74948 6.24265L6.23463 3.75743C7.10172 2.8903 7.53527 2.45674 8.08659 2.22837C8.63792 2 9.25105 2 10.4773 2H13.5067Z" />
      <motion.g variants={variants.mark} initial="initial" animate={controls}>
        <path
          d="M11.9922 8L11.9922 12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.1172 15.75L11.9922 15.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.2422 15.75C12.2422 15.8881 12.1303 16 11.9922 16C11.8541 16 11.7422 15.8881 11.7422 15.75C11.7422 15.6119 11.8541 15.5 11.9922 15.5C12.1303 15.5 12.2422 15.6119 12.2422 15.75Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>
    </motion.svg>
  );
}

function OctagonAlert(props: OctagonAlertProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  OctagonAlert,
  OctagonAlert as OctagonAlertIcon,
  type OctagonAlertProps,
  type OctagonAlertProps as OctagonAlertIconProps,
};
