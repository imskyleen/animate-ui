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
  useDisclosurePanel,
  useDisclosureTransitions,
  type MotionPanelProps,
  type PanelAnimationProps,
} from '../../../internal/disclosure-panel';

// Same API as React Aria's DisclosurePanel (used alone in a Disclosure, or in
// a DisclosureGroup for an accordion). React Aria keeps the panel mounted and
// hides it with `hidden="until-found"`: the panel animates its height in
// place, and is hidden once the collapse is over.

type DisclosurePanelProps = DisclosurePanelPrimitiveProps & PanelAnimationProps;

// React Aria writes these on the panel by hand for CSS transitions; Motion
// owns the height now, so classes reading them follow the content.
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

// Inside ReducedMotionConfig, so the reduced-motion preference is read.
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
    // Always mounted: no entrance on mount, whatever the initial state.
    initial: false,
    // Transitions live in the targets: the exit keeps its own timing.
    animate: open
      ? { ...expanded, transition: enter }
      : { ...collapsed, transition: exit },
    onAnimationComplete: panel.onAnimationComplete,
    // Collapsing: out of the tab order until it's hidden. Not afterwards, or
    // find-in-page would skip the hidden content.
    inert: !open && !panel.settled,
    style: {
      ...domProps.style,
      overflow: 'hidden',
      [SIZE_VARS[0]!]: 'auto',
      [SIZE_VARS[1]!]: 'auto',
    },
  });

  return (
    <DisclosurePanelPrimitive
      {...props}
      ref={mergedRef}
      // React Aria's render prop: its props (id, role, aria-*, resolved
      // className and style, ref) land on the motion element itself.
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
