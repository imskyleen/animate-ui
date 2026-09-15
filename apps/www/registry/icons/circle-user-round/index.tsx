'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
    getVariants,
    useAnimateIconContext,
    IconWrapper,
    type IconProps,
} from '@/registry/icons/icon';

type CircleUserRoundProps = IconProps<keyof typeof animations>;

const animations = {
    default: {
        outerCircle: {
            initial: {
                pathLength: 1,
                opacity: 1,
            },
        },
        headCircle: {
            initial: {
                pathLength: 1,
                opacity: 1,
            },
        },
        shoulders: {
            initial: {
                pathLength: 1,
                opacity: 1,
            },
        },
        arm: {
            initial: {
                scale: 0,
                rotate: 0,
                originY: 1.2,
                originX: 0.5,
            },
            animate: {
                scale: [0, 1, 1, 1, 1, 1, 0],
                rotate: [0, 0, -16, 14, -10, 0, 0],
                transition: {
                    duration: 1.1,
                    ease: 'easeInOut',
                    times: [0, 0.15, 0.35, 0.5, 0.65, 0.85, 1],
                },
            },
        },
    } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: CircleUserRoundProps) {
    const { controls, animation } = useAnimateIconContext();
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
            initial="initial"
            animate={controls}
            {...props}
        >
            <motion.path
                d="M17.925 20.056a6 6 0 0 0-11.851.001"
                variants={variants.shoulders}
                initial="initial"
                animate={controls}
            />
            <motion.circle
                cx="12"
                cy="11"
                r="4"
                variants={variants.headCircle}
                initial="initial"
                animate={controls}
            />
            <motion.circle
                cx="12"
                cy="12"
                r="10"
                variants={variants.outerCircle}
                initial="initial"
                animate={controls}
            />
            {animation === 'default' && (
                <motion.g
                    variants={variants.arm}
                    initial="initial"
                    animate={controls}
                >
                    <path
                        d="M17 16.5 C 19.3 15.2 20.3 12.5 20 9.8"
                        strokeLinecap="round"
                    />
                    <circle cx="20" cy="9" r="1.2" fill="currentColor" stroke="none" />
                </motion.g>
            )}
        </motion.svg>
    );
}

function CircleUserRound(props: CircleUserRoundProps) {
    return <IconWrapper icon={IconComponent} {...props} />;
}

export {
    animations,
    CircleUserRound,
    CircleUserRound as CircleUserRoundIcon,
    type CircleUserRoundProps,
    type CircleUserRoundProps as CircleUserRoundIconProps,
};