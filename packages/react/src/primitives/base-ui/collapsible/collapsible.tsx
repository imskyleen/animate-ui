'use client';
/* eslint-disable @typescript-eslint/no-namespace */

import * as React from 'react';
import { Collapsible as CollapsiblePrimitive } from '@base-ui/react/collapsible';

import { getStrictContext } from '../../../utils/strict-context';
import { ReducedMotionConfig } from '../../../utils/motion';
import {
  BaseUIPanel,
  type PanelAnimationProps,
} from '../../../internal/disclosure-panel';

const [OpenProvider, useOpen] = getStrictContext<{ open: boolean }>(
  'Collapsible.Root',
);

function Root({
  open: openProp,
  defaultOpen,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  const controlled = openProp !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen ?? false);
  const open = controlled ? openProp : uncontrolled;

  const handleOpenChange: Root.Props['onOpenChange'] = (next, details) => {
    onOpenChange?.(next, details);
    if (details.isCanceled) return;
    if (!controlled) setUncontrolled(next);
  };

  return (
    <OpenProvider value={{ open }}>
      <ReducedMotionConfig>
        <CollapsiblePrimitive.Root
          {...props}
          open={open}
          onOpenChange={handleOpenChange}
        />
      </ReducedMotionConfig>
    </OpenProvider>
  );
}

namespace Root {
  export type Props = CollapsiblePrimitive.Root.Props;
  export type State = CollapsiblePrimitive.Root.State;
  export type ChangeEventReason = CollapsiblePrimitive.Root.ChangeEventReason;
  export type ChangeEventDetails = CollapsiblePrimitive.Root.ChangeEventDetails;
}

const Trigger = CollapsiblePrimitive.Trigger;

namespace Trigger {
  export type Props = CollapsiblePrimitive.Trigger.Props;
  export type State = CollapsiblePrimitive.Trigger.State;
}

function Panel(
  props: React.ComponentProps<typeof CollapsiblePrimitive.Panel> &
    PanelAnimationProps,
) {
  const { open } = useOpen();
  return (
    <BaseUIPanel
      {...props}
      component={CollapsiblePrimitive.Panel}
      open={open}
      sizeVars={['--collapsible-panel-height', '--collapsible-panel-width']}
    />
  );
}

namespace Panel {
  export type Props = CollapsiblePrimitive.Panel.Props & PanelAnimationProps;
  export type State = CollapsiblePrimitive.Panel.State;
}

export { Root, Trigger, Panel };
