'use client';
/* eslint-disable @typescript-eslint/no-namespace -- each part keeps Base UI's `Part.Props`/`Part.State` type namespace */

import * as React from 'react';
import { Popover as PopoverPrimitive } from '@base-ui/react/popover';

import { getStrictContext } from '../../../utils/strict-context';
import { ReducedMotionConfig } from '../../../utils/motion';
import {
  BaseAnchoredPopup,
  BaseAnchoredPortal,
  useBaseOpenState,
  type AnchoredAnimationProps,
} from './base-anchored';

// Same API as Base UI's Popover. The Popup grows from 0.8 and fades in from
// the trigger on a spring, and shrinks back the same way.

const [OpenProvider, useOpen] = getStrictContext<{ open: boolean }>(
  'Popover.Root',
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
        <PopoverPrimitive.Root<Payload>
          {...props}
          open={open}
          onOpenChange={setOpen}
        />
      </ReducedMotionConfig>
    </OpenProvider>
  );
}

namespace Root {
  export type State = PopoverPrimitive.Root.State;
  export type Props<Payload = unknown> = PopoverPrimitive.Root.Props<Payload>;
  export type Actions = PopoverPrimitive.Root.Actions;
  export type ChangeEventReason = PopoverPrimitive.Root.ChangeEventReason;
  export type ChangeEventDetails = PopoverPrimitive.Root.ChangeEventDetails;
}

const Trigger = PopoverPrimitive.Trigger;

namespace Trigger {
  export type State = PopoverPrimitive.Trigger.State;
  export type Props<Payload = unknown> =
    PopoverPrimitive.Trigger.Props<Payload>;
}

function Portal({ keepMounted = false, ...props }: Portal.Props) {
  const { open } = useOpen();

  return (
    <KeepMountedContext value={keepMounted}>
      <BaseAnchoredPortal
        component={PopoverPrimitive.Portal}
        portalProps={props}
        open={open}
        keepMounted={keepMounted}
      />
    </KeepMountedContext>
  );
}

namespace Portal {
  export type State = PopoverPrimitive.Portal.State;
  export type Props = PopoverPrimitive.Portal.Props;
}

const Positioner = PopoverPrimitive.Positioner;

namespace Positioner {
  export type State = PopoverPrimitive.Positioner.State;
  export type Props = PopoverPrimitive.Positioner.Props;
}

function Popup({ transition, exitTransition, ...props }: Popup.Props) {
  const { open } = useOpen();

  return (
    <BaseAnchoredPopup
      component={PopoverPrimitive.Popup}
      popupProps={props}
      open={open}
      keepMounted={React.use(KeepMountedContext)}
      transition={transition}
      exitTransition={exitTransition}
    />
  );
}

namespace Popup {
  export type State = PopoverPrimitive.Popup.State;
  /** Base UI's props, plus Animate UI's `transition` and `exitTransition`. */
  export type Props = PopoverPrimitive.Popup.Props & AnchoredAnimationProps;
}

const Arrow = PopoverPrimitive.Arrow;

namespace Arrow {
  export type State = PopoverPrimitive.Arrow.State;
  export type Props = PopoverPrimitive.Arrow.Props;
}

const Backdrop = PopoverPrimitive.Backdrop;

namespace Backdrop {
  export type State = PopoverPrimitive.Backdrop.State;
  export type Props = PopoverPrimitive.Backdrop.Props;
}

const Title = PopoverPrimitive.Title;

namespace Title {
  export type State = PopoverPrimitive.Title.State;
  export type Props = PopoverPrimitive.Title.Props;
}

const Description = PopoverPrimitive.Description;

namespace Description {
  export type State = PopoverPrimitive.Description.State;
  export type Props = PopoverPrimitive.Description.Props;
}

const Close = PopoverPrimitive.Close;

namespace Close {
  export type State = PopoverPrimitive.Close.State;
  export type Props = PopoverPrimitive.Close.Props;
}

const Viewport = PopoverPrimitive.Viewport;

namespace Viewport {
  export type State = PopoverPrimitive.Viewport.State;
  export type Props = PopoverPrimitive.Viewport.Props;
}

const createHandle: typeof PopoverPrimitive.createHandle =
  PopoverPrimitive.createHandle;
const Handle = PopoverPrimitive.Handle;
type Handle<Payload> = PopoverPrimitive.Handle<Payload>;

export {
  Root,
  Trigger,
  Portal,
  Positioner,
  Popup,
  Arrow,
  Backdrop,
  Title,
  Description,
  Close,
  Viewport,
  createHandle,
  Handle,
};
