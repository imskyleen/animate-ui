import {
  DialogContent as RekaDialogContent,
  DialogOverlay as RekaDialogOverlay,
  type DialogContentProps as RekaDialogContentProps,
  type DialogOverlayProps as RekaDialogOverlayProps,
} from 'reka-ui';

import { createRekaModal } from '../../../internal/reka-modal';
import type {
  FlipDirection,
  ModalAnimationProps,
} from '../../../internal/modal-motion';

type DialogFlipDirection = FlipDirection;
type DialogOverlayProps = RekaDialogOverlayProps & ModalAnimationProps;
type DialogContentProps = RekaDialogContentProps &
  ModalAnimationProps & { from?: DialogFlipDirection };

const modal = createRekaModal(
  { Overlay: RekaDialogOverlay, Content: RekaDialogContent },
  'Dialog',
);

const DialogOverlay = modal.Overlay as unknown as typeof RekaDialogOverlay;
const DialogContent = modal.Content as unknown as typeof RekaDialogContent;

export {
  DialogRoot,
  DialogTrigger,
  DialogPortal,
  DialogTitle,
  DialogDescription,
  DialogClose,
  type DialogRootProps,
  type DialogRootEmits,
  type DialogContentEmits,
} from 'reka-ui';

export {
  DialogOverlay,
  DialogContent,
  type DialogOverlayProps,
  type DialogContentProps,
  type DialogFlipDirection,
};
