'use client';

/* eslint-disable @typescript-eslint/no-namespace */

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';

import {
  Backdrop as AnimatedBackdrop,
  Popup as AnimatedPopup,
  Portal as AnimatedPortal,
  createRoot,
} from './base-modal';
import type {
  FlipDirection,
  ModalAnimationProps,
} from '../../../internal/modal-motion';

type BackdropAnimationProps = {
  transition?: ModalAnimationProps['transition'];
  exitTransition?: ModalAnimationProps['transition'];
};

type DialogFlipDirection = FlipDirection;

type PopupAnimationProps = {
  from?: DialogFlipDirection;
  transition?: ModalAnimationProps['transition'];
  exitTransition?: ModalAnimationProps['transition'];
};

const AnimatedRoot = createRoot(DialogPrimitive.Root);

function Root<Payload>(props: Root.Props<Payload>) {
  return <AnimatedRoot {...(props as DialogPrimitive.Root.Props)} />;
}
namespace Root {
  export type State = DialogPrimitive.Root.State;
  export type Props<Payload = unknown> = DialogPrimitive.Root.Props<Payload>;
  export type Actions = DialogPrimitive.Root.Actions;
  export type ChangeEventReason = DialogPrimitive.Root.ChangeEventReason;
  export type ChangeEventDetails = DialogPrimitive.Root.ChangeEventDetails;
}

function Portal(props: Portal.Props) {
  return <AnimatedPortal {...props} />;
}
namespace Portal {
  export type State = DialogPrimitive.Portal.State;
  export type Props = DialogPrimitive.Portal.Props;
}

function Backdrop(props: Backdrop.Props) {
  return <AnimatedBackdrop {...props} />;
}
namespace Backdrop {
  export type Props = DialogPrimitive.Backdrop.Props & BackdropAnimationProps;
  export type State = DialogPrimitive.Backdrop.State;
}

function Popup(props: Popup.Props) {
  return <AnimatedPopup {...props} />;
}
namespace Popup {
  export type Props = DialogPrimitive.Popup.Props & PopupAnimationProps;
  export type State = DialogPrimitive.Popup.State;
}

const Trigger = DialogPrimitive.Trigger;
namespace Trigger {
  export type Props<Payload = unknown> = DialogPrimitive.Trigger.Props<Payload>;
  export type State = DialogPrimitive.Trigger.State;
}

const Close = DialogPrimitive.Close;
namespace Close {
  export type Props = DialogPrimitive.Close.Props;
  export type State = DialogPrimitive.Close.State;
}

const Title = DialogPrimitive.Title;
namespace Title {
  export type Props = DialogPrimitive.Title.Props;
  export type State = DialogPrimitive.Title.State;
}

const Description = DialogPrimitive.Description;
namespace Description {
  export type Props = DialogPrimitive.Description.Props;
  export type State = DialogPrimitive.Description.State;
}

const Viewport = DialogPrimitive.Viewport;
namespace Viewport {
  export type Props = DialogPrimitive.Viewport.Props;
  export type State = DialogPrimitive.Viewport.State;
}

const Handle = DialogPrimitive.Handle;
type Handle<Payload> = DialogPrimitive.Handle<Payload>;
const createHandle = DialogPrimitive.createHandle;

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
  type DialogFlipDirection,
};
