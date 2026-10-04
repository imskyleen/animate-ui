'use client';
/* eslint-disable @typescript-eslint/no-namespace -- each part keeps Base UI's `Part.Props`/`Part.State` type namespace */

import * as React from 'react';
import { PreviewCard as PreviewCardPrimitive } from '@base-ui/react/preview-card';

import { getStrictContext } from '../../../utils/strict-context';
import { ReducedMotionConfig } from '../../../utils/motion';
import {
  BaseAnchoredPopup,
  BaseAnchoredPortal,
  useBaseOpenState,
  type AnchoredAnimationProps,
} from '../popover/base-anchored';

// Same API as Base UI's PreviewCard. The Popup grows from 0.8 and fades in
// from the trigger on a spring, and shrinks back the same way. Base UI ignores touch pointers, so hover
// never sticks on touch screens.

const [OpenProvider, useOpen] = getStrictContext<{ open: boolean }>(
  'PreviewCard.Root',
);
// The user's `keepMounted` on the closest Portal.
const KeepMountedContext = React.createContext(false);

function Root<Payload = unknown>({
  open: openProp,
  defaultOpen,
  onOpenChange,
  ...props
}: Root.Props<Payload>) {
  const [open, setOpen] = useBaseOpenState(openProp, defaultOpen, onOpenChange);

  return (
    <OpenProvider value={{ open }}>
      <ReducedMotionConfig>
        <PreviewCardPrimitive.Root<Payload>
          {...props}
          open={open}
          onOpenChange={setOpen}
        />
      </ReducedMotionConfig>
    </OpenProvider>
  );
}

namespace Root {
  export type State = PreviewCardPrimitive.Root.State;
  export type Props<Payload = unknown> =
    PreviewCardPrimitive.Root.Props<Payload>;
  export type Actions = PreviewCardPrimitive.Root.Actions;
  export type ChangeEventReason = PreviewCardPrimitive.Root.ChangeEventReason;
  export type ChangeEventDetails = PreviewCardPrimitive.Root.ChangeEventDetails;
}

const Trigger = PreviewCardPrimitive.Trigger;

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
  /** Base UI's props, plus Animate UI's `transition` and `exitTransition`. */
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
