'use client';

/* eslint-disable @typescript-eslint/no-namespace -- each part merges a
   namespace of types with its component, like Base UI's own parts
   (`Dialog.Popup.Props`, `Dialog.Root.ChangeEventDetails`…). */

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';

import {
  Backdrop as AnimatedBackdrop,
  Popup as AnimatedPopup,
  Portal as AnimatedPortal,
  createRoot,
} from './base-modal';
import type { ModalAnimationProps } from '../../../internal/modal-motion';

// Same API as Base UI's Dialog. The Backdrop fades, the Popup scales from 0.95
// around its center, or slides from its edge when it has `data-side`
// (shadcn/ui's Sheet). See base-modal.tsx for the wiring.

/** Animate UI's additions to `Dialog.Backdrop`. */
type BackdropAnimationProps = {
  /** Fade in. Defaults to `transition.modal` (600ms). */
  transition?: ModalAnimationProps['transition'];
  /** Fade out. Defaults to `transition.modalExit` (400ms). */
  exitTransition?: ModalAnimationProps['transition'];
};

/** Animate UI's additions to `Dialog.Popup`. */
type PopupAnimationProps = {
  /**
   * Transition of the opening. Defaults to `transition.modal` (600ms), or
   * `transition.drawer` when the popup has `data-side`.
   */
  transition?: ModalAnimationProps['transition'];
  /**
   * Transition of the closing. Defaults to `transition.modalExit` (400ms), or
   * `transition.drawerExit` when the popup has `data-side`.
   */
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
};
