'use client';

import * as React from 'react';
import { Switch as SwitchPrimitive } from 'radix-ui';
import { motion } from 'motion/react';

import { ReducedMotionConfig } from '../../../utils/motion';
import { mergeRefs } from '../../../internal/controls/indicator';
import {
  SwitchPressedContext,
  useSwitchThumb,
  type ThumbAnimationProps,
} from '../../../internal/controls/thumb';

type SwitchProps = SwitchPrimitive.SwitchProps;
type SwitchThumbProps = SwitchPrimitive.SwitchThumbProps & ThumbAnimationProps;

function Root({
  asChild,
  children,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  const [pressed, setPressed] = React.useState(false);

  if (asChild)
    return (
      <SwitchPrimitive.Root {...props} asChild>
        {children}
      </SwitchPrimitive.Root>
    );

  return (
    <SwitchPressedContext value={pressed}>
      <SwitchPrimitive.Root {...props} asChild>
        <motion.button
          onTapStart={() => {
            if (!props.disabled) setPressed(true);
          }}
          onTap={() => setPressed(false)}
          onTapCancel={() => setPressed(false)}
        >
          {children}
        </motion.button>
      </SwitchPrimitive.Root>
    </SwitchPressedContext>
  );
}

function Thumb({
  asChild,
  children,
  transition,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Thumb> & ThumbAnimationProps) {
  if (asChild)
    return (
      <SwitchPrimitive.Thumb {...props} asChild>
        {children}
      </SwitchPrimitive.Thumb>
    );

  return (
    <ReducedMotionConfig>
      <SwitchPrimitive.Thumb {...props} asChild>
        <AnimatedThumb transition={transition}>{children}</AnimatedThumb>
      </SwitchPrimitive.Thumb>
    </ReducedMotionConfig>
  );
}

function AnimatedThumb({
  transition,
  ref,
  ...props
}: React.ComponentPropsWithRef<'span'> &
  ThumbAnimationProps & { 'data-state'?: string }) {
  const localRef = React.useRef<HTMLSpanElement>(null);
  const mergedRef = React.useMemo(() => mergeRefs(ref, localRef), [ref]);
  useSwitchThumb(() => localRef.current, {
    checked: props['data-state'] === 'checked',
    pressed: React.use(SwitchPressedContext),
    transition,
  });
  return <span {...props} ref={mergedRef} />;
}

const createSwitchScope: typeof SwitchPrimitive.createSwitchScope =
  SwitchPrimitive.createSwitchScope;

const unstable_SwitchProvider = SwitchPrimitive.unstable_SwitchProvider;
const unstable_SwitchTrigger = SwitchPrimitive.unstable_SwitchTrigger;
const unstable_SwitchBubbleInput = SwitchPrimitive.unstable_SwitchBubbleInput;
type unstable_SwitchProviderProps =
  SwitchPrimitive.unstable_SwitchProviderProps;
type unstable_SwitchTriggerProps = SwitchPrimitive.unstable_SwitchTriggerProps;
type unstable_SwitchBubbleInputProps =
  SwitchPrimitive.unstable_SwitchBubbleInputProps;

Root.displayName = 'Switch';
Thumb.displayName = 'SwitchThumb';

export {
  Root,
  Thumb,
  Root as Switch,
  Thumb as SwitchThumb,
  createSwitchScope,
  unstable_SwitchProvider,
  unstable_SwitchProvider as unstable_Provider,
  unstable_SwitchTrigger,
  unstable_SwitchTrigger as unstable_Trigger,
  unstable_SwitchBubbleInput,
  unstable_SwitchBubbleInput as unstable_BubbleInput,
  type SwitchProps,
  type SwitchThumbProps,
  type unstable_SwitchProviderProps,
  type unstable_SwitchTriggerProps,
  type unstable_SwitchBubbleInputProps,
};
