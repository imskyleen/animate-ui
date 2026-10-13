'use client';

import * as React from 'react';
import {
  DisclosurePanel as DisclosurePanelPrimitive,
  DisclosureStateContext,
  type DisclosurePanelProps as DisclosurePanelPrimitiveProps,
} from 'react-aria-components';
import { motion } from 'motion/react';

import { ReducedMotionConfig } from '../../../utils/motion';
import {
  asMotion,
  collapsed,
  expanded,
  panelStyle,
  useDisclosurePanel,
  useDisclosureTransitions,
  type MotionPanelProps,
  type PanelAnimationProps,
} from '../../../internal/disclosure-panel';

type DisclosurePanelProps = DisclosurePanelPrimitiveProps & PanelAnimationProps;

const SIZE_VARS = ['--disclosure-panel-height', '--disclosure-panel-width'];

function DisclosurePanel(
  props: DisclosurePanelProps & React.RefAttributes<HTMLDivElement>,
) {
  return (
    <ReducedMotionConfig>
      <DisclosurePanelMotion {...props} />
    </ReducedMotionConfig>
  );
}

function DisclosurePanelMotion({
  transition,
  exitTransition,
  render,
  ref,
  ...props
}: DisclosurePanelProps & React.RefAttributes<HTMLDivElement>) {
  const open = React.use(DisclosureStateContext)?.isExpanded ?? false;
  const panel = useDisclosurePanel(open, 'until-found', SIZE_VARS);
  const panelRef = panel.ref;
  const mergedRef = React.useMemo(
    () => mergeRefs<HTMLDivElement>(ref, panelRef),
    [ref, panelRef],
  );
  const { enter, exit } = useDisclosureTransitions(
    transition,
    exitTransition,
    panel.revealedByFind,
  );

  const motionProps = (
    domProps: React.ComponentProps<'div'>,
  ): MotionPanelProps => ({
    ref: domProps.ref as React.Ref<HTMLDivElement>,
    initial: collapsed,
    animate: open
      ? { ...expanded, transition: enter }
      : { ...collapsed, transition: exit },
    onAnimationStart: panel.onAnimationStart,
    onAnimationComplete: panel.onAnimationComplete,
    inert: !open && !panel.settled,
    style: {
      ...domProps.style,
      ...panelStyle,
      [SIZE_VARS[0]!]: 'auto',
      [SIZE_VARS[1]!]: 'auto',
    },
  });

  return (
    <DisclosurePanelPrimitive
      {...props}
      ref={mergedRef}
      render={(domProps, renderProps) =>
        render ? (
          asMotion(render(domProps, renderProps), motionProps(domProps))
        ) : (
          <motion.div
            {...(domProps as Record<string, unknown>)}
            {...motionProps(domProps)}
          />
        )
      }
    />
  );
}

function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as React.RefObject<T | null>).current = node;
    }
  };
}

export { DisclosurePanel, type DisclosurePanelProps };
