import {
  AlertDialogContent as RekaAlertDialogContent,
  AlertDialogOverlay as RekaAlertDialogOverlay,
  type AlertDialogContentProps as RekaAlertDialogContentProps,
  type AlertDialogOverlayProps as RekaAlertDialogOverlayProps,
} from 'reka-ui';

import { createRekaModal } from '../../../internal/reka-modal';
import type {
  FlipDirection,
  ModalAnimationProps,
} from '../../../internal/modal-motion';

type AlertDialogFlipDirection = FlipDirection;
type AlertDialogOverlayProps = RekaAlertDialogOverlayProps &
  ModalAnimationProps;
type AlertDialogContentProps = RekaAlertDialogContentProps &
  ModalAnimationProps & { from?: AlertDialogFlipDirection };

const modal = createRekaModal(
  { Overlay: RekaAlertDialogOverlay, Content: RekaAlertDialogContent },
  'AlertDialog',
);

const AlertDialogOverlay =
  modal.Overlay as unknown as typeof RekaAlertDialogOverlay;
const AlertDialogContent =
  modal.Content as unknown as typeof RekaAlertDialogContent;

export {
  AlertDialogRoot,
  AlertDialogTrigger,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  type AlertDialogProps,
  type AlertDialogEmits,
  type AlertDialogContentEmits,
} from 'reka-ui';

export {
  AlertDialogOverlay,
  AlertDialogContent,
  type AlertDialogOverlayProps,
  type AlertDialogContentProps,
  type AlertDialogFlipDirection,
};
