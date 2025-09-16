import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogPopup,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogPortal,
  AlertDialogBackdrop,
  AlertDialogClose,
  type AlertDialogFlipDirection,
} from '@/registry/primitives/base/alert-dialog';

type BaseAlertDialogDemoProps = {
  from: AlertDialogFlipDirection;
};

export const BaseAlertDialogDemo = ({ from }: BaseAlertDialogDemoProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger className="bg-primary text-primary-foreground px-4 py-2 text-sm">
        Open Dialog
      </AlertDialogTrigger>

      <AlertDialogPortal>
        <AlertDialogBackdrop className="fixed inset-0 z-50 bg-black/80" />
        <AlertDialogPopup
          from={from}
          className="sm:max-w-md fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] z-50 border bg-background p-6"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg">
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-4 flex justify-end gap-2">
            <AlertDialogClose className="bg-accent text-accent-foreground px-4 py-2 text-sm">
              Cancel
            </AlertDialogClose>
            <AlertDialogClose className="bg-primary text-primary-foreground px-4 py-2 text-sm">
              Continue
            </AlertDialogClose>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialogPortal>
    </AlertDialog>
  );
};
