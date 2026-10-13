'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type MailCheckProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    flap: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
    },
    check: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.4, ease: 'easeInOut', delay: 0.3 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: MailCheckProps) {
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
      <path
        d="M11.9961 20.5C11.0306 20.5 10.0652 20.4878 9.09492 20.4634C5.94643 20.3843 4.37218 20.3448 3.24105 19.2094C2.10992 18.0739 2.07723 16.5412 2.01186 13.4756C1.99084 12.4899 1.99084 11.5101 2.01186 10.5244C2.07723 7.45885 2.10992 5.92608 3.24105 4.79065C4.37218 3.65521 5.94642 3.61566 9.09492 3.53656C11.0354 3.48781 12.9568 3.48781 14.8973 3.53657C18.0458 3.61568 19.62 3.65523 20.7511 4.79066C21.8823 5.92609 21.915 7.45886 21.9803 10.5244C21.9837 10.6831 21.9866 10.8416 21.9888 11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <motion.path
        d="M1.99609 6L8.90912 9.91697C11.4577 11.361 12.5345 11.361 15.0831 9.91697L21.9961 6"
        strokeLinejoin="round"
        variants={variants.flap}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M14.9961 18.3333C14.9961 18.3333 15.8711 18.3333 16.7461 20C16.7461 20 19.5255 15.8333 21.9961 15"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.check}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function MailCheck(props: MailCheckProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  MailCheck,
  MailCheck as MailCheckIcon,
  type MailCheckProps,
  type MailCheckProps as MailCheckIconProps,
};
