'use client';
/* eslint-disable @typescript-eslint/no-namespace */

import * as React from 'react';
import { PreviewCard as PreviewCardPrimitive } from '@base-ui/react/preview-card';

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
  'PreviewCard.Root',
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
          <PreviewCardPrimitive.Root<Payload>
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
  export type State = PreviewCardPrimitive.Root.State;
  export type Props<Payload = unknown> =
    PreviewCardPrimitive.Root.Props<Payload> & FollowCursorProps;
  export type Actions = PreviewCardPrimitive.Root.Actions;
  export type ChangeEventReason = PreviewCardPrimitive.Root.ChangeEventReason;
  export type ChangeEventDetails = PreviewCardPrimitive.Root.ChangeEventDetails;
}

function Trigger<Payload = unknown>({
  onMouseMove,
  ...props
}: Trigger.Props<Payload>) {
  return (
    <PreviewCardPrimitive.Trigger<Payload>
      {...props}
      onMouseMove={useFollowCursorHandler(onMouseMove)}
    />
  );
}

namespace Trigger {
  export type State = PreviewCardPrimitive.Trigger.State;
  export type Props<Payload = unknown> =
    PreviewCardPrimitive.Trigger.Props<Payload>;
}

function Portal({ keepMounted = false, ...props }: Portal.Props) {
  const { open } = useOpen();

  return (
    <KeepMountedContext value={keepMounted}>
      <BaseAnchoredPortal
        component={PreviewCardPrimitive.Portal}
        portalProps={props}
        open={open}
        keepMounted={keepMounted}
      />
    </KeepMountedContext>
  );
}

namespace Portal {
  export type State = PreviewCardPrimitive.Portal.State;
  export type Props = PreviewCardPrimitive.Portal.Props;
}

const Positioner = PreviewCardPrimitive.Positioner;

namespace Positioner {
  export type State = PreviewCardPrimitive.Positioner.State;
  export type Props = PreviewCardPrimitive.Positioner.Props;
}

function Popup({ transition, exitTransition, ...props }: Popup.Props) {
  const { open } = useOpen();

  return (
    <BaseAnchoredPopup
      component={PreviewCardPrimitive.Popup}
      popupProps={props}
      open={open}
      keepMounted={React.use(KeepMountedContext)}
      transition={transition}
      exitTransition={exitTransition}
    />
  );
}

namespace Popup {
  export type State = PreviewCardPrimitive.Popup.State;
  export type Props = PreviewCardPrimitive.Popup.Props & AnchoredAnimationProps;
}

const Arrow = PreviewCardPrimitive.Arrow;

namespace Arrow {
  export type State = PreviewCardPrimitive.Arrow.State;
  export type Props = PreviewCardPrimitive.Arrow.Props;
}

const Backdrop = PreviewCardPrimitive.Backdrop;

namespace Backdrop {
  export type State = PreviewCardPrimitive.Backdrop.State;
  export type Props = PreviewCardPrimitive.Backdrop.Props;
}

const Viewport = PreviewCardPrimitive.Viewport;

namespace Viewport {
  export type State = PreviewCardPrimitive.Viewport.State;
  export type Props = PreviewCardPrimitive.Viewport.Props;
}

const createHandle: typeof PreviewCardPrimitive.createHandle =
  PreviewCardPrimitive.createHandle;
const Handle = PreviewCardPrimitive.Handle;
type Handle<Payload> = PreviewCardPrimitive.Handle<Payload>;

export {
  Root,
  Trigger,
  Portal,
  Positioner,
  Popup,
  Arrow,
  Backdrop,
  Viewport,
  createHandle,
  Handle,
};
