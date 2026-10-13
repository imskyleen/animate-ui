'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type SquareArrowOutUpRightProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        x: 0,
        y: 0,
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
      animate: {
        x: 1.2,
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
        x: [0, 1.2, 0],
        y: [0, -1.2, 0],
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
    },
    path1: {},
    path2: {},
    path3: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: SquareArrowOutUpRightProps) {
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
          d="M10.4618 12.4699C10.169 12.7628 10.169 13.2376 10.4619 13.5305C10.7548 13.8234 11.2297 13.8234 11.5225 13.5305L10.9922 13.0002L10.4618 12.4699ZM10.9922 13.0002L11.5225 13.5305L20.8724 4.17993L20.3421 3.64962L19.8117 3.11931L10.4618 12.4699L10.9922 13.0002Z"
          fill="currentColor"
          strokeWidth={0.5}
          strokeLinejoin="round"
          variants={variants.path1}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M14.9337 2.3594C14.5207 2.39171 14.2122 2.75266 14.2445 3.16561C14.2768 3.57857 14.6377 3.88714 15.0507 3.85483L14.9922 3.10712L14.9337 2.3594ZM14.9922 3.10712C15.0507 3.85483 15.0506 3.85484 15.0506 3.85484C15.0506 3.85484 15.0506 3.85484 15.0507 3.85483C15.0508 3.85483 15.0509 3.85482 15.0511 3.8548C15.0516 3.85476 15.0523 3.85471 15.0533 3.85463C15.0554 3.85447 15.0586 3.85422 15.0629 3.85389C15.0716 3.85324 15.0848 3.85225 15.1021 3.85098C15.1368 3.84844 15.1884 3.84476 15.2545 3.8403C15.3868 3.83137 15.5773 3.81931 15.8083 3.80695C16.2712 3.78218 16.8927 3.7564 17.5327 3.75173C18.1771 3.74702 18.8203 3.76393 19.3337 3.8203C19.5915 3.84862 19.7952 3.88468 19.9407 3.9251C20.1132 3.97302 20.1061 4.00086 20.0492 3.94397L20.5795 3.41364L21.1098 2.88331C20.8805 2.65399 20.5694 2.54294 20.3421 2.47981C20.0878 2.40917 19.7957 2.36202 19.4974 2.32926C18.8985 2.2635 18.188 2.2469 17.5217 2.25177C16.8511 2.25667 16.2051 2.28357 15.7281 2.3091C15.4892 2.32188 15.2917 2.33437 15.1535 2.3437C15.0843 2.34837 15.03 2.35225 14.9926 2.35498C14.9739 2.35635 14.9595 2.35743 14.9496 2.35818C14.9446 2.35856 14.9408 2.35885 14.9381 2.35906C14.9368 2.35916 14.9358 2.35924 14.935 2.3593C14.9347 2.35933 14.9344 2.35935 14.9341 2.35937C14.934 2.35938 14.9339 2.35939 14.9339 2.35939C14.9338 2.3594 14.9337 2.3594 14.9922 3.10712ZM20.5795 3.41364L20.0492 3.94397C19.9923 3.88707 20.0201 3.87991 20.068 4.05245C20.1085 4.19796 20.1445 4.40161 20.1728 4.65949C20.2292 5.17286 20.2461 5.81607 20.2414 6.46047C20.2368 7.10048 20.211 7.72197 20.1862 8.18488C20.1739 8.41589 20.1618 8.60638 20.1529 8.73868C20.1484 8.80481 20.1448 8.85635 20.1422 8.89106C20.1409 8.90842 20.14 8.92157 20.1393 8.93023C20.139 8.93457 20.1387 8.93778 20.1386 8.93983C20.1385 8.94086 20.1384 8.9416 20.1384 8.94204C20.1384 8.94226 20.1384 8.94241 20.1384 8.94249C20.1384 8.94252 20.1384 8.94252 20.1384 8.94254C20.1384 8.94252 20.1384 8.94249 20.8861 9.00098C21.6338 9.05946 21.6338 9.05939 21.6338 9.0593C21.6338 9.05924 21.6338 9.05913 21.6338 9.05902C21.6338 9.0588 21.6339 9.0585 21.6339 9.05813C21.634 9.05739 21.634 9.05635 21.6341 9.05502C21.6343 9.05236 21.6346 9.04853 21.635 9.04358C21.6358 9.03367 21.6368 9.01923 21.6382 9.00055C21.6409 8.96319 21.6448 8.90882 21.6495 8.83968C21.6588 8.70145 21.6713 8.50393 21.6841 8.26501C21.7096 7.78805 21.7365 7.14203 21.7414 6.47142C21.7463 5.80519 21.7297 5.09467 21.6639 4.49576C21.6311 4.19749 21.584 3.90537 21.5133 3.65102C21.4502 3.42371 21.3392 3.11263 21.1098 2.88331L20.5795 3.41364ZM20.8724 4.17993C21.1653 3.88703 21.1653 3.41215 20.8724 3.11927C20.5795 2.82639 20.1046 2.8264 19.8117 3.11931L20.3421 3.64962L20.8724 4.17993ZM20.1384 8.94249C20.1061 9.35544 20.4146 9.71639 20.8276 9.74869C21.2405 9.78099 21.6015 9.47242 21.6338 9.05946L20.8861 9.00098L20.1384 8.94249Z"
          fill="currentColor"
          strokeWidth={0.5}
          strokeLinejoin="round"
          variants={variants.path2}
          initial="initial"
          animate={controls}
        />
      </motion.g>
      <motion.path
        d="M20.9896 13.5013C20.9714 16.7638 20.8267 18.5307 19.6742 19.6833C18.3561 21.0013 16.2348 21.0013 11.9922 21.0013C7.74955 21.0013 5.62823 21.0013 4.31021 19.6833C2.99219 18.3653 2.99219 16.2439 2.99219 12.0013C2.99219 7.75866 2.99219 5.63734 4.31021 4.31932C5.46278 3.16674 7.22965 3.02207 10.4922 3.00391"
        strokeLinecap="round"
        variants={variants.path3}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function SquareArrowOutUpRight(props: SquareArrowOutUpRightProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  SquareArrowOutUpRight,
  SquareArrowOutUpRight as SquareArrowOutUpRightIcon,
  type SquareArrowOutUpRightProps,
  type SquareArrowOutUpRightProps as SquareArrowOutUpRightIconProps,
};
