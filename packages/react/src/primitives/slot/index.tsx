'use client';

import * as React from 'react';
import { motion, isMotionComponent, type HTMLMotionProps } from 'motion/react';

type AnyProps = Record<string, unknown>;

type DOMMotionProps<T extends HTMLElement = HTMLElement> = Omit<
  HTMLMotionProps<keyof HTMLElementTagNameMap>,
  'ref'
> & { ref?: React.Ref<T> };

type WithAsChild<Base extends object> =
  | (Base & { asChild: true; children: React.ReactElement })
  | (Base & { asChild?: false | undefined });

type SlotProps<T extends HTMLElement = HTMLElement> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children?: any;
} & DOMMotionProps<T>;

function mergeRefs<T>(
  ...refs: (React.Ref<T> | undefined)[]
): React.RefCallback<T> {
  return (node) => {
    refs.forEach((ref) => {
      if (!ref) return;
      if (typeof ref === 'function') {
        ref(node);
      } else {
        (ref as React.RefObject<T | null>).current = node;
      }
    });
  };
}

function mergeProps<T extends HTMLElement>(
  childProps: AnyProps,
  slotProps: DOMMotionProps<T>,
): AnyProps {
  const merged: AnyProps = { ...childProps, ...slotProps };

  for (const key in slotProps) {
    const slotHandler = slotProps[key as keyof typeof slotProps];
    const childHandler = childProps[key];
    if (
      /^on[A-Z]/.test(key) &&
      typeof slotHandler === 'function' &&
      typeof childHandler === 'function'
    ) {
      merged[key] = (...args: unknown[]) => {
        childHandler(...args);
        slotHandler(...args);
      };
    }
  }

  if (childProps.className || slotProps.className) {
    merged.className = [childProps.className, slotProps.className]
      .filter(Boolean)
      .join(' ');
  }

  if (childProps.style || slotProps.style) {
    merged.style = {
      ...(childProps.style as React.CSSProperties),
      ...(slotProps.style as React.CSSProperties),
    };
  }

  return merged;
}

function Slot<T extends HTMLElement = HTMLElement>({
  children,
  ref,
  ...props
}: SlotProps<T>) {
  const child = React.isValidElement(children) ? children : null;
  const type = child?.type;
  const isAlreadyMotion =
    typeof type === 'object' && type !== null && isMotionComponent(type);

  const Base = React.useMemo(
    () =>
      type === undefined
        ? null
        : isAlreadyMotion
          ? (type as React.ElementType)
          : motion.create(type as React.ElementType),
    [isAlreadyMotion, type],
  );

  if (!child || !Base) return null;

  const { ref: childRef, ...childProps } = child.props as AnyProps;

  const mergedProps = mergeProps(childProps, props);

  return (
    <Base {...mergedProps} ref={mergeRefs(childRef as React.Ref<T>, ref)} />
  );
}

export {
  Slot,
  type SlotProps,
  type WithAsChild,
  type DOMMotionProps,
  type AnyProps,
};
