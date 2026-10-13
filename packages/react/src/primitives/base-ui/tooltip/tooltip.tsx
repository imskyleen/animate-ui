'use client';
/* eslint-disable @typescript-eslint/no-namespace */

import * as React from 'react';
import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';

import { getStrictContext } from '../../../utils/strict-context';
import { ReducedMotionConfig } from '../../../utils/motion';
import {
  FollowCursorProvider,
  useFollowCursorHandler,
  type FollowCursorProps,
} from '../../../internal/follow-cursor';
import {
  BaseAnchoredPopup,
  BaseAnchoredPortal,
  useBaseOpenState,
  type AnchoredAnimationProps,
} from '../popover/base-anchored';

const [OpenProvider, useOpen] = getStrictContext<{ open: boolean }>(
  'Tooltip.Root',
);
const KeepMountedContext = React.createContext(false);

function Root<Payload = unknown>({
  open: openProp,
  defaultOpen,
  onOpenChange,
  followCursor,
  followCursorSpringOptions,
  ...props
}: Root.Props<Payload>) {
  const [open, setOpen] = useBaseOpenState(openProp, defaultOpen, onOpenChange);

  return (
    <OpenProvider value={{ open }}>
      <ReducedMotionConfig>
        <FollowCursorProvider
          followCursor={followCursor}
          followCursorSpringOptions={followCursorSpringOptions}
        >
          <TooltipPrimitive.Root<Payload>
            {...props}
            open={open}
            onOpenChange={setOpen}
          />
        </FollowCursorProvider>
      </ReducedMotionConfig>
    </OpenProvider>
  );
}

namespace Root {
  export type State = TooltipPrimitive.Root.State;
  export type Props<Payload = unknown> = TooltipPrimitive.Root.Props<Payload> &
    FollowCursorProps;
  export type Actions = TooltipPrimitive.Root.Actions;
  export type ChangeEventReason = TooltipPrimitive.Root.ChangeEventReason;
  export type ChangeEventDetails = TooltipPrimitive.Root.ChangeEventDetails;
}

const Provider = TooltipPrimitive.Provider;

namespace Provider {
  export type State = TooltipPrimitive.Provider.State;
  export type Props = TooltipPrimitive.Provider.Props;
}

function Trigger<Payload = unknown>({
  onMouseMove,
  ...props
}: Trigger.Props<Payload>) {
  return (
    <TooltipPrimitive.Trigger<Payload>
      {...props}
      onMouseMove={useFollowCursorHandler(onMouseMove)}
    />
  );
}

namespace Trigger {
  export type State = TooltipPrimitive.Trigger.State;
  export type Props<Payload = unknown> =
    TooltipPrimitive.Trigger.Props<Payload>;
}

function Portal({ keepMounted = false, ...props }: Portal.Props) {
  const { open } = useOpen();

  return (
    <KeepMountedContext value={keepMounted}>
      <BaseAnchoredPortal
        component={TooltipPrimitive.Portal}
        portalProps={props}
        open={open}
        keepMounted={keepMounted}
      />
    </KeepMountedContext>
  );
}

namespace Portal {
  export type State = TooltipPrimitive.Portal.State;
  export type Props = TooltipPrimitive.Portal.Props;
}

const Positioner = TooltipPrimitive.Positioner;

namespace Positioner {
  export type State = TooltipPrimitive.Positioner.State;
  export type Props = TooltipPrimitive.Positioner.Props;
}

function Popup({ transition, exitTransition, ...props }: Popup.Props) {
  const { open } = useOpen();

  return (
    <BaseAnchoredPopup
      component={TooltipPrimitive.Popup}
      popupProps={props}
      open={open}
      keepMounted={React.use(KeepMountedContext)}
      kind="tooltip"
      transition={transition}
      exitTransition={exitTransition}
    />
  );
}

namespace Popup {
  export type State = TooltipPrimitive.Popup.State;
  export type Props = TooltipPrimitive.Popup.Props & AnchoredAnimationProps;
}

const Arrow = TooltipPrimitive.Arrow;

namespace Arrow {
  export type State = TooltipPrimitive.Arrow.State;
  export type Props = TooltipPrimitive.Arrow.Props;
}

const Viewport = TooltipPrimitive.Viewport;

namespace Viewport {
  export type State = TooltipPrimitive.Viewport.State;
  export type Props = TooltipPrimitive.Viewport.Props;
}

const createHandle: typeof TooltipPrimitive.createHandle =
  TooltipPrimitive.createHandle;
const Handle = TooltipPrimitive.Handle;
type Handle<Payload> = TooltipPrimitive.Handle<Payload>;

export {
  Provider,
  Root,
  Trigger,
  Portal,
  Positioner,
  Popup,
  Arrow,
  Viewport,
  createHandle,
  Handle,
};
