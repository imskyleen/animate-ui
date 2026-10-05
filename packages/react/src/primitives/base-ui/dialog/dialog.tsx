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
import type {
  FlipDirection,
  ModalAnimationProps,
} from '../../../internal/modal-motion';

// Same API as Base UI's Dialog, animated like Animate UI v1: the Backdrop
// fades and un-blurs, the Popup tips forward from `perspective(500px)
// rotateX(-20deg) scale(0.8)` on a spring, or slides and fades in from its edge
// when it has `data-side` (shadcn/ui's Sheet). See base-modal.tsx for the
// wiring and ../../../internal/modal-motion.ts for the motion.

/** Animate UI's additions to `Dialog.Backdrop`. */
type BackdropAnimationProps = {
  /**
   * Fade (and blur) in.
   * @default { duration: 0.2, ease: [0.23, 1, 0.32, 1] }
   */
  transition?: ModalAnimationProps['transition'];
  /** Fade (and blur) out. Defaults to `transition`. */
  exitTransition?: ModalAnimationProps['transition'];
};

/** The edge `Dialog.Popup` tips from (Animate UI v1's `from`). */
type DialogFlipDirection = FlipDirection;

/** Animate UI's additions to `Dialog.Popup`. */
type PopupAnimationProps = {
  /**
   * The edge the popup tips from as it comes in (and goes back to), as in
   * Animate UI v1. Ignored by a sheet (`data-side`), which slides from its
   * side.
   * @default 'top'
   */
  from?: DialogFlipDirection;
  /**
   * Transition of the opening, a sheet's slide from its `data-side` edge
   * included.
   * @default { type: 'spring', stiffness: 150, damping: 25 } (damping 22 for a
   * sheet, with `data-side`)
   */
  transition?: ModalAnimationProps['transition'];
  /** Transition of the closing. Defaults to `transition`. */
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
