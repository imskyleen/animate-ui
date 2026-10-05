import { Dancing_Script } from 'next/font/google';
import { MotionEffect } from './effects/motion-effect';
import { Primitives } from './icons/primitives';
import { cn } from '@workspace/ui/lib/utils';
import { Components } from './icons/components';
import { Blocks } from './icons/blocks';
import Link from 'next/link';
import { motion } from 'motion/react';
import { WifiIcon } from '@/registry/icons/wifi';
import { ClockIcon } from '@/registry/icons/clock';
import { AudioLinesIcon } from '@/registry/icons/audio-lines';
import { LoaderIcon } from '@/registry/icons/loader';
import { SettingsIcon } from '@/registry/icons/settings';
import { Disc3Icon } from '@/registry/icons/disc-3';
import { BatteryFullIcon } from '@/registry/icons/battery-full';
import { MessageSquareMoreIcon } from '@/registry/icons/message-square-more';
import { BellRingIcon } from '@/registry/icons/bell-ring';
import { AlarmClockIcon } from '@/registry/icons/alarm-clock';
import { ArrowRightIcon } from '@/registry/icons/arrow-right';
import { UserIcon } from '@/registry/icons/user';
import { AnimateIcon } from '@/registry/icons/icon';

const COMPONENTS = [
  {
    name: 'Primitives',
    href: '/docs/primitives',
    icon: <Primitives />,
  },
  {
    name: 'Components',
    href: '/docs/components',
    icon: <Components />,
  },
  {
    name: 'Icons',
    href: '/docs/icons',
    icon: (
      <AnimateIcon asChild animateOnHover>
        <div className="w-full flex flex-col gap-6 pt-7 justify-center items-center h-full aspect-[350/259.17] dark:text-neutral-500 text-neutral-400">
          <div className="flex flex-row gap-6">
            <WifiIcon className="size-6.5 xs:size-5.5 sm:size-6.5" />
            <ClockIcon className="size-6.5 xs:size-5.5 sm:size-6.5" />
            <AudioLinesIcon className="size-6.5 xs:size-5.5 sm:size-6.5" />
            <LoaderIcon className="size-6.5 xs:size-5.5 sm:size-6.5" />
          </div>
          <div className="flex flex-row gap-6">
            <SettingsIcon
              animation="default"
              className="size-6.5 xs:size-5.5 sm:size-6.5"
            />
            <Disc3Icon className="size-6.5 xs:size-5.5 sm:size-6.5" />
            <BatteryFullIcon className="size-6.5 xs:size-5.5 sm:size-6.5" />
            <UserIcon className="size-6.5 xs:size-5.5 sm:size-6.5" />
          </div>
          <div className="flex flex-row gap-6">
            <MessageSquareMoreIcon className="size-6.5 xs:size-5.5 sm:size-6.5" />
            <BellRingIcon className="size-6.5 xs:size-5.5 sm:size-6.5" />
            <AlarmClockIcon className="size-6.5 xs:size-5.5 sm:size-6.5" />
            <ArrowRightIcon
              animation="default-loop"
              className="size-6.5 xs:size-5.5 sm:size-6.5"
            />
          </div>
        </div>
      </AnimateIcon>
    ),
  },
  {
    name: 'Soon...',
    icon: (
      <div className="relative">
        <Blocks />
      </div>
    ),
  },
];

const dancing = Dancing_Script({ subsets: ['latin'] });

export const Features = () => {
  return (
    <div className="relative pt-16 pb-10 px-5 flex flex-col items-center justify-center mt-auto">
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 sm:gap-6 gap-4 w-full max-w-7xl sm:max-lg:max-w-2xl mx-auto">
        {COMPONENTS.map((component, index) => {
          const Component = component.href ? Link : 'div';
          return (
            <MotionEffect
              slide={{
                direction: 'down',
              }}
              fade
              zoom
              delay={1 + 0.15 * index}
              key={index}
            >
              {/* @ts-ignore */}
              <Component {...(component.href ? { href: component.href } : {})}>
                <motion.div
                  whileHover={{
                    scale: component.href ? 1.025 : 1,
                  }}
                  whileTap={{
                    scale: component.href ? 0.925 : 1,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 20,
                  }}
                  className={cn(
                    'relative w-full dark:bg-neutral-800 bg-neutral-100 rounded-2xl pt-1',
                    !component?.href && 'opacity-50 cursor-not-allowed',
                  )}
                >
                  <p
                    className={cn(
                      dancing.className,
                      'text-[22px] font-black text-muted-foreground absolute xs:top-2 top-3 left-1/2 -translate-x-1/2',
                    )}
                  >
                    {component.name}
                  </p>

                  {component.icon}
                </motion.div>
              </Component>
            </MotionEffect>
          );
        })}
      </div>
    </div>
  );
};
