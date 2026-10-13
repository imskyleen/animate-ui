'use client';

/* eslint-disable @typescript-eslint/no-namespace */

import { AlertDialog as AlertDialogPrimitive } from '@base-ui/react/alert-dialog';

import {
  Backdrop as AnimatedBackdrop,
  Popup as AnimatedPopup,
  Portal as AnimatedPortal,
  createRoot,
} from '../dialog/base-modal';
import type {
  FlipDirection,
  ModalAnimationProps,
} from '../../../internal/modal-motion';

type BackdropAnimationProps = {
  transition?: ModalAnimationProps['transition'];
  exitTransition?: ModalAnimationProps['transition'];
};

type AlertDialogFlipDirection = FlipDirection;

type PopupAnimationProps = {
  from?: AlertDialogFlipDirection;
  transition?: ModalAnimationProps['transition'];
  exitTransition?: ModalAnimationProps['transition'];
};

const AnimatedRoot = createRoot(AlertDialogPrimitive.Root);

function Root<Payload>(props: Root.Props<Payload>) {
  return <AnimatedRoot {...(props as AlertDialogPrimitive.Root.Props)} />;
}
namespace Root {
  export type State = AlertDialogPrimitive.Root.State;
  export type Props<Payload = unknown> =
    AlertDialogPrimitive.Root.Props<Payload>;
  export type Actions = AlertDialogPrimitive.Root.Actions;
  export type ChangeEventReason = AlertDialogPrimitive.Root.ChangeEventReason;
  export type ChangeEventDetails = AlertDialogPrimitive.Root.ChangeEventDetails;
}

function Portal(props: Portal.Props) {
  return <AnimatedPortal {...props} />;
}
namespace Portal {
  export type State = AlertDialogPrimitive.Portal.State;
  export type Props = AlertDialogPrimitive.Portal.Props;
}

function Backdrop(props: Backdrop.Props) {
  return <AnimatedBackdrop {...props} />;
}
namespace Backdrop {
  export type Props = AlertDialogPrimitive.Backdrop.Props &
    BackdropAnimationProps;
  export type State = AlertDialogPrimitive.Backdrop.State;
}

function Popup(props: Popup.Props) {
  return <AnimatedPopup {...props} />;
}
namespace Popup {
  export type Props = AlertDialogPrimitive.Popup.Props & PopupAnimationProps;
  export type State = AlertDialogPrimitive.Popup.State;
}

const Trigger = AlertDialogPrimitive.Trigger;
namespace Trigger {
  export type Props<Payload = unknown> =
    AlertDialogPrimitive.Trigger.Props<Payload>;
  export type State = AlertDialogPrimitive.Trigger.State;
}

const Close = AlertDialogPrimitive.Close;
namespace Close {
  export type Props = AlertDialogPrimitive.Close.Props;
  export type State = AlertDialogPrimitive.Close.State;
}

const Title = AlertDialogPrimitive.Title;
namespace Title {
  export type Props = AlertDialogPrimitive.Title.Props;
  export type State = AlertDialogPrimitive.Title.State;
}

const Description = AlertDialogPrimitive.Description;
namespace Description {
  export type Props = AlertDialogPrimitive.Description.Props;
  export type State = AlertDialogPrimitive.Description.State;
}

const Viewport = AlertDialogPrimitive.Viewport;
namespace Viewport {
  export type Props = AlertDialogPrimitive.Viewport.Props;
  export type State = AlertDialogPrimitive.Viewport.State;
}

const Handle = AlertDialogPrimitive.Handle;
type Handle<Payload> = AlertDialogPrimitive.Handle<Payload>;
const createHandle = AlertDialogPrimitive.createHandle;

export {
  Root,
  Trigger,
  Portal,
  Backdrop,
  Popup,
  Viewport,
  Title,
  Description,
  Close,
  Handle,
  createHandle,
  type AlertDialogFlipDirection,
};
