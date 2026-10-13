'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type SquareArrowOutUpLeftProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        x: 0,
        y: 0,
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
      animate: {
        x: -1.2,
        y: -1.2,
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
    },
    path1: {},
    path2: {},
    path3: {},
  } satisfies Record<string, Variants>,
  'default-loop': {
    group: {
      initial: {
        x: 0,
        y: 0,
      },
      animate: {
        x: [0, -1.2, 0],
        y: [0, -1.2, 0],
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
    },
    path1: {},
    path2: {},
    path3: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: SquareArrowOutUpLeftProps) {
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
          d="M12.4618 13.5305C12.7547 13.8234 13.2296 13.8234 13.5225 13.5305C13.8154 13.2376 13.8154 12.7628 13.5225 12.4699L12.9922 13.0002L12.4618 13.5305ZM12.9922 13.0002L13.5225 12.4699L4.17263 3.11931L3.64228 3.64962L3.11193 4.17993L12.4618 13.5305L12.9922 13.0002Z"
          fill="currentColor"
          strokeWidth={0.5}
          strokeLinejoin="round"
          variants={variants.path1}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M2.35058 9.05946C2.38289 9.47242 2.74384 9.78099 3.15679 9.74869C3.56974 9.71639 3.87832 9.35544 3.84602 8.94249L3.0983 9.00098L2.35058 9.05946ZM3.40487 3.41364L2.87453 2.88331C2.64522 3.11263 2.53417 3.42371 2.47104 3.65102C2.4004 3.90537 2.35324 4.19749 2.32049 4.49576C2.25472 5.09467 2.23811 5.80519 2.24298 6.47142C2.24787 7.14203 2.27477 7.78805 2.30029 8.26501C2.31307 8.50393 2.32556 8.70145 2.33489 8.83968C2.33955 8.90882 2.34343 8.96319 2.34617 9.00055C2.34753 9.01923 2.34861 9.03367 2.34937 9.04358C2.34974 9.04853 2.35003 9.05236 2.35024 9.05502C2.35034 9.05635 2.35042 9.05739 2.35048 9.05813C2.35051 9.0585 2.35053 9.0588 2.35055 9.05902C2.35056 9.05913 2.35057 9.05924 2.35057 9.0593C2.35058 9.05939 2.35058 9.05946 3.0983 9.00098C3.84602 8.94249 3.84602 8.94252 3.84602 8.94254C3.84602 8.94252 3.84602 8.94252 3.84601 8.94249C3.84601 8.94241 3.846 8.94226 3.84598 8.94204C3.84595 8.9416 3.84589 8.94086 3.84581 8.93983C3.84565 8.93778 3.84541 8.93457 3.84508 8.93023C3.84442 8.92157 3.84343 8.90842 3.84216 8.89106C3.83962 8.85635 3.83595 8.80481 3.83148 8.73868C3.82255 8.60638 3.8105 8.41589 3.79814 8.18488C3.77338 7.72197 3.74761 7.10048 3.74294 6.46047C3.73823 5.81607 3.75516 5.17286 3.81153 4.65949C3.83985 4.40161 3.87591 4.19796 3.91633 4.05245C3.96425 3.87991 3.99209 3.88707 3.9352 3.94397L3.40487 3.41364ZM4.17263 3.11931C3.87975 2.8264 3.40487 2.82639 3.11197 3.11927C2.81907 3.41215 2.81905 3.88703 3.11193 4.17993L3.64228 3.64962L4.17263 3.11931ZM8.93369 3.85483C9.34664 3.88714 9.7076 3.57857 9.7399 3.16561C9.77221 2.75266 9.46364 2.39171 9.05068 2.3594L8.99219 3.10712L8.93369 3.85483ZM8.99219 3.10712C9.05068 2.3594 9.05061 2.3594 9.05052 2.35939C9.05046 2.35939 9.05035 2.35938 9.05024 2.35937C9.05002 2.35935 9.04972 2.35933 9.04935 2.3593C9.04861 2.35924 9.04757 2.35916 9.04624 2.35906C9.04358 2.35885 9.03975 2.35856 9.0348 2.35818C9.02489 2.35743 9.01045 2.35635 8.99177 2.35498C8.95441 2.35225 8.90004 2.34837 8.8309 2.3437C8.69267 2.33437 8.49515 2.32188 8.25623 2.3091C7.77927 2.28357 7.13325 2.25667 6.46264 2.25177C5.79642 2.2469 5.0859 2.2635 4.48698 2.32926C4.18872 2.36202 3.89659 2.40917 3.64225 2.47981C3.41493 2.54294 3.10385 2.65399 2.87453 2.88331L3.40487 3.41364L3.9352 3.94397C3.87831 4.00086 3.87114 3.97302 4.04367 3.9251C4.18918 3.88468 4.39283 3.84862 4.6507 3.8203C5.16407 3.76393 5.80728 3.74702 6.45167 3.75173C7.09168 3.7564 7.71317 3.78218 8.17608 3.80695C8.40709 3.81931 8.59759 3.83137 8.72989 3.8403C8.79602 3.84476 8.84755 3.84844 8.88227 3.85098C8.89962 3.85225 8.91277 3.85324 8.92144 3.85389C8.92577 3.85422 8.92898 3.85447 8.93103 3.85463C8.93206 3.85471 8.9328 3.85476 8.93324 3.8548C8.93346 3.85482 8.93361 3.85483 8.93369 3.85483C8.93373 3.85484 8.93373 3.85484 8.93375 3.85484C8.93373 3.85484 8.93369 3.85483 8.99219 3.10712Z"
          fill="currentColor"
          strokeWidth={0.5}
          strokeLinejoin="round"
          variants={variants.path2}
          initial="initial"
          animate={controls}
        />
      </motion.g>
      <motion.path
        d="M13.4935 3.00358C16.756 3.02174 18.5229 3.16642 19.6755 4.319C20.9935 5.63702 20.9935 7.75834 20.9935 12.001C20.9935 16.2436 20.9935 18.3649 19.6755 19.683C18.3574 21.001 16.2361 21.001 11.9935 21.001C7.75085 21.001 5.62953 21.001 4.31151 19.683C3.15893 18.5304 3.01425 16.7635 2.99609 13.501"
        strokeLinecap="round"
        variants={variants.path3}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function SquareArrowOutUpLeft(props: SquareArrowOutUpLeftProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  SquareArrowOutUpLeft,
  SquareArrowOutUpLeft as SquareArrowOutUpLeftIcon,
  type SquareArrowOutUpLeftProps,
  type SquareArrowOutUpLeftProps as SquareArrowOutUpLeftIconProps,
};
