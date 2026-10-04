'use client';

import * as React from 'react';
import {
  Disclosure as DisclosurePrimitive,
  DisclosureButton as DisclosureButtonPrimitive,
  DisclosurePanel as DisclosurePanelPrimitive,
  type DisclosureProps as DisclosurePrimitiveProps,
  type DisclosureButtonProps as DisclosureButtonPrimitiveProps,
  type DisclosurePanelProps as DisclosurePanelPrimitiveProps,
} from '@headlessui/react';
import { motion, AnimatePresence, type HTMLMotionProps } from 'motion/react';

import { getStrictContext } from '@/registry/lib/get-strict-context';

type DisclosureContextType = {
  isOpen: boolean;
};

const [DisclosureProvider, useDisclosure] =
  getStrictContext<DisclosureContextType>('DisclosureContext');

type DisclosureProps<TTag extends React.ElementType = 'div'> =
  DisclosurePrimitiveProps<TTag> & {
    as?: TTag;
    className?: string;
  };

function Disclosure<TTag extends React.ElementType = 'div'>({
  children,
  ...props
}: DisclosureProps<TTag>) {
  return (
    <DisclosurePrimitive data-slot="disclosure" {...props}>
      {(bag) => (
        <DisclosureProvider value={{ isOpen: bag.open }}>
          {typeof children === 'function' ? children(bag) : children}
        </DisclosureProvider>
      )}
    </DisclosurePrimitive>
  );
}

type DisclosureButtonProps<TTag extends React.ElementType = 'button'> =
  DisclosureButtonPrimitiveProps<TTag> & {
    as?: TTag;
  };

function DisclosureButton<TTag extends React.ElementType = 'button'>(
  props: DisclosureButtonProps<TTag>,
) {
  return <DisclosureButtonPrimitive data-slot="disclosure-button" {...props} />;
}

type DisclosurePanelProps<TTag extends React.ElementType = typeof motion.div> =
  Pick<DisclosurePanelPrimitiveProps<TTag>, 'static' | 'unmount' | 'children'> &
    Omit<HTMLMotionProps<'div'>, 'children'> & {
      as?: TTag;
      keepRendered?: boolean;
    };

function DisclosurePanel<TTag extends React.ElementType = typeof motion.div>(
  props: DisclosurePanelProps<TTag>,
) {
  const {
    children,
    transition = { duration: 0.35, ease: 'easeInOut' },
    as = motion.div,
    unmount,
    keepRendered = false,
    ...rest
  } = props;
  const { isOpen } = useDisclosure();

  return (
    <AnimatePresence>
      {keepRendered ? (
        <DisclosurePanelPrimitive
          static
          as={as as React.ElementType}
          unmount={unmount}
        >
          {(bag) => (
            <motion.div
              key="disclosure-panel"
              data-slot="disclosure-panel"
              initial={{ height: 0, opacity: 0, '--mask-stop': '0%', y: 20 }}
              animate={
                isOpen
                  ? { height: 'auto', opacity: 1, '--mask-stop': '100%', y: 0 }
                  : { height: 0, opacity: 0, '--mask-stop': '0%', y: 20 }
              }
              transition={transition}
              style={{
                maskImage:
                  'linear-gradient(black var(--mask-stop), transparent var(--mask-stop))',
                WebkitMaskImage:
                  'linear-gradient(black var(--mask-stop), transparent var(--mask-stop))',
                overflow: 'hidden',
              }}
              {...rest}
            >
              {typeof children === 'function' ? children(bag) : children}
            </motion.div>
          )}
        </DisclosurePanelPrimitive>
      ) : (
        isOpen && (
          <DisclosurePanelPrimitive
            static
            as={as as React.ElementType}
            unmount={unmount}
          >
            {(bag) => (
              <motion.div
                key="disclosure-panel"
                data-slot="disclosure-panel"
                initial={{ height: 0, opacity: 0, '--mask-stop': '0%', y: 20 }}
                animate={{
                  height: 'auto',
                  opacity: 1,
                  '--mask-stop': '100%',
                  y: 0,
                }}
                exit={{ height: 0, opacity: 0, '--mask-stop': '0%', y: 20 }}
                transition={transition}
                style={{
                  maskImage:
                    'linear-gradient(black var(--mask-stop), transparent var(--mask-stop))',
                  WebkitMaskImage:
                    'linear-gradient(black var(--mask-stop), transparent var(--mask-stop))',
                  overflow: 'hidden',
                }}
                {...rest}
              >
                {typeof children === 'function' ? children(bag) : children}
              </motion.div>
            )}
          </DisclosurePanelPrimitive>
        )
      )}
    </AnimatePresence>
  );
}

export {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  useDisclosure,
  type DisclosureProps,
  type DisclosureButtonProps,
  type DisclosurePanelProps,
};
